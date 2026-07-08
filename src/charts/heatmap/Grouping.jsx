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


function getGroupKey(d, keyName) {
    return _.isArray(d[keyName]) ? _.join(d[keyName], ",") : d[keyName]
}

function getGroupLabel(value, is_condition_application, caTagMap) {
    if (!is_condition_application) return value
    if (!_.isString(value)) return value
    return value.split(",").map(tag => (caTagMap && caTagMap.get(tag)) ? caTagMap.get(tag) : tag).join(", ")
}

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
function GroupingRow({ data, x, y, width, height, keyName, stroke, handleMouseOver, handleMouseLeave, is_condition_application, attributeTagMap, colorScale }) {
    const isSuccess = true

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
                        fill={colorScale(getGroupKey(d, keyName))}
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


function GroupingLegend({ keyNames, colorScales, is_condition_application, caTagMap, attributeTagMap, legendElementSize = 12 }) {
    return (
        <div className="flex flex-column" style={{ gap: "0.35rem" }}>
            {keyNames.map((keyName, idx) => {
                const scale = colorScales[idx]
                const domain = scale.domain()
                const title = is_condition_application[idx] && attributeTagMap && attributeTagMap.get(keyName)
                    ? attributeTagMap.get(keyName).text
                    : keyName

                return (
                    <div key={keyName} className="flex center-items flex-wrap" style={{ gap: "0.6rem" }}>
                        <div style={{ fontWeight: 600, fontSize: "0.8rem", minWidth: "10rem" }}>{title}</div>
                        <div className="flex center-items flex-wrap" style={{ gap: "0.75rem" }}>
                            {domain.map(value => (
                                <div key={value} className="flex center-items" style={{ gap: "0.3rem" }}>
                                    <svg width={legendElementSize} height={legendElementSize}>
                                        <rect width={legendElementSize} height={legendElementSize} fill={scale(value)} stroke="#000000" />
                                    </svg>
                                    <span style={{ fontSize: "0.75rem" }}>{getGroupLabel(value, is_condition_application[idx], caTagMap)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
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

    
    const colorScales = useMemo(() => {
        return keyNames.map((keyName, index) => {
            const uniqueValues = _.uniq(data.map(d => getGroupKey(d, keyName)))
            if (uniqueValues.length === 0) return scaleOrdinal({ domain: [], range: [] })
            var colorPalette = getColorPalette(uniqueValues.length, darkmode, index)
            const dashIdx = uniqueValues.indexOf("-")
            if (dashIdx !== -1) colorPalette[dashIdx] = "#fafafa"
            return scaleOrdinal({
                domain: uniqueValues,
                range: colorPalette
            })
        })
    }, [_.join(keyNames, "-"), data.length, darkmode])

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
        <div className="flex flex-column">
            <div className="margin--medium">
                <GroupingLegend keyNames={keyNames} colorScales={colorScales} is_condition_application={is_condition_application} caTagMap={caTagMap} attributeTagMap={attributeTagMap} />
            </div>
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
                            colorScale={colorScales[index]}
                            is_condition_application={is_condition_application[index]} />
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
                        
                        <div style={{wordWrap: "break-word"}}>N: {data.map(d => _.join(d[tooltipData.keyName], ",")).filter(di => di === _.join(tooltipData[tooltipData.keyName], ",")).length}</div>
                        <div style={{wordWrap: "break-word"}}>Sample: {tooltipData.tag}</div>
                        {_.isArray(tooltipNames) && tooltipNames.length > 0 ? tooltipNames.map((tooltipName, idx) => (
                            <div key={`tooltip-${idx}`} style={{wordWrap: "break-word"}}>{`${tooltipName} : ${tooltipData[tooltipName]}`}</div>
                        )) : null}
                    </div>
                </TooltipInPortal> : null}
            </div>
        </div>
    )
}