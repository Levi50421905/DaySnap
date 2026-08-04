import { GoogleGenAI } from '@google/genai'
import type { AIDetectionResponse } from '@/types/snap'
import { sanitizeDetectionResponse } from './validate'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

export const PROMPT_VERSION = '2.1'
export const MODEL_VERSION = 'gemini-3.5-flash'

const DETECTION_PROMPT = `
Analyze this photo and identify what is in it. Return ONLY a valid JSON object with no markdown, no backticks, no explanation.

Rules:
- Identify the most interesting/unique object as main snap
- Identify up to 2 supporting elements as secondary snaps
- Be specific: not just "food" but "Soto Banjar" or "Rendang Padang"
- canonical_key must be snake_case, stable, and unique per specific object (not generic)
- native_region: country/region where this object originates; use "global" if not region-specific

Global rarity rubric (assign global_rarity based on how rare this SPECIFIC object is worldwide):
- common: seen daily by most people (sky, generic coffee cup, domestic cat, unknown stranger)
- uncommon: common in one region but not everywhere (regional street food, local plant)
- rare: specific variant, specialty dish, or uncommon species (Soto Banjar, specific orchid species)
- epic: very hard to encounter even with effort (endangered species, rare landmark, niche celebrity, signed merch of specific artist)
- legendary: extremely unique (<0.01% encounter rate): once-in-lifetime sighting, critically endangered, meeting a globally famous artist/idol in person

Person & personal photo rules:
- Rarity is about how rare the SUBJECT is to encounter, NOT whether the photo is professional/stock/from user's own camera
- Personal candid photo of a famous artist you met = epic or legendary based on how famous/rare that encounter is
- Photocard or autograph of a specific artist = rare to epic based on artist fame and item rarity
- Unknown person or yourself in mirror = common
- If you can identify a specific person, use their name in canonical_key (e.g. aruno_nakanishi) and common_name fields

- confidence: 0.0–1.0 how sure you are about the specific identification (not rarity)
- Base rarity on the specific object, NOT its broad category

Return this exact JSON structure:
{
  "main": {
    "canonical_key": "snake_case_unique_identifier",
    "common_name_en": "English name",
    "common_name_id": "Indonesian name",
    "scientific_name": "Scientific name if applicable or null",
    "category": "food|animal|plant|landmark|weather|object|person|other",
    "native_region": "country or region where this originates",
    "global_rarity": "common|uncommon|rare|epic|legendary",
    "confidence": 0.0,
    "condition_note": "brief note about condition or action in photo",
    "context_note": "brief note about environment or atmosphere"
  },
  "secondary": []
}
`

export async function detectPhoto(
  imageBuffer: Buffer,
  mimeType: string = 'image/jpeg'
): Promise<AIDetectionResponse & { model_version: string; prompt_version: string }> {
  const result = await ai.models.generateContent({
    model: MODEL_VERSION,
    contents: [
      {
        role: 'user',
        parts: [
          { text: DETECTION_PROMPT },
          {
            inlineData: {
              mimeType,
              data: imageBuffer.toString('base64'),
            },
          },
        ],
      },
    ],
  })

  const text = result.text
  if (!text) throw new Error('Empty AI response')

  const cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()

  const parsed = JSON.parse(cleaned)
  const { main, secondary } = sanitizeDetectionResponse(parsed)

  return {
    main,
    secondary: secondary.filter(s => s.confidence > 0.5),
    model_version: MODEL_VERSION,
    prompt_version: PROMPT_VERSION,
  }
}
