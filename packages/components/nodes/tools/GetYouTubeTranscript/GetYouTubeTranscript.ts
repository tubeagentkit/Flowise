import { ICommonObject, INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses, getCredentialData, getCredentialParam } from '../../../src/utils'
import { desc, GetYouTubeTranscriptTool } from './core'

class GetYouTubeTranscript_Tools implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    credential: INodeParams
    inputs: INodeParams[]

    constructor() {
        this.label = 'GetYouTubeTranscript'
        this.name = 'getYouTubeTranscript'
        this.version = 1.0
        this.type = 'GetYouTubeTranscript'
        this.icon = 'getyoutubetranscript.png'
        this.category = 'Tools'
        this.description = 'Get the transcript of a YouTube video, optionally with timestamps, using the GetYouTubeTranscript API'
        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['getYouTubeTranscriptApi']
        }
        this.baseClasses = [this.type, ...getBaseClasses(GetYouTubeTranscriptTool)]
        this.inputs = [
            {
                label: 'Include Timestamps',
                name: 'includeTimestamps',
                type: 'boolean',
                description: 'Prefix each caption line with its start time, e.g. [1:05]',
                default: false,
                optional: true
            },
            {
                label: 'Name',
                name: 'toolName',
                type: 'string',
                default: 'youtube_transcript',
                description: 'Name of the tool',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Description',
                name: 'toolDescription',
                type: 'string',
                rows: 4,
                default: desc,
                description: 'Describe to LLM when it should use this tool',
                additionalParams: true,
                optional: true
            }
        ]
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        const credentialData = await getCredentialData(nodeData.credential ?? '', options)
        const apiKey = getCredentialParam('getYouTubeTranscriptApiKey', credentialData, nodeData)
        const name = nodeData.inputs?.toolName as string
        const description = nodeData.inputs?.toolDescription as string

        return new GetYouTubeTranscriptTool({
            apiKey,
            includeTimestamps: nodeData.inputs?.includeTimestamps as boolean,
            name: name
                ? name
                      .toLowerCase()
                      .replace(/ /g, '_')
                      .replace(/[^a-z0-9_-]/g, '')
                : undefined,
            description
        })
    }
}

module.exports = { nodeClass: GetYouTubeTranscript_Tools }
