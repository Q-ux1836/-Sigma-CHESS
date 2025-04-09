
# 𝝨 CHESS

A Python-based chess application with customizable pieces and AI opponent.

![Sigma Chess](static/images/logo.png)

## Features

- Play chess against another human or AI opponent
- Customizable chess pieces (upload your own images)
- Multiple board styles
- Pawn promotion
- Check and checkmate detection
- Captured pieces display

## Requirements

- Python 3.6 or higher
- Flask
- PyQt5 (for desktop version)
- PyInstaller (for creating executable)
- Pillow (for image processing)

## Installation

### Quick Start

Run the installation script:

```bash
python install_and_run.py
```

This will install all required dependencies and launch the application.

### Manual Installation

1. Install required packages:

```bash
pip install -r requirements.txt
```

2. Run the application:

```bash
python main.py
```

## Custom Chess Pieces

The application can use custom chess piece images from your desktop:

`C:/Users/user/Desktop/chess/images/`

The expected file names for the pieces are:
- `wK.png` - White King
- `wQ.png` - White Queen
- `wR.png` - White Rook
- `wB.png` - White Bishop
- `wN.png` - White Knight
- `wP.png` - White Pawn
- `bK.png` - Black King
- `bQ.png` - Black Queen
- `bR.png` - Black Rook
- `bB.png` - Black Bishop
- `bN.png` - Black Knight
- `bP.png` - Black Pawn

You can also upload custom pieces directly in the application.

## Building an Executable

To build a standalone executable:

```bash
python -m PyInstaller --onefile --windowed --icon=static/images/logo.png --name="Sigma-Chess" main.py
```

The executable will be created in the `dist` directory.

## License

This project is open source and available under the MIT License.
