import PropTypes from 'prop-types';
import React from "react"
import _ from "lodash"

import { Rect } from '../../primitives/Rect';
import { RowLabel } from '../../text/RowLabel';
import { isPropHexColorString } from '../../types/checks/color';
import { getFillColor } from '../../colors/fill';
import { getStrokeColor } from '../../colors/stroke';
import { Annotations } from './Annotations';


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
    darkmode: PropTypes.bool,
    marginBetweenValues: PropTypes.number,
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
    opacity = 1,
    binHeight,
    marginBetweenValuesAndColors,
    marginBetweenValuesAndLabels,
    labelString = "",
    handleMouseEnter,
    handleMouseLeave,
    nanFill = "#fafafa",
    clusterIndexColor,
    showLabel,
    isLabelProteinTag,
    isLabelFeatureTag,
    annotation_tags = ["dXtpH"],
    proteinTagMap,
    clusterExists,
    darkmode,
    marginBetweenValues = 8
}) {
    return(
        
        <g onMouseEnter={_.isFunction(handleMouseEnter) ? (e) => handleMouseEnter(e, index) : undefined}
            onMouseLeave={_.isFunction(handleMouseLeave) ? handleMouseLeave : undefined}>
            {clusterExists ? <Rect
                key={`cluster-${index}`}
                x={0}
                y={y}
                width={binHeight}
                opacity={opacity}
                height={binHeight}
                fill={clusterIndexColor}
                stroke={getStrokeColor(darkmode)}
            /> : null}
            
            {valueNames.map((valueName, valueIdx) =>
                <Rect
                    key={`${valueName}-${valueIdx}`}
                    x={(valueIdx+1) * binHeight + binHeight/4 + (marginBetweenValues * valueIdx)}
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
            
            {/* {_.isArray(annotation_tags) && annotation_tags.length > 0 ?
                <Annotations
                    x={xValuesEnd + binHeight / 2 + marginBetweenValuesAndLabels + binHeight} 
                    y={y}
                    annotation_tags={annotation_tags}
                    width={binHeight}
                    height={binHeight}
                    protein_tag={labelString}
                    isLabelProteinTag={isLabelProteinTag}
                    darkmode={darkmode} /> : null} */}

                {showLabel ?
                    <RowLabel
                        x={xValuesEnd + binHeight/2 + marginBetweenValuesAndLabels + binHeight + annotation_tags.length * binHeight + marginBetweenValuesAndLabels}
                        fontSize={binHeight*0.80}
                        y={y + binHeight / 2}
                        fill={getFillColor(darkmode)}
                        isLabelProteinTag={isLabelProteinTag}
                        isLabelFeatureTag={isLabelFeatureTag}
                        text={_.isMap(proteinTagMap) ? labelString.includes(";") ? labelString.split(";").map(tag => proteinTagMap.has(tag) ? proteinTagMap.get(tag).text : tag).join(";") : proteinTagMap.has(labelString) && proteinTagMap.get(labelString).text.length > 0 ? proteinTagMap.get(labelString).text : labelString : labelString} /> : null}
                    </g>


    )
  }
  function areEqual(prevProps, nextProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
    if (prevProps.proteinTagMap.has(prevProps.labelString) !== nextProps.proteinTagMap.has(nextProps.labelString)) return false
    if (prevProps.rowNumber !== nextProps.rowNumber) return false
    if (prevProps.marginBetweenValues !== nextProps.marginBetweenValues) return false
    if (prevProps.minIdx !== nextProps.minIdx) return false
    if (prevProps.maxIdx !== nextProps.maxIdx) return false
    if (prevProps.labelString !== nextProps.labelString) return false
    if (prevProps.opacity !== nextProps.opacity) return false
    if (prevProps.y !== nextProps.y) return false
    if (prevProps.binHeight !== nextProps.binHeight) return false
    if (prevProps.showLabel !== nextProps.showLabel) return false
    if (prevProps.clusterIndexColor !== nextProps.clusterIndexColor) return false
    if (prevProps.data !== nextProps.data) return false
    if (prevProps.annotation_tags !== nextProps.annotation_tags) return false
    return true

  }
  
  export default React.memo(HeatmapRow, areEqual);

