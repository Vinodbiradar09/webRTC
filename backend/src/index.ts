import express from "express";
import { WebSocket,WebSocketServer} from "ws";
const app = express();
const server = app.listen(8081 , ()=>{
    console.log("websocket server is running at port 8081");
})
const wss = new WebSocketServer({server});
let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;
wss.on("connection" , (ws : WebSocket)=>{
    ws.on("error" ,(error)=>{
        console.log("error in the ws instance" , error);
    })
    ws.on("message" , (data : any)=>{
        const message = JSON.parse(data);
        switch(message.type){
            case "sender" : {
                senderSocket = ws;
            }
            case "receiver" : {
                receiverSocket = ws;
            }
            case "createOffer" : {
                console.log("offer" , message.sdp);
                if(ws !== senderSocket) return;
                receiverSocket?.send(JSON.stringify({type : "createOffer" , sdp : message.sdp}));
            }
            case "createAnswer" : {
                if(ws !== receiverSocket) return;
                console.log("answer" , message.sdp);
                senderSocket?.send(JSON.stringify({type : "createAnswer" , sdp : message.sdp}));
            }
            case "iceCandidate" : {
                console.log("icecandidates" , message.sdp);
                if(ws === senderSocket){
                    console.log("icecandidates sender" , message.candidate);
                    receiverSocket?.send(JSON.stringify({type : "iceCandidate" , candidate : message.candidate}));
                } else if( ws === receiverSocket){
                    console.log("icecandidates receiver" , message.candidate);
                    senderSocket?.send(JSON.stringify({type : "iceCandidate" , candidate : message.candidate}));
                }
            }
        }
    })
})