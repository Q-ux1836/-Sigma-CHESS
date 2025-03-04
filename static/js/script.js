
document.addEventListener('DOMContentLoaded', function() {
    // Chess board and pieces
    const chessBoard = document.getElementById('chess-board');
    const blackCapturedContainer = document.getElementById('black-captured-pieces');
    const whiteCapturedContainer = document.getElementById('white-captured-pieces');
    const resetButton = document.getElementById('reset-game');
    const gameModeSelect = document.getElementById('game-mode');
    const promotionDialog = document.getElementById('promotion-dialog');
    const boardStyleSelect = document.getElementById('board-style');
    
    // Game state
    let gameState = null;
    let selectedSquare = null;
    let possibleMoves = [];
    
    // Piece images mapping
    const pieceImages = {
        'white': {
            'pawn': '/lovable-uploads/3418cc24-b2db-406f-849a-38af9c17790f.png',
            'rook': '/lovable-uploads/b16be7f8-775a-4791-9bc1-52afcf217e18.png',
            'knight': '/lovable-uploads/393e47b6-0886-49a4-9c05-cf4b876f0ce5.png',
            'bishop': '/lovable-uploads/364cc47a-6d27-459b-92dc-f535fea3a950.png',
            'queen': '/lovable-uploads/79184c56-bca9-4c3f-8a2b-77c53134c8e6.png',
            'king': '/lovable-uploads/9a763d59-7f80-45ab-9dcd-c9eff361b961.png'
        },
        'black': {
            'pawn': '/lovable-uploads/1c3d4630-5dfc-48e7-9de1-f4e424e65a19.png',
            'rook': '/lovable-uploads/dc87ed84-84de-4d26-9042-9170ab8437c2.png',
            'knight': '/lovable-uploads/0f8ca98b-a8dc-4f72-a2e5-5e040c3f3cbf.png',
            'bishop': '/lovable-uploads/3418cc24-b2db-406f-849a-38af9c17790f.png',
            'queen': '/lovable-uploads/fbf27461-95a7-4b74-8e6c-3611a187691f.png',
            'king': '/lovable-uploads/a5cbe14a-8516-4fd8-8bc1-ce46f2b351c4.png'
        }
    };
    
    // Board styles
    const boardStyles = {
        'classic': {
            light: 'square-light',
            dark: 'square-dark'
        },
        'blue': {
            light: 'square-light-blue',
            dark: 'square-dark-blue'
        },
        'green': {
            light: 'square-light-green',
            dark: 'square-dark-green'
        }
    };
    
    // Initialize chess board
    function initializeBoard() {
        // Clear the board
        chessBoard.innerHTML = '';
        
        // Get current board style
        const currentStyle = boardStyleSelect.value;
        
        // Create squares
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.classList.add('chess-square');
                
                // Apply square color
                if ((row + col) % 2 === 0) {
                    square.classList.add(boardStyles[currentStyle].light);
                } else {
                    square.classList.add(boardStyles[currentStyle].dark);
                }
                
                // Set data attributes
                square.dataset.row = row;
                square.dataset.col = col;
                
                // Add click event
                square.addEventListener('click', handleSquareClick);
                
                // Add to board
                chessBoard.appendChild(square);
            }
        }
        
        // Initialize promotion dialog images
        document.getElementById('promotion-queen').src = pieceImages['white']['queen'];
        document.getElementById('promotion-rook').src = pieceImages['white']['rook'];
        document.getElementById('promotion-bishop').src = pieceImages['white']['bishop'];
        document.getElementById('promotion-knight').src = pieceImages['white']['knight'];
        
        // Fetch initial game state
        fetchGameState();
    }
    
    // Fetch game state from server
    async function fetchGameState() {
        try {
            const response = await fetch('/api/game-state');
            gameState = await response.json();
            updateBoard();
        } catch (error) {
            console.error('Error fetching game state:', error);
        }
    }
    
    // Update the board based on game state
    function updateBoard() {
        // Update pieces
        const squares = chessBoard.querySelectorAll('.chess-square');
        squares.forEach(square => {
            // Remove existing pieces
            while (square.firstChild) {
                square.removeChild(square.firstChild);
            }
            
            // Get square position
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            
            // Get piece at this position
            const piece = gameState.board[row][col];
            
            if (piece) {
                // Create piece element
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('chess-piece');
                
                // Create image element
                const imgElement = document.createElement('img');
                imgElement.src = pieceImages[piece.color][piece.type];
                imgElement.alt = `${piece.color} ${piece.type}`;
                
                // Add image to piece
                pieceElement.appendChild(imgElement);
                
                // Add piece to square
                square.appendChild(pieceElement);
            }
            
            // Update square highlighting
            square.classList.remove('square-selected', 'square-movable');
            
            // Highlight selected piece
            if (gameState.selectedPiece && 
                gameState.selectedPiece.row === row && 
                gameState.selectedPiece.col === col) {
                square.classList.add('square-selected');
            }
            
            // Highlight possible moves
            if (gameState.possibleMoves && gameState.possibleMoves.some(move => 
                move.row === row && move.col === col)) {
                square.classList.add('square-movable');
            }
        });
        
        // Update captured pieces
        updateCapturedPieces();
        
        // Show promotion dialog if needed
        if (gameState.promotionPending) {
            showPromotionDialog(gameState.currentTurn);
        } else {
            hidePromotionDialog();
        }
    }
    
    // Update captured pieces display
    function updateCapturedPieces() {
        // Clear containers
        blackCapturedContainer.innerHTML = '';
        whiteCapturedContainer.innerHTML = '';
        
        // Process captured pieces
        if (gameState.capturedPieces) {
            // Black pieces (captured by white)
            if (Array.isArray(gameState.capturedPieces.black)) {
                gameState.capturedPieces.black.forEach(piece => {
                    const capturedPiece = document.createElement('div');
                    capturedPiece.classList.add('captured-piece');
                    
                    const img = document.createElement('img');
                    img.src = pieceImages[piece.color][piece.type];
                    img.alt = `${piece.color} ${piece.type}`;
                    
                    capturedPiece.appendChild(img);
                    blackCapturedContainer.appendChild(capturedPiece);
                });
            }
            
            // White pieces (captured by black)
            if (Array.isArray(gameState.capturedPieces.white)) {
                gameState.capturedPieces.white.forEach(piece => {
                    const capturedPiece = document.createElement('div');
                    capturedPiece.classList.add('captured-piece');
                    
                    const img = document.createElement('img');
                    img.src = pieceImages[piece.color][piece.type];
                    img.alt = `${piece.color} ${piece.type}`;
                    
                    capturedPiece.appendChild(img);
                    whiteCapturedContainer.appendChild(capturedPiece);
                });
            }
        }
    }
    
    // Handle square click
    async function handleSquareClick(event) {
        const square = event.currentTarget;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        // If promotion is pending, don't allow other moves
        if (gameState.promotionPending) {
            return;
        }
        
        // Get piece at clicked position
        const piece = gameState.board[row][col];
        
        // If a piece is already selected
        if (gameState.selectedPiece) {
            const selectedRow = gameState.selectedPiece.row;
            const selectedCol = gameState.selectedPiece.col;
            
            // Check if the clicked square is a valid move
            const isValidMove = gameState.possibleMoves.some(
                move => move.row === row && move.col === col
            );
            
            if (isValidMove) {
                // Make the move
                try {
                    const response = await fetch('/api/move-piece', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            fromRow: selectedRow,
                            fromCol: selectedCol,
                            toRow: row,
                            toCol: col
                        })
                    });
                    
                    const result = await response.json();
                    if (result.success) {
                        gameState = result.gameState;
                        updateBoard();
                    }
                } catch (error) {
                    console.error('Error making move:', error);
                }
            } else if (piece && piece.color === gameState.currentTurn) {
                // Select a new piece
                try {
                    const response = await fetch('/api/select-piece', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            row: row,
                            col: col
                        })
                    });
                    
                    gameState = await response.json();
                    updateBoard();
                } catch (error) {
                    console.error('Error selecting piece:', error);
                }
            } else {
                // Deselect current piece
                gameState.selectedPiece = null;
                gameState.possibleMoves = [];
                updateBoard();
            }
        } else if (piece && piece.color === gameState.currentTurn) {
            // Select a piece
            try {
                const response = await fetch('/api/select-piece', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        row: row,
                        col: col
                    })
                });
                
                gameState = await response.json();
                updateBoard();
            } catch (error) {
                console.error('Error selecting piece:', error);
            }
        }
    }
    
    // Show promotion dialog
    function showPromotionDialog(color) {
        // Update images based on color
        document.getElementById('promotion-queen').src = pieceImages[color]['queen'];
        document.getElementById('promotion-rook').src = pieceImages[color]['rook'];
        document.getElementById('promotion-bishop').src = pieceImages[color]['bishop'];
        document.getElementById('promotion-knight').src = pieceImages[color]['knight'];
        
        // Show dialog
        promotionDialog.classList.add('active');
        document.querySelector('.overlay').classList.add('active');
        
        // Add click events to promotion options
        const promotionPieces = document.querySelectorAll('.promotion-piece');
        promotionPieces.forEach(piece => {
            piece.onclick = async function() {
                const pieceType = this.dataset.pieceType;
                try {
                    const response = await fetch('/api/promote-pawn', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            pieceType: pieceType
                        })
                    });
                    
                    const result = await response.json();
                    if (result.success) {
                        gameState = result.gameState;
                        updateBoard();
                    }
                } catch (error) {
                    console.error('Error promoting pawn:', error);
                }
                
                hidePromotionDialog();
            };
        });
    }
    
    // Hide promotion dialog
    function hidePromotionDialog() {
        promotionDialog.classList.remove('active');
        document.querySelector('.overlay').classList.remove('active');
    }
    
    // Reset game
    resetButton.addEventListener('click', async function() {
        try {
            const response = await fetch('/api/reset-game', {
                method: 'POST'
            });
            
            gameState = await response.json();
            updateBoard();
        } catch (error) {
            console.error('Error resetting game:', error);
        }
    });
    
    // Change game mode
    gameModeSelect.addEventListener('change', function() {
        gameState.gameMode = this.value;
    });
    
    // Change board style
    boardStyleSelect.addEventListener('change', function() {
        initializeBoard();
    });
    
    // Initialize the board
    initializeBoard();
});
