import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY", "").strip()
print(f"Using API Key: {api_key[:10]}...{api_key[-5:] if len(api_key) > 5 else ''}")

try:
    client = genai.Client(api_key=api_key)
    print("Listing available models:")
    for model in client.models.list():
        print(f" - {model.name}")
except Exception as e:
    print(f"Error listing models: {e}")
