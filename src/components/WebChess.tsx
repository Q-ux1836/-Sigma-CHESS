import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

type ChessPiece = {
  type: 'P' | 'R' | 'N' | 'B' | 'Q' | 'K';
  color: 'w' | 'b';
};

type BoardPosition = {
  row: number;
  col: number;
};

type ChessSquare = {
  piece: ChessPiece | null;
  position: BoardPosition;
};

const WebChess: React.FC = () => {
  const { toast } = useToast();
  const [board, setBoard] = useState<(ChessPiece | null)[][]>([]);
  const [currentTurn, setCurrentTurn] = useState<'w' | 'b'>('w');
  const [selectedPosition, setSelectedPosition] = useState<BoardPosition | null>(null);
  const [validMoves, setValidMoves] = useState<BoardPosition[]>([]);
  const [theme, setTheme] = useState<'standard' | 'vintage' | 'dark' | 'high-contrast'>('standard');
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [promotionPosition, setPromotionPosition] = useState<BoardPosition | null>(null);
  const [whiteCapturedPieces, setWhiteCapturedPieces] = useState<ChessPiece[]>([]);
  const [blackCapturedPieces, setBlackCapturedPieces] = useState<ChessPiece[]>([]);
  const [gameMessage, setGameMessage] = useState('');
  const [gameMode, setGameMode] = useState<'two_player' | 'vs_ai'>('two_player');
  
  useEffect(() => {
    initializeBoard();
  }, []);
  
  const initializeBoard = () => {
    const newBoard: (ChessPiece | null)[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));
    
    for (let i = 0; i < 8; i++) {
      newBoard[1][i] = { type: 'P', color: 'b' };
      newBoard[6][i] = { type: 'P', color: 'w' };
    }
    
    const backRankPieces: ('R' | 'N' | 'B' | 'Q' | 'K' | 'B' | 'N' | 'R')[] = 
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
    
    for (let i = 0; i < 8; i++) {
      newBoard[0][i] = { type: backRankPieces[i], color: 'b' };
      newBoard[7][i] = { type: backRankPieces[i], color: 'w' };
    }
    
    setBoard(newBoard);
    setCurrentTurn('w');
    setSelectedPosition(null);
    setValidMoves([]);
    setWhiteCapturedPieces([]);
    setBlackCapturedPieces([]);
    setGameMessage('');
  };
  
  const getPieceImage = (piece: ChessPiece) => {
    const pieceImages = {
      'wP': '/lovable-uploads/fbf27461-95a7-4b74-8e6c-3611a187691f.png',
      'wR': '/lovable-uploads/a5cbe14a-8516-4fd8-8bc1-ce46f2b351c4.png',
      'wN': '/lovable-uploads/364cc47a-6d27-459b-92dc-f535fea3a950.png',
      'wB': '/lovable-uploads/393e47b6-0886-49a4-9c05-cf4b876f0ce5.png',
      'wQ': '/lovable-uploads/b16be7f8-775a-4791-9bc1-52afcf217e18.png',
      'wK': '/lovable-uploads/3418cc24-b2db-406f-849a-38af9c17790f.png',
      'bP': '/lovable-uploads/dc87ed84-84de-4d26-9042-9170ab8437c2.png',
      'bR': '/lovable-uploads/1c3d4630-5dfc-48e7-9de1-f4e424e65a19.png',
      'bN': '/lovable-uploads/0f8ca98b-a8dc-4f72-a2e5-5e040c3f3cbf.png',
      'bB': '/lovable-uploads/79184c56-bca9-4c3f-8a2b-77c53134c8e6.png',
      'bQ': '/lovable-uploads/9a763d59-7f80-45ab-9dcd-c9eff361b961.png',
      'bK': '/lovable-uploads/9a763d59-7f80-45ab-9dcd-c9eff361b961.png'
    };
    
    return pieceImages[`${piece.color}${piece.type}`];
  };
  
  const handleSquareClick = (row: number, col: number) => {
    if (!selectedPosition) {
      const piece = board[row][col];
      if (piece && piece.color === currentTurn) {
        setSelectedPosition({ row, col });
        const moves = getValidMoves(row, col, piece);
        setValidMoves(moves);
      }
    } else {
      const startRow = selectedPosition.row;
      const startCol = selectedPosition.col;
      const piece = board[startRow][startCol];
      
      const isValidMove = validMoves.some(
        move => move.row === row && move.col === col
      );
      
      if (isValidMove) {
        if (piece?.type === 'P' && ((piece.color === 'w' && row === 0) || (piece.color === 'b' && row === 7))) {
          setPromotionPosition({ row, col });
          setShowPromotionDialog(true);
          return;
        }
        
        const targetPiece = board[row][col];
        if (targetPiece) {
          if (targetPiece.color === 'w') {
            setWhiteCapturedPieces([...whiteCapturedPieces, targetPiece]);
          } else {
            setBlackCapturedPieces([...blackCapturedPieces, targetPiece]);
          }
        }
        
        movePiece(startRow, startCol, row, col);
      }
      
      setSelectedPosition(null);
      setValidMoves([]);
    }
  };
  
  const movePiece = (startRow: number, startCol: number, endRow: number, endCol: number, promotionType?: 'Q' | 'R' | 'B' | 'N') => {
    const newBoard = [...board.map(row => [...row])];
    const piece = newBoard[startRow][startCol];
    
    if (!piece) return;
    
    if (promotionType && piece.type === 'P' && ((piece.color === 'w' && endRow === 0) || (piece.color === 'b' && endRow === 7))) {
      newBoard[endRow][endCol] = { type: promotionType, color: piece.color };
    } else {
      newBoard[endRow][endCol] = piece;
    }
    
    newBoard[startRow][startCol] = null;
    setBoard(newBoard);
    
    setCurrentTurn(currentTurn === 'w' ? 'b' : 'w');
    
    checkGameState(newBoard, currentTurn === 'w' ? 'b' : 'w');
  };
  
  const handlePromotion = (pieceType: 'Q' | 'R' | 'B' | 'N') => {
    if (!selectedPosition || !promotionPosition) return;
    
    const targetPiece = board[promotionPosition.row][promotionPosition.col];
    if (targetPiece) {
      if (targetPiece.color === 'w') {
        setWhiteCapturedPieces([...whiteCapturedPieces, targetPiece]);
      } else {
        setBlackCapturedPieces([...blackCapturedPieces, targetPiece]);
      }
    }
    
    movePiece(selectedPosition.row, selectedPosition.col, promotionPosition.row, promotionPosition.col, pieceType);
    setShowPromotionDialog(false);
    setPromotionPosition(null);
    setSelectedPosition(null);
    setValidMoves([]);
  };
  
  const getValidMoves = (row: number, col: number, piece: ChessPiece): BoardPosition[] => {
    const moves: BoardPosition[] = [];
    
    switch (piece.type) {
      case 'P':
        getPawnMoves(row, col, piece.color, moves);
        break;
      case 'R':
        getRookMoves(row, col, piece.color, moves);
        break;
      case 'N':
        getKnightMoves(row, col, piece.color, moves);
        break;
      case 'B':
        getBishopMoves(row, col, piece.color, moves);
        break;
      case 'Q':
        getRookMoves(row, col, piece.color, moves);
        getBishopMoves(row, col, piece.color, moves);
        break;
      case 'K':
        getKingMoves(row, col, piece.color, moves);
        break;
    }
    
    return moves;
  };
  
  const getPawnMoves = (row: number, col: number, color: 'w' | 'b', moves: BoardPosition[]) => {
    const direction = color === 'w' ? -1 : 1;
    
    if (row + direction >= 0 && row + direction < 8 && !board[row + direction][col]) {
      moves.push({ row: row + direction, col });
      
      if ((color === 'w' && row === 6) || (color === 'b' && row === 1)) {
        if (!board[row + 2 * direction][col]) {
          moves.push({ row: row + 2 * direction, col });
        }
      }
    }
    
    for (const colOffset of [-1, 1]) {
      if (col + colOffset >= 0 && col + colOffset < 8) {
        const targetRow = row + direction;
        if (targetRow >= 0 && targetRow < 8) {
          const targetPiece = board[targetRow][col + colOffset];
          if (targetPiece && targetPiece.color !== color) {
            moves.push({ row: targetRow, col: col + colOffset });
          }
        }
      }
    }
  };
  
  const getRookMoves = (row: number, col: number, color: 'w' | 'b', moves: BoardPosition[]) => {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    for (const [dr, dc] of directions) {
      let r = row + dr;
      let c = col + dc;
      
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const targetPiece = board[r][c];
        
        if (!targetPiece) {
          moves.push({ row: r, col: c });
        } else {
          if (targetPiece.color !== color) {
            moves.push({ row: r, col: c });
          }
          break;
        }
        
        r += dr;
        c += dc;
      }
    }
  };
  
  const getKnightMoves = (row: number, col: number, color: 'w' | 'b', moves: BoardPosition[]) => {
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    for (const [dr, dc] of knightMoves) {
      const r = row + dr;
      const c = col + dc;
      
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const targetPiece = board[r][c];
        if (!targetPiece || targetPiece.color !== color) {
          moves.push({ row: r, col: c });
        }
      }
    }
  };
  
  const getBishopMoves = (row: number, col: number, color: 'w' | 'b', moves: BoardPosition[]) => {
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    
    for (const [dr, dc] of directions) {
      let r = row + dr;
      let c = col + dc;
      
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const targetPiece = board[r][c];
        
        if (!targetPiece) {
          moves.push({ row: r, col: c });
        } else {
          if (targetPiece.color !== color) {
            moves.push({ row: r, col: c });
          }
          break;
        }
        
        r += dr;
        c += dc;
      }
    }
  };
  
  const getKingMoves = (row: number, col: number, color: 'w' | 'b', moves: BoardPosition[]) => {
    const kingMoves = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    
    for (const [dr, dc] of kingMoves) {
      const r = row + dr;
      const c = col + dc;
      
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const targetPiece = board[r][c];
        if (!targetPiece || targetPiece.color !== color) {
          moves.push({ row: r, col: c });
        }
      }
    }
  };
  
  const checkGameState = (newBoard: (ChessPiece | null)[][], currentPlayerColor: 'w' | 'b') => {
    setGameMessage(`Current turn: ${currentPlayerColor === 'w' ? 'White' : 'Black'}`);
  };
  
  const resetGame = () => {
    initializeBoard();
    toast({
      title: "New Game Started",
      description: "The board has been reset to the starting position.",
      duration: 3000,
    });
  };
  
  const getSquareClass = (row: number, col: number) => {
    const isLight = (row + col) % 2 === 0;
    const isSelected = selectedPosition?.row === row && selectedPosition?.col === col;
    const isValidMove = validMoves.some(move => move.row === row && move.col === col);
    
    let squareClass = "chess-square ";
    
    if (theme === 'standard') {
      squareClass += isLight ? 'bg-[#f0d9b5] ' : 'bg-[#b58863] ';
    } else if (theme === 'vintage') {
      squareClass += isLight ? 'bg-[#ffce9e] ' : 'bg-[#d18b47] ';
    } else if (theme === 'dark') {
      squareClass += isLight ? 'bg-[#969696] ' : 'bg-[#525252] ';
    } else if (theme === 'high-contrast') {
      squareClass += isLight ? 'bg-white ' : 'bg-black ';
    }
    
    if (isSelected) {
      squareClass += 'ring-4 ring-blue-500 ';
    }
    
    if (isValidMove) {
      squareClass += 'relative after:content-[""] after:absolute after:w-4 after:h-4 after:rounded-full after:bg-green-500/50 after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 ';
    }
    
    return squareClass;
  };
  
  const handleSetGameMode = (mode: 'two_player' | 'vs_ai') => {
    setGameMode(mode);
    resetGame();
    toast({
      title: mode === 'two_player' ? "Two Player Mode" : "Playing against AI",
      description: `Game mode set to ${mode === 'two_player' ? 'Two Player' : 'versus AI'}.`,
      duration: 3000,
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-4">
      <Card className="p-4">
        <header className="mb-4 text-center">
          <h1 className="text-2xl font-bold mb-2">PyQt5 Chess Game</h1>
          
          <div className="flex flex-col gap-2">
            <div className="status-display mb-2">
              <p className="text-lg font-semibold">{gameMessage || `${currentTurn === 'w' ? 'White' : 'Black'}'s turn`}</p>
            </div>
            
            <div className="theme-buttons flex flex-wrap justify-center gap-2 mb-2">
              <Button 
                size="sm"
                variant={theme === 'standard' ? 'default' : 'outline'} 
                onClick={() => setTheme('standard')}
                className="px-2 py-1 text-sm"
              >
                Standard
              </Button>
              <Button 
                size="sm"
                variant={theme === 'vintage' ? 'default' : 'outline'} 
                onClick={() => setTheme('vintage')}
                className="px-2 py-1 text-sm"
              >
                Vintage
              </Button>
              <Button 
                size="sm"
                variant={theme === 'dark' ? 'default' : 'outline'} 
                onClick={() => setTheme('dark')}
                className="px-2 py-1 text-sm"
              >
                Dark
              </Button>
              <Button 
                size="sm"
                variant={theme === 'high-contrast' ? 'default' : 'outline'} 
                onClick={() => setTheme('high-contrast')}
                className="px-2 py-1 text-sm"
              >
                High Contrast
              </Button>
            </div>
            
            <div className="game-mode-buttons flex justify-center gap-2 mb-2">
              <Button 
                size="sm"
                variant={gameMode === 'two_player' ? 'default' : 'outline'} 
                onClick={() => handleSetGameMode('two_player')}
                className="px-2 py-1 text-sm"
              >
                Two Player
              </Button>
              <Button 
                size="sm"
                variant={gameMode === 'vs_ai' ? 'default' : 'outline'} 
                onClick={() => handleSetGameMode('vs_ai')}
                className="px-2 py-1 text-sm"
              >
                vs AI
              </Button>
            </div>
            
            <div className="game-controls flex justify-center gap-2">
              <Button size="sm" onClick={resetGame} className="px-2 py-1 text-sm">New Game</Button>
              <Button size="sm" variant="outline" onClick={() => window.history.back()} className="px-2 py-1 text-sm">Quit</Button>
            </div>
          </div>
        </header>
        
        <main className="flex flex-col items-center">
          <div className="game-container flex flex-col md:flex-row justify-center items-center md:items-start gap-4">
            <div className="captured-pieces p-2 bg-muted rounded-md w-full md:w-32">
              <h3 className="text-sm font-semibold mb-1">Captured by White</h3>
              <div className="pieces-container flex flex-wrap gap-1">
                {blackCapturedPieces.map((piece, index) => (
                  <div key={index} className="captured-piece w-6 h-6">
                    <img 
                      src={getPieceImage(piece)} 
                      alt={`${piece.color}${piece.type}`} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className={`chess-board-container border-2 border-gray-400 ${
              theme === 'standard' ? 'standard-theme' :
              theme === 'vintage' ? 'vintage-theme' :
              theme === 'dark' ? 'dark-theme' :
              'high-contrast-theme'
            }`}>
              <div className="chess-board grid grid-cols-8">
                {Array(8).fill(null).map((_, row) => (
                  Array(8).fill(null).map((_, col) => {
                    const piece = board[row][col];
                    const isLight = (row + col) % 2 === 0;
                    return (
                      <div 
                        key={`${row}-${col}`}
                        className={`
                          w-10 h-10 md:w-12 md:h-12 flex items-center justify-center cursor-pointer
                          ${isLight ? 'square-light' : 'square-dark'}
                          ${selectedPosition?.row === row && selectedPosition?.col === col ? 'square-selected' : ''}
                          ${validMoves.some(move => move.row === row && move.col === col) ? 'square-movable' : ''}
                        `}
                        onClick={() => handleSquareClick(row, col)}
                      >
                        {piece && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <img 
                                  src={getPieceImage(piece)} 
                                  alt={`${piece.color}${piece.type}`} 
                                  className="w-4/5 h-4/5 object-contain"
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                {piece.color === 'w' ? 'White' : 'Black'} {
                                  piece.type === 'P' ? 'Pawn' :
                                  piece.type === 'R' ? 'Rook' :
                                  piece.type === 'N' ? 'Knight' :
                                  piece.type === 'B' ? 'Bishop' :
                                  piece.type === 'Q' ? 'Queen' :
                                  'King'
                                }
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    );
                  })
                ))}
              </div>
            </div>
            
            <div className="captured-pieces p-2 bg-muted rounded-md w-full md:w-32">
              <h3 className="text-sm font-semibold mb-1">Captured by Black</h3>
              <div className="pieces-container flex flex-wrap gap-1">
                {whiteCapturedPieces.map((piece, index) => (
                  <div key={index} className="captured-piece w-6 h-6">
                    <img 
                      src={getPieceImage(piece)} 
                      alt={`${piece.color}${piece.type}`} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        
        {showPromotionDialog && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-center">Choose Promotion</h3>
              <div className="promotion-options flex justify-center gap-3">
                {['Q', 'R', 'B', 'N'].map((type) => (
                  <div 
                    key={type}
                    className="promotion-piece p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md cursor-pointer"
                    onClick={() => handlePromotion(type as 'Q' | 'R' | 'B' | 'N')}
                  >
                    <img 
                      src={getPieceImage({ type: type as 'Q' | 'R' | 'B' | 'N', color: currentTurn })} 
                      alt={type} 
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </Card>
      
      <style jsx>{`
        .square-light {
          background-color: ${theme === 'standard' ? '#ffffff' : 
                             theme === 'vintage' ? '#ffce9e' : 
                             theme === 'dark' ? '#969696' : 
                             '#ffffff'};
        }
        
        .square-dark {
          background-color: ${theme === 'standard' ? '#a9a9a9' : 
                             theme === 'vintage' ? '#d18b47' : 
                             theme === 'dark' ? '#525252' : 
                             '#000000'};
        }
        
        .square-selected {
          position: relative;
        }
        
        .square-selected::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(70, 130, 180, 0.5);
          z-index: 5;
        }
        
        .square-movable::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 30%;
          height: 30%;
          transform: translate(-50%, -50%);
          background-color: rgba(0, 255, 0, 0.3);
          border-radius: 50%;
          z-index: 5;
        }
        
        .chess-board {
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default WebChess;
