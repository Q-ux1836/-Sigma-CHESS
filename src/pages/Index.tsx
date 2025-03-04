
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import NavHeader from '@/components/NavHeader';
import GameModeSelection from '@/components/GameModeSelection';
import { GameMode } from '@/lib/chessEngine';

const Index = () => {
  const [showGameModes, setShowGameModes] = useState(false);
  const navigate = useNavigate();
  
  const handleGameModeSelect = (mode: GameMode) => {
    // Store the selected game mode in localStorage or state management
    localStorage.setItem('selectedGameMode', mode);
    navigate('/game');
  };
  
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <NavHeader />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {!showGameModes ? (
          <div className="max-w-2xl w-full mx-auto text-center space-y-10 animate-slide-up-fade">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter">
                Tactical Chessplay
              </h1>
              <p className="text-lg text-muted-foreground max-w-prose mx-auto">
                Experience chess with a modern, minimalist design. Play against a friend, challenge the AI, or compete online.
              </p>
            </div>
            
            <div className="flex justify-center mt-8">
              <div className="chess-piece-preview animate-float w-40 h-40 relative">
                <img src="/lovable-uploads/9a763d59-7f80-45ab-9dcd-c9eff361b961.png" alt="Chess King" className="w-full h-full object-contain" />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="px-8 transition-all duration-300"
                onClick={() => setShowGameModes(true)}
              >
                Play Now
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 transition-all duration-300"
                onClick={() => navigate('/game')}
              >
                Quick Game
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="rounded-lg p-6 bg-card border border-border/50 transition-all hover:border-border duration-300">
                <h3 className="text-xl font-semibold mb-2">Play Locally</h3>
                <p className="text-muted-foreground">Challenge a friend on the same device with beautiful animations and intuitive controls.</p>
              </div>
              
              <div className="rounded-lg p-6 bg-card border border-border/50 transition-all hover:border-border duration-300">
                <h3 className="text-xl font-semibold mb-2">Challenge AI</h3>
                <p className="text-muted-foreground">Test your skills against the computer with adjustable difficulty levels.</p>
              </div>
              
              <div className="rounded-lg p-6 bg-card border border-border/50 transition-all hover:border-border duration-300">
                <h3 className="text-xl font-semibold mb-2">Online Play</h3>
                <p className="text-muted-foreground">Connect with players around the world for competitive matches.</p>
              </div>
            </div>
          </div>
        ) : (
          <GameModeSelection onSelectMode={handleGameModeSelect} />
        )}
      </main>
      
      <footer className="py-6 px-6 text-center text-sm text-muted-foreground animate-fade-in">
        <p>Designed with precision. Built with care.</p>
      </footer>
    </div>
  );
};

export default Index;
