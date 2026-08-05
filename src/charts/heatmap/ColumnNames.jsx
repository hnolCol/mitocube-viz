import { SVG } from "../base/SVG";
import _ from "lodash"
import PropType from "prop-types"
import { Text } from "@visx/text";
import { isPropHexColorString } from "../../types/checks/color";
import { getColorPalette } from "../../colors/palette";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";


HeatmapColumnNames.propTypes = {
    startX: PropType.number,
    startY: PropType.number,
    binHeight: PropType.number.isRequired,
    binWidth: PropType.number.isRequired,
    verticalMargin: PropType.number,
    stroke: isPropHexColorString,
    columnNames: PropType.arrayOf(PropType.string).isRequired,
    marginBetweenValues : PropType.number
}


/**
 * 
 * @param {Object} props 
 * @param {Object[]} props.columnNames The data where there is a tag (sample tag), and the keys are the attribute tags, the values are a list of strings. (e.g. condition application tags)
 * @param {Number} props.startX The starting x position of the grouping rectangles
 * @param {Number} props.startY The starting y position of the grouping rectangles
 * @param {Number} props.binHeight The height of each rectangle in the grouping
 * @param {Number} props.binWidth The width of each rectangle in the grouping

 * @returns 
 */
export function HeatmapColumnNames({columnNames, startX = 0, startY = 0, binHeight = 15, binWidth = 15, verticalMargin = 5, keyNames, stroke = "#000000", tooltipNames, darkmode = false, marginBetweenValues = 8, svgID, svgHeight = 200, containerRef }) {

    const heatmapSVGHeight = svgHeight //binHeight + verticalMargin
    const heatmapSVGWidth = columnNames.length * binWidth + 200 // extra space for labels
    return (
        <div className="flex flex-column">
            <div>
                <SVG {...{ width: heatmapSVGWidth, height: heatmapSVGHeight, svgRef: containerRef, svgID : svgID}}>
                    <g>
                    {columnNames.map((columnName, index) => (
                        
                        <Text
                            key={`${columnName}-${index}`}
                            x={startX + index * binWidth + (marginBetweenValues * index) + binWidth/2}
                            y={200}
                            dy={-10}
                            width = {200}
                            verticalAnchor="start"
                            textAnchor="start"
                            angle = {-60}
                        >
                            {columnName}
                        </Text>

                    ))}
                    </g>
                    </SVG>
            </div>
        </div>
    )
}