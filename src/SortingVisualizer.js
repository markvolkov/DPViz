import React from 'react';
import './SortingVisualizer.css';

import { faSlidersH } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Bar from "./components/bar/Bar";
import Dropdown from "./components/nav/dropdown/Dropdown";
import selectionSort from "./algos/selectionSort";

export default class SortingVisualzer extends React.Component {

  constructor() {
    super();
    this.amountToSort = 15;
    this.maxHeight = 600;
    this.maxWidth = window.innerWidth / 1.25;
    this.audioConnected = false;
    this.enableAudio = true;
    this.state = {
      array: [],
    }
    this.barComp = {};
    this.algorithmFunctions = [];
  }

  componentWillMount() {
    this.generateBars();
  }

  componentDidMount() {
    this.setDefaultAmountToSort();
    this.mapAlgorithms();
  }

  setDefaultAmountToSort() {
    document.getElementById("amountToSort").value = this.amountToSort;
  }

  mapAlgorithms() {
    this.algorithmFunctions["selectionSort"] = selectionSort;
  }

  setAmountToSort() {
    let amountToSort = document.getElementById("amountToSort");
    if (amountToSort == null) {
      return;
    }
    this.amountToSort = parseInt(document.getElementById("amountToSort").value);
  }

  sortArrayAnimated() {
    let algoOptions = document.getElementById("algorithms");
    let selectedAlgo = algoOptions.options[algoOptions.selectedIndex].text;
    // this.algorimFunctions[selectedAlgo.toString().toLowerCase()]();
    console.log(selectedAlgo);
    let bars = this.state.array;
    var i = 0;
    var j = 1;
    var context = new AudioContext()
    var o = context.createOscillator()
    var g = context.createGain()
    if (this.enableAudio) {
      o.connect(g)
      o.type = 'triangle';
      g.gain.exponentialRampToValueAtTime(
        0.000001, context.currentTime + 0.5
      )
      g.connect(context.destination)
      o.start();
    }
    window.requestAnimationFrame(() => { this.selectionSort(bars, i, j, context, o, []) });
  }

  selectionSort(bars, i, j, audioCtx, o, toReset) {
    let didReset = false;
    while (toReset.length > 0) {
      didReset = true;
      toReset.pop().ref.current.reset();
    }
    if (didReset) {
      this.setState({ bars });
    }
    if (i >= bars.length - 1) {
      if (this.audioConnected && this.enableAudio) {
        o.disconnect(audioCtx.destination)
      }
      this.audioConnected = false;
      cancelAnimationFrame(this);
      this.checkForSorted(bars, 0, audioCtx, o)
      return;
    }
    bars[i].ref.current.toggleSelected();
    toReset.push(bars[i]);
    if (bars[i].height < bars[j].height) {
      toReset.pop();
      bars[i].ref.current.toggleSelected();
      bars[i].ref.current.toggleSwap();
      bars[j].ref.current.toggleSwap();
      toReset.push(bars[i]);
      toReset.push(bars[j]);
      //swap bar i and bar j
      let tempBar = bars[j];
      bars[j] = bars[i];
      bars[i] = tempBar;
      // o.frequency.value = Math.abs(j - i) * Math.min(bars.length, 50);
      o.frequency.value = Math.abs(j - i) * Math.abs(j - i);
      // o.frequency.value = 0;
      if (this.enableAudio) {
        o.connect(audioCtx.destination);
      }
      this.audioConnected = true;
    } else {
      if (this.audioConnected && this.enableAudio) {
        o.disconnect(audioCtx.destination)
        this.audioConnected = false;
      }
      bars[j].ref.current.toggleActive();
      toReset.push(bars[j]);
    }
    if (j >= bars.length - 1) {
      i++;
      j = i + 1;
    } else {
      j++;
    }
    this.setState({ bars });
    setImmediate(() => { this.selectionSort(bars, i, j, audioCtx, o, toReset) })
  }

  checkForSorted(bars, i, audioCtx, o) {
    if (i >= bars.length) {
      cancelAnimationFrame(this);
      if (this.audioConnected && this.enableAudio) {
        o.disconnect(audioCtx.destination)
      }
      this.audioConnected = false;
      return;
    }
    var process = i + i + 1 > bars.length ? bars.length : i + i + 1;
    for (; i < process; i++) {
      let currentBar = bars[i];
      o.frequency.value = Math.abs(i - bars.length) * Math.abs(i - bars.length);
      if (this.enableAudio && !this.audioConnected) {
        o.connect(audioCtx.destination);
      }
      this.audioConnected = true;
      if (i == bars.length - 1) {
        currentBar.backgroundColor = "#e74c3c";
        setTimeout(() => this.restoreColor(bars), 1000)
      } else {
        currentBar.backgroundColor = "#2ecc71";
      }
    }
    this.setState({ bars });
    window.requestAnimationFrame(() => { this.checkForSorted(bars, i, audioCtx, o) })
  }

  restoreColor(bars) {
    for (var i = 0; i < bars.length; i++) {
      bars[i].backgroundColor = this.getScaledBackground(bars[i].height, false);
    }
    this.setState({ bars })
  }

  generateBars() {
    let bars = this.state.array;
    if (bars.length > 0) {
      for (var i = 0; i < bars.length; i++) {
        bars[i].ref.current.setState({ bounce: false })
      }
    }
    this.setState({ bars })
    this.setAmountToSort();
    let array = [];
    this.setState({ array })
    let widthPerBar = Math.floor((this.maxWidth - 1) / this.amountToSort);
    let heightConstant = this.maxHeight + 1;
    let uniformHeight = (heightConstant * 6) / this.amountToSort;
    for (let i = 0; i < this.amountToSort; i++) {
      let height = Math.floor((Math.random() * heightConstant)) + 15;
      // let height = uniformHeight + i;
      let width = widthPerBar;
      let backgroundColor = this.getScaledBackground(height, false);
      let ref = React.createRef();
      array[i] = { height: height, width: width, backgroundColor: backgroundColor, ref: ref };
    }
    this.setState({ array });
  }

  hexToRgbaArr(color) {
    if (color.charAt(0) == '#') {
      //# trim
      color = color.substring(1);
    } else {
      //0x trim
      color = color.substring(2);
    }
    let red = color.substring(0, 2);
    let green = color.substring(2, 4);
    let blue = color.substring(4, 6);
    let alpha = color.substring(6, 8);

    return [parseInt(red, 16), parseInt(green, 16), parseInt(blue, 16), parseInt(alpha, 16)];
  }

  getDepthHexColorArr(num, range) {
    return this.hexToRgbaArr("0x" + this.depthToHex(num, range, false) + "00" + this.depthToHex(num, range, true) + "ff");
  }


  getDepthHexColor(num, range) {
    return "#" + this.depthToHex(num, range, false) + "00" + this.depthToHex(num, range, true) + "ff";
  }

  depthToHex(num, range, reverse) {
    const hexList = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F']
    let colorVal = (num / range) * 256;
    if (reverse) {
      colorVal = 255 - colorVal;
    }
    let red = hexList[Math.floor(colorVal / 16)];
    let green = hexList[Math.floor(colorVal % 16)];
    return (red + green);
  }

  getScaledBackground(height, depth) {
    if (depth) {
      return this.getDepthHexColor(height, this.maxHeight);
    }
    let backgroundColor = "rgba(241, 196, 15, " + (height / this.maxHeight) + ")";
    return backgroundColor;
  }

  render() {
    let bars = this.state.array;
    return (
      <div className="bar-container">
        <div className="settings">
          <h1>Settings <FontAwesomeIcon icon={faSlidersH} /></h1>
          <Dropdown id="dropdown" />
          <div className="buttons">
            <div className="slidecontainer">
              <input id="amountToSort" type="range" min="15" max="150" placeholder="15" step="10" className="slider" />
            </div>
            <button onClick={(e) => this.generateBars()}>Regenerate Array</button>
            <button onClick={(e) => this.sortArrayAnimated()}>Sort Array</button>
          </div>
        </div>
        {
          bars.map((bar, idx) => {
            let component = <Bar ref={bars[idx].ref} key={idx} height={bar.height} width={bar.width} backgroundColor={bar.backgroundColor} />
            return component;
          })
        }
      </div>
    );
  }

}
