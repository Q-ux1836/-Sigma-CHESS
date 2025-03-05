
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
          <img src="/lovable-uploads/68deda6e-0257-437e-8a96-ebf4be651592.png" alt="White Pawn" className="w-full h-full object-contain" />
        ) : (
          <img src="/lovable-uploads/42db49b6-4535-4db8-a445-c3f233f38136.png" alt="Black Pawn" className="w-full h-full object-contain" />
        );
      case PieceType.ROOK:
        return color === PieceColor.WHITE ? (
          <img src="/lovable-uploads/c954dc96-c90f-4faf-a1ad-2d6c20b5bc1c.png" alt="White Rook" className="w-full h-full object-contain" />
        ) : (
          <img src="/lovable-uploads/a84e8f3a-313e-4cfd-b6da-541a3c84dd32.png" alt="Black Rook" className="w-full h-full object-contain" />
        );
      case PieceType.KNIGHT:
        return color === PieceColor.WHITE ? (
          <img src="/lovable-uploads/7dc10eb4-08f6-41a4-a4e8-293f333e92b2.png" alt="White Knight" className="w-full h-full object-contain" />
        ) : (
          <img src="/lovable-uploads/94bcdfe7-3b05-4721-b0ad-e748321de400.png" alt="Black Knight" className="w-full h-full object-contain" />
        );
      case PieceType.BISHOP:
        return color === PieceColor.WHITE ? (
          <img src="/lovable-uploads/1fe7bb25-78b3-4e64-9524-3eb4dd0f66e3.png" alt="White Bishop" className="w-full h-full object-contain" />
        ) : (
          <img src="/lovable-uploads/c506906f-2e4f-43bf-85b9-e1485ce8088c.png" alt="Black Bishop" className="w-full h-full object-contain" />
        );
      case PieceType.QUEEN:
        return color === PieceColor.WHITE ? (
          <img src="/lovable-uploads/bc8ca135-f693-4e57-bc85-cae391227a7a.png" alt="White Queen" className="w-full h-full object-contain" />
        ) : (
          <img src="/lovable-uploads/bede6588-797b-47e5-98bd-bba03accda0a.png" alt="Black Queen" className="w-full h-full object-contain" />
        );
      case PieceType.KING:
        return color === PieceColor.WHITE ? (
          <img src="/lovable-uploads/29bbe838-33f0-40c4-98b8-c95ef9aa1e66.png" alt="White King" className="w-full h-full object-contain" />
        ) : (
          <img src="/lovable-uploads/2c29fb54-b770-4192-ad2e-f15afd2c7323.png" alt="Black King" className="w-full h-full object-contain" />
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
