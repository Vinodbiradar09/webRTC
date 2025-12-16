"use client";
import { useEffect, useRef } from "react";
const Sender = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8081");
    socketRef.current = socket;
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "sender" }));
    };
    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      const pc = pcRef.current;
      if (!pc) return;
      if (message.type === "createAnswer") {
        await pc.setRemoteDescription(
          new RTCSessionDescription(message.sdp)
        );
      }
      if (message.type === "iceCandidate") {
        await pc.addIceCandidate(message.candidate);
      }
    };
    return () => socket.close();
  }, []);
  const initiateConnection = async () => {
    const socket = socketRef.current;
    if (!socket) return;
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({
            type: "iceCandidate",
            candidate: event.candidate,
          })
        );
      }
    };
    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.send(
        JSON.stringify({
          type: "createOffer",
          sdp: pc.localDescription,
        })
      );
    };
    // const screenShare = await navigator.mediaDevices.getDisplayMedia({video : true, audio : true}); this is for the sharing the screen 
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });
  };
  return (
    <div>
      <h2>Sender</h2>
      <video ref={videoRef} autoPlay muted playsInline />
      <button onClick={initiateConnection}>Call</button>
    </div>
  );
};
export default Sender;
