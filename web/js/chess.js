
// Chess Piece Types and Colors
const PieceType = {
    PAWN: 'pawn',
    ROOK: 'rook',
    KNIGHT: 'knight',
    BISHOP: 'bishop',
    QUEEN: 'queen',
    KING: 'king'
};

const PieceColor = {
    WHITE: 'white',
    BLACK: 'black'
};

// Image paths for the chess pieces
const PIECE_IMAGES = {
    'white': {
        'pawn': '/lovable-uploads/68deda6e-0257-437e-8a96-ebf4be651592.png',
        'rook': '/lovable-uploads/c954dc96-c90f-4faf-a1ad-2d6c20b5bc1c.png',
        'knight': '/lovable-uploads/7dc10eb4-08f6-41a4-a4e8-293f333e92b2.png',
        'bishop': '/lovable-uploads/1fe7bb25-78b3-4e64-9524-3eb4dd0f66e3.png',
        'queen': '/lovable-uploads/bc8ca135-f693-4e57-bc85-cae391227a7a.png',
        'king': '/lovable-uploads/29bbe838-33f0-40c4-98b8-c95ef9aa1e66.png'
    },
    'black': {
        'pawn': '/lovable-uploads/42db49b6-4535-4db8-a445-c3f233f38136.png',
        'rook': '/lovable-uploads/a84e8f3a-313e-4cfd-b6da-541a3c84dd32.png',
        'knight': '/lovable-uploads/94bcdfe7-3b05-4721-b0ad-e748321de400.png',
        'bishop': '/lovable-uploads/c506906f-2e4f-43bf-85b9-e1485ce8088c.png',
        'queen': '/lovable-uploads/bede6588-797b-47e5-98bd-bba03accda0a.png',
        'king': '/lovable-uploads/2c29fb54-b770-4192-ad2e-f15afd2c7323.png'
    }
};

// Chess Game Logic
class ChessGame {
    constructor() {
        this.initialize();
        this.setupEventListeners();
    }

    initialize() {
        this.board = this.createInitialBoard();
        this.currentTurn = PieceColor.WHITE;
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.capturedPieces = {
            [PieceColor.WHITE]: [],
            [PieceColor.BLACK]: []
        };
        this.promotionPending = false;
        this.promotionPosition = null;
        this.isCheck = false;
        this.isCheckmate = false;
        this.currentTheme = 'standard';
        
        this.createChessBoard();
        this.updateGameStatus();
    }

    createInitialBoard() {
        const board = Array(8).fill().map(() => Array(8).fill(null));
        
        // Initialize pawns
        for (let col = 0; col < 8; col++) {
            board[1][col] = { type: PieceType.PAWN, color: PieceColor.BLACK };
            board[6][col] = { type: PieceType.PAWN, color: PieceColor.WHITE };
        }
        
        // Initialize back row pieces
        const backRowOrder = [
            PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.QUEEN,
            PieceType.KING, PieceType.BISHOP, PieceType.KNIGHT, PieceType.ROOK
        ];
        
        for (let col = 0; col < 8; col++) {
            board[0][col] = { type: backRowOrder[col], color: PieceColor.BLACK };
            board[7][col] = { type: backRowOrder[col], color: PieceColor.WHITE };
        }
        
        return board;
    }

    createChessBoard() {
        const chessBoard = document.getElementById('chess-board');
        chessBoard.innerHTML = '';
        chessBoard.className = `chess-board ${this.currentTheme}-theme`;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = 'chess-square';
                square.classList.add((row + col) % 2 === 0 ? 'square-light' : 'square-dark');
                square.dataset.row = row;
                square.dataset.col = col;
                
                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = 'chess-piece';
                    
                    const img = document.createElement('img');
                    img.src = PIECE_IMAGES[piece.color][piece.type];
                    img.alt = `${piece.color} ${piece.type}`;
                    
                    pieceElement.appendChild(img);
                    square.appendChild(pieceElement);
                }
                
                // Highlight selected piece and possible moves
                if (this.selectedPiece && this.selectedPiece.row === row && this.selectedPiece.col === col) {
                    square.classList.add('square-selected');
                }
                
                if (this.possibleMoves.some(move => move.row === row && move.col === col)) {
                    square.classList.add('square-movable');
                }
                
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                chessBoard.appendChild(square);
            }
        }
        
        this.updateCapturedPieces();
    }

    handleSquareClick(row, col) {
        if (this.promotionPending || this.isCheckmate) return;
        
        if (!this.selectedPiece) {
            // Try to select a piece
            const piece = this.board[row][col];
            if (piece && piece.color === this.currentTurn) {
                this.selectedPiece = { row, col };
                this.possibleMoves = this.getPossibleMoves(row, col);
                this.createChessBoard();
            }
        } else {
            // Try to move the selected piece
            const startRow = this.selectedPiece.row;
            const startCol = this.selectedPiece.col;
            
            if (this.isValidMove({ row: startRow, col: startCol }, { row, col })) {
                this.movePiece(startRow, startCol, row, col);
            } else {
                // If clicked on another own piece, select it instead
                const piece = this.board[row][col];
                if (piece && piece.color === this.currentTurn) {
                    this.selectedPiece = { row, col };
                    this.possibleMoves = this.getPossibleMoves(row, col);
                    this.createChessBoard();
                } else {
                    // Deselect if clicking elsewhere
                    this.selectedPiece = null;
                    this.possibleMoves = [];
                    this.createChessBoard();
                }
            }
        }
    }

    isValidMove(from, to) {
        return this.possibleMoves.some(move => move.row === to.row && move.col === to.col);
    }

    getPossibleMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const moves = [];
        const { type, color } = piece;
        
        switch (type) {
            case PieceType.PAWN:
                this.getPawnMoves(row, col, color, moves);
                break;
            case PieceType.ROOK:
                this.getRookMoves(row, col, color, moves);
                break;
            case PieceType.KNIGHT:
                this.getKnightMoves(row, col, color, moves);
                break;
            case PieceType.BISHOP:
                this.getBishopMoves(row, col, color, moves);
                break;
            case PieceType.QUEEN:
                this.getQueenMoves(row, col, color, moves);
                break;
            case PieceType.KING:
                this.getKingMoves(row, col, color, moves);
                break;
        }
        
        return moves;
    }

    getPawnMoves(row, col, color, moves) {
        const direction = color === PieceColor.WHITE ? -1 : 1;
        const startRow = color === PieceColor.WHITE ? 6 : 1;
        
        // Forward move
        if (this.isInBounds(row + direction, col) && !this.board[row + direction][col]) {
            moves.push({ row: row + direction, col });
            
            // Double move from starting position
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }
        
        // Capture moves
        const captureCols = [col - 1, col + 1];
        for (const captureCol of captureCols) {
            if (this.isInBounds(row + direction, captureCol)) {
                const targetPiece = this.board[row + direction][captureCol];
                if (targetPiece && targetPiece.color !== color) {
                    moves.push({ row: row + direction, col: captureCol });
                }
            }
        }
    }

    getRookMoves(row, col, color, moves) {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right
        this.getLinearMoves(row, col, color, directions, moves);
    }

    getKnightMoves(row, col, color, moves) {
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        for (const [dr, dc] of knightMoves) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isInBounds(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    }

    getBishopMoves(row, col, color, moves) {
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // Diagonals
        this.getLinearMoves(row, col, color, directions, moves);
    }

    getQueenMoves(row, col, color, moves) {
        this.getRookMoves(row, col, color, moves);
        this.getBishopMoves(row, col, color, moves);
    }

    getKingMoves(row, col, color, moves) {
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        
        for (const [dr, dc] of kingMoves) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isInBounds(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    }

    getLinearMoves(row, col, color, directions, moves) {
        for (const [dr, dc] of directions) {
            let newRow = row + dr;
            let newCol = col + dc;
            
            while (this.isInBounds(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (targetPiece.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break; // Stop when hitting a piece
                }
                
                newRow += dr;
                newCol += dc;
            }
        }
    }

    isInBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    movePiece(startRow, startCol, endRow, endCol) {
        const piece = this.board[startRow][startCol];
        
        // Check for capture
        if (this.board[endRow][endCol]) {
            this.capturedPieces[piece.color].push(this.board[endRow][endCol]);
        }
        
        // Move the piece
        this.board[endRow][endCol] = piece;
        this.board[startRow][startCol] = null;
        
        // Check for pawn promotion
        if (piece.type === PieceType.PAWN && (endRow === 0 || endRow === 7)) {
            this.promotionPending = true;
            this.promotionPosition = { startRow, startCol, endRow, endCol };
            this.showPromotionDialog(piece.color);
        } else {
            this.finishMove();
        }
    }

    finishMove() {
        // Switch turns
        this.currentTurn = this.currentTurn === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
        this.selectedPiece = null;
        this.possibleMoves = [];
        
        // Check for check/checkmate
        this.checkGameState();
        
        // Update the UI
        this.createChessBoard();
        this.updateGameStatus();
    }

    checkGameState() {
        // Simple check/checkmate detection (would need more complex logic for a complete implementation)
        this.isCheck = false;
        this.isCheckmate = false;
        
        // For simplicity, we're just setting a game message
        // A full implementation would detect check and checkmate
    }

    promotePawn(pieceType) {
        if (!this.promotionPending) return;
        
        const { endRow, endCol } = this.promotionPosition;
        const piece = this.board[endRow][endCol];
        
        if (piece && piece.type === PieceType.PAWN) {
            piece.type = pieceType;
            
            this.promotionPending = false;
            this.promotionPosition = null;
            this.hidePromotionDialog();
            
            this.finishMove();
        }
    }

    showPromotionDialog(color) {
        // Set promotion piece images to the current color
        document.getElementById('promotion-queen').src = PIECE_IMAGES[color][PieceType.QUEEN];
        document.getElementById('promotion-rook').src = PIECE_IMAGES[color][PieceType.ROOK];
        document.getElementById('promotion-bishop').src = PIECE_IMAGES[color][PieceType.BISHOP];
        document.getElementById('promotion-knight').src = PIECE_IMAGES[color][PieceType.KNIGHT];
        
        document.getElementById('overlay').classList.add('active');
        document.getElementById('promotion-dialog').classList.add('active');
    }

    hidePromotionDialog() {
        document.getElementById('overlay').classList.remove('active');
        document.getElementById('promotion-dialog').classList.remove('active');
    }

    updateCapturedPieces() {
        const blackCapturedContainer = document.getElementById('black-captured-pieces');
        const whiteCapturedContainer = document.getElementById('white-captured-pieces');
        
        blackCapturedContainer.innerHTML = '';
        whiteCapturedContainer.innerHTML = '';
        
        this.capturedPieces[PieceColor.BLACK].forEach(piece => {
            const capturedPiece = document.createElement('div');
            capturedPiece.className = 'captured-piece';
            
            const img = document.createElement('img');
            img.src = PIECE_IMAGES[piece.color][piece.type];
            img.alt = `${piece.color} ${piece.type}`;
            
            capturedPiece.appendChild(img);
            blackCapturedContainer.appendChild(capturedPiece);
        });
        
        this.capturedPieces[PieceColor.WHITE].forEach(piece => {
            const capturedPiece = document.createElement('div');
            capturedPiece.className = 'captured-piece';
            
            const img = document.createElement('img');
            img.src = PIECE_IMAGES[piece.color][piece.type];
            img.alt = `${piece.color} ${piece.type}`;
            
            capturedPiece.appendChild(img);
            whiteCapturedContainer.appendChild(capturedPiece);
        });
    }

    updateGameStatus() {
        const currentTurnElement = document.getElementById('current-turn');
        const gameMessageElement = document.getElementById('game-message');
        
        currentTurnElement.textContent = `Current turn: ${this.currentTurn === PieceColor.WHITE ? 'White' : 'Black'}`;
        
        if (this.isCheckmate) {
            const winner = this.currentTurn === PieceColor.WHITE ? 'Black' : 'White';
            gameMessageElement.textContent = `Checkmate! ${winner} wins!`;
        } else if (this.isCheck) {
            gameMessageElement.textContent = `${this.currentTurn === PieceColor.WHITE ? 'White' : 'Black'} is in check!`;
        } else {
            gameMessageElement.textContent = '';
        }
    }

    setTheme(theme) {
        this.currentTheme = theme;
        this.createChessBoard();
    }

    resetGame() {
        this.initialize();
    }

    setupEventListeners() {
        // Theme button listeners
        document.getElementById('standard-theme').addEventListener('click', () => this.setTheme('standard'));
        document.getElementById('vintage-theme').addEventListener('click', () => this.setTheme('vintage'));
        document.getElementById('dark-theme').addEventListener('click', () => this.setTheme('dark'));
        document.getElementById('high-contrast-theme').addEventListener('click', () => this.setTheme('high-contrast'));
        
        // New game button
        document.getElementById('new-game').addEventListener('click', () => this.resetGame());
        
        // Promotion piece selection
        const promotionPieces = document.querySelectorAll('.promotion-piece');
        promotionPieces.forEach(element => {
            element.addEventListener('click', () => {
                const pieceType = element.dataset.pieceType;
                this.promotePawn(pieceType);
            });
        });
    }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChessGame();
});
