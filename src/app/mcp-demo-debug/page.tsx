/**
 * MCP Demo Debug Page
 * Simplified version to test if pages load
 */

'use client';

export default function MCPDemoDebugPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-4 text-slate-900">MCP Demo - Debug Mode</h1>
          <p className="text-slate-600 mb-8">
            This is a simplified version to test if the page loads.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h2 className="font-bold text-blue-900 mb-2">Status</h2>
            <p className="text-blue-800">Page is loading successfully!</p>
            <p className="text-sm text-blue-700 mt-2">
              If you see this message, the routing and page structure are working.
            </p>
          </div>
          <div className="mt-8">
            <h3 className="font-bold text-slate-900 mb-4">Next Steps:</h3>
            <ul className="space-y-2 text-slate-700">
              <li>✓ Page routing is working</li>
              <li>✓ Layout is rendering correctly</li>
              <li>? Check browser console for any errors</li>
              <li>? Verify Serena MCP Server is running if you want to use MCP features</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
