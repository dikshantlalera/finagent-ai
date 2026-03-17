import urllib.request
import json
import urllib.error

url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyByx4Vtt_AK_vXC5a5Wb1uZhG5Lpg7KeeQ"
data = json.dumps({
    "contents": [{"parts": [{"text": "Explain how AI works"}]}]
}).encode('utf-8')

req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
try:
    with urllib.request.urlopen(req) as response:
        print("SUCCESS")
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"ERROR {e.code}")
    print(e.read().decode('utf-8'))
