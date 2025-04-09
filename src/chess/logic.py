
class ChessLogic:
    def __init__(self):
        self.board = self.create_initial_board()
        self.current_turn = 'w'  # White starts first
        self.game_over = False
        self.winner = None
        self.move_history = []
        self.captured_pieces = {'w': [], 'b': []}
        self.kings_moved = {'w': False, 'b': False}
        self.rooks_moved = {
            'w': {'kingside': False, 'queenside': False},
            'b': {'kingside': False, 'queenside': False}
        }

    def create_initial_board(self):
        """Create the initial chess board with pieces in their starting positions."""
        board = [[None] * 8 for _ in range(8)]

        # White pieces (row 6 and 7)
        board[7] = ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
        board[6] = ['wP'] * 8

        # Black pieces (row 0 and 1)
        board[0] = ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR']
        board[1] = ['bP'] * 8

        return board

    def get_piece(self, row, col):
        """Return the piece at the specified position."""
        if 0 <= row < 8 and 0 <= col < 8:
            return self.board[row][col]
        return None

    def place_piece(self, row, col, piece):
        """Place a piece at the specified position."""
        self.board[row][col] = piece

    def is_opponent_in_check(self, color):
        """Check if the opponent's king is in check."""
        opponent_color = 'b' if color == 'w' else 'w'
        king_pos = self.find_king(opponent_color)
        
        if not king_pos:
            return False
            
        # Check if any piece of current player can attack the opponent's king
        for r in range(8):
            for c in range(8):
                piece = self.get_piece(r, c)
                if piece and piece[0] == color:
                    valid_moves = self.highlight_moves((r, c), check_for_check=False)
                    if king_pos in valid_moves:
                        return True
        return False

    def find_king(self, color):
        """Find the position of the king with the specified color."""
        for r in range(8):
            for c in range(8):
                piece = self.get_piece(r, c)
                if piece and piece[0] == color and piece[1] == 'K':
                    return (r, c)
        return None

    def is_checkmate(self, color):
        """Check if the player with the given color is in checkmate."""
        # If king is not in check, it's not checkmate
        if not self.is_opponent_in_check(('b' if color == 'w' else 'w')):
            return False
            
        # Try all possible moves for all pieces of the given color
        for r in range(8):
            for c in range(8):
                piece = self.get_piece(r, c)
                if piece and piece[0] == color:
                    valid_moves = self.highlight_moves((r, c))
                    for move in valid_moves:
                        # Try the move and see if it gets out of check
                        temp_piece = self.get_piece(move[0], move[1])
                        self.board[move[0]][move[1]] = piece
                        self.board[r][c] = None
                        
                        # Check if king is still in check after the move
                        still_in_check = self.is_opponent_in_check(('b' if color == 'w' else 'w'))
                        
                        # Undo the move
                        self.board[r][c] = piece
                        self.board[move[0]][move[1]] = temp_piece
                        
                        if not still_in_check:
                            # Found a move that gets out of check
                            return False
        
        # No move gets out of check, so it's checkmate
        return True

    def is_stalemate(self, color):
        """Check if the player with the given color is in stalemate."""
        # If king is in check, it's not stalemate
        if self.is_opponent_in_check(('b' if color == 'w' else 'w')):
            return False
            
        # Check if the player has any legal moves
        for r in range(8):
            for c in range(8):
                piece = self.get_piece(r, c)
                if piece and piece[0] == color:
                    valid_moves = self.highlight_moves((r, c))
                    if valid_moves:
                        return False
        
        # No legal moves and not in check, so it's stalemate
        return True

    def highlight_moves(self, selected_pos, check_for_check=True):
        """Highlight valid moves based on the selected piece's type and position."""
        row, col = selected_pos
        piece = self.get_piece(row, col)
        if piece is None:
            return []
            
        piece_color = piece[0]  # 'w' for white, 'b' for black
        valid_moves = []
        
        if piece[1] == 'P':
            valid_moves = self.highlight_pawn_moves(row, col, piece_color)
        elif piece[1] == 'R':
            valid_moves = self.highlight_rook_moves(row, col, piece_color)
        elif piece[1] == 'N':
            valid_moves = self.highlight_knight_moves(row, col, piece_color)
        elif piece[1] == 'B':
            valid_moves = self.highlight_bishop_moves(row, col, piece_color)
        elif piece[1] == 'Q':
            valid_moves = self.highlight_queen_moves(row, col, piece_color)
        elif piece[1] == 'K':
            valid_moves = self.highlight_king_moves(row, col, piece_color)
            
        # Filter out moves that would put the king in check
        if check_for_check:
            legal_moves = []
            for move in valid_moves:
                # Try the move
                dest_row, dest_col = move
                temp_piece = self.get_piece(dest_row, dest_col)
                
                # Make the move
                self.board[dest_row][dest_col] = piece
                self.board[row][col] = None
                
                # Check if the king is in check after the move
                king_pos = self.find_king(piece_color)
                king_in_check = False
                
                # Check if any opponent piece can attack the king
                opponent_color = 'b' if piece_color == 'w' else 'w'
                for r in range(8):
                    for c in range(8):
                        opponent_piece = self.get_piece(r, c)
                        if opponent_piece and opponent_piece[0] == opponent_color:
                            opponent_moves = self.highlight_moves((r, c), check_for_check=False)
                            if king_pos in opponent_moves:
                                king_in_check = True
                                break
                    if king_in_check:
                        break
                
                # Undo the move
                self.board[row][col] = piece
                self.board[dest_row][dest_col] = temp_piece
                
                # If the king is not in check, the move is legal
                if not king_in_check:
                    legal_moves.append(move)
                    
            return legal_moves
        
        return valid_moves

    # Move rules for different pieces
    def highlight_pawn_moves(self, row, col, color):
        """Return valid moves for a pawn based on its position and color."""
        valid_moves = []
        direction = -1 if color == 'w' else 1  # White pawns move up (decreasing row), black pawns move down
        start_row = 6 if color == 'w' else 1  # Starting row for pawns

        # Normal move (1 square forward)
        if 0 <= row + direction < 8 and self.get_piece(row + direction, col) is None:
            valid_moves.append((row + direction, col))
            
            # Double move from starting position
            if row == start_row and self.get_piece(row + 2*direction, col) is None:
                valid_moves.append((row + 2*direction, col))

        # Capture moves (diagonally)
        for dc in [-1, 1]:
            if 0 <= row + direction < 8 and 0 <= col + dc < 8:
                piece_to_capture = self.get_piece(row + direction, col + dc)
                if piece_to_capture and piece_to_capture[0] != color:
                    valid_moves.append((row + direction, col + dc))

        return valid_moves

    def highlight_rook_moves(self, row, col, color):
        """Return valid moves for a rook based on its position and color."""
        valid_moves = []

        # Horizontal and vertical directions
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            r, c = row, col
            while True:
                r += dr
                c += dc
                if not (0 <= r < 8 and 0 <= c < 8):
                    break
                piece = self.get_piece(r, c)
                if piece is None:
                    valid_moves.append((r, c))
                elif piece[0] != color:
                    valid_moves.append((r, c))
                    break
                else:
                    break
        return valid_moves

    def highlight_knight_moves(self, row, col, color):
        """Return valid moves for a knight based on its position and color."""
        valid_moves = []
        knight_moves = [(-2, -1), (-2, 1), (-1, -2), (-1, 2), (1, -2), (1, 2), (2, -1), (2, 1)]
        for dr, dc in knight_moves:
            r, c = row + dr, col + dc
            if 0 <= r < 8 and 0 <= c < 8:
                piece = self.get_piece(r, c)
                if piece is None or piece[0] != color:
                    valid_moves.append((r, c))
        return valid_moves

    def highlight_bishop_moves(self, row, col, color):
        """Return valid moves for a bishop based on its position and color."""
        valid_moves = []

        # Diagonal directions
        for dr, dc in [(-1, -1), (-1, 1), (1, -1), (1, 1)]:
            r, c = row, col
            while True:
                r += dr
                c += dc
                if not (0 <= r < 8 and 0 <= c < 8):
                    break
                piece = self.get_piece(r, c)
                if piece is None:
                    valid_moves.append((r, c))
                elif piece[0] != color:
                    valid_moves.append((r, c))
                    break
                else:
                    break
        return valid_moves

    def highlight_queen_moves(self, row, col, color):
        """Return valid moves for a queen based on its position and color."""
        # Combination of rook and bishop moves
        return self.highlight_rook_moves(row, col, color) + self.highlight_bishop_moves(row, col, color)

    def highlight_king_moves(self, row, col, color):
        """Return valid moves for a king based on its position and color."""
        valid_moves = []

        # King moves one square in any direction
        for dr, dc in [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]:
            r, c = row + dr, col + dc
            if 0 <= r < 8 and 0 <= c < 8:
                piece = self.get_piece(r, c)
                if piece is None or piece[0] != color:
                    valid_moves.append((r, c))
                    
        # Castling logic
        if not self.kings_moved[color]:
            # Kingside castling
            if not self.rooks_moved[color]['kingside']:
                # Check if path is clear
                if all(self.get_piece(row, c) is None for c in range(col+1, 7)):
                    valid_moves.append((row, col+2))  # Castling move
                    
            # Queenside castling
            if not self.rooks_moved[color]['queenside']:
                # Check if path is clear
                if all(self.get_piece(row, c) is None for c in range(col-1, 0, -1)):
                    valid_moves.append((row, col-2))  # Castling move
                    
        return valid_moves

    def is_valid_move(self, selected_piece, start_pos, end_pos):
        """Check if the selected move is valid for the piece."""
        if selected_piece is None:
            return False

        row, col = start_pos
        valid_moves = self.highlight_moves((row, col))
        return end_pos in valid_moves

    def handle_pawn_promotion(self, row, col):
        """Check if a pawn has reached the opposite end of the board."""
        piece = self.get_piece(row, col)
        if piece and piece[1] == 'P':
            if (piece[0] == 'w' and row == 0) or (piece[0] == 'b' and row == 7):
                return True
        return False

    def promote_pawn(self, row, col, new_piece_type):
        """Promote a pawn to a new piece type."""
        piece = self.get_piece(row, col)
        if piece and piece[1] == 'P':
            color = piece[0]
            self.place_piece(row, col, color + new_piece_type)
            return True
        return False

    def make_ai_move(self):
        """Make a strategic AI move, improved to seek checkmate."""
        possible_moves = []
        
        # Collect all possible moves for black pieces
        for r in range(8):
            for c in range(8):
                piece = self.get_piece(r, c)
                if piece and piece[0] == 'b':
                    valid_moves = self.highlight_moves((r, c))
                    for move in valid_moves:
                        # Create a temporary board to simulate the move
                        temp_board = [row[:] for row in self.board]
                        temp_piece = temp_board[r][c]
                        
                        # Simulate the move
                        temp_board[move[0]][move[1]] = temp_piece
                        temp_board[r][c] = None
                        
                        # Prioritize move scoring
                        score = 0
                        
                        # Score for captures
                        target_piece = self.get_piece(move[0], move[1])
                        if target_piece:
                            # Higher score for capturing higher value pieces
                            if target_piece[1] == 'P': score = 10
                            elif target_piece[1] == 'N' or target_piece[1] == 'B': score = 30
                            elif target_piece[1] == 'R': score = 50
                            elif target_piece[1] == 'Q': score = 90
                            elif target_piece[1] == 'K': score = 900  # Prioritize king attacks
                        
                        # Check if this move puts white in check
                        self.board = temp_board  # Temporarily make the move
                        if self.is_opponent_in_check('b'):
                            score += 50  # Prioritize moves that create check
                            
                            # Further check if it would result in checkmate
                            if self.is_checkmate('w'):
                                score += 1000  # Strongly prioritize checkmate
                        
                        # Restore the original board
                        self.board = [row[:] for row in self.board]
                        
                        # Evaluate positional advantage
                        # Center control is valuable
                        if 2 <= move[0] <= 5 and 2 <= move[1] <= 5:
                            score += 5
                        
                        # Pawn advancement
                        if piece[1] == 'P':
                            score += move[0]  # More advanced pawns are better
                        
                        # Development of pieces in early game
                        if piece[1] in ['N', 'B'] and r == 0:
                            score += 5  # Encourage development
                            
                        possible_moves.append((score, (r, c), move))
        
        if possible_moves:
            # Sort by score (highest first)
            possible_moves.sort(reverse=True)
            
            # Choose from top 3 moves with some randomness to avoid predictability
            # But always pick the best move if it's a significant advantage
            if len(possible_moves) > 2 and possible_moves[0][0] - possible_moves[2][0] < 20:
                import random
                choice = random.randint(0, min(2, len(possible_moves)-1))
                _, start_pos, end_pos = possible_moves[choice]
            else:
                # Pick the highest scoring move
                _, start_pos, end_pos = possible_moves[0]
                
            piece = self.get_piece(start_pos[0], start_pos[1])
            
            # Make the move
            target_piece = self.get_piece(end_pos[0], end_pos[1])
            if target_piece:
                self.captured_pieces[piece[0]].append(target_piece)
                
            self.place_piece(end_pos[0], end_pos[1], piece)
            self.place_piece(start_pos[0], start_pos[1], None)
            
            # Check for pawn promotion
            if piece[1] == 'P' and end_pos[0] == 7:
                self.promote_pawn(end_pos[0], end_pos[1], 'Q')  # Always promote to queen
            
            return True
        
        return False
