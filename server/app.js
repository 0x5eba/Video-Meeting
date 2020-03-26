const fs = require('fs')
const express = require('express')
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

module.exports = {
	app,
}