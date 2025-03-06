
import React from 'react';
import WebChess from '@/components/WebChess';
import NavHeader from '@/components/NavHeader';

const ChessPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-800 to-gray-900 text-white">
      <NavHeader title="𝝨 CHESS" />
      <main className="flex-1 py-4">
        <WebChess />
      </main>
      <footer className="py-4 text-center text-sm text-gray-400">
        <p>𝝨 CHESS - Web Version</p>
      </footer>
    </div>
  );
};

export default ChessPage;
