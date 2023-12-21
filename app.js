const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

//New imports
const http = require('http').Server(app);
const cors = require('cors');

app.use(cors());
app.use(express.static("public"));
app.get('/api', (req, res) => {
    res.json({
        message: 'Hello world',
    });
});

const rooms = {
    'TEST':{
        messages: [],
    }
}


// const socketIO = require('socket.io')(http, {
//     cors: {
//         origin: "http://localhost:3002"
//     }
// });
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://10.240.210.85:3002"
    }
});

//Add this before the app.get() block
socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    // socketIO.to(socket.id).emit('connecteduser', socket);
    // socket.emit('connect', socket);
    socket.on('user-connect', (user) => {
        if(!rooms[user.room]){
            socketIO.to(socket.id).emit('connecteduserError',{
                message: 'Room not found'
            })
            // rooms[user.room] = {};
            return ;
        }
        rooms[user.room][socket.id] = user;
        socketIO.to(socket.id).emit('connecteduser',{
            user: user,
            socket: socket.id,
            messages: rooms[user.room].messages,
        
        });
        socket.on('send-message', (message) => {
            console.log('🚀: message', message);
            rooms[user.room].messages.push(message);
            Object.keys(rooms[user.room]).forEach((socketId) => {
                    socketIO.to(socketId).emit('message', rooms[user.room].messages);
            
            });
            // socketIO.to(user.room).emit('message', message);
        });
    });
    socket.on('disconnect', () => {
        console.log('🔥: A user disconnected');
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});