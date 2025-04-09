
import os
from PyQt5.QtWidgets import QDialog, QPushButton, QGridLayout
from PyQt5.QtGui import QIcon

class PawnPromotionDialog(QDialog):
    def __init__(self, color, parent=None):
        super().__init__(parent)
        self.color = color
        self.selected_piece = 'Q'  # Default to Queen
        self.setWindowTitle("Pawn Promotion")
        
        layout = QGridLayout()
        
        pieces = ['Q', 'R', 'B', 'N']
        piece_names = ['Queen', 'Rook', 'Bishop', 'Knight']
        
        # Try to find the image path
        base_path = os.path.dirname(os.path.abspath(__file__))
        image_paths = [
            os.path.join(base_path, "images"),  # Try local images directory
            os.path.join(os.path.dirname(base_path), "images"),  # Try parent directory
            "C:/Users/user/Desktop/chess/images/"  # Try hardcoded path
        ]
        
        image_path = None
        for path in image_paths:
            if os.path.exists(path):
                image_path = path
                break
        
        # Add piece buttons
        for i, (piece, name) in enumerate(zip(pieces, piece_names)):
            button = QPushButton(name)
            if image_path:
                piece_code = color + piece
                img_path = os.path.join(image_path, f"{piece_code}.png")
                if os.path.exists(img_path):
                    button.setIcon(QIcon(img_path))
            button.clicked.connect(lambda _, p=piece: self.select_piece(p))
            layout.addWidget(button, 0, i)
        
        self.setLayout(layout)

    def select_piece(self, piece):
        self.selected_piece = piece
        self.accept()
