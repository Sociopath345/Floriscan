"""EfficientNet-B0 loaders for species (Phase A) and optional bloom stage (Phase B)."""

from pathlib import Path

import cv2
import numpy as np
import torch
import timm

from flowers import (
    BLOOM_STAGES,
    SPECIES,
    STAGE_LABELS,
    STAGE_SUPPORTED,
    care_tips_for,
    display_name,
)

IMAGE_SIZE = 384
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)

BACKEND_DIR = Path(__file__).resolve().parent
DEFAULT_MODEL_DIR = BACKEND_DIR / "models"
SPECIES_WEIGHTS = "floriscan_species.pth"
STAGE_WEIGHTS = "floriscan_stage.pth"


class FloriscanDetector:
    def __init__(self, model_dir=None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model_dir = Path(model_dir) if model_dir else DEFAULT_MODEL_DIR
        self.model_dir.mkdir(parents=True, exist_ok=True)
        self.species_model = None
        self.stage_model = None
        self.species_ready = False
        self.stage_ready = False
        self._load_species()
        self._load_stage()

    def _build(self, num_classes):
        model = timm.create_model("efficientnet_b0", pretrained=False, num_classes=num_classes)
        model.to(self.device)
        model.eval()
        return model

    def _try_load(self, model, path):
        state = torch.load(path, map_location=self.device)
        if isinstance(state, dict) and "state_dict" in state:
            state = state["state_dict"]
        model.load_state_dict(state)
        model.eval()

    def _load_species(self):
        self.species_model = self._build(len(SPECIES))
        path = self.model_dir / SPECIES_WEIGHTS
        if path.is_file():
            self._try_load(self.species_model, path)
            self.species_ready = True
            print(f"Loaded species weights from {path}")
        else:
            print(f"No {SPECIES_WEIGHTS} yet — API runs with an untrained head (placeholder scores).")

    def _load_stage(self):
        self.stage_model = self._build(len(BLOOM_STAGES))
        path = self.model_dir / STAGE_WEIGHTS
        if path.is_file():
            self._try_load(self.stage_model, path)
            self.stage_ready = True
            print(f"Loaded stage weights from {path}")
        else:
            print(f"No {STAGE_WEIGHTS} yet — stage cascade stays off.")

    def preprocess(self, image_path):
        img = cv2.imread(str(image_path))
        if img is None:
            raise ValueError("Could not read the uploaded image")
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (IMAGE_SIZE, IMAGE_SIZE))
        img = img.astype(np.float32) / 255.0
        img = (img - IMAGENET_MEAN) / IMAGENET_STD
        tensor = torch.from_numpy(img).permute(2, 0, 1).unsqueeze(0).to(self.device)
        return tensor

    def _softmax_probs(self, model, tensor, labels):
        with torch.no_grad():
            logits = model(tensor)
            probs = torch.softmax(logits, dim=1)[0].cpu().numpy()
        return {label: float(probs[i]) for i, label in enumerate(labels)}

    def analyze(self, image_path):
        tensor = self.preprocess(image_path)
        species_probs = self._softmax_probs(self.species_model, tensor, SPECIES)
        ranked = sorted(species_probs.items(), key=lambda item: item[1], reverse=True)
        top_id, top_prob = ranked[0]

        stage = None
        stage_supported = top_id in STAGE_SUPPORTED
        if self.stage_ready and stage_supported:
            stage_probs = self._softmax_probs(self.stage_model, tensor, BLOOM_STAGES)
            stage_ranked = sorted(stage_probs.items(), key=lambda item: item[1], reverse=True)
            stage_id, stage_prob = stage_ranked[0]
            stage = {
                "id": stage_id,
                "label": STAGE_LABELS[stage_id],
                "confidence": stage_prob,
                "probabilities": stage_probs,
            }

        return {
            "species": {
                "id": top_id,
                "label": display_name(top_id),
                "confidence": top_prob,
                "probabilities": species_probs,
            },
            "stage": stage,
            "stage_supported": stage_supported,
            "stage_model_ready": self.stage_ready,
            "species_model_ready": self.species_ready,
            "diagnosis": f"{display_name(top_id)} — {top_prob * 100:.1f}% confidence",
            "care_tips": care_tips_for(top_id, stage["id"] if stage else None),
            "placeholder": not self.species_ready,
        }

    def health(self):
        return {
            "status": "healthy",
            "device": str(self.device),
            "species_model_ready": self.species_ready,
            "stage_model_ready": self.stage_ready,
            "species_classes": SPECIES,
            "stage_classes": BLOOM_STAGES,
            "stage_supported": STAGE_SUPPORTED,
            "image_size": IMAGE_SIZE,
        }


detector = FloriscanDetector()
