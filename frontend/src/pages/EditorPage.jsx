import React, { useState,useRef, useEffect } from "react";
import Client from "../components/Client";
import Editor from "./Editor"
import { ACTIONS } from "../Action";
import { initSocket } from "../socket";
import {Navigate, useLocation, useNavigate, useParams} from "react-router-dom"
import {toast} from "react-hot-toast"
const EditorPage = () => {
  const [clients,setClients]=useState([])
  const codeRef=useRef("")
  const socketRef=useRef(null)
  const {roomId}=useParams()
  const location=useLocation()
  const navigate=useNavigate()

  


  const handleErrors=(err)=>{
    console.log(err)
    toast.error("Socket Connection failed, try again later")
    navigate("/")
  }
  const copyRoomID= async()=>{
    try{
        await navigator.clipboard.writeText(roomId)
        toast.success("Room ID has been copied to you Clipboard")

    }
    catch(err){

      toast.error("Unable to copy room ID")

    }
  }
  const leaveRoom=()=>{
      navigate("/")
  }

  useEffect(()=>{
     const init=async ()=>{
           socketRef.current=await initSocket()
           socketRef.current.on('connect_error',(err)=>handleErrors(err))
           socketRef.current.on('connect_failed',(err)=>handleErrors(err))
           socketRef.current.emit(ACTIONS.JOIN,{
            roomId,
            username:location.state?.name
           });

           //listening for joining event
           socketRef.current.on(ACTIONS.JOINED,({clients,username,socketId})=>{
            if (username!==location.state?.name){
              toast.success(`${username} joined the room`)
              console.log(`${username} joined`)
            }
            setClients(clients)
            socketRef.current.emit(ACTIONS.SYNC_CODE,{
              code:codeRef.current,
              socketId
            })
           })
          //listening for disconnected
          socketRef.current.on(ACTIONS.DISCONNECTED,({socketId,username})=>{
            toast.success(`${username} left the room`)
            setClients((prev)=>{return prev.filter((client)=>{return client.socketId!==socketId})})
          })
     }
     init()
     return ()=>{

      socketRef.current.off(ACTIONS.JOINED)
      socketRef.current.off(ACTIONS.DISCONNECTED)
      socketRef.current.disconnect()
     }
  },[])

  if (!location.state.name){
    return  <Navigate to="/"/>
   }

  
  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img src="/logo_animation.gif" alt="" className="logoImage" />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {
              clients?.map((client)=>{
                return (<Client username={client?.username} key={client?.socketId}/>)
              })
            }
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomID}>Copy Room ID</button>
        <button className="btn leaveBtn" onClick={leaveRoom}>Leave Room</button>


      </div>
      <div className="editorwrap">
        <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code)=>{codeRef.current=code}}/>
      </div>
    </div>
  )
};

export default EditorPage;
