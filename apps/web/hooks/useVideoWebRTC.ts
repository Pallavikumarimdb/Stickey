import { useEffect, useRef, useState } from "react";
import { WebSocketMessage, WsDataType } from "@repo/types/types";

export function useVideoWebRTC(
  send: (msg: any) => void | Promise<void>,
  roomId: string,
  userId: string
) {
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
  const localStream = useRef<MediaStream | null>(null);
  const allUserIds = useRef<Set<string>>(new Set());

  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  const startOwnStream = async () => {
    if (localStream.current) return; 
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;

      const myVideo = document.getElementById(`video-${userId}`) as HTMLVideoElement;
      if (myVideo) myVideo.srcObject = stream;

      setIsStreaming(true);
    } catch (err) {
      console.error("Error starting media stream:", err);
    }
  };

  const stopOwnStream = () => {
    localStream.current?.getTracks().forEach((t) => t.stop());
    localStream.current = null;
    setIsStreaming(false);
  };

  const toggleMute = () => {
    if (!localStream.current) return;
    localStream.current.getAudioTracks().forEach(t => t.enabled = !t.enabled);
    setIsMuted(prev => !prev);
  };

  const toggleVideo = () => {
    if (!localStream.current) return;
    localStream.current.getVideoTracks().forEach(t => t.enabled = !t.enabled);
    setVideoOff(prev => !prev);
  };

  const onSignal = async (msg: WebSocketMessage) => {
    const { payload: { from, data } } = msg;
    if (!from || !data) return;

    const pc = peerConnections.current[from] ?? createPeerConnection(from);

    if (data.type === "offer") {
      await pc.setRemoteDescription(data);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal(from, answer);
    } else if (data.type === "answer") {
      await pc.setRemoteDescription(data);
    } else if (data.candidate) {
      await pc.addIceCandidate(data.candidate);
    }
  };

  const createPeerConnection = (remoteId: string) => {
    if (peerConnections.current[remoteId]) return peerConnections.current[remoteId];

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal(remoteId, { candidate: e.candidate });
    };

    if (localStream.current) {
      localStream.current.getTracks().forEach(track => pc.addTrack(track, localStream.current!));
    }

    pc.ontrack = (e) => {
      const videoEl = document.getElementById(`video-${remoteId}`) as HTMLVideoElement;
      if (videoEl) videoEl.srcObject = e.streams[0] ?? null;
    };

    peerConnections.current[remoteId] = pc;
    return pc;
  };

  const connectToUser = async (otherUserId: string) => {
    if (otherUserId === userId || allUserIds.current.has(otherUserId)) return;
    allUserIds.current.add(otherUserId);

    const pc = createPeerConnection(otherUserId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal(otherUserId, offer);
  };

  const sendSignal = (to: string, data: any) => {
    send({
      type: WsDataType.SIGNAL,
      roomId,
      userId: to,
      payload: { from: userId, data },
    });
  };

  return {
    onSignal,
    connectToUser,
    localStream,
    isStreaming,
    isMuted,
    videoOff,
    startOwnStream,
    stopOwnStream,
    toggleMute,
    toggleVideo,
  };
}
