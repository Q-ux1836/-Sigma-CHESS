
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
  
  // Initialize the chess board
  useEffect(() => {
    initializeBoard();
  }, []);
  
  const initializeBoard = () => {
    const newBoard: (ChessPiece | null)[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));
    
    // Set up pawns
    for (let i = 0; i < 8; i++) {
      newBoard[1][i] = { type: 'P', color: 'b' };
      newBoard[6][i] = { type: 'P', color: 'w' };
    }
    
    // Set up other pieces
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
    // If no piece is selected yet
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
      
      // Check if the clicked position is in validMoves
      const isValidMove = validMoves.some(
        move => move.row === row && move.col === col
      );
      
      if (isValidMove) {
        // Check if it's a pawn promotion move
        if (piece?.type === 'P' && ((piece.color === 'w' && row === 0) || (piece.color === 'b' && row === 7))) {
          setPromotionPosition({ row, col });
          setShowPromotionDialog(true);
          return;
        }
        
        // Handle capturing
        const targetPiece = board[row][col];
        if (targetPiece) {
          if (targetPiece.color === 'w') {
            setWhiteCapturedPieces([...whiteCapturedPieces, targetPiece]);
          } else {
            setBlackCapturedPieces([...blackCapturedPieces, targetPiece]);
          }
        }
        
        // Move the piece
        movePiece(startRow, startCol, row, col);
      }
      
      // Reset selection
      setSelectedPosition(null);
      setValidMoves([]);
    }
  };
  
  const movePiece = (startRow: number, startCol: number, endRow: number, endCol: number, promotionType?: 'Q' | 'R' | 'B' | 'N') => {
    const newBoard = [...board.map(row => [...row])];
    const piece = newBoard[startRow][startCol];
    
    if (!piece) return;
    
    // Handle promotion
    if (promotionType && piece.type === 'P' && ((piece.color === 'w' && endRow === 0) || (piece.color === 'b' && endRow === 7))) {
      newBoard[endRow][endCol] = { type: promotionType, color: piece.color };
    } else {
      newBoard[endRow][endCol] = piece;
    }
    
    newBoard[startRow][startCol] = null;
    setBoard(newBoard);
    
    // Switch turns
    setCurrentTurn(currentTurn === 'w' ? 'b' : 'w');
    
    // Check for check or checkmate
    checkGameState(newBoard, currentTurn === 'w' ? 'b' : 'w');
  };
  
  const handlePromotion = (pieceType: 'Q' | 'R' | 'B' | 'N') => {
    if (!selectedPosition || !promotionPosition) return;
    
    // Handle capturing when promoting
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
        getRookMoves(row, col, piece.color, moves);  // Queen moves like a rook
        getBishopMoves(row, col, piece.color, moves); // and a bishop
        break;
      case 'K':
        getKingMoves(row, col, piece.color, moves);
        break;
    }
    
    return moves;
  };
  
  const getPawnMoves = (row: number, col: number, color: 'w' | 'b', moves: BoardPosition[]) => {
    const direction = color === 'w' ? -1 : 1;
    
    // Forward move
    if (row + direction >= 0 && row + direction < 8 && !board[row + direction][col]) {
      moves.push({ row: row + direction, col });
      
      // Double move from starting position
      if ((color === 'w' && row === 6) || (color === 'b' && row === 1)) {
        if (!board[row + 2 * direction][col]) {
          moves.push({ row: row + 2 * direction, col });
        }
      }
    }
    
    // Capture moves
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
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right
    
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
          break; // Stop when we hit a piece
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
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // Diagonals
    
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
          break; // Stop when we hit a piece
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
    // Simplified check/checkmate detection
    // This is a placeholder for more complex logic in a full chess implementation
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
    
    // Base colors based on theme
    if (theme === 'standard') {
      squareClass += isLight ? 'bg-[#f0d9b5] ' : 'bg-[#b58863] ';
    } else if (theme === 'vintage') {
      squareClass += isLight ? 'bg-[#ffce9e] ' : 'bg-[#d18b47] ';
    } else if (theme === 'dark') {
      squareClass += isLight ? 'bg-[#969696] ' : 'bg-[#525252] ';
    } else if (theme === 'high-contrast') {
      squareClass += isLight ? 'bg-white ' : 'bg-black ';
    }
    
    // Highlight selected square
    if (isSelected) {
      squareClass += 'ring-4 ring-blue-500 ';
    }
    
    // Highlight valid moves
    if (isValidMove) {
      squareClass += 'relative after:content-[""] after:absolute after:w-4 after:h-4 after:rounded-full after:bg-green-500/50 after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 ';
    }
    
    return squareClass;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-4">Chess Game</h1>
          <div className="controls flex flex-col gap-4">
            <div className="theme-buttons flex flex-wrap justify-center gap-2">
              <Button 
                variant={theme === 'standard' ? 'default' : 'outline'} 
                onClick={() => setTheme('standard')}
              >
                Standard
              </Button>
              <Button 
                variant={theme === 'vintage' ? 'default' : 'outline'} 
                onClick={() => setTheme('vintage')}
              >
                Vintage
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'outline'} 
                onClick={() => setTheme('dark')}
              >
                Dark
              </Button>
              <Button 
                variant={theme === 'high-contrast' ? 'default' : 'outline'} 
                onClick={() => setTheme('high-contrast')}
              >
                High Contrast
              </Button>
            </div>
            <div className="game-controls flex justify-center">
              <Button onClick={resetGame}>New Game</Button>
            </div>
          </div>
        </header>
        
        <main>
          <div className="game-container flex flex-col md:flex-row justify-center items-center md:items-start gap-6">
            <div className="captured-pieces p-4 bg-muted rounded-lg w-full md:w-auto">
              <h3 className="text-lg font-semibold mb-2">Captured by White</h3>
              <div className="pieces-container flex flex-wrap gap-1">
                {blackCapturedPieces.map((piece, index) => (
                  <div key={index} className="captured-piece w-8 h-8">
                    <img 
                      src={getPieceImage(piece)} 
                      alt={`${piece.color}${piece.type}`} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="chess-board-container">
              <div className="chess-board grid grid-cols-8 border-2 border-border">
                {Array(8).fill(null).map((_, row) => (
                  Array(8).fill(null).map((_, col) => {
                    const piece = board[row][col];
                    return (
                      <div 
                        key={`${row}-${col}`}
                        className={getSquareClass(row, col)}
                        onClick={() => handleSquareClick(row, col)}
                      >
                        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                          {piece && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <img 
                                    src={getPieceImage(piece)} 
                                    alt={`${piece.color}${piece.type}`} 
                                    className="w-4/5 h-4/5 object-contain cursor-pointer"
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
                      </div>
                    );
                  })
                ))}
              </div>
            </div>
            
            <div className="captured-pieces p-4 bg-muted rounded-lg w-full md:w-auto">
              <h3 className="text-lg font-semibold mb-2">Captured by Black</h3>
              <div className="pieces-container flex flex-wrap gap-1">
                {whiteCapturedPieces.map((piece, index) => (
                  <div key={index} className="captured-piece w-8 h-8">
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
          
          <div className="game-status text-center mt-6">
            <p className="text-xl font-semibold">{gameMessage || `Current turn: ${currentTurn === 'w' ? 'White' : 'Black'}`}</p>
          </div>
        </main>
        
        {showPromotionDialog && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-center">Choose Promotion</h3>
              <div className="promotion-options flex justify-center gap-4">
                {['Q', 'R', 'B', 'N'].map((type) => (
                  <div 
                    key={type}
                    className="promotion-piece p-2 border-2 border-transparent hover:border-primary rounded-md cursor-pointer"
                    onClick={() => handlePromotion(type as 'Q' | 'R' | 'B' | 'N')}
                  >
                    <img 
                      src={getPieceImage({ type: type as 'Q' | 'R' | 'B' | 'N', color: currentTurn })} 
                      alt={type} 
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
};

export default WebChess;
