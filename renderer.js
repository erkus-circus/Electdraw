const electron = require('electron')
const remote = require('electron').remote
const ipc = electron.ipcRenderer
const fs = require('fs')
const $ = require('./erklib.js')

/**
 * Eric Diskin
 * 2018 - 2019
 */


var glob = {
    showMouse: false,
    mouseDown: false,
    size: 16,
    mode: 'marker',
    px:0,
    py:0
},
canvs = [], ctxs = [], top

function saveAssets(assetStack,name) {
    fs.writeFile(name + '.stack-img-file',JSON.stringify({stack:assetStack,glob:glob}),()=>{})
}
var stack = []

function loadAssets(name, changeStack) {
    var nstack;

    fs.readFile(name,(err,data)=>{
        if(err) ipc.send('error',err)

        stack = JSON.parse(data)
        
    })
}

function DrawStack() {
    for (let i = 0; i < stack.length; i++) {
        const asset = stack[i];
        draw(asset)
    }
}

function AddLayer() {
    var nl = document.createElement('canvas')
    nl.classList.add('canv','layer')
    document.getElementById('layers').appendChild(nl)
    updateCanvs()
}

function changeCanvasSize(words) {
    for (let i = 0; i < canvs.length; i++) {
        const canv = canvs[i];
        canv.width = words[1]
        canv.height = words[2]
    }
}

function draw(asset) {
    var type = asset.split(' ')[0],
    words = asset.split(' ')
    switch (type) {
        case 'cl':
            glob.layer = ctxs[parseInt(words[1])]
            break;
            
        case 'nl':
            AddLayer()
            break;
        
        case 'cvs':
            changeCanvasSize(words)
            break;
        
        case 'move':
            glob.layer.moveTo(parseInt(words[1]),parseInt(words[2]))
            break;
        
        case 'line':
            glob.layer.lineTo(parseInt(words[1]),parseInt(words[2]))
            break;
        
        case 'strk':
            glob.layer.stroke()
            break;
            
        case 'fill':
            glob.layer.fill()
            break;
        
        case 'color':
            glob.color = words[1]
            break;
        
        case 'strkColor':
            glob.layer.strokeStyle = glob.color;
            break;

        case 'fillColor':
            glob.layer.fillStyle = glob.color;
            break;

        default:
            break;
    }
}

function updateCanvs() {
    canvs = document.getElementsByClassName('canv')
    for (let i = 0; i < canvs.length; i++) {
        canvs[i].style.zIndex = i; // apply layer
        const c = canvs[i].getContext('2d'); // get contexts
        ctxs.push(c)
    }
    top = ctxs.pop() // top canvas
    glob.layer = ctxs[0] // layer currently editing
}

function mPos(e) { // find mouse position on "canvas"
    var rt = $('#base')[0].getBoundingClientRect();
    return {
        x: e.clientX - rt.left,
        y: e.clientY - rt.top
    };
}

function negColor(hex) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    // invert color components
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    // pad each with zeros and return
    return '#' + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len=2) {
    len = len;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}


function clear(ctx, canv=$('#base')) {
    ctx.clearRect(0,0,canv.width(),canv.height())
}



onload = () => {
    updateCanvs() // initalize canvases
    var a = [
        `cvs ${window.innerWidth * .75} ${window.innerHeight * .50}`, // size canvas accordingly to screen
        ``
    ]
    for (let i = 0; i < a.length; i++) { // execute a
        const p = a[i];
        draw(p)
    }
    $(document).on('mousemove mousedown',(evt)=> {
        if (evt.type == 'mousedown') {
            glob.mouseDown = true;
        }
        var p = mPos(evt) // mouse position over canvases
        if (!glob.showMouse && !glob.mouseDown) {
            clear(top) // clear the top canvas
            switch (glob.mode) {
                case 'marker': // draw mouse pointer (circle) if mode is marker
                    top.beginPath()
                    top.arc(p.x,p.y,glob.size,0,2*Math.PI)
                    top.stroke()
                    top.closePath()
                    break;
                
                default:
                    break;
            }
        } else if (glob.mouseDown) {
            draw(`move ${glob.px} ${glob.py}`)
            draw(`line ${p.x} ${p.y}`)
            draw('strk')
        }
    })
    updateCanvs()
}