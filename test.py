import requests

API_KEY = "AIzaSyADmYUC7HyQhDOtRthOjkq_xujbzVM-dHs"  # Replace with your actual key

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"

payload = {
    "contents": [
        {
            "parts": [
                {"text": "Say hello in one sentence."}
            ]
        }
    ]
}

response = requests.post(url, json=payload)

if response.status_code == 200:
    data = response.json()
    text = data["candidates"][0]["content"]["parts"][0]["text"]
    print("✅ API Key is working!")
    print("Response:", text)
else:
    print("❌ API Key failed!")
    print("Status:", response.status_code)
    print("Error:", response.json())