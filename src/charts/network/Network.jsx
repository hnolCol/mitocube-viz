import { useMemo } from "react";
import { useState, useEffect, useRef, Suspense } from "react";
import { SVG } from "../base/SVG"
import PropTypes from 'prop-types'; 
import _ from "lodash"
import Line from "../../primitives/Line";
import Point from "../../primitives/Point"; 
import { scaleLinear } from "@visx/scale";
import { localPoint } from "@visx/event"




const defaultData = {
  "nodes": [
    {
      "id": "A",
      "label": "Node A",
      "type": "person",
      "data": {
        "weight": 3,
        "group": "team-1"
      },
      "position": { "x": 100, "y": 80 }  // optional (frontend may auto-layout)
        },
        {
      "id": "B",
      "label": "Node B",
      "type": "person",
      "data": {
        "weight": 3,
        "group": "team-1"
      },
      "position": { "x": 120, "y": 150 }  // optional (frontend may auto-layout)
    }
  ],
  "edges": [
    {
      "id": "A-B",
      "source": "A",
      "target": "B",
      "label": "connected_to",
      "weight": 1.2,
      "directed": true
    }
  ],
  "meta": {
    "directed": true,
    "layout": "force"
  }
}



export function InteractiveNetwork({
    width,
    height,
    svgRef,
    svgID
}) {

    const handleNodeMove = (e, nodeID, newPosition) => {
        console.log(`Node ${nodeID} moved to position:`, newPosition);
        // Here you can update the state or perform any actions needed when a node is moved
    }


    return (


        <Network {...{ width, height, data: defaultData, svgRef, svgID }} />

        // <Suspense fallback={<div>Loading...</div>}>
    )
}
    


Network.defaultProps = {
    width : 400,
    height: 400
}
    
Network.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
}

export function Network({
    width,
    height,
    svgRef,
    svgID}
) {
    
    const [dragState, setDragState] = useState({dx : 0, dy : 0, nodeId: null, isDragging: false})
   
    
    /**
     * @description Handles mouse down on a node to start dragging
     */
    const handleMouseDown = (e, nodeId) => {
        // console.log(`Mouse down on node ${nodeId}`)
        const coords = localPoint(e.target.ownerSVGElement, e);
        // console.log(coords,"mouse down coords")
        setDragState({
            nodeId,
            startX: coords.x,
            startY: coords.y,
            isDragging: false
        })
    }
    
    /**
     * @description Handles mouse move to track dx and dy
     */
    const handleMouseMove = (e) => {
        if (!dragState) return
        if (_.isNumber(dragState.startX) && _.isNumber(dragState.startY)) {
            const coords = localPoint(e.target.ownerSVGElement, e);
            // console.log(coords, "mouse move coords")
            // console.log(dragState, "current drag state")
            const dx = coords.x - dragState.startX
            const dy = coords.y - dragState.startY
            
            // console.log(`Node ${dragState.nodeId} - dx: ${dx}, dy: ${dy}`)
            
            setDragState(prev => ({
                ...prev,
                isDragging: true,
                dx,
                dy
            }))
        }
    }
    
    /**
     * @description Handles mouse up to end dragging
     */
    const handleMouseUp = () => {
        if (dragState && dragState.isDragging) {
            // console.log(`Node ${dragState.nodeId} final position - dx: ${dragState.dx}, dy: ${dragState.dy}`)
        }
        setDragState(null)
    }
    
    /**
     * @description Calculates the x position
     */
    const xScale = useMemo(() => {
        return scaleLinear(
            {
                domain: [0, 200],
                range: [10, width-100]
            }
        )
    }, [width])
    /**
     * @description Calculates the y position
     */
    const yScale = useMemo(() => {
        return scaleLinear(
            {
                domain: [0, 200],
                range: [0, height-50]
            }
        )
    }, [height])


    const getEdgePositions = (edge) => {
        const sourceNode = defaultData.nodes.find(node => node.id === edge.source)
        const targetNode = defaultData.nodes.find(node => node.id === edge.target)
        const dxSource = _.isNumber(dragState?.dx) && dragState.nodeId === sourceNode.id ? dragState.dx : 0
        const dySource = _.isNumber(dragState?.dy) && dragState.nodeId === sourceNode.id ? dragState.dy : 0 

        const dxTarget = _.isNumber(dragState?.dx) && dragState.nodeId === targetNode.id ? dragState.dx : 0
        const dyTarget = _.isNumber(dragState?.dy) && dragState.nodeId === targetNode.id ? dragState.dy : 0
        
        const x1 = xScale(sourceNode.position.x) + dxSource
        const y1 = yScale(sourceNode.position.y) + dySource
        const x2 = xScale(targetNode.position.x) + dxTarget
        const y2 = yScale(targetNode.position.y) + dyTarget
        return {x1, y1, x2, y2}
    }


        return (
            <div onMouseUp={handleMouseUp}> 
                <SVG {...{width, height, svgRef, svgID}}>
                    <rect x={0} y={0} width={width} height={height} fill="transparent" onMouseMove={handleMouseMove}/>
                    {defaultData.edges.map(edge => {
                        const {x1, y1, x2, y2} = getEdgePositions(edge)
                      
                        return <Line key={edge.id} {...{x1, y1, x2, y2}} stroke={"black"} strokeWidth={0.5}/>
                    })}

                    {defaultData.nodes.map(node => {
                        const dx = _.isNumber(dragState?.dx) && dragState.nodeId === node.id ? dragState.dx : 0
                        const dy = _.isNumber(dragState?.dy) && dragState.nodeId === node.id ? dragState.dy : 0 
                        // console.log(dx,dy,"delta")
                        const x = xScale(node.position.x) + dx  
                        const y = yScale(node.position.y) + dy
                        // console.log(x,y,"YX position")



                        return (
                            <Point 
                                key={node.id} 
                                p={[x, y]} 
                                r={10} 
                                fill={"red"} 
                                strokeWidth={0.5}
                                onMouseDown={(e) => handleMouseDown(e, node.id)}
                                style={{ cursor: 'pointer' }}
                            />
                        )
                    })}
                    

                    

                    


                </SVG> 
            </div>
    )
}




