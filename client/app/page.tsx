"use client"

import {FC, useEffect, useState} from 'react'
import { useDraw } from '@/hooks/useDraw'
import {ChromePicker} from 'react-color'
import {io, Socket} from 'socket.io-client'
import { drawLine } from '@/utils/drawLine'
const socket = io ('http://localhost:5000')


interface PageProps {}

type DrawLineProps = {
  prevPoint: Point | null,
  currentPoint : Point,
  color: string
}


const Page: FC <PageProps> = ({}) => {
  
  const [color , setColor] = useState<string>('#000')
  const {canvasRef , onMouseDown , clear} = useDraw(createLine)

  useEffect(()=>{
     
    const ctx = canvasRef.current?.getContext('2d')
    
    socket.emit('client-ready')

    socket.on('get-canvas-state',()=>{
      if(!canvasRef.current?.toDataURL()) return
      socket.emit('canvas-state',canvasRef.current?.toDataURL())
    })

    socket.on('canvas-state-from-server',(state : string)=>{
      console.log('i recive the state')
      const img = new Image()
      img.src = state
      img.onload = () => {
        ctx?.drawImage(img,0,0)
      }
    })

    socket.on('draw-line',({prevPoint,currentPoint,color}:DrawLineProps) => {
      if(!ctx) return
      drawLine({prevPoint,currentPoint,ctx,color})
    })

    socket.on('clear',clear)
    
    return () => {
      socket.off('get-canvas-state')
      socket.off('canvas-state-from-server')
      socket.off('draw-line')
      socket.off('clear')
    }
    
  },[canvasRef])
  
  

  /* function drowLine ({prevPoint,currentPoint,ctx}: Draw) {} */
    /* const {x:currX , y : currY} = currentPoint
    const lineColor = color
    const lineWidth = 5

    let startPoint = prevPoint ?? currentPoint
    ctx.beginPath()
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = lineColor
    ctx.moveTo(startPoint.x, startPoint.y)
    ctx.lineTo(currX,currY)
    ctx.stroke()

    ctx.fillStyle = lineColor
    ctx.beginPath()
    ctx.arc(startPoint.x , startPoint.y,2,0,2 * Math.PI)
    ctx.fill() */
  

  function createLine({prevPoint,currentPoint,ctx}: Draw){
    socket.emit('draw-line',({prevPoint,currentPoint,color}))
    drawLine({prevPoint,currentPoint,ctx,color})
  }

  return (
    <div className='w-screen h-screen bg-white flex justify-center items-center'>
      <div className='flex flex-col gap-10 pr-10'>
        <ChromePicker color = {color} onChange={(e)=>setColor(e.hex)} />
        <button 
          type='button' 
          className='p-2 rounded-md border border-black' 
          onClick={()=>socket.emit('clear')}
        > 
          Clear Canvas 
        </button>
      </div>
      <canvas
        onMouseDown={onMouseDown}
        ref = {canvasRef}
        width={750}
        height = {750}
        className= 'border border-black rounded-md'
      />
    </div>
  )
}

export default Page