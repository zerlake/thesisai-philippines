const testDemoLogin = async (email) => {
  const password = "demo123456";

  console.log(`\nTesting: ${email}`);

  try {
    const response = await fetch("http://localhost:3000/api/auth/demo-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const responseText = await response.text();
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log(`  ✓ SUCCESS - Session created`);
    } else {
      try {
        const data = JSON.parse(responseText);
        console.log(`  ✗ FAILED (${response.status}): ${data.error}`);
      } catch {
        console.log(`  ✗ FAILED (${response.status}): ${responseText.substring(0, 100)}`);
      }
    }
  } catch (error) {
    console.error(`  ✗ ERROR: ${error.message}`);
  }
};

const runTests = async () => {
  const emails = [
    "demo-student@thesis.ai",
    "demo-advisor@thesis.ai",
    "demo-critic@thesis.ai",
    "demo-admin@thesis.ai",
  ];

  console.log("Testing all demo accounts...");
  for (const email of emails) {
    await testDemoLogin(email);
  }
};

runTests();
