
import requests
from bs4 import BeautifulSoup

URL = "https://iasscore.in/upsc-syllabus/history/indian-culture-prelims"
response = requests.get(URL, headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(response.text, 'html.parser')

target = soup.find(string=lambda t: t and "Nabakalebar" in t)
if target:
    print("Found 'Nabakalebar' at:")
    p = target.find_parent()
    # Print hierarchy up to .sections
    while p and p.get('class') != ['sections']:
        print(f" -> {p.name} {p.get('class')}")
        p = p.find_parent()
    if p: print(f" -> {p.name} {p.get('class')}")
else:
    print("Not found")
