"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const uuid_1 = require("uuid");
const ws_1 = require("ws");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
const users = {};
const rooms = {};
wss.on('connection', (ws, error) => {
    console.log("working?");
    var id;
    console.log("rooms:" + JSON.stringify(rooms));
    console.log("users:" + JSON.stringify(users));
    ws.on("message", (message, error) => {
        const data = JSON.parse(message.toString());
        if (data.type == 'join') {
            id = (0, uuid_1.v4)();
            const roomId = data.payload.roomId;
            console.log("roomId:" + JSON.stringify(roomId));
            users[id] = {
                roomId: roomId,
                ws: ws
            };
            if (!rooms[roomId]) {
                rooms[roomId] = {
                    roomId,
                    users: []
                };
            }
            rooms[roomId].users.push(id);
        }
        // console.log("users:"+JSON.stringify(users))
        if (data.type == "localDescription") {
            let roomId = users[id].roomId;
            let description = data.payload.description;
            let otherUsers = rooms[roomId].users;
            console.log("local sdp:" + JSON.stringify(description));
            otherUsers.forEach((otherUser) => {
                if (otherUser !== id) {
                    users[otherUser].ws.send(JSON.stringify({
                        type: "localDescription",
                        payload: {
                            description: description
                        }
                    }));
                }
            });
        }
        if (data.type == "remoteDescription") {
            let roomId = users[id].roomId;
            let description = data.payload.description;
            let otherUsers = rooms[roomId].users;
            console.log("remote sdp:" + JSON.stringify(description));
            otherUsers.forEach((otherUser) => {
                if (otherUser !== id) {
                    users[otherUser].ws.send(JSON.stringify({
                        type: "remoteDescription",
                        payload: {
                            description: description
                        }
                    }));
                }
            });
        }
        if (data.type == "iceCandidate") {
            let roomId = users[id].roomId;
            let candidate = data.payload.candidate;
            console.log("received iceCandidate:");
            console.log(JSON.stringify(candidate));
            let otherUsers = rooms[roomId].users;
            otherUsers.forEach((otherUser) => {
                if (otherUser !== id) {
                    console.log(otherUser);
                    users[otherUser].ws.send(JSON.stringify({
                        type: "iceCandidate",
                        payload: {
                            candidate
                        }
                    }));
                }
            });
        }
        if (data.type == "iceCandidateReply") {
            let roomId = users[id].roomId;
            let candidate = data.payload.candidate;
            console.log("iceCandidateReply:" + JSON.stringify(candidate));
            let otherUsers = rooms[roomId].users;
            otherUsers.forEach((otherUser) => {
                if (otherUser !== id) {
                    users[otherUser].ws.send(JSON.stringify({
                        type: "iceCandidate",
                        payload: {
                            candidate
                        }
                    }));
                }
            });
        }
    });
});
console.log("server started");
server.listen(3000);
