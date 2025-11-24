const puter = require('@heyputer/puter.js');

async function main() {
  try {
    const result = await puter.ai.chat({
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant.' },
        { role: 'user', content: 'Hello, who are you?' }
      ]
    });
    console.log('Puter AI result:', result.choices?.[0]?.message?.content);
  } catch (err) {
    console.error('Puter error:', err);
  }
}

main();
