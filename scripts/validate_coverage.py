
import requests
from bs4 import BeautifulSoup
import json
import re
import sys

# Mapping strictly based on what we scraped
URL_MAP = {
    "Indian Culture": "https://iasscore.in/upsc-syllabus/history/indian-culture-prelims",
    "Geography": "https://iasscore.in/upsc-syllabus/geography/geography-prelims",
    "Economy": "https://iasscore.in/upsc-syllabus/economy/economy-prelims",
    "Environment": "https://iasscore.in/upsc-syllabus/environment/environment-prelims",
    "Science And Technology": "https://iasscore.in/upsc-syllabus/science-technology/science-and-technology-prelims",
    "General Science": "https://iasscore.in/upsc-syllabus/science-technology/general-science-prelims",
    "Indian Polity And Governance": "https://iasscore.in/upsc-syllabus/polity-governance/indian-polity-and-governance-prelims"
}

def clean_text(text):
    if not text: return ""
    # Remove special chars but keep spaces?
    # Normalize heavily for comparison
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def normalize_for_set(text):
    return re.sub(r'[^a-zA-Z0-9]', '', text).lower()

def get_html_terms(url):
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        soup = BeautifulSoup(response.text, 'html.parser')
        
        terms = set()
        raw_terms = []
        
        # Scrape all LI text in the relevant section
        # Target all syllabus_details
        wrappers = soup.find_all('div', class_='syllabus_details')
        if not wrappers:
            print(f"Skipping {url} (no wrappers found)")
            return set(), []

        for wrapper in wrappers:
            for li in wrapper.find_all('li'):
                # Get ONE level of text (own text)
                own_text = ""
                for child in li.children:
                    if child.name == 'ul': continue
                    own_text += child.get_text() if child.name else child
                
                clean = clean_text(own_text)
                if clean and len(clean) > 2: # Ignore bullet points or empty
                    terms.add(normalize_for_set(clean))
                    raw_terms.append(clean)
                
        return terms, raw_terms
    except Exception as e:
        print(f"Error checking {url}: {e}")
        return set(), []

def get_json_terms(json_data, subject):
    terms = set()
    raw_terms = []
    
    if subject not in json_data:
        return set(), []
    
    # Iterate Structure
    categories = json_data[subject] # This is a dict of categories -> list of topics
    
    for category, topic_list in categories.items():
        # Categories are also in the HTML usually as h3/h4 or li
        # But our simple HTML scraper grabbed LIs. Categories might be H3s. 
        # But let's check content.
        
        for topic_obj in topic_list:
            t = topic_obj.get('topic', '')
            if t:
                terms.add(normalize_for_set(t))
                raw_terms.append(t)
            
            for sub in topic_obj.get('subtopics', []):
                terms.add(normalize_for_set(sub))
                raw_terms.append(sub)
                
    return terms, raw_terms

def check_coverage():
    import os
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'src', 'data.json')
    
    with open(data_path, 'r') as f:
        data = json.load(f)
        
    print(f"{'Subject':<25} | {'HTML Count':<10} | {'JSON Count':<10} | {'Missing in JSON (Potential)'}")
    print("-" * 100)
        
    for subject, url in URL_MAP.items():
        html_set, html_raw = get_html_terms(url)
        json_set, json_raw = get_json_terms(data, subject)
        
        # We want to know mostly what is in HTML but NOT in JSON
        missing_ids = html_set - json_set
        
        # Map back to raw for readability
        missing_raw = []
        for term in missing_ids:
            # Find a raw rep
            for r in html_raw:
                if normalize_for_set(r) == term:
                    missing_raw.append(r)
                    break
        
        missing_count = len(missing_raw)
        missing_display = ", ".join(missing_raw[:3]) + ("..." if missing_count > 3 else "")
        if missing_count == 0: missing_display = "OK"
        
        print(f"{subject:<25} | {len(html_set):<10} | {len(json_set):<10} | {missing_display}")

        if missing_count > 0:
             # Write detailed missing report
             with open(f'missing_report_{subject.replace(" ", "_")}.txt', 'w') as f:
                 f.write(f"Missing items for {subject}:\n")
                 for item in missing_raw:
                     f.write(f"- {item}\n")

if __name__ == "__main__":
    check_coverage()
