import pandas as pd
import os

intent_map = {
    "orders": "order_status",
    "order": "order_status",
    "refunds": "refund_request",
    "refund": "refund_request",
    "products": "product_info",
    "product": "product_info",
    "accounts": "account_help",
    "account": "account_help",
    "general": "general_chat",
    "ecommerce_chatbot_dataset": "ecommerce_support",
    "ecommerce": "ecommerce_support"
}

datasets_dir = "datasets"
combined = []

for file in os.listdir(datasets_dir):
    if file.endswith(".csv"):
        path = os.path.join(datasets_dir, file)
        df = pd.read_csv(path)
        if {"query", "response"}.issubset(df.columns):
            base = os.path.splitext(file)[0]
            intent = intent_map.get(base, "general_chat")
            df["intent"] = intent
            combined.append(df)

data = pd.concat(combined, ignore_index=True)
data = data.drop_duplicates(subset=["query"]).sample(frac=1, random_state=42).reset_index(drop=True)
data.to_csv("clean_chatbot_dataset.csv", index=False)

print("✅ Merged and saved as clean_chatbot_dataset.csv with", len(data), "rows.")
