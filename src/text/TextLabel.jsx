
import PropTypes from "prop-types"

import { Group } from "@visx/group"
import { Text } from "@visx/text"
import Margins from "../types/Margins"
import { isPropHexColorString } from "../types/checks/color"



TextLabel.propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    margins: Margins,
    labelTexts: PropTypes.arrayOf(PropTypes.string).isRequired,
    dx: PropTypes.number,
    dy: PropTypes.number,
    totalYOffset: PropTypes.number,
    fontSize: PropTypes.number,
    color: PropTypes.arrayOf(isPropHexColorString).isRequired
}
TextLabel.defaultProps = {
    x: 0,
    y: 0,
    margins: { left: 0, right: 0, top: 0, bottom: 0 },
    dx: 1,
    dy: 0,
    totalYOffset: 4,
    fontSize: 14,
    color: ["#00000"]
}

export function TextLabel({x, y, margins, labelTexts, dx, dy, totalYOffset, fontSize, color}) {

    return (
        <Group left={margins.left} top={margins.top + totalYOffset}>

            {labelTexts.map((text, textIdx) => {
                const fill = color.length < textIdx ? color[textIdx] : "#000000"
                return <Text
                    key={`${text}-${textIdx}`}
                    fill={fill}
                    x={x}
                    y={y + fontSize * textIdx}
                    dx={dx}
                    dy={dy}
                    fontSize={fontSize}
                    verticalAnchor="start"
                    textAnchor="start">
                    {text}
                </Text>
            })}
    </Group>) 
}