import { Rect } from "../../primitives/Rect"
import { SVG } from "../base/SVG";
import _ from "lodash"
import PropType from "prop-types"
import { Text } from "@visx/text";
import { isPropHexColorString } from "../../types/checks/color";
import { scaleOrdinal } from "@visx/scale";
import { useMemo } from "react";
import { getColorPalette } from "../../colors/palette";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { localPoint } from "@visx/event"
import { ConditionApplicationsView } from "../../../../mitocube-frontend/src/comps/core/base/condition_applications/ConditionApplicationView";
import { Attribute } from "../../../../mitocube-frontend/src/comps/core/base/attributes/Attribute";


/**
 * 
 * @param {Object} props 
 * @param {Object[]} props.data The data where there is a tag (sample tag), and the keys are the attribute tags, the values are a list of strings. (e.g. condition application tags)
 * @param {Number} props.x The x position of the grouping rectangles
 * @param {Number} props.y The y position of the grouping rectangles
 * @param {Number} props.width The width of each rectangle in the grouping
 * @param {Number} props.height The height of each rectangle in the grouping
 * @param {String} props.keyName The name of the grouping, will be displayed to the right of the grouping rectangles
 * @param {String} props.stroke The stroke color of the rectangles.
 * @param {Function} props.handleMouseOver The function to handle mouse over events
 * @param {Function} props.handleMouseLeave The function to handle mouse leave events
 * @param {Boolean} props.is_condition_application Whether this grouping is for condition application (used in tooltip display). If true
 * the tooltip will fetch data from the mitocube backend to get the required information. 
 * @returns 
 */
function GroupingRow({ data, x, y, width, height, keyName, stroke, handleMouseOver, handleMouseLeave, is_condition_application, attributeTagMap, colorIndex, darkmode = false }) {
    const uniqueValues = _.uniq(data.map(d => _.isArray(d[keyName]) ? _.join(d[keyName], ",") : d[keyName]));
    const isSuccess = true
    /**
     * @description The colorScale for the individual groups of the grouping. 
     */
    const colorScale = useMemo(() => {
        
        if (uniqueValues.length === 0) return () => "#fafafa"
        return scaleOrdinal({
            domain: uniqueValues,
            range : getColorPalette(uniqueValues.length,darkmode,colorIndex)
        })
    }, [keyName, _.join(uniqueValues, "-"), darkmode, colorIndex])
    

    return (
        <g>
            {data.map((d, i) => {
                return (
                    <Rect 
                        key={`${keyName}-grouping-${i}`}
                        x={x + i * width}
                        y={y}
                        width={width}
                        height={height}
                        stroke={stroke}
                        fill={colorScale(_.join(d[keyName], ","))}
                        onMouseOver={(event) => handleMouseOver(event, {...d, keyName: keyName, is_condition_application})}
                        onMouseLeave={handleMouseLeave}
                        />
                )
            })}
        
            <Text 
                x={x + data.length * width + 5}
                y={y + height / 2}
                verticalAnchor="middle"
                fontSize={height * 0.8}
                fill="#000000">
                {is_condition_application ? isSuccess ? attributeTagMap.get(keyName).text : '' : keyName}
            </Text>
        </g>
    )
}



HeatmapGrouping.propTypes = {
    startX: PropType.number,
    startY: PropType.number,
    binHeight: PropType.number.isRequired,
    binWidth: PropType.number.isRequired,
    verticalMargin: PropType.number,
    keyNames: PropType.arrayOf(PropType.string).isRequired,
    stroke: isPropHexColorString,
    containerRef: PropType.string
}

HeatmapGrouping.defaultProps = {
    startX: 0,
    startY: 0,
    binHeight: 15,
    binWidth: 15,
    verticalMargin: 5,
    stroke: "#000000"
}

/**
 * 
 * @param {Object} props 
 * @param {Object[]} props.data The data where there is a tag (sample tag), and the keys are the attribute tags, the values are a list of strings. (e.g. condition application tags)
 * @param {Number} props.startX The starting x position of the grouping rectangles
 * @param {Number} props.startY The starting y position of the grouping rectangles
 * @param {Number} props.binHeight The height of each rectangle in the grouping
 * @param {Number} props.binWidth The width of each rectangle in the grouping
 * @param {String[]} props.keyNames The names of the groupings, will be displayed to the right of the grouping rectangles 
 * @param {String[]} props.tooltipNames The names to show in the tooltip when hovering over a rectangle. Must be keys in the data objects.
 * @param {Object[]} props.data The data for the grouping. Each object must contain all keyNames.
 * @param {String} props.stroke The stroke color of the rectangles.
 * @param {Boolean[]} props.is_condition_application Whether this grouping is for condition application (used in tooltip display). Must be the same length as keyNames. If true
 * the tooltip will fetch data from the mitocube backend to get the required information.
 * @returns 
 */
export function HeatmapGrouping({data, startX, startY, binHeight, binWidth, verticalMargin, keyNames, stroke, tooltipNames, is_condition_application, caTagMap, attributeTagMap, darkmode = false }) {

    const N = keyNames.length // number of grouping rows 
    const heatmapSVGHeight = (N+1) * (binHeight + verticalMargin)
    const heatmapSVGWidth = data.length * binWidth + 200 // extra space for labels
    const { tooltipData, tooltipOpen, tooltipLeft, tooltipTop, hideTooltip, showTooltip } = useTooltip()
    const { containerRef, TooltipInPortal } = useTooltipInPortal({
        detectBounds: true,
        scroll: true,
    })

    /**
     * 
     * @param {MouseEvent} event 
     * @param {Object[]} tooltipData
     */
    const handleMouseOver = (event, tooltipData) => {

        const coords = localPoint(event.target.ownerSVGElement, event);
        showTooltip({
            tooltipLeft: coords.x,
            tooltipTop: coords.y,
            tooltipData: tooltipData
        });
    };

    if (!_.every(keyNames.map(keyName => _.has(data[0], keyName)))) {
        console.log("All keyNames must exist in the data objects provided to HeatmapGrouping.");
        return null 
    }

    if (!_.isArray(is_condition_application) || is_condition_application.length !== keyNames.length) {
        console.log("is_condition_application must be an array of booleans with the same length as keyNames.");
        return null
    }
    return (
        <div>
        <SVG {...{ width: heatmapSVGWidth, height: heatmapSVGHeight, svgRef: containerRef }}>
        <g>
            {keyNames.map((keyName, index) => (
                <GroupingRow 
                    data={data}
                    key={`${index}-${keyName}`}
                    x={startX}
                    y={startY + index * (binHeight + verticalMargin)}
                    width={binWidth}
                    height={binHeight}
                    keyName={keyName}
                    stroke={stroke}
                    handleMouseOver={handleMouseOver}
                    handleMouseLeave={hideTooltip}
                    attributeTagMap={attributeTagMap}
                    colorIndex={index} N={N} is_condition_application={is_condition_application[index]} darkmode={darkmode} />
            ))}
            </g>
            </SVG>
            {tooltipOpen ? <TooltipInPortal left={tooltipLeft} top={tooltipTop} key={Math.random()}>
                <div style={{maxWidth: "20rem", wordWrap: "break-word", overflowWrap: "break-word"}}>
                    <h3 style={{wordWrap: "break-word"}}>{tooltipData.is_condition_application ? <span>{attributeTagMap.get(tooltipData.keyName).text}</span> : tooltipData.keyName}</h3>
                    
                    <div style={{wordWrap: "break-word"}}>{tooltipData.is_condition_application ?
                        tooltipData[tooltipData.keyName].map(ca_tag =>
                            <span key={ca_tag}><strong>{caTagMap.get(ca_tag)}</strong></span>
                        ) : tooltipData[tooltipData.keyName]}</div>
                    {/* Check the number of samples with the string. */}
                    
                    <div style={{wordWrap: "break-word"}}>N: {data.map(d => _.join(d[tooltipData.keyName], ",")).filter(di => di === _.join(tooltipData[tooltipData.keyName], ",")).length}</div>
                    <div style={{wordWrap: "break-word"}}>Sample: {tooltipData.tag}</div>
                    {_.isArray(tooltipNames) && tooltipNames.length > 0 ? tooltipNames.map((tooltipName, idx) => (
                        <div key={`tooltip-${idx}`} style={{wordWrap: "break-word"}}>{`${tooltipName} : ${tooltipData[tooltipName]}`}</div>
                    )) : null}
                </div>
            </TooltipInPortal> : null}
        </div>
    )
}
