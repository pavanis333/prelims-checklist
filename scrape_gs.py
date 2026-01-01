import requests
from bs4 import BeautifulSoup
import json

def scrape_general_science():
    url = "https://iasscore.in/upsc-syllabus/science-technology/general-science-prelims"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    data = {}
    
    # Based on the structure seen in other IAS Score syllabus pages
    # They usually have headers and then an accordion or list
    
    main_section = soup.find('div', class_='syllabus-details') or soup.find('div', class_='entry-content')
    if not main_section:
        # Try finding by looking for Biology, Physics, Chemistry headers
        headers = soup.find_all(['h2', 'h3'])
        current_section = None
        for h in headers:
            text = h.get_text(strip=True)
            if any(s in text for s in ["Biology", "Physics", "Chemistry"]):
                current_section = text
                data[current_section] = []
                
                # Look for the next siblings until the next header
                sibling = h.find_next_sibling()
                while sibling and sibling.name not in ['h2', 'h3']:
                    if sibling.name == 'ul':
                        items = [li.get_text(strip=True) for li in sibling.find_all('li')]
                        data[current_section].extend(items)
                    elif sibling.name == 'p':
                        # Sometimes subtopics are in bold p tags
                        txt = sibling.get_text(strip=True)
                        if txt:
                            data[current_section].append(txt)
                    
                    # Also check for nested lists or boxes
                    boxes = sibling.find_all('div', class_='box') # common pattern
                    for box in boxes:
                        topic_h = box.find(['h4', 'h5', 'strong'])
                        if topic_h:
                            topic_name = topic_h.get_text(strip=True)
                            sub_list = box.find('ul')
                            subtopics = [li.get_text(strip=True) for li in sub_list.find_all('li')] if sub_list else []
                            data[current_section].append({"topic": topic_name, "subtopics": subtopics})
                            
                    sibling = sibling.find_next_sibling()
    
    return data

if __name__ == "__main__":
    results = scrape_general_science()
    print(json.dumps(results, indent=2))
