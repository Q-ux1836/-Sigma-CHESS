import React, { useState, useEffect } from 'react';
import {
  initializeGame,
  movePiece,
  getPossibleMoves,
  isPawnPromotion,
  promotePawn,
  makeAIMove,
  PieceColor,
  PieceType,
  GameMode,
  GameState,
  ChessPiece,
  Position
} from '@/lib/chessEngine';
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button";

interface ChessPieceProps {
  piece: ChessPiece;
  size: number;
  uploadedImages: { [key: string]: string };
}

const ChessPiece: React.FC<ChessPieceProps> = ({ piece, size, uploadedImages }) => {
  const imageKey = `${piece.color}-${piece.type}`;
  const imageUrl = uploadedImages[imageKey] || `/images/${imageKey}.png`;

  return (
    <img
      src={imageUrl}
      alt={`${piece.color} ${piece.type}`}
      style={{ width: size, height: size }}
    />
  );
};

interface PromotionDialogProps {
  isOpen: boolean;
  onClose: (pieceType: PieceType | null) => void;
  color: PieceColor;
}

const PromotionDialog: React.FC<PromotionDialogProps> = ({ isOpen, onClose, color }) => {
  const [selectedPiece, setSelectedPiece] = useState<PieceType>(PieceType.QUEEN);

  const handlePieceSelection = (pieceType: PieceType) => {
    setSelectedPiece(pieceType);
  };

  const handleConfirm = () => {
    onClose(selectedPiece);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Pawn Promotion</AlertDialogTitle>
          <AlertDialogDescription>
            Choose a piece to promote your pawn to:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <RadioGroup defaultValue={PieceType.QUEEN} className="flex flex-col space-y-2" onValueChange={handlePieceSelection}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={PieceType.QUEEN} id="queen" />
            <Label htmlFor="queen">Queen</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={PieceType.ROOK} id="rook" />
            <Label htmlFor="rook">Rook</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={PieceType.BISHOP} id="bishop" />
            <Label htmlFor="bishop">Bishop</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={PieceType.KNIGHT} id="knight" />
            <Label htmlFor="knight">Knight</Label>
          </div>
        </RadioGroup>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onClose(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface CapturedPiecesProps {
  pieces: ChessPiece[];
  color: PieceColor;
  uploadedImages: { [key: string]: string };
}

const CapturedPieces: React.FC<CapturedPiecesProps> = ({ pieces, color, uploadedImages }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {pieces.map((piece, index) => (
        <ChessPiece key={`${color}-${piece.type}-${index}`} piece={piece} size={30} uploadedImages={uploadedImages} />
      ))}
    </div>
  );
};

const WebChess = () => {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>(() => initializeGame(GameMode.HUMAN_VS_AI));
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [boardStyle, setBoardStyle] = useState({
    light: "bg-gray-200",
    dark: "bg-gray-400",
  });
  const [uploadedImages, setUploadedImages] = useState<{ [key: string]: string }>({});
  const boardSize = 480;
  const squareSize = boardSize / 8;

  useEffect(() => {
    if (gameState.isCheckmate) {
      toast({
        title: "Checkmate!",
        description: `${gameState.currentTurn === PieceColor.WHITE ? "Black" : "White"} wins!`,
      });
    } else if (gameState.isCheck) {
      toast({
        title: "Check!",
        description: `${gameState.currentTurn === PieceColor.WHITE ? "White" : "Black"} is in check!`,
      });
    }
  }, [gameState.isCheck, gameState.isCheckmate, gameState.currentTurn, toast]);

  useEffect(() => {
    if (gameState.gameMode === GameMode.HUMAN_VS_AI && gameState.currentTurn === PieceColor.BLACK && !gameState.isCheckmate) {
      // Delay the AI move slightly to make it seem more natural
      setTimeout(() => {
        setGameState((prevGameState) => {
          const aiMoveState = makeAIMove(prevGameState);
          return aiMoveState;
        });
      }, 500);
    }
  }, [gameState.currentTurn, gameState.gameMode, gameState.isCheckmate]);

  const handleSquareClick = (row: number, col: number) => {
    const clickedPosition: Position = { row, col };
    const piece = gameState.board[row][col];

    if (selectedSquare) {
      // Attempt to move the piece
      setGameState((prevGameState) => {
        const moveResult = movePiece(selectedSquare, clickedPosition, prevGameState);
        if (moveResult !== prevGameState) {
          setSelectedSquare(null);
          setPossibleMoves([]);
          return moveResult;
        }
        return prevGameState;
      });
      setSelectedSquare(null);
      setPossibleMoves([]);
    } else if (piece && piece.color === gameState.currentTurn) {
      // Select the piece and highlight possible moves
      setSelectedSquare(clickedPosition);
      const moves = getPossibleMoves(piece, gameState.board);
      setPossibleMoves(moves);
    }
  };

  const handlePromotePawn = (pieceType: PieceType | null) => {
    if (!pieceType) {
      // Handle case where promotion is cancelled
      setGameState((prevGameState) => ({
        ...prevGameState,
        promotionPending: undefined,
      }));
      return;
    }

    setGameState((prevGameState) => {
      const promoteResult = promotePawn(prevGameState, pieceType);
      setSelectedSquare(null);
      setPossibleMoves([]);
      return promoteResult;
    });
  };

  const handleRestartGame = () => {
    setGameState(initializeGame(gameState.gameMode));
    setSelectedSquare(null);
    setPossibleMoves([]);
  };

  const handleImageUpload = (key: string, imageUrl: string) => {
    setUploadedImages((prevImages) => ({
      ...prevImages,
      [key]: imageUrl,
    }));
  };

  const renderCheckIndicator = () => {
    if (!gameState.isCheck) return null;
    
    // Find the king position of the current turn (the one in check)
    const kingColor = gameState.currentTurn;
    let kingPosition: Position | null = null;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.type === PieceType.KING && piece.color === kingColor) {
          kingPosition = { row, col };
          break;
        }
      }
      if (kingPosition) break;
    }
    
    if (!kingPosition) return null;
    
    return (
      <div 
        className="absolute z-10 rounded-full border-4 border-red-600 animate-pulse"
        style={{
          width: squareSize * 0.9,
          height: squareSize * 0.9,
          top: kingPosition.row * squareSize + squareSize * 0.05,
          left: kingPosition.col * squareSize + squareSize * 0.05,
        }}
      />
    );
  };

  return (
    <div className="flex flex-col items-center p-4 w-full max-w-4xl mx-auto">
      {/* Game status display */}
      <div className="w-full mb-4 text-center">
        <h2 className="text-xl font-bold">
          {gameState.isCheckmate
            ? `Checkmate! ${gameState.currentTurn === PieceColor.WHITE ? "Black" : "White"} wins!`
            : gameState.isCheck
            ? `${gameState.currentTurn === PieceColor.WHITE ? "White" : "Black"} is in check!`
            : `${gameState.currentTurn === PieceColor.WHITE ? "White" : "Black"}'s turn`}
        </h2>
      </div>

      {/* Game controls */}
      <div className="w-full mb-4 flex flex-wrap justify-center gap-2">
        <Button onClick={handleRestartGame}>Restart Game</Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Reset Game</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will reset all game progress.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => setGameState(initializeGame(gameState.gameMode))}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Board */}
      <div className="relative" style={{ width: boardSize, height: boardSize }}>
        {/* Board squares */}
        {Array.from({ length: 8 }).map((_, row) =>
          Array.from({ length: 8 }).map((_, col) => (
            <div
              key={`${row}-${col}`}
              className={`absolute ${
                (row + col) % 2 === 0 ? boardStyle.light : boardStyle.dark
              } ${
                selectedSquare?.row === row && selectedSquare?.col === col
                  ? "ring-2 ring-blue-400"
                  : ""
              }`}
              style={{
                width: squareSize,
                height: squareSize,
                top: row * squareSize,
                left: col * squareSize,
              }}
              onClick={() => handleSquareClick(row, col)}
            />
          ))
        )}

        {/* Add the check indicator */}
        {renderCheckIndicator()}

        {/* Move indicators */}
        {possibleMoves.map((move, index) => (
          <div
            key={`move-${index}`}
            className="absolute z-10 rounded-full bg-green-500 opacity-50"
            style={{
              width: squareSize * 0.3,
              height: squareSize * 0.3,
              top: move.row * squareSize + squareSize * 0.35,
              left: move.col * squareSize + squareSize * 0.35,
            }}
            onClick={() => handleSquareClick(move.row, move.col)}
          />
        ))}

        {/* Chess pieces */}
        {gameState.board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            if (!piece) return null;
            return (
              <div
                key={`piece-${rowIndex}-${colIndex}`}
                className="absolute transition-all duration-200 ease-in-out cursor-pointer"
                style={{
                  width: squareSize * 0.9,
                  height: squareSize * 0.9,
                  top: rowIndex * squareSize + squareSize * 0.05,
                  left: colIndex * squareSize + squareSize * 0.05,
                }}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
              >
                <ChessPiece piece={piece} size={squareSize * 0.9} uploadedImages={uploadedImages} />
              </div>
            );
          })
        )}

        {/* Promotion dialog */}
        {gameState.promotionPending && (
          <PromotionDialog
            isOpen={!!gameState.promotionPending}
            onClose={handlePromotePawn}
            color={gameState.board[gameState.promotionPending.from.row][gameState.promotionPending.from.col]?.color || PieceColor.WHITE}
          />
        )}
      </div>

      {/* Captured pieces */}
      <div className="w-full mt-4 flex justify-between">
        <div>
          <h3 className="text-md font-semibold">White Captured Pieces:</h3>
          <CapturedPieces
            pieces={gameState.capturedPieces.filter((piece) => piece.color === PieceColor.WHITE)}
            color={PieceColor.WHITE}
            uploadedImages={uploadedImages}
          />
        </div>
        <div>
          <h3 className="text-md font-semibold">Black Captured Pieces:</h3>
          <CapturedPieces
            pieces={gameState.capturedPieces.filter((piece) => piece.color === PieceColor.BLACK)}
            color={PieceColor.BLACK}
            uploadedImages={uploadedImages}
          />
        </div>
      </div>

      {/* Image uploader */}
      <div className="w-full mt-4 flex justify-around">
        <div>
          <h3 className="text-md font-semibold">Customize White Pieces:</h3>
          {Object.values(PieceType).map((type) => (
            <div key={`white-${type}`} className="mb-2">
              <label className="block text-sm font-medium text-gray-700">
                White {type}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      handleImageUpload(`white-${type}`, reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-md font-semibold">Customize Black Pieces:</h3>
          {Object.values(PieceType).map((type) => (
            <div key={`black-${type}`} className="mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Black {type}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      handleImageUpload(`black-${type}`, reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
          .chess-board {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            grid-template-rows: repeat(8, 1fr);
          }
        `}
      </style>
    </div>
  );
};

export default WebChess;
