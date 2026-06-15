

Trees XR — A Snap Spectacles AR learning lens where guide Pepper helps you observe trees, discover wildlife, ask questions, and cultivate a personal forest. Built with Lens Studio, SIK, and OpenAI vision.

Team 10 - AWE - Snap Spectacles Hackathon 


# Used as a boilerplate - OpenAIConnector-Spectacles

An open source Lens Studio project that bridges Snap Spectacles and OpenAI. It uses the Spectacles `CameraModule` to capture frames from the device camera and sends them to OpenAI's vision API — displaying the response as AR text overlaid in your field of view.

https://github.com/user-attachments/assets/e2628846-598f-4ada-bfb3-38a8e8a3750a

Getting camera frames out of Lens Studio and into an external AI API is non-trivial. This project solves that end-to-end and packages it as a reusable, configurable component that any developer can drop into their own Spectacles lens.

---

## Features

- **Vision requests** — pinch to capture a camera frame and send it with a prompt to OpenAI
- **Tree card generation** — capture a tree photo, identify the species, and generate a mockup-style info card via OpenAI Images API
- **Text-only requests** — pinch a second button to send a prompt without an image
- **16 model options** — select any vision-capable OpenAI model via the Inspector
- **Loading state** — shows "Thinking..." while awaiting a response; ignores duplicate pinches
- **Configurable prompts** — set your image and text prompts directly in the Lens Studio Inspector
- **System prompt** — set the AI's persona or behaviour via the Inspector (e.g. "You are a museum tour guide")
- **Standalone script** — available as a single `.lsc` file if you don't need the full project

---

## How It Works

1. The user pinches the image button on Spectacles
2. `CameraModule` opens a request for the left colour camera
3. The first available frame is encoded as a base64 JPEG using Lens Studio's `Base64` API
4. The encoded image and prompt are sent to `https://api.openai.com/v1/chat/completions` via `InternetModule`
5. The response text is written to a `Text` component visible in AR

For text-only requests, steps 2–3 are skipped and the prompt is sent directly.

### Tree card capture flow

When `treeCaptureMode` is enabled (default):

1. User pinches **Capture Tree**
2. Camera frame is sent to OpenAI vision with a JSON schema prompt
3. If no tree is detected, a message is shown and the flow stops
4. If a tree is found, species data is sent to `v1/images/generations` (`gpt-image-1.5` by default)
5. The returned base64 image is decoded with `Base64.decodeTextureAsync` and displayed on the `TreeCard` panel

---

## Requirements

- [Lens Studio](https://ar.snap.com/lens-studio) 5.x or later
- Snap Spectacles device or simulator
- An OpenAI API key: https://platform.openai.com/settings/organization/api-keys

---

## Setup

1. Clone the repository and open the project in Lens Studio
2. Select the scene object with the `OpenAIConnector` script component
3. In the Inspector panel, fill in the following fields:

| Field | Description |
|---|---|
| `systemPrompt` | Optional system prompt to set the AI's persona or behaviour |
| `openAIApiKey` | Your OpenAI API key |
| `Model Index` | Integer selecting the model (see table below) |
| `imagePromptText` | Prompt sent alongside the captured image |
| `promptText` | Prompt sent for text-only requests |
| `buttonForImageAndText` | SIK Interactable for image + text requests |
| `buttonForText` | SIK Interactable for text-only requests |
| `responseText` | Text component that displays the response in AR |
| `treeCaptureMode` | When true, Capture button runs tree detection + card generation |
| `treeCard` | `TreeCard` script component that displays the generated card |
| `imageModel` | OpenAI image model (default: `gpt-image-1.5`; try `gpt-image-2` if verified) |

4. Run in the Lens Studio simulator or deploy to your Spectacles device

### Tree card scene setup

If setting up manually in Lens Studio:

1. Under **OpenAI Connector UI**, create **TreeCardPanel** (disabled by default)
2. Add a child **TreeCardImage** with an `Image` component using `Assets/Forest/textures/treecardimageMaterial.mat`
3. Assign `Assets/Forest/textures/tree-card.png` as the placeholder texture on the `TreeCard` script
4. Add the `TreeCard` script to an **always-enabled** object (e.g. the `OpenAIConnector` scene object); wire `cardPanel` → **TreeCardPanel**, `cardImage` → Image
5. On `OpenAIConnector`, wire `treeCard` → the `TreeCard` component and set `treeCaptureMode` to true

---

## Model Options

Set `Model Index` in the Inspector to one of the following. The selected model is also printed to the Output panel on startup.

| Index | Model | Notes |
|---|---|---|
| 0 | `gpt-5.4` | Default. Most capable |
| 1 | `gpt-5.4-pro` | Smarter, more precise responses |
| 2 | `gpt-5-mini` | Fast, cost-efficient |
| 3 | `gpt-5-nano` | Fastest, cheapest |
| 4 | `gpt-5` | Previous frontier model |
| 5 | `gpt-4.1` | Smartest non-reasoning model |
| 6 | `gpt-4.1-mini` | Smaller, faster version of 4.1 |
| 7 | `gpt-4.1-nano` | Fastest, cheapest 4.1 |
| 8 | `gpt-4o` | Fast, flexible |
| 9 | `gpt-4o-mini` | Affordable, focused tasks |
| 10 | `gpt-4-turbo` | Older high-intelligence model |
| 11 | `o3` | Reasoning model |
| 12 | `o3-pro` | Reasoning with more compute |
| 13 | `o3-mini` | Small reasoning model |
| 14 | `o4-mini` | Fast reasoning model |
| 15 | `o1` | Previous reasoning model |

---


---

## License

MIT License. Free to use, modify, and distribute.
