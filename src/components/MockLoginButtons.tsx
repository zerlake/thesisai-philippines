import React from 'react';

export default function MockLoginButtons() {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold">Mock Login (For Development)</h3>
      <div className="flex flex-wrap gap-3 justify-center">
        <button 
          onClick={() => {
            const ev = new CustomEvent('mock-login', { detail: { role: 'student' } });
            window.dispatchEvent(ev);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Mock Student
        </button>
        <button 
          onClick={() => {
            const ev = new CustomEvent('mock-login', { detail: { role: 'advisor' } });
            window.dispatchEvent(ev);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          Mock Advisor
        </button>
        <button 
          onClick={() => {
            const ev = new CustomEvent('mock-login', { detail: { role: 'critic' } });
            window.dispatchEvent(ev);
          }}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
        >
          Mock Critic
        </button>
        <button 
          onClick={() => {
            const ev = new CustomEvent('mock-login', { detail: { role: 'admin' } });
            window.dispatchEvent(ev);
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Mock Admin
        </button>
      </div>
      <div className="pt-4 border-t w-full">
        <button 
          onClick={() => {
            const ev = new CustomEvent('real-login');
            window.dispatchEvent(ev);
          }}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors w-full"
        >
          Real Sign In
        </button>
      </div>
    </div>
  );
}