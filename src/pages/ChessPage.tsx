
import React from 'react';
import WebChess from '@/components/WebChess';
import NavHeader from '@/components/NavHeader';

const ChessPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader />
      <main className="flex-1 py-8">
        <WebChess />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Chess Game - Web Version</p>
      </footer>
    </div>
  );
};

export default ChessPage;
