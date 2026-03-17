import sys
import google.generativeai as genai
from google.generativeai.types import generation_types

api_key = "AIzaSyBJvIXTqiNRDWrbf4GQuOdkI-Ueu5AmnPI"

genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-2.0-flash")

try:
    response = model.generate_content("Hello")
    print("SUCCESS")
    print(response.text)
except Exception as e:
    print("ERROR:")
    print(e)
