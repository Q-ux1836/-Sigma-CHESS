from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

# Chess piece types and colors
class PieceType:
    PAWN = "pawn"
    ROOK = "rook"
    KNIGHT = "knight"
    BISHOP = "bishop"
    QUEEN = "queen"
    KING = "king"

class PieceColor:
    WHITE = "white"
    BLACK = "black"

# Game modes
class GameMode:
    HUMAN_VS_HUMAN = "human_vs_human"
    HUMAN_VS_AI = "human_vs_ai"

# Chess engine logic
class ChessGame:
    def __init__(self):
        self.board = self.create_initial_board()
        self.current_turn = PieceColor.WHITE
        self.selected_piece = None
        self.possible_moves = []
        self.captured_pieces = {PieceColor.WHITE: [], PieceColor.BLACK: []}
        self.game_mode = GameMode.HUMAN_VS_HUMAN
        self.promotion_pending = False
        self.promotion_position = None
        
    def create_initial_board(self):
        # Create an 8x8 empty board
        board = [[None for _ in range(8)] for _ in range(8)]
        
        # Set up pawns
        for col in range(8):
            board[1][col] = {"type": PieceType.PAWN, "color": PieceColor.BLACK, "position": {"row": 1, "col": col}}
            board[6][col] = {"type": PieceType.PAWN, "color": PieceColor.WHITE, "position": {"row": 6, "col": col}}
        
        # Set up other pieces - corrected arrangement
        # First and last rows: Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook
        
        # Black pieces (top row)
        board[0][0] = {"type": PieceType.ROOK, "color": PieceColor.BLACK, "position": {"row": 0, "col": 0}}
        board[0][1] = {"type": PieceType.KNIGHT, "color": PieceColor.BLACK, "position": {"row": 0, "col": 1}}
        board[0][2] = {"type": PieceType.BISHOP, "color": PieceColor.BLACK, "position": {"row": 0, "col": 2}}
        board[0][3] = {"type": PieceType.QUEEN, "color": PieceColor.BLACK, "position": {"row": 0, "col": 3}}
        board[0][4] = {"type": PieceType.KING, "color": PieceColor.BLACK, "position": {"row": 0, "col": 4}}
        board[0][5] = {"type": PieceType.BISHOP, "color": PieceColor.BLACK, "position": {"row": 0, "col": 5}}
        board[0][6] = {"type": PieceType.KNIGHT, "color": PieceColor.BLACK, "position": {"row": 0, "col": 6}}
        board[0][7] = {"type": PieceType.ROOK, "color": PieceColor.BLACK, "position": {"row": 0, "col": 7}}
        
        # White pieces (bottom row)
        board[7][0] = {"type": PieceType.ROOK, "color": PieceColor.WHITE, "position": {"row": 7, "col": 0}}
        board[7][1] = {"type": PieceType.KNIGHT, "color": PieceColor.WHITE, "position": {"row": 7, "col": 1}}
        board[7][2] = {"type": PieceType.BISHOP, "color": PieceColor.WHITE, "position": {"row": 7, "col": 2}}
        board[7][3] = {"type": PieceType.QUEEN, "color": PieceColor.WHITE, "position": {"row": 7, "col": 3}}
        board[7][4] = {"type": PieceType.KING, "color": PieceColor.WHITE, "position": {"row": 7, "col": 4}}
        board[7][5] = {"type": PieceType.BISHOP, "color": PieceColor.WHITE, "position": {"row": 7, "col": 5}}
        board[7][6] = {"type": PieceType.KNIGHT, "color": PieceColor.WHITE, "position": {"row": 7, "col": 6}}
        board[7][7] = {"type": PieceType.ROOK, "color": PieceColor.WHITE, "position": {"row": 7, "col": 7}}
            
        return board
    
    def get_piece(self, row, col):
        if 0 <= row < 8 and 0 <= col < 8:
            return self.board[row][col]
        return None
    
    def get_possible_moves(self, piece):
        # A simplified version of move calculation - would need to be expanded for a full chess implementation
        moves = []
        row, col = piece["position"]["row"], piece["position"]["col"]
        piece_type = piece["type"]
        color = piece["color"]
        
        # Pawn movement
        if piece_type == PieceType.PAWN:
            # Direction based on color
            direction = -1 if color == PieceColor.WHITE else 1
            
            # Forward move (one square)
            new_row = row + direction
            if 0 <= new_row < 8 and self.board[new_row][col] is None:
                moves.append({"row": new_row, "col": col})
                
                # Initial two-square move
                if (color == PieceColor.WHITE and row == 6) or (color == PieceColor.BLACK and row == 1):
                    new_row = row + 2 * direction
                    if 0 <= new_row < 8 and self.board[new_row][col] is None:
                        moves.append({"row": new_row, "col": col})
            
            # Capture moves
            for col_offset in [-1, 1]:
                new_col = col + col_offset
                if 0 <= new_row < 8 and 0 <= new_col < 8:
                    target_piece = self.board[new_row][new_col]
                    if target_piece is not None and target_piece["color"] != color:
                        moves.append({"row": new_row, "col": new_col})
        
        # For simplicity, other piece movements are not fully implemented
        # A complete implementation would include all chess piece movement rules
        
        return moves
    
    def move_piece(self, from_row, from_col, to_row, to_col):
        # Get piece at starting position
        piece = self.board[from_row][from_col]
        if piece is None:
            return False
        
        # Check if move is valid
        if not any(move["row"] == to_row and move["col"] == to_col for move in self.possible_moves):
            return False
        
        # Check for capture
        target = self.board[to_row][to_col]
        if target is not None:
            self.captured_pieces[piece["color"]].append(target)
        
        # Move the piece
        self.board[to_row][to_col] = piece
        self.board[from_row][from_col] = None
        piece["position"]["row"] = to_row
        piece["position"]["col"] = to_col
        
        # Check for pawn promotion
        if piece["type"] == PieceType.PAWN and (to_row == 0 or to_row == 7):
            self.promotion_pending = True
            self.promotion_position = {"row": to_row, "col": to_col}
        else:
            # Switch turns
            self.current_turn = PieceColor.BLACK if self.current_turn == PieceColor.WHITE else PieceColor.WHITE
        
        # Reset selection
        self.selected_piece = None
        self.possible_moves = []
        
        return True
    
    def promote_pawn(self, piece_type):
        if not self.promotion_pending or self.promotion_position is None:
            return False
        
        row, col = self.promotion_position["row"], self.promotion_position["col"]
        piece = self.board[row][col]
        
        if piece is not None and piece["type"] == PieceType.PAWN:
            piece["type"] = piece_type
            
            # Reset promotion state
            self.promotion_pending = False
            self.promotion_position = None
            
            # Switch turns
            self.current_turn = PieceColor.BLACK if self.current_turn == PieceColor.WHITE else PieceColor.WHITE
            
            return True
        
        return False
    
    def to_json(self):
        return {
            "board": self.board,
            "currentTurn": self.current_turn,
            "selectedPiece": self.selected_piece,
            "possibleMoves": self.possible_moves,
            "capturedPieces": self.captured_pieces,
            "gameMode": self.game_mode,
            "promotionPending": self.promotion_pending,
            "promotionPosition": self.promotion_position
        }

# Create a global game instance
chess_game = ChessGame()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/game-state', methods=['GET'])
def get_game_state():
    return jsonify(chess_game.to_json())

@app.route('/api/select-piece', methods=['POST'])
def select_piece():
    data = request.json
    row, col = data.get('row'), data.get('col')
    
    piece = chess_game.get_piece(row, col)
    if piece is not None and piece["color"] == chess_game.current_turn:
        chess_game.selected_piece = {"row": row, "col": col}
        chess_game.possible_moves = chess_game.get_possible_moves(piece)
    else:
        chess_game.selected_piece = None
        chess_game.possible_moves = []
    
    return jsonify(chess_game.to_json())

@app.route('/api/move-piece', methods=['POST'])
def move_piece():
    data = request.json
    from_row, from_col = data.get('fromRow'), data.get('fromCol')
    to_row, to_col = data.get('toRow'), data.get('toCol')
    
    success = chess_game.move_piece(from_row, from_col, to_row, to_col)
    return jsonify({"success": success, "gameState": chess_game.to_json()})

@app.route('/api/promote-pawn', methods=['POST'])
def promote_pawn():
    data = request.json
    piece_type = data.get('pieceType')
    
    success = chess_game.promote_pawn(piece_type)
    return jsonify({"success": success, "gameState": chess_game.to_json()})

@app.route('/api/reset-game', methods=['POST'])
def reset_game():
    global chess_game
    chess_game = ChessGame()
    return jsonify(chess_game.to_json())

if __name__ == '__main__':
    # Ensure the static directory exists
    os.makedirs('static', exist_ok=True)
    os.makedirs('static/images', exist_ok=True)
    
    # Start the Flask server
    app.run(debug=True)
