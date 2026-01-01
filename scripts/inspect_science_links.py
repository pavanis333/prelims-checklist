
import requests
from bs4 import BeautifulSoup

URL = "https://iasscore.in/upsc-syllabus/science-technology"
response = requests.get(URL, headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(response.text, 'html.parser')

print("All links under science-technology root:")
for a in soup.find_all('a', href=True):
    print(f"Text: '{a.get_text(strip=True)}' | Href: '{a['href']}'")
