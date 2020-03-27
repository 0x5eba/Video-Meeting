import React, { Component } from 'react';
import io from 'socket.io-client'

const server_url = "http://localhost:3000"

class Video extends Component {
  constructor(props) {
    super(props)

    this.localVideoref = React.createRef()
		// this.remoteVideoref = React.createRef()
		
    this.socket = null
    this.socketId = null
    this.connections = []
    this.peerConnectionConfig = {
      'iceServers': [
        {'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun.l.google.com:19302'},
      ]
    }
    this.constraints = {
      video: true,
      audio: false,
    };

    this.path = window.location.href
  }

  getUserMediaSuccess = (stream) => {
    window.localStream = stream
		this.localVideoref.current.srcObject = stream
  }

  gotRemoteStream = (event, id) => {
    var videos = document.querySelectorAll('video'),
      video  = document.createElement('video'),
      div    = document.createElement('div')

    video.setAttribute('data-socket', id);
    video.src         = window.URL.createObjectURL(event.stream);
    video.autoplay    = true; 
    // video.muted       = true;
    video.playsinline = true;
    
    div.appendChild(video);      
    videos.appendChild(div);      
  }

  gotMessageFromServer = (fromId, message) => {
    //Parse the incoming signal
    var signal = JSON.parse(message)

    //Make sure it's not coming from yourself
    if(fromId !== this.socketId) {
			if(signal.sdp){            
				this.connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {                
					if(signal.sdp.type === 'offer') {
						this.connections[fromId].createAnswer().then((description) => {
							this.connections[fromId].setLocalDescription(description).then(() => {
								this.socket.emit('signal', fromId, JSON.stringify({'sdp': this.connections[fromId].localDescription}));
							}).catch(e => console.log(e));
						}).catch(e => console.log(e));
					}
				}).catch(e => console.log(e));
			}

			if(signal.ice) {
				this.connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
			}                
    }
  }

  componentDidMount = () => {

    // const data = { 
		// 	// inviteLink: 
		// }
		// fetch(api_url + '/api/call/create', {
		// 	method: 'POST',
		// 	headers: {
		// 		'Content-Type': 'application/json',
		// 	},
		// 	body: JSON.stringify(data),
		// })
		// .then((data) => {
		// 	console.log('Success:', data)
		// 	// let history = useHistory();
		// 	// history.push('/' + data.url)
		// })
		// .catch((error) => {
		// 	console.error('Error:', error)
		// })

    if(navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(this.constraints)
        .then(this.getUserMediaSuccess)
        .then(() => {

          this.socket = io.connect(server_url, {secure: true});
          this.socket.on('signal', this.gotMessageFromServer);    

          this.socket.on('connect', () => {

            this.socket.emit('join-call', this.path);

            this.socketId = this.socket.id;
            this.socket.on('user-left', function(id){
              var video = document.querySelector(`[data-socket="${id}"]`);
              var parentDiv = video.parentElement;
              video.parentElement.parentElement.removeChild(parentDiv);
            });

            this.socket.on('user-joined', function(id, count, clients){
              console.log("AAAAAAAA")
              clients.forEach(function(socketListId) {
                if(!this.connections[socketListId]){
                  console.log("NEWWW")
                  this.connections[socketListId] = new RTCPeerConnection(this.peerConnectionConfig);
                  //Wait for their ice candidate       
                  this.connections[socketListId].onicecandidate = function(event){
                    if(event.candidate != null) {
                      console.log('SENDING ICE');
                      this.socket.emit('signal', socketListId, JSON.stringify({'ice': event.candidate}));
                    }
                  }

                  //Wait for their video stream
                  this.connections[socketListId].onaddstream = function(event){
                    this.gotRemoteStream(event, socketListId)
                  }    

                  //Add the local video stream
                  this.connections[socketListId].addStream(window.localStream);                                                                
                }
              });

              //Create an offer to connect with your local description
              
              if(count >= 2){
                this.connections[id].createOffer().then((description) => {
                  this.connections[id].setLocalDescription(description)
                    .then(() => {
                        // console.log(this.connections);
                        this.socket.emit('signal', id, JSON.stringify({'sdp': this.connections[id].localDescription}));
                    })
                    .catch(e => console.log(e));        
                });
              }
            });
          })       
        }); 
		}
  }

  render() {
    return (
      <div>
        <video
          style={{
            width: 240,
            height: 240,
            margin: 5,
            backgroundColor: 'black'
          }}
          ref={ this.localVideoref }
          autoPlay>
        </video>
        {/* <video
          style={{
            width: 240,
            height: 240,
            margin: 5,
            backgroundColor: 'black'
          }}
          ref={ this.remoteVideoref }
          autoPlay>
        </video> */}
      </div>
    )
  }
}

export default Video;