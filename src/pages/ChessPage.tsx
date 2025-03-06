
import React from 'react';
import WebChess from '@/components/WebChess';
import NavHeader from '@/components/NavHeader';

const ChessPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-800 to-gray-900 text-white">
      <NavHeader />
      <main className="flex-1 py-4">
        <WebChess />
      </main>
      <footer className="py-4 text-center text-sm text-gray-400">
        <p>Chess Game - PyQt5 Web Version</p>
      </footer>
    </div>
  );
};

export default ChessPage;
