// Simple API connectivity test for OpenRouter integration

async function testOpenRouterAPI() {
  console.log("🧪 Testing OpenRouter API connectivity...\n");
  
  try {
    // Test basic API call
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "ThesisAI Verification Test"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { 
            role: "user", 
            content: "This is a test to verify OpenRouter API connectivity. Respond with exactly: 'API Test Successful - Real AI Response Confirmed'" 
          }
        ],
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ API connectivity test FAILED");
      console.log("   Status:", response.status);
      console.log("   Error:", errorText);
      return false;
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log("✅ API connectivity test PASSED");
    console.log("   Response:", content);
    
    if (content.includes("API Test Successful")) {
      console.log("\n🎉 OpenRouter API integration is working correctly!");
      console.log("\n📋 SUMMARY:");
      console.log("✅ API key authentication successful");
      console.log("✅ Model access granted");
      console.log("✅ Real AI responses being generated");
      console.log("✅ HTTP headers properly configured");
      console.log("\n💡 The Defense Preparation Suite can now provide genuine AI-powered assistance");
      console.log("   to students preparing for their research defenses.");
      return true;
    } else {
      console.log("\n❌ Unexpected response from API");
      return false;
    }
    
  } catch (error) {
    console.error("❌ API connectivity test FAILED:", error);
    return false;
  }
}

// Run the test
testOpenRouterAPI().then(success => {
  if (success) {
    console.log("\n✅ OPENROUTER API CONNECTIVITY VERIFICATION COMPLETED SUCCESSFULLY!");
  } else {
    console.log("\n💥 OPENROUTER API CONNECTIVITY VERIFICATION FAILED!");
    console.log("Please check your API key and network connectivity.");
  }
});