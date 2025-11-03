#!/usr/bin/env python3
"""
ThesisAI Interactive Analysis Agent
Uses Gemini API for code analysis, OpenRouter for production app features
"""

import os
import json
import sys
from pathlib import Path
from typing import Dict, List, Optional
import argparse
from datetime import datetime
import requests
import google.generativeai as genai

class ThesisAIAgent:
    """AI Agent specialized for ThesisAI web application"""
    
    def __init__(self, project_path: str, openrouter_key: str, gemini_api_key: str,
                 gemini_model: str = "gemini-1.5-flash",
                 openrouter_model: str = "deepseek/deepseek-chat"):
        self.project_path = Path(project_path)
        self.openrouter_key = openrouter_key
        self.gemini_api_key = gemini_api_key
        self.gemini_model = gemini_model
        self.openrouter_model = openrouter_model
        self.analysis_results = {}
        self.openrouter_api_url = "https://openrouter.ai/api/v1/chat/completions"
        
        if self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
        
    def read_file_content(self, file_path: Path, max_lines: int = 100) -> str:
        """Read and return file content with line limit"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()[:max_lines]
                return ''.join(lines)
        except Exception:
            return ""
    
    def call_gemini_api(self, prompt: str, files: Optional[List[str]] = None) -> str:
        """Call Gemini API for internal code analysis"""
        if not self.gemini_api_key:
            return "Error: Gemini API key not provided."

        try:
            model = genai.GenerativeModel(self.gemini_model)
            
            context_prompt = f"""You are analyzing ThesisAI, an AI-powered academic writing assistant for Philippine universities.

IMPORTANT: This codebase analysis is for INTERNAL DEVELOPMENT USE ONLY. 
The production app should use OpenRouter API (sk-or-v1-...) for all user-facing AI features, NOT Gemini API.

{prompt}"""

            if files:
                processed_files = []
                for file in files:
                    file_path = self.project_path / file
                    if file_path.exists():
                        try:
                            processed_files.append(genai.upload_file(path=str(file_path)))
                        except Exception as e:
                            print(f"   ⚠️  Could not upload file {file_path}: {e}")
                if processed_files:
                    context_prompt += "\n\n## Attached Files for Context:"
                    for f in processed_files:
                        context_prompt += f"\n- {f.name}"
            
            response = model.generate_content(context_prompt)
            return response.text

        except Exception as e:
            return f"Error calling Gemini API: {str(e)}"
    
    def call_openrouter(self, prompt: str, system_prompt: str = None) -> str:
        """Call OpenRouter API for production app recommendations"""
        headers = {
            "Authorization": f"Bearer {self.openrouter_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/thesis-ai-agent",
            "X-Title": "ThesisAI Analysis Agent"
        }
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        data = {
            "model": self.openrouter_model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 4000
        }
        
        try:
            print("   🌐 Calling OpenRouter API...")
            response = requests.post(self.openrouter_api_url, headers=headers, json=data, timeout=60)
            response.raise_for_status()
            
            result = response.json()
            return result['choices'][0]['message']['content']
            
        except requests.exceptions.Timeout:
            return "Error: OpenRouter API timed out"
        except requests.exceptions.RequestException as e:
            return f"Error: OpenRouter API failed - {str(e)}"
        except KeyError as e:
            return f"Error: Unexpected OpenRouter response - {str(e)}"
        except Exception as e:
            return f"Error calling OpenRouter: {str(e)}"
    
    def scan_codebase(self) -> Dict:
        """Scan ThesisAI codebase with Gemini API (internal analysis)"""
        print("🔍 Scanning ThesisAI codebase...")
        
        # Find all relevant files
        frontend_files = []
        backend_files = []
        config_files = []
        component_files = []
        api_routes = []
        
        skip_dirs = {'node_modules', '.git', 'dist', 'build', '.next', '__pycache__', 'venv', '.vercel', 'out'}
        
        for root, dirs, files in os.walk(self.project_path):
            dirs[:] = [d for d in dirs if d not in skip_dirs]
            rel_root = Path(root).relative_to(self.project_path)
            
            for file in files:
                file_path = rel_root / file
                file_str = str(file_path)
                
                if any(comp in file_str for comp in ['components/', 'src/components/']):
                    component_files.append(file_path)
                elif any(api in file_str for api in ['api/', 'pages/api/', 'app/api/']):
                    api_routes.append(file_path)
                elif file.endswith(('.jsx', '.tsx', '.css', '.scss')):
                    frontend_files.append(file_path)
                elif file.endswith(('.js', '.ts', '.py')):
                    backend_files.append(file_path)
                elif file in ['package.json', 'next.config.js', 'next.config.mjs', 'tsconfig.json', 'vercel.json', 'tailwind.config.js', 'tailwind.config.ts', '.env.example', '.env.local.example']:
                    config_files.append(file_path)
        
        print(f"   📂 Frontend: {len(frontend_files)}, Components: {len(component_files)}, APIs: {len(api_routes)}")
        
        self.analysis_results['codebase'] = {
            'frontend_files': [str(f) for f in frontend_files[:50]],
            'backend_files': [str(f) for f in backend_files[:50]],
            'component_files': [str(f) for f in component_files[:30]],
            'api_routes': [str(f) for f in api_routes[:20]],
            'config_files': [str(f) for f in config_files],
            'total_files': len(frontend_files) + len(backend_files)
        }
        
        # Create detailed analysis prompt for Gemini API
        prompt = f"""Based on the ThesisAI codebase, provide a detailed technical analysis.

## CODEBASE STATISTICS:
- Total Files: {len(frontend_files) + len(backend_files)}
- Frontend: {len(frontend_files)}
- Components: {len(component_files)}
- API Routes: {len(api_routes)}
- Config Files: {', '.join(str(f) for f in config_files)}

## ANALYSIS REQUIRED:

### 1. TECH STACK
- Framework & versions (Next.js, React)
- Build tools & deployment platform
- Styling approach
- State management

### 2. ARCHITECTURE
- App Router vs Pages Router
- Folder structure
- Component patterns
- API organization

### 3. AI INTEGRATION CHECK
⚠️ CRITICAL: Check if the app is using Gemini API directly. It SHOULD NOT.
- Look for: GEMINI_API_KEY, google/generative-ai imports
- Expected: OpenRouter API usage (OPENROUTER_API_KEY)
- The app should use OpenRouter API (sk-or-v1-...) for all user-facing AI features

### 4. THESISAI FEATURES
- Document handling (DOCX/PDF)
- Citation management
- Authentication
- File uploads

### 5. CODE QUALITY
- TypeScript usage
- Error handling
- Testing setup
- Performance patterns

### 6. ISSUES & RECOMMENDATIONS
- Security concerns
- Missing configs
- API key management issues
- Scalability concerns

Provide specific examples with file names and code snippets."""

        config_files_to_read = config_files[:5]
        print("   🤖 Analyzing with Gemini API (internal analysis)...")
        analysis = self.call_gemini_api(prompt, [str(f) for f in config_files_to_read])
        self.analysis_results['codebase_analysis'] = analysis
        
        print("✅ Codebase scan complete")
        return self.analysis_results['codebase']
    
    def check_api_usage(self) -> str:
        """Check if app is correctly using OpenRouter instead of Gemini API"""
        print("🔍 Checking API usage patterns...")
        
        # Search for API key references in code
        gemini_refs = []
        openrouter_refs = []
        
        search_patterns = {
            'gemini': ['GEMINI_API_KEY', 'google/generative-ai', '@google/generative-ai', 'gemini-pro'],
            'openrouter': ['OPENROUTER_API_KEY', 'openrouter.ai', 'sk-or-v1-']
        }
        
        for root, dirs, files in os.walk(self.project_path):
            dirs[:] = [d for d in dirs if d not in {'node_modules', '.git', '.next'}]
            
            for file in files:
                if file.endswith(('.js', '.ts', '.jsx', '.tsx', '.env.example', '.env.local.example')):
                    file_path = Path(root) / file
                    try:
                        content = self.read_file_content(file_path, max_lines=500)
                        
                        # Check for Gemini references
                        for pattern in search_patterns['gemini']:
                            if pattern in content:
                                gemini_refs.append((str(file_path.relative_to(self.project_path)), pattern))
                        
                        # Check for OpenRouter references
                        for pattern in search_patterns['openrouter']:
                            if pattern in content:
                                openrouter_refs.append((str(file_path.relative_to(self.project_path)), pattern))
                    except:
                        continue
        
        # Generate report using OpenRouter
        system_prompt = "You are a security expert analyzing API key usage in a web application."
        
        prompt = f"""Analyze the API usage in ThesisAI web application:

## FINDINGS:

### Gemini API References Found: {len(gemini_refs)}
{chr(10).join(f'- {file}: {pattern}' for file, pattern in gemini_refs[:10])}

### OpenRouter API References Found: {len(openrouter_refs)}
{chr(10).join(f'- {file}: {pattern}' for file, pattern in openrouter_refs[:10])}

## REQUIREMENTS:
- ThesisAI should use OpenRouter API (sk-or-v1-...) for all user-facing AI features
- Gemini API should ONLY be used in internal development tools (like this analysis agent)
- Production app should NOT expose Gemini API keys

## YOUR TASK:
1. Assess if the app is correctly using OpenRouter for production
2. Identify any security risks with API key exposure
3. Provide specific recommendations to fix any issues
4. Suggest environment variable setup

Be specific and actionable."""

        analysis = self.call_openrouter(prompt, system_prompt)
        self.analysis_results['api_usage_check'] = analysis
        
        print("✅ API usage check complete")
        return analysis
    
    def recommend_openrouter_integration(self) -> str:
        """Generate recommendations for OpenRouter integration"""
        print("💡 Generating OpenRouter integration recommendations...")
        
        system_prompt = "You are an expert in AI API integrations and Next.js applications."
        
        prompt = f"""Generate a comprehensive guide for integrating OpenRouter API into ThesisAI.

## CONTEXT:
- ThesisAI is an academic writing platform
- Currently may be using Gemini API (incorrect)
- Should use OpenRouter API: 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
- Model: {self.openrouter_model}

## PROVIDE:

### 1. Environment Variables Setup
Show exact .env.local configuration

### 2. API Integration Code
- Next.js API route example for AI text generation
- Client-side component for calling the API
- Error handling and retry logic
- Streaming response handling

### 3. Features to Implement with OpenRouter
- Thesis outline generation
- Chapter writing assistance
- Paraphrasing and synthesis
- Citation formatting
- Research question generation

### 4. Security Best Practices
- API key management
- Rate limiting
- Request validation
- Error messages (don't expose keys)

### 5. Cost Optimization
- Caching strategies
- Token usage monitoring
- Model selection per use case

### 6. Testing Approach
- Mock API responses
- Integration tests
- Error scenario testing

Provide complete, production-ready code examples."""

        recommendations = self.call_openrouter(prompt, system_prompt)
        self.analysis_results['openrouter_recommendations'] = recommendations
        
        print("✅ Recommendations generated")
        return recommendations
    
    def diagnose_issue(self, issue_description: str, feature: Optional[str] = None) -> str:
        """Diagnose issue using OpenRouter (production-ready diagnosis)"""
        print(f"🔧 Diagnosing: {issue_description}")
        
        if 'codebase' not in self.analysis_results:
            print("   Running codebase scan first...")
            self.scan_codebase()
        
        system_prompt = "You are a senior software engineer debugging production issues in a Next.js application."
        
        prompt = f"""Diagnose this ThesisAI production issue:

## ISSUE:
{issue_description}

## CONTEXT:
- App should use OpenRouter API: {self.openrouter_model}
- Total files: {self.analysis_results['codebase'].get('total_files')}
- Components: {len(self.analysis_results['codebase'].get('component_files', []))}
- API routes: {len(self.analysis_results['codebase'].get('api_routes', []))}

## DIAGNOSIS REQUIRED:

### 1. Root Cause
- What's causing this?
- Is it API-related? (Gemini vs OpenRouter misconfiguration?)

### 2. Impact
- Severity level
- Affected workflows
- Data integrity risks

### 3. Investigation Steps
Detailed debugging process

### 4. Solutions
- Immediate fix (code examples)
- Proper fix (architecture)
- Long-term prevention

### 5. Testing
- Verification steps
- Regression tests

Be specific with Next.js/React code examples."""

        diagnosis = self.call_openrouter(prompt, system_prompt)
        
        print("✅ Diagnosis complete")
        return diagnosis
    
    def generate_report(self, output_file: str = "thesis-ai-analysis.md"):
        """Generate comprehensive markdown report"""
        report = f"""# ThesisAI Deep Analysis Report
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

**Analysis Tool**: Gemini API (internal use only)
**Production API**: OpenRouter ({self.openrouter_model})

---

## 📊 Codebase Overview

"""
        
        codebase = self.analysis_results.get('codebase', {})
        if codebase:
            report += f"""### File Statistics
- **Total Files**: {codebase.get('total_files', 0)}
- **Components**: {len(codebase.get('component_files', []))}
- **API Routes**: {len(codebase.get('api_routes', []))}
- **Frontend Files**: {len(codebase.get('frontend_files', []))}
- **Backend Files**: {len(codebase.get('backend_files', []))}

### Configuration Files
{chr(10).join(f'- `{f}`' for f in codebase.get('config_files', []))}

"""
        
        analysis = self.analysis_results.get('codebase_analysis', 'No analysis performed')
        report += f"""---

## 🔍 Technical Analysis (via Gemini API)

{analysis}

"""
        
        if 'api_usage_check' in self.analysis_results:
            report += f"""---

## 🔑 API Usage Check (via OpenRouter)

{self.analysis_results['api_usage_check']}

"""
        
        if 'openrouter_recommendations' in self.analysis_results:
            report += f"""---

## 💡 OpenRouter Integration Guide

{self.analysis_results['openrouter_recommendations']}

"""
        
        report += f"""---

## 📝 Notes

- **Gemini API**: Used internally for code analysis only (this agent)
- **OpenRouter API**: Should be used for all production app features
- **API Key**: Never expose in client-side code or public repos

---

*Generated by ThesisAI Analysis Agent v2.0*
*Internal Analysis: Gemini API | Production Recommendations: OpenRouter*
"""
        
        report_path = self.project_path / output_file
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        # Save JSON
        json_path = self.project_path / "thesis-ai-analysis.json"
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(self.analysis_results, f, indent=2, ensure_ascii=False)
        
        print(f"\n📄 Reports saved:")
        print(f"   - Markdown: {report_path}")
        print(f"   - JSON: {json_path}")
        
        return str(report_path)


def main():
    parser = argparse.ArgumentParser(
        description="ThesisAI Analysis Agent - Gemini API for analysis, OpenRouter for production",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python thesis_ai_agent.py . scan
  python thesis_ai_agent.py . check-api
  python thesis_ai_agent.py . recommend-openrouter
  python thesis_ai_agent.py . diagnose "AI generation not working"

Environment Setup:
  export GEMINI_API_KEY=your-gemini-api-key
  export OPENROUTER_API_KEY=sk-or-v1-your-key
        """
    )
    
    parser.add_argument("project_path", help="Path to ThesisAI project")
    parser.add_argument("--openrouter-key", help="OpenRouter API key (or set OPENROUTER_API_KEY)")
    parser.add_argument("--gemini-api-key", help="Gemini API key (or set GEMINI_API_KEY)")
    parser.add_argument("--gemini-model", default="gemini-1.5-flash", help="Gemini model for analysis")
    parser.add_argument("--openrouter-model", default="deepseek/deepseek-chat", help="OpenRouter model")
    
    subparsers = parser.add_subparsers(dest="command", required=True, help="Command")
    
    subparsers.add_parser("scan", help="Scan codebase with Gemini API (internal)")
    subparsers.add_parser("check-api", help="Check API usage (Gemini vs OpenRouter)")
    subparsers.add_parser("recommend-openrouter", help="Generate OpenRouter integration guide")
    
    diagnose_parser = subparsers.add_parser("diagnose", help="Diagnose issue with OpenRouter")
    diagnose_parser.add_argument("issue", help="Issue description")
    
    args = parser.parse_args()
    
    # Get OpenRouter key
    openrouter_key = args.openrouter_key or os.environ.get('OPENROUTER_API_KEY')
    if not openrouter_key:
        openrouter_key = "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"
        print("⚠️  Using default OpenRouter API key")

    # Get Gemini API key
    gemini_api_key = args.gemini_api_key or os.environ.get('GEMINI_API_KEY')
    if not gemini_api_key:
        print("❌ Error: Gemini API key not found. Please set GEMINI_API_KEY environment variable or use --gemini-api-key.")
        sys.exit(1)
    
    print(f"\n{'='*80}")
    print("🎓 ThesisAI Analysis Agent")
    print("   Gemini API: Internal code analysis")
    print("   OpenRouter: Production recommendations")
    print(f"{'='*80}\n")
    
    agent = ThesisAIAgent(args.project_path, openrouter_key, gemini_api_key, args.gemini_model, args.openrouter_model)
    
    try:
        if args.command == "scan":
            agent.scan_codebase()
            print("\n" + "="*80)
            print("📋 ANALYSIS RESULTS")
            print("="*80)
            print(agent.analysis_results.get('codebase_analysis', 'No analysis'))
            
        elif args.command == "check-api":
            agent.check_api_usage()
            print("\n" + "="*80)
            print("🔑 API USAGE CHECK")
            print("="*80)
            print(agent.analysis_results.get('api_usage_check', 'No check performed'))
            
        elif args.command == "recommend-openrouter":
            agent.recommend_openrouter_integration()
            print("\n" + "="*80)
            print("💡 OPENROUTER INTEGRATION GUIDE")
            print("="*80)
            print(agent.analysis_results.get('openrouter_recommendations', 'No recommendations'))
            
        elif args.command == "diagnose":
            result = agent.diagnose_issue(args.issue)
            print("\n" + "="*80)
            print("🔧 DIAGNOSIS")
            print("="*80)
            print(result)
        
        agent.generate_report()
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Operation cancelled")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()