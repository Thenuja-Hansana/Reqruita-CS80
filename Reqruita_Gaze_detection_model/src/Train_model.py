# Imports 

import os
import cv2
import numpy as np


from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D,MaxPooling2D,Flatten,Dense
from tensorflow.keras.utils import to_categorical
from sklearn.model_selection import train_test_split

#Define dataset path
dataset_path = 'Dataset/Data'

participants = ["p00", "p01", "p02"]
# Only use first 3 days
days = ["day01", "day02", "day03"]


#Function to convert gaze to class label
def gaze_to_class(gaze_x, gaze_y):
    if gaze_x < -0.1:
     return 0  
    elif gaze_x > 0.1:
     return 1  
    else:
     return 2  

#Load dataset
images=[]
labels=[]

for person in participants:
    person_path=os.path.join(dataset_path, person)
    annotation_file = os.path.join(person_path, f"{person}.txt")
     # Read annotation file
    with open(annotation_file, "r") as f:
        lines = f.readlines()

    for line in lines:
        parts = line.strip().split()

        # First value = image path
        img_relative_path = parts[0]

        # Extract gaze values
        gaze_x = float(parts[1])
        gaze_y = float(parts[2])

        # Convert to classification label
        label = gaze_to_class(gaze_x, gaze_y)

        # Only take images from first 3 days
        if not any(day in img_relative_path for day in days):
            continue

        # Full image path
        img_path = os.path.join(person_path, img_relative_path)

        # Load image
        img = cv2.imread(img_path)

        if img is None:
            continue  # skip if image not found

        # Resize image to fixed size
        img = cv2.resize(img, (64, 64))

        # Normalize pixel values (0-255 → 0-1)
        img = img / 255.0

        # Store data
        images.append(img)
        labels.append(label)

# Convert to numpy arrays
x = np.array(images)   
y = np.array(labels)
print("Total images loaded:", len(x))

#  prepare labels
# Convert labels into one-hot encoding
y = to_categorical(y, num_classes=3)

# Split into training and testing sets
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)


# Build CNN model
model = Sequential()

# Add convolutional and pooling layers
model.add(Conv2D(32, (3, 3), activation='relu', input_shape=(64, 64, 3)))
model.add(MaxPooling2D((2, 2)))
model.add(Conv2D(64, (3, 3), activation='relu'))
model.add(MaxPooling2D((2, 2)))

#Flatten layer
model.add(Flatten())

# Fully connected layers
model.add(Dense(128, activation='relu'))
model.add(Dense(3, activation='softmax'))  # 3 classes

# Compile model
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# Train model
model.fit(x_train, y_train, epochs=10, batch_size=32, validation_data=(x_test, y_test))

#Save model
model.save('gaze_detection_model.h5')
print("Model saved as gaze_detection_model.h5")



