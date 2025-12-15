# Security and Code Quality Scan

This repository includes a PowerShell script to help identify potential vulnerabilities and unused code in the codebase.

## Script Features

The `security-scan.ps1` script performs the following checks:

1. **Hardcoded Secrets Detection**: Scans for potential hardcoded passwords, API keys, tokens, etc.
2. **Common Security Vulnerabilities**: Looks for patterns like `eval()`, `innerHTML`, command injection patterns, etc.
3. **Unused Imports Detection**: Identifies potential unused imports in TypeScript/JavaScript files (basic pattern matching)
4. **ESLint Analysis**: Runs ESLint to find common code issues and style problems
5. **TypeScript Type Checking**: Performs TypeScript compilation to catch type errors
6. **Dependency Vulnerability Check**: Uses npm/pnpm audit to check for known vulnerabilities in dependencies

## Prerequisites

Before running the script, ensure you have the following installed:

- PowerShell (Windows) or PowerShell Core (cross-platform)
- Node.js and npm/pnpm/yarn
- TypeScript (if working with TypeScript files)

## How to Run

```powershell
# Navigate to your project directory
cd C:\Users\Projects\thesis-ai

# Run the security scan
.\security-scan.ps1

# Run with details (shows more verbose output)
.\security-scan.ps1 -ShowDetails
```

## Advanced Scanning Options

For more comprehensive security analysis, consider using these additional tools:

### SonarQube Scanner
```bash
# Install SonarScanner globally
npm install -g sonarqube-scanner

# Run SonarQube analysis
sonar-scanner -Dsonar.projectKey=thesis-ai -Dsonar.sources=.
```

### Snyk Security Scanner
```bash
# Install Snyk CLI
npm install -g snyk

# Test for vulnerabilities
snyk test

# Test code for issues
snyk code test
```

### CodeQL Analysis
If you have CodeQL CLI installed:
```bash
# Initialize CodeQL database
codeql database create thesis-ai-db --language=javascript --source-root=.

# Run queries
codeql database analyze thesis-ai-db --format=sarif --output=results.sarif codeql/javascript-queries
```

## Interpreting Results

- **Red text**: Critical issues that need immediate attention
- **Yellow text**: Warnings or items requiring review
- **Green text**: Clean or passing checks

## Limitations

This script provides basic static analysis:
- The unused import detection is basic and may have false positives
- Security detection relies on pattern matching and may miss context-dependent issues
- For comprehensive analysis, use dedicated tools like SonarQube, Snyk, or CodeQL
- Some security issues require runtime analysis or deeper semantic understanding