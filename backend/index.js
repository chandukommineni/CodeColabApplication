const express=require("express");
const app=express()
const http=require("http")
const {Server}=require("socket.io")
const ACTIONS = require('./Action');
const cors=require('cors')
const bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.json())

const server=http.createServer(app)

const io=new Server(server)
const userSocketMap={

};

const languageId={
    python:28,
    c:1,
    cpp:2,
    java:4

}
async function getSubmission(token){
    const url = `https://judge0-extra-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true&fields=*`;
    const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': 'f1c33b4a14msh2dd12af9bfe7851p186535jsn50ecc0d2e234',
		'x-rapidapi-host': 'judge0-extra-ce.p.rapidapi.com'
	}
    };

        try {
            const response = await fetch(url, options);
            const result = await response.json();
           
            return result
        } catch (error) {
            console.error(error);
        }
}

async function postSubmission(code,languageId,input) {
    const url = 'https://judge0-extra-ce.p.rapidapi.com/submissions?base64_encoded=true&fields=*';
    const options = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': 'f1c33b4a14msh2dd12af9bfe7851p186535jsn50ecc0d2e234',
            'x-rapidapi-host': 'judge0-extra-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            language_id: languageId,
            source_code: btoa(code),
            stdin:btoa(input)
        })
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json(); // Await the JSON parsing
        return result; // Return the full result
    } catch (error) {
        console.log(error);
        throw new Error('Error posting submission');
    }
}

app.post('/compile', async (req, res) => {
    const { code, language,input,roomId } = req.body;
    try {
        const submissionResult = await postSubmission(code,languageId[language],input);
        const token = submissionResult.token; // Extract the token from the submission result
        const result = await getSubmission(token); // Pass the token to getSubmission
        const {stdout,time,stderr,status} =result
        const {description}=status
        const mainResult={output:stdout,time:time,error:stderr,errorDescription:description}
        console.log(mainResult)
        io.to(roomId).emit('output', mainResult);
        res.json(mainResult)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred during compilation.' });
    }
});




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



