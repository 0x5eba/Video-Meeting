import React, { Component } from 'react';

import io from 'socket.io-client'

const server_url = "http://localhost:8080"


class Video extends Component {
  constructor(props) {
    super(props)

    this.localVideoref = React.createRef()
    this.remoteVideoref = React.createRef()

    this.socket = null
    this.candidates = []
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

    this.socket = io(
      '/webrtcPeer',
      {
        path: server_url + '/webrtc',
        query: {}
      }
    )

    this.socket.on('connection-success', success => {
      console.log(success)
    })

    this.socket.on('offerOrAnswer', (sdp) => {
      this.textref.value = JSON.stringify(sdp)

      // set sdp as remote description
      this.pc.setRemoteDescription(new RTCSessionDescription(sdp))
    })

    this.socket.on('candidate', (candidate) => {
      // console.log('From Peer... ', JSON.stringify(candidate))
      // this.candidates = [...this.candidates, candidate]
      this.pc.addIceCandidate(new RTCIceCandidate(candidate))
    })

    const pc_config = {
      "iceServers": [
        // {
        //   urls: 'stun:[STUN_IP]:[PORT]',
        //   'credentials': '[YOR CREDENTIALS]',
        //   'username': '[USERNAME]'
        // },
        { urls: 'stun:stun.services.mozilla.com'},
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection
    // create an instance of RTCPeerConnection
    this.pc = new RTCPeerConnection(pc_config)

    // triggered when a new candidate is returned
    this.pc.onicecandidate = (e) => {
      // send the candidates to the remote peer
      // see addCandidate below to be triggered on the remote peer
      if (e.candidate) {
        // console.log(JSON.stringify(e.candidate))
        this.sendToPeer('candidate', e.candidate)
      }
    }

    // triggered when there is a change in connection state
    this.pc.oniceconnectionstatechange = (e) => {
      console.log(e)
    }

    // triggered when a stream is added to pc, see below - this.pc.addStream(stream)
    this.pc.onaddstream = (e) => {
      this.remoteVideoref.current.srcObject = e.stream
    }

    // called when getUserMedia() successfully returns - see below
    // getUserMedia() returns a MediaStream object (https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
    const success = (stream) => {
      window.localStream = stream
      this.localVideoref.current.srcObject = stream
      this.pc.addStream(stream)
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    // see the above link for more constraint options
    const constraints = {
      audio: true,
      video: true,
      // video: {
      //   width: 1280,
      //   height: 720
      // },
      // video: {
      //   width: { min: 1280 },
      // }
    }

    navigator.mediaDevices.getUserMedia(constraints)
      .then(success)
      .catch((e) => {
        console.log('getUserMedia Error: ', e)
      })
  }

  sendToPeer = (messageType, payload) => {
    this.socket.emit(messageType, {
      socketID: this.socket.id,
      payload
    })
  }

  /* ACTION METHODS FROM THE BUTTONS ON SCREEN */

  createOffer = () => {
    console.log('Offer')

    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer
    // initiates the creation of SDP
    this.pc.createOffer({ offerToReceiveVideo: 1, offerToReceiveAudio: 1 })
      .then(sdp => {
        // console.log(JSON.stringify(sdp))

        // set offer sdp as local description
        this.pc.setLocalDescription(sdp)

        this.sendToPeer('offerOrAnswer', sdp)
    })
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
  // creates an SDP answer to an offer received from remote peer
  createAnswer = () => {
    console.log('Answer')
    this.pc.createAnswer({ offerToReceiveVideo: 1, offerToReceiveAudio: 1 })
      .then(sdp => {
        // console.log(JSON.stringify(sdp))

        // set answer sdp as local description
        this.pc.setLocalDescription(sdp)

        this.sendToPeer('offerOrAnswer', sdp)
    })
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
        <video
          style={{
            width: 240,
            height: 240,
            margin: 5,
            backgroundColor: 'black'
          }}
          ref={ this.remoteVideoref }
          autoPlay>
        </video>
        <br />

        <button onClick={this.createOffer}>Offer</button>
        <button onClick={this.createAnswer}>Answer</button>

        <br />
        <textarea style={{ width: 450, height:40 }} ref={ref => { this.textref = ref }} />
      </div>
    )
  }
}

export default Video;