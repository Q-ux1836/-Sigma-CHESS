
import os
import shutil

def create_images_dir_if_needed():
    """Create the images and custom_pieces directories if they don't exist."""
    # Get the directory where the script/executable is located
    base_dir = os.path.dirname(os.path.abspath(__file__))
    images_dir = os.path.join(base_dir, "images")
    custom_pieces_dir = os.path.join(base_dir, "custom_pieces")
    
    # Create the images directory if it doesn't exist
    if not os.path.exists(images_dir):
        os.makedirs(images_dir)
        print(f"Created images directory at {images_dir}")
    
    # Create the custom_pieces directory if it doesn't exist
    if not os.path.exists(custom_pieces_dir):
        os.makedirs(custom_pieces_dir)
        print(f"Created custom pieces directory at {custom_pieces_dir}")
        
    # Try to find source images
    source_dirs = [
        "C:/Users/user/Desktop/chess/images/",
        os.path.join(os.path.dirname(base_dir), "images"),
        os.path.join(base_dir, "assets"),
        os.path.join(os.path.dirname(base_dir), "assets")
    ]
    
    source_dir = None
    for dir_path in source_dirs:
        if os.path.exists(dir_path):
            source_dir = dir_path
            break
            
    if source_dir:
        # Copy existing images
        print(f"Copying chess piece images from {source_dir}")
        piece_colors = ['w', 'b']  # white, black
        piece_types = ['K', 'Q', 'R', 'B', 'N', 'P']  # king, queen, rook, bishop, knight, pawn
        
        for color in piece_colors:
            for piece_type in piece_types:
                piece_code = color + piece_type
                source_path = os.path.join(source_dir, f"{piece_code}.png")
                if os.path.exists(source_path):
                    dest_path = os.path.join(images_dir, f"{piece_code}.png")
                    shutil.copy2(source_path, dest_path)
                    print(f"Copied {piece_code}.png")
    else:
        print("No source images found. Please add chess piece images to the 'images' directory.")
    
    # Check for custom pieces
    custom_piece_exists = False
    if os.path.exists(custom_pieces_dir):
        for file in os.listdir(custom_pieces_dir):
            if file.endswith('.png'):
                custom_piece_exists = True
                break
    
    if not custom_piece_exists:
        print("No custom piece images found. You can add custom piece images to the 'custom_pieces' directory.")
