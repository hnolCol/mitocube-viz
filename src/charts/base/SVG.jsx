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
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} id={svgID} ref={svgRef}>
            {children}
        </svg>

    )
}
