import React from "react";
import "./Cell.css";

export default class Cell extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            active: false,
            swap: false,
            access: false,
            stateBg: ""
        }
    }

    render() {
        let bgColor =  this.props.background;
        if (this.state.active) {
            bgColor = "#161bb0";
        } 
        if (this.state.swap) {
            bgColor = "#9b59b6";
        }
        if (this.state.access) {
            bgColor = "#2ecc71"
        }
        if (this.state.stateBg.length != 0) {
            bgColor = this.state.stateBg;
        }
        return (
            <div className={'cell'} style={{width: this.props.width, height: this.props.height, backgroundColor: bgColor}}><p>{this.props.weight}</p></div>
        );
    }

    setStateBg(bg) {
        this.setState({stateBg: bg})
    }

    toggleActive() {
        this.setState({active: !this.state.active})
    }

    toggleSwap() {
        this.setState({swap: !this.state.swap})
    }

    toggleAccess() {
        this.setState({access: !this.state.access})
    }

    reset() {
        this.setState({active: false, swap: false, access: false, stateBg: ""})
    }

}