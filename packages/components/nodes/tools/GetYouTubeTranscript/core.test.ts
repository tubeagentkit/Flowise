import fetch from 'node-fetch'
import { BASE_URL, formatStartTime, GetYouTubeTranscriptTool } from './core'

jest.mock('node-fetch', () => jest.fn())
const mockFetch = fetch as unknown as jest.Mock

const okResponse = (data: any) => ({ ok: true, status: 200, json: async () => ({ success: true, data }) })

describe('GetYouTubeTranscriptTool', () => {
    beforeEach(() => mockFetch.mockReset())

    it('formats start times', () => {
        expect(formatStartTime(5.4)).toBe('0:05')
        expect(formatStartTime(65)).toBe('1:05')
        expect(formatStartTime(3725)).toBe('1:02:05')
    })

    it('requests the transcript with the API key and returns plain text', async () => {
        mockFetch.mockResolvedValue(
            okResponse({ video_id: 'abc', language_code: 'en', title: 'T', author_name: 'C', transcript: 'hello world' })
        )
        const tool = new GetYouTubeTranscriptTool({ apiKey: 'key-1' })

        const result = await tool._call({ video: 'https://youtu.be/abc', language: 'en' })

        const [url, init] = mockFetch.mock.calls[0]
        expect(url).toBe(`${BASE_URL}/transcript?v=https%3A%2F%2Fyoutu.be%2Fabc&language=en`)
        expect(init.headers.Authorization).toBe('Bearer key-1')
        expect(result).toBe('Title: T\nChannel: C\nLanguage: en\n\nhello world')
    })

    it('asks for timestamps and prefixes each line with its start time', async () => {
        mockFetch.mockResolvedValue(
            okResponse({
                video_id: 'abc',
                language_code: 'en',
                transcript: 'a b',
                segments: [
                    { start: 1.2, duration: 2, text: 'a' },
                    { start: 61, duration: 2, text: 'b' }
                ]
            })
        )
        const tool = new GetYouTubeTranscriptTool({ apiKey: 'k', includeTimestamps: true })

        const result = await tool._call({ video: 'abc' })

        expect(mockFetch.mock.calls[0][0]).toContain('timestamps=true')
        expect(result.endsWith('[0:01] a\n[1:01] b')).toBe(true)
    })

    it('returns the API error message instead of throwing', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 401,
            json: async () => ({ success: false, code: 'INVALID_API_KEY', message: 'This API key is invalid or has been revoked.' })
        })
        const tool = new GetYouTubeTranscriptTool({ apiKey: 'bad' })

        expect(await tool._call({ video: 'abc' })).toBe('Error: This API key is invalid or has been revoked.')
    })
})
