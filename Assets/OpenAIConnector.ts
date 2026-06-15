import { Interactable } from 'SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable'
import { validate } from './SpectaclesInteractionKit/Utils/validate'
import { TreeCard } from './Forest/scripts/TreeCard'
import {
  TreeCardData,
  TREE_VISION_SYSTEM_PROMPT,
  buildTreeCardImagePrompt,
  parseTreeCardResponse,
} from './Forest/scripts/treeCardData'

let cameraModule = require('LensStudio:CameraModule')
let internetModule = require('LensStudio:InternetModule')


@component
export class OpenAIConnector extends BaseScriptComponent {
  @input buttonForImageAndText!: Interactable
  @input buttonForText!: Interactable

  @input responseText: Text
  @input imagePromptText: string = 'Describe the contents of this image.'
  @input promptText: string = 'Roast me as a snapchat user.'

  @input systemPrompt: string = 'You are a helpful assistant.'
  @input openAIApiKey: string = 'YOUR_OPENAI_API_KEY_HERE'
  @input @label('Model Index (see Output panel for options)')
  modelIndex: number = 0

  @input @allowUndefined treeCard: TreeCard | undefined
  @input treeCaptureMode: boolean = true
  @input imageModel: string = 'gpt-image-1.5'

  private readonly modelNames: string[] = [
    'gpt-5.4',       // 0  - Most capable
    'gpt-5.4-pro',   // 1  - Smarter, more precise
    'gpt-5-mini',    // 2  - Fast, cost-efficient
    'gpt-5-nano',    // 3  - Fastest, cheapest
    'gpt-5',         // 4  - Previous frontier
    'gpt-4.1',       // 5  - Smartest non-reasoning
    'gpt-4.1-mini',  // 6  - Smaller, faster 4.1
    'gpt-4.1-nano',  // 7  - Fastest 4.1
    'gpt-4o',        // 8  - Fast, flexible
    'gpt-4o-mini',   // 9  - Affordable, focused
    'gpt-4-turbo',   // 10 - Older high-intelligence
    'o3',            // 11 - Reasoning
    'o3-pro',        // 12 - Reasoning, more compute
    'o3-mini',       // 13 - Reasoning, small
    'o4-mini',       // 14 - Fast reasoning
    'o1',            // 15 - Previous reasoning
  ]

  private isLoading: boolean = false
  private cameraTexture: any

  private setError(msg: string) {
    this.isLoading = false
    this.responseText.text = msg
  }

  createCameraRequest = () => {
    if (this.isLoading) return

    let cameraRequest = CameraModule.createCameraRequest()
    cameraRequest.cameraId = CameraModule.CameraId.Left_Color

    this.cameraTexture = cameraModule.requestCamera(cameraRequest)

    let onNewFrame = this.cameraTexture.control.onNewFrame
    let registration = onNewFrame.add(() => {
      Base64.encodeTextureAsync(
        this.cameraTexture,
        (successFrame) => {
          print('Success: Image captured successfully')
          if (this.treeCaptureMode) {
            this.analyzeTreeCapture(successFrame)
          } else {
            const messages = [
              {
                role: 'user',
                content: [
                  { type: 'text', text: this.imagePromptText },
                  { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${successFrame}` } },
                ],
              },
            ]
            this.callOpenAI(messages)
          }
        },
        () => {
          print('Error encoding camera texture.')
          this.setError('Failed to capture image.')
        },
        CompressionQuality.HighQuality,
        EncodingType.Jpg
      )

      onNewFrame.remove(registration)
    })
  }

  private async analyzeTreeCapture(imageB64: string): Promise<void> {
    if (this.isLoading) return
    this.isLoading = true
    this.treeCard?.hide()
    this.responseText.text = 'Looking for a tree...'

    try {
      const url = 'https://api.openai.com/v1/chat/completions'
      const request = new Request(url, {
        method: 'POST',
        body: JSON.stringify({
          model: this.modelNames[this.modelIndex] ?? 'gpt-5.4',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: TREE_VISION_SYSTEM_PROMPT },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Analyze this photo for a tree.' },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageB64}` } },
              ],
            },
          ],
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIApiKey}`,
        },
      })

      const response = await internetModule.fetch(request)
      if (response.status !== 200) {
        const errorText = await response.text()
        print('Tree vision request failed: ' + errorText)
        this.setError('Error ' + response.status + ': ' + errorText)
        return
      }

      const responseJson = await response.json()
      const content = responseJson.choices[0].message.content
      print('Tree vision response: ' + content)

      const treeData = parseTreeCardResponse(content)
      if (!treeData) {
        this.setError('Could not read tree data. Try again.')
        return
      }

      if (!treeData.hasTree) {
        this.isLoading = false
        this.responseText.text = 'No tree found. Point at a tree and try again.'
        return
      }

      this.responseText.text = 'Creating your tree card...'
      try {
        this.treeCard?.showPlaceholder()
      } catch (placeholderError) {
        print('TreeCard placeholder warning: ' + placeholderError)
      }
      await this.generateTreeCard(treeData)
    } catch (error) {
      print('Error analyzing tree capture: ' + error)
      this.setError('Error: ' + error)
    }
  }

  private async generateTreeCard(data: TreeCardData): Promise<void> {
    try {
      const url = 'https://api.openai.com/v1/images/generations'
      const request = new Request(url, {
        method: 'POST',
        body: JSON.stringify({
          model: this.imageModel,
          prompt: buildTreeCardImagePrompt(data),
          size: '1024x1536',
          quality: 'high',
          output_format: 'jpeg',
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIApiKey}`,
        },
      })

      const response = await internetModule.fetch(request)
      if (response.status !== 200) {
        const errorText = await response.text()
        print('Tree card image request failed: ' + errorText)
        this.treeCard?.hide()
        this.setError('Error ' + response.status + ': ' + errorText)
        return
      }

      const responseJson = await response.json()
      const b64Json = responseJson.data?.[0]?.b64_json
      if (!b64Json) {
        this.treeCard?.hide()
        this.setError('No image returned from OpenAI.')
        return
      }

      await this.displayGeneratedCard(b64Json)
      this.responseText.text = `You found a ${data.commonName}!`
      this.isLoading = false
    } catch (error) {
      print('Error generating tree card: ' + error)
      this.treeCard?.hide()
      this.setError('Error: ' + error)
    }
  }

  private displayGeneratedCard(b64Json: string): Promise<void> {
    return new Promise((resolve, reject) => {
      Base64.decodeTextureAsync(
        b64Json,
        (texture) => {
          if (this.treeCard) {
            this.treeCard.showGenerated(texture)
          } else {
            print('WARNING: treeCard not assigned — cannot display generated card.')
          }
          resolve()
        },
        () => {
          reject(new Error('Failed to decode generated tree card image.'))
        }
      )
    })
  }

  private async callOpenAI(messages: any[]): Promise<void> {
    if (this.isLoading) return
    this.isLoading = true
    this.responseText.text = 'Thinking...'

    try {
      const url = 'https://api.openai.com/v1/chat/completions'
      const request = new Request(url, {
        method: 'POST',
        body: JSON.stringify({
          model: this.modelNames[this.modelIndex] ?? 'gpt-5.4',
          messages: this.systemPrompt
            ? [{ role: 'system', content: this.systemPrompt }, ...messages]
            : messages,
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIApiKey}`,
        },
      })

      const response = await internetModule.fetch(request)
      if (response.status === 200) {
        const responseJson = await response.json()
        this.handleOpenAIResponse(responseJson)
      } else {
        const errorText = await response.text()
        print('OpenAI request failed: ' + errorText)
        this.setError('Error ' + response.status + ': ' + errorText)
      }
    } catch (error) {
      print('Error calling OpenAI: ' + error)
      this.setError('Error: ' + error)
    }
  }

  sendImageAndPromptToOpenAI(image: any, prompt: string) {
    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } },
        ],
      },
    ]
    this.callOpenAI(messages)
  }

  sendPromptToOpenAI(prompt: string) {
    const messages = [
      {
        role: 'user',
        content: prompt,
      },
    ]
    this.callOpenAI(messages)
  }

  handleOpenAIResponse(response) {
    const content = response.choices[0].message.content
    print('OpenAI response: ' + content)
    this.responseText.text = content
    this.isLoading = false
  }

  onAwake(): void {
    if (this.openAIApiKey === 'YOUR_OPENAI_API_KEY_HERE') {
      print('WARNING: OpenAI API key is not set. Update openAIApiKey in the Inspector.')
    }

    print('Available models:')
    this.modelNames.forEach((name, i) => print('  ' + i + ': ' + name))
    print('Selected model: ' + (this.modelNames[this.modelIndex] ?? 'gpt-5.4 (fallback)'))
    print('Tree capture mode: ' + this.treeCaptureMode)
    print('Image model: ' + this.imageModel)

    validate(this.buttonForImageAndText)
    this.buttonForImageAndText.onTriggerEnd.add(this.createCameraRequest)

    validate(this.buttonForText)
    this.buttonForText.onTriggerEnd.add(() => this.sendPromptToOpenAI(this.promptText))
  }
}
