
import requests
from bs4 import BeautifulSoup

URL = "https://iasscore.in/upsc-syllabus/science-technology/general-science-prelims"
response = requests.get(URL, headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(response.text, 'html.parser')

print("Links found on General Science Prelims page:")
for a in soup.find_all('a', href=True):
    text = a.get_text(strip=True)
    if any(k in text for k in ["Physics", "Chemistry", "Biology"]):
        print(f"Text: '{text}' | Href: '{a['href']}'")
