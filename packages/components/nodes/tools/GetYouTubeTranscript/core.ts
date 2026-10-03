import { z } from 'zod/v3'
import fetch from 'node-fetch'
import { DynamicStructuredTool } from '../OpenAPIToolkit/core'

export const BASE_URL = 'https://getyoutubetranscript.com/api/v1'

export const desc = `Use this tool to get the transcript (spoken text) of a YouTube video from its URL or 11-character video ID. Returns the title, channel and full transcript. When timestamps are enabled, each caption line is prefixed with its start time.`

export interface GetYouTubeTranscriptParameters {
    apiKey: string
    includeTimestamps?: boolean
    name?: string
    description?: string
}

interface TranscriptSegment {
    start: number
    duration: number
    text: string
}

interface TranscriptData {
    video_id: string
    language_code: string
    title?: string
    author_name?: string
    transcript: string
    segments?: TranscriptSegment[]
}

const createSchema = () =>
    z.object({
        video: z.string().describe('YouTube video URL (watch, youtu.be, Shorts or live) or the 11-character video ID'),
        language: z.string().optional().describe("Optional caption language code, e.g. 'en' or 'es'")
    })

export const formatStartTime = (seconds: number): string => {
    const total = Math.floor(seconds)
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = String(total % 60).padStart(2, '0')
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}

export const formatTranscript = (data: TranscriptData): string => {
    const header = [`Title: ${data.title ?? ''}`, `Channel: ${data.author_name ?? ''}`, `Language: ${data.language_code}`].join('\n')
    const body = data.segments?.length
        ? data.segments.map((segment) => `[${formatStartTime(segment.start)}] ${segment.text}`).join('\n')
        : data.transcript
    return `${header}\n\n${body}`
}

export class GetYouTubeTranscriptTool extends DynamicStructuredTool {
    apiKey: string
    includeTimestamps = false

    constructor(args: GetYouTubeTranscriptParameters) {
        super({
            name: args.name || 'youtube_transcript',
            description: args.description || desc,
            schema: createSchema(),
            baseUrl: '',
            method: 'GET',
            headers: {}
        })
        this.apiKey = args.apiKey
        this.includeTimestamps = args.includeTimestamps ?? this.includeTimestamps
    }

    async _call(arg: any): Promise<string> {
        const params = new URLSearchParams({ v: arg.video })
        if (arg.language) params.set('language', arg.language)
        if (this.includeTimestamps) params.set('timestamps', 'true')

        try {
            const response = await fetch(`${BASE_URL}/transcript?${params.toString()}`, {
                headers: { Authorization: `Bearer ${this.apiKey}` }
            })
            const body: any = await response.json().catch(() => ({}))
            if (!response.ok || !body?.success) {
                return `Error: ${body?.message || `Request failed with HTTP ${response.status}`}`
            }
            return formatTranscript(body.data as TranscriptData)
        } catch (error) {
            return `Error: ${error instanceof Error ? error.message : String(error)}`
        }
    }
}
