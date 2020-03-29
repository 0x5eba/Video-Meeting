import React, { Component } from 'react';
import io from 'socket.io-client'
import { Button } from '@material-ui/core';

const server_url = "http://localhost:3000"

var connections = {}
const peerConnectionConfig = {
  'iceServers': [
    {'urls': 'stun:stun.services.mozilla.com'},
    {'urls': 'stun:stun.l.google.com:19302'},
  ]
}
var socket = null

class Video extends Component {
  constructor(props) {
    super(props)

    this.localVideoref = React.createRef()
		
    this.socketId = null
    this.constraints = {
      video: true,
      audio: true,
    };
    this.shareVideo = false
    this.shareScreen = false

    this.path = window.location.href
  }

  getUserMediaSuccess = (stream) => {
    window.localStream = stream
    this.localVideoref.current.srcObject = stream
    
    stream.getVideoTracks()[0].onended = () => {
      if(this.shareScreen === true){
        if(navigator.mediaDevices.getUserMedia) {
          this.shareScreen = false
          navigator.mediaDevices.getUserMedia(this.constraints)
            .then(this.getUserMediaSuccess)
            .catch((e) => console.log(e))
        }
      } else if(this.shareVideo === true){
        
      }
    };
  }

  gotMessageFromServer = (fromId, message) => {
    //Parse the incoming signal
    var signal = JSON.parse(message)

    //Make sure it's not coming from yourself
    if(fromId !== this.socketId) {
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

  componentDidMount = () => {
    if(navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(this.constraints)
        .then(this.getUserMediaSuccess)
        .then(() => {

          socket = io.connect(server_url, {secure: true});
          socket.on('signal', this.gotMessageFromServer);    

          socket.on('connect', () => {

            socket.emit('join-call', this.path);

            this.socketId = socket.id;
            socket.on('user-left', function(id){
              var video = document.querySelector(`[data-socket="${id}"]`);
              if(video !== null){
                var parentDiv = video.parentElement;
                video.parentElement.parentElement.removeChild(parentDiv);
              }
            });

            socket.on('user-joined', function(id, clients){
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
                    var videos = document.getElementById('div-videos'),
                      video = document.createElement('video')

                    video.setAttribute('data-socket', socketListId);
                    video.srcObject = event.stream
                    video.autoplay = true; 
                    // video.muted       = true;
                    video.playsinline = true;
                    
                    videos.appendChild(video);
                  }    

                  //Add the local video stream
                  connections[socketListId].addStream(window.localStream);                                                                
                }
              });

              //Create an offer to connect with your local description
              connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                  .then(() => {
                    // console.log(connections);
                    socket.emit('signal', id, JSON.stringify({'sdp': connections[id].localDescription}));
                  })
                  .catch(e => console.log(e));        
              });
            });
          })       
        }); 
		}
  }

  startCapture = () => {
    var constraints = {
      video: true
    }
    
    if (navigator.mediaDevices.getDisplayMedia) {
      this.shareScreen = true
      navigator.mediaDevices.getDisplayMedia(constraints)
        .then(this.getUserMediaSuccess)
        // .then(() => {})
        .catch((e) => console.log(e))
    }
  }

  stopCapture = (evt) => {
    if(this.shareScreen === true){
      let tracks = this.localVideoref.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      this.localVideoref.current.srcObject = null;
      this.shareScreen = false
    }
  }

  startVideo = (video, audio) => {
    var constraints = {
      video: video,
      audio: audio,
    }
    
    if (navigator.mediaDevices.getDisplayMedia) {
      this.shareScreen = true
      navigator.mediaDevices.getDisplayMedia(constraints)
        .then(this.getUserMediaSuccess)
        // .then(() => {})
        .catch((e) => console.log(e))
    }
  }

  stopVideo = (evt) => {
    if(this.shareScreen === false){
      let tracks = this.localVideoref.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      this.localVideoref.current.srcObject = null;
      this.shareScreen = false
    }
  }

  render() {
    return (
      <div>
        <Button onClick={ this.startCapture }>Start Capture</Button>
        <Button onClick={ this.stopCapture }>Stop Capture</Button>

        <Button onClick={ this.startVideo }>Start Video</Button>
        <Button onClick={ this.stopVideo }>Stop Video</Button>
        <video ref={ this.localVideoref } autoPlay></video>
        <div id="div-videos">

        </div>
      </div>
    )
  }
}

export default Video;