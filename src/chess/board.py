
import sys
import os
from PyQt5.QtWidgets import (QMainWindow, QGraphicsScene, QGraphicsView, 
                            QGraphicsPixmapItem, QGraphicsRectItem, QVBoxLayout, QWidget, 
                            QPushButton, QHBoxLayout, QGraphicsEllipseItem, QLabel, 
                            QMessageBox)
from PyQt5.QtGui import QPixmap, QColor, QBrush, QPainter, QIcon, QFont
from PyQt5.QtCore import QRectF, Qt, QTimer

from .logic import ChessLogic
from .dialogs import PawnPromotionDialog

class ChessBoard(QMainWindow):
    def __init__(self, chess_logic):
        super().__init__()
        self.chess_logic = chess_logic
        self.valid_moves = []  # Keep track of valid moves
        self.game_mode = "two_player"  # Default to two player mode
        self.ai_thinking = False
        
        # Set up the main window
        self.setWindowTitle("𝝨 CHESS")
        self.setGeometry(100, 100, 800, 700)
        
        # Try to set window icon
        icon_paths = [
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "images/icon.png"),
            "C:/Users/user/Desktop/chess_icon1"
        ]
        
        for path in icon_paths:
            if os.path.exists(path):
                self.setWindowIcon(QIcon(path))
                break

        # Central widget and layout
        self.central_widget = QWidget(self)
        self.setCentralWidget(self.central_widget)
        self.layout = QVBoxLayout(self.central_widget)

        # Game status display
        self.status_label = QLabel("White's turn")
        self.status_label.setAlignment(Qt.AlignCenter)
        self.status_label.setFont(QFont("Arial", 14, QFont.Bold))
        self.layout.addWidget(self.status_label)

        # ---- Button Layout ----
        self.button_layout = QHBoxLayout()  # Horizontal layout for buttons

        # Board style buttons
        self.standard_button = QPushButton("Standard", self)
        self.styled_button1 = QPushButton("Vintage", self)
        self.styled_button2 = QPushButton("Dark", self)
        self.alternative_button = QPushButton("High Contrast", self)

        self.button_layout.addWidget(self.standard_button)
        self.button_layout.addWidget(self.styled_button1)
        self.button_layout.addWidget(self.styled_button2)
        self.button_layout.addWidget(self.alternative_button)

        self.layout.addLayout(self.button_layout)
        
        # Game mode selection
        self.mode_layout = QHBoxLayout()
        self.two_player_button = QPushButton("Two Player", self)
        self.ai_button = QPushButton("vs AI", self)
        self.two_player_button.setStyleSheet("background-color: lightblue;")
        
        self.mode_layout.addWidget(self.two_player_button)
        self.mode_layout.addWidget(self.ai_button)
        self.layout.addLayout(self.mode_layout)

        # New game and quit buttons
        self.control_layout = QHBoxLayout()
        self.new_game_button = QPushButton("New Game", self)
        self.quit_button = QPushButton("Quit", self)
        
        self.control_layout.addWidget(self.new_game_button)
        self.control_layout.addWidget(self.quit_button)
        self.layout.addLayout(self.control_layout)

        # Scene and View
        self.scene = QGraphicsScene(self)
        self.view = QGraphicsView(self.scene, self)
        self.view.setRenderHint(QPainter.Antialiasing)
        self.view.setRenderHint(QPainter.SmoothPixmapTransform)
        self.layout.addWidget(self.view)

        # Board dimensions
        self.square_size = 70
        self.board_width = 8
        self.board_height = 8

        # Set up the chess piece images
        self.setup_piece_images()

        # Initial board setup
        self.create_standard_chessboard()
        self.place_pieces()

        # Button connections
        self.standard_button.clicked.connect(self.create_standard_chessboard)
        self.styled_button1.clicked.connect(self.create_styled_chessboard1)
        self.styled_button2.clicked.connect(self.create_styled_chessboard2)
        self.alternative_button.clicked.connect(self.create_alternative_chessboard)
        self.new_game_button.clicked.connect(self.reset_game)
        self.quit_button.clicked.connect(self.close)
        self.two_player_button.clicked.connect(lambda: self.set_game_mode("two_player"))
        self.ai_button.clicked.connect(lambda: self.set_game_mode("vs_ai"))

        # Mouse interaction
        self.selected_piece = None
        self.selected_pos = None
        self.view.mousePressEvent = self.handle_square_click
        
        # AI timer
        self.ai_timer = QTimer(self)
        self.ai_timer.timeout.connect(self.make_ai_move)

    def setup_piece_images(self):
        """Set up the chess piece images, including custom pieces."""
        # Default image paths
        base_dir = os.path.dirname(os.path.abspath(__file__))
        default_images_dir = os.path.join(base_dir, "images")
        custom_pieces_dir = os.path.join(base_dir, "custom_pieces")
        
        # Initialize with standard pieces
        self.piece_images = {
            'wK': os.path.join(default_images_dir, 'wK.png'),
            'wQ': os.path.join(default_images_dir, 'wQ.png'),
            'wR': os.path.join(default_images_dir, 'wR.png'),
            'wB': os.path.join(default_images_dir, 'wB.png'),
            'wN': os.path.join(default_images_dir, 'wN.png'),
            'wP': os.path.join(default_images_dir, 'wP.png'),
            'bK': os.path.join(default_images_dir, 'bK.png'),
            'bQ': os.path.join(default_images_dir, 'bQ.png'),
            'bR': os.path.join(default_images_dir, 'bR.png'),
            'bP': os.path.join(default_images_dir, 'bP.png'),
            'bN': os.path.join(default_images_dir, 'bN.png'),
            'bB': os.path.join(default_images_dir, 'bB.png')
        }
        
        # Override with custom pieces if they exist
        if os.path.exists(custom_pieces_dir):
            for file in os.listdir(custom_pieces_dir):
                if file.endswith('.png') and len(file) >= 3:
                    piece_code = file[:2]  # e.g., "wK" from "wK.png"
                    if piece_code in self.piece_images:
                        self.piece_images[piece_code] = os.path.join(custom_pieces_dir, file)
                        print(f"Using custom piece image for {piece_code}")

    def set_game_mode(self, mode):
        """Set the game mode."""
        self.game_mode = mode
        if mode == "two_player":
            self.two_player_button.setStyleSheet("background-color: lightblue;")
            self.ai_button.setStyleSheet("")
            self.status_label.setText("Two Player Mode - White's turn")
        else:
            self.two_player_button.setStyleSheet("")
            self.ai_button.setStyleSheet("background-color: lightblue;")
            self.status_label.setText("Playing against AI - White's turn")
        
        # Reset game when changing mode
        self.reset_game()

    def reset_game(self):
        """Reset the game to initial state."""
        self.chess_logic = ChessLogic()
        self.selected_pos = None
        self.valid_moves = []
        self.create_standard_chessboard()
        self.place_pieces()
        
        if self.game_mode == "two_player":
            self.status_label.setText("Two Player Mode - White's turn")
        else:
            self.status_label.setText("Playing against AI - White's turn")

    def create_standard_chessboard(self):
        self.scene.clear()
        self.create_chessboard()
        self.place_pieces()

    def create_styled_chessboard1(self):
        self.scene.clear()
        self.create_custom_chessboard(255, 223, 186, 111, 85, 59)
        self.place_pieces()

    def create_styled_chessboard2(self):
        self.scene.clear()
        self.create_custom_chessboard(150, 150, 150, 50, 50, 50)
        self.place_pieces()

    def create_alternative_chessboard(self):
        self.scene.clear()
        self.create_custom_chessboard(220, 220, 220, 40, 40, 40)
        self.place_pieces()

    def create_custom_chessboard(self, light_r, light_g, light_b, dark_r, dark_g, dark_b):
        """Create a chessboard with custom colors."""
        for row in range(self.board_height):
            for col in range(self.board_width):
                x = col * self.square_size
                y = row * self.square_size
                square_color = QColor(light_r, light_g, light_b) if (row + col) % 2 == 0 else QColor(dark_r, dark_g, dark_b)
                rect = QGraphicsRectItem(QRectF(x, y, self.square_size, self.square_size))
                rect.setBrush(square_color)
                self.scene.addItem(rect)

    def create_chessboard(self):
        """Create the standard chessboard with white and gray squares."""
        for row in range(self.board_height):
            for col in range(self.board_width):
                x = col * self.square_size
                y = row * self.square_size
                square_color = QColor(255, 255, 255) if (row + col) % 2 == 0 else QColor(169, 169, 169)
                rect = QGraphicsRectItem(QRectF(x, y, self.square_size, self.square_size))
                rect.setBrush(square_color)
                self.scene.addItem(rect)

    def place_pieces(self):
        """Place the chess pieces on the board according to the current game state."""
        for row in range(self.board_height):
            for col in range(self.board_width):
                piece = self.chess_logic.get_piece(row, col)
                if piece:
                    try:
                        piece_image = QPixmap(self.piece_images[piece])
                        # Scale the image to fit the square
                        piece_image = piece_image.scaled(
                            int(self.square_size * 0.9), 
                            int(self.square_size * 0.9),
                            Qt.KeepAspectRatio, 
                            Qt.SmoothTransformation
                        )
                        piece_item = QGraphicsPixmapItem(piece_image)
                        # Center the image in the square
                        offset_x = col * self.square_size + (self.square_size - piece_image.width()) / 2
                        offset_y = row * self.square_size + (self.square_size - piece_image.height()) / 2
                        piece_item.setOffset(offset_x, offset_y)
                        self.scene.addItem(piece_item)
                    except Exception as e:
                        print(f"Error loading piece image for {piece}: {e}")
    
    def draw_move_highlight(self, valid_moves):
        """Draw green dots to highlight valid move squares."""
        for (r, c) in valid_moves:
            x = c * self.square_size
            y = r * self.square_size
            ellipse = QGraphicsEllipseItem(QRectF(x + self.square_size/3, y + self.square_size/3, self.square_size/3, self.square_size/3))
            ellipse.setBrush(QColor(0, 255, 0, 100))  # Green dot with transparency
            self.scene.addItem(ellipse)

    def handle_square_click(self, event):
        """Handle mouse clicks on the chessboard."""
        if self.chess_logic.game_over or self.ai_thinking:
            return
            
        mouse_pos = event.pos()
        scene_pos = self.view.mapToScene(mouse_pos)
        row = int(scene_pos.y() // self.square_size)
        col = int(scene_pos.x() // self.square_size)

        # Check if the row and col are within the valid range
        if 0 <= row < self.board_height and 0 <= col < self.board_width:
            if self.selected_pos is None:
                selected_piece = self.chess_logic.get_piece(row, col)
                if selected_piece and selected_piece[0] == self.chess_logic.current_turn:
                    self.selected_pos = (row, col)
                    
                    # Refresh the board to remove previous highlights
                    self.refresh_board()  
                    
                    # Get valid moves and draw highlights
                    self.valid_moves = self.chess_logic.highlight_moves((row, col))
                    self.draw_move_highlight(self.valid_moves)

            else:
                start_pos = self.selected_pos
                end_pos = (row, col)
                selected_piece = self.chess_logic.get_piece(start_pos[0], start_pos[1])

                if end_pos in self.valid_moves:
                    # Handle the actual move
                    self.make_move(start_pos, end_pos)
                    
                    # If playing against AI, trigger AI move after player
                    if self.game_mode == "vs_ai" and self.chess_logic.current_turn == 'b' and not self.chess_logic.game_over:
                        self.ai_thinking = True
                        self.status_label.setText("AI is thinking...")
                        self.ai_timer.start(500)  # Give a small delay to simulate thinking
                else:
                    # If clicking on own piece, select that piece instead
                    clicked_piece = self.chess_logic.get_piece(row, col)
                    if clicked_piece and clicked_piece[0] == self.chess_logic.current_turn:
                        self.selected_pos = (row, col)
                        
                        # Refresh the board to remove previous highlights
                        self.refresh_board()
                        
                        # Get valid moves and draw highlights
                        self.valid_moves = self.chess_logic.highlight_moves((row, col))
                        self.draw_move_highlight(self.valid_moves)
                    else:
                        # Deselect if clicking elsewhere
                        self.selected_pos = None
                        self.valid_moves = []
                        self.refresh_board()
                        
        else:
            print("Clicked outside the board")

    def make_move(self, start_pos, end_pos):
        """Make a move on the board."""
        start_row, start_col = start_pos
        end_row, end_col = end_pos
        selected_piece = self.chess_logic.get_piece(start_row, start_col)
        
        # Capture opponent's piece if present
        target_piece = self.chess_logic.get_piece(end_row, end_col)
        if target_piece:
            opponent_color = 'b' if selected_piece[0] == 'w' else 'w'
            self.chess_logic.captured_pieces[selected_piece[0]].append(target_piece)

        # Handle king and rook movement for castling
        if selected_piece[1] == 'K':
            self.chess_logic.kings_moved[selected_piece[0]] = True
            
            # Detect castling
            if abs(start_col - end_col) == 2:
                # Kingside castling
                if end_col > start_col:
                    rook_start_col = 7
                    rook_end_col = end_col - 1
                # Queenside castling
                else:
                    rook_start_col = 0
                    rook_end_col = end_col + 1
                    
                rook = self.chess_logic.get_piece(start_row, rook_start_col)
                self.chess_logic.place_piece(start_row, rook_end_col, rook)
                self.chess_logic.place_piece(start_row, rook_start_col, None)
        
        # Track rook movement for castling
        if selected_piece[1] == 'R':
            color = selected_piece[0]
            if start_row == (7 if color == 'w' else 0):
                if start_col == 0:  # Queenside rook
                    self.chess_logic.rooks_moved[color]['queenside'] = True
                elif start_col == 7:  # Kingside rook
                    self.chess_logic.rooks_moved[color]['kingside'] = True

        # Move the piece
        self.chess_logic.place_piece(end_row, end_col, selected_piece)
        self.chess_logic.place_piece(start_row, start_col, None)
        
        # Check for pawn promotion
        if self.chess_logic.handle_pawn_promotion(end_row, end_col):
            self.handle_promotion_dialog(end_row, end_col, selected_piece[0])
        
        # Change turn
        self.chess_logic.current_turn = 'b' if self.chess_logic.current_turn == 'w' else 'w'
        
        # Refresh board and reset selection
        self.selected_pos = None
        self.valid_moves = []
        self.refresh_board()
        
        # Check for check, checkmate or stalemate
        self.check_game_status()

    def make_ai_move(self):
        """Make an AI move."""
        self.ai_timer.stop()
        
        if self.chess_logic.make_ai_move():
            # Change turn back to player
            self.chess_logic.current_turn = 'w'
            self.refresh_board()
            
            # Check for check, checkmate or stalemate
            self.check_game_status()
        
        self.ai_thinking = False

    def handle_promotion_dialog(self, row, col, color):
        """Show dialog for pawn promotion."""
        dialog = PawnPromotionDialog(color, self)
        if dialog.exec_():
            promoted_piece = dialog.selected_piece
            self.chess_logic.promote_pawn(row, col, promoted_piece)

    def check_game_status(self):
        """Check for check, checkmate, or stalemate."""
        current_color = self.chess_logic.current_turn
        opponent_color = 'w' if current_color == 'b' else 'b'
        
        # Check if current player is in check
        in_check = self.chess_logic.is_opponent_in_check(opponent_color)
        
        # Check if current player is in checkmate
        if in_check and self.chess_logic.is_checkmate(current_color):
            self.chess_logic.game_over = True
            self.chess_logic.winner = opponent_color
            winner = "White" if opponent_color == 'w' else "Black"
            self.status_label.setText(f"Checkmate! {winner} wins!")
            QMessageBox.information(self, "Game Over", f"Checkmate! {winner} wins!")
            return
            
        # Check for stalemate
        if self.chess_logic.is_stalemate(current_color):
            self.chess_logic.game_over = True
            self.status_label.setText("Stalemate! The game is a draw.")
            QMessageBox.information(self, "Game Over", "Stalemate! The game is a draw.")
            return
            
        # Update status for check
        if in_check:
            turn = "White's" if current_color == 'w' else "Black's"
            self.status_label.setText(f"{turn} turn - Check!")
        else:
            turn = "White's" if current_color == 'w' else "Black's"
            self.status_label.setText(f"{turn} turn")

    def refresh_board(self):
        """Refresh the board display."""
        # Redraw the board
        if self.scene.items():
            # Get the first item to determine board style
            first_item = self.scene.items()[-1]  # Last added item is the first square
            if isinstance(first_item, QGraphicsRectItem):
                color = first_item.brush().color()
                
                # Recreate the board with the same style
                if color == QColor(255, 255, 255) or color == QColor(169, 169, 169):
                    self.create_standard_chessboard()
                elif color == QColor(255, 223, 186) or color == QColor(111, 85, 59):
                    self.create_styled_chessboard1()
                elif color == QColor(150, 150, 150) or color == QColor(50, 50, 50):
                    self.create_styled_chessboard2()
                elif color == QColor(220, 220, 220) or color == QColor(40, 40, 40):
                    self.create_alternative_chessboard()
                else:
                    self.create_standard_chessboard()
            else:
                self.create_standard_chessboard()
        else:
            self.create_standard_chessboard()
