import React, { Component } from 'react';
import io from 'socket.io-client'
import IconButton from '@material-ui/core/IconButton';
import { Input, Button } from '@material-ui/core';

import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare';
import CallEndIcon from '@material-ui/icons/CallEnd';
import ChatIcon from '@material-ui/icons/Chat';

import { Container, Row, Col} from 'reactstrap';
import Modal from 'react-bootstrap/Modal'
import 'bootstrap/dist/css/bootstrap.css';
import "./Video.css"

// questo link e' eseguito con ngrok http 3000, quindi un ngrok solo per la porta 3000, e un altro per 3001 dove c'e' l'app
// const server_url = process.env.NODE_ENV === 'production' ? 'videomeeting-sebastienbiollo.herokuapp.com' : "http://localhost:3001"
const server_url = process.env.NODE_ENV === 'production' ? 'videomeeting-sebastienbiollo.herokuapp.com' : "http://localhost:3001"

var connections = {}
const peerConnectionConfig = {
	'iceServers': [
		{ 'urls': 'stun:stun.services.mozilla.com' },
		{ 'urls': 'stun:stun.l.google.com:19302' },
	]
}
var socket = null
var socketId = null

var elms = 0

class Video extends Component {
	constructor(props) {
		super(props)

		this.localVideoref = React.createRef()

		this.videoAvailable = false
		this.audioAvailable = false
		this.screenAvailable = false

		this.video = false
		this.audio = false
		this.screen = false

		this.state = {
			video: false,
			audio: false,
			screen: false,
			showModal: false,
			messages: [],
			message: "",
		}

		this.addMessage = this.addMessage.bind(this);

		this.getMedia()

		// this.connectToSocketServer()
	}

	async getMedia() {
		await navigator.mediaDevices.getUserMedia({ video: true })
			.then((stream) => {
				this.videoAvailable = true
				this.video = true
			})
			.catch((e) => {
				this.videoAvailable = false
			})

		await navigator.mediaDevices.getUserMedia({ audio: true })
			.then((stream) => {
				this.audioAvailable = true
				this.audio = true
			})
			.catch((e) => {
				this.audioAvailable = false
			})

		this.setState({
			video: this.video,
			audio: this.audio,
			screen: this.screen
		}, () => {
			this.getUserMedia()
		})

		if (navigator.mediaDevices.getDisplayMedia) {
			this.screenAvailable = true
		} else {
			this.screenAvailable = false
		}
	}


	getUserMedia = () => {
		if ((this.state.video && this.videoAvailable) || (this.state.audio && this.audioAvailable)) {
			if (socket !== null) {
				socket.disconnect()
			}
			navigator.mediaDevices.getUserMedia({ video: this.state.video, audio: this.state.audio })
				.then(this.getUserMediaSuccess)
				.then((stream) => {
					var main = document.getElementById('main')
					var videos = main.querySelectorAll("video")
					for(let a = 0; a < videos.length; ++a){
						if(videos[a].id !== "my-video"){
							videos[a].parentNode.removeChild(videos[a])
						}
					}

					this.connectToSocketServer()
				})
				.catch((e) => console.log(e))
		} else {
			try {
				let tracks = this.localVideoref.current.srcObject.getTracks()
				tracks.forEach(track => track.stop())
			} catch (e) {
				
			}
		}
	}

	getUserMediaSuccess = (stream) => {
		window.localStream = stream
		this.localVideoref.current.srcObject = stream

		console.log("getUserMediaSuccess")

		// stream.getVideoTracks()[0].onended = () => {
		//   console.log("video / audio false")
		//   this.setState({ 
		//     video: false,
		//     audio: false,
		//     screen: this.state.screen
		//   }, () => {
		//     let tracks = this.localVideoref.current.srcObject.getTracks()
		//     tracks.forEach(track => track.stop())
		//   })
		// };
	}


	getDislayMedia = () => {
		if (this.state.screen) {
			if (socket !== null) {
				socket.disconnect()
			}

			if (navigator.mediaDevices.getDisplayMedia) {
				navigator.mediaDevices.getDisplayMedia({ video: true })
					.then(this.getDislayMediaSuccess)
					.then((stream) => {
						var main = document.getElementById('main')
						var videos = main.querySelectorAll("video")
						for(let a = 0; a < videos.length; ++a){
							if(videos[a].id !== "my-video"){
								videos[a].parentNode.removeChild(videos[a])
							}
						}

						this.connectToSocketServer()
					})
					.catch((e) => console.log(e))
			}
		}
	}

	getDislayMediaSuccess = (stream) => {
		window.localStream = stream
		this.localVideoref.current.srcObject = stream

		stream.getVideoTracks()[0].onended = () => {
			this.setState({
				video: this.state.video,
				audio: this.state.audio,
				screen: false,
			}, () => {
				try {
					let tracks = this.localVideoref.current.srcObject.getTracks()
					tracks.forEach(track => track.stop())
				} catch (e) {
					console.log(e)
				}

				this.getUserMedia()
			})
		};
	}


	gotMessageFromServer = (fromId, message) => {
		//Parse the incoming signal
		var signal = JSON.parse(message)

		//Make sure it's not coming from yourself
		if (fromId !== socketId) {
			if (signal.sdp) {
				connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
					if (signal.sdp.type === 'offer') {
						connections[fromId].createAnswer().then((description) => {
							connections[fromId].setLocalDescription(description).then(() => {
								socket.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }));
							}).catch(e => console.log(e));
						}).catch(e => console.log(e));
					}
				}).catch(e => console.log(e));
			}

			if (signal.ice) {
				connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
			}
		}
	}

	connectToSocketServer = () => {
		// socket = io.connect(server_url, { secure: true });
		socket = io.connect(server_url);

		console.log(server_url)

		socket.on('signal', this.gotMessageFromServer);

		socket.on('connect', () => {

			console.log("connected")

			socket.emit('join-call', window.location.href);

			socketId = socket.id;

			socket.on('chat-message', this.addMessage)

			socket.on('user-left', function (id) {
				var video = document.querySelector(`[data-socket="${id}"]`);
				if (video !== null) {
					elms--
					video.parentNode.removeChild(video);

					var main = document.getElementById('main')
					var videos = main.querySelectorAll("video")

					var width = ""
					if(elms === 1 || elms === 2){
						width = "100%"
					} else if(elms === 3 || elms === 4){
						width = "40%"
					} else {
						width = String(100/elms) + "%"
					}

					var height = String(100/elms) + "%"

					for(let a = 0; a < videos.length; ++a){
						videos[a].style.minWidth = "30%"
						videos[a].style.minHeight = "30%"
						videos[a].style.setProperty("width", width)
						videos[a].style.setProperty("height", height)
					}
				}
			});

			socket.on('user-joined', function (id, clients) {
				console.log("joined")
				connections = {} // TODO eh, una merda, ma non so come fare
				clients.forEach(function (socketListId) {
					if (connections[socketListId] === undefined) {
						connections[socketListId] = new RTCPeerConnection(peerConnectionConfig);
						//Wait for their ice candidate       
						connections[socketListId].onicecandidate = function (event) {
							if (event.candidate != null) {
								socket.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
							}
						}

						//Wait for their video stream
						connections[socketListId].onaddstream = function (event) {

							// TODO mute button, full screen button

							elms = clients.length
							var main = document.getElementById('main')
							var videos = main.querySelectorAll("video")

							var width = ""
							if(elms === 1 || elms === 2){
								width = "100%"
							} else if(elms === 3 || elms === 4){
								width = "40%"
							} else {
								width = String(100/elms) + "%"
							}

							var height = String(100/elms) + "%"

							for(let a = 0; a < videos.length; ++a){
								videos[a].style.minWidth = "30%"
								videos[a].style.minHeight = "30%"
								videos[a].style.setProperty("width", width)
								videos[a].style.setProperty("height", height)
							}
							
							var video = document.createElement('video')
							video.style.minWidth = "30%"
							video.style.minHeight = "30%"
							video.style.setProperty("width", width)
							video.style.setProperty("height", height)
							video.style.margin = "10px"

							video.setAttribute('data-socket', socketListId);
							video.srcObject = event.stream
							video.autoplay = true;
							// video.muted       = true;
							video.playsinline = true;

							main.appendChild(video)
						}

						//Add the local video stream
						if (window.localStream !== undefined) {
							connections[socketListId].addStream(window.localStream);
						}
					}
				});

				//Create an offer to connect with your local description
				connections[id].createOffer().then((description) => {
					connections[id].setLocalDescription(description)
						.then(() => {
							socket.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
						})
						.catch(e => console.log(e));
				});
			});
		})
	}


	handleVideo = () => {
		this.setState({
			video: !this.state.video,
		}, () => {
			this.getUserMedia()
		})
	}

	handleAudio = () => {
		this.setState({
			audio: !this.state.audio,
		}, () => {
			this.getUserMedia()
		})
	}

	handleScreen = () => {
		this.setState({
			screen: !this.state.screen
		}, () => {
			this.getDislayMedia()
		})
	}

	handleEndCall = () => {
		try {
			let tracks = this.localVideoref.current.srcObject.getTracks()
			tracks.forEach(track => track.stop())
		} catch (e) {

		}

		window.location.href = "/"
	}

	

	openChat = () => {
		this.setState({
			showModal: true,
		}, () => {})
	}

	closeChat = () => {
		this.setState({
			showModal: false,
		}, () => {})
	}

	handleMessage = (e) => {
		this.setState({
			message: e.target.value,
		}, () => {})
	}

	addMessage = (data, sender) => {
		this.setState(prevState => ({
			messages: [...prevState.messages, {"sender": sender, "data": data}]
		}))
	}

	sendMessage = () => {
		socket.emit('chat-message', this.state.message)
		this.setState({
			message: "",
		}, () => {})
	}

	render() {
		return (
			<div>
				<div className="container">
					
					<Row id="main" className="flex-container">
						<video id="my-video" ref={this.localVideoref} autoPlay muted></video>
					</Row>

					<div className="btn-down">
						<IconButton style={{ color: "#424242" }} onClick={this.handleVideo}>
							{(this.state.video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
						</IconButton>

						<IconButton style={{ color: "#f44336" }} onClick={this.handleEndCall}>
							<CallEndIcon />
						</IconButton>

						<IconButton style={{ color: "#424242" }} onClick={this.handleAudio}>
							{this.state.audio === true ? <MicIcon /> : <MicOffIcon />}
						</IconButton>

						<IconButton style={{ color: "#424242" }} onClick={this.handleScreen}>
							{this.state.screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
						</IconButton>

						<IconButton style={{ color: "#424242" }} onClick={this.openChat}>
							<ChatIcon />
						</IconButton>
					</div>

					<Modal show={this.state.showModal} onHide={this.closeChat}>
						<Modal.Header closeButton>
						<Modal.Title>Chat Room</Modal.Title>
						</Modal.Header>
						<Modal.Body style={{overflow: "auto", overflowY: "auto", height: "500px"}} >
							{this.state.messages.length > 0 ? this.state.messages.map((item) => (
								<div><b>{item.sender}</b><p style={{ wordBreak: "break-all"}}>{item.data}</p></div>
							)) : <p>No message yet</p>}
						</Modal.Body>
						<Modal.Footer className="div-send-msg">
							<Input placeholder="Message" value={this.state.message} onChange={e => this.handleMessage(e)} />
							<Button variant="contained" color="primary" onClick={this.sendMessage}>Send</Button>
						</Modal.Footer>
					</Modal>
				</div>
			</div>
		)
	}
}

export default Video;