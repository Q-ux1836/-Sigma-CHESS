
#!/usr/bin/env python3
"""
𝝨 CHESS - A Python-based chess application
"""

import sys
import os
from src.chess.main import run_chess_game

def main():
    """Main entry point for the chess application."""
    print("Starting 𝝨 CHESS application...")
    return run_chess_game()

if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:
        print(f"An error occurred: {e}")
        input("Press Enter to exit...")
