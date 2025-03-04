
import React from 'react';
import { ChessPiece as ChessPieceType, PieceType, PieceColor } from '@/lib/chessEngine';
import { cn } from '@/lib/utils';

interface ChessPieceProps {
  piece: ChessPieceType;
  className?: string;
}

const ChessPiece: React.FC<ChessPieceProps> = ({ piece, className }) => {
  const getPieceIcon = () => {
    const { type, color } = piece;
    
    // Return the appropriate SVG based on piece type and color
    switch (type) {
      case PieceType.PAWN:
        return color === PieceColor.WHITE ? (
          <img src="/lovable-uploads/3418cc24-b2db-406f-849a-38af9c17790f.png" alt="White Pawn" className="w-full h-full object-contain" />
        ) : (
          <img src="/lovable-uploads/1c3d4630-5dfc-48e7-9de1-f4e424e65a19.png" alt="Black Pawn" className="w-full h-full object-contain" />
        );
      case PieceType.ROOK:
        return color === PieceColor.WHITE ? (
          <img src="/lovable-uploads/b16be7f8-775a-4791-9bc1-52afcf217e18.png" alt="White Rook" className="w-full h-full object-contain" />
        ) : (
          <img src="/lovable-uploads/dc87ed84-84de-4d26-9042-9170ab8437c2.png" alt="Black Rook" className="w-full h-full object-contain" />
        );
      case PieceType.KNIGHT:
        return color === PieceColor.WHITE ? (
          <img src="/lovable-uploads/393e47b6-0886-49a4-9c05-cf4b876f0ce5.png" alt="White Knight" className="w-full h-full object-contain" />
        ) : (
          <img src="/lovable-uploads/0f8ca98b-a8dc-4f72-a2e5-5e040c3f3cbf.png" alt="Black Knight" className="w-full h-full object-contain" />
        );
      case PieceType.BISHOP:
        return color === PieceColor.WHITE ? (
          <img src="/lovable-uploads/364cc47a-6d27-459b-92dc-f535fea3a950.png" alt="White Bishop" className="w-full h-full object-contain" />
        ) : (
          <img src="/lovable-uploads/3418cc24-b2db-406f-849a-38af9c17790f.png" alt="Black Bishop" className="w-full h-full object-contain" />
        );
      case PieceType.QUEEN:
        return color === PieceColor.WHITE ? (
          <img src="/lovable-uploads/79184c56-bca9-4c3f-8a2b-77c53134c8e6.png" alt="White Queen" className="w-full h-full object-contain" />
        ) : (
          <img src="/lovable-uploads/fbf27461-95a7-4b74-8e6c-3611a187691f.png" alt="Black Queen" className="w-full h-full object-contain" />
        );
      case PieceType.KING:
        return color === PieceColor.WHITE ? (
          <img src="/lovable-uploads/9a763d59-7f80-45ab-9dcd-c9eff361b961.png" alt="White King" className="w-full h-full object-contain" />
        ) : (
          <img src="/lovable-uploads/a5cbe14a-8516-4fd8-8bc1-ce46f2b351c4.png" alt="Black King" className="w-full h-full object-contain" />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("chess-piece", className)}>
      {getPieceIcon()}
    </div>
  );
};

export default ChessPiece;
