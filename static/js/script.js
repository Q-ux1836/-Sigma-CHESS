
// DOM Elements
const chessBoard = document.getElementById('chess-board');
const whiteCapturedContainer = document.getElementById('white-captured-pieces');
const blackCapturedContainer = document.getElementById('black-captured-pieces');
const resetButton = document.getElementById('reset-game');
const gameModeSelect = document.getElementById('game-mode');
const promotionDialog = document.getElementById('promotion-dialog');

// Game state
let gameState = null;

// Initialize the game
async function initGame() {
    try {
        const response = await fetch('/api/game-state');
        gameState = await response.json();
        renderBoard();
        renderCapturedPieces();
    } catch (error) {
        console.error('Error initializing game:', error);
    }
}

// Render the chess board
function renderBoard() {
    chessBoard.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `chess-square ${(row + col) % 2 === 0 ? 'square-light' : 'square-dark'}`;
            
            // Add selected class if applicable
            if (gameState.selectedPiece && gameState.selectedPiece.row === row && gameState.selectedPiece.col === col) {
                square.classList.add('square-selected');
            }
            
            // Add movable class if applicable
            const isPossibleMove = gameState.possibleMoves.some(move => move.row === row && move.col === col);
            if (isPossibleMove) {
                square.classList.add('square-movable');
            }
            
            // Add piece if there is one
            const piece = gameState.board[row][col];
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = 'chess-piece';
                
                const img = document.createElement('img');
                img.src = `/lovable-uploads/${getPieceImage(piece.type, piece.color)}`;
                img.alt = `${piece.color} ${piece.type}`;
                
                pieceElement.appendChild(img);
                square.appendChild(pieceElement);
            }
            
            // Add click event
            square.dataset.row = row;
            square.dataset.col = col;
            square.addEventListener('click', handleSquareClick);
            
            chessBoard.appendChild(square);
        }
    }
}

// Helper function to get the correct image for a piece
function getPieceImage(type, color) {
    const imageMap = {
        [PieceType.PAWN]: {
            [PieceColor.WHITE]: '3418cc24-b2db-406f-849a-38af9c17790f.png',
            [PieceColor.BLACK]: '1c3d4630-5dfc-48e7-9de1-f4e424e65a19.png'
        },
        [PieceType.ROOK]: {
            [PieceColor.WHITE]: 'b16be7f8-775a-4791-9bc1-52afcf217e18.png',
            [PieceColor.BLACK]: 'dc87ed84-84de-4d26-9042-9170ab8437c2.png'
        },
        [PieceType.KNIGHT]: {
            [PieceColor.WHITE]: '393e47b6-0886-49a4-9c05-cf4b876f0ce5.png',
            [PieceColor.BLACK]: '0f8ca98b-a8dc-4f72-a2e5-5e040c3f3cbf.png'
        },
        [PieceType.BISHOP]: {
            [PieceColor.WHITE]: '364cc47a-6d27-459b-92dc-f535fea3a950.png',
            [PieceColor.BLACK]: '3418cc24-b2db-406f-849a-38af9c17790f.png'
        },
        [PieceType.QUEEN]: {
            [PieceColor.WHITE]: '79184c56-bca9-4c3f-8a2b-77c53134c8e6.png',
            [PieceColor.BLACK]: 'fbf27461-95a7-4b74-8e6c-3611a187691f.png'
        },
        [PieceType.KING]: {
            [PieceColor.WHITE]: '9a763d59-7f80-45ab-9dcd-c9eff361b961.png',
            [PieceColor.BLACK]: 'a5cbe14a-8516-4fd8-8bc1-ce46f2b351c4.png'
        }
    };
    
    return imageMap[type][color];
}

// Handle clicking on a square
async function handleSquareClick(event) {
    if (gameState.promotionPending) return; // Don't allow moves during promotion
    
    const row = parseInt(event.currentTarget.dataset.row);
    const col = parseInt(event.currentTarget.dataset.col);
    
    // If a piece is already selected
    if (gameState.selectedPiece) {
        const fromRow = gameState.selectedPiece.row;
        const fromCol = gameState.selectedPiece.col;
        
        // Check if clicking on a possible move
        const isMovePossible = gameState.possibleMoves.some(
            move => move.row === row && move.col === col
        );
        
        if (isMovePossible) {
            // Make the move
            try {
                const response = await fetch('/api/move-piece', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fromRow,
                        fromCol,
                        toRow: row,
                        toCol: col
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    gameState = result.gameState;
                    
                    // Check if promotion is pending
                    if (gameState.promotionPending) {
                        showPromotionDialog();
                    }
                    
                    renderBoard();
                    renderCapturedPieces();
                }
            } catch (error) {
                console.error('Error making move:', error);
            }
        } else {
            // Select a different piece or deselect
            try {
                const response = await fetch('/api/select-piece', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ row, col })
                });
                
                gameState = await response.json();
                renderBoard();
            } catch (error) {
                console.error('Error selecting piece:', error);
            }
        }
    } else {
        // Select a piece
        try {
            const response = await fetch('/api/select-piece', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ row, col })
            });
            
            gameState = await response.json();
            renderBoard();
        } catch (error) {
            console.error('Error selecting piece:', error);
        }
    }
}

// Render captured pieces
function renderCapturedPieces() {
    whiteCapturedContainer.innerHTML = '';
    blackCapturedContainer.innerHTML = '';
    
    gameState.capturedPieces[PieceColor.BLACK].forEach(piece => {
        const pieceElement = document.createElement('div');
        pieceElement.className = 'captured-piece';
        
        const img = document.createElement('img');
        img.src = `/lovable-uploads/${getPieceImage(piece.type, piece.color)}`;
        img.alt = `${piece.color} ${piece.type}`;
        
        pieceElement.appendChild(img);
        blackCapturedContainer.appendChild(pieceElement);
    });
    
    gameState.capturedPieces[PieceColor.WHITE].forEach(piece => {
        const pieceElement = document.createElement('div');
        pieceElement.className = 'captured-piece';
        
        const img = document.createElement('img');
        img.src = `/lovable-uploads/${getPieceImage(piece.type, piece.color)}`;
        img.alt = `${piece.color} ${piece.type}`;
        
        pieceElement.appendChild(img);
        whiteCapturedContainer.appendChild(pieceElement);
    });
}

// Show promotion dialog
function showPromotionDialog() {
    // Set the correct images based on the current turn
    document.getElementById('promotion-queen').src = `/lovable-uploads/${getPieceImage(PieceType.QUEEN, gameState.currentTurn)}`;
    document.getElementById('promotion-rook').src = `/lovable-uploads/${getPieceImage(PieceType.ROOK, gameState.currentTurn)}`;
    document.getElementById('promotion-bishop').src = `/lovable-uploads/${getPieceImage(PieceType.BISHOP, gameState.currentTurn)}`;
    document.getElementById('promotion-knight').src = `/lovable-uploads/${getPieceImage(PieceType.KNIGHT, gameState.currentTurn)}`;
    
    // Show the dialog
    promotionDialog.classList.add('active');
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay active';
    document.body.appendChild(overlay);
    
    // Add click handlers to promotion pieces
    const promotionPieces = document.querySelectorAll('.promotion-piece');
    promotionPieces.forEach(piece => {
        piece.addEventListener('click', async () => {
            const pieceType = piece.dataset.pieceType;
            
            try {
                const response = await fetch('/api/promote-pawn', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ pieceType })
                });
                
                const result = await response.json();
                if (result.success) {
                    gameState = result.gameState;
                    renderBoard();
                    renderCapturedPieces();
                    
                    // Hide dialog and overlay
                    promotionDialog.classList.remove('active');
                    document.querySelector('.overlay').remove();
                }
            } catch (error) {
                console.error('Error promoting pawn:', error);
            }
        });
    });
}

// Reset game
resetButton.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/reset-game', {
            method: 'POST'
        });
        
        gameState = await response.json();
        renderBoard();
        renderCapturedPieces();
    } catch (error) {
        console.error('Error resetting game:', error);
    }
});

// Game mode change
gameModeSelect.addEventListener('change', async () => {
    const gameMode = gameModeSelect.value;
    // In a real implementation, this would update the game mode on the server
    console.log(`Game mode changed to: ${gameMode}`);
});

// Constants
const PieceType = {
    PAWN: "pawn",
    ROOK: "rook",
    KNIGHT: "knight",
    BISHOP: "bishop",
    QUEEN: "queen",
    KING: "king"
};

const PieceColor = {
    WHITE: "white",
    BLACK: "black"
};

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', initGame);
