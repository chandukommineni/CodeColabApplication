const express=require("express");
const app=express()
const http=require("http")
const {Server}=require("socket.io")
const ACTIONS = require('./Action');
const cors=require('cors')
app.use(cors());

const server=http.createServer(app)

const io=new Server(server, {
    path: '/socket.io', 
    cors: {
        origin: "http://localhost:3000", // Change this to the URL of your frontend if different
        methods: ["GET", "POST"],
        credentials: true
    }
})
const userSocketMap={

};
function getAllConnectedClients(roomId){
   return Array.from(io.sockets.adapter.rooms.get(roomId)|| []).map((socketId)=>{return {socketId,username:userSocketMap[socketId]}})
}
io.on("connection",(socket)=>{
    console.log("socket connect ",socket.id)
    socket.on(ACTIONS.JOIN,({roomId,username})=>{
        userSocketMap[socket.id]=username
        socket.join(roomId)
        const clients=getAllConnectedClients(roomId)
        console.log(clients)
        clients.forEach(({socketId})=>{io.to(socketId).emit(ACTIONS.JOINED,{clients,username,socketId:socket.id})})
    }) 
    socket.on(ACTIONS.CODE_CHANGE,({roomId,code})=>{
           socket.in(roomId).emit(ACTIONS.CODE_CHANGE,{code})
    })
    
    socket.on(ACTIONS.SYNC_CODE,({code,socketId})=>{
        io.to(socketId).emit(ACTIONS.CODE_CHANGE,{code})
    })
 

    socket.on("disconnecting",()=>{
        const rooms=[...socket.rooms]
        rooms.forEach((roomId)=>{
                  socket.in(roomId).emit(ACTIONS.DISCONNECTED,{socketId:socket.id,username:userSocketMap[socket.id]})
        })
      delete userSocketMap[socket.id]
      socket.leave()
    })

   
})


server.listen(5000,()=>console.log("server runnning"))