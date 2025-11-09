import type { NextApiRequest, NextApiResponse } from "next";
import {
  createSession,
  getSession,
  updateSession,
  addIceCandidate,
  SignalMessage,
  SessionData,
} from "@/features/signaling";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { session } = req.query;
  const sessionCode = Array.isArray(session) ? session[0] : session;

  if (!sessionCode) {
    return res.status(400).json({ error: "Session code required" });
  }

  if (req.method === "POST") {
    const message = req.body as SignalMessage | { type: "create" };

    if ("type" in message && message.type === "create") {
      createSession(sessionCode);
      return res.status(200).json({ success: true });
    }

    const signalMessage = message as SignalMessage;
    let sessionData = getSession(sessionCode);

    if (!sessionData) {
      createSession(sessionCode);
      sessionData = getSession(sessionCode);
    }

    if (signalMessage.type === "offer") {
      updateSession(sessionCode, { offer: signalMessage });
      return res.status(200).json({ success: true });
    }

    if (signalMessage.type === "answer") {
      updateSession(sessionCode, { answer: signalMessage });
      return res.status(200).json({ success: true });
    }

    if (signalMessage.type === "ice") {
      const isHost = !sessionData?.answer;
      addIceCandidate(sessionCode, signalMessage, isHost);
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: "Invalid message type" });
  }

  if (req.method === "GET") {
    const sessionData = getSession(sessionCode);

    if (!sessionData) {
      return res.status(404).json({ error: "Session not found" });
    }

    return res.status(200).json(sessionData);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
