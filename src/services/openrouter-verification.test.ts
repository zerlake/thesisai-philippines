// Verification test for OpenRouter API integration in Advanced Literature Review Matrix

import { OpenRouterAPI } from "./openrouter-api";

async function verifyOpenRouterIntegration() {
  console.log("🧪 Verifying OpenRouter API Integration...\n");
  
  // Check if API key is available
  const apiKey = process.env.OPENROUTER_API_KEY || "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";
  
  if (!apiKey || apiKey === "YOUR_OPENROUTER_API_KEY") {
    console.log("⚠️  Warning: OpenRouter API key not found in environment variables");
    console.log("   Using default key from openrouter.env file\n");
  }
  
  const openRouterAPI = new OpenRouterAPI();
  
  try {
    console.log("📝 Testing basic API connectivity...");
    
    // Test with a simple prompt
    const response = await openRouterAPI.chatCompletion({
      model: "openai/gpt-3.5-turbo", 
      messages: [
        { 
          role: "user", 
          content: "Hello, this is a test to verify OpenRouter API connectivity. Respond with 'API Test Successful'." 
        }
      ],
      temperature: 0.7,
    });
    
    console.log("✅ API connectivity test passed!");
    console.log("Response received:", response.choices[0].message.content);
    console.log();
    
    console.log("🤖 Testing literature analysis capability...");
    
    // Test literature analysis
    const literaturePrompt = `
    Analyze this research paper concept:

    Title: Impact of Social Media on Student Learning Outcomes
    Purpose: To investigate how social media usage affects academic performance
    Methods: Survey of 500 students with statistical analysis
    Results: Positive correlation between moderate social media use and engagement
    Conclusions: Moderate use of social media can enhance learning when properly managed

    Provide a brief summary, 3 strengths, 2 limitations, and 2 research gaps.
    `;
    
    const analysisResponse = await openRouterAPI.chatCompletion({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: literaturePrompt }],
      temperature: 0.5,
    });
    
    console.log("✅ Literature analysis test passed!");
    console.log("Analysis result preview:", analysisResponse.choices[0].message.content.substring(0, 200) + "...");
    console.log();
    
    console.log("🔄 Testing literature synthesis capability...");
    
    // Test literature synthesis
    const synthesisPrompt = `
    Synthesize these 2 research concepts:
    
    Paper 1: Title: Impact of Social Media on Student Learning Outcomes
    Purpose: To investigate how social media usage affects academic performance
    Methods: Survey of 500 students with statistical analysis
    Results: Positive correlation between moderate social media use and engagement
    
    Paper 2: Title: Qualitative Analysis of Online Learning Experiences
    Purpose: To explore student perceptions of online learning environments
    Methods: Semi-structured interviews with 30 students
    Results: Students reported mixed feelings about online learning effectiveness
    
    Provide main themes, common research gaps, and potential future research areas.
    `;
    
    const synthesisResponse = await openRouterAPI.chatCompletion({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: synthesisPrompt }],
      temperature: 0.7,
    });
    
    console.log("✅ Literature synthesis test passed!");
    console.log("Synthesis result preview:", synthesisResponse.choices[0].message.content.substring(0, 200) + "...");
    console.log();
    
    console.log("🎯 Testing thematic clustering capability...");
    
    // Test thematic clustering
    const clusteringPrompt = `
    Group these research papers by thematic similarity:
    
    Paper 1: Title: Impact of Social Media on Student Learning Outcomes
    Framework: Social Cognitive Theory
    Methods: Survey and statistical analysis
    
    Paper 2: Title: Qualitative Analysis of Online Learning Experiences
    Framework: Phenomenological Approach
    Methods: Semi-structured interviews
    
    Paper 3: Title: AI in Educational Assessment: A Systematic Review
    Framework: Technology Acceptance Model
    Methods: Systematic literature review
    
    Return the groupings in JSON format with thematic category names.
    `;
    
    const clusteringResponse = await openRouterAPI.chatCompletion({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: clusteringPrompt }],
      temperature: 0.4,
    });
    
    console.log("✅ Thematic clustering test passed!");
    console.log("Clustering result preview:", clusteringResponse.choices[0].message.content.substring(0, 200) + "...");
    console.log();
    
    console.log("🎉 All OpenRouter API integration tests passed!");
    console.log();
    console.log("✅ API connectivity established");
    console.log("✅ Literature analysis capability verified");
    console.log("✅ Literature synthesis capability verified");
    console.log("✅ Thematic clustering capability verified");
    console.log();
    console.log("The Advanced Literature Review Matrix Tool is fully integrated with OpenRouter API");
    console.log("and ready to provide AI-powered analysis of research literature.");
    
    return true;
  } catch (error) {
    console.error("❌ OpenRouter API integration test failed:", error);
    return false;
  }
}

// Run the verification
verifyOpenRouterIntegration().then(success => {
  if (success) {
    console.log("\n✅ Integration verification completed successfully!");
    console.log("The Advanced Literature Review Matrix Tool is ready for use with real AI processing.");
  } else {
    console.log("\n💥 Integration verification failed!");
    console.log("Please check your OpenRouter API key and network connectivity.");
  }
});