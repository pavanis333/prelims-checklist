
import requests
from bs4 import BeautifulSoup

# Let's try to guess the URLs or find them in the sitemap if possible, 
# but first let's just inspect the Science & Tech root thoroughly.
URL = "https://iasscore.in/upsc-syllabus/science-technology"
response = requests.get(URL, headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(response.text, 'html.parser')

print("All links containing 'Prelims' in Science & Tech:")
for a in soup.find_all('a', href=True):
    href = a['href']
    text = a.get_text(strip=True)
    if "Prelims" in text:
        print(f"- {text} -> {href}")

# Also check for names like Physics or Chemistry
print("\nChecking for Physics/Chemistry links:")
for a in soup.find_all('a', href=True):
    text = a.get_text(strip=True)
    if "Physics" in text or "Chemistry" in text:
        print(f"- {text} -> {a['href']}")
