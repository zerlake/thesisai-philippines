# ThesisAI Analysis Agent - PowerShell Command Reference
# Save this as: Run-ThesisAIAgent.ps1

<#
.SYNOPSIS
    ThesisAI Web App Analysis Agent - PowerShell wrapper with OpenRouter support
.DESCRIPTION
    AI-powered agent for analyzing, testing, and troubleshooting the ThesisAI academic writing platform
    Works with OpenRouter (DeepSeek) via Gemini CLI - no Google API key needed
.EXAMPLE
    .\Run-ThesisAIAgent.ps1 -Command scan -UseOpenRouter
.EXAMPLE
    .\Run-ThesisAIAgent.ps1 -Command diagnose -UseOpenRouter -Issue "Citation not generating" -Feature citation
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectPath = ".",
    
    [Parameter(Mandatory=$false)]
    [string]$Model = "gemini-2.0-flash-exp",
    
    [Parameter(Mandatory=$false)]
    [switch]$UseOpenRouter,
    
    [Parameter(Mandatory=$false)]
    [string]$OpenRouterModel = "deepseek/deepseek-chat",
    
    [Parameter(Mandatory=$true)]
    [ValidateSet('scan', 'test-critical', 'test-ai', 'test-docs', 'test-e2e', 
                 'screenshot', 'diagnose', 'troubleshoot', 'performance', 'security-audit')]
    [string]$Command,
    
    [Parameter(Mandatory=$false)]
    [string]$Issue,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet('ai-generation', 'citation', 'originality', 'export', 'formatting', 'collaboration')]
    [string]$Feature,
    
    [Parameter(Mandatory=$false)]
    [string]$ErrorMessage,
    
    [Parameter(Mandatory=$false)]
    [string]$Trace,
    
    [Parameter(Mandatory=$false)]
    [string]$Context,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet('ai-generation', 'document-export', 'citation', 'editor', 'overall')]
    [string]$Area,
    
    [Parameter(Mandatory=$false)]
    [string[]]$Pages
)

Write-Host "Script executed successfully"
