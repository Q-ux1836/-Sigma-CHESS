
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface NavHeaderProps {
  title?: string;
  showBackButton?: boolean;
}

const NavHeader: React.FC<NavHeaderProps> = ({ 
  title = "Tactical Chessplay", 
  showBackButton = false 
}) => {
  return (
    <header className="py-6 px-4 flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
        )}
        <div className="flex items-center">
          <h1 className="text-xl font-medium tracking-tight">{title}</h1>
        </div>
      </div>
      
      <nav className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">Home</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/game">Play</Link>
        </Button>
      </nav>
    </header>
  );
};

export default NavHeader;
