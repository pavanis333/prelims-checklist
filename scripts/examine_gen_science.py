
import requests
from bs4 import BeautifulSoup

URL = "https://iasscore.in/upsc-syllabus/science-technology/general-science-prelims"
response = requests.get(URL, headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(response.text, 'html.parser')

print("Searching for specific section headers...")
# Sites sometimes use different classes or just raw headers 
for h in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
    text = h.get_text(strip=True)
    print(f"- {h.name}: {text}")

# Check for all div classes used in the main content area
main_content = soup.find('div', class_='syllabus_page_content') or soup.find('body')
if main_content:
    print("\nClasses in main content:")
    seen_classes = set()
    for d in main_content.find_all('div', class_=True):
        seen_classes.update(d['class'])
    print(seen_classes)

# Look for 'Physics' or 'Chemistry' matching any tag
print("\nLiteral matches for Physics/Chemistry:")
matches = soup.find_all(string=lambda t: t and ("Physics" in t or "Chemistry" in t))
for m in matches:
    p = m.find_parent()
    print(f"Match in <{p.name}>: {m.strip()[:100]}")
