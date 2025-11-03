#!/usr/bin/env python3
"""
ThesisAI Web App Analysis Agent
AI-powered agent for analyzing, testing, and troubleshooting the ThesisAI academic writing platform
Integrates with Gemini CLI for intelligent code analysis
"""

import os
import subprocess
import json
import sys
from pathlib import Path
from typing import Dict, List, Optional
import argparse
from datetime import datetime

class ThesisAIAgent:
    """AI Agent specialized for ThesisAI web application"""
    
    def __init__(self, project_path: str, gemini_model: str = "gemini-2.0-flash-exp", 
                 use_openrouter: bool = True, openrouter_model: str = "deepseek/deepseek-chat"):
        self.project_path = Path(project_path)
        self.gemini_model = gemini_model
        self.use_openrouter = use_openrouter
        self.openrouter_model = openrouter_model
        self.analysis_results = {}
        self.app_context = {
            "name": "ThesisAI Philippines",
            "type": "Academic Writing Platform",
            "key_features": [
                "AI writing and research suite",
                "University-specific formatting",
                "Methodology and data tools",
                "Citation management",
                "Originality checker",
                "Advisor collaboration",
                "Defense preparation tools"
            ],
            "tech_stack_hints": ["Next.js/React", "Vercel deployment", "AI integration"],
            "critical_areas": [
                "AI text generation",
                "Document formatting",
                "Citation management",
                "Plagiarism detection",
                "User authentication",
                "File upload/export (DOCX, PDF)",
                "Real-time collaboration"
            ]
        }
        
    def run_gemini_command(self, prompt: str, files: Optional[List[str]] = None) -> str:
        """Execute Gemini CLI command with context-aware prompts"""
        cmd = ["C:\\Users\\ADMIN\\AppData\\Roaming\\npm\\gemini.cmd", "chat", "-m", self.gemini_model, "--output-format", "json"]
        
        # Add app context to prompt
        context_prompt = f"""You are analyzing ThesisAI, an AI-powered academic writing assistant for Philippine universities.

Key Features: AI writing suite, university formatting, citation management, originality checking, advisor collaboration, defense preparation.

Critical Areas: AI text generation, document formatting, plagiarism detection, file handling (DOCX/PDF), user auth, real-time updates.

{prompt}"""

        # Add files if provided
        if files:
            for file in files:
                file_path = self.project_path / file
                if file_path.exists():
                    context_prompt += f" @{str(file_path)}"
        
        cmd.append(context_prompt)
        
        output_file = self.project_path / "gemini_output.log"
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                result = subprocess.run(
                    cmd,
                    stdout=f,
                    stderr=subprocess.PIPE,
                    text=True,
                    cwd=str(self.project_path)
                )
            
            if result.returncode != 0:
                return f"Error: {result.stderr}"

            with open(output_file, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            return "Error: Gemini CLI not found. Please install: npm install -g @google/generative-ai-cli"
        except Exception as e:
            return f"Error running Gemini: {str(e)}"
        finally:
            if os.path.exists(output_file):
                os.remove(output_file)
    
    def scan_codebase(self) -> Dict:
        """Scan ThesisAI codebase structure"""
        print("🔍 Scanning ThesisAI codebase...")
        
        # Find all relevant files
        frontend_files = []
        backend_files = []
        config_files = []
        component_files = []
        api_routes = []
        
        patterns = {
            'frontend': ['.jsx', '.tsx', '.css', '.scss'],
            'backend': ['.js', '.ts', '.py'],
            'config': ['package.json', 'next.config.js', 'tsconfig.json', '.env.example', 
                      'vercel.json', 'tailwind.config.js'],
            'components': ['components/', 'src/components/'],
            'api': ['api/', 'pages/api/', 'app/api/']
        }
        
        for root, dirs, files in os.walk(self.project_path):
            # Skip irrelevant directories
            dirs[:] = [d for d in dirs if d not in [
                'node_modules', '.git', 'dist', 'build', '.next', 
                '__pycache__', 'venv', '.vercel'
            ]]
            
            rel_root = Path(root).relative_to(self.project_path)
            
            for file in files:
                file_path = rel_root / file
                
                # Categorize files
                if any(str(file_path).startswith(comp) for comp in patterns['components']):
                    component_files.append(str(file_path))
                elif any(str(file_path).startswith(api) for api in patterns['api']):
                    api_routes.append(str(file_path))
                elif any(file.endswith(ext) for ext in patterns['frontend']):
                    frontend_files.append(str(file_path))
                elif any(file.endswith(ext) for ext in patterns['backend']):
                    backend_files.append(str(file_path))
                elif file in patterns['config']:
                    config_files.append(str(file_path))
        
        self.analysis_results['codebase'] = {
            'frontend_files': frontend_files[:50],  # Limit for analysis
            'backend_files': backend_files[:50],
            'component_files': component_files[:30],
            'api_routes': api_routes[:20],
            'config_files': config_files,
            'total_files': len(frontend_files) + len(backend_files)
        }
        
        # Analyze with Gemini
        prompt = f"""Analyze the ThesisAI codebase structure:

Frontend files: {len(frontend_files)}
Backend files: {len(backend_files)}
Components: {len(component_files)}
API routes: {len(api_routes)}

Config files found: {', '.join(config_files)}

Please provide:
1. Exact tech stack (framework, libraries, hosting)
2. Project architecture (Pages Router vs App Router, state management)"""
        
        analysis = self.run_gemini_command(prompt, config_files[:5])
        self.analysis_results['codebase_analysis'] = analysis
        
        print(f"✅ Found {len(frontend_files)} frontend files, {len(component_files)} components, {len(api_routes)} API routes")
        return self.analysis_results['codebase']
    
    def test_critical_features(self) -> str:
        """Generate tests for ThesisAI critical features"""
        print("🧪 Generating tests for critical ThesisAI features...")
        
        prompt = """Create comprehensive test suites for ThesisAI's critical features:

1. AI Text Generation Tests:
   - Test thesis outline generation
   - Test chapter drafting with AI
   - Test paraphrasing and synthesis
   - Mock OpenAI/Gemini API responses
   - Handle rate limits and errors

2. Citation Management Tests:
   - Test citation generation (APA, MLA, Chicago)
   - Test bibliography management
   - Test in-text citation insertion
   - Validate citation formats

3. Originality Checker Tests:
   - Test plagiarism detection
   - Mock similarity checking API
   - Test report generation
   - Handle edge cases (empty text, long documents)

4. Document Export Tests:
   - Test DOCX generation with formatting
   - Test PDF export with university templates
   - Test chapter numbering and TOC
   - Validate file integrity

5. User Authentication Tests:
   - Test login/signup flows
   - Test referral code system
   - Test subscription management
   - Test session handling

Generate complete test files with mocks, assertions, and edge cases."""
        
        # Get relevant files for context
        test_files = self.analysis_results.get('codebase', {}).get('api_routes', [])[:5]
        test_files.extend(self.analysis_results.get('codebase', {}).get('component_files', [])[:5])
        
        test_suite = self.run_gemini_command(prompt, test_files)
        
        # Save test suite
        test_dir = self.project_path / "tests" / "critical-features"
        test_dir.mkdir(parents=True, exist_ok=True)
        self._save_file(test_dir / "thesis-ai-critical.test.tsx", test_suite)
        
        print("✅ Critical feature tests generated")
        return test_suite
    
    def test_ai_integration(self) -> str:
        """Generate tests for AI service integration"""
        print("🤖 Creating AI integration tests...")
        
        prompt = """Create integration tests for ThesisAI's AI features:

Focus on:
1. OpenAI/Gemini API integration
   - Test prompt engineering for thesis writing
   - Test streaming responses
   - Test error handling (rate limits, API failures)
   - Mock API responses realistically

2. Context management
   - Test maintaining thesis context across requests
   - Test chapter continuity
   - Test reference tracking

3. Quality assurance
   - Test academic tone validation
   - Test output length constraints
   - Test citation accuracy in AI-generated text

4. Performance
   - Test concurrent AI requests
   - Test caching strategies
   - Test timeout handling

Include setup, teardown, and realistic test data for thesis writing scenarios."""
        
        api_files = self.analysis_results.get('codebase', {}).get('api_routes', [])
        ai_files = [f for f in api_files if any(keyword in str(f).lower() for keyword in ['ai', 'generate', 'openai', 'gemini'])]
        
        integration_tests = self.run_gemini_command(prompt, ai_files[:5])
        
        test_dir = self.project_path / "tests" / "integration"
        test_dir.mkdir(parents=True, exist_ok=True)
        self._save_file(test_dir / "ai-integration.test.ts", integration_tests)
        
        print("✅ AI integration tests created")
        return integration_tests
    
    def test_document_handling(self) -> str:
        """Generate tests for document processing"""
        print("📄 Creating document handling tests...")
        
        prompt = """Create comprehensive tests for ThesisAI's document handling:

1. DOCX Generation:
   - Test 5-chapter thesis structure
   - Test university-specific formatting (margins, fonts, spacing)
   - Test table of contents generation
   - Test page numbering (Roman + Arabic)
   - Test headers/footers
   - Test image and table insertion

2. PDF Export:
   - Test PDF conversion quality
   - Test formatting preservation
   - Test hyperlinks and bookmarks
   - Test file size optimization

3. File Upload:
   - Test CSV/Excel data upload for analysis
   - Test image upload for figures
   - Test file type validation
   - Test virus scanning integration
   - Test file size limits

4. Citation Formatting:
   - Test inline citation insertion
   - Test reference list generation
   - Test multiple citation styles

Generate tests with sample thesis documents and expected outputs."""
        
        doc_files = [f for f in self.analysis_results.get('codebase', {}).get('api_routes', []) 
                     if any(keyword in str(f).lower() for keyword in ['export', 'upload', 'document', 'file'])]
        
        doc_tests = self.run_gemini_command(prompt, doc_files[:5])
        
        test_dir = self.project_path / "tests" / "document-handling"
        test_dir.mkdir(parents=True, exist_ok=True)
        self._save_file(test_dir / "document.test.ts", doc_tests)
        
        print("✅ Document handling tests created")
        return doc_tests
    
    def create_e2e_tests(self) -> str:
        """Generate end-to-end user journey tests"""
        print("🎯 Creating E2E tests for user journeys...")
        
        prompt = """Create E2E tests for complete ThesisAI user journeys using Playwright or Cypress:

Journey 1: New User Onboarding
- Sign up with email
- Enter thesis topic
- Generate outline
- Navigate through chapters
- Export first draft

Journey 2: Research & Citation
- Add research sources
- Generate citations
- Use AI synthesis tool
- Create bibliography
- Check for plagiarism

Journey 3: Advisor Collaboration
- Submit draft to advisor
- Receive feedback
- Track revisions
- Re-submit updated version

Journey 4: Defense Preparation
- Generate presentation slides
- Practice with AI Q&A simulator
- Create flashcards
- Export final thesis

Journey 5: Referral System
- Share referral code
- Track referral credits
- Apply credits to subscription

Include:
- Page object models
- Realistic test data
- Screenshot capture
- Error handling
- Mobile responsiveness tests"""
        
        e2e_tests = self.run_gemini_command(prompt)
        
        test_dir = self.project_path / "tests" / "e2e"
        test_dir.mkdir(parents=True, exist_ok=True)
        self._save_file(test_dir / "user-journeys.spec.ts", e2e_tests)
        
        print("✅ E2E tests created")
        return e2e_tests
    
    def screenshot_testing(self, pages: Optional[List[str]] = None) -> str:
        """Generate visual regression tests"""
        print("📸 Creating visual regression tests...")
        
        default_pages = [
            "homepage",
            "dashboard",
            "thesis-editor",
            "citation-manager",
            "originality-checker",
            "defense-simulator"
        ]
        
        test_pages = pages or default_pages
        
        prompt = f"""Create visual regression tests for ThesisAI pages: {', '.join(test_pages)}

Requirements:
1. Use Playwright for screenshots
2. Test multiple viewports:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)
3. Test states:
   - Empty state
   - Loading state
   - Content-filled state
   - Error state
4. Test interactions:
   - Hover effects
   - Modal dialogs
   - Dropdown menus
   - Form validation
5. Compare against baseline images
6. Generate diff reports for failures

For academic UI:
- Check typography and spacing
- Verify citation formatting display
- Test document preview rendering
- Validate button states and feedback

Generate complete Playwright test suite."""
        
        screenshot_tests = self.run_gemini_command(prompt)
        
        test_dir = self.project_path / "tests" / "visual"
        test_dir.mkdir(parents=True, exist_ok=True)
        self._save_file(test_dir / "visual-regression.spec.ts", screenshot_tests)
        
        print("✅ Visual regression tests created")
        return screenshot_tests
    
    def diagnose_thesis_feature(self, feature: str, issue: str) -> str:
        """Diagnose issues in thesis-specific features"""
        print(f"🔧 Diagnosing {feature} issue...")
        
        feature_files = {
            "ai-generation": ["api/generate", "api/ai", "hooks/useAI"],
            "citation": ["api/citation", "components/Citation", "utils/citation"],
            "originality": ["api/plagiarism", "api/check", "components/Originality"],
            "export": ["api/export", "utils/docx", "utils/pdf"],
            "formatting": ["utils/format", "styles/", "components/Editor"],
            "collaboration": ["api/advisor", "api/feedback", "components/Collaboration"]
        }
        
        relevant_files = []
        for key, patterns in feature_files.items():
            if key in feature.lower():
                all_files = (self.analysis_results.get('codebase', {}).get('api_routes', []) + 
                           self.analysis_results.get('codebase', {}).get('component_files', []))
                relevant_files = [f for f in all_files if any(p in str(f) for p in patterns)]
                break
        
        prompt = f"""Diagnose this ThesisAI issue:

Feature: {feature}
Issue: {issue}

Provide:
1. Root cause analysis (considering academic writing requirements)
2. Impact assessment (user experience, data integrity, compliance)
3. Step-by-step debugging approach
4. Specific code fixes with examples
5. Test cases to prevent regression
6. User communication recommendations

Consider:
- Academic integrity requirements
- Document formatting standards
- AI service reliability
- Data privacy and security"""
        
        diagnosis = self.run_gemini_command(prompt, relevant_files[:5])
        
        print("✅ Diagnosis complete")
        return diagnosis
    
    def troubleshoot_error(self, error_msg: str, stack_trace: Optional[str] = None, 
                          context: Optional[str] = None) -> str:
        """Troubleshoot specific errors with ThesisAI context"""
        print("🐛 Troubleshooting error...")
        
        prompt = f"""Troubleshoot this ThesisAI error:

Error: {error_msg}
{f'Stack Trace:\n{stack_trace}' if stack_trace else ''}
{f'Context: {context}' if context else ''}

Analyze:
1. What caused this error? (Check: API limits, file handling, auth, database)
2. Which component/API route is the source?
3. How does this affect users? (Can they continue? Data loss risk?)
4. Immediate fix (code examples)
5. Long-term solution (architecture improvements)
6. Monitoring/alerting recommendations
7. User-facing error message

Common ThesisAI error patterns:
- AI API rate limits or failures
- Document export corruption
- Citation parsing errors
- File upload size/type issues
- Session timeout during long operations
- Referral code validation errors"""
        
        # Extract files from stack trace
        files = []
        if stack_trace:
            files = self._extract_files_from_trace(stack_trace)
        
        solution = self.run_gemini_command(prompt, files[:5])
        
        # Log error for tracking
        self._log_error(error_msg, solution)
        
        print("✅ Solution provided")
        return solution
    
    def analyze_performance(self, area: Optional[str] = None) -> str:
        """Analyze performance for ThesisAI"""
        print("⚡ Analyzing ThesisAI performance...")
        
        areas = {
            "ai-generation": "AI text generation and streaming",
            "document-export": "DOCX/PDF export and large file handling",
            "citation": "Citation lookup and formatting",
            "editor": "Real-time editor and autosave",
            "overall": "Overall application performance"
        }
        
        focus_area = areas.get(area, areas["overall"])
        
        prompt = f"""Analyze performance for ThesisAI - Focus: {focus_area}

Identify bottlenecks in:
1. AI Integration:
   - API call latency
   - Streaming optimization
   - Concurrent request handling
   - Token usage efficiency

2. Document Processing:
   - Large file export (100+ pages)
   - Image optimization in documents
   - Format conversion speed
   - Memory usage during export

3. Frontend Performance:
   - Initial load time
   - Editor lag with long documents
   - Citation insertion speed
   - Client-side rendering optimization

4. Database Queries:
   - User data loading
   - Citation library queries
   - Draft auto-save frequency
   - Referral code lookups

5. Caching Strategies:
   - API response caching
   - Generated content caching
   - Citation data caching
   - Static asset optimization

Provide:
- Specific performance metrics to track
- Code optimization examples
- Infrastructure recommendations
- Cost optimization tips (Vercel, AI APIs)"""
        
        perf_files = (self.analysis_results.get('codebase', {}).get('api_routes', [])[:10] +
                     self.analysis_results.get('codebase', {}).get('component_files', [])[:10])
        
        analysis = self.run_gemini_command(prompt, perf_files)
        
        print("✅ Performance analysis complete")
        return analysis
    
    def security_audit(self) -> str:
        """Perform security audit for ThesisAI"""
        print("🔒 Conducting security audit...")
        
        prompt = """Perform comprehensive security audit for ThesisAI:

Critical Security Areas:
1. Authentication & Authorization:
   - JWT implementation
   - Password handling
   - Session management
   - Role-based access (student, advisor, admin)

2. API Security:
   - API key storage and rotation
   - Rate limiting
   - Input validation
   - SQL injection prevention

3. File Upload Security:
   - File type validation
   - Virus scanning
   - Size limits
   - Path traversal prevention
   - Secure storage

4. Data Privacy:
   - Thesis content encryption
   - PII handling (student data)
   - GDPR compliance considerations
   - Data retention policies

5. Academic Integrity:
   - Originality check data handling
   - Citation verification
   - Version control for submissions
   - Audit trail for advisor feedback

6. Third-party Integration:
   - AI API key security
   - Payment processing (subscription)
   - Email service security
   - CDN security

Provide:
- Vulnerability assessment
- Priority-ranked fixes
- Security best practices
- Compliance checklist
- Monitoring recommendations"""
        
        security_files = (self.analysis_results.get('codebase', {}).get('api_routes', []) +
                         self.analysis_results.get('codebase', {}).get('config_files', []))
        
        audit = self.run_gemini_command(prompt, security_files[:10])
        
        # Save audit report
        report_dir = self.project_path / "security-audit"
        report_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self._save_file(report_dir / f"audit_{timestamp}.md", audit)
        
        print("✅ Security audit complete")
        return audit
    
    def _save_file(self, file_path: Path, content: str):
        """Save content to file, extracting code from markdown if present"""
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Extract code from markdown blocks
        if "```" in content:
            lines = content.split("\n")
            code_lines = []
            in_code = False
            for line in lines:
                if line.strip().startswith("```"):
                    in_code = not in_code
                    continue
                if in_code:
                    code_lines.append(line)
            if code_lines:
                content = "\n".join(code_lines)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
    
    def _extract_files_from_trace(self, stack_trace: str) -> List[str]:
        """Extract file paths from stack trace"""
        files = []
        for line in stack_trace.split("\n"):
            if any(ext in line for ext in ['.js', '.ts', '.tsx', '.jsx']):
                # Extract file path
                parts = line.split()
                for part in parts:
                    if any(ext in part for ext in ['.js', '.ts', '.tsx', '.jsx']):
                        file_path = part.split(':')[0].strip('()')
                        if file_path:
                            files.append(file_path)
        return list(set(files))[:5]
    
    def _log_error(self, error: str, solution: str):
        """Log errors and solutions for tracking"""
        log_dir = self.project_path / "logs"
        log_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"\n{'='*80}\n[{timestamp}]\nError: {error}\n\nSolution:\n{solution}\n"
        
        with open(log_dir / "error_log.txt", 'a', encoding='utf-8') as f:
            f.write(log_entry)
    
    def generate_report(self, output_file: str = "thesis-ai-analysis.json"):
        """Generate comprehensive analysis report"""
        self.analysis_results['timestamp'] = datetime.now().isoformat()
        self.analysis_results['app_context'] = self.app_context
        
        report_path = self.project_path / output_file
        
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(self.analysis_results, f, indent=2, ensure_ascii=False)
        
        print(f"📄 Analysis report saved: {report_path}")
        
        # Generate human-readable markdown report
        md_report = self._generate_markdown_report()
        md_path = self.project_path / "thesis-ai-analysis.md"
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(md_report)
        
        print(f"📄 Markdown report saved: {md_path}")
        return str(report_path)
    
    def _generate_markdown_report(self) -> str:
        """Generate markdown version of analysis report"""
        report = f"# ThesisAI Analysis Report
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## Application Overview
- **Name**: {self.app_context['name']}
- **Type**: {self.app_context['type']}
- **Deployment**: {self.app_context['tech_stack_hints'][1]}

## Key Features
{chr(10).join(f'- {feature}' for feature in self.app_context['key_features'])}

## Codebase Summary
"
        codebase = self.analysis_results.get('codebase', {})
        if codebase:
            report += f"- **Total Files**: {codebase.get('total_files', 0)}
- **Components**: {len(codebase.get('component_files', []))}
- **API Routes**: {len(codebase.get('api_routes', []))}
- **Frontend Files**: {len(codebase.get('frontend_files', []))}
- **Backend Files**: {len(codebase.get('backend_files', []))}

"
        
        report += f"## Analysis Results
{self.analysis_results.get('codebase_analysis', 'No analysis performed yet')}

---
*Generated by ThesisAI Analysis Agent*"
        return report


def main():
    parser = argparse.ArgumentParser(
        description="ThesisAI Web App Analysis Agent - AI-powered testing and troubleshooting",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python thesis_ai_agent.py /path/to/thesis-ai scan
  python thesis_ai_agent.py /path/to/thesis-ai test-critical
  python thesis_ai_agent.py /path/to/thesis-ai diagnose "AI generation not working" --feature ai-generation
  python thesis_ai_agent.py /path/to/thesis-ai security-audit
        """
    )
    
    parser.add_argument("project_path", help="Path to ThesisAI project")
    parser.add_argument("--model", default="gemini-2.0-flash-exp", help="Gemini model to use")
    
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Scan command
    subparsers.add_parser("scan", help="Scan and analyze codebase")
    
    # Test commands
    subparsers.add_parser("test-critical", help="Generate tests for critical features")
    subparsers.add_parser("test-ai", help="Generate AI integration tests")
    subparsers.add_parser("test-docs", help="Generate document handling tests")
    subparsers.add_parser("test-e2e", help="Generate E2E user journey tests")
    
    screenshot_parser = subparsers.add_parser("screenshot", help="Generate visual regression tests")
    screenshot_parser.add_argument("--pages", nargs="*", help="Specific pages to test")
    
    # Diagnose command
    diagnose_parser = subparsers.add_parser("diagnose", help="Diagnose feature issue")
    diagnose_parser.add_argument("issue", help="Issue description")
    diagnose_parser.add_argument("--feature", required=True, 
                                choices=["ai-generation", "citation", "originality", "export", 
                                        "formatting", "collaboration"],
                                help="Feature area")
    
    # Troubleshoot command
    troubleshoot_parser = subparsers.add_parser("troubleshoot", help="Troubleshoot error")
    troubleshoot_parser.add_argument("error", help="Error message")
    troubleshoot_parser.add_argument("--trace", help="Stack trace file or text")
    troubleshoot_parser.add_argument("--context", help="Additional context")
    
    # Performance command
    perf_parser = subparsers.add_parser("performance", help="Analyze performance")
    perf_parser.add_argument("--area", choices=["ai-generation", "document-export", 
                                                "citation", "editor", "overall"],
                            help="Specific area to analyze")
    
    # Security audit command
    subparsers.add_parser("security-audit", help="Perform security audit")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # Initialize agent
    agent = ThesisAIAgent(args.project_path, args.model)
    
    # Execute command
    try:
        if args.command == "scan":
            agent.scan_codebase()
            print("\n" + "="*80)
            print(agent.analysis_results.get('codebase_analysis', ''))
            
        elif args.command == "test-critical":
            result = agent.test_critical_features()
            print("\n" + result)
            
        elif args.command == "test-ai":
            result = agent.test_ai_integration()
            print("\n" + result)
            
        elif args.command == "test-docs":
            result = agent.test_document_handling()
            print("\n" + result)
            
        elif args.command == "test-e2e":
            result = agent.create_e2e_tests()
            print("\n" + result)
            
        elif args.command == "screenshot":
            result = agent.screenshot_testing(args.pages)
            print("\n" + result)
            
        elif args.command == "diagnose":
            result = agent.diagnose_thesis_feature(args.feature, args.issue)
            print("\n" + result)
            
        elif args.command == "troubleshoot":
            stack_trace = None
            if args.trace:
                if os.path.isfile(args.trace):
                    with open(args.trace) as f:
                        stack_trace = f.read()
                else:
                    stack_trace = args.trace
            result = agent.troubleshoot_error(args.error, stack_trace, args.context)
            print("\n" + result)
            
        elif args.command == "performance":
            result = agent.analyze_performance(args.area)
            print("\n" + result)
            
        elif args.command == "security-audit":
            result = agent.security_audit()
            print("\n" + result)
        
        # Generate report for all commands
        agent.generate_report()
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Operation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
