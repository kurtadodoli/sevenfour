import os
import pickle
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import google.generativeai as genai

app = Flask(__name__)
load_dotenv()


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "models/gemini-2.0-flash"


try:
    genai.configure(api_key=GEMINI_API_KEY)
    print("✅ Gemini API initialized.")
except Exception as e:
    print(f"❌ Gemini initialization failed: {e}")


model = None
responses = {}

try:
    with open("chatbot_model.pkl", "rb") as f:
        model_data = pickle.load(f)
        model = model_data.get("model")
        responses = model_data.get("responses", {})
    print("✅ Chatbot model loaded successfully.")
except Exception as e:
    print(f"❌ Error loading model: {e}")


def ask_gemini(user_input):
    """Ask Gemini for help if dataset doesn’t know the answer."""
    try:
        clean_text = user_input.strip().lower()
        clean_text = "".join(c for c in clean_text if c.isalnum() or c.isspace())

        system_prompt = (
            "You are an intelligent e-commerce customer support assistant named Chatbot. "
            "Only respond to questions related to orders, refunds, products, accounts, "
            "shipping, delivery, store policy, or customer support issues. "
            "If a user asks something unrelated (like jokes or trivia), "
            "politely redirect them to store-related help. "
            "Always be concise, friendly, and professional."
        )

        gmodel = genai.GenerativeModel(GEMINI_MODEL)
        response = gmodel.generate_content(f"{system_prompt}\n\nUser: {clean_text}\nChatbot:")

        if hasattr(response, "text") and response.text:
            return response.text.strip()
        else:
            return "I'm here to help with store-related questions like orders or refunds!"
    except Exception as e:
        print(f"Gemini Error: {e}")
        return "⚠️ Sorry, I’m having trouble connecting to the AI service."


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/get_response", methods=["POST"])
def get_response():
    try:
        user_input = request.json.get("message", "").strip()
        if not user_input:
            return jsonify({"response": "Please enter a message."}), 400

        user_input_clean = user_input.lower()

       
        intent = model.predict([user_input_clean])[0]

        try:
            confidence = model.predict_proba([user_input_clean]).max()
        except Exception:
            confidence = 1.0

     
        if intent in responses and confidence > 0.5:
            bot_reply = responses[intent]
            source = "dataset"
        else:
            bot_reply = ask_gemini(user_input)
            source = "ai"

        print(f"\n🗣️ User Input: {user_input}")
        print(f"Predicted Intent: {intent}")
        print(f"Confidence: {confidence:.2f}")
        print(f"Response Source: {source}")
        print(f"Bot Reply: {bot_reply}\n")

        return jsonify({"response": bot_reply})
    except Exception as e:
        print(f"❌ Error processing request: {e}")
        return jsonify({"response": "Sorry, something went wrong while processing your message."}), 500


@app.route("/upload_file", methods=["POST"])
def upload_file():
    try:
        file = request.files["file"]
        if not file:
            return jsonify({"response": "No file uploaded."}), 400

        allowed_extensions = {"png", "jpg", "jpeg", "mp4", "mov"}
        ext = file.filename.rsplit(".", 1)[-1].lower()

        if ext not in allowed_extensions:
            return jsonify({
                "response": "Unsupported file type. Please upload a product-related image or video."
            }), 400

        file.seek(0, 2)
        size_mb = file.tell() / (1024 * 1024)
        file.seek(0)

        if size_mb > 15:
            return jsonify({
                "response": "File too large! Please upload a file smaller than 15MB."
            }), 400

        os.makedirs("uploads", exist_ok=True)
        save_path = os.path.join("uploads", file.filename)
        file.save(save_path)

        auto_reply = (
            "📎 Thanks for uploading your file! "
            "I'll take a moment to review it to better understand your issue. "
            "Please hold on while I process the details."
        )

        if ext in {"png", "jpg", "jpeg"}:
            follow_up = (
                "🖼️ I've reviewed the image you uploaded. "
                "Could you please provide your order number or the email linked to your account "
                "so I can proceed with your request?"
            )
        elif ext in {"mp4", "mov"}:
            follow_up = (
                "🎥 I've reviewed your video and forwarded it to our verification team. "
                "Could you please share your order ID and a short description of the issue?"
            )
        else:
            follow_up = (
                "⚠️ It seems your uploaded file might not relate to a product issue. "
                "Please upload a clear photo or video of the affected item or receipt so we can help you better."
            )

        return jsonify({
            "response": auto_reply,
            "follow_up": follow_up,
            "delay": 20000  
        })

    except Exception as e:
        print(f"❌ File upload error: {e}")
        return jsonify({
            "response": "Sorry, there was an issue processing your file."
        }), 500



if __name__ == "__main__":
    print("🚀 Starting Customer Support Chatbot...")
    app.run(debug=True)
