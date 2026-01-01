
import requests
from bs4 import BeautifulSoup

URL = "https://iasscore.in/upsc-syllabus/history/indian-culture-prelims"
response = requests.get(URL, headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(response.text, 'html.parser')

# Find "Numismatics"
target = soup.find(string=lambda t: t and "Numismatics" in t)
if target:
    parent = target.find_parent('li')
    if parent:
        print("Numismatics List Item:")
        print(parent.prettify())
        
        # Check siblings
        next_sibling = parent.find_next_sibling()
        if next_sibling:
            print("\nNext Sibling:")
            print(next_sibling.prettify())
else:
    print("Could not find 'Numismatics'")

# Find "Coinage" directly to see where it lives
coinage = soup.find(string=lambda t: t and "Coinage" in t)
if coinage:
    print("\nCoinage found at:")
    # print up to 300 chars of parent structure
    p = coinage.find_parent()
    print(p.prettify()[:500] if p else "No parent")
    
    # Check if it is inside Numismatics LI or a sibling LI
    
