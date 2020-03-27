var localVideo;
var firstPerson = false;
var socketCount = 0;
var socketId;
var localStream;
var connections = [];

var peerConnectionConfig = {
    'iceServers': [
        {'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun.l.google.com:19302'},
    ]
};

function pageReady() {

    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');

    var constraints = {
        video: true,
        audio: false,
    };

    if(navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(getUserMediaSuccess)
            .then(function(){

                socket = io.connect(config.host, {secure: true});
                socket.on('signal', gotMessageFromServer);    

                socket.on('connect', function(){

                    socketId = socket.id;

                    socket.on('user-left', function(id){
                        var video = document.querySelector('[data-socket="'+ id +'"]');
                        var parentDiv = video.parentElement;
                        video.parentElement.parentElement.removeChild(parentDiv);
                    });


                    socket.on('user-joined', function(id, count, clients){
                        clients.forEach(function(socketListId) {
                            if(!connections[socketListId]){
                                connections[socketListId] = new RTCPeerConnection(peerConnectionConfig);
                                //Wait for their ice candidate       
                                connections[socketListId].onicecandidate = function(){
                                    if(event.candidate != null) {
                                        console.log('SENDING ICE');
                                        socket.emit('signal', socketListId, JSON.stringify({'ice': event.candidate}));
                                    }
                                }

                                //Wait for their video stream
                                connections[socketListId].onaddstream = function(){
                                    gotRemoteStream(event, socketListId)
                                }    

                                //Add the local video stream
                                connections[socketListId].addStream(localStream);                                                                
                            }
                        });

                        //Create an offer to connect with your local description
                        
                        if(count >= 2){
                            connections[id].createOffer().then((description) => {
                                connections[id].setLocalDescription(description)
                                    .then(() => {
                                        // console.log(connections);
                                        socket.emit('signal', id, JSON.stringify({'sdp': connections[id].localDescription}));
                                    })
                                    .catch(e => console.log(e));        
                            });
                        }
                    });                    
                })       
        
            }); 
    } else {
        alert('Your browser does not support getUserMedia API');
    } 
}

function getUserMediaSuccess(stream) {
    localStream = stream;
    localVideo.src = window.URL.createObjectURL(stream);
}

function gotRemoteStream(event, id) {

    var videos = document.querySelectorAll('video'),
        video  = document.createElement('video'),
        div    = document.createElement('div')

    video.setAttribute('data-socket', id);
    video.src         = window.URL.createObjectURL(event.stream);
    video.autoplay    = true; 
    video.muted       = true;
    video.playsinline = true;
    
    div.appendChild(video);      
    videos.appendChild(div);      
}

function gotMessageFromServer(fromId, message) {

    //Parse the incoming signal
    var signal = JSON.parse(message)

    //Make sure it's not coming from yourself
    if(fromId != socketId) {

        if(signal.sdp){            
            connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function() {                
                if(signal.sdp.type == 'offer') {
                    connections[fromId].createAnswer()
                        .then((description) => {
                            connections[fromId].setLocalDescription(description)
                                .then(() => {
                                    socket.emit('signal', fromId, JSON.stringify({'sdp': connections[fromId].localDescription}));
                                })
                                .catch(e => console.log(e));
                        })
                        .catch(e => console.log(e));
                }
            }).catch(e => console.log(e));
        }
    
        if(signal.ice) {
            connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
        }                
    }
}