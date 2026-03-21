from flask import Flask, request, jsonify
from flask_cors import CORS

# import your gaze detector from src
from src.gaze_detector import predict_gaze

app = Flask(__name__)
CORS(app)

@app.route("/predict-gaze", methods=["POST"])
def predict():
    data = request.json

    if "image" not in data:
        return jsonify({"error": "No image provided"}), 400

    result = predict_gaze(data["image"])

    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)