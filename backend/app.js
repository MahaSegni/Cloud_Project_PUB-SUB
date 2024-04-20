require("dotenv").config({path : "./config/.env"})
require('./Model/dbConfig')
//Declaration de userrouters
const userRoutes=require('./routes/userRoutes');
const friendRoutes=require('./routes/friendRoutes');
const conversationRoute = require("./routes/conversationsRoutes");
const messageRoute = require("./routes/messagesRoutes");
 
const cors = require('cors');
 
const bodyParser=require("body-parser")
const express=require("express");
const { PubSub } = require("@google-cloud/pubsub");
const app=express();
var corsOptions = {
    origin: 'http://localhost:3001',
    credentials: true,
    'allowedHeaders': ['sessionId', 'Content-Type', 'Authorization'],
    'exposedHeaders': ['sessionId'],
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false
}
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))
 
app.use('/api/user',userRoutes);
 
app.use('/api/friends',friendRoutes);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
 
app.listen(process.env.PORT,()=>{
    console.log(`listening on port ${process.env.PORT}`);
})
const pubsub = new PubSub({
  projectId: 'leprojetsubv',
  keyFilename: './cle_projet.json'
});
const topic = pubsub.topic("maha");
 
const subscription = topic.subscription("maha-sub");
 
const io = require("socket.io")(process.env.PORTWS, {
    cors: {
      origin: "http://localhost:3001",
    },
  });
  
  let users = [];
  
  const addUser = (userId, socketId) => {
    // Vérifie si l'utilisateur existe déjà
    const user = users.find(user => user.userId === userId);
    if (user) {
      // Mise à jour du socketId si l'utilisateur existe déjà
      user.socketId = socketId;
    } else {
      // Ajout du nouvel utilisateur
      users.push({ userId, socketId });
    }
  };
  const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId );
  };
  
  const getUser = (userId) => {
    const user = users.find(user => user.userId === userId);
    if (user) {
      console.log(`User found: ${user.userId} with socket ${user.socketId}`);
    } else {
      console.log(`No user found with ID ${userId}`);
    }
    return user;
  };
  
  let usersnotif = [];
  
  const addUsernotif = (userId, socketId) => {
    !usersnotif.some((user) => user.userId === userId) &&
      usersnotif.push({ userId, socketId });
  };
  
  const removeUsernotif = (socketId) => {
    usersnotif = usersnotif.filter((user) => user.socketId !== socketId );
  };
  
  const getUsernotif = (userId) => {
    return usersnotif.find((user) => user.userId === userId);
  };
  
  
  io.on("connection", (socket) => {
  
  
    //take userId and socketId from user
    socket.on("addUser", (userId) => {
  
      addUser(userId, socket.id);
      io.emit("getUsers", users);
  
    });
    socket.on("addUsernotif", (userId) => {
  
      addUsernotif(userId, socket.id);
      io.emit("getUsersnotif", usersnotif);
  
    });
    console.log("socket connection ")
  
    //send and get message
    socket.on("sendMessage", ({ senderId, receiverId, text, image, seen, conversationId }) => {
      console.log("sendMessage ", text);
      
      const user = getUser(receiverId);
      const sender = getUser(senderId);
  
      // Publication du message sur le système de pub-sub
      topic.publishMessage({
          data: Buffer.from(text),
          attributes: {
              'senderId': senderId,
              'text': text,
              
              
              'conversationId': conversationId,
               // Assurez-vous que 'sender' est un string
          }
      }, (err, data) => {
          if (err) {
              console.error(err);
              return;
          }
          console.log(`Message ${data} published.`);
      });
  
      // Gestion de la communication en direct via socket
      if (user) {
          console.log("if user  true  io to ", senderId);
          io.to(user.socketId).emit("getMessage", {
              senderId,
              text,
              image,
              seen,
              conversationId,
              sender,
          });
      } else {
          console.log("user not found, adding user");
          addUser(senderId, socket.id);
          const newUser = getUser(receiverId);
          console.log("else get user");
          if (newUser) {
              console.log("user true ");
              io.to(newUser.socketId).emit("getMessage", {
                  senderId,
                  text,
                  image,
                  seen,
                  conversationId,
                  sender,
              });
              console.log("get message ");
          }
      }
 
  
      
      
   
     
  
      const usernotif = getUsernotif(receiverId);
      if(usernotif){
  
      
        io.to(usernotif.socketId).emit("getnotif", {
          senderId,
          text,
          image,
        })}else {addUsernotif(receiverId, socket.id)
          const usernotif = getUsernotif(receiverId);
      if (usernotif){
          {  io.to(usernotif.socketId).emit("getnotif", {
                senderId,
                text,
                image,
              })}
  
      }else{console.log("usernotif disconnected")}
      
      }
      
      
    });
  
    socket.on("sendcurrent", ({  sender,iscurrent  }) => {
  
      io.to(sender.socketId).emit("getCurrent", {
        iscurrent
      });
    });
    socket.on("sendrequestcurrent", ({ senderId, receiverId,conversationId }) => {
  
      const user = getUser(receiverId);
      let sender=getUser(senderId)
   
    if (user){
     { io.to(user.socketId).emit("getRequestCurrent", {
        senderId,
        conversationId,
        sender,
      });}}else{
        do {sender=getUser(senderId);
          try {
          io.to(sender.socketId).emit("getCurrent", {
            iscurrent:false
            
          });}catch {addUser(senderId, socket.id); console.log("trying to send ")}
        } while (sender==undefined);
       
        
      }
    });
  
    
  
    //when disconnect
    socket.on("disconnect", () => {
      console.log("a user disconnected!");
      removeUser(socket.id);
      removeUsernotif(socket.id);
      io.emit("getUsers", users);
      
      io.emit("getUsersnotif", usersnotif);
      
    });
  });
  