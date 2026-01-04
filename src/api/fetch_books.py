import requests
from typing import List, Dict
import json


API_URL = "https://openlibrary.org/subjects/{subject}.json?limit=25"
with open("../utils/definedSubjects.json", "r", encoding="utf-8") as file:
    SUBJECTS = json.load(file)
OUTPUT_FILE = "books.json"

def fetch_books_by_subject(subject: str) -> List[Dict]:
    response = requests.get(API_URL.format(subject = subject))
    response.raise_for_status

    responseData = response.json()
    books = []

    for work in responseData.get("works", []):
        authors = work.get("authors")
        author_name = authors[0].get("name") if authors else None
        books.append({
            "title": work.get("title"),
            "author": author_name,
            "first_publish_year": work.get("first_publish_year"),
            "subject": subject,
        })

    return books

def main():
    all_books = []

    for subject in SUBJECTS:
        print(f"Fetching books from subject: {subject}")
        books_by_subject = fetch_books_by_subject(subject)
        all_books.extend(books_by_subject)

    output = {"books": all_books}

    with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
        json.dump(output, file, indent=2, ensure_ascii=False)

    print(f"Saved {len(all_books)} books to {OUTPUT_FILE}!")

if __name__ == "__main__":
    main()
