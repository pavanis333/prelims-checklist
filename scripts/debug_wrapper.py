
import requests
from bs4 import BeautifulSoup

URL = "https://iasscore.in/upsc-syllabus/history/indian-culture-prelims"
response = requests.get(URL, headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(response.text, 'html.parser')

target = soup.find(string=lambda t: t and "Nabakalebar" in t)
if target:
    # Find the syllabus_details wrapper
    wrapper = target.find_parent('div', class_='syllabus_details')
    if wrapper:
        print("Wrapper found.")
        title = wrapper.find(['h3', 'h4'], class_='title')
        if title:
            print("Title found:", title.get_text(strip=True))
        else:
            print("NO Title found in this wrapper!")
            # Check previous sibling for a title?
            prev = wrapper.find_previous_sibling()
            if prev and 'syllabus_details' in prev.get('class', []):
                 prev_title = prev.find(['h3', 'h4'], class_='title')
                 print("Previous wrapper title:", prev_title.get_text())
    else:
        print("Not inside syllabus_details")
