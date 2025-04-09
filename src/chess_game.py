
# This file is a compatibility wrapper for the refactored chess modules
# It provides the same functionality as before but using the modular structure

import sys
from chess.main import run_chess_game

if __name__ == "__main__":
    sys.exit(run_chess_game())
