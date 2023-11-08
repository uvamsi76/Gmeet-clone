import { error } from 'console'
import express, { json } from 'express'
import http from 'http'
import {v4 as uuidv4} from 'uuid';
import { WebSocketServer } from 'ws'
const app= express()
const server = http.createServer(app)
const wss = new WebSocketServer({server})
const users: { [key: string]: {roomId: string;ws: any;} } = {};
const rooms:any={}
wss.on('connection',(ws,error)=>{
    console.log("working?")//1//4//23//26
    var id: string ;
    console.log("rooms:"+JSON.stringify(rooms))//2//5//24//27
    console.log("users:"+JSON.stringify(users))//3//6//25//28
    ws.on("message",(message,error)=>{
        const data = JSON.parse(message.toString())
        if(data.type == 'join'){
            id =uuidv4()
            const roomId=data.payload.roomId
            console.log("roomId:"+JSON.stringify(roomId))//7//29
            users[id]={
                roomId:roomId,
                ws:ws
            }
            if (!rooms[roomId]) {
                rooms[roomId] = {
                  roomId,
                  users: []
                }
              }
              rooms[roomId].users.push(id);
        }
        // console.log("users:"+JSON.stringify(users))

        if(data.type == "localDescription"){
            let roomId = users[id].roomId;
            let description = data.payload.description
            let otherUsers = rooms[roomId].users;
            console.log("local sdp:"+JSON.stringify(description))//8//30
            otherUsers.forEach((otherUser: any) => {
                if (otherUser !== id) {
                    users[otherUser].ws.send(JSON.stringify({
                        type:"remoteDescription",
                        payload:{
                            description:description
                        }
                    }))
                }
            })
        }
        if(data.type == "remoteDescription"){
            let roomId = users[id].roomId;
            let description = data.payload.description
            let otherUsers = rooms[roomId].users;
            console.log("remote sdp:"+JSON.stringify(description))//40
            otherUsers.forEach((otherUser: any) => {
                if (otherUser !== id) {
                    users[otherUser].ws.send(JSON.stringify({
                        type:"remoteDescription",
                        payload:{
                            description:description
                        }
                    }))
                }
            })
        }
        if(data.type == "iceCandidate"){
            let roomId = users[id].roomId;
            let candidate = data.payload.candidate
            console.log("received iceCandidate:")//9//11//13//15//17//19//21//31//34//37
            console.log(JSON.stringify(candidate))//10//12//14//16//18//20//22(null)//32//35//38
            let otherUsers = rooms[roomId].users;
            otherUsers.forEach((otherUser: any) => {
                if (otherUser !== id) {
                    console.log(otherUser)//33//36//39
                    users[otherUser].ws.send(JSON.stringify({
                        type:"iceCandidate",
                        payload:{
                            candidate
                        }
                    }))
                }
            })
        }
        if(data.type == "iceCandidateReply"){
            let roomId = users[id].roomId;
            let candidate = data.payload.candidate
            console.log("iceCandidateReply:"+JSON.stringify(candidate))//41//42//43//44(null)//45(null)
            let otherUsers = rooms[roomId].users;
            otherUsers.forEach((otherUser: any) => {
                if (otherUser !== id) {
                    users[otherUser].ws.send(JSON.stringify({
                        type:"iceCandidate",
                        payload:{
                            candidate
                        }
                    }))
                }
            })
        }
    })
})

console.log("server started")

server.listen(3000);
