const express = require('express');
const http = require('http');
const cors = require('cors')
const socketIO = require('socket.io');

// localhost 포트 설정
const port = 4002;

const app = express();

// server instance
const server = http.createServer(app);

// socketio 생성후 서버 인스턴스 사용
const io = socketIO(server,{
    cors : {
        origin :"*",
        credentials :true
    }
});


let clients = [];
// socketio 문법
io.on('connection', socket => {
	console.log('User connected');
    socket.on('login', function(data) {
        let clientInfo = new Object();
        clientInfo.uid = data.uid;
        clientInfo.id = socket.id;
        clients.push(clientInfo);
        console.log('login ',clients)
    });

	socket.on('disconnect', () => {
        clients = clients.filter(client => client.id !== socket.id);
		console.log('User disconnect');
	});
    socket.on('message',({id,message}) => {
        console.log('User message',id,message);

        let client = clients.find(client => client.uid == id)
        console.log(client)
        client && io.to(client.id).emit('receive message',{id, message});
    })
    socket.on('send message', (item) => {
		const msg = item.name + ' : ' + item.message;
		console.log('send message : ',msg);
		io.emit('receive message', {name:item.name, message:item.message});
	});

    socket.on('followRequest' , (item)=> {
        const uid = item.uid;
		console.log('followRequest : ',uid);
        let client = clients.find(client => client.uid == uid)
        console.log(client)
        //client && io.to(client.id).emit('followRequest',{uid:uid});
        io.emit('followRequest', {uid:item.uid});
    })
    socket.on('followAccept' , (item)=> {
        const uid = item.uid;
		console.log('followAccept : ',uid);
        let client = clients.find(client => client.uid == uid)
        console.log(client)
        //client && io.to(client.id).emit('followRequest',{uid:uid});
        io.emit('followAccept', {uid:item.uid});
    })
});


server.listen(port, () => console.log(`Listening on port ${port}`))