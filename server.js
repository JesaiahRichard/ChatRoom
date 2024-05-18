import express from "express";
import dotenv from "dotenv"
import { fileURLToPath } from "url";
import { dirname, join } from 'path';  
import http from "http";
import { Server } from "socket.io";
import formatMessage from "./utils/message.js"
import { userJoin,getCurrentUser,userLeave,getRoomUsers } from "./utils/users.js";

dotenv.config()

const app=express()
const port=process.env.PORT || 4000
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const httpserver=http.createServer(app)
const io=new Server(httpserver)
const botName='ChatRoom Bot'

//join the public folder(html)
app.use(express.static(join(__dirname, 'public')));

io.on("connection", socket=>{
    socket.on("joinroom",({username,room})=>{
        const user=userJoin(socket.id,username,room)

        socket.join(user.room);
//welcome a User
socket.emit('message',formatMessage (botName,"Welcome to ChatRoom")) //single client
//broadcast when a user connect
socket.broadcast.to(user.room).emit('message',formatMessage (botName,`${user.username} has joined the chat`)) //to all the user except the user login
 // Send users and room info
 io.to(user.room).emit("roomUsers", {
    room: user.room,
    users: getRoomUsers(user.room),
  });

    })

    //io.emit()  =>  all the client


    //listen for chatmessage
    socket.on("chat-message", (msg) => {
    const user=getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage (user.username,msg))
    }); 

     //client dissconnect
     socket.on("disconnect",()=>{
        const user=userLeave(socket.id)
        if(user){
            io.to(user.room).emit('message',formatMessage (botName,`${user.username} has left the chat`))
             // Send users and room info
 io.to(user.room).emit("roomUsers", {
    room: user.room,
    users: getRoomUsers(user.room),
  });
        }
    })
    
   
})

httpserver.listen(port,()=>{
    console.log(`The server is running on Port ${port}`)
})