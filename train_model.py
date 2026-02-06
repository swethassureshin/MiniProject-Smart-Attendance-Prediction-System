import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import pickle

# Load dataset
data = pd.read_csv("student_data.csv")

X = data[["attendance", "internal", "assignment"]]
y = data["result"]

# ML pipeline: Scaling + Logistic Regression
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("model", LogisticRegression(
        class_weight="balanced",
        max_iter=1000
    ))
])

# Train model
pipeline.fit(X, y)

# Save trained model
with open("model.pkl", "wb") as file:
    pickle.dump(pipeline, file)

print("Model trained correctly with scaling & balancing ✅")
