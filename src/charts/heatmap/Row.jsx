import PropTypes from 'prop-types';
import React from "react"
import _ from "lodash"

import { Rect } from '../../primitives/Rect';
import { RowLabel } from '../../text/RowLabel';
import { isPropHexColorString } from '../../types/checks/color';
import { getFillColor } from '../../colors/fill';
import { getStrokeColor } from '../../colors/stroke';


HeatmapRow.propTypes = {
    annotationColor: PropTypes.string,
    binHeight: PropTypes.number.isRequired,
    clusterIndexColor: PropTypes.string,
    colorNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    colorScale: PropTypes.func,
    colorValuesExist: PropTypes.bool,
    data: PropTypes.object.isRequired,
    extraColorScale: PropTypes.func.isRequired,
    fontSize: PropTypes.number,
    handleMouseEnter: PropTypes.func,
    handleMouseLeave: PropTypes.func,
    index: PropTypes.number,
    isLabelProteinTag: PropTypes.bool,
    label: PropTypes.string,
    marginBetweenValuesAndColors: PropTypes.number.isRequired,
    marginBetweenValuesAndLabels: PropTypes.number.isRequired,
    maxIdx: PropTypes.number.isRequired,
    minIdx: PropTypes.number.isRequired,
    N: PropTypes.number,
    nanFill: isPropHexColorString,
    opacity: PropTypes.number,
    rowNumber: PropTypes.number.isRequired,
    showLabel: PropTypes.bool,
    size: PropTypes.number, // pixels, rectangle height and width
    stroke: PropTypes.string,
    strokeWidth: PropTypes.number,
    valueNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    valueScale: PropTypes.func.isRequired,
    xValuesEnd: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    labelsExist: PropTypes.bool,
    isLabelFeatureTag: PropTypes.bool,
    isLabelProteinTag: PropTypes.bool,
    darkmode: PropTypes.bool
};

HeatmapRow.defaultProps = {
    opacity: 1,
    nanFill: "#fafafa",
    showLabel: true,
    isLabelProteinTag: false,
    colorValuesExist: false,
    labelsExist: true,
    handleMouseEnter: undefined,
    handleMouseLeave: undefined,
    isLabelFeatureTag: false,
    isLabelProteinTag: false,
    darkmode: false
};

/**
 * HeatmapRow - A single row in the heatmap. The 
 *
 * @param {Object} param0 - Component props.
 * @returns {JSX.Element} A group element containing the heatmap row.
 */
function HeatmapRow({
    valueScale,
    extraColorScale,
    xValuesEnd,
    rowNumber,
    index,
    y,
    data,
    maxIdx,
    minIdx,
    valueNames,
    colorNames,
    colorValuesExist,
    labelsExist,
    opacity = 1,
    binHeight,
    marginBetweenValuesAndColors,
    marginBetweenValuesAndLabels,
    labelString = "",
    handleMouseEnter,
    handleMouseLeave,
    nanFill = "#fafafa",
    clusterIndexColor,
    showLabel = true,
    isLabelProteinTag = false,
    isLabelFeatureTag = false,
    darkmode
}) {

    if (!_.inRange(rowNumber,minIdx,maxIdx)) return null 
    return(
        
        <g onMouseEnter={_.isFunction(handleMouseEnter) ? (e) => handleMouseEnter(e, index) : undefined}
            onMouseLeave={_.isFunction(handleMouseLeave) ? handleMouseLeave : undefined}>
            <Rect 
                key = {`cluster-${index}`}
                x = {0} 
                y={y} 
                width={binHeight} 
                opacity={opacity}
                height = {binHeight} 
                fill={clusterIndexColor}
                stroke={getStrokeColor(darkmode)}
                />
            
            {valueNames.map((valueName, valueIdx) =>
                <Rect
                    key={`${valueName}-${valueIdx}`}
                    x={(valueIdx+1) * binHeight + binHeight/4}
                    y={y}
                    opacity={opacity}
                    width={binHeight}
                    height={binHeight}
                    stroke={getStrokeColor(darkmode)}
                    fill={data[valueName]===undefined ? nanFill : valueScale(data[valueName])}
                />)}
            
                {colorValuesExist ?
                    colorNames.map((colorName, colorIdx) => {
                        return (
                            <Rect
                                key={`${colorName}-${colorIdx}`}
                                x={xValuesEnd + marginBetweenValuesAndColors + colorIdx * binHeight}
                                width={binHeight}
                                height={binHeight}
                                y={y}
                                fill = {extraColorScale(data[colorName])} />)
                    })
                : null}
                {labelsExist && showLabel ?
                    <RowLabel
                        x={xValuesEnd + binHeight/4 + marginBetweenValuesAndLabels + binHeight}
                        fontSize={binHeight*0.80}
                        y={y + binHeight / 2}
                        fill={getFillColor(darkmode)}
                        isLabelProteinTag={isLabelProteinTag}
                        isLabelFeatureTag={isLabelFeatureTag}
                        text={labelString} /> : null}
                    </g>


    )
  }
  function areEqual(prevProps, nextProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
    
    const prevInView = _.range(prevProps.rowNumber, prevProps.minIdx,prevProps.maxIdx)
    const nextInView = _.range(nextProps.rowNumber, nextProps.minIdx, nextProps.maxIdx)
      
    if (prevInView !== nextInView) return false 
    if (prevProps.labelString !== nextProps.labelString) {
        return false 
    }
    if (prevProps.opacity !== nextProps.opacity) {
        return false
    }
    if (prevProps.valueNames !== prevProps.valueNames) {
        return false
    }
    if (prevProps.y !== prevProps.y) {
        return false
    }
    if (prevProps.binHeight !== prevProps.binHeight) {
        return false
    }
    if (prevProps.minIdx !== prevProps.minIdx) {
        return false
          }
    if (prevProps.maxIdx !== prevProps.maxIdx) {
        return false
    }
    if (prevProps.showLabel !== prevProps.showLabel) {
        return false
    }
      
   return true

  }
  
  export default React.memo(HeatmapRow, areEqual);

