/**
 * Single WebSocket connection module for Chess-Roulette
 * 
 * ALL WebSocket communication goes through this module.
 * No socket.send() calls anywhere else in the codebase.
 */

let socket = null;
let connId = null;
let messageHandlers = [];
let connectionPromise = null;

/**
 * Connect to the Durable Object WebSocket endpoint
 * Returns a promise that resolves when connected
 */
export function connect() {
	if (connectionPromise) {
		return connectionPromise;
	}

	connectionPromise = new Promise((resolve, reject) => {
		const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
		const wsUrl = `${protocol}//${window.location.host}/ws`;

		console.log("[WS] Connecting to:", wsUrl);
		socket = new WebSocket(wsUrl);

		socket.addEventListener("open", () => {
			console.log("[WS] Connected");
			resolve({
				send,
				onMessage,
				disconnect,
				isConnected,
				getConnId,
			});
		});

		socket.addEventListener("message", (event) => {
			try {
				const msg = JSON.parse(event.data);
				console.log("[WS] Received:", msg);

				// Store connection ID if this is the 'connected' message
				if (msg.type === "connected" && msg.connId) {
					connId = msg.connId;
					console.log("[WS] Assigned connId:", connId);
				}

				// Route to all registered handlers
				for (const handler of messageHandlers) {
					handler(msg);
				}
			} catch (error) {
				console.error("[WS] Failed to parse message:", error);
			}
		});

		socket.addEventListener("close", (event) => {
			console.log("[WS] Closed:", event.code, event.reason);
			socket = null;
			connId = null;
		});

		socket.addEventListener("error", (error) => {
			console.error("[WS] Error:", error);
			reject(new Error("WebSocket connection failed"));
		});
	});

	return connectionPromise;
}

/**
 * Send a message through the WebSocket
 * All messages are JSON with a 'type' field
 */
export function send(msg) {
	if (!socket || socket.readyState !== WebSocket.OPEN) {
		console.error("[WS] Cannot send - not connected");
		throw new Error("WebSocket not connected");
	}

	const data = JSON.stringify(msg);
	console.log("[WS] Sending:", msg);
	socket.send(data);
}

/**
 * Register a message handler
 * Handlers are called for every received message
 */
export function onMessage(handler) {
	messageHandlers.push(handler);
}

/**
 * Disconnect from the WebSocket
 */
export function disconnect() {
	if (socket) {
		socket.close();
		socket = null;
	}
	connId = null;
	messageHandlers = [];
	connectionPromise = null;
}

/**
 * Check if currently connected
 */
export function isConnected() {
	return socket !== null && socket.readyState === WebSocket.OPEN;
}

/**
 * Get the connection ID assigned by the server
 */
export function getConnId() {
	return connId;
}
