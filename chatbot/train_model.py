import pandas as pd
import os
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.metrics import accuracy_score


DATASETS_FOLDER = "datasets"

all_data = []

print("\n📂 Loading datasets...")
for file in os.listdir(DATASETS_FOLDER):
    if file.endswith(".csv"):
        path = os.path.join(DATASETS_FOLDER, file)
        try:
            df = pd.read_csv(path)
            df.columns = [c.strip().lower() for c in df.columns]

            
            if "query" in df.columns and "response" in df.columns:
                df = df[["query", "response"]].dropna()
                all_data.append(df)
                print(f"✅ Loaded {file} with {len(df)} rows.")
            else:
                print(f"⚠️ Skipped {file} (missing 'query' or 'response').")
        except Exception as e:
            print(f"⚠️ Error reading {file}: {e}")


if not all_data:
    print("❌ No valid datasets found.")
    exit()

data = pd.concat(all_data, ignore_index=True)
print(f"\n📊 Total combined rows: {len(data)}")


data["intent"] = data["query"].str.lower().str.split().str[0]


X_train, X_test, y_train, y_test = train_test_split(
    data["query"], data["intent"], test_size=0.2, random_state=42
)


print("\n🧠 Training chatbot model...")
pipeline = make_pipeline(TfidfVectorizer(), LogisticRegression(max_iter=200))
pipeline.fit(X_train, y_train)


y_pred = pipeline.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"✅ Model training complete. Accuracy: {accuracy:.2f}")

responses = dict(zip(data["intent"], data["response"]))

save_data = {
    "model": pipeline,
    "vectorizer": pipeline.named_steps["tfidfvectorizer"],
    "responses": responses,
}

with open("chatbot_model.pkl", "wb") as f:
    pickle.dump(save_data, f)

print("💾 Model and responses saved successfully.")
