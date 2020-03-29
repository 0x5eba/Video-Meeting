import React, { Component } from 'react';

class Screen extends Component {
  constructor(props) {
    super(props)
    
    this.localVideoref = React.createRef()
  }
  
  getUserMediaSuccess = (stream) => {
    window.localStream = stream
		this.localVideoref.current.srcObject = stream
  }
  
  componentDidMount = () => {
    var constraints = {
      video: true
    }
    
    if (navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia(constraints)
        .then(this.getUserMediaSuccess)
        .then(() => {

        })
        .catch((e) => console.log(e))
    }
  }

  render() {
    return (
      <div >
				<video ref={ this.localVideoref } autoPlay></video>
      </div>
    )
  }
}

export default Screen;