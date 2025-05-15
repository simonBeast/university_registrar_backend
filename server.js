
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require("http");
const { initializeSocket } = require('./utils/socket');

process.on("uncaughtException",(err)=>{
    console.log("UncaughtException. Shutting Down...");
    console.log(err)
    process.exit(1);
    
})

dotenv.config({
    path:'./config.env'
})

const app = require('./app');

const server = http.createServer(app);


    initializeSocket(server);

mongoose.connect(process.env.DATABASE_LOCAL,{
    useNewUrlParser:true
}).then(con=>{
    console.log('DB Connection success');
}).catch(e=>{
    console.log(e);
});

server.listen(3001,'0.0.0.0',()=>{
    console.log(`Server started on port ${3001}`)
})
process.on("unhandledRejection",err=>{
    console.log("Unhandled rejection. Shutting Down...");
    console.log(err)
    server.close(()=>{
        process.exit(1);
    });
})



