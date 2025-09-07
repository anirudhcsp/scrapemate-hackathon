import FirecrawlApp from '@mendable/firecrawl-js'

console.log('Firecrawl API Key (runtime):', import.meta.env.VITE_FIRECRAWL_API_KEY);

const firecrawlApiKey = import.meta.env.VITE_FIRECRAWL_API_KEY || ''

// Create Firecrawl client
export const firecrawl = new FirecrawlApp({ apiKey: firecrawlApiKey })

// Helper function to check if Firecrawl is properly configured
export const isFirecrawlConfigured = () => {
  return !!(firecrawlApiKey && firecrawlApiKey !== '')
}

export interface FirecrawlPage {
  url: string
  title?: string
  content: string
  markdown?: string
}

export interface ScrapeResult {
  success: boolean
  pages: FirecrawlPage[]
  error?: string
}

export const scrapeWebsite = async (url: string): Promise<ScrapeResult> => {
  try {
    if (!isFirecrawlConfigured()) {
      throw new Error('Firecrawl API key is not configured')
    }

    // Use Firecrawl v1 API with correct parameters
    const crawlResponse = await firecrawl.crawlUrl(url, {
      limit: 10,
      scrapeOptions: {
        formats: ['markdown', 'html']
      }
    })

    if (!crawlResponse.success) {
      throw new Error(crawlResponse.error || 'Failed to crawl website')
    }

    const pages: FirecrawlPage[] = crawlResponse.data?.map((page: any) => ({
      url: page.url || url,
      title: page.metadata?.title || 'Untitled',
      content: page.markdown || page.content || '',
      markdown: page.markdown
    })) || []

    return {
      success: true,
      pages
    }
  } catch (error) {
    console.error('Firecrawl scraping error:', error)
    return {
      success: false,
      pages: [],
      error: error instanceof Error ? error.message : 'Unknown scraping error'
    }
  }
}
