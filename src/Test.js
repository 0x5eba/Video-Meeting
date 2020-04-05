import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import { Container, Row, Col} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.css';
import "./Test.css"

var elms = 0

class Test extends Component {
	constructor(props) {
        super(props)
    }

    componentDidMount = () => {
        this.click()
    }

    click = () => {
        elms++
        var main = document.getElementById('main')

        main.innerHTML = ""

        for(let a = 0; a < elms; ++a){
            var video = document.createElement('video')

            var width = ""
            if(elms === 1 || elms === 2){
                width = "100%"
            } else if(elms === 3 || elms === 4){
                width = "40%"
            } else {
                width = String(100/elms) + "%"
            }

            var height = String(100/elms) + "%"

            video.style.minWidth = "30%"
            video.style.minHeight = "30%"
            video.style.setProperty("width", width)
            video.style.setProperty("height", height)

            video.style.margin = "10px"
            video.style.backgroundColor = "blue"

            main.appendChild(video)
        }
    }

	render() {
		return (
            <div className="container">
                <Row id="main" className="flex-container">
                    
                </Row>

                <div className="btn-down">
                    <Button onClick={() => this.click()} style={{ backgroundColor: "#4caf50"}}>CLICK</Button>
                </div>
            </div>
		)
	}
}

export default Test;