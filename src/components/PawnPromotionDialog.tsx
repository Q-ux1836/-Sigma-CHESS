
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PieceType, PieceColor, ChessPiece as ChessPieceType } from '@/lib/chessEngine';
import ChessPieceComponent from './ChessPiece';
import { cn } from '@/lib/utils';

interface PawnPromotionDialogProps {
  isOpen: boolean;
  pieceColor: PieceColor;
  onSelect: (pieceType: PieceType) => void;
}

const PawnPromotionDialog: React.FC<PawnPromotionDialogProps> = ({
  isOpen,
  pieceColor,
  onSelect
}) => {
  const pieceTypes = [PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT];
  
  return (
    <Dialog open={isOpen}>
      <DialogContent className="w-[300px] sm:w-[425px] p-6">
        <DialogHeader>
          <DialogTitle className="text-center">Choose Promotion</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-4 gap-4 mt-4">
          {pieceTypes.map((type) => {
            const piece: ChessPieceType = {
              type,
              color: pieceColor,
              position: { row: 0, col: 0 } // Position is not relevant for display
            };
            
            return (
              <button 
                key={type}
                className={cn(
                  "flex items-center justify-center p-2 rounded-lg",
                  "cursor-pointer hover:bg-muted transition-colors",
                  "h-20 w-20"
                )}
                onClick={() => onSelect(type)}
              >
                <ChessPieceComponent piece={piece} />
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PawnPromotionDialog;
