
import sys
import os
import shutil
import subprocess

def build_executable():
    """Build the chess game into an executable."""
    try:
        # Check if PyInstaller is installed
        try:
            import PyInstaller
        except ImportError:
            print("PyInstaller is not installed. Installing now...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
            print("PyInstaller installed successfully.")
        
        # Get the directory of this script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        chess_script = os.path.join(script_dir, "chess_game.py")
        
        if not os.path.exists(chess_script):
            print(f"Error: Chess game script not found at {chess_script}")
            return False
            
        # Make sure the images directory exists
        images_dir = os.path.join(script_dir, "images")
        if not os.path.exists(images_dir):
            os.makedirs(images_dir)
            print(f"Created images directory at {images_dir}")
        
        # Create or ensure icon file exists
        icon_path = os.path.join(images_dir, "icon.png")
        if not os.path.exists(icon_path):
            try:
                # Try to use the white king as an icon if available
                king_icon = os.path.join(images_dir, "wK.png")
                if os.path.exists(king_icon):
                    shutil.copy2(king_icon, icon_path)
                    print(f"Using white king as icon: {icon_path}")
            except Exception as e:
                print(f"Warning: Could not create icon file: {e}")
        
        # Create build command
        build_command = [
            sys.executable, 
            "-m", 
            "PyInstaller",
            "--onefile",  # Create a single executable
            "--windowed",  # Don't show console window
            "--name", "ΣChess",
            "--add-data", f"{images_dir}{os.pathsep}images",  # Include images folder
        ]
        
        # Add icon if available
        if os.path.exists(icon_path):
            build_command.extend(["--icon", icon_path])
        
        # Add the main script
        build_command.append(chess_script)
        
        # Execute build command
        print("Building executable with PyInstaller...")
        subprocess.check_call(build_command)
        
        print("\nBuild completed successfully!")
        
        # Get the path to the executable
        dist_dir = os.path.join(script_dir, "dist")
        exe_name = "ΣChess.exe" if sys.platform == "win32" else "ΣChess"
        exe_path = os.path.join(dist_dir, exe_name)
        
        if os.path.exists(exe_path):
            print(f"\nExecutable created at: {exe_path}")
            return True
        else:
            print("Error: Executable not found after build.")
            return False
            
    except Exception as e:
        print(f"Error building executable: {e}")
        return False

if __name__ == "__main__":
    print("𝝨 CHESS - Executable Builder")
    print("-----------------------------")
    
    # Check if PyQt5 is installed
    try:
        import PyQt5
        print("PyQt5 is installed.")
    except ImportError:
        print("PyQt5 is not installed. Installing now...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "PyQt5"])
        print("PyQt5 installed successfully.")
    
    # Build the executable
    if build_executable():
        print("\nBuild completed successfully! You can now distribute the executable.")
    else:
        print("\nBuild failed. Please check the error messages above.")
