import requests
import json
import re

with open('bgm-quiz/script.js', 'r') as f:
    content = f.read()

urls = re.findall(r'coverImg:\s*"(https://images\.unsplash\.com/[^"]+)"', content)

for u in urls:
    try:
        r = requests.head(u, allow_redirects=True)
        print(f"{r.status_code} {u}")
    except Exception as e:
        print(f"Error {u}: {e}")
