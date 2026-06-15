export interface TreeCardData {
  hasTree: boolean
  commonName: string
  scientificName: string
  ageRange: string
  heightRange: string
  nativeRange: string
  supports: string
  care: string
  funFact: string
  residents: string
  uses: string
}

export const TREE_VISION_SYSTEM_PROMPT = `You are a botanist assistant analyzing photos for an AR tree discovery app.
Respond ONLY with valid JSON matching this schema (no markdown, no extra text):
{
  "hasTree": boolean,
  "commonName": string,
  "scientificName": string,
  "ageRange": string,
  "heightRange": string,
  "nativeRange": string,
  "supports": string,
  "care": string,
  "funFact": string,
  "residents": string,
  "uses": string
}

If no tree is clearly visible in the photo, set hasTree to false and all string fields to "".
If a tree is visible, identify the species as accurately as possible and fill every field with concise, kid-friendly facts.
Use realistic ranges for age and height (e.g. "60–140 yrs", "50–80 ft").
For supports, mention approximate species count (e.g. "200+ species").
Keep each string field under 80 characters.`

export function buildTreeCardImagePrompt(data: TreeCardData): string {
  return [
    'A vertical collectible nature info card, portrait orientation, rounded corners.',
    'Dark charcoal textured background with a soft glowing cream border.',
    'Elegant cream serif typography on dark background, field-guide aesthetic.',
    '',
    `Top-left: detailed botanical painting of a ${data.commonName} tree with characteristic bark and foliage.`,
    `Top-right title: "${data.commonName}" in large cream serif.`,
    `Below title in italic: "${data.scientificName}".`,
    'Small circular tree icon button in the top-right corner.',
    '',
    'Information rows separated by thin horizontal lines, each with a small colorful icon:',
    `Age icon + "Age: ${data.ageRange}"`,
    `Height icon + "Height: ${data.heightRange}"`,
    `Globe icon + "Native Range: ${data.nativeRange}"`,
    `Bird icon + "Supports: ${data.supports}"`,
    `Water drop icon + "Care: ${data.care}"`,
    `Sparkle icon + "Fun Fact: ${data.funFact}"`,
    `Bird icon + "Residents: ${data.residents}"`,
    `Leaf icon + "Uses: ${data.uses}"`,
    '',
    'Bottom section: illustrated icon strip showing residents (birds, squirrels, insects) and uses (medicine, syrup, wood).',
    'All text must be spelled correctly and clearly readable.',
    'No phone frame, no UI chrome — only the card on a plain dark background.',
  ].join('\n')
}

export function parseTreeCardResponse(content: string): TreeCardData | null {
  try {
    const trimmed = content.trim()
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
    const jsonText = fenced ? fenced[1].trim() : trimmed
    const parsed = JSON.parse(jsonText) as TreeCardData
    return {
      hasTree: !!parsed.hasTree,
      commonName: parsed.commonName ?? '',
      scientificName: parsed.scientificName ?? '',
      ageRange: parsed.ageRange ?? '',
      heightRange: parsed.heightRange ?? '',
      nativeRange: parsed.nativeRange ?? '',
      supports: parsed.supports ?? '',
      care: parsed.care ?? '',
      funFact: parsed.funFact ?? '',
      residents: parsed.residents ?? '',
      uses: parsed.uses ?? '',
    }
  } catch (error) {
    print('Failed to parse tree card JSON: ' + error)
    return null
  }
}
