# ScrapeMate - Professional B2B Web Analysis Application

A powerful web scraping and analysis platform that provides comprehensive business intelligence from any website using AI-powered insights.

## Features

- **AI-Powered Analysis**: Generate executive briefs with business intelligence
- **Real-time Web Scraping**: Extract content from any website instantly
- **Comprehensive Reports**: Download detailed analysis in Markdown format
- **Professional Dashboard**: Track multiple projects and their progress
- **Business Intelligence**: Transform raw data into actionable insights

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (Database + Authentication)
- **Web Scraping**: Firecrawl API
- **AI Analysis**: OpenAI GPT-3.5
- **Build Tool**: Vite
- **Deployment**: Ready for Netlify, Vercel, or any static hosting

## Environment Variables

Create a `.env` file in the root directory with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_FIRECRAWL_API_KEY=your_firecrawl_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

## Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to Netlify

### Option 1: Drag & Drop
1. Run `npm run build`
2. Go to [Netlify](https://netlify.com)
3. Drag the `dist` folder to Netlify's deploy area

### Option 2: Git Integration
1. Push your code to GitHub/GitLab
2. Connect your repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add your environment variables in Netlify's dashboard

### Option 3: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

## Database Setup (Supabase)

The application uses Supabase for data storage. The database schema includes:
- `projects` - Website analysis projects
- `pages` - Scraped page content
- `executive_briefs` - AI-generated business intelligence
- `chunks` & `embeddings` - Content processing and search

## API Keys Required

- **Supabase**: Database and authentication
- **Firecrawl**: Web scraping service
- **OpenAI**: AI-powered analysis (optional)

## License

Built for modern businesses - Professional web analysis made simple.