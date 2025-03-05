
import PyInstaller.__main__
import os
import shutil

def build_exe():
    print("Building chess game executable...")
    
    # Create necessary directories
    os.makedirs("dist/images", exist_ok=True)
    
    # PyInstaller arguments
    args = [
        "chess_game.py",
        "--name=ChessGame",
        "--onefile",
        "--windowed",
        "--icon=images/wK.png",  # Use white king as icon, adjust path if needed
        "--add-data=images;images"  # Include the images folder
    ]
    
    # Run PyInstaller
    PyInstaller.__main__.run(args)
    
    print("Build completed! Executable is located in the 'dist' folder.")

if __name__ == "__main__":
    build_exe()
