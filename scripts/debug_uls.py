
import requests
from bs4 import BeautifulSoup

URL = "https://iasscore.in/upsc-syllabus/history/indian-culture-prelims"
response = requests.get(URL, headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(response.text, 'html.parser')

# Find Miscellaneous wrapper
titles = soup.find_all(['h3', 'h4'], class_='title')
misc_title = None
for t in titles:
    if "Miscellaneous" in t.get_text():
        misc_title = t
        break

if misc_title:
    wrapper = misc_title.find_parent('div', class_='syllabus_details')
    sections = wrapper.find('div', class_='sections')
    uls = sections.find_all('ul', recursive=False)
    print(f"Number of top-level ULs in Miscellaneous: {len(uls)}")
    
    for i, ul in enumerate(uls):
        print(f"UL {i} content snippet:")
        print(ul.get_text(strip=True)[:100])
