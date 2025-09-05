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
  company_overview: string
  products_services: string
  business_model: string
  target_market: string
  key_insights: string
  competitive_positioning: string
  generatedAt: string
}

export const generateExecutiveBrief = async (content: string, companyName: string): Promise<ExecutiveBrief | null> => {
  try {
    if (!isOpenAIConfigured()) {
      throw new Error('OpenAI API key is not configured')
    }

    const prompt = `Analyze the following website content for ${companyName} and create a comprehensive executive brief. Write in a professional, business report style with clear paragraphs and proper formatting. Structure your response as a JSON object with the following sections:

1. companyOverview: Write 2-3 well-structured paragraphs about what the company does, their mission, and core business. Write ONLY the paragraph content - no labels, no field names, no JSON formatting.
2. productsServices: Write 2-3 detailed paragraphs describing their main products and services. Write ONLY the paragraph content - no labels, no field names, no JSON formatting.
3. businessModel: Write 2-3 paragraphs explaining how they make money, revenue streams, and business approach. Write ONLY the paragraph content - no labels, no field names, no JSON formatting.
4. targetMarket: Write 2-3 paragraphs about who their customers are, market segments, and target audience. Write ONLY the paragraph content - no labels, no field names, no JSON formatting.
5. keyInsights: Write 2-3 paragraphs highlighting important findings, unique value propositions, and notable business aspects. Write ONLY the paragraph content - no labels, no field names, no JSON formatting.
6. competitivePositioning: Write 2-3 paragraphs about how they position themselves in the market and their competitive advantages. Write ONLY the paragraph content - no labels, no field names, no JSON formatting.

Website content to analyze:
${content.substring(0, 8000)} // Limit content to avoid token limits

CRITICAL: Each section should contain ONLY paragraph text - no field names, no colons, no labels, no JSON formatting. Write as if you are writing paragraphs for a printed business report. The JSON structure is only for organizing the response, but the content itself must be pure prose paragraphs.`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a business analyst creating executive briefs. Write in a professional, clear business style. Respond with valid JSON, but each section content should be pure paragraph text with no field names, labels, or formatting. Write the content as if it will be printed in a business report - just clean, professional paragraphs.'
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
      company_overview: briefData.companyOverview || 'No overview available',
      products_services: briefData.productsServices || 'No products/services information available',
      business_model: briefData.businessModel || 'No business model information available',
      target_market: briefData.targetMarket || 'No target market information available',
      key_insights: briefData.keyInsights || 'No key insights available',
      competitive_positioning: briefData.competitivePositioning || 'No competitive positioning information available',
      generatedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('OpenAI brief generation error:', error)
    return null
  }
}
