
#!/usr/bin/env python3
import os
import sys
import subprocess
import platform

def install_dependencies():
    """Install required dependencies."""
    print("Installing required dependencies...")
    
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error installing dependencies: {e}")
        return False

def setup_environment():
    """Set up the necessary environment for the chess application."""
    # Create necessary directories
    if not os.path.exists("static"):
        os.makedirs("static")
    
    if not os.path.exists("static/images"):
        os.makedirs("static/images")
    
    if not os.path.exists("static/css"):
        os.makedirs("static/css")
    
    if not os.path.exists("templates"):
        os.makedirs("templates")
    
    # Copy the uploaded logo to static/images
    logo_path = "public/lovable-uploads/25911913-6628-4280-b7e9-a698abb23440.png"
    if os.path.exists(logo_path):
        import shutil
        shutil.copy2(logo_path, "static/images/logo.png")
    
    return True

def run_chess_app():
    """Run the chess application."""
    print("\nStarting 𝝨 CHESS application...")
    
    try:
        subprocess.check_call([sys.executable, "main.py"])
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running chess application: {e}")
        return False
    except KeyboardInterrupt:
        print("\nApplication terminated by user.")
        return True

def main():
    """Main function to install dependencies and run the chess application."""
    print("𝝨 CHESS - Installation and Launch Script")
    print("========================================")
    
    # Check Python version
    if sys.version_info < (3, 6):
        print("Error: Python 3.6 or higher is required.")
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        print("\nFailed to install dependencies. Please check your internet connection and try again.")
        sys.exit(1)
    
    # Set up environment
    if not setup_environment():
        print("\nFailed to set up the environment. Please check file permissions and try again.")
        sys.exit(1)
    
    # Run the chess application
    if not run_chess_app():
        print("\nFailed to run the chess application. Please check the error message above and try again.")
        sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        print("\nPlease try again or report this issue.")
        
        if platform.system() != "Windows":
            sys.exit(1)
        
        # On Windows, keep the console window open
        input("\nPress Enter to exit...")
