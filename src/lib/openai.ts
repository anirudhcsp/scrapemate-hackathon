import OpenAI from 'openai'

const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || ''

// Create OpenAI client
export const openai = new OpenAI({
  apiKey: openaiApiKey,
  dangerouslyAllowBrowser: true // Required for client-side usage
})

// Helper function to check if OpenAI is properly configured
export const isOpenAIConfigured = () => {
  return !!(openaiApiKey && openaiApiKey !== '')
}

export interface ExecutiveBrief {
  companyOverview: string
  productsServices: string
  businessModel: string
  targetMarket: string
  keyInsights: string
  competitivePositioning: string
  generatedAt: string
}

export const generateExecutiveBrief = async (content: string, companyName: string): Promise<ExecutiveBrief | null> => {
  try {
    if (!isOpenAIConfigured()) {
      throw new Error('OpenAI API key is not configured')
    }

    const prompt = `Analyze the following website content for ${companyName} and create a comprehensive executive brief. Write in a professional, business report style with clear paragraphs and proper formatting. Structure your response as a JSON object with the following sections:

1. companyOverview: Write 2-3 well-structured paragraphs about what the company does, their mission, and core business. Use professional business language. Do not include any JSON formatting, field names, or structural elements in your response.
2. productsServices: Write 2-3 detailed paragraphs describing their main products and services. Focus on clear explanations without technical jargon. Write as flowing prose, not structured data.
3. businessModel: Write 2-3 paragraphs explaining how they make money, revenue streams, and business approach in accessible language. Present as narrative text only.
4. targetMarket: Write 2-3 paragraphs about who their customers are, market segments, and target audience using clear business terminology. Write in paragraph form only.
5. keyInsights: Write 2-3 paragraphs highlighting important findings, unique value propositions, and notable business aspects. Present as readable business prose.
6. competitivePositioning: Write 2-3 paragraphs about how they position themselves in the market and their competitive advantages. Write as professional narrative text.

Website content to analyze:
${content.substring(0, 8000)} // Limit content to avoid token limits

CRITICAL: Write each section as clean, readable paragraphs without any JSON formatting, curly braces, quotation marks, or technical field names in the content itself. The content should read like a professional business report that flows naturally when read aloud. Do not include any structural markup or formatting indicators in the actual content. Return the response as valid JSON with the six sections above, but ensure the content within each section is pure prose.`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a business analyst creating executive briefs. Write in a professional, clear business style. Respond only with valid JSON containing the requested analysis sections. Each section should contain clean, readable paragraphs that flow naturally as prose - no JSON formatting, technical field names, quotation marks, or structural elements should appear in the actual content. Write as if you are writing a traditional business report that will be read by executives.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })

    const briefContent = response.choices[0]?.message?.content
    if (!briefContent) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    const briefData = JSON.parse(briefContent)
    
    return {
      companyOverview: briefData.companyOverview || 'No overview available',
      productsServices: briefData.productsServices || 'No products/services information available',
      businessModel: briefData.businessModel || 'No business model information available',
      targetMarket: briefData.targetMarket || 'No target market information available',
      keyInsights: briefData.keyInsights || 'No key insights available',
      competitivePositioning: briefData.competitivePositioning || 'No competitive positioning information available',
      generatedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('OpenAI brief generation error:', error)
    return null
  }
}