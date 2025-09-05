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

    const prompt = `Analyze the following website content for ${companyName} and create a comprehensive executive brief. Structure your response as a JSON object with the following sections:

1. companyOverview: A concise overview of what the company does, their mission, and core business
2. productsServices: Detailed description of their main products and services
3. businessModel: How they make money, revenue streams, and business approach
4. targetMarket: Who their customers are, market segments, and audience
5. keyInsights: Important findings, unique value propositions, and notable aspects
6. competitivePositioning: How they position themselves in the market and competitive advantages

Website content to analyze:
${content.substring(0, 8000)} // Limit content to avoid token limits

Please provide a professional, business-focused analysis in JSON format with each section containing 2-3 well-structured paragraphs.`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a business analyst creating executive briefs. Respond only with valid JSON containing the requested analysis sections.'
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