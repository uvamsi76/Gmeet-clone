import React, { useEffect, useRef, useState ,} from 'react'

import {json, useParams, useSearchParams} from 'react-router-dom' 
import {Video} from './Video'
import { Grid } from '@mui/material'


var pc = new RTCPeerConnection()

const Rtcclient = () => {
  const [ws , setWs]=useState<WebSocket>()
  const [usermedia , setUsermedia]=useState<any>()
  const [remotemedia , setRemotemedia]=useState<any>()
  const [localdescription , setlocaldescription]=useState<any>()
  const [remotedescription , setremotedescription]=useState()
  const [remotecandidate , setRemotecandidate]=useState()
  const [hasjoined,setHasjoined]=useState<Boolean>(false)
  const params = useParams()
  const [firstrender,setFirstrender]=useState(true)
  // var addCandidate = (pc:any, can:any) => can && pc.addIceCandidate(can).catch(console.error);

  useEffect(()=>{
    console.log("entered component")//1
    if(firstrender){
    const websocket= new WebSocket("ws://localhost:3000")
    setWs(websocket)
    setFirstrender(false)
    }
    if(!ws) return
    ws.onopen=()=>{
      const roomId = params.roomId;
      console.log("join:"+roomId)//2
      ws.send(JSON.stringify({
        type: 'join',
        payload: {
          roomId: roomId
        }
      }));
    }

    ws.onmessage=async (e: { data: string })=>{
      const data=JSON.parse(e.data)
      console.log('onmessage')//8 usr 2 added, //11  ,//15 //19 //31
      if(data.type=="iceCandidate"){
      console.log("icecandidate:")//12 //16 //20 //32
      console.log(JSON.stringify(data.payload))//13 //17 //21 33 null
       setRemotecandidate(data.payload.candidate)

      pc.addIceCandidate(data.payload.candidate);
      console.log("pc. added icecandidate")//14 //18 //22 //34
      pc.onicecandidate = ({ candidate }) => {
        console.log("send iceCandidateReply:") //25//27//29 //35
        console.log(JSON.stringify(candidate)) //26//28//30 //36 null
        ws.send(JSON.stringify({
          type:"iceCandidateReply",
          payload:{
            candidate
          }
        }));
      };
      }
      if(data.type=="localDescription"){
        
        const sdp=data.payload.description;
        if(localdescription==sdp) return
        console.log("received localDescription sdp:")//9
        console.log(JSON.stringify(sdp))//10

        setremotedescription(sdp)
        await pc.setRemoteDescription(sdp)

        
        const d=await pc.createAnswer()
        console.log("my local description") //23
        console.log(JSON.stringify(d)) //24
        setlocaldescription(d)
        await pc.setLocalDescription(d);
        ws.send(JSON.stringify({
          type:"remoteDescription", 
          payload:{ 
            description: pc.localDescription 
          }}));

          pc.ontrack = (e) => {
            setRemotemedia(new MediaStream([e.track]));
          };
      }
      if(data.type=="remoteDescription"){
        const sdp=data.payload.description;
        console.log("remoteDescription"+sdp)
        if(localdescription==sdp) return
        console.log("remotedescription:")
        console.log(JSON.stringify(sdp))
        setremotedescription(sdp)
        await pc.setRemoteDescription(sdp)
        pc.ontrack = (e) => {
          setRemotemedia(new MediaStream([e.track]));
        };
      }
   }
    navigator.mediaDevices.getUserMedia({video:true,audio:true})
    .then(stream=>{
      setUsermedia(stream)
    })
   pc.ontrack = (e) => {
    setRemotemedia(new MediaStream([e.track]));
  };
  },[firstrender])


  const joinmeeeting= async ()=>{
    console.log("joinmeeeting")//3
    if(!ws) return
    pc.onicecandidate = ({candidate}) => {
      console.log("candidate:"+JSON.stringify(candidate))//6-12(null) (7) usr1
      ws.send(JSON.stringify({
        type:"iceCandidate",
        payload:{
          candidate
        }}))
      };
    pc.addTrack(usermedia.getVideoTracks()[0])
    try {
        const ld=await pc.createOffer()
        setlocaldescription(ld)
        await pc.setLocalDescription(ld);
        console.log({ aa: pc.localDescription });//4
        ws.send(JSON.stringify({
          type:"localDescription",
          payload: {
            description: pc.localDescription
          }
        }));
        console.log("ws.send(LD)")//5
    } catch (err) {
          console.log({ msg:err});
        console.error(err);
    }
  setHasjoined(hasjoined=>hasjoined=!hasjoined);
}
  // Get user media
  //pc.onicecandidate
  //      WebSocket.emmit(e.candidate)
  //ws('candidate')
//          addicecandidate(pc2,e.candidate)
//  onnegotiation
//        createoffer
//          setlocaldescription
//              ws.emmit(localdescription)
//  ws("localdescription")
//      setremotedescription("localdesc")
//  pc.ontrack
if(!usermedia){
  return <div>
    Loading.....
  </div>
}
if(!hasjoined){
return (
    <div>
      <Video usermedia={usermedia}/>
      <button onClick={joinmeeeting}>Join meeting</button>
    </div>
  )
}
return <Grid container spacing={2} alignContent={"center"} justifyContent={"center"}>
        <Grid item xs={12} md={6} lg={4}>
            <Video stream={usermedia} />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
            <Video stream={remotemedia} />
        </Grid>
    </Grid>
}

export default Rtcclient