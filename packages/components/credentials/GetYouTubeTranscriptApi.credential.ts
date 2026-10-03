import { INodeParams, INodeCredential } from '../src/Interface'

class GetYouTubeTranscriptApi implements INodeCredential {
    label: string
    name: string
    version: number
    description: string
    inputs: INodeParams[]

    constructor() {
        this.label = 'GetYouTubeTranscript API'
        this.name = 'getYouTubeTranscriptApi'
        this.version = 1.0
        this.description =
            'Create an API key in your <a target="_blank" href="https://getyoutubetranscript.com/dashboard">GetYouTubeTranscript dashboard</a>'
        this.inputs = [
            {
                label: 'API Key',
                name: 'getYouTubeTranscriptApiKey',
                type: 'password'
            }
        ]
    }
}

module.exports = { credClass: GetYouTubeTranscriptApi }
