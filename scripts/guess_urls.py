
import requests

guesses = [
    "https://iasscore.in/upsc-syllabus/science-technology/physics-prelims",
    "https://iasscore.in/upsc-syllabus/science-technology/chemistry-prelims",
    "https://iasscore.in/upsc-syllabus/general-science/physics-prelims",
    "https://iasscore.in/upsc-syllabus/general-science/chemistry-prelims",
    "https://iasscore.in/upsc-syllabus/science-technology/biology-prelims",
    "https://iasscore.in/upsc-syllabus/general-science/biology-prelims",
]

for url in guesses:
    try:
        r = requests.head(url, headers={'User-Agent': 'Mozilla/5.0'}, allow_redirects=True)
        print(f"{url} -> Status: {r.status_code}")
    except:
        print(f"{url} -> FAILED")
