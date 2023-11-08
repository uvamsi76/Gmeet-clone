import { useEffect, useRef } from "react";

export const Video = ({usermedia}:any) => {
    const videoRef = useRef<any>();
    useEffect(() => {
        if (videoRef && videoRef.current) {
            videoRef.current.srcObject = usermedia;
        }
      }, [videoRef,usermedia])
    
      return (
        <div>
          <div>
            <video style={{borderRadius: 10 , width:"10%",height:"10%"}} ref={videoRef} muted width="100%" autoPlay={true} playsInline={true} />
          </div>
        </div>
      )
}

