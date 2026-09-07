# Floriscan

Floriscan is a small web app that looks at **one photo of a flower** and tries to answer two questions:

1. **What flower is this?** (species)
2. **How open is the bloom?** (bud, partly open, or fully open)

You do not need to know computer science to use it: open the page, drop in a clear photo of a single flower, and read the result. Care tips are a short gardening reminder, not a professional diagnosis. Confirm the plant before you follow any advice.

It currently knows **ten garden flowers**, and it can switch the whole page between **English** and **Burmese**.

---

## If you just want to try it

Someone who already has Floriscan running on a computer can open:

[http://localhost:5000/](http://localhost:5000/)

Then:

1. Drop **one clear photo of a single flower** (not a whole bouquet or a distant tree).
2. Click **Analyze flower**.
3. Read the named species, how sure the app is, the blooming stage when available, and a few care tips.

**What it cannot do**

- It is not a botanist and not a plant-ID encyclopedia. If the flower is not one of the ten below, the answer will still be one of those ten — it cannot say “I don’t know this plant.”
- Hibiscus and cherry blossom are named only. They do not get a blooming-stage guess yet.
- True lily means *Lilium* (the classic lily). Daylily, calla, and water lily are different plants.
- Cherry blossom here means ornamental cherry (*Prunus serrulata*), not plum blossom.

---

## The ten flowers

| Everyday name | In the code | Scientific hint |
| --- | --- | --- |
| Rose | `rose` | *Rosa* |
| Tulip | `tulip` | *Tulipa* |
| Lily | `lily` | *Lilium* only |
| Sunflower | `sunflower` | *Helianthus annuus* |
| Carnation | `carnation` | *Dianthus caryophyllus* |
| Peony | `peony` | *Paeonia lactiflora* |
| Iris | `iris` | bearded *Iris germanica* |
| Daffodil | `daffodil` | *Narcissus* |
| Hibiscus | `hibiscus` | *Hibiscus rosa-sinensis* |
| Cherry blossom | `cherry_blossom` | *Prunus serrulata* |

Blooming stages, when used: **bud** → **partially open** → **fully open**.

---

## How it works (plain language, then technical)

Think of two specialists, not one giant “do everything” model.

- **Species model (Phase A):** “This looks like a tulip.”
- **Stage model (Phase B):** “And this tulip is still a bud.”

The stage model only runs after a species is chosen, and only for eight of the ten flowers (everything except hibiscus and cherry blossom).

**For people in IT:** Floriscan is a student computer-vision app. Both models are **EfficientNet-B0** (`timm`), trained in **Google Colab**, then loaded by a **Flask** API. The page is static HTML/CSS/JS. Images are resized to **384×384**, scaled to 0–1, and normalized with ImageNet mean `(0.485, 0.456, 0.406)` and std `(0.229, 0.224, 0.225)`. Training and serving **must use the same preprocess**.

```
browser  →  Flask (frontend + API)  →  species EfficientNet-B0
                                      →  optional stage EfficientNet-B0
                                      →  JSON + care-tip lookup
```

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Whether weights loaded, device (`cpu` / `cuda`), class lists |
| `POST` | `/api/analyze` | Multipart form field `image` (max 16 MB). Returns species scores, optional stage, and care tips. The uploaded file is deleted after inference. |

Without `backend/models/floriscan_species.pth`, Flask still starts, but scores are **placeholder** (an untrained head). That is not a real identification.

---

## Run the app

**You need:** Python 3.10+, and at least `floriscan_species.pth` in `backend/models/` for real answers.

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

On macOS or Linux, use `source .venv/bin/activate` and the same `pip` / `python app.py` steps.

Then open [http://localhost:5000/](http://localhost:5000/).

Copy trained files here (they are **not** in git — they are large binary weights, not source code):

```
backend/models/floriscan_species.pth   # required
backend/models/floriscan_stage.pth     # optional
```

---

## Train the models (developers)

Do **not** train “10 flowers × 3 stages” as 30 classes. Keep one 10-class species model. Train a **shared 3-class** stage model, then cascade it in Flask.

### Phase A — species (Colab GPU)

1. Open `notebooks/colab_species_train.ipynb` in Google Colab (GPU).
2. Mount Drive. Images and exports go under `MyDrive/Floriscan/`.
3. The notebook merges public sets (TensorFlow `flower_photos`, Oxford 102 subsets, optional Kaggle 5-flower types for lily and tulip only). Add extra peony and cherry blossom photos if those folders are thin.
4. Train EfficientNet-B0, `num_classes=10`, input **384**.
5. Download `floriscan_species.pth` into `backend/models/`.

If rose / tulip / sunflower look fine but the other classes do not, **do not** just train more epochs on the same folders. Use `notebooks/colab_species_boost.ipynb` instead: it adds more photos for the weak classes, retrains with a weighted sampler, then you replace `floriscan_species.pth`.

Optional Kaggle downloads need **your** `kaggle.json` in Colab. Do not commit that file.

### Phase B — blooming stage

[BDFlower](https://data.mendeley.com/datasets/m8g2wynwyr/2) (Mendeley `m8g2wynwyr/2`) labels Early / Mid / Full on garden flowers. Those species are not Floriscan’s ten. The notebooks **pool all original photos** into `bud` / `partially_open` / `fully_open` and skip the paper’s 5× augmentation copies.

1. Prefer Colab GPU: `notebooks/colab_stage_train.ipynb`. It trains on Colab local disk, transfers the backbone from the species weights, and writes `floriscan_stage.pth`.
2. Optional: add a few of *your* rose/tulip photos into Drive `Floriscan/data/stages/extra/bud|partially_open|fully_open/`.
3. Copy `floriscan_stage.pth` to `backend/models/` and restart Flask.

Local fallback (same 384 / ImageNet preprocess):

```powershell
python scripts/train_stage.py
```

Put `bdflower.zip` under `data/stages/` if the automatic download fails.

---

## What’s in this repository

```
Floriscan/
  backend/                 Flask API, model loader, care-tip tables
  frontend/                Page, styles, English/Burmese text
  notebooks/               Colab training (species, boost, stage)
  scripts/train_stage.py   Local stage trainer
  README.md
```

**Not in git (on purpose)**

| Left out | Why |
| --- | --- |
| `*.pth` weight files | Large trained binaries; produce them with the notebooks |
| Training image folders / `data/` | Datasets stay on Drive or your machine |
| `.venv/`, caches | Environment, not source |
| `kaggle.json`, `.env` | Credentials — never commit these |
| Photos you upload in the app | Deleted after each analysis |

---

## Credits and limits

- Species training uses public flower photo collections (TensorFlow Flowers, Oxford 102, and optional extra sets named in the notebooks).
- Stage training uses [BDFlower](https://data.mendeley.com/datasets/m8g2wynwyr/2).
- Care tips are short, rule-based notes for this student project.

Floriscan is an **educational computer-vision** project. It is not medical, agricultural, or taxonomic authority.
