import google.generativeai as genai

print("First config with invalid key")
genai.configure(api_key="invalid_key_12345678901234567890123456789")
try:
    model1 = genai.GenerativeModel("gemini-2.0-flash")
    model1.generate_content("Hello")
except Exception as e:
    print("Error 1:", e)

print("\nSecond config with user key")
genai.configure(api_key="AIzaSyBJvIXTqiNRDWrbf4GQuOdkI-Ueu5AmnPI")
try:
    model2 = genai.GenerativeModel("gemini-2.0-flash")
    model2.generate_content("Hello")
    print("Success 2")
except Exception as e:
    print("Error 2:", e)
