import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

function AppMinimal() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<div><h1 className="text-3xl font-bold text-white">Home Page</h1></div>} />
          <Route path="/test" element={<div><h1 className="text-3xl font-bold text-white">Test Page - This should be visible!</h1></div>} />
          <Route path="/create" element={<div><h1 className="text-3xl font-bold text-white">Create Snippet Page</h1></div>} />
          <Route path="/dashboard" element={<div><h1 className="text-3xl font-bold text-white">Dashboard Page</h1></div>} />
        </Routes>
      </main>
    </div>
  );
}

export default AppMinimal;
