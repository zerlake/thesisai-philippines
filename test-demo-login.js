async function testDemoLogin() {
  const accounts = [
    { name: 'Student', email: 'demo-student@thesis.ai', password: 'demo123456' },
    { name: 'Advisor', email: 'demo-advisor@thesis.ai', password: 'demo123456' },
    { name: 'Critic', email: 'demo-critic@thesis.ai', password: 'demo123456' },
    { name: 'Admin', email: 'demo-admin@thesis.ai', password: 'demo123456' },
  ];

  for (const account of accounts) {
    try {
      console.log(`\nTesting ${account.name}...`);
      const response = await fetch('http://localhost:3000/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: account.email,
          password: account.password,
        }),
      });

      console.log(`Status: ${response.status}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${account.name} login successful`);
        console.log(`User ID: ${data.session?.user?.id}`);
      } else {
        console.log(`❌ ${account.name} login failed`);
        console.log(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(`Error testing ${account.name}:`, error.message);
    }
  }
}

testDemoLogin();
