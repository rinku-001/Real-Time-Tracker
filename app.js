const express = require('express');
const app = express();
const http = require('http');
const path = require('path');

const sockerio = require('socket.io');
const server = http.createServer(app);
const io = sockerio(server);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function (socket) {
    console.log('User connected', socket.id);
    socket.on('send-location', function (data){
        console.log('Received location from', socket.id, data);
        io.emit("receive-location", {id : socket.id, ...data});
    });

    socket.on('disconnect', function (){
        console.log('User disconnected', socket.id);
        io.emit("user-disconnected", socket.id);
    });
});

app.get("/", function (req, res) {
    res.render("index");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server listening on', PORT));