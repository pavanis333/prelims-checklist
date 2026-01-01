
import requests
from bs4 import BeautifulSoup
import re

URL = "https://iasscore.in/upsc-syllabus/history/indian-culture-prelims"
response = requests.get(URL, headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(response.text, 'html.parser')

target = soup.find(string=lambda t: t and "Nabakalebar" in t)
if target:
    # Go up to the LI containing this
    li = target.find_parent('li')
    if li:
        print("Item LI:", li.get_text(strip=True)[:50])
        # Go to parent UL
        ul = li.find_parent('ul')
        if ul:
            # Go to parent LI (The Topic)
            topic_li = ul.find_parent('li')
            if topic_li:
                # Get text of topic_li excluding the UL
                txt = ""
                for child in topic_li.children:
                     if child.name == 'ul': continue
                     txt += child.get_text() if child.name else child
                print("Topic LI text:", txt.strip())
                
                # Check previous sibling of Topic LI
                prev = topic_li.find_previous_sibling()
                if prev:
                    print("Previous Topic LI text:", prev.get_text(strip=True)[:50])
            else:
                print("No Topic LI (Parent of UL is not LI?)")
                print("Parent of UL is:", ul.parent.name)

