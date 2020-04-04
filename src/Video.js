import React, { Component } from 'react';
import io from 'socket.io-client'
import IconButton from '@material-ui/core/IconButton';
import "./Video.css"

import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare';
import CallEndIcon from '@material-ui/icons/CallEnd';

import Grid from 'react-css-grid'

const server_url = "https://fa40f31e.ngrok.io" //"http://localhost:3000"

var connections = {}
const peerConnectionConfig = {
  'iceServers': [
    // {'urls': 'stun:stun.services.mozilla.com'},
    {'urls': 'stun:stun.l.google.com:19302'},
  ]
}
var socket = null
var socketId = null

class Video extends Component {
  constructor(props) {
    super(props)

    this.localVideoref = React.createRef()

    this.path = window.location.href
		
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
    }

    this.getMedia()
  }

  async getMedia() {
    await navigator.mediaDevices.getUserMedia({video: true})
      .then((stream) => {
        this.videoAvailable = true
        this.video = true
      })
      .catch((e) => {
        this.videoAvailable = false
      })

    await navigator.mediaDevices.getUserMedia({audio: true})
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

    if(navigator.mediaDevices.getDisplayMedia){
      this.screenAvailable = true
    } else {
      this.screenAvailable = false
    }
  }


  getUserMedia = () => {
    console.log(this.state)
    if((this.state.video && this.videoAvailable) || (this.state.audio && this.audioAvailable)) {
      if(socket !== null){
        socket.disconnect()
      }
      navigator.mediaDevices.getUserMedia({video: this.state.video, audio: this.state.audio})
        .then(this.getUserMediaSuccess)
        .then((stream) => {
          document.getElementById('div-videos').innerHTML = ""
          this.connectToSocketServer()
        })
        .catch((e) => console.log(e))
    } else {
      try {
        let tracks = this.localVideoref.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      } catch(e){
        console.log(e)
      }
    }
  }

  getUserMediaSuccess = (stream) => {
    window.localStream = stream
    this.localVideoref.current.srcObject = stream
    
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
      if(socket !== null){
        socket.disconnect()
      }

      if(navigator.mediaDevices.getDisplayMedia){
        navigator.mediaDevices.getDisplayMedia({video: true}) // this.state.screen
          .then(this.getDislayMediaSuccess)
          .then((stream) => {
            document.getElementById('div-videos').innerHTML = ""
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
      console.log("screen false")
      this.setState({ 
        video: this.state.video,
        audio: this.state.audio,
        screen: false,
      }, () => {
        try{
          let tracks = this.localVideoref.current.srcObject.getTracks()
          tracks.forEach(track => track.stop())
        } catch(e) {
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
    if(fromId !== socketId) {
			if(signal.sdp){            
				connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {                
					if(signal.sdp.type === 'offer') {
						connections[fromId].createAnswer().then((description) => {
							connections[fromId].setLocalDescription(description).then(() => {
								socket.emit('signal', fromId, JSON.stringify({'sdp': connections[fromId].localDescription}));
							}).catch(e => console.log(e));
						}).catch(e => console.log(e));
					}
				}).catch(e => console.log(e));
			}

			if(signal.ice) {
				connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
			}                
    }
  }

  connectToSocketServer = () => {
    socket = io.connect(server_url, {secure: true});
    socket.on('signal', this.gotMessageFromServer);    

    socket.on('connect', () => {

      socket.emit('join-call', this.path);

      socketId = socket.id;
      socket.on('user-left', function(id){
        var video = document.querySelector(`[data-socket="${id}"]`);
        if(video !== null){
          var parentDiv = video.parentElement;
          video.parentElement.parentElement.removeChild(parentDiv);
        }
      });
      
      socket.on('user-joined', function(id, clients){
        console.log("FINE")
        connections = {} // TODO eh, una merda, ma non so come fare
        clients.forEach(function(socketListId) {
          if(connections[socketListId] === undefined){
            connections[socketListId] = new RTCPeerConnection(peerConnectionConfig);
            //Wait for their ice candidate       
            connections[socketListId].onicecandidate = function(event){
              if(event.candidate != null) {
                socket.emit('signal', socketListId, JSON.stringify({'ice': event.candidate}));
              }
            }

            //Wait for their video stream
            connections[socketListId].onaddstream = function(event){
              var videos = document.getElementById('div-videos')
              var div = document.createElement('div')
              var video = document.createElement('video')

              video.setAttribute('data-socket', socketListId);
              video.srcObject = event.stream
              video.autoplay = true; 
              // video.muted       = true;
              video.playsinline = true;

              // TODO mute button, full screen button

              video.style.minWidth = "500px"
              video.style.maxWidth = "100%"
              video.style.minHeight = "500px"
              video.style.maxHeight = "100%"
              
              div.appendChild(video)
              videos.appendChild(div);
            }    

            //Add the local video stream
            if(window.localStream !== undefined){
              connections[socketListId].addStream(window.localStream); 
            } else {
              alert("DIO CANE")
            }
          }
        });

        //Create an offer to connect with your local description
        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description)
            .then(() => {
              socket.emit('signal', id, JSON.stringify({'sdp': connections[id].localDescription}));
            })
            .catch(e => console.log(e));        
        });
      });
    })
  }
  

  handleVideo = () => {
    this.setState({ 
      video: !this.state.video,
      audio: this.state.audio,
      screen: this.state.screen
    }, () => {
      this.getUserMedia()
    })
  }

  handleAudio = () => {
    this.setState({ 
      video: this.state.video,
      audio: !this.state.audio,
      screen: this.state.screen
    }, () => {
      this.getUserMedia()
    })
  }

  handleScreen = () => {
    this.setState({ 
      video: this.state.video,
      audio: this.state.audio,
      screen: !this.state.screen
    }, () => {
      this.getDislayMedia()
    })
  }

  handleEndCall = () => {
    try {
      let tracks = this.localVideoref.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
    } catch(e){

    }

    window.location.href = "/"
  }

  render() {
    return (
      <div>
        <div id="bottons">
          <IconButton style={{color: "#424242"}} onClick={this.handleVideo}>
            {(this.state.video === false) ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>

          <IconButton style={{color: "#f44336"}} onClick={this.handleEndCall}>
            <CallEndIcon />
          </IconButton>

          <IconButton style={{color: "#424242"}} onClick={this.handleAudio}>
            {this.state.audio === false ? <MicIcon /> : <MicOffIcon />}
          </IconButton>

          <IconButton style={{color: "#424242"}} onClick={this.handleScreen}>
            {this.state.screen === false ? <ScreenShareIcon /> : <StopScreenShareIcon />}
          </IconButton>
        </div>

        <video ref={ this.localVideoref } autoPlay style={{backgroundColor: "black"}}></video>
        <Grid
        width={500}
        gap={24} id="div-videos">

        </Grid>
        
      </div>
    )
  }
}

export default Video;