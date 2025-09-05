import { supabase } from '../lib/supabase'
import { scrapeWebsite, isFirecrawlConfigured } from '../lib/firecrawl'

export class ScrapeService {
  static async processProject(projectId: string, url: string): Promise<void> {
    try {
      // Check if Firecrawl is configured
      if (!isFirecrawlConfigured()) {
        await this.updateProjectStatus(projectId, 'failed', 'Firecrawl API key not configured')
        return
      }

      // Update project status to processing
      await this.updateProjectStatus(projectId, 'processing')

      // Start scraping with Firecrawl
      const scrapeResult = await scrapeWebsite(url)

      if (!scrapeResult.success) {
        await this.updateProjectStatus(projectId, 'failed', scrapeResult.error)
        return
      }

      // Store scraped pages in database
      if (scrapeResult.pages.length > 0) {
        const pagesData = scrapeResult.pages.map(page => ({
          project_id: projectId,
          url: page.url,
          title: page.title || 'Untitled',
          content_md: page.content,
          status: 'done'
        }))

        const { error: pagesError } = await supabase
          .from('pages')
          .insert(pagesData)

        if (pagesError) {
          console.error('Error storing pages:', pagesError)
          await this.updateProjectStatus(projectId, 'failed', 'Failed to store scraped pages')
          return
        }
      }

      // Update project status to completed
      await this.updateProjectStatus(projectId, 'completed')

    } catch (error) {
      console.error('Error processing project:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown processing error'
      await this.updateProjectStatus(projectId, 'failed', errorMessage)
    }
  }

  private static async updateProjectStatus(
    projectId: string, 
    status: 'queued' | 'processing' | 'completed' | 'failed',
    errorMessage?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', projectId)

      if (error) {
        console.error('Error updating project status:', error)
      }

      if (errorMessage) {
        console.error(`Project ${projectId} failed:`, errorMessage)
      }
    } catch (error) {
      console.error('Error updating project status:', error)
    }
  }
}