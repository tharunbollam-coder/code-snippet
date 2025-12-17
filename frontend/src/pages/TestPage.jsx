import React from 'react';

const TestPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Test Page</h1>
        <p className="text-gray-400">This is a test page to verify routing works.</p>
      </div>
      
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Component Test</h2>
        <p className="text-gray-300">If you can see this page, the routing is working correctly.</p>
      </div>
    </div>
  );
};

export default TestPage;
