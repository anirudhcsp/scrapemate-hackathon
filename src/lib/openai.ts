// src/openai.ts
import OpenAI from 'openai'

/**
 * NOTE: For hackathon speed this still runs in the browser.
 * After the demo, move this call server-side to avoid exposing your API key.
 */
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || ''

export const openai = new OpenAI({
  apiKey: openaiApiKey,
  dangerouslyAllowBrowser: true, // front-end usage (temporary)
})

export const isOpenAIConfigured = () => !!openaiApiKey

// Shape we return to the app (snake_case so it matches your DB + UI)
export interface LlmExecutiveBrief {
  company_overview: string
  products_services: string
  business_model: string
  target_market: string
  key_insights: string
  competitive_positioning: string
  generated_at: string
}

const SYSTEM_PROMPT = `
You are a precise business analyst. Return ONLY valid JSON that matches this schema:

{
  "companyOverview": "string",
  "productsServices": "string",
  "businessModel": "string",
  "targetMarket": "string",
  "keyInsights": "string",
  "competitivePositioning": "string"
}

Rules:
- No markdown, no code fences, no explanations.
- No extra keys.
- Each field must contain 2–3 concise paragraphs of professional prose.
`

/**
 * Generate an executive brief from scraped website content.
 * Returns null if generation fails.
 */
export const generateExecutiveBrief = async (
  content: string,
  companyName: string
): Promise<LlmExecutiveBrief | null> => {
  try {
    if (!isOpenAIConfigured()) {
      throw new Error('OpenAI API key is not configured')
    }

    // Keep payload reasonable (~8k chars). The model sees the trimmed content.
    const trimmed = (content || '').slice(0, 8000)

    const userPrompt = `
Analyze the following website content for "${companyName}" and produce the JSON object defined by the system prompt.

Website content:
${trimmed}
`.trim()

    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1800,
    })

    let raw = resp.choices?.[0]?.message?.content?.trim()
    if (!raw) throw new Error('No response from OpenAI')

    // Defensive: some SDKs/models may still wrap in code fences
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
    }

    // 🔎 DEBUG LOGS (keep these for now)
    console.log('LLM raw output:', raw)

    const data = JSON.parse(raw)

    // 🔎 DEBUG LOGS
    console.log('LLM parsed JSON:', data)

    // Map model keys (camelCase) -> app keys (snake_case)
    const result: LlmExecutiveBrief = {
      company_overview: data.companyOverview ?? '',
      products_services: data.productsServices ?? '',
      business_model: data.businessModel ?? '',
      target_market: data.targetMarket ?? '',
      key_insights: data.keyInsights ?? '',
      competitive_positioning: data.competitivePositioning ?? '',
      generated_at: new Date().toISOString(),
    }

    // 🔎 DEBUG LOGS
    console.log('Mapped result (snake_case):', result)

    return result
  } catch (err) {
    console.error('OpenAI brief generation error:', err)
    return null
  }
}



