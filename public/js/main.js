const socket=io()

const chatform=document.getElementById('chat-form')
const chatMessages=document.querySelector('.chat-messages')
const roomName=document.getElementById("room-name")
const userList=document.getElementById("users")

//Get username and room from the URL
const {username,room}=Qs.parse(location.search,{
    ignoreQueryPrefix:true
})
console.log(username,room)

//Join chatroom
socket.emit("joinroom",{username,room});

//Get Room and Users 
socket.on("roomUsers",({room,users})=>{
    outputRoomName(room)
    outputUsers(users)
})

//message from server
socket.on("message",message=>{
    outputMessage(message)
console.log(message)
    //sroll down automatically when a new message is sent
    chatMessages.scrollTop=chatMessages.scrollHeight;
}
)

//message submit
chatform.addEventListener("submit", (e) => {
    e.preventDefault()

    //to get the message from the user
    const msg=e.target.elements.msg.value

    //send the message to the server 
    socket.emit("chat-message",msg)

    //clear the input box after the message is sent
    e.target.elements.msg.value=''
    e.target.elements.msg.focus()  // after the message is sent it focus on the input box
})
//displaying the message on output screen using DOM
const outputMessage=(message)=>{
const div=document.createElement("div")
div.classList.add("message")
div.innerHTML=`
<p class="meta"> ${message.username}  <span>    ${message.time} </span></p>
						<p class="text">
							${message.text}
						</p>
                        `
document.querySelector('.chat-messages').appendChild(div)
}

//Add room name to DOM
const outputRoomName=(room)=>{
    roomName.innerText=room;
}

//Add users to DOM
const outputUsers=(users)=>{
    userList.innerHTML=`${users.map(user=>`<li>${user.username}</li>`).join('')}`
}