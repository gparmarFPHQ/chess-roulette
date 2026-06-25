/**
 * WebRTC Video Module
 * Handles peer-to-peer video streaming between paired chess players
 * 
 * ICE Server Configuration:
 * - STUN: stun.cloudflare.com (free)
 * - TURN: turn.cloudflare.com (Cloudflare Realtime) - PLACEHOLDER credentials
 */

// ============================================================================
// ICE SERVER CONFIGURATION
// TODO: Replace placeholder TURN credentials with real Cloudflare-generated creds
// ============================================================================

export const ICE_SERVERS: RTCIceServer[] = [
  {
    urls: 'stun:stun.cloudflare.com:3478'
  },
  {
    // Cloudflare Realtime TURN - PLACEHOLDER CREDENTIALS
    // TODO: Get real credentials from Cloudflare dashboard
    // Format: turn:turn.cloudflare.com:3478 (UDP), turn:turn.cloudflare.com:3478 (TCP), turns:turn.cloudflare.com:5349 (TLS)
    urls: [
      'turn:turn.cloudflare.com:3478?transport=udp',
      'turn:turn.cloudflare.com:3478?transport=tcp',
      'turns:turn.cloudflare.com:5349?transport=tcp'
    ],
    username: 'PLACEHOLDER_USERNAME',  // TODO: real Cloudflare TURN creds
    credential: 'PLACEHOLDER_CREDENTIAL'  // TODO: real Cloudflare TURN creds
  }
];

// ============================================================================
// WEBRTC MANAGER CLASS
// ============================================================================

export class WebRTCManager {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private onRemoteStream: ((stream: MediaStream) => void) | null = null;
  private onConnectionStateChange: ((state: string) => void) | null = null;
  private sendSignaling: ((msg: any) => void) | null = null;
  
  constructor(
    private isInitiator: boolean,  // White player initiates
    onSendSignaling: (msg: any) => void
  ) {
    this.sendSignaling = onSendSignaling;
  }
  
  /**
   * Initialize WebRTC connection
   * - Gets user media (camera + mic)
   * - Creates RTCPeerConnection
   * - White (initiator) creates offer, Black waits and answers
   */
  async start(): Promise<void> {
    try {
      // Get user media (camera + mic)
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Create RTCPeerConnection with ICE servers
      this.pc = new RTCPeerConnection({
        iceServers: ICE_SERVERS
      });
      
      // Add local tracks to connection
      this.localStream.getTracks().forEach(track => {
        this.pc!.addTrack(track, this.localStream!);
      });
      
      // Handle remote track (opponent's video)
      this.pc.ontrack = (event) => {
        console.log('[WebRTC] Remote track received');
        this.remoteStream = event.streams[0];
        if (this.onRemoteStream) {
          this.onRemoteStream(this.remoteStream);
        }
      };
      
      // Handle ICE candidates
      this.pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('[WebRTC] ICE candidate generated');
          this.sendSignaling?.({
            type: 'webrtc_ice',
            candidate: event.candidate
          });
        }
      };
      
      // Handle connection state changes
      this.pc.onconnectionstatechange = () => {
        const state = this.pc?.connectionState || 'closed';
        console.log(`[WebRTC] Connection state: ${state}`);
        this.onConnectionStateChange?.(state);
      };
      
      // If White (initiator), create and send offer
      if (this.isInitiator) {
        console.log('[WebRTC] Creating offer (White player)');
        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);
        
        // Send offer to opponent
        this.sendSignaling?.({
          type: 'webrtc_offer',
          sdp: offer
        });
      }
      
    } catch (error) {
      console.error('[WebRTC] Failed to start:', error);
      throw error;
    }
  }
  
  /**
   * Handle incoming offer (Black player receives this)
   */
  async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.pc) {
      console.error('[WebRTC] handleOffer called but pc is null');
      return;
    }
    
    try {
      await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Create and send answer
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      
      this.sendSignaling?.({
        type: 'webrtc_answer',
        sdp: answer
      });
      
      console.log('[WebRTC] Answer created and sent');
    } catch (error) {
      console.error('[WebRTC] handleOffer failed:', error);
      throw error;
    }
  }
  
  /**
   * Handle incoming answer (White player receives this)
   */
  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.pc) {
      console.error('[WebRTC] handleAnswer called but pc is null');
      return;
    }
    
    try {
      await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('[WebRTC] Remote description set (answer)');
    } catch (error) {
      console.error('[WebRTC] handleAnswer failed:', error);
      throw error;
    }
  }
  
  /**
   * Handle incoming ICE candidate
   */
  async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.pc) {
      console.error('[WebRTC] handleIceCandidate called but pc is null');
      return;
    }
    
    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('[WebRTC] ICE candidate added');
    } catch (error) {
      console.error('[WebRTC] handleIceCandidate failed:', error);
      // Don't throw - ICE candidates can fail during renegotiation
    }
  }
  
  /**
   * Set callback for remote stream
   */
  setOnRemoteStream(callback: (stream: MediaStream) => void): void {
    this.onRemoteStream = callback;
  }
  
  /**
   * Set callback for connection state changes
   */
  setOnConnectionStateChange(callback: (state: string) => void): void {
    this.onConnectionStateChange = callback;
  }
  
  /**
   * Get local stream (for self-view)
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }
  
  /**
   * Get connection state
   */
  getConnectionState(): string {
    return this.pc?.connectionState || 'closed';
  }
  
  /**
   * Close WebRTC connection and stop tracks
   */
  close(): void {
    console.log('[WebRTC] Closing connection');
    
    // Stop all local tracks (turns off camera/mic)
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    // Close peer connection
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    
    this.remoteStream = null;
    this.onRemoteStream = null;
    this.onConnectionStateChange = null;
    this.sendSignaling = null;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Attach a MediaStream to a video element
 */
export function attachStreamToVideo(stream: MediaStream, videoElement: HTMLVideoElement): void {
  videoElement.srcObject = stream;
  videoElement.play().catch(err => console.error('[WebRTC] Video play failed:', err));
}

/**
 * Check if browser supports WebRTC
 */
export function isWebRTCSupported(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && 
            window.RTCPeerConnection);
}
