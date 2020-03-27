const fs = require('fs')
const express = require('express')
const http = require('http')
var cors = require('cors')
const app = express()
const bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.json())

const CallRouter = require('./models/calls/calls.routes.js')
CallRouter.routesConfig(app)

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Credentials', 'true')
	res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE')
	res.header('Access-Control-Expose-Headers', 'Content-Length')
	res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range')
	if (req.method === 'OPTIONS') {
		return res.send(200)
	} else {
		return next()
	}
})

const mongoURI = 'mongodb://localhost:27017/video'
const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)
mongoose.connect(mongoURI, { useNewUrlParser: true })
let db = mongoose.connection
db.once('open', () => console.log('connected to the database'))
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'))
app.listen(process.env.PORT || config.port, config.ip, () => {
	console.log("http://" + config.ip + ":" + config.port)
})



var app1 = express(); 
var app2 = http.createServer(app1);

var io = require('socket.io')(app2);

connections = {}

io.on('connection', function(socket){

	socket.on('join-call', (path) => {
		if(connections.path === undefined){
			connections[path] = []
		}
		connections[path].push(socket.id);

		for(let a = 0; a < connections[path].length; ++a){
			io.to(connections[path][a]).emit("user-joined", socket.id, connections[path].length, connections[path]);
		}
	});

	socket.on('signal', (toId, message) => {
		io.to(toId).emit('signal', socket.id, message);
	});

	// socket.on("message", function(data){
	// 	io.sockets.emit("broadcast-message", socket.id, data);
	// })

	socket.on('disconnect', function() {
		var key;
		for (const [k, v] of Object.entries(connections)) {
			for(let a = 0; a < v.length; ++a){
				if(v[a] === socket.id){
					key = k
				}
			}
		}

		for(let a = 0; a < connections[key].length; ++a){
			io.to(connections[key][a]).emit("user-left", socket.id);
		}

		var index = connections[key].indexOf(socket.id);
		connections[k].splice(index, 1);
	})
});

app2.listen(3000, function(){
	console.log("Express server listening on port %d", app2.address().port);
});