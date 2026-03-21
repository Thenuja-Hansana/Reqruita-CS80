import numpy as np
import cv2
import base64
from tensorflow.keras.models import load_model

# Load the trained model
model = load_model("models/gaze_detection_model.h5")

#class labels
class_labels = { "LEFT","RIGHT","CENTER"}

#preprocess image function
def preprocess_image(image):
   
    image = cv2.resize(image, (64, 64))     
    image = image / 255.0                   
    image = np.expand_dims(image, axis=0)   

    return image

#BASE64 string to image
def base64_to_image(base64_string):
    
    # Remove metadata if exists (data:image/jpeg;base64,...)
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]

    img_bytes = base64.b64decode(base64_string)
    np_arr = np.frombuffer(img_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    return image

#predict gaze direction
def predict_gaze(base64_image):
    

    # Step 1: Decode image
    image = base64_to_image(base64_image)

    if image is None:
        return {"error": "Invalid image"}

    # Step 2: Preprocess
    processed = preprocess_image(image)

    # Step 3: Predict
    prediction = model.predict(processed)

    # Step 4: Get result
    class_index = int(np.argmax(prediction))
    confidence = float(np.max(prediction))

    label = classes[class_index]

    return {
        "label": label,
        "confidence": confidence
    }