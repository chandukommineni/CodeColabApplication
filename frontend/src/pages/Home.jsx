import React, { useState } from "react";
import {v4 as uuidV4} from "uuid"
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const [roomId,setRoomId]=useState("")
  const [name,setName]=useState()
  const navigate=useNavigate()
  const createNewRoom=(e)=>{

    e.preventDefault()
    const id=uuidV4()
    setRoomId(id)
    toast.success("Created a New Room")
  }
  const joinRoom=()=>{
    if (!roomId || !name){
      toast.error("ROOM ID & NAME is Required")
      return 
    }
    navigate(`/editor/${roomId}`,{
      state:{
        name,
      }
    })
    
  }
  const handleInputEnter=(e)=>{
    if (e.code==="Enter"){
      joinRoom()
    }
  }
  return (
    <div className="homePageWrapper">
      <div className="formWrapper" >
        <img  src="/logo_noanimation.png" alt="" />
        <h4 className="mainLabel">Paste Invitation Room ID</h4>
        <div className="inputGroup">
          <input type="text" className="inputBox" placeholder="ROOM ID" value={roomId} onChange={(e)=>setRoomId(e.target.value)} onKeyUp={handleInputEnter}/>
          <input type="text" className="inputBox" placeholder="USERNAME" value={name} onChange={(e)=>setName(e.target.value)} onKeyUp={handleInputEnter}/>
          <button className="btn joinBtn" onClick={joinRoom}>Join</button>
          <span className="createInfo">If you don't have invite then &nbsp;
          <a href="" className="createNewBtn" onClick={createNewRoom}>new room</a>
          </span>
        </div>
      </div>
      <footer>
        <h4>Built with &#128155; by <a href="">Chandu Kommineni</a></h4>
      </footer>
    </div>
  )
};

export default Home;
