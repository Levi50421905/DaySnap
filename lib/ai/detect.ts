import { GoogleGenAI } from '@google/genai'
import type { AIDetectionResponse, DetectionResult } from '@/types/snap'
import type { RarityTier } from '@/constants/rarity'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

const PROMPT_VERSION = '1.0'
const MODEL_VERSION = 'gemini-3.5-flash'

const DETECTION_PROMPT = `
Analyze this photo and identify what is in it. Return ONLY a valid JSON object with no markdown, no backticks, no explanation.

Rules:
- Identify the most interesting/unique object as main snap
- Identify up to 2 supporting elements as secondary snaps
- Global rarity must be one of: common, uncommon, rare, epic, legendary
- Base rarity on how rare/unique the specific object is globally, NOT its category
- Be specific: not just "food" but "Soto Banjar" or "Rendang Padang"

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
    "confidence": 0.0 to 1.0,
    "condition_note": "brief note about condition or action in photo",
    "context_note": "brief note about environment or atmosphere"
  },
  "secondary": [
    {
      "canonical_key": "snake_case_identifier",
      "common_name_en": "English name",
      "common_name_id": "Indonesian name",
      "scientific_name": null,
      "category": "category",
      "native_region": "region",
      "global_rarity": "common|uncommon|rare|epic|legendary",
      "confidence": 0.0 to 1.0,
      "condition_note": "brief note",
      "context_note": "brief note"
    }
  ]
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
  console.dir(result, { depth: null })
  //const text = result.text()
  const text = result.text

  // Bersihkan response dari markdown kalau ada
  const cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()

  const parsed = JSON.parse(cleaned)

  // Validasi structure
  if (!parsed.main || !parsed.main.canonical_key) {
    throw new Error('Invalid AI response structure')
  }

  // Pastikan secondary selalu array, maksimal 2
  const secondary: DetectionResult[] = (parsed.secondary ?? [])
    .slice(0, 2)
    .filter((s: DetectionResult) => s.canonical_key && s.confidence > 0.5)

  return {
    main: parsed.main as DetectionResult,
    secondary,
    model_version: MODEL_VERSION,
    prompt_version: PROMPT_VERSION,
  }
}