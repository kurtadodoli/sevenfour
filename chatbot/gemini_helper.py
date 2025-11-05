import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def ask_gemini(prompt):
    """
    Sends the user's message to Google Gemini and returns the AI's reply.
    """
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")

        response = model.generate_content(
            f"You are a friendly and knowledgeable AI assistant for customer support. "
            f"Answer naturally, helpfully, and clearly.\n\nUser: {prompt}"
        )

        return response.text.strip()
    except Exception as e:
        print(f"Gemini Error: {e}")
        return "Sorry, I'm having trouble connecting to the AI right now."
