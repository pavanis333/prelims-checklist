
import requests
from bs4 import BeautifulSoup

URL = "https://iasscore.in/upsc-syllabus/science-technology/general-science-prelims"
response = requests.get(URL, headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(response.text, 'html.parser')

print("All div.syllabus_details titles:")
cards = soup.find_all('div', class_='syllabus_details')
for card in cards:
    title = card.find(['h3', 'h4'], class_='title')
    if title:
        print(f"- {title.get_text(strip=True)}")
    else:
        # Check if there's a header before the sections
        print("- NO TITLE IN CARD")
        # Check if it's strictly a card?
        
print("\nChecking for Physics and Chemistry keywords...")
for h in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5']):
    if "Physics" in h.get_text() or "Chemistry" in h.get_text():
        print(f"Found {h.name}: {h.get_text(strip=True)}")
        # check parent/sibling for sections
