'use client';

import { useState } from 'react';
import { callPuterAIWithSDKCheck } from '@/lib/puter-sdk-loader';

export default function PuterTestPage() {
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleTestPuter = async () => {
    try {
      const response = await callPuterAIWithSDKCheck('Hello, world!');
      setResult(JSON.stringify(response, null, 2));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Puter SDK Test Page</h1>
      <button onClick={handleTestPuter}>Test Puter AI</button>
      <h2>Result:</h2>
      <pre>{result}</pre>
      <h2>Error:</h2>
      <pre>{error}</pre>
    </div>
  );
}
