
import requests
from bs4 import BeautifulSoup
import json
import re

URL_MAP = {
    "Indian Culture": "https://iasscore.in/upsc-syllabus/history/indian-culture-prelims",
    "Geography": "https://iasscore.in/upsc-syllabus/geography/geography-prelims",
    "Economy": "https://iasscore.in/upsc-syllabus/economy/economy-prelims",
    "Environment": "https://iasscore.in/upsc-syllabus/environment/environment-prelims",
    "Science And Technology": "https://iasscore.in/upsc-syllabus/science-technology/science-and-technology-prelims",
    "General Science": "https://iasscore.in/upsc-syllabus/science-technology/general-science-prelims"
}

def clean_text(text):
    if not text: return ""
    return re.sub(r'\s+', ' ', text).strip()

def normalize(text):
    return re.sub(r'[^a-zA-Z0-9]', '', text).lower()

def get_html_hierarchy(url):
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        soup = BeautifulSoup(response.text, 'html.parser')
        
        hierarchy = []
        
        # Structure:
        # div.syllabus_details (Wrapper)
        #   h3.title (Category)
        #   div.sections
        #     ul
        #       li (Topic)
        #       li (UL Wrapper) -> ul -> li (Subtopic)
        # OR
        #       li (Topic + UL) -> ul -> li (Subtopic)
        
        wrappers = soup.find_all('div', class_='syllabus_details')
        if not wrappers:
            print(f"Skipping {url} (no wrappers)")
            return []

        for wrapper in wrappers:
            category_title = wrapper.find(['h3', 'h4'], class_='title')
            cat_name = clean_text(category_title.get_text()) if category_title else "Unknown"
            
            sections = wrapper.find('div', class_='sections')
            if not sections: continue
            
            top_uls = sections.find_all('ul', recursive=False)
            if not top_uls and sections.find('ul'): top_uls = [sections.find('ul')]
            
            for top_ul in top_uls:
                current_topic = None
                
                for li in top_ul.find_all('li', recursive=False):
                    items = []
                    # Get text
                    li_text = ""
                    for child in li.children:
                        if child.name == 'ul': continue
                        clean_part = clean_text(child.get_text() if child.name else child)
                        if clean_part: li_text += clean_part + " "
                    
                    li_text = li_text.strip()
                    
                    child_ul = li.find('ul')
                    
                    if li_text:
                        current_topic = li_text
                        # This node itself is a topic. 
                        # Does it have subtopics?
                        if child_ul:
                            for sub_li in child_ul.find_all('li'):
                                sub_text = clean_text(sub_li.get_text())
                                if sub_text: hierarchy.append((cat_name, current_topic, sub_text))
                        else:
                            # It's a topic with no *immediate* nested subtopics found in THIS li
                            # But maybe the NEXT sibling LI contains the UL for it
                            # We record the topic itself as valid, maybe with "No Subtopic" placeholder or just exist check
                            hierarchy.append((cat_name, current_topic, "__TOPIC_ONLY__"))
                    
                    else:
                        # Empty LI, probably wrapper for UL belonging to prev topic
                        if current_topic and child_ul:
                             for sub_li in child_ul.find_all('li'):
                                sub_text = clean_text(sub_li.get_text())
                                if sub_text: hierarchy.append((cat_name, current_topic, sub_text))
                                
        return hierarchy
    except Exception as e:
        print(f"Error {url}: {e}")
        return []

def get_json_hierarchy(data):
    hierarchy = []
    for subject, categories in data.items():
        if subject == "UPSC Prelims Syllabus": continue # distinct key
        
        for cat, topics in categories.items():
            for t_obj in topics:
                topic = t_obj['topic']
                subs = t_obj.get('subtopics', [])
                
                if subs:
                    for s in subs:
                        hierarchy.append((cat, topic, s))
                else:
                    hierarchy.append((cat, topic, "__TOPIC_ONLY__"))
    return hierarchy

def validate_hierarchy():
    import os
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'src', 'data.json')

    with open(data_path, 'r') as f:
        data = json.load(f)
        
    json_tuples = get_json_hierarchy(data)
    # create normalized set for lookup
    json_set = set()
    for c, t, s in json_tuples:
        json_set.add((normalize(c), normalize(t), normalize(s)))
        
    print(f"{'Subject':<25} | {'HTML Leaf Nodes':<15} | {'Valid Matches':<15} | {'% Match'}")
    print("-" * 80)
    
    for subject, url in URL_MAP.items():
        html_tuples = get_html_hierarchy(url)
        
        match_count = 0
        total_items = 0
        
        for c, t, s in html_tuples:
            total_items += 1
            # Check if this tuple exists in JSON
            # We map subject from loop to JSON subject logic? 
            # JSON has "Subject" keys.
            
            # The JSON structure is Subject -> Category -> ...
            # My get_json_hierarchy flattened ALL subjects.
            # So I just check existence in global json_set
            
            if (normalize(c), normalize(t), normalize(s)) in json_set:
                match_count += 1
            else:
                # Debug failures
                # print(f"MISSING: {c} -> {t} -> {s}")
                pass
                
        pct = (match_count / total_items * 100) if total_items else 100
        print(f"{subject:<25} | {total_items:<15} | {match_count:<15} | {pct:.1f}%")

if __name__ == "__main__":
    validate_hierarchy()
