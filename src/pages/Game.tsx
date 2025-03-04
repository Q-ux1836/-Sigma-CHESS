
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavHeader from '@/components/NavHeader';
import ChessBoard from '@/components/ChessBoard';
import { Button } from '@/components/ui/button';
import { 
  initializeGame, GameState, GameMode, 
  PieceColor, makeAIMove 
} from '@/lib/chessEngine';
import { ArrowLeftRight, RefreshCw, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const Game = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize game
  useEffect(() => {
    const storedGameMode = localStorage.getItem('selectedGameMode') as GameMode || GameMode.HUMAN_VS_HUMAN;
    setGameState(initializeGame(storedGameMode));
    setIsLoading(false);
    
    toast.success(`Game started in ${formatGameMode(storedGameMode)} mode`);
  }, []);

  // Format game mode for display
  const formatGameMode = (mode: GameMode): string => {
    switch (mode) {
      case GameMode.HUMAN_VS_HUMAN:
        return 'Player vs Player';
      case GameMode.HUMAN_VS_AI:
        return 'Player vs AI';
      case GameMode.MULTIPLAYER:
        return 'Online Multiplayer';
      default:
        return 'Unknown';
    }
  };

  // Handle game state changes
  const handleGameStateChange = (newGameState: GameState) => {
    setGameState(newGameState);
  };

  // Reset the game
  const handleResetGame = () => {
    if (!gameState) return;
    
    setGameState(initializeGame(gameState.gameMode));
    toast.info('Game has been reset');
  };

  // Switch sides (flip the board)
  const handleSwitchSides = () => {
    // This would involve a more complex state change in a real implementation
    toast.info('Switching sides is not implemented in this demo');
  };

  // Return to home
  const handleReturnHome = () => {
    navigate('/');
  };

  if (isLoading || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/10">
      <NavHeader title="Chess Game" showBackButton />
      
      <main className="flex-1 p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game info sidebar */}
          <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
            <div className="glass-panel p-6 animate-fade-in">
              <h2 className="text-xl font-medium mb-4">Game Info</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Game Mode</p>
                  <p className="font-medium">{formatGameMode(gameState.gameMode)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Current Turn</p>
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${gameState.currentTurn === PieceColor.WHITE ? 'bg-white border border-gray-300' : 'bg-black'}`}></span>
                    <p className="font-medium">{gameState.currentTurn === PieceColor.WHITE ? 'White' : 'Black'}</p>
                  </div>
                </div>
                
                {gameState.isCheck && (
                  <div className="text-red-500 font-bold py-2 px-4 bg-red-50 rounded-md">
                    Check!
                  </div>
                )}
                
                {gameState.isCheckmate && (
                  <div className="text-red-500 font-bold py-2 px-4 bg-red-50 rounded-md">
                    Checkmate! {gameState.currentTurn === PieceColor.WHITE ? 'Black' : 'White'} wins!
                  </div>
                )}
              </div>
              
              <div className="mt-6 space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleResetGame}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset Game
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleSwitchSides}
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                  Switch Sides
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleReturnHome}
                >
                  <ChevronRight className="mr-2 h-4 w-4" />
                  Return Home
                </Button>
              </div>
            </div>
            
            {/* Captured pieces */}
            <div className="glass-panel p-6 animate-fade-in delay-200">
              <h3 className="text-lg font-medium mb-4">Captured Pieces</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">White Pieces</p>
                  <div className="flex flex-wrap gap-2">
                    {gameState.capturedPieces
                      .filter(piece => piece.color === PieceColor.WHITE)
                      .map((piece, index) => (
                        <div key={index} className="w-6 h-6">
                          {/* Render captured white pieces */}
                        </div>
                      ))}
                    {gameState.capturedPieces.filter(piece => piece.color === PieceColor.WHITE).length === 0 && (
                      <p className="text-sm text-muted-foreground">None</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Black Pieces</p>
                  <div className="flex flex-wrap gap-2">
                    {gameState.capturedPieces
                      .filter(piece => piece.color === PieceColor.BLACK)
                      .map((piece, index) => (
                        <div key={index} className="w-6 h-6">
                          {/* Render captured black pieces */}
                        </div>
                      ))}
                    {gameState.capturedPieces.filter(piece => piece.color === PieceColor.BLACK).length === 0 && (
                      <p className="text-sm text-muted-foreground">None</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chess board */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="max-w-xl mx-auto perspective-transition">
              <ChessBoard 
                gameState={gameState} 
                onGameStateChange={handleGameStateChange} 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Game;
