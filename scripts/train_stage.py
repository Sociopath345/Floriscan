"""Train Floriscan's 3-class blooming-stage EfficientNet-B0 on D: (never C:).

Pools BDFlower Early/Mid/Full originals into bud / partially_open / fully_open,
transfers the backbone from floriscan_species.pth, and writes floriscan_stage.pth.

Example (Vision Shield venv is fine if Torch already lives on D:):

  D:\\Fundus Project Datasets\\Vision_shield\\backend\\.venv\\Scripts\\python.exe `
    D:\\Projects\\Floriscan\\scripts\\train_stage.py

Put the Mendeley zip at D:\\Projects\\Floriscan\\data\\stages\\bdflower.zip if the
direct download fails: https://data.mendeley.com/datasets/m8g2wynwyr/2
"""

from __future__ import annotations

import argparse
import os
import random
import shutil
import sys
import urllib.request
import zipfile
from pathlib import Path

import cv2
import numpy as np
import timm
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset, WeightedRandomSampler

ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
sys.path.insert(0, str(BACKEND))

from flowers import BLOOM_STAGES, SPECIES  # noqa: E402

if os.name == "nt":
    _tmp = Path("D:/Temp")
    _tmp.mkdir(parents=True, exist_ok=True)
    os.environ.setdefault("TEMP", str(_tmp))
    os.environ.setdefault("TMP", str(_tmp))

SEED = 42
IMAGE_SIZE = 384
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
MENDELEY_ZIP_URL = (
    "https://prod-dcd-datasets-cache-zipfiles.s3.eu-west-1.amazonaws.com/m8g2wynwyr-2.zip"
)

EARLY = {"early", "early stage", "earlystage", "early_stage"}
MID = {"mid", "mid stage", "midstage", "mid_stage"}
FULL = {"full", "full stage", "fullstage", "full_stage", "full growth", "fullgrowth"}


def _norm_part(name: str) -> str:
    return name.lower().replace("-", " ").replace("_", " ").strip()


def is_image(path: Path) -> bool:
    return path.is_file() and path.suffix.lower() in IMAGE_EXTS and path.stat().st_size > 2048


def is_augmented(path: Path) -> bool:
    parts = [_norm_part(p) for p in path.parts]
    if any(p in {"augmentation", "augmented", "aug"} for p in parts):
        return True
    stem = path.stem.lower()
    return "_aug" in stem or "aug1" in stem or "aug2" in stem or "aug3" in stem


def map_stage(path: Path) -> str | None:
    if is_augmented(path):
        return None
    for part in path.parts:
        key = _norm_part(part)
        if key in EARLY:
            return "bud"
        if key in MID:
            return "partially_open"
        if key in FULL:
            return "fully_open"
    return None


def download_zip(dest: Path) -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.is_file() and dest.stat().st_size > 1_000_000:
        print("Using existing zip", dest)
        return dest
    print("Downloading BDFlower zip to", dest)
    try:
        urllib.request.urlretrieve(MENDELEY_ZIP_URL, dest)
    except Exception as exc:
        raise SystemExit(
            f"Could not download BDFlower ({exc}).\n"
            "Download the zip in a browser from\n"
            "  https://data.mendeley.com/datasets/m8g2wynwyr/2\n"
            f"and save it as {dest}"
        ) from exc
    return dest


def extract_zip(zip_path: Path, out_dir: Path) -> Path:
    marker = out_dir / ".extracted"
    if marker.exists() and any(out_dir.rglob("*.jpg")):
        print("Already extracted", out_dir)
        return out_dir
    out_dir.mkdir(parents=True, exist_ok=True)
    print("Extracting", zip_path, "->", out_dir)
    with zipfile.ZipFile(zip_path) as zf:
        zf.extractall(out_dir)
    marker.write_text("ok", encoding="utf-8")
    return out_dir


def copy_unique(src: Path, dest_dir: Path, prefix: str) -> bool:
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / f"{prefix}_{src.name}"
    if dest.exists():
        return False
    shutil.copy2(src, dest)
    return True


def pool_bdflower(extract_dir: Path, merged: Path) -> dict[str, int]:
    for name in BLOOM_STAGES:
        (merged / name).mkdir(parents=True, exist_ok=True)
    added = {name: 0 for name in BLOOM_STAGES}
    skipped_aug = 0
    skipped_other = 0
    for path in extract_dir.rglob("*"):
        if not is_image(path):
            continue
        if is_augmented(path):
            skipped_aug += 1
            continue
        stage = map_stage(path)
        if stage is None:
            skipped_other += 1
            continue
        added[stage] += int(copy_unique(path, merged / stage, "bdf"))
    print("BDFlower originals pooled", added)
    print("skipped augmented", skipped_aug, "unmapped", skipped_other)
    return added


def add_extra_folder(extra_root: Path, merged: Path) -> None:
    if not extra_root.is_dir():
        return
    for name in BLOOM_STAGES:
        folder = extra_root / name
        if not folder.is_dir():
            continue
        n = 0
        for path in folder.rglob("*"):
            if is_image(path):
                n += int(copy_unique(path, merged / name, "extra"))
        print("extra", name, "+", n)


def list_class_files(merged: Path, name: str) -> list[Path]:
    folder = merged / name
    if not folder.is_dir():
        return []
    return [p for p in folder.iterdir() if is_image(p)]


class StageFolder(Dataset):
    def __init__(self, items, train=False):
        self.items = items
        self.train = train

    def __len__(self):
        return len(self.items)

    def __getitem__(self, index):
        path, label = self.items[index]
        img = cv2.imread(str(path))
        if img is None:
            img = np.zeros((IMAGE_SIZE, IMAGE_SIZE, 3), dtype=np.uint8)
        else:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (IMAGE_SIZE, IMAGE_SIZE))
        if self.train:
            if random.random() < 0.5:
                img = cv2.flip(img, 1)
            if random.random() < 0.35:
                angle = random.uniform(-12, 12)
                matrix = cv2.getRotationMatrix2D((IMAGE_SIZE / 2, IMAGE_SIZE / 2), angle, 1.0)
                img = cv2.warpAffine(img, matrix, (IMAGE_SIZE, IMAGE_SIZE), borderMode=cv2.BORDER_REFLECT)
        img = img.astype(np.float32) / 255.0
        img = (img - MEAN) / STD
        return torch.from_numpy(img).permute(2, 0, 1), label


def split_items(merged: Path):
    train_items, val_items, test_items = [], [], []
    print("per-class 70/15/15 split:")
    for class_id, name in enumerate(BLOOM_STAGES):
        files = list_class_files(merged, name)
        files.sort()
        random.shuffle(files)
        n = len(files)
        n_train = int(0.70 * n)
        n_val = int(0.15 * n)
        train_files = files[:n_train]
        val_files = files[n_train : n_train + n_val]
        test_files = files[n_train + n_val :]
        train_items.extend((path, class_id) for path in train_files)
        val_items.extend((path, class_id) for path in val_files)
        test_items.extend((path, class_id) for path in test_files)
        print(f"  {name:16s} n={n:4d}  train {len(train_files):4d}  val {len(val_files):4d}  test {len(test_files):4d}")
    if any(len(list_class_files(merged, name)) < 80 for name in BLOOM_STAGES):
        raise SystemExit("Need at least ~80 originals per stage before training.")
    random.shuffle(train_items)
    return train_items, val_items, test_items


def load_stage_model(species_path: Path) -> torch.nn.Module:
    model = timm.create_model("efficientnet_b0", pretrained=not species_path.is_file(), num_classes=len(BLOOM_STAGES))
    if not species_path.is_file():
        print("No species weights at", species_path, "— ImageNet backbone")
        return model
    try:
        donor = timm.create_model("efficientnet_b0", pretrained=False, num_classes=len(SPECIES))
        state = torch.load(species_path, map_location="cpu")
        if isinstance(state, dict) and "state_dict" in state:
            state = state["state_dict"]
        donor.load_state_dict(state)
    except Exception as exc:
        print("Could not load species weights, using ImageNet backbone:", exc)
        return timm.create_model("efficientnet_b0", pretrained=True, num_classes=len(BLOOM_STAGES))
    dst = model.state_dict()
    copied = 0
    for key, value in donor.state_dict().items():
        if key.startswith("classifier"):
            continue
        if key in dst and dst[key].shape == value.shape:
            dst[key] = value
            copied += 1
    model.load_state_dict(dst)
    print(f"Transferred {copied} backbone tensors from {species_path}")
    return model


def run_epoch(model, loader, criterion, optimizer, device, train: bool):
    model.train(train)
    total_loss = 0.0
    correct = 0
    total = 0
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        if train:
            optimizer.zero_grad()
        with torch.set_grad_enabled(train):
            logits = model(images)
            loss = criterion(logits, labels)
            if train:
                loss.backward()
                optimizer.step()
        total_loss += loss.item() * labels.size(0)
        correct += (logits.argmax(1) == labels).sum().item()
        total += labels.size(0)
    return total_loss / max(total, 1), correct / max(total, 1)


def parse_args():
    parser = argparse.ArgumentParser(description="Train Floriscan blooming-stage model on D:")
    parser.add_argument("--zip", type=Path, default=ROOT / "data" / "stages" / "bdflower.zip")
    parser.add_argument("--extract-dir", type=Path, default=ROOT / "data" / "stages" / "_extracted")
    parser.add_argument("--merged", type=Path, default=ROOT / "data" / "stages" / "merged")
    parser.add_argument("--extra", type=Path, default=ROOT / "data" / "stages" / "extra")
    parser.add_argument("--species-weights", type=Path, default=BACKEND / "models" / "floriscan_species.pth")
    parser.add_argument("--out", type=Path, default=BACKEND / "models" / "floriscan_stage.pth")
    parser.add_argument("--skip-download", action="store_true")
    return parser.parse_args()


def main():
    args = parse_args()
    if not str(args.merged).upper().startswith("D:") and os.name == "nt":
        raise SystemExit("Keep stage data on D:, not C:.")

    random.seed(SEED)
    np.random.seed(SEED)
    torch.manual_seed(SEED)

    if not args.skip_download:
        download_zip(args.zip)
    if not args.zip.is_file():
        raise SystemExit(f"Missing zip {args.zip}")
    extract_zip(args.zip, args.extract_dir)
    pool_bdflower(args.extract_dir, args.merged)
    add_extra_folder(args.extra, args.merged)

    train_items, val_items, test_items = split_items(args.merged)
    counts = np.zeros(len(BLOOM_STAGES), dtype=np.float64)
    for _, label in train_items:
        counts[label] += 1
    counts = np.maximum(counts, 1.0)
    sample_w = [1.0 / counts[label] for _, label in train_items]
    sampler = WeightedRandomSampler(sample_w, num_samples=len(train_items), replacement=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    workers = 0 if os.name == "nt" else 2
    batch = 8 if device.type == "cpu" else 16
    print("device", device, "batch", batch)

    train_loader = DataLoader(StageFolder(train_items, train=True), batch_size=batch, sampler=sampler, num_workers=workers)
    val_loader = DataLoader(StageFolder(val_items, train=False), batch_size=batch, shuffle=False, num_workers=workers)
    test_loader = DataLoader(StageFolder(test_items, train=False), batch_size=batch, shuffle=False, num_workers=workers)

    model = load_stage_model(args.species_weights).to(device)
    class_w = torch.tensor((counts.max() / counts).astype(np.float32), device=device)
    criterion = nn.CrossEntropyLoss(weight=class_w)

    for name, param in model.named_parameters():
        param.requires_grad = name.startswith("classifier")
    optimizer = torch.optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-3)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    best_val = 0.0
    head_epochs = 8 if device.type == "cpu" else 6
    ft_epochs = 4 if device.type == "cpu" else 8

    def maybe_save(val_acc):
        nonlocal best_val
        if val_acc >= best_val:
            best_val = val_acc
            torch.save(model.state_dict(), args.out)

    for epoch in range(head_epochs):
        _, train_acc = run_epoch(model, train_loader, criterion, optimizer, device, True)
        _, val_acc = run_epoch(model, val_loader, criterion, optimizer, device, False)
        print(f"head {epoch+1:02d}  train {train_acc:.3f}  val {val_acc:.3f}")
        maybe_save(val_acc)

    for param in model.parameters():
        param.requires_grad = True
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4)
    for epoch in range(ft_epochs):
        _, train_acc = run_epoch(model, train_loader, criterion, optimizer, device, True)
        _, val_acc = run_epoch(model, val_loader, criterion, optimizer, device, False)
        print(f"ft   {epoch+1:02d}  train {train_acc:.3f}  val {val_acc:.3f}")
        maybe_save(val_acc)

    print("best val", best_val, "saved", args.out)

    model.load_state_dict(torch.load(args.out, map_location=device))
    model.eval()
    y_true, y_pred = [], []
    with torch.no_grad():
        for images, labels in test_loader:
            y_true.extend(labels.tolist())
            y_pred.extend(model(images.to(device)).argmax(1).cpu().tolist())

    n = len(BLOOM_STAGES)
    matrix = np.zeros((n, n), dtype=int)
    for t, p in zip(y_true, y_pred):
        matrix[t, p] += 1
    print("confusion (rows=true, cols=pred)")
    print("           ", " ".join(f"{name[:8]:>8s}" for name in BLOOM_STAGES))
    for i, name in enumerate(BLOOM_STAGES):
        print(f"{name:11s}", " ".join(f"{matrix[i, j]:8d}" for j in range(n)))
    acc = sum(t == p for t, p in zip(y_true, y_pred)) / max(len(y_true), 1)
    print(f"test acc {acc:.3f}  n={len(y_true)}")
    for i, name in enumerate(BLOOM_STAGES):
        support = matrix[i].sum()
        pred_col = matrix[:, i].sum()
        rec = matrix[i, i] / support if support else 0.0
        prec = matrix[i, i] / pred_col if pred_col else 0.0
        print(f"  {name:16s} precision {prec:.3f}  recall {rec:.3f}  support {int(support)}")
    print("Weights written to", args.out)
    print("Restart Flask so /api/health shows stage_model_ready: true")


if __name__ == "__main__":
    main()
