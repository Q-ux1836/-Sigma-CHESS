
import os
import sys
import shutil
import subprocess

def build_executable():
    """Build an executable for the 𝝨 CHESS application."""
    print("𝝨 CHESS - Executable Builder")
    print("============================")
    
    # Check if PyInstaller is installed
    try:
        import PyInstaller
        print("PyInstaller is installed.")
    except ImportError:
        print("PyInstaller is not installed. Installing now...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "PyInstaller"])
            print("PyInstaller installed successfully.")
        except subprocess.CalledProcessError:
            print("Failed to install PyInstaller. Please install it manually with 'pip install pyinstaller'")
            return False
    
    # Ensure images directory exists
    if not os.path.exists("static/images"):
        os.makedirs("static/images", exist_ok=True)
    
    # Copy logo to static/images if it exists
    logo_path = "public/lovable-uploads/25911913-6628-4280-b7e9-a698abb23440.png"
    if os.path.exists(logo_path):
        shutil.copy2(logo_path, "static/images/logo.png")
        icon_path = os.path.abspath("static/images/logo.png")
    else:
        icon_path = None
    
    # Build command
    cmd = [
        sys.executable, 
        "-m", 
        "PyInstaller",
        "--onefile",
        "--windowed",
        "--name=Sigma-Chess",
        "--add-data", f"static{os.pathsep}static",
        "--add-data", f"templates{os.pathsep}templates",
    ]
    
    # Add icon if available
    if icon_path and os.path.exists(icon_path):
        cmd.extend(["--icon", icon_path])
    
    # Add main script
    cmd.append("main.py")
    
    print("\nBuilding executable...")
    print(f"Command: {' '.join(cmd)}")
    
    try:
        subprocess.check_call(cmd)
        print("\nBuild completed successfully!")
        
        # Get the path to the executable
        if sys.platform == "win32":
            exe_path = os.path.abspath("dist/Sigma-Chess.exe")
        else:
            exe_path = os.path.abspath("dist/Sigma-Chess")
        
        if os.path.exists(exe_path):
            print(f"\nExecutable created at: {exe_path}")
            return True
        else:
            print("\nExecutable not found after build. Check the PyInstaller output for errors.")
            return False
    
    except subprocess.CalledProcessError as e:
        print(f"\nError building executable: {e}")
        return False

if __name__ == "__main__":
    try:
        result = build_executable()
        if not result:
            print("\nFailed to build executable. See error messages above.")
        
        if sys.platform == "win32":
            input("\nPress Enter to exit...")
    except KeyboardInterrupt:
        print("\nBuild cancelled by user.")
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")
        
        if sys.platform == "win32":
            input("\nPress Enter to exit...")
