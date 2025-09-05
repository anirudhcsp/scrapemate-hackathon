import OpenAI from 'openai'

// ❗️[RECOMMENDED] Move this call to your backend ASAP. Browser calls expose keys.
// For now we'll keep it to unblock you.
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || ''

export const openai = new OpenAI({
  apiKey: openaiApiKey,
  dangerouslyAllowBrowser: true,
})

export const isOpenAIConfigured = () => !!openaiApiKey

export interface ExecutiveBrief {
  company_overview: string
  products_services: string
  business_model: string
  target_market: string
  key_insights: string
  competitive_positioning: string
  generatedAt: string
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
- Do not include markdown, code fences, explanations, or extra keys.
- Each field must be 2–3 concise paragraphs of professional prose.
`

export const generateExecutiveBrief = async (
  content: string,
  companyName: string
): Promise<ExecutiveBrief | null> => {
  try {
    if (!isOpenAIConfigured()) throw new Error('OpenAI API key is not configured')

    // Keep payload reasonable (~6–8k chars ≈ ~1500–2000 tokens incl. prompts)
    const trimmed = content.slice(0, 8000)

    const userPrompt = `
Analyze website content for "${companyName}" and produce the JSON object.

Website content:
${trimmed}
`

    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      // Force strict JSON
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1800,
    })

    let raw = resp.choices?.[0]?.message?.content?.trim()
    if (!raw) throw new Error('No response from OpenAI')

    // Defensive: strip code fences if present
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
    }

    const data = JSON.parse(raw)

    return {
      company_overview: data.companyOverview ?? 'No overview available',
      products_services: data.productsServices ?? 'No products/services information available',
      business_model: data.businessModel ?? 'No business model information available',
      target_market: data.targetMarket ?? 'No target market information available',
      key_insights: data.keyInsights ?? 'No key insights available',
      competitive_positioning: data.competitivePositioning ?? 'No competitive positioning information available',
      generatedAt: new Date().toISOString(),
    }
  } catch (err) {
    console.error('OpenAI brief generation error:', err)
    return null
  }
}

