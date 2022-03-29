import React from 'react';
import './DPVisualizer.css';

import { faSlidersH } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Cell from "./components/cell/Cell";
// import { CompareArrowsOutlined } from '@material-ui/icons';

export default class DPVisualizer extends React.Component {

    constructor() {
        super();
        this.ccm = this.getVowelCCM();
        this.state = {
            //for visualizing accesses in ccm
            ccmArr: [],
            //for visualizing compares in the dp arr
            dpArr: [],
            x: "",
            y: "",
            editDistance: 0,
            //max ccm depth
            maxDepth: 0,
        }
        this.gapCost = 1;
        this.fps = 5;
        this.fpsInterval = 1000 / this.fps;
    }

    componentWillMount() {
        //called before our components render
        // this.generateCells();
        // this.generateDPArrayCells("dog", "dag");
        // this.setDPArray("dog", "dag");
    }

    componentDidMount() {
        //called aftr our components have been fully rendered
        // this.setDPArray("dog", "dag");
    }

    getAlignmentMinEditDistanceAnimated() {
         //todo: convert loop to be recursive so I can use request animation frame
        // Used to cancel our animation frame when we finish algo: window.cancelAnimationFrame(this);
        this.generateCells();
        this.generateDPArrayCells(this.state.x, this.state.y);
        window.requestAnimationFrame(() => { this.getAlignmentMinEditDistance(this.state.x, this.state.y, this.state.ccmArr, this.state.dpArr, this.gapCost, 0, 0, true, [], Date.now()) })
    }

    getAlignmentMinEditDistance(X, Y, ccm, A, gapCost, j, i, setup, toReset, timeThen) {
        let didReset = false;
        let timeNow = Date.now();
        let elapsed = timeNow - timeThen;
        if (elapsed > this.fpsInterval) {
            while (toReset.length > 0) {
                didReset = true;
                toReset.pop().ref.current.reset();
            }
            timeThen = timeNow - (elapsed % this.fpsInterval);
        }
        if (didReset) {
          this.setState({ dpArr: A });
        }
        //init values for when Y is empty
        if (setup) {
            if (i >= X.length && j >= Y.length) {
                //we setup our initial values lets run the algo...
                window.requestAnimationFrame(() => { this.getAlignmentMinEditDistance(X, Y, ccm, A, this.gapCost, 0, 0, false, toReset, timeThen) })
            } else if (i < X.length) {
                A[i + 1][0].ref.current.toggleActive();
                A[i + 1][0].weight = gapCost * (i + 1);
                toReset.push(A[i + 1][0]);
                this.setState({dpArr: A});
                window.requestAnimationFrame(() => { this.getAlignmentMinEditDistance(X, Y, ccm, A, this.gapCost, j, i + 1, true, toReset, timeThen) })
            } else {
                A[0][j + 1].ref.current.toggleActive();
                A[0][j + 1].weight = gapCost * (j + 1);
                toReset.push(A[0][j + 1]);
                this.setState({dpArr: A});
                window.requestAnimationFrame(() => { this.getAlignmentMinEditDistance(X, Y, ccm, A, this.gapCost, j + 1, i, true, toReset, timeThen) })
            }
        } else {
            if (j >= Y.length) {
                this.setState({ editDistance: A[X.length][Y.length] });
                while (toReset.length > 0) {
                    toReset.pop().ref.current.reset();
                }
                window.cancelAnimationFrame(this);
                //now color ccm based on depth
                // ccm.sort(this.compareDepth)
                // console.log(ccm);
                //color depth animated 
                window.requestAnimationFrame( () => { this.colorCCMDepthAnimated(ccm, 0, 0)} );
            } else if (i >= X.length) {
                window.requestAnimationFrame(() => { this.getAlignmentMinEditDistance(X, Y, ccm, A, this.gapCost, j + 1, 0, false, toReset, timeThen) })
            } else {
                const a = X.charAt(i);
                const b = Y.charAt(j);
                const swapCost = this.getSwapCost(a, b, ccm);
            
                //animate ccm
                ccm[this.getIdx(a)][this.getIdx(b)].ref.current.toggleAccess();
                ccm[this.getIdx(a)][this.getIdx(b)].depth = ccm[this.getIdx(a)][this.getIdx(b)].depth + 1;
                this.setState({maxDepth: this.max(this.state.maxDepth, ccm[this.getIdx(a)][this.getIdx(b)].depth = ccm[this.getIdx(a)][this.getIdx(b)].depth)})
                toReset.push(ccm[this.getIdx(a)][this.getIdx(b)]);
                const pathOne = swapCost + A[i][j].weight;
                const pathTwo = gapCost + A[i][j + 1].weight;
                const pathThree = gapCost + A[i + 1][j].weight;
                A[i + 1][j + 1].weight = this.min(pathOne, this.min(pathTwo, pathThree));
                this.setState({dpArr: A})
                if (A[i + 1][j + 1].weight == pathOne) {
                    A[i + 1][j + 1].ref.current.toggleSwap();
                    A[i][j].ref.current.toggleSwap();
                    toReset.push(A[i + 1][j + 1]);
                    toReset.push(A[i][j]);
                } else if (A[i + 1][j + 1].weight == pathTwo) {
                    A[i + 1][j + 1].ref.current.toggleSwap();
                    A[i][j + 1].ref.current.toggleSwap();
                    toReset.push(A[i + 1][j + 1]);
                    toReset.push(A[i][j + 1]);      
                } else {
                    A[i + 1][j + 1].ref.current.toggleSwap();
                    A[i + 1][j].ref.current.toggleSwap();
                    toReset.push(A[i + 1][j + 1]);
                    toReset.push(A[i + 1][j]);   
                }
                window.requestAnimationFrame(() => { this.getAlignmentMinEditDistance(X, Y, ccm, A, this.gapCost, j, i + 1, false, toReset, timeThen) })
            }
        }
    }

    //todo: fix 2d sorting array based on depth
    //TODO: Investigate why i and j are swapped with requesting animation frame, I'm most likely doing something very very very stupid lol
    colorCCMDepthAnimated(ccm, i, j) {
        if (i >= ccm.length) {
            window.requestAnimationFrame(() => { this.colorCCMDepthAnimated(ccm, 0, j + 1) })
        } else if (j >= ccm[i].length) {
            window.cancelAnimationFrame(this);
        } else {
            const depth = ccm[i][j].depth;
            const color = this.getDepthHexColor(depth, this.state.maxDepth + 1);
            // alert("Called animate ccm: " + color)
            ccm[i][j].ref.current.setStateBg(color);
            window.requestAnimationFrame(() => { this.colorCCMDepthAnimated(ccm, i + 1, j) })
        }
    }

    getSwapCost(a, b, ccm) {
        if (a === b) return 0.0; //unneeded but still keeping it in in-case a future ccm has a diff result
        return ccm[this.getIdx(a)][this.getIdx(b)];
    }

    getIdx(c) {
        if (c === 'a') return 0;
        if (c === 'e') return 1;
        if (c === 'i') return 2;
        if (c === 'o') return 3;
        if (c === 'u') return 4;
        return -1;
    }

    getCCMVal(idx) {
        if (idx === 0) return 'a';
        if (idx === 1) return 'e';
        if (idx === 2) return 'i';
        if (idx === 3) return 'o';
        if (idx === 4) return 'u';
        return -1;
    }

    getVowelCCM() {
        //a e i o u
        //e
        //i
        //o
        //u
        let res = [
            [0.0, 2.0, 7.0, 8.0, 6.0],
            [2.0, 0.0, 5.0, 6.0, 4.0],
            [7.0, 5.0, 0.0, 1.0, 1.0],
            [8.0, 6.0, 1.0, 0.0, 2.0],
            [6.0, 4.0, 1.0, 2.0, 0.0],
        ];
        return res;
    }

    compareDepth(a, b) {
        return b.depth - a.depth;
    }

    min(a, b) {
        if (a <= b) return a;
        return b;
    }

    max(a, b) {
        if (a >= b) return a;
        return b;
    }

    get2DArray(rows, cols) {
        let result = new Array(rows);
        for (let i = 0; i < result.length; i++) {
            result[i] = new Array(cols);
            for (let j = 0; j < cols; j++) {
                const width = 100;
                const height = 100;
                // const background = '#bdc3c7';
                const background = 'black';
                const weight = 0;
                const ref = React.createRef();
                result[i].push({ width, height, background, weight, ref })
            }
        }
        return result;
    }

    setDPArray(X, Y) {
        this.setState({dpArr: this.get2DArray(5, 5)});
        // console.log(this.state.dpArr)
    }

    generateCells() {
        let cells = this.state.ccmArr;
        this.setState({maxDepth: 0});
        if (cells.length > 0) {
            cells.forEach((cellArr) => {
                cellArr.forEach((cell) => {
                    cell.ref.current.reset();
                })
            })
            cells = [];
            // this.setState({ array: cells });
        }
        for (let i = 0; i < this.ccm.length; i++) {
            cells.push([]);
            for (let j = 0; j < this.ccm[i].length; j++) {
                const width = 50;
                const height = 50;
                // const background = '#bdc3c7';
                const background = 'black';
                const weight = this.ccm[i][j];
                const ref = React.createRef();
                const value = i == 0 ? this.getCCMVal(j) : this.getCCMVal(i);
                const depth = 0;
                if (i == 0 || j == 0) {
                    console.log(i + " , " + j + " " + value); 
                    cells[i].push({ width, height, background, weight, ref, depth, value});
                } else {
                    cells[i].push({ width, height, background, weight, ref, depth});
                }
            } 
        }
        this.setState({ ccmArr: cells });
    }

    generateDPArrayCells(X, Y) {
        let cells = this.state.dpArr;
        if (cells.length > 0) {
            cells = [];
            // this.setState({ dpArr: cells });
        }
        for (let i = 0; i < X.length + 1; i++) {
            cells.push([]);
            for (let j = 0; j < Y.length + 1; j++) {
                const width = 50;
                const height = 50;
                // const background = '#bdc3c7';
                const background = 'black';
                const weight = 0;
                const ref = React.createRef();
                const value = i == 0 ? Y.charAt(j) : X.charAt(i);
                if (i == 0 && j != 0) {
                    cells[i].push({ width, height, background, weight, ref, value });
                } else {
                    cells[i].push({ width, height, background, weight, ref });
                }
            }
        }
        this.setState({ dpArr: cells });
    }

    hexToRgbaArr(color) {
        if (color.charAt(0) === '#') {
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

    handleChangeX = (e) => {
        this.setState({ x: e.target.value });
    };

    handleChangeY = (e) => {
        this.setState({ y: e.target.value });
      };

    render() {
        let cells = this.state.ccmArr;
        let memory = this.state.dpArr;
        return (
            // className="cell-container"
            <div className='container'>
                 <div className="cell-container">
                    <div className="settings">
                        <h1>Settings <FontAwesomeIcon icon={faSlidersH} /></h1>
                        <div className="buttons">
                            <div className="text">
                                <input id="stringX" type="text" value={this.state.x} onChange={this.handleChangeX} placeholder="String X" className="textInputClass" />
                                <input id="stringY" type="text" value={this.state.y} onChange={this.handleChangeY} placeholder="String Y" className="textInputClass" />
                            </div>
                            <button onClick={(e) =>this.getAlignmentMinEditDistanceAnimated() }>Calculate Edit Distance</button>
                        </div>
                    </div>
                </div>
                <div className='panel'>
                    <h1 style={{ textAlign: 'center', color: 'black' }}>Character Cost Matrix</h1>
                    <div className='cell-container'>
                    {
                        //renders our ccm array for seeing swaps while we access our dp array and make compares
                        cells.map((inner, j) => {

                            return (
                                <div>
                                    {
                                        inner.map((cell, idx) => {
                                            let component = <Cell ref={cells[j][idx].ref} key={idx} height={cell.height} width={cell.width} weight={cell.weight} val={cell.value} backgroundColor={cell.background} />
                                            return component;
                                        })
                                    }
                                </div>
                            )

                        })
                    }
                </div>
                </div>
                <div className='panel'>
                <h1 style={{ textAlign: 'center', color: 'black' }}>DP Access</h1>
                    <div className='cell-container'>
                    {
                        //renders our ccm array for seeing swaps while we access our dp array and make compares
                        memory.map((inner, j) => {

                            return (
                                <div>
                                    {
                                        inner.map((cell, idx) => {
                                            // console.log(cell);
                                            let component = <Cell ref={memory[j][idx].ref} key={idx} height={cell.height} width={cell.width} weight={cell.weight} val={cell.value} backgroundColor={cell.background} />
                                            return component;
                                        })
                                    }
                                </div>
                            )

                        })
                    }
                </div>
                </div>
            </div>

        );
    }

}
