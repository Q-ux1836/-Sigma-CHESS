
import os
import sys
import shutil
import subprocess
from flask import Flask, render_template, jsonify, request
import webbrowser
from threading import Timer

# Constants
APP_NAME = "𝝨 CHESS"
DESKTOP_IMAGES_PATH = "C:/Users/user/Desktop/chess/images/"
VERSION = "1.0.0"

app = Flask(__name__)

# Game state (simple in-memory storage for this example)
game_state = {
    "board": None,
    "selectedPiece": None,
    "currentTurn": "white",
    "possibleMoves": [],
    "capturedPieces": {"white": [], "black": []},
    "gameMode": "human_vs_ai",
    "isCheck": False,
    "isCheckmate": False,
    "promotionPending": None
}

# Initialize the game
def initialize_game():
    # Create initial board state
    board = [[None for _ in range(8)] for _ in range(8)]
    
    # Set up pieces
    # Black pieces (top of board)
    board[0][0] = {"type": "rook", "color": "black"}
    board[0][1] = {"type": "knight", "color": "black"}
    board[0][2] = {"type": "bishop", "color": "black"}
    board[0][3] = {"type": "queen", "color": "black"}
    board[0][4] = {"type": "king", "color": "black"}
    board[0][5] = {"type": "bishop", "color": "black"}
    board[0][6] = {"type": "knight", "color": "black"}
    board[0][7] = {"type": "rook", "color": "black"}
    
    # Black pawns
    for col in range(8):
        board[1][col] = {"type": "pawn", "color": "black"}
    
    # White pawns
    for col in range(8):
        board[6][col] = {"type": "pawn", "color": "white"}
    
    # White pieces (bottom of board)
    board[7][0] = {"type": "rook", "color": "white"}
    board[7][1] = {"type": "knight", "color": "white"}
    board[7][2] = {"type": "bishop", "color": "white"}
    board[7][3] = {"type": "queen", "color": "white"}
    board[7][4] = {"type": "king", "color": "white"}
    board[7][5] = {"type": "bishop", "color": "white"}
    board[7][6] = {"type": "knight", "color": "white"}
    board[7][7] = {"type": "rook", "color": "white"}
    
    game_state["board"] = board
    game_state["currentTurn"] = "white"
    game_state["possibleMoves"] = []
    game_state["capturedPieces"] = {"white": [], "black": []}
    game_state["isCheck"] = False
    game_state["isCheckmate"] = False
    game_state["selectedPiece"] = None
    game_state["promotionPending"] = None

# Routes
@app.route('/')
def index():
    if game_state["board"] is None:
        initialize_game()
    return render_template('index.html')

@app.route('/api/game-state')
def get_game_state():
    return jsonify(game_state)

@app.route('/api/select-piece', methods=['POST'])
def select_piece():
    data = request.json
    row = data.get('row')
    col = data.get('col')
    
    # Check if valid piece of current player's color
    piece = game_state["board"][row][col]
    if piece and piece["color"] == game_state["currentTurn"]:
        game_state["selectedPiece"] = {"row": row, "col": col}
        # Here we would normally calculate possible moves
        # Simplified for example
        game_state["possibleMoves"] = []
        # Add a few example moves
        if row+1 < 8:
            game_state["possibleMoves"].append({"row": row+1, "col": col})
        if row-1 >= 0:
            game_state["possibleMoves"].append({"row": row-1, "col": col})
        if col+1 < 8:
            game_state["possibleMoves"].append({"row": row, "col": col+1})
        if col-1 >= 0:
            game_state["possibleMoves"].append({"row": row, "col": col-1})
    
    return jsonify(game_state)

@app.route('/api/move-piece', methods=['POST'])
def move_piece():
    data = request.json
    from_row = data.get('fromRow')
    from_col = data.get('fromCol')
    to_row = data.get('toRow')
    to_col = data.get('toCol')
    
    # Move the piece
    piece = game_state["board"][from_row][from_col]
    
    # Check if there's a piece to capture
    if game_state["board"][to_row][to_col]:
        captured = game_state["board"][to_row][to_col]
        # Add to captured pieces
        if captured["color"] == "white":
            game_state["capturedPieces"]["black"].append(captured)
        else:
            game_state["capturedPieces"]["white"].append(captured)
    
    # Move piece
    game_state["board"][to_row][to_col] = piece
    game_state["board"][from_row][from_col] = None
    
    # Check for pawn promotion
    if piece["type"] == "pawn" and ((piece["color"] == "white" and to_row == 0) or (piece["color"] == "black" and to_row == 7)):
        game_state["promotionPending"] = {"from": {"row": from_row, "col": from_col}, "to": {"row": to_row, "col": to_col}}
        return jsonify({"success": True, "gameState": game_state})
    
    # Switch turns
    game_state["currentTurn"] = "black" if game_state["currentTurn"] == "white" else "white"
    game_state["selectedPiece"] = None
    game_state["possibleMoves"] = []
    
    return jsonify({"success": True, "gameState": game_state})

@app.route('/api/promote-pawn', methods=['POST'])
def promote_pawn():
    data = request.json
    piece_type = data.get('pieceType')
    
    if game_state["promotionPending"]:
        to_row = game_state["promotionPending"]["to"]["row"]
        to_col = game_state["promotionPending"]["to"]["col"]
        
        # Promote the pawn
        game_state["board"][to_row][to_col]["type"] = piece_type
        
        # Clear the pending promotion
        game_state["promotionPending"] = None
        
        # Switch turns
        game_state["currentTurn"] = "black" if game_state["currentTurn"] == "white" else "white"
        
        return jsonify({"success": True, "gameState": game_state})
    
    return jsonify({"success": False, "error": "No pending promotion"})

@app.route('/api/reset-game', methods=['POST'])
def reset_game():
    initialize_game()
    return jsonify(game_state)

# Setup function
def setup_environment():
    """Set up the necessary files and directories for the chess application."""
    print(f"\n{APP_NAME} - Setup")
    print("-" * 20)
    
    # Create necessary directories
    if not os.path.exists("images"):
        os.makedirs("images")
        print("Created images directory")
    
    if not os.path.exists("custom_pieces"):
        os.makedirs("custom_pieces")
        print("Created custom pieces directory for user uploads")
    
    # Copy chess piece images from desktop if available
    if os.path.exists(DESKTOP_IMAGES_PATH):
        print(f"Found chess images at {DESKTOP_IMAGES_PATH}")
        try:
            # Copy all image files from desktop path
            for filename in os.listdir(DESKTOP_IMAGES_PATH):
                if filename.endswith(".png") or filename.endswith(".jpg"):
                    source = os.path.join(DESKTOP_IMAGES_PATH, filename)
                    destination = os.path.join("images", filename)
                    shutil.copy2(source, destination)
                    print(f"Copied {filename} to images directory")
        except Exception as e:
            print(f"Error copying images: {e}")
    else:
        print(f"Warning: Desktop images path {DESKTOP_IMAGES_PATH} not found")
        print("Using default images instead")
    
    # Copy logo
    logo_path = os.path.abspath("public/lovable-uploads/25911913-6628-4280-b7e9-a698abb23440.png")
    if os.path.exists(logo_path):
        shutil.copy2(logo_path, os.path.join("images", "logo.png"))
        print("Copied logo image")
    
    # Save the image path for the app to use
    with open("image_path.txt", "w") as f:
        f.write(DESKTOP_IMAGES_PATH)
    
    print("\nSetup complete!")

def open_browser():
    """Open the default web browser to the application."""
    webbrowser.open_new('http://localhost:5000/')

# Main function
def main():
    """Main entry point for the chess application."""
    print(f"\n{APP_NAME} v{VERSION}")
    print("-" * 20)
    
    # Set up the environment
    setup_environment()
    
    # Initialize the game
    initialize_game()
    
    print("\nStarting web server...")
    
    # Start browser after a delay
    Timer(1.5, open_browser).start()
    
    # Start Flask app
    app.run(debug=False, port=5000)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nShutting down gracefully...")
        sys.exit(0)
    except Exception as e:
        print(f"Error: {e}")
        input("\nPress Enter to exit...")
