
import requests
from bs4 import BeautifulSoup
import json
import re
import time
import sys

BASE_URL = "https://iasscore.in"
SUBJECT_ROOTS = [
    "history",
    "geography",
    "polity",
    "polity-governance",
    "economy",
    "environment",
    "science-technology"
]

def get_soup(url):
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        return BeautifulSoup(response.text, 'html.parser')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def clean_text(text):
    if not text: return ""
    return re.sub(r'\s+', ' ', text).strip()

def harvest_list_items(ul_element):
    """
    Recursively extract all list items as a flat list of strings.
    Handles deeply nested structures.
    """
    items = []
    if not ul_element:
        return items
        
    for li in ul_element.find_all('li', recursive=False):
        # Check for direct text in this LI (excluding children text)
        # We need to be careful. Text might be in a span or direct.
        
        # Get text node strictly in this li, not in nested ul
        text_content = ""
        # iterate over children
        for child in li.children:
            if child.name == 'ul':
                continue
            if child.name is None: # NavigableString
                 text_content += child.string if child.string else ""
            elif child.name != 'ul':
                 text_content += child.get_text()
        
        clean_val = clean_text(text_content)
        if clean_val:
            items.append(clean_val)
            
        # Recurse into children ULs
        for child_ul in li.find_all('ul', recursive=False):
            items.extend(harvest_list_items(child_ul))
            
    return items

def scrape_subject_page(url):
    soup = get_soup(url)
    if not soup:
        return {}, []

    data = {}
    validation_log = [] # List of (Category, HeaderText, ItemCount)
    
    cards = soup.find_all('div', class_='syllabus_details')
    
    for card in cards:
        title_tag = card.find(['h3', 'h4'], class_='title')
        if not title_tag:
            continue
        category_name = clean_text(title_tag.get_text())
        
        sections_div = card.find('div', class_='sections')
        if not sections_div:
            continue
            
        # Iterate over ALL top-level ULs
        # Sometimes there are multiple ULs in one section (e.g. Miscellaneous in Indian Culture)
        top_uls = sections_div.find_all('ul', recursive=False)
        if not top_uls:
             # Fallback if no direct children ULs? 
             # Just try find('ul') if list is empty?
             first_ul = sections_div.find('ul')
             if first_ul: top_uls = [first_ul]
        
        topics = []
        current_topic = None
        
        for top_ul in top_uls:
            # Iterate top-level LIs to handle sibling structure
            for li in top_ul.find_all('li', recursive=False):
                
                # 1. Identify if this LI is a "Topic Header"
                # It usually has a spy or direct text, but NOT just a wrapper for a UL.
                
                # Get text excluding sub-ul
                li_text_parts = []
                for child in li.children:
                    if child.name == 'ul': continue
                    text = child.get_text() if child.name else child
                    if text: li_text_parts.append(text)
                
                li_text_full = clean_text(" ".join(li_text_parts))
                
                # 2. Check for sub-list
                child_ul = li.find('ul')
                
                if li_text_full:
                    # It is a Topic
                    current_topic = {
                        "topic": li_text_full,
                        "subtopics": []
                    }
                    topics.append(current_topic)
                    
                    # If it ALSO has a child UL, harvest it immediately
                    if child_ul:
                        sub_items = harvest_list_items(child_ul)
                        current_topic["subtopics"].extend(sub_items)
                        
                else:
                    # it has no text, so it might be a wrapper for the previous topic's subtopics
                    if current_topic and child_ul:
                        # Harvest everything inside
                        sub_items = harvest_list_items(child_ul)
                        current_topic["subtopics"].extend(sub_items)
                    elif child_ul:
                         # Orphan subtopics? Or maybe the first item was weird.
                         # Just create a "Misc" topic if needed, or log warning
                         # But commonly this happens if the HTML is malformed.
                         pass

        if topics:
            data[category_name] = topics
            
            # Validation stats
            for t in topics:
                validation_log.append(f"Subject: {category_name} | Topic: {t['topic']} | Subtopics via recursion: {len(t['subtopics'])}")
                if len(t['subtopics']) == 0:
                     validation_log.append(f"WARNING: Topic '{t['topic']}' has 0 subtopics.")

    return data, validation_log

def main():
    final_data = {}
    master_log = []
    
    prelims_links = []
    
    # Discovery
    for subject in SUBJECT_ROOTS:
        root_url = f"{BASE_URL}/upsc-syllabus/{subject}"
        try:
            soup = get_soup(root_url)
            if not soup: continue
            
            for a in soup.find_all('a', href=True):
                text = clean_text(a.get_text())
                href = a['href']
                
                if "Prelims" in text and "upsc-syllabus" in href:
                    full_url = href if href.startswith('http') else BASE_URL + href
                    name = text.replace("(Prelims)", "").replace("()", "").strip()
                    if "(" in name: name = re.sub(r'\(.*\)', '', name).strip()
                    
                    if not any(l[1] == full_url for l in prelims_links):
                        prelims_links.append((name, full_url))
        except:
            continue
            
    print(f"Found {len(prelims_links)} Prelims modules.")
    
    for name, url in prelims_links:
        print(f"Scraping {name}...")
        subject_data, logs = scrape_subject_page(url)
        if subject_data:
            final_data[name] = subject_data
            master_log.extend(logs)
        time.sleep(0.5)
        
    # Write Data
    import os
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'src', 'data.json')
    log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scraping_validation_log.txt')

    with open(data_path, 'w') as f:
        json.dump(final_data, f, indent=4)
        
    # Write Validation Log
    with open(log_path, 'w') as f:
        for line in master_log:
            f.write(line + "\n")
            
    print("Scraping complete. Check 'src/data.json' and 'scraping_validation_log.txt'.")

if __name__ == "__main__":
    main()
