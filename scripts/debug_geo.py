
import requests
from bs4 import BeautifulSoup

URL = "https://iasscore.in/upsc-syllabus/geography/geography-prelims"
response = requests.get(URL, headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(response.text, 'html.parser')

# Check structure again
print("Searching for typical containers...")
details = soup.find_all('div', class_='syllabus_details')
print(f"Found {len(details)} 'syllabus_details' divs.")

sections = soup.find_all('div', class_='sections')
print(f"Found {len(sections)} 'sections' divs.")

# Try to find a known item like "Geomorphology"
geo = soup.find(string=lambda t: t and "Geomorphology" in t)
if geo:
    print("\n'Geomorphology' found in:")
    print(geo.find_parent().prettify()[:500])
    
    # Trace parents
    p = geo.find_parent()
    count = 0
    while p and count < 5:
        print(f"Parent {count}: {p.name} {p.get('class')}")
        p = p.find_parent()
        count += 1
else:
    print("'Geomorphology' not found")
