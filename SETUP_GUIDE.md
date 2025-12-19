# ThesisAI Philippines - Setup Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Setup](#quick-setup)
- [Step-by-Step Installation](#step-by-step-installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [AI Integrations](#ai-integrations)
- [Running the Application](#running-the-application)
- [Development Commands](#development-commands)
- [Troubleshooting](#troubleshooting)
- [Common Issues](#common-issues)

## Prerequisites

Before setting up the ThesisAI project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **pnpm** 
- **Git**
- **PostgreSQL** (for local development)
- **Supabase CLI** (optional, for local development)

You can check your installations with:
```bash
node --version
npm --version
git --version
```

## Quick Setup

For the fastest setup, run the following commands in your terminal:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/thesisai.git
cd thesisai

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Set up your environment variables (see Environment Configuration below)

# 5. Start the development server
npm run dev
```

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/thesisai.git
cd thesisai
```

### 2. Install Dependencies

The project uses pnpm for package management. If you don't have it installed:

```bash
# Install pnpm globally
npm install -g pnpm

# Install project dependencies
pnpm install
```

Alternatively, you can use npm:

```bash
npm install
```

### 3. Verify Installation

After installing dependencies, you should see:
- `node_modules` folder created
- `package-lock.json` or `pnpm-lock.yaml` file updated
- All dependencies installed without errors

## Environment Configuration

### 1. Copy the Environment File

```bash
cp .env.example .env.local
```

### 2. Configure Environment Variables

Open `.env.local` and update the following values:

#### Database Configuration
```env
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### AI Services Configuration
```env
# Puter AI Configuration
PUTER_API_KEY=your_puter_api_key
PUTER_HOST=your_puter_host

# Paper Search API (if using SERP API)
SERP_API_KEY=your_serp_api_key
```

#### Other Required Variables
```env
# For email notifications
RESEND_API_KEY=your_resend_api_key

# For analytics (Sentry)
SENTRY_DSN=your_sentry_dsn

# For payments (if applicable)
REVENUECAT_API_KEY=your_revenuecat_api_key

# For development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Database Setup

### Option 1: Supabase Setup (Recommended)

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Sign up and create a new project
   - Note your Project URL and API keys

2. **Update Environment Variables**
   - Add your Supabase URL and API keys to `.env.local`

3. **Run Database Migrations**
   ```bash
   npx supabase db push
   ```

### Option 2: Local Database with Supabase CLI

1. **Install Supabase CLI**
   ```bash
   # For macOS/Linux
   brew install supabase

   # For Windows (PowerShell)
   winget install Supabase
   ```

2. **Start Local Database**
   ```bash
   npx supabase start
   ```

3. **Run Migrations**
   ```bash
   npx supabase db reset
   ```

## AI Integrations

### Puter AI Setup
1. **Sign up at [puter.com](https://puter.com)**
2. **Generate an API key in your dashboard**
3. **Add to `.env.local`**:
   ```env
   PUTER_API_KEY=your_puter_api_key
   PUTER_HOST=https://api.puter.com  # or your custom endpoint
   ```

### MCP (Model Context Protocol) Configuration
1. **Ensure MCP servers are configured**:
   - Check `mcp-servers-config.json`
   - Update server endpoints as needed

## Running the Application

### Development Mode
```bash
# Start the development server
npm run dev
# or
pnpm dev
```

The application will start at `http://localhost:3000`

### Build and Production Mode
```bash
# Build the application
npm run build
# or
pnpm build

# Start production server
npm run start
# or
pnpm start
```

### Additional Commands
- `npm run lint` - Lint code
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run setup:mcp` - Set up MCP integration

## Development Commands

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Lint and fix code |
| `npm run test` | Run all tests |
| `npm run test:ui` | Run tests with UI |
| `npm run setup:mcp` | Set up MCP server integration |
| `npm run verify-amp` | Verify AMP CDN configuration |
| `npm run amp-metrics` | Get AMP CDN health status |

### Database Commands
- `npx supabase db push` - Push schema changes
- `npx supabase db reset` - Reset database
- `npx supabase gen types typescript --project-id your-project-id > types/supabase.ts` - Generate TypeScript types

## Troubleshooting

### Common Setup Issues

#### 1. Dependency Installation Issues
**Issue**: Dependencies failing to install
**Solution**:
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 2. Environment Variables Missing
**Issue**: "Environment variable not found" error
**Solution**: Ensure `.env.local` file exists with all required variables

#### 3. Database Connection Issues
**Issue**: Can't connect to database
**Solution**:
1. Verify Supabase URL and keys are correct
2. Check that your Supabase project is active
3. Ensure you have internet connection

#### 4. Port Already in Use
**Issue**: Port 3000 is already in use
**Solution**: Change port with:
```bash
npm run dev -- -p 3001
```

#### 5. Build Memory Issues
**Issue**: "JavaScript heap out of memory" during build
**Solution**: The project already has increased memory settings:
```bash
npm run build:max  # Uses maximum memory allocation
```

### Debugging Tips

1. **Check Node.js version**: Ensure you're using Node.js v18+
2. **Verify environment variables**: All required variables must be set
3. **Clear browser cache**: Sometimes old cache can cause issues
4. **Check console logs**: Look for specific error messages
5. **Review documentation**: Check the docs folder for detailed guides

## Common Issues

### 1. Authentication Issues
- Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Verify Supabase authentication settings in your project

### 2. AI Services Not Working
- Check `PUTER_API_KEY` and `PUTER_HOST` values
- Verify your Puter account has necessary permissions

### 3. Email Notifications Not Sending
- Confirm `RESEND_API_KEY` is properly configured
- Check recipient email domains for any blocks

### 4. Performance Issues During Build
- Use `npm run build:max` for maximum memory allocation
- Close other applications to free up system resources
- Ensure you have at least 8GB of RAM available

### 5. File Upload Issues
- Check file size limits in your Supabase storage settings
- Verify file type restrictions

## Getting Help

If you encounter issues not covered in this guide:

1. **Check the documentation**: Review files in the `docs/` directory
2. **File an issue**: Create an issue in the repository
3. **Debug logs**: Enable detailed logging by adding `DEBUG=true` to your environment

---

**Note**: This setup guide covers the most common scenarios. The ThesisAI project is comprehensive with many interconnected features. If you encounter specific issues related to particular features, please refer to the detailed documentation in the `docs/` directory.

### Next Steps

After successful setup:

1. Explore the [Documentation](./docs/) for detailed feature guides
2. Review the [Admin Dashboard](./src/components/admin-dashboard.tsx) for management features
3. Test the [User Onboarding](./docs/admin-dashboard/USER_ONBOARDING_DOCUMENTATION_GUIDES.md) features
4. Familiarize yourself with the [Advisor Dashboard](./src/components/advisor-dashboard.tsx) if applicable

### Support

For additional support:
- Check the `docs/` folder for comprehensive guides
- Review the `README.md` for project overview
- Look for specific feature documentation in the documentation hierarchy
- Contact the development team if you encounter persistent issues