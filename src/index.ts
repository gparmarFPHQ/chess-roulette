/**
 * Chess-Roulette Worker with Durable Object for matchmaking, game state, and WebSocket signaling
 */

import { Chess, Move } from 'chess.js';

// ============================================================================
// TYPES
// ============================================================================

interface QueuedPlayer {
	connId: string;
	ws: WebSocket;
}

interface Game {
	chess: Chess;
	whiteConnId: string;
	blackConnId: string;
	whiteWs: WebSocket;
	blackWs: WebSocket;
}

// ============================================================================
// DURABLE OBJECT - ChessGameDO
// Handles: matchmaking queue, game room, WebSocket hub, WebRTC signaling
// ============================================================================

export class ChessGameDO {
	private clients: Map<string, WebSocket> = new Map();
	private connectionCounter: number = 0;
	
	// Matchmaking queue (FIFO)
	private queue: QueuedPlayer[] = [];
	
	// Active games (for this prototype, one game at a time)
	private game: Game | null = null;

	constructor(private state: DurableObjectState, private env: Env) {}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		// Upgrade to WebSocket
		if (url.pathname === "/ws") {
			const [client, server] = Object.values(new WebSocketPair());

			this.handleWebSocket(server);

			return new Response(null, {
				status: 101,
				webSocket: client,
			});
		}

		return new Response("Not Found", { status: 404 });
	}

	private handleWebSocket(ws: WebSocket): void {
		const connId = `conn_${++this.connectionCounter}_${Date.now()}`;
		
		// Add to clients map FIRST, before accepting
		this.clients.set(connId, ws);
		console.log(`[CONN] Opened: ${connId} (clients.size=${this.clients.size})`);
		
		// CRITICAL: Must accept the WebSocket before sending messages
		this.state.acceptWebSocket(ws);

		// Send connection confirmation to client immediately
		this.sendToClient(ws, {
			type: "connected",
			connId,
		});
	}

	// WebSocket message handler - called by Cloudflare DO runtime
	async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
		// Find the connection ID for this WebSocket by looking it up in our map
		let connId: string | null = null;
		for (const [id, clientWs] of this.clients.entries()) {
			if (clientWs === ws) {
				connId = id;
				break;
			}
		}

		if (!connId) {
			// This can happen if the WebSocket closed before we processed the message
			console.error(`[PARSE] WebSocket not in clients map (map size: ${this.clients.size})`);
			return;
		}

		try {
			const data = typeof message === "string" ? message : new TextDecoder().decode(message);
			this.handleMessage(ws, connId, data);
		} catch (error) {
			console.error(`[ERROR] ${connId}:`, error);
			this.sendToClient(ws, {
				type: "error",
				message: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	// WebSocket close handler - called by Cloudflare DO runtime
	async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
		// Find the connection ID for this WebSocket
		let connId: string | null = null;
		for (const [id, clientWs] of this.clients.entries()) {
			if (clientWs === ws) {
				connId = id;
				break;
			}
		}

		if (connId) {
			console.log(`[CONN] Closed: ${connId} (code=${code}, clean=${wasClean})`);
			this.clients.delete(connId);
			
			// Handle player disconnect
			this.handleDisconnect(connId);
		}
	}

	private handleMessage(ws: WebSocket, connId: string, data: string): void {
		let msg: any;
		try {
			msg = JSON.parse(data);
		} catch (error) {
			console.error(`[PARSE] ${connId}: Invalid JSON`);
			this.sendToClient(ws, {
				type: "error",
				message: "Invalid JSON message",
			});
			return;
		}

		if (!msg || typeof msg.type !== "string") {
			console.error(`[PARSE] ${connId}: Missing message type`);
			this.sendToClient(ws, {
				type: "error",
				message: "Message must have a 'type' field",
			});
			return;
		}

		console.log(`[RECV] ${connId}: ${msg.type}`, msg);

		// Route message by type
		switch (msg.type) {
			case "ping":
				this.handlePing(ws, connId);
				break;
			case "echo":
				this.handleEcho(ws, connId, msg);
				break;
			case "join_queue":
				this.handleJoinQueue(ws, connId);
				break;
			case "move":
				this.handleMove(ws, connId, msg);
				break;
			// WebRTC signaling messages - relay to opponent without modification
			case "webrtc_offer":
				this.handleSignaling(connId, "offer", msg.sdp);
				break;
			case "webrtc_answer":
				this.handleSignaling(connId, "answer", msg.sdp);
				break;
			case "webrtc_ice":
				this.handleSignaling(connId, "ice", msg.candidate);
				break;
			default:
				console.log(`[UNKNOWN] ${connId}: Unknown message type '${msg.type}'`);
				this.sendToClient(ws, {
					type: "unknown_type",
					messageType: msg.type,
				});
		}
	}

	private handlePing(ws: WebSocket, connId: string): void {
		console.log(`[PING] ${connId}`);
		this.sendToClient(ws, {
			type: "pong",
			connId,
			timestamp: Date.now(),
		});
	}

	private handleEcho(ws: WebSocket, connId: string, msg: any): void {
		const text = msg.text ?? "";
		console.log(`[ECHO] ${connId}: "${text}"`);

		const relayMsg = {
			type: "echo_relay",
			from: connId,
			text,
			timestamp: Date.now(),
		};

		// Broadcast to ALL connected clients
		this.broadcast(relayMsg);
	}

	private handleJoinQueue(ws: WebSocket, connId: string): void {
		console.log(`[QUEUE] ${connId} joined (queue.length=${this.queue.length})`);
		
		// Check if already in queue
		const alreadyQueued = this.queue.some(p => p.connId === connId);
		if (alreadyQueued) {
			console.log(`[QUEUE] ${connId} already in queue`);
			return;
		}
		
		// Check if already in a game
		if (this.game && (this.game.whiteConnId === connId || this.game.blackConnId === connId)) {
			console.log(`[QUEUE] ${connId} already in a game`);
			this.sendToClient(ws, {
				type: "already_in_game",
			});
			return;
		}
		
		// Add to queue
		this.queue.push({ connId, ws });
		console.log(`[QUEUE] ${connId} added, queue length: ${this.queue.length}`);
		
		// Send queued confirmation
		this.sendToClient(ws, {
			type: "queued",
			position: this.queue.length,
		});
		
		// Check if we have 2 players
		if (this.queue.length >= 2) {
			this.startMatch();
		}
	}

	private startMatch(): void {
		if (this.queue.length < 2) return;
		
		// Get first two players from queue
		const player1 = this.queue.shift()!;
		const player2 = this.queue.shift()!;
		
		// First player is White, second is Black
		const whiteConnId = player1.connId;
		const blackConnId = player2.connId;
		
		console.log(`[MATCH] Creating game: White=${whiteConnId}, Black=${blackConnId}`);
		
		// Create new game
		this.game = {
			chess: new Chess(),
			whiteConnId,
			blackConnId,
			whiteWs: player1.ws,
			blackWs: player2.ws,
		};
		
		// Notify both players
		this.sendToClient(player1.ws, {
			type: "matched",
			color: "white",
			opponent: blackConnId,
			fen: this.game.chess.fen(),
			turn: "white",
		});
		
		this.sendToClient(player2.ws, {
			type: "matched",
			color: "black",
			opponent: whiteConnId,
			fen: this.game.chess.fen(),
			turn: "white",
		});
		
		console.log(`[MATCH] Game started, White to move`);
	}

	private handleMove(ws: WebSocket, connId: string, msg: any): void {
		if (!this.game) {
			console.log(`[MOVE] ${connId}: No active game`);
			this.sendToClient(ws, {
				type: "move_rejected",
				reason: "No active game",
			});
			return;
		}
		
		// Verify player is in this game
		const isWhite = connId === this.game.whiteConnId;
		const isBlack = connId === this.game.blackConnId;
		
		if (!isWhite && !isBlack) {
			console.log(`[MOVE] ${connId}: Not a player in this game`);
			this.sendToClient(ws, {
				type: "move_rejected",
				reason: "Not a player in this game",
			});
			return;
		}
		
		// Verify it's the player's turn
		const expectedTurn = this.game.chess.turn() === 'w' ? 'white' : 'black';
		const playerColor = isWhite ? 'white' : 'black';
		
		if (playerColor !== expectedTurn) {
			console.log(`[MOVE] ${connId}: Not your turn (expected ${expectedTurn}, got ${playerColor})`);
			this.sendToClient(ws, {
				type: "move_rejected",
				reason: "Not your turn",
				expectedTurn,
			});
			return;
		}
		
		// Try to make the move
		try {
			const move: Move = {
				from: msg.from,
				to: msg.to,
				promotion: msg.promotion || 'q',
			};
			
			// Debug: Log current state before move
			const legalMovesFrom = this.game.chess.moves({ square: msg.from });
			const isCheck = this.game.chess.isCheck();
			const allLegalMoves = this.game.chess.moves();
			console.log(`[MOVE_DEBUG] ${connId}: Attempting ${msg.from}-${msg.to}, isCheck=${isCheck}, legalMovesFromSquare=${legalMovesFrom.length}, allLegalMoves=${allLegalMoves.length}, FEN=${this.game.chess.fen()}`);
			
			const result = this.game.chess.move(move);
			
			if (!result) {
				console.log(`[MOVE] ${connId}: Invalid move ${msg.from}-${msg.to} (move() returned null)`);
				this.sendToClient(ws, {
					type: "move_rejected",
					reason: "Invalid move",
					from: msg.from,
					to: msg.to,
				});
				return;
			}
			
			// Move is valid and made
			const newFen = this.game.chess.fen();
			const isCheckAfter = this.game.chess.isCheck();
			const isCheckmate = this.game.chess.isCheckmate();
			const isDraw = this.game.chess.isDraw() || this.game.chess.isStalemate();
			const nextTurn = this.game.chess.turn() === 'w' ? 'white' : 'black';
			
			console.log(`[MOVE] ${connId}: ${msg.from}-${msg.to} (valid, check=${isCheckAfter}, mate=${isCheckmate})`);
			
			// Broadcast move_made to BOTH players
			const moveMadeMsg = {
				type: "move_made",
				from: msg.from,
				to: msg.to,
				promotion: msg.promotion || 'q',
				fen: newFen,
				turn: nextTurn,
				isCheck: isCheckAfter,
				isCheckmate,
				isDraw,
			};
			
			this.broadcast(moveMadeMsg);
			
			// Check for game over
			if (isCheckmate || isDraw) {
				this.handleGameOver(isCheckmate ? 'checkmate' : 'draw');
			}
			
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : "Unknown error";
			console.error(`[MOVE] ${connId}: Error processing move: ${errorMsg}`);
			console.error(`[MOVE] ${connId}: Stack trace:`, error instanceof Error ? error.stack : 'N/A');
			this.sendToClient(ws, {
				type: "move_rejected",
				reason: errorMsg,
				from: msg.from,
				to: msg.to,
			});
		}
	}

	private handleGameOver(result: 'checkmate' | 'draw' | 'resign' | 'timeout'): void {
		if (!this.game) return;
		
		const winner = result === 'checkmate' 
			? (this.game.chess.turn() === 'w' ? 'black' : 'white')
			: null;
		
		console.log(`[GAME_OVER] ${result}${winner ? `, winner: ${winner}` : ''}`);
		
		const gameOverMsg = {
			type: "game_over",
			result,
			winner,
			fen: this.game.chess.fen(),
		};
		
		this.broadcast(gameOverMsg);
		
		// Clear the game
		this.game = null;
	}

	private handleDisconnect(connId: string): void {
		// Remove from queue if present
		const queueIndex = this.queue.findIndex(p => p.connId === connId);
		if (queueIndex >= 0) {
			this.queue.splice(queueIndex, 1);
			console.log(`[QUEUE] ${connId} removed from queue (disconnect)`);
		}
		
		// Handle game disconnect
		if (this.game) {
			const isWhite = connId === this.game.whiteConnId;
			const isBlack = connId === this.game.blackConnId;
			
			if (isWhite || isBlack) {
				console.log(`[DISCONNECT] Player ${connId} (${isWhite ? 'White' : 'Black'}) left the game`);
				
				// Notify the opponent
				const opponent = isWhite ? this.game.blackWs : this.game.whiteWs;
				const opponentConnId = isWhite ? this.game.blackConnId : this.game.whiteConnId;
				
				if (opponent) {
					this.sendToClient(opponent, {
						type: "opponent_left",
						connId,
						color: isWhite ? 'white' : 'black',
					});
				}
				
				// Also notify the disconnecting player
				const disconnectingWs = isWhite ? this.game.whiteWs : this.game.blackWs;
				if (disconnectingWs) {
					this.sendToClient(disconnectingWs, {
						type: "game_over",
						result: "opponent_left" as any,
						winner: isWhite ? 'black' : 'white',
					});
				}
				
				// Clear the game
				this.game = null;
			}
		}
	}

	// ============================================================================
	// WEBRTC SIGNALING RELAY
	// Relays offer/answer/ICE between paired players without modification
	// ============================================================================

	private handleSignaling(fromConnId: string, signalType: "offer" | "answer" | "ice", payload: any): void {
		if (!this.game) {
			console.warn(`[SIGNAL] Ignored ${signalType} - no active game`);
			return;
		}

		// Determine the opponent's connection ID
		const isWhite = fromConnId === this.game.whiteConnId;
		const toConnId = isWhite ? this.game.blackConnId : this.game.whiteConnId;
		const toWs = isWhite ? this.game.blackWs : this.game.whiteWs;

		if (!toWs || toWs.readyState !== WebSocket.OPEN) {
			console.warn(`[SIGNAL] Cannot relay ${signalType} to ${toConnId} - opponent not connected`);
			return;
		}

		// Relay the signaling message WITHOUT modification
		const signalMsg = {
			type: signalType === "offer" ? "webrtc_offer" : signalType === "answer" ? "webrtc_answer" : "webrtc_ice",
			from: fromConnId,
			[signalType === "ice" ? "candidate" : "sdp"]: payload
		};

		console.log(`[SIGNAL] ${signalType} from ${fromConnId} to ${toConnId}`);
		toWs.send(JSON.stringify(signalMsg));
		console.log(`[SIGNAL] Relayed ${signalType} to ${toConnId}`);
	}

	private sendToClient(ws: WebSocket, msg: object): void {
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(msg));
		}
	}

	private broadcast(msg: object, excludeConnId?: string): void {
		const data = JSON.stringify(msg);
		const clientCount = this.clients.size;
		let sentCount = 0;
		
		console.log(`[BROADCAST] Sending ${msg.type} to ${clientCount} clients`);
		
		for (const [connId, ws] of this.clients.entries()) {
			// Optionally exclude the sender
			if (excludeConnId && connId === excludeConnId) {
				continue;
			}
			
			if (ws.readyState === WebSocket.OPEN) {
				console.log(`[SEND] ${connId}: ${msg.type}`);
				ws.send(data);
				sentCount++;
			} else {
				console.log(`[SKIP] ${connId}: WebSocket not OPEN (readyState=${ws.readyState})`);
			}
		}
		
		console.log(`[BROADCAST] Sent to ${sentCount} clients`);
	}
}

// ============================================================================
// WORKER ENTRY POINT
// Routes WebSocket upgrades to Durable Object, serves static assets
// ============================================================================

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// Route WebSocket connections to Durable Object
		if (url.pathname === "/ws") {
			// Get or create a Durable Object instance
			// For this prototype, we use a single DO instance for all games
			const id = env.ChessGameDO.idFromName("global-game-room");
			const stub = env.ChessGameDO.get(id);
			return stub.fetch(request);
		}

		// All other requests are handled by the assets system (static files)
		// This is automatically handled by Wrangler when assets.directory is set
		// Fall through to default 404 for non-asset routes
		return new Response("Not Found", { status: 404 });
	},
} satisfies ExportedHandler<Env>;
