
import React, { useState, useEffect } from 'react';
import { 
  GameState, Position, PieceColor, GameMode, PieceType,
  getPossibleMoves, movePiece, makeAIMove, promotePawn
} from '@/lib/chessEngine';
import ChessPiece from './ChessPiece';
import PawnPromotionDialog from './PawnPromotionDialog';
import { cn } from '@/lib/utils';

interface ChessBoardProps {
  gameState: GameState;
  onGameStateChange: (newGameState: GameState) => void;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ gameState, onGameStateChange }) => {
  const { board, currentTurn, selectedPiece, possibleMoves, gameMode, promotionPending } = gameState;
  
  // Handle square click
  const handleSquareClick = (row: number, col: number) => {
    // Don't allow moves when promotion is pending
    if (promotionPending) return;
    
    const piece = board[row][col];
    
    // If a piece is already selected
    if (selectedPiece) {
      // Check if clicking on a possible move
      const isMovePossible = possibleMoves.some(
        move => move.row === row && move.col === col
      );
      
      if (isMovePossible) {
        // Make the move
        const newGameState = movePiece(selectedPiece, { row, col }, gameState);
        onGameStateChange(newGameState);
        
        // If playing against AI and no promotion is pending, make AI move after a short delay
        if (gameMode === GameMode.HUMAN_VS_AI && 
            newGameState.currentTurn === PieceColor.BLACK && 
            !newGameState.promotionPending) {
          setTimeout(() => {
            const aiMoveState = makeAIMove(newGameState);
            onGameStateChange(aiMoveState);
          }, 500);
        }
      } else if (piece && piece.color === currentTurn) {
        // Select a different piece of the same color
        const newPossibleMoves = getPossibleMoves(piece, board);
        onGameStateChange({
          ...gameState,
          selectedPiece: { row, col },
          possibleMoves: newPossibleMoves
        });
      } else {
        // Clicking an empty square or enemy piece (not in possible moves)
        onGameStateChange({
          ...gameState,
          selectedPiece: null,
          possibleMoves: []
        });
      }
    } else if (piece && piece.color === currentTurn) {
      // Select a piece
      const newPossibleMoves = getPossibleMoves(piece, board);
      onGameStateChange({
        ...gameState,
        selectedPiece: { row, col },
        possibleMoves: newPossibleMoves
      });
    }
  };

  // Handle pawn promotion
  const handlePromotion = (pieceType: PieceType) => {
    const newGameState = promotePawn(gameState, pieceType);
    onGameStateChange(newGameState);
    
    // If playing against AI, make AI move after promotion
    if (gameMode === GameMode.HUMAN_VS_AI && newGameState.currentTurn === PieceColor.BLACK) {
      setTimeout(() => {
        const aiMoveState = makeAIMove(newGameState);
        onGameStateChange(aiMoveState);
      }, 500);
    }
  };

  // Determine if a square is selected
  const isSquareSelected = (row: number, col: number) => {
    return selectedPiece?.row === row && selectedPiece?.col === col;
  };

  // Determine if a square is a possible move
  const isSquareMovable = (row: number, col: number) => {
    return possibleMoves.some(move => move.row === row && move.col === col);
  };

  // Render the board with a beautiful animation
  return (
    <>
      <div className="chess-board animate-fade-in">
        {board.map((row, rowIndex) => (
          row.map((piece, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 === 0;
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  "chess-square",
                  isLight ? "square-light" : "square-dark",
                  isSquareSelected(rowIndex, colIndex) && "square-selected",
                  isSquareMovable(rowIndex, colIndex) && "square-movable"
                )}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
              >
                {piece && <ChessPiece piece={piece} />}
              </div>
            );
          })
        ))}
      </div>
      
      {promotionPending && (
        <PawnPromotionDialog
          isOpen={true}
          pieceColor={currentTurn}
          onSelect={handlePromotion}
        />
      )}
    </>
  );
};

export default ChessBoard;
