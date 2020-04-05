const fs = require('fs')
const express = require('express')
const http = require('http')
var cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const path = require("path")

app.use(cors())
app.use(bodyParser.json())

app.use(express.static(__dirname+"/../build"))
app.get("/", (req, res, next) => {
	res.sendFile(path.join(__dirname+"/../build/index.html"))
})

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'))
app.listen(process.env.PORT || config.port, config.ip, () => {
	console.log(config.ip + ":" + config.port)
})


var app1 = express(); 
var app2 = http.createServer(app1);

var io = require('socket.io')(app2);

connections = {}

io.on('connection', function(socket){

	socket.on('join-call', (path) => {
		if(connections[path] === undefined){
			connections[path] = []
		}
		connections[path].push(socket.id);

		for(let a = 0; a < connections[path].length; ++a){
			io.to(connections[path][a]).emit("user-joined", socket.id, connections[path]);
		}

		console.log(connections)
	});

	socket.on('signal', (toId, message) => {
		io.to(toId).emit('signal', socket.id, message);
	});

	// socket.on("message", function(data){
	// 	io.sockets.emit("broadcast-message", socket.id, data);
	// })

	socket.on('disconnect', function() {
		var key;
		var ok = false
		for (const [k, v] of Object.entries(connections)) {
			for(let a = 0; a < v.length; ++a){
				if(v[a] === socket.id){
					key = k
					ok = true
				}
			}
		}

		if(ok === true){
			for(let a = 0; a < connections[key].length; ++a){
				io.to(connections[key][a]).emit("user-left", socket.id);
			}
	
			var index = connections[key].indexOf(socket.id);
			connections[key].splice(index, 1);
		}
	})
});

app2.listen(3000, function(){
	console.log("Express server listening on port %d", app2.address().port);
});