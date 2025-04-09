
import sys
from PyQt5.QtWidgets import QApplication
from .logic import ChessLogic
from .board import ChessBoard
from .utils import create_images_dir_if_needed

def run_chess_game():
    """Run the chess game."""
    # Create images directory if needed
    create_images_dir_if_needed()
    
    app = QApplication(sys.argv)
    chess_logic = ChessLogic()
    window = ChessBoard(chess_logic)
    window.show()
    return app.exec_()

if __name__ == "__main__":
    sys.exit(run_chess_game())
