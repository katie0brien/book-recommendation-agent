import { openai } from '@ai-sdk/openai'
import { generateText, RetryError, tool } from 'ai'
import fs from 'fs'
import readLine from 'readline'
import z from 'zod'

import genres from '../utils/definedSubjects.json'


type Book = {
    title: string
    author: string | null
    first_publish_year: number
    subject: string
}

function loadBooks() {
    try {
        console.log('Fetching books on file.\n')
        return JSON.parse(fs.readFileSync('src/api/books.json', 'utf-8')).books
    }
    catch (error) {
        throw new Error(
            `Error loading books.json. Please validate file creation by following the ReadMe.\n${(error as Error).message}`
        )
    }
}

const bookData = loadBooks()
const genreList = genres.join(', ')

function findBooksByGenre(genre: string): Book[] {
    return bookData.filter((book: Book) => 
        book.subject.toLowerCase() === genre.toLowerCase()
    )
}

function pickRandomBook(bookList: Book[]): Book {
    return bookList[Math.floor(Math.random() * bookList.length)]
}


export const recommendBookTool = tool({
    description: 'Recommend a book from a user-specified genre and provide a brief description.',
    inputSchema: z.object({
        genre: z
        .string()
        .describe('The genre used to recommend a book.'),
    }),
    execute: async ({ genre }) => {
        if (bookData.length === 0) {
            return 'Sorry, the book database is empty or unavailable. Please check your books.json file.'
        }

        const filteredBooks = findBooksByGenre(genre)

        if (filteredBooks.length === 0) {
            return `Sorry, I couldn't find any ${genre} books. I currently have recommendations for the following genres: ${genreList}.`
        }

        const bookRec = pickRandomBook(filteredBooks)
        const bookAuthor = bookRec.author ?? 'Unknown Author'
        const baseRecommendation = `Based on my current collection, I recommend ${bookRec.title} by ${bookAuthor} (${bookRec.first_publish_year}).`

        const agentDescription =  await generateText({
            model: openai('gpt-4o-mini'),
            messages: [
                { 
                    role: 'system', 
                    content: 'You are a helpful book assistant. Write one concise sentence describing the book.',
                },
                { 
                    role: 'user', 
                    content: `Describe the book ${bookRec.title} by ${bookAuthor} in one sentence.`,
                },
            ]
        })

        const briefDescription = agentDescription.text?.trim() ?? ''

        return `${baseRecommendation} ${briefDescription}`
    }
})

async function runAgent(userInput: string) {
    return generateText({
        model: openai('gpt-4o-mini'),
        messages: [
            {
                role: 'system',
                content: 'You are a book recommendation agent. When the user asks for a recommendation, you MUST use the recommendBook tool.',
            },
            {
                role: 'user',
                content: userInput,
            },
        ],
        tools: {
            recommendBook: recommendBookTool,
        }
    })
}

const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
})

console.log('🕮  Hello, I\'m a Book Recommendation Agent 🕮')
console.log('Example Ask: "Recommend a fantasy book"');
console.log('Type "exit" if you wish to end this conversation.\n')

rl.prompt()

rl.on('line', async (input) => {
     if (input.trim().toLowerCase() === 'exit') {
        console.log('🕮  Happy Reading! 🕮')
        rl.close()
        return
    }

    const result = await runAgent(input)

    if (result.toolResults?.length) {
        result.toolResults.forEach((toolResult) => {
            console.log(toolResult.output)
        })
    } else {
        console.log(result.text)
    }

    rl.prompt()
})
