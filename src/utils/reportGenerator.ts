import { Page, Project } from '../lib/supabase'
import { ExecutiveBrief } from '../lib/supabase'

export interface ReportData {
  project: Project
  pages: Page[]
  executiveBrief?: ExecutiveBrief | null
  generatedAt: string
}

export const generateReport = (project: Project, pages: Page[], executiveBrief?: ExecutiveBrief | null): ReportData => {
  return {
    project,
    pages,
    executiveBrief,
    generatedAt: new Date().toISOString()
  }
}

export const downloadReportAsPDF = (reportData: ReportData) => {
  // Create HTML content for PDF generation
  const htmlContent = generateHTMLReport(reportData)
  
  // Create a blob with the HTML content
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  
  // Create download link and trigger download
  const link = document.createElement('a')
  link.href = url
  link.download = `scrapemate-report-${reportData.project.name || 'project'}-${new Date().toISOString().split('T')[0]}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const generateHTMLReport = (reportData: ReportData): string => {
  const { project, pages, executiveBrief, generatedAt } = reportData
  
  const cleanContent = (content: string): string => {
    if (!content) return 'No information available for this section.'
    
    let parsedContent = content
    if (content.trim().startsWith('{') || content.trim().startsWith('"')) {
      try {
        const parsed = JSON.parse(content)
        if (typeof parsed === 'object') {
          parsedContent = Object.values(parsed).join('\n\n')
        } else if (typeof parsed === 'string') {
          parsedContent = parsed
        }
      } catch (e) {
        parsedContent = content
          .replace(/^["']|["']$/g, '')
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/^\{|\}$/g, '')
          .replace(/"[^"]*":\s*"/g, '')
          .replace(/",\s*"/g, '\n\n')
          .replace(/"/g, '')
      }
    }
    
    return parsedContent
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim()
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>ScrapeMate Analysis Report - ${project.name || 'Project'}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          background: white;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 30px;
          margin-bottom: 40px;
        }
        .header h1 {
          color: #1e40af;
          font-size: 2.5em;
          margin: 0 0 10px 0;
        }
        .header .subtitle {
          color: #6b7280;
          font-size: 1.2em;
          margin: 0;
        }
        .project-info {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 40px;
        }
        .project-info h2 {
          color: #374151;
          margin-top: 0;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
        }
        .info-label {
          font-weight: 600;
          color: #4b5563;
        }
        .executive-brief {
          margin-bottom: 50px;
        }
        .executive-brief h2 {
          color: #1e40af;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
        }
        .brief-section {
          margin-bottom: 30px;
          padding: 20px;
          background: #fafafa;
          border-radius: 8px;
        }
        .brief-section h3 {
          color: #374151;
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 1.3em;
        }
        .brief-section p {
          margin: 0;
          white-space: pre-wrap;
        }
        .pages-summary h2 {
          color: #1e40af;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
        }
        .page-item {
          margin-bottom: 25px;
          padding: 15px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }
        .page-title {
          font-weight: 600;
          color: #374151;
          margin-bottom: 5px;
        }
        .page-url {
          color: #6b7280;
          font-size: 0.9em;
          margin-bottom: 10px;
          word-break: break-all;
        }
        .page-content {
          color: #4b5563;
          font-size: 0.9em;
          max-height: 200px;
          overflow: hidden;
        }
        .footer {
          text-align: center;
          margin-top: 50px;
          padding-top: 30px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 0.9em;
        }
        @media print {
          body { padding: 20px; }
          .page-item { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ScrapeMate Analysis Report</h1>
        <p class="subtitle">Professional Website Analysis & Intelligence</p>
      </div>

      <div class="project-info">
        <h2>Project Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Project Name:</span>
            <span>${project.name || 'Untitled Project'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Website URL:</span>
            <span>${project.seed_url}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Analysis Status:</span>
            <span>${project.status.charAt(0).toUpperCase() + project.status.slice(1)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Pages Analyzed:</span>
            <span>${pages.length}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Created:</span>
            <span>${new Date(project.created_at).toLocaleDateString()}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Report Generated:</span>
            <span>${new Date(generatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      ${executiveBrief ? `
        <div class="executive-brief">
          <h2>Executive Brief</h2>
          <p style="color: #6b7280; margin-bottom: 30px; font-style: italic;">
            AI-Generated Business Intelligence Analysis
          </p>
          
          ${executiveBrief.company_overview ? `
            <div class="brief-section">
              <h3>Company Overview</h3>
              <p>${cleanContent(executiveBrief.company_overview)}</p>
            </div>
          ` : ''}
          
          ${executiveBrief.products_services ? `
            <div class="brief-section">
              <h3>Products & Services</h3>
              <p>${cleanContent(executiveBrief.products_services)}</p>
            </div>
          ` : ''}
          
          ${executiveBrief.business_model ? `
            <div class="brief-section">
              <h3>Business Model</h3>
              <p>${cleanContent(executiveBrief.business_model)}</p>
            </div>
          ` : ''}
          
          ${executiveBrief.target_market ? `
            <div class="brief-section">
              <h3>Target Market</h3>
              <p>${cleanContent(executiveBrief.target_market)}</p>
            </div>
          ` : ''}
          
          ${executiveBrief.key_insights ? `
            <div class="brief-section">
              <h3>Key Insights</h3>
              <p>${cleanContent(executiveBrief.key_insights)}</p>
            </div>
          ` : ''}
          
          ${executiveBrief.competitive_positioning ? `
            <div class="brief-section">
              <h3>Competitive Positioning</h3>
              <p>${cleanContent(executiveBrief.competitive_positioning)}</p>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <div class="pages-summary">
        <h2>Scraped Pages Summary</h2>
        ${pages.length === 0 ? `
          <p style="color: #6b7280; font-style: italic;">No pages were scraped for this project.</p>
        ` : `
          ${pages.map((page, index) => `
            <div class="page-item">
              <div class="page-title">${index + 1}. ${page.title || 'Untitled Page'}</div>
              <div class="page-url">${page.url}</div>
              ${page.content_md ? `
                <div class="page-content">${page.content_md.substring(0, 300)}${page.content_md.length > 300 ? '...' : ''}</div>
              ` : ''}
            </div>
          `).join('')}
        `}
      </div>

      <div class="footer">
        <p>Report generated by ScrapeMate on ${new Date(generatedAt).toLocaleString()}</p>
        <p>Professional Website Analysis & Business Intelligence Platform</p>
      </div>
    </body>
    </html>
  `
}

export const downloadReportAsMarkdown = (reportData: ReportData) => {
  const { project, pages, executiveBrief, generatedAt } = reportData
  
  const cleanContent = (content: string): string => {
    if (!content) return 'No information available for this section.'
    
    let parsedContent = content
    if (content.trim().startsWith('{') || content.trim().startsWith('"')) {
      try {
        const parsed = JSON.parse(content)
        if (typeof parsed === 'object') {
          parsedContent = Object.values(parsed).join('\n\n')
        } else if (typeof parsed === 'string') {
          parsedContent = parsed
        }
      } catch (e) {
        parsedContent = content
          .replace(/^["']|["']$/g, '')
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/^\{|\}$/g, '')
          .replace(/"[^"]*":\s*"/g, '')
          .replace(/",\s*"/g, '\n\n')
          .replace(/"/g, '')
      }
    }
    
    return parsedContent
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim()
  }
  
  let markdown = `# ScrapeMate Analysis Report\n\n`
  markdown += `**Professional Website Analysis & Business Intelligence**\n\n`
  markdown += `---\n\n`
  markdown += `## Project Information\n\n`
  markdown += `**Project:** ${project.name || 'Untitled Project'}\n`
  markdown += `**URL:** ${project.seed_url}\n`
  markdown += `**Status:** ${project.status}\n`
  markdown += `**Created:** ${new Date(project.created_at).toLocaleDateString()}\n`
  markdown += `**Report Generated:** ${new Date(generatedAt).toLocaleDateString()}\n`
  markdown += `**Pages Scraped:** ${pages.length}\n\n`
  
  markdown += `---\n\n`
  
  // Add Executive Brief if available
  if (executiveBrief) {
    markdown += `## Executive Brief\n\n`
    markdown += `*AI-Generated Business Intelligence Analysis*\n\n`
    
    if (executiveBrief.company_overview) {
      markdown += `### Company Overview\n\n`
      markdown += `${cleanContent(executiveBrief.company_overview)}\n\n`
    }
    
    if (executiveBrief.products_services) {
      markdown += `### Products & Services\n\n`
      markdown += `${cleanContent(executiveBrief.products_services)}\n\n`
    }
    
    if (executiveBrief.business_model) {
      markdown += `### Business Model\n\n`
      markdown += `${cleanContent(executiveBrief.business_model)}\n\n`
    }
    
    if (executiveBrief.target_market) {
      markdown += `### Target Market\n\n`
      markdown += `${cleanContent(executiveBrief.target_market)}\n\n`
    }
    
    if (executiveBrief.key_insights) {
      markdown += `### Key Insights\n\n`
      markdown += `${cleanContent(executiveBrief.key_insights)}\n\n`
    }
    
    if (executiveBrief.competitive_positioning) {
      markdown += `### Competitive Positioning\n\n`
      markdown += `${cleanContent(executiveBrief.competitive_positioning)}\n\n`
    }
    
    markdown += `---\n\n`
  }
  
  if (pages.length === 0) {
    markdown += `## Scraped Pages Summary\n\n`
    markdown += `*No pages were scraped for this project.*\n`
  } else {
    markdown += `## Scraped Pages Summary\n\n`
    
    pages.forEach((page, index) => {
      markdown += `### ${index + 1}. ${page.title || 'Untitled Page'}\n\n`
      markdown += `**URL:** ${page.url}\n`
      markdown += `**Scraped:** ${new Date(page.created_at).toLocaleDateString()}\n\n`
      
      if (page.content_md) {
        markdown += `**Content Preview:**\n\n`
        markdown += `${page.content_md.substring(0, 500)}${page.content_md.length > 500 ? '...' : ''}\n\n`
      }
      
      markdown += `---\n\n`
    })
  }
  
  markdown += `\n---\n\n`
  markdown += `*Report generated by ScrapeMate on ${new Date(generatedAt).toLocaleString()}*\n`
  markdown += `*Professional Website Analysis & Business Intelligence Platform*\n`
  
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `scrapemate-report-${project.name || 'project'}-${new Date().toISOString().split('T')[0]}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}