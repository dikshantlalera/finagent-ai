import google.generativeai as genai
from google.api_core import retry

api_key = "AIzaSyByx4Vtt_AK_vXC5a5Wb1uZhG5Lpg7KeeQ"
genai.configure(api_key=api_key)

print("Testing 1.5-flash")
try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    # Use a dummy retry to fail fast
    response = model.generate_content('hi!', request_options={"retry": retry.Retry(initial=0.1, maximum=0.2, multiplier=1.0, deadline=1.0)})
    print("SUCCESS 1.5-flash:", response.text)
except Exception as e:
    print("ERROR 1.5-flash:", e)

print("\nTesting 2.0-flash")
try:
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content('hi!', request_options={"retry": retry.Retry(initial=0.1, maximum=0.2, multiplier=1.0, deadline=1.0)})
    print("SUCCESS 2.0-flash:", response.text)
except Exception as e:
    print("ERROR 2.0-flash:", e)
