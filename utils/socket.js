const { Server } = require("socket.io");

let io;

const activeUsers = new Map();

function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST","PATCH","DELETE"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on("joinItemRoom",(itemId)=>{

            console.log(`User joined item room itemId:${itemId}`);

            socket.join(itemId);    
            
        });

        socket.on("joinChatRoom",(receiverId)=>{
            console.log(`User joined chat room receiverId:${receiverId}`);

            socket.join(receiverId);    
            
        });

        socket.on("leaveChatRoom",(receiverId)=>{
            console.log(`User left chat room receiverId:${receiverId}`);

            socket.leave(receiverId);    
            
        });

        socket.on("leaveItemRoom",(itemId)=>{

            console.log(`User left item room itemId:${itemId}`);

            socket.leave(itemId);
            
        });

        socket.on("userOnline", (userId) => {

            activeUsers.set(userId.toString(), socket.id);

            // if(!activeUsers.get(userId)){
            //     activeUsers.set(userId, [socket.id]);
            // }
            // activeUsers.get(userId).push(socket.id);
            io.to(userId.toString()).emit("userStatusUpdate",{online:true});
           
            console.log(`User ${userId} is online`);
        });

        socket.on("userOffline", (userId,callback) => {


            io.to(userId.toString()).emit("userStatusUpdate",{online:false});
           
            console.log(`User ${userId} is offline`);

            if(callback){
                callback("ok");
            }
        });

        socket.on("disconnect", () => {



            for ([userId, socketId] of activeUsers.entries()) {

                if(socket.id == socketId){
                    activeUsers.delete(userId);
                break;

                }
                
            }


            
            // for ([userId, sockets] of activeUsers.entries()) {

            //     if(sockets.includes(socket.id)){

            //       const index = sockets.indexOf(socket.id);
            //       sockets.splice(index, 1); 
            //       if (sockets.length === 0) {
            //         activeUsers.delete(userId);
            //       }
            //       break;

            //     }
                
            // }
        });
    });
}

function getIo() {
    if (!io) {
        throw new Error("Socket.io has not been initialized!");
    }
    return io;
}

module.exports = { initializeSocket, getIo, activeUsers };
