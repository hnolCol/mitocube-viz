import PropTypes from "prop-types"

SVG.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    svgRef: PropTypes.any,
    svgID: PropTypes.string.isRequired,
    contextMenuEnabled : PropTypes.bool
}

export function SVG({width = 100, height = 200, svgRef = undefined, svgID = undefined, children}){
    return (
        // <ContextMenu disabled={!contextMenuEnabled} content={
        //     <Menu>
        //         <MenuItem text="Download" onClick={() => downloadSVG(document.getElementById(svgID), "chart.svg")}>
        //         </MenuItem>
        //     </Menu>}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} id={svgID} ref={svgRef}>
            {children}
        </svg>
        // </ContextMenu>
    )
}
