declare var require: any


const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)


import {Server} from 'socket.io'

const io = new Server(server,{
    cors: {
        origin : '*'
    }
})

type Point = {x:number , y:number}

type DrawLine = {
    prevPoint: Point | null,
    currentPoint : Point,
    color: string
}

io.on('connection', (socket)=>{
    console.log('connection')

    socket.on('client-ready',()=>{
        socket.broadcast.emit('get-canvas-state')
    })
    
    socket.on('canvas-state',(state)=>{
        socket.broadcast.emit('canvas-state-from-server',state)
    })

    socket.on('draw-line',({prevPoint,currentPoint,color}: DrawLine)=>{
        socket.broadcast.emit('draw-line',{prevPoint,currentPoint,color})
    })

    socket.on('clear',()=>{
        io.emit('clear')
    })
})


server.listen(5000,(err:string)=>{
    err ? console.log(err) : console.log('server is running on port 5000')
})