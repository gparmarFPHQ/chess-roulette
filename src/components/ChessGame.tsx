import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { connect, send, onMessage, isConnected, getConnId, disconnect } from '../client/connection';
import { WebRTCManager, attachStreamToVideo, isWebRTCSupported } from '../client/webrtc';

type GameStatus = 'idle' | 'queued' | 'matched' | 'playing' | 'gameover';
type PlayerColor = 'white' | 'black';
type WebRTCState = 'disconnected' | 'connecting' | 'connected' | 'failed';

interface MatchedMessage {
  type: 'matched';
  color: PlayerColor;
  opponent: string;
  fen: string;
  turn: PlayerColor;
}

interface MoveMadeMessage {
  type: 'move_made';
  from: string;
  to: string;
  promotion?: string;
  fen: string;
  turn: PlayerColor;
  isCheck?: boolean;
  isCheckmate?: boolean;
  isDraw?: boolean;
}

interface MoveRejectedMessage {
  type: 'move_rejected';
  reason: string;
}

interface GameOverMessage {
  type: 'game_over';
  result: string;
  winner?: PlayerColor;
}

interface OpponentLeftMessage {
  type: 'opponent_left';
  connId: string;
  color: PlayerColor;
}

interface WebRTCOfferMessage {
  type: 'webrtc_offer';
  from: string;
  sdp: RTCSessionDescriptionInit;
}

interface WebRTCAnswerMessage {
  type: 'webrtc_answer';
  from: string;
  sdp: RTCSessionDescriptionInit;
}

interface WebRTCIceMessage {
  type: 'webrtc_ice';
  from: string;
  candidate: RTCIceCandidateInit;
}

export function ChessGame() {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [color, setColor] = useState<PlayerColor | null>(null);
  const [fen, setFen] = useState<string>('start');
  const [turn, setTurn] = useState<PlayerColor>('white');
  const [message, setMessage] = useState<string>('');
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [game] = useState(() => new Chess());
  const [connId, setConnId] = useState<string>('');
  
  // WebRTC state
  const [webrtcState, setWebrtcState] = useState<WebRTCState>('disconnected');
  const [webrtcError, setWebrtcError] = useState<string>('');
  const webrtcManagerRef = useRef<WebRTCManager | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // Connect to WebSocket on mount
  useEffect(() => {
    const initConnection = async () => {
      try {
        await connect();
        setConnId(getConnId() || '');
        
        // Set up message handler
        onMessage((msg) => {
          console.log('[CLIENT] Received:', msg);
          handleMessage(msg);
        });
      } catch (error) {
        setMessage(`Connection failed: ${error}`);
      }
    };
    
    initConnection();
    
    return () => {
      // Clean up WebRTC on unmount
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.close();
      }
      disconnect();
    };
  }, []);
  
  /**
   * Initialize WebRTC video when matched
   */
  const initializeWebRTC = useCallback(async (playerColor: PlayerColor) => {
    // Check browser support
    if (!isWebRTCSupported()) {
      setWebrtcError('WebRTC not supported in this browser');
      setWebrtcState('failed');
      return;
    }
    
    try {
      setWebrtcState('connecting');
      
      // White player is the initiator
      const isInitiator = playerColor === 'white';
      
      // Create WebRTC manager
      webrtcManagerRef.current = new WebRTCManager(
        isInitiator,
        (msg) => {
          // Send signaling message through WebSocket
          send(msg);
        }
      );
      
      // Set up remote stream handler
      webrtcManagerRef.current.setOnRemoteStream((stream) => {
        console.log('[WebRTC] Remote stream received, attaching to video element');
        if (remoteVideoRef.current) {
          attachStreamToVideo(stream, remoteVideoRef.current);
        }
      });
      
      // Set up connection state handler
      webrtcManagerRef.current.setOnConnectionStateChange((state) => {
        console.log('[WebRTC] Connection state changed:', state);
        setWebrtcState(state as WebRTCState);
        
        if (state === 'failed') {
          setWebrtcError('Connection failed - check TURN credentials');
        } else if (state === 'connected') {
          setWebrtcError('');
        }
      });
      
      // Start WebRTC (gets user media, creates peer connection)
      await webrtcManagerRef.current.start();
      
      // Attach local stream to self-view
      const localStream = webrtcManagerRef.current.getLocalStream();
      if (localStream && localVideoRef.current) {
        attachStreamToVideo(localStream, localVideoRef.current);
      }
      
      console.log('[WebRTC] Initialized successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[WebRTC] Initialization failed:', error);
      
      // Handle permission denial gracefully - don't break chess
      if (errorMsg.includes('Permission') || errorMsg.includes('denied')) {
        setWebrtcError('Camera/microphone access denied - chess still works');
      } else {
        setWebrtcError(`Video error: ${errorMsg}`);
      }
      setWebrtcState('failed');
    }
  }, []);
  
  /**
   * Handle incoming signaling messages
   */
  const handleSignalingMessage = useCallback(async (msg: WebRTCOfferMessage | WebRTCAnswerMessage | WebRTCIceMessage) => {
    if (!webrtcManagerRef.current) {
      console.warn('[WebRTC] Signaling message received but manager not initialized');
      return;
    }
    
    try {
      switch (msg.type) {
        case 'webrtc_offer':
          console.log('[WebRTC] Received offer from', msg.from);
          await webrtcManagerRef.current.handleOffer(msg.sdp);
          break;
          
        case 'webrtc_answer':
          console.log('[WebRTC] Received answer from', msg.from);
          await webrtcManagerRef.current.handleAnswer(msg.sdp);
          break;
          
        case 'webrtc_ice':
          console.log('[WebRTC] Received ICE candidate from', msg.from);
          await webrtcManagerRef.current.handleIceCandidate(msg.candidate);
          break;
      }
    } catch (error) {
      console.error('[WebRTC] Signaling error:', error);
      // Don't throw - ICE candidates can fail during renegotiation
    }
  }, []);
  
  const handleMessage = useCallback(async (msg: any) => {
    switch (msg.type) {
      case 'connected':
        setConnId(msg.connId);
        break;
        
      case 'queued':
        setStatus('queued');
        setMessage(`Waiting for opponent... (position: ${msg.position})`);
        break;
        
      case 'matched': {
        const matchedMsg: MatchedMessage = msg;
        setStatus('matched');
        setColor(matchedMsg.color);
        setFen(matchedMsg.fen);
        setTurn(matchedMsg.turn);
        game.load(matchedMsg.fen);
        setMessage(`You are ${matchedMsg.color.toUpperCase()}. ${matchedMsg.turn === matchedMsg.color ? 'Your turn!' : 'Waiting for opponent...'}`);
        setLastMove(null);
        
        // Initialize WebRTC video when matched
        await initializeWebRTC(matchedMsg.color);
        break;
      }
        
      case 'move_made': {
        const moveMsg: MoveMadeMessage = msg;
        console.log('[CLIENT_RECV_MOVE] Received move_made:', { fen: moveMsg.fen, from: moveMsg.from, to: moveMsg.to, turn: moveMsg.turn });
        
        game.load(moveMsg.fen);
        setFen(moveMsg.fen);
        setTurn(moveMsg.turn);
        setLastMove({ from: moveMsg.from, to: moveMsg.to });
        
        console.log('[CLIENT_RENDER] Board state updated - new FEN:', moveMsg.fen);
        
        if (moveMsg.isCheckmate) {
          setStatus('gameover');
          setMessage(`Checkmate! ${moveMsg.turn === 'white' ? 'Black' : 'White'} wins!`);
        } else if (moveMsg.isDraw) {
          setStatus('gameover');
          setMessage('Draw!');
        } else if (moveMsg.isCheck) {
          setMessage('Check!');
        } else {
          setMessage(moveMsg.turn === color ? 'Your turn!' : `Waiting for ${moveMsg.turn}...`);
        }
        break;
      }
        
      case 'move_rejected': {
        const rejectMsg: MoveRejectedMessage = msg;
        setMessage(`Move rejected: ${rejectMsg.reason}`);
        setTimeout(() => setMessage(''), 2000);
        break;
      }
        
      case 'game_over': {
        const gameOverMsg: GameOverMessage = msg;
        setStatus('gameover');
        if (gameOverMsg.result === 'opponent_left') {
          setMessage('Opponent left - you win!');
        } else if (gameOverMsg.result === 'checkmate') {
          setMessage(`Checkmate! ${gameOverMsg.winner === color ? 'You win!' : 'You lose!'}`);
        } else if (gameOverMsg.result === 'draw') {
          setMessage('Draw!');
        }
        
        // Clean up WebRTC on game over
        if (webrtcManagerRef.current) {
          webrtcManagerRef.current.close();
          webrtcManagerRef.current = null;
        }
        setWebrtcState('disconnected');
        break;
      }
        
      case 'opponent_left': {
        const leftMsg: OpponentLeftMessage = msg;
        setStatus('gameover');
        setMessage('Opponent disconnected');
        
        // Clean up WebRTC
        if (webrtcManagerRef.current) {
          webrtcManagerRef.current.close();
          webrtcManagerRef.current = null;
        }
        setWebrtcState('disconnected');
        break;
      }
        
      // WebRTC signaling messages
      case 'webrtc_offer':
      case 'webrtc_answer':
      case 'webrtc_ice':
        await handleSignalingMessage(msg);
        break;
        
      case 'already_in_game':
        setMessage('You are already in a game');
        break;
    }
  }, [color, game, initializeWebRTC, handleSignalingMessage]);
  
  const handleJoinQueue = () => {
    if (!isConnected()) {
      setMessage('Not connected to server');
      return;
    }
    
    setStatus('queued');
    send({ type: 'join_queue' });
    setMessage('Joined queue...');
  };
  
  const onPieceDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    console.log('🔴 [CLIENT_DRAG] onPieceDrop CALLED!', { sourceSquare, targetSquare, status, turn, color });
    
    if (status !== 'matched' && status !== 'playing') {
      console.log('🔴 [CLIENT_DRAG] Rejected - wrong status:', status);
      return false;
    }
    
    if (turn !== color) {
      console.log('🔴 [CLIENT_DRAG] Rejected - not your turn:', { turn, color });
      setMessage("Not your turn!");
      return false;
    }
    
    // Get the piece from the board state
    const piece = game.get(sourceSquare);
    const isPromotion = piece?.type === 'p' && 
      ((color === 'white' && targetSquare[1] === '8') || (color === 'black' && targetSquare[1] === '1'));
    
    const movePayload = {
      type: 'move',
      from: sourceSquare,
      to: targetSquare,
      promotion: isPromotion ? 'q' : undefined,
    };
    
    console.log('🔴 [CLIENT_SEND] Sending move:', movePayload);
    send(movePayload);
    
    // Return false - server is authoritative, we'll update from move_made FEN
    console.log('🔴 [CLIENT_SEND] Move sent, returning false (server-authoritative)');
    return false;
  }, [status, turn, color, send, game]);
  
  const getBoardOrientation = () => {
    return color === 'black' ? 'black' : 'white';
  };
  
  const getStatusDisplay = () => {
    switch (status) {
      case 'idle':
        return 'Click "Play" to start';
      case 'queued':
        return message;
      case 'matched':
      case 'playing':
        return `${message} (${turn === color ? 'YOUR TURN' : 'Waiting...'})`;
      case 'gameover':
        return message;
      default:
        return '';
    }
  };
  
  const getWebRTCStatusDisplay = () => {
    if (status !== 'matched' && status !== 'playing') return null;
    
    const statusColors = {
      disconnected: '#999',
      connecting: '#ff9800',
      connected: '#4CAF50',
      failed: '#f44336'
    };
    
    const statusLabels = {
      disconnected: 'Video disconnected',
      connecting: 'Connecting video...',
      connected: 'Video connected',
      failed: webrtcError || 'Video failed'
    };
    
    return (
      <div style={{ 
        textAlign: 'center', 
        fontSize: '12px', 
        color: statusColors[webrtcState],
        marginTop: '5px'
      }}>
        📹 {statusLabels[webrtcState]}
      </div>
    );
  };
  
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>♟️ Chess-Roulette</h1>
      
      {connId && (
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#666', marginBottom: '10px' }}>
          Connected: {connId}
        </div>
      )}
      
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: status === 'gameover' ? '#ffebee' : '#e3f2fd',
        borderRadius: '5px'
      }}>
        <strong>{getStatusDisplay()}</strong>
        {getWebRTCStatusDisplay()}
      </div>
      
      {/* Video Section - shown when matched */}
      {(status === 'matched' || status === 'playing') && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          {/* Remote video (opponent) */}
          <div style={{
            position: 'relative',
            width: '320px',
            height: '240px',
            backgroundColor: '#000',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              color: 'white',
              fontSize: '12px',
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              Opponent ({color === 'white' ? 'Black' : 'White'})
            </div>
          </div>
          
          {/* Local video (self-view) - smaller */}
          <div style={{
            position: 'relative',
            width: '160px',
            height: '120px',
            backgroundColor: '#000',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)'  // Mirror effect
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              color: 'white',
              fontSize: '12px',
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              You ({color === 'white' ? 'White' : 'Black'})
            </div>
          </div>
        </div>
      )}
      
      {status === 'idle' && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleJoinQueue}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🎮 Play
          </button>
        </div>
      )}
      
      {(status === 'matched' || status === 'playing' || status === 'gameover') && (
        <div style={{
          border: '2px solid #333',
          borderRadius: '5px',
          overflow: 'hidden'
        }}>
          {console.log('🔵 [CHESSBOARD_RENDER] Rendering Chessboard', { status, fen, orientation: getBoardOrientation() })}
          <Chessboard
            position={fen}
            onPieceDrop={(from: string, to: string, piece: string) => {
              console.log('🟢 [CHESSBOARD_DROP] Chessboard onPieceDrop triggered!', { from, to, piece });
              const result = onPieceDrop(from, to, piece);
              console.log('🟢 [CHESSBOARD_DROP] onPieceDrop returned:', result);
              return result;
            }}
            boardOrientation={getBoardOrientation()}
            animationDuration={200}
          />
        </div>
      )}
      
      {lastMove && (
        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px' }}>
          Last move: {lastMove.from} → {lastMove.to}
        </div>
      )}
    </div>
  );
}
