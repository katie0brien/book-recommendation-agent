import { recommendBookTool } from '../agent/index'

jest.mock('fs', () => ({
  readFileSync: jest.fn(() =>
    JSON.stringify({
      books: [
        {
          title: 'In Cold Blood',
          author: 'Truman Capote',
          first_publish_year: 1966,
          subject: 'true_crime',
        },
        {
          title: 'The Hobbit',
          author: 'J.R.R. Tolkien',
          first_publish_year: 1937,
          subject: 'fantasy',
        },
      ],
    })
  ),
}))

jest.mock('ai', () => ({
  generateText: jest.fn().mockResolvedValue({
    text: 'A concise, AI-generated one-sentence description.',
    toolResults: [],
  }),
  tool: (config: any) => config,
}))


jest.mock('@ai-sdk/openai', () => ({
  openai: jest.fn(),
}))

describe('recommendBookTool', () => {
  it('returns a recommendation with an AI-generated description for a valid genre', async () => {
    const result = await recommendBookTool.execute!({ genre: 'fantasy' }, {} as any)

    expect(result).toContain('Based on my current collection')
    expect(result).toContain('The Hobbit')
    expect(result).toContain('AI-generated one-sentence description')
  })

  it('returns a message when no books match the genre', async () => {
    const result = await recommendBookTool.execute!({ genre: 'romance' }, {} as any)

    expect(result).toContain("Sorry, I couldn't find any romance books")
  })

  it('handles genre case-insensitivity', async () => {
    const result = await recommendBookTool.execute!({ genre: 'TRUE_CRIME' }, {} as any)

    expect(result).toContain('In Cold Blood')
  })
})
