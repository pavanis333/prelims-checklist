import requests
from bs4 import BeautifulSoup
import json

def scrape_general_science_syllabus():
    url = "https://iasscore.in/upsc-syllabus/science-technology/general-science-prelims"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    result = {"General Science": []}
    
    # Find all brick divs which contain the syllabus sections
    bricks = soup.find_all('div', class_='brick')
    
    for brick in bricks:
        # Find the title (h3) - this should be "Biology", "Physics", "Chemistry"
        title_elem = brick.find('h3', class_='title')
        if not title_elem:
            continue
            
        main_category = title_elem.get_text(strip=True)
        print(f"\nProcessing category: {main_category}")
        
        # Find the sections div
        sections_div = brick.find('div', class_='sections')
        if not sections_div:
            continue
        
        # Find all strong tags which represent topics
        strong_tags = sections_div.find_all('strong')
        
        for strong in strong_tags:
            topic_name = strong.get_text(strip=True)
            
            # Find the next ul sibling after this strong tag
            next_ul = strong.find_next_sibling('ul')
            
            subtopics = []
            if next_ul:
                # Get all span elements within this ul (including nested uls)
                spans = next_ul.find_all('span')
                for span in spans:
                    subtopic_text = span.get_text(strip=True)
                    if subtopic_text and subtopic_text not in subtopics:
                        subtopics.append(subtopic_text)
            
            if topic_name:  # Only add if we have a topic name
                result["General Science"].append({
                    "topic": topic_name,
                    "subtopics": subtopics
                })
                print(f"  - {topic_name}: {len(subtopics)} subtopics")
    
    return result

if __name__ == "__main__":
    data = scrape_general_science_syllabus()
    
    print("\n" + "=" * 80)
    print("EXTRACTED SYLLABUS:")
    print("=" * 80)
    print(json.dumps(data, indent=2, ensure_ascii=False))
    
    # Save to file
    with open('general_science_syllabus.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print("\n" + "=" * 80)
    print(f"Total topics extracted: {len(data['General Science'])}")
    print("Saved to: general_science_syllabus.json")
