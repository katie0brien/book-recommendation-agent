# book-recommendation-agent

This project is a **command-line book recommendation agent**.  It uses a local dataset and AI to recommend books by genre as well as provide a brief description on the suggested book. 


## Setup

1. Install Dependencies

```shell
npm install
```

2. Set your OpenAI API Key

```shell
$env:OPENAI_API_KEY="your_api_key_here"
```

3. Fetch Books from OpenLibrary
Update `definedSubjects.json` with any four genres of your choosing, or keep default.

```shell
cd src\api

py fetchBooks.py
```

This generates a local dataset of 100 books from the genres specified.

4. Run the Agent
From project root.

```shell
npm run start
```

