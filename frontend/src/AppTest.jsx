import React from 'react';

function AppTest() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-white mb-4">Basic Test Page</h1>
      <p className="text-gray-300 mb-4">If you can see this, React is working.</p>
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold text-white mb-2">Component Test</h2>
        <p className="text-gray-300">This is a simple test component to verify React rendering.</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
          Test Button
        </button>
      </div>
    </div>
  );
}

export default AppTest;
