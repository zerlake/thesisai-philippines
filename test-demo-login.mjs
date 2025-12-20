const testDemoLogin = async () => {
  const email = "demo-advisor@thesis.ai";
  const password = "demo123456";

  console.log(`Testing demo login for: ${email}`);

  try {
    const response = await fetch("http://localhost:3000/api/auth/demo-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const responseText = await response.text();
    
    console.log("Response status:", response.status);
    console.log("Response text:", responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log("Success! Session data:", {
        hasAccessToken: !!data.session?.access_token,
        hasRefreshToken: !!data.session?.refresh_token,
        userEmail: data.session?.user?.email,
      });
    } else {
      try {
        const data = JSON.parse(responseText);
        console.log("Error response:", data);
      } catch {
        console.log("Raw error response:", responseText);
      }
    }
  } catch (error) {
    console.error("Test error:", error);
  }
};

testDemoLogin();
