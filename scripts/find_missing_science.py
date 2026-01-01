
import requests
from bs4 import BeautifulSoup

URL = "https://iasscore.in/upsc-syllabus/science-technology"
response = requests.get(URL, headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(response.text, 'html.parser')

print("All links on Science & Tech root:")
for a in soup.find_all('a', href=True):
    text = a.get_text(strip=True)
    if "Prelims" in text or "Physics" in text or "Chemistry" in text:
        print(f"- {text} -> {a['href']}")
