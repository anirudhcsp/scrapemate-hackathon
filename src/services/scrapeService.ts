import { supabase } from '../lib/supabase'
import { scrapeWebsite, isFirecrawlConfigured } from '../lib/firecrawl'
import { generateExecutiveBrief, isOpenAIConfigured } from '../lib/openai'

export class ScrapeService {
  static async processProject(projectId: string, url: string): Promise<void> {
    try {
      // Check if Firecrawl is configured
      if (!isFirecrawlConfigured()) {
        await this.updateProjectStatus(projectId, 'failed', undefined, 'Firecrawl API key not configured')
        return
      }

      // Update project status to processing
      await this.updateProjectStatus(projectId, 'processing', 0, 'Starting website analysis...')
      
      // Small delay to ensure status update is committed
      await new Promise(resolve => setTimeout(resolve, 500))

      // Start scraping with Firecrawl
      await this.updateProjectStatus(projectId, 'processing', 10, 'Connecting to website...')
      const scrapeResult = await scrapeWebsite(url)

      if (!scrapeResult.success) {
        await this.updateProjectStatus(projectId, 'failed', undefined, scrapeResult.error)
        return
      }

      await this.updateProjectStatus(projectId, 'processing', 30, 'Processing scraped content...')

      // Store scraped pages in database
      if (scrapeResult.pages.length > 0) {
        const totalPages = scrapeResult.pages.length
        
        const pagesData = scrapeResult.pages.map(page => ({
          project_id: projectId,
          url: page.url,
          title: page.title || 'Untitled',
          content_md: page.content,
          status: 'done'
        }))

        await this.updateProjectStatus(
          projectId, 
          'processing', 
          60, 
          `Storing ${totalPages} scraped page${totalPages !== 1 ? 's' : ''}...`
        )

        const { error: pagesError } = await supabase
          .from('pages')
          .insert(pagesData)

        if (pagesError) {
          console.error('Error storing pages:', pagesError)
          await this.updateProjectStatus(projectId, 'failed', undefined, 'Failed to store scraped pages')
          return
        }

        await this.updateProjectStatus(
          projectId, 
          'processing', 
          90, 
          `Finalizing analysis of ${totalPages} page${totalPages !== 1 ? 's' : ''}...`
        )
        
        // Small delay before completion
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Update project status to completed
      await this.updateProjectStatus(projectId, 'completed', 100, 'Analysis completed successfully!')

      // Generate executive brief if OpenAI is configured
      if (isOpenAIConfigured() && scrapeResult.pages.length > 0) {
        await this.updateProjectStatus(projectId, 'completed', 100, 'Generating executive brief...')
        
        // Combine all page content for analysis
        const combinedContent = scrapeResult.pages
          .map(page => `${page.title || ''}\n${page.content || ''}`)
          .join('\n\n')
        
        const companyName = new URL(url).hostname
        const brief = await generateExecutiveBrief(combinedContent, companyName)
        
        if (brief) {
          const briefData = {
            project_id: projectId,
            company_overview: brief.companyOverview,
            products_services: brief.productsServices,
            business_model: brief.businessModel,
            target_market: brief.targetMarket,
            key_insights: brief.keyInsights,
            competitive_positioning: brief.competitivePositioning,
            generated_at: brief.generatedAt
          }

          const { error: briefError } = await supabase
            .from('executive_briefs')
            .insert([briefData])

          if (briefError) {
            console.error('Error storing executive brief:', briefError)
          }
        }
      }

    } catch (error) {
      console.error('Error processing project:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown processing error'
      await this.updateProjectStatus(projectId, 'failed', undefined, errorMessage)
    }
  }

  private static async updateProjectStatus(
    projectId: string, 
    status: 'queued' | 'processing' | 'completed' | 'failed',
    progress?: number,
    progressMessage?: string
  ): Promise<void> {
    try {
      const updateData: any = { status }
      
      if (progress !== undefined) {
        updateData.progress = progress
      }
      
      if (progressMessage !== undefined) {
        updateData.progress_message = progressMessage
      }

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId)

      if (error) {
        console.error('Error updating project status:', error)
      }
    } catch (error) {
      console.error('Error updating project status:', error)
    }
  }
}