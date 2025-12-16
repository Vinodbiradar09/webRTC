"use client";
import { useEffect, useRef } from "react";
const Receiver = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8081");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "receiver" }));
    };
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;
    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };
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
    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "createOffer") {
        await pc.setRemoteDescription(
          new RTCSessionDescription(message.sdp)
        );
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.send(
          JSON.stringify({
            type: "createAnswer",
            sdp: pc.localDescription,
          })
        );
      }
      if (message.type === "iceCandidate") {
        await pc.addIceCandidate(message.candidate);
      }
    };
    return () => {
      socket.close();
      pc.close();
    };
  }, []);
  return (
    <div>
      <h2>Receiver</h2>
      <video ref={videoRef} autoPlay muted playsInline />
    </div>
  );
};
export default Receiver;
