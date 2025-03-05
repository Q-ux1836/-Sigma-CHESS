// Chess Piece Types
export enum PieceType {
  PAWN = 'pawn',
  ROOK = 'rook',
  KNIGHT = 'knight',
  BISHOP = 'bishop',
  QUEEN = 'queen',
  KING = 'king'
}

// Chess Colors
export enum PieceColor {
  WHITE = 'white',
  BLACK = 'black'
}

// Game Modes
export enum GameMode {
  HUMAN_VS_HUMAN = 'human_vs_human',
  HUMAN_VS_AI = 'human_vs_ai',
  MULTIPLAYER = 'multiplayer'
}

// Chess Piece Interface
export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved?: boolean;
}

// Position Interface
export interface Position {
  row: number;
  col: number;
}

// Move Interface
export interface Move {
  from: Position;
  to: Position;
  promotion?: PieceType;
}

// Game State Interface
export interface GameState {
  board: (ChessPiece | null)[][];
  currentTurn: PieceColor;
  selectedPiece: Position | null;
  possibleMoves: Position[];
  gameMode: GameMode;
  isCheck: boolean;
  isCheckmate: boolean;
  capturedPieces: ChessPiece[];
  moveHistory: Move[];
  promotionPending?: {
    from: Position;
    to: Position;
  };
}

// Initialize the chess board
export function initializeBoard(): (ChessPiece | null)[][] {
  const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

  // Initialize pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: PieceType.PAWN, color: PieceColor.BLACK, position: { row: 1, col } };
    board[6][col] = { type: PieceType.PAWN, color: PieceColor.WHITE, position: { row: 6, col } };
  }

  // Initialize rooks
  board[0][0] = { type: PieceType.ROOK, color: PieceColor.BLACK, position: { row: 0, col: 0 } };
  board[0][7] = { type: PieceType.ROOK, color: PieceColor.BLACK, position: { row: 0, col: 7 } };
  board[7][0] = { type: PieceType.ROOK, color: PieceColor.WHITE, position: { row: 7, col: 0 } };
  board[7][7] = { type: PieceType.ROOK, color: PieceColor.WHITE, position: { row: 7, col: 7 } };

  // Initialize knights
  board[0][1] = { type: PieceType.KNIGHT, color: PieceColor.BLACK, position: { row: 0, col: 1 } };
  board[0][6] = { type: PieceType.KNIGHT, color: PieceColor.BLACK, position: { row: 0, col: 6 } };
  board[7][1] = { type: PieceType.KNIGHT, color: PieceColor.WHITE, position: { row: 7, col: 1 } };
  board[7][6] = { type: PieceType.KNIGHT, color: PieceColor.WHITE, position: { row: 7, col: 6 } };

  // Initialize bishops
  board[0][2] = { type: PieceType.BISHOP, color: PieceColor.BLACK, position: { row: 0, col: 2 } };
  board[0][5] = { type: PieceType.BISHOP, color: PieceColor.BLACK, position: { row: 0, col: 5 } };
  board[7][2] = { type: PieceType.BISHOP, color: PieceColor.WHITE, position: { row: 7, col: 2 } };
  board[7][5] = { type: PieceType.BISHOP, color: PieceColor.WHITE, position: { row: 7, col: 5 } };

  // Initialize queens
  board[0][3] = { type: PieceType.QUEEN, color: PieceColor.BLACK, position: { row: 0, col: 3 } };
  board[7][3] = { type: PieceType.QUEEN, color: PieceColor.WHITE, position: { row: 7, col: 3 } };

  // Initialize kings
  board[0][4] = { type: PieceType.KING, color: PieceColor.BLACK, position: { row: 0, col: 4 } };
  board[7][4] = { type: PieceType.KING, color: PieceColor.WHITE, position: { row: 7, col: 4 } };

  return board;
}

// Initialize game state
export function initializeGame(gameMode: GameMode): GameState {
  return {
    board: initializeBoard(),
    currentTurn: PieceColor.WHITE,
    selectedPiece: null,
    possibleMoves: [],
    gameMode,
    isCheck: false,
    isCheckmate: false,
    capturedPieces: [],
    moveHistory: []
  };
}

// Check if a position is on the board
export function isValidPosition(position: Position): boolean {
  return position.row >= 0 && position.row < 8 && position.col >= 0 && position.col < 8;
}

// Find the king position for a color
export function findKingPosition(board: (ChessPiece | null)[][], color: PieceColor): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === PieceType.KING && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

// Check if a position is under attack by the opposing color
export function isPositionUnderAttack(position: Position, board: (ChessPiece | null)[][], attackingColor: PieceColor): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === attackingColor) {
        // Get raw moves without considering check
        const rawMoves = getRawPieceMoves(piece, board);
        // Check if any move can reach the target position
        if (rawMoves.some(move => move.row === position.row && move.col === position.col)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Check if the king is in check
export function isKingInCheck(board: (ChessPiece | null)[][], kingColor: PieceColor): boolean {
  const kingPosition = findKingPosition(board, kingColor);
  if (!kingPosition) return false;
  
  const opponentColor = kingColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  return isPositionUnderAttack(kingPosition, board, opponentColor);
}

// Get raw piece moves without check validation
export function getRawPieceMoves(piece: ChessPiece, board: (ChessPiece | null)[][]): Position[] {
  const { type, color, position } = piece;
  const moves: Position[] = [];

  switch (type) {
    case PieceType.PAWN:
      // Pawns move differently based on color
      const direction = color === PieceColor.WHITE ? -1 : 1;
      const startingRow = color === PieceColor.WHITE ? 6 : 1;
      
      // Forward move
      const forwardMove = { row: position.row + direction, col: position.col };
      if (isValidPosition(forwardMove) && board[forwardMove.row][forwardMove.col] === null) {
        moves.push(forwardMove);
        
        // Double move from starting position
        if (position.row === startingRow) {
          const doubleMove = { row: position.row + 2 * direction, col: position.col };
          if (isValidPosition(doubleMove) && board[doubleMove.row][doubleMove.col] === null) {
            moves.push(doubleMove);
          }
        }
      }
      
      // Capture moves
      const captureMoves = [
        { row: position.row + direction, col: position.col - 1 },
        { row: position.row + direction, col: position.col + 1 }
      ];
      
      for (const move of captureMoves) {
        if (isValidPosition(move) && board[move.row][move.col] !== null && 
            board[move.row][move.col]?.color !== color) {
          moves.push(move);
        }
      }
      break;
      
    case PieceType.ROOK:
      // Rooks move horizontally and vertically
      const rookDirections = [
        { row: 1, col: 0 },  // Down
        { row: -1, col: 0 }, // Up
        { row: 0, col: 1 },  // Right
        { row: 0, col: -1 }, // Left
      ];
      
      for (const dir of rookDirections) {
        let newPos = { row: position.row + dir.row, col: position.col + dir.col };
        
        while (isValidPosition(newPos)) {
          if (board[newPos.row][newPos.col] === null) {
            moves.push({ ...newPos });
          } else if (board[newPos.row][newPos.col]?.color !== color) {
            moves.push({ ...newPos });
            break;
          } else {
            break;
          }
          
          newPos = { row: newPos.row + dir.row, col: newPos.col + dir.col };
        }
      }
      break;
      
    case PieceType.KNIGHT:
      // Knights move in L-shape
      const knightMoves = [
        { row: position.row - 2, col: position.col - 1 },
        { row: position.row - 2, col: position.col + 1 },
        { row: position.row - 1, col: position.col - 2 },
        { row: position.row - 1, col: position.col + 2 },
        { row: position.row + 1, col: position.col - 2 },
        { row: position.row + 1, col: position.col + 2 },
        { row: position.row + 2, col: position.col - 1 },
        { row: position.row + 2, col: position.col + 1 }
      ];
      
      for (const move of knightMoves) {
        if (isValidPosition(move) && 
            (board[move.row][move.col] === null || board[move.row][move.col]?.color !== color)) {
          moves.push(move);
        }
      }
      break;
      
    case PieceType.BISHOP:
      // Bishops move diagonally
      const bishopDirections = [
        { row: 1, col: 1 },   // Down-Right
        { row: 1, col: -1 },  // Down-Left
        { row: -1, col: 1 },  // Up-Right
        { row: -1, col: -1 }, // Up-Left
      ];
      
      for (const dir of bishopDirections) {
        let newPos = { row: position.row + dir.row, col: position.col + dir.col };
        
        while (isValidPosition(newPos)) {
          if (board[newPos.row][newPos.col] === null) {
            moves.push({ ...newPos });
          } else if (board[newPos.row][newPos.col]?.color !== color) {
            moves.push({ ...newPos });
            break;
          } else {
            break;
          }
          
          newPos = { row: newPos.row + dir.row, col: newPos.col + dir.col };
        }
      }
      break;
      
    case PieceType.QUEEN:
      // Queens move like rooks and bishops combined
      const queenDirections = [
        { row: 1, col: 0 },   // Down
        { row: -1, col: 0 },  // Up
        { row: 0, col: 1 },   // Right
        { row: 0, col: -1 },  // Left
        { row: 1, col: 1 },   // Down-Right
        { row: 1, col: -1 },  // Down-Left
        { row: -1, col: 1 },  // Up-Right
        { row: -1, col: -1 }, // Up-Left
      ];
      
      for (const dir of queenDirections) {
        let newPos = { row: position.row + dir.row, col: position.col + dir.col };
        
        while (isValidPosition(newPos)) {
          if (board[newPos.row][newPos.col] === null) {
            moves.push({ ...newPos });
          } else if (board[newPos.row][newPos.col]?.color !== color) {
            moves.push({ ...newPos });
            break;
          } else {
            break;
          }
          
          newPos = { row: newPos.row + dir.row, col: newPos.col + dir.col };
        }
      }
      break;
      
    case PieceType.KING:
      // Kings move one square in any direction
      const kingMoves = [
        { row: position.row - 1, col: position.col - 1 },
        { row: position.row - 1, col: position.col },
        { row: position.row - 1, col: position.col + 1 },
        { row: position.row, col: position.col - 1 },
        { row: position.row, col: position.col + 1 },
        { row: position.row + 1, col: position.col - 1 },
        { row: position.row + 1, col: position.col },
        { row: position.row + 1, col: position.col + 1 }
      ];
      
      for (const move of kingMoves) {
        if (isValidPosition(move) && 
            (board[move.row][move.col] === null || board[move.row][move.col]?.color !== color)) {
          moves.push(move);
        }
      }
      break;
  }
  
  return moves;
}

// Get possible moves for a piece, filtering out moves that would leave the king in check
export function getPossibleMoves(piece: ChessPiece, board: (ChessPiece | null)[][]): Position[] {
  const rawMoves = getRawPieceMoves(piece, board);
  const validMoves: Position[] = [];
  
  // For each potential move, check if making it would put/leave the king in check
  for (const move of rawMoves) {
    // Create a temporary board to simulate the move
    const tempBoard = board.map(row => [...row]);
    
    // Simulate the move
    const pieceClone = { ...piece, position: { ...move } };
    tempBoard[move.row][move.col] = pieceClone;
    tempBoard[piece.position.row][piece.position.col] = null;
    
    // Check if the king is in check after the move
    const kingInCheck = isKingInCheck(tempBoard, piece.color);
    
    if (!kingInCheck) {
      validMoves.push(move);
    }
  }
  
  return validMoves;
}

// Check if a pawn can be promoted
export function isPawnPromotion(from: Position, to: Position, board: (ChessPiece | null)[][]): boolean {
  const piece = board[from.row][from.col];
  if (!piece || piece.type !== PieceType.PAWN) return false;
  
  // Pawns are promoted when they reach the opposite end of the board
  return (piece.color === PieceColor.WHITE && to.row === 0) || 
         (piece.color === PieceColor.BLACK && to.row === 7);
}

// Promote a pawn to a new piece type
export function promotePawn(gameState: GameState, promotionType: PieceType): GameState {
  if (!gameState.promotionPending) return gameState;
  
  const { from, to } = gameState.promotionPending;
  const newBoard = gameState.board.map(row => [...row]);
  const piece = newBoard[from.row][from.col];
  
  if (!piece) return gameState;
  
  // Create the promoted piece
  const promotedPiece: ChessPiece = {
    type: promotionType,
    color: piece.color,
    position: { ...to },
    hasMoved: true
  };
  
  // Place the promoted piece
  newBoard[to.row][to.col] = promotedPiece;
  newBoard[from.row][from.col] = null;
  
  // Add move to history
  const newMoveHistory = [...gameState.moveHistory, { 
    from, 
    to,
    promotion: promotionType
  }];
  
  // Toggle current turn
  const newTurn = gameState.currentTurn === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  
  return {
    ...gameState,
    board: newBoard,
    currentTurn: newTurn,
    selectedPiece: null,
    possibleMoves: [],
    promotionPending: undefined,
    moveHistory: newMoveHistory
  };
}

// Check if a player is in checkmate
export function isCheckmate(gameState: GameState, color: PieceColor): boolean {
  // If the king is not in check, it's not checkmate
  if (!isKingInCheck(gameState.board, color)) {
    return false;
  }
  
  // Try to find any legal move that would get the king out of check
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === color) {
        const possibleMoves = getPossibleMoves(piece, gameState.board);
        if (possibleMoves.length > 0) {
          return false; // There's at least one legal move
        }
      }
    }
  }
  
  // No legal moves found, and the king is in check: it's checkmate
  return true;
}

// Move a piece on the board
export function movePiece(from: Position, to: Position, gameState: GameState): GameState {
  const newBoard = gameState.board.map(row => [...row]);
  const piece = newBoard[from.row][from.col];
  
  if (!piece) return gameState;
  
  // Check if the move is valid
  const possibleMoves = getPossibleMoves(piece, newBoard);
  const isValidMove = possibleMoves.some(move => move.row === to.row && move.col === to.col);
  
  if (!isValidMove) return gameState;
  
  // Check for pawn promotion
  if (piece.type === PieceType.PAWN && isPawnPromotion(from, to, newBoard)) {
    return {
      ...gameState,
      promotionPending: { from, to }
    };
  }
  
  // Check if the move is a capture
  const capturedPiece = newBoard[to.row][to.col];
  const newCapturedPieces = [...gameState.capturedPieces];
  
  if (capturedPiece) {
    newCapturedPieces.push(capturedPiece);
  }
  
  // Update piece position
  piece.position = { ...to };
  piece.hasMoved = true;
  
  // Move the piece
  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;
  
  // Add move to history
  const newMoveHistory = [...gameState.moveHistory, { from, to }];
  
  // Toggle current turn
  const newTurn = gameState.currentTurn === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  
  // Check if the opponent is now in check or checkmate
  const opponentColor = newTurn;
  const isInCheck = isKingInCheck(newBoard, opponentColor);
  const isInCheckmate = isInCheck && isCheckmate({ ...gameState, board: newBoard, currentTurn: newTurn }, opponentColor);
  
  return {
    ...gameState,
    board: newBoard,
    currentTurn: newTurn,
    selectedPiece: null,
    possibleMoves: [],
    isCheck: isInCheck,
    isCheckmate: isInCheckmate,
    capturedPieces: newCapturedPieces,
    moveHistory: newMoveHistory
  };
}

// Simple AI move function (random legal move)
export function makeAIMove(gameState: GameState): GameState {
  const { board, currentTurn } = gameState;
  const aiPieces: ChessPiece[] = [];
  
  // Find all AI pieces
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === currentTurn) {
        aiPieces.push(piece);
      }
    }
  }
  
  // Shuffle pieces for randomness
  const shuffledPieces = [...aiPieces].sort(() => Math.random() - 0.5);
  
  // Find a piece that can move
  for (const piece of shuffledPieces) {
    const moves = getPossibleMoves(piece, board);
    
    if (moves.length > 0) {
      // Select a random move
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      
      // Make the move
      return movePiece(piece.position, randomMove, gameState);
    }
  }
  
  // If no moves are available, return the current game state
  return gameState;
}
