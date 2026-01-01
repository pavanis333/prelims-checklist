import requests
from bs4 import BeautifulSoup
import json

def scrape_full_gs():
    url = "https://iasscore.in/upsc-syllabus/science-technology/general-science-prelims"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Save the whole text for analysis
    # with open('page_content.txt', 'w') as f:
    #     f.write(soup.get_text())
    
    sections = {}
    
    # IAS Score often uses div with class 'syllabus-list' or similar
    # Let's find all headers and see what follows them
    for header in soup.find_all(['h3', 'h4']):
        header_text = header.get_text(strip=True)
        if any(keyword in header_text for keyword in ["Biology", "Physics", "Chemistry", "General Science"]):
            sections[header_text] = []
            
            # Find the next div or ul
            curr = header.find_next_sibling()
            while curr and curr.name not in ['h3', 'h4']:
                # If it's a list
                if curr.name == 'ul':
                    items = [li.get_text(strip=True) for li in curr.find_all('li')]
                    sections[header_text].extend(items)
                
                # If it's a div containing boxes
                boxes = curr.find_all('div', class_='syllabus-box') or curr.find_all('div', class_='box')
                if not boxes and 'box' in curr.get('class', []):
                    boxes = [curr]
                
                for box in boxes:
                    topic_el = box.find(['h4', 'h5', 'strong', 'b'])
                    if topic_el:
                        topic_name = topic_el.get_text(strip=True)
                        subtopics_ul = box.find('ul')
                        if subtopics_ul:
                            subtopics = [li.get_text(strip=True) for li in subtopics_ul.find_all('li')]
                            sections[header_text].append({
                                "topic": topic_name,
                                "subtopics": subtopics
                            })
                
                curr = curr.find_next_sibling()

    return sections

if __name__ == "__main__":
    data = scrape_full_gs()
    print(json.dumps(data, indent=2))
