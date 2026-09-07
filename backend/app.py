from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

from model_loader import detector

BACKEND_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BACKEND_DIR.parent / "frontend"
UPLOAD_DIR = BACKEND_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = Flask(__name__, static_folder=str(FRONTEND_DIR), static_url_path="")
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024


@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify(detector.health()), 200


@app.route("/api/analyze", methods=["POST"])
def analyze():
    try:
        if "image" not in request.files:
            return jsonify({"error": "Please upload a flower image"}), 400

        image_file = request.files["image"]
        if image_file.filename == "":
            return jsonify({"error": "Please select an image"}), 400

        filename = secure_filename(image_file.filename) or "upload.jpg"
        saved = UPLOAD_DIR / filename
        image_file.save(saved)

        try:
            results = detector.analyze(saved)
        finally:
            if saved.exists():
                saved.unlink()

        results["image"] = image_file.filename
        return jsonify(results), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


if __name__ == "__main__":
    print(f"Serving Floriscan from {FRONTEND_DIR}")
    app.run(debug=True, port=5000)
