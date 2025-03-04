
import React from 'react';
import { Button } from "@/components/ui/button";
import { GameMode } from '@/lib/chessEngine';
import { useNavigate } from 'react-router-dom';

interface GameModeSelectionProps {
  onSelectMode: (mode: GameMode) => void;
}

const GameModeSelection: React.FC<GameModeSelectionProps> = ({ onSelectMode }) => {
  const navigate = useNavigate();
  
  const handleModeSelect = (mode: GameMode) => {
    onSelectMode(mode);
    navigate('/game');
  };
  
  return (
    <div className="space-y-8 w-full max-w-md mx-auto animate-slide-up-fade">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-medium tracking-tight">Select Game Mode</h2>
        <p className="text-muted-foreground">Choose how you want to play chess</p>
      </div>
      
      <div className="grid gap-4">
        <Button 
          variant="outline" 
          className="h-24 relative overflow-hidden group border border-input hover:bg-muted/50 transition-all duration-300"
          onClick={() => handleModeSelect(GameMode.HUMAN_VS_HUMAN)}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          <div className="space-y-1 text-left">
            <h3 className="font-medium">Player vs Player</h3>
            <p className="text-sm text-muted-foreground">Play against a friend on the same device</p>
          </div>
        </Button>
        
        <Button 
          variant="outline"
          className="h-24 relative overflow-hidden group border border-input hover:bg-muted/50 transition-all duration-300"
          onClick={() => handleModeSelect(GameMode.HUMAN_VS_AI)}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          <div className="space-y-1 text-left">
            <h3 className="font-medium">Player vs AI</h3>
            <p className="text-sm text-muted-foreground">Challenge the computer</p>
          </div>
        </Button>
        
        <Button 
          variant="outline"
          className="h-24 relative overflow-hidden group border border-input hover:bg-muted/50 transition-all duration-300"
          onClick={() => handleModeSelect(GameMode.MULTIPLAYER)}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          <div className="space-y-1 text-left">
            <h3 className="font-medium">Online Multiplayer</h3>
            <p className="text-sm text-muted-foreground">Play against others online</p>
          </div>
        </Button>
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>Carefully crafted with attention to detail</p>
      </div>
    </div>
  );
};

export default GameModeSelection;
