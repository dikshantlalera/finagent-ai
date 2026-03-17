import google.generativeai as genai

api_key = "AIzaSyByx4Vtt_AK_vXC5a5Wb1uZhG5Lpg7KeeQ"
genai.configure(api_key=api_key)

try:
    print("Testing gemini-1.5-flash...")
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content('hi')
    print("SUCCESS")
    print(response.text)
except Exception as e:
    print("ERROR:", e)
