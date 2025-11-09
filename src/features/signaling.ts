export interface SignalMessage {
  type: "offer" | "answer" | "ice";
  payload: {
    sdp?: string;
    candidate?: RTCIceCandidateInit;
  };
  timestamp: number;
}

export interface SessionData {
  offer?: SignalMessage;
  answer?: SignalMessage;
  hostIce: SignalMessage[];
  joinerIce: SignalMessage[];
  createdAt: number;
}

const sessions = new Map<string, SessionData>();
const SESSION_TTL = 5 * 60 * 1000;

export function generateSessionCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createSession(sessionCode: string): void {
  sessions.set(sessionCode, {
    hostIce: [],
    joinerIce: [],
    createdAt: Date.now(),
  });
}

export function getSession(sessionCode: string): SessionData | null {
  const session = sessions.get(sessionCode);
  if (!session) return null;

  if (Date.now() - session.createdAt > SESSION_TTL) {
    sessions.delete(sessionCode);
    return null;
  }

  return session;
}

export function updateSession(
  sessionCode: string,
  data: Partial<SessionData>
): boolean {
  const session = getSession(sessionCode);
  if (!session) return false;

  sessions.set(sessionCode, { ...session, ...data });
  return true;
}

export function addIceCandidate(
  sessionCode: string,
  candidate: SignalMessage,
  isHost: boolean
): boolean {
  const session = getSession(sessionCode);
  if (!session) return false;

  if (isHost) {
    session.hostIce.push(candidate);
  } else {
    session.joinerIce.push(candidate);
  }

  sessions.set(sessionCode, session);
  return true;
}

export function cleanupOldSessions(): void {
  const now = Date.now();
  for (const [code, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_TTL) {
      sessions.delete(code);
    }
  }
}

setInterval(cleanupOldSessions, 60000);

export class SignalingClient {
  private sessionCode: string;
  private isHost: boolean;
  private baseUrl: string;

  constructor(sessionCode: string, isHost: boolean) {
    this.sessionCode = sessionCode;
    this.isHost = isHost;
    this.baseUrl = `/api/signaling/${sessionCode}`;
  }

  async sendOffer(offer: RTCSessionDescriptionInit): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "offer",
          payload: { sdp: offer.sdp },
          timestamp: Date.now(),
        } as SignalMessage),
      });
      return response.ok;
    } catch (error) {
      console.error("Failed to send offer:", error);
      return false;
    }
  }

  async sendAnswer(answer: RTCSessionDescriptionInit): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "answer",
          payload: { sdp: answer.sdp },
          timestamp: Date.now(),
        } as SignalMessage),
      });
      return response.ok;
    } catch (error) {
      console.error("Failed to send answer:", error);
      return false;
    }
  }

  async sendIceCandidate(candidate: RTCIceCandidateInit): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ice",
          payload: { candidate },
          timestamp: Date.now(),
        } as SignalMessage),
      });
      return response.ok;
    } catch (error) {
      console.error("Failed to send ICE candidate:", error);
      return false;
    }
  }

  async pollMessages(): Promise<SessionData | null> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Failed to poll messages:", error);
      return null;
    }
  }
}
