
import PropTypes from "prop-types"

import { Group } from "@visx/group"
import { Text } from "@visx/text"
import Margins from "../types/Margins"
import { isPropHexColorString } from "../types/checks/color"
import { ProteinLabel } from "./ProteinLabel"



TextLabel.propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    margins: Margins,
    labelTexts: PropTypes.arrayOf(PropTypes.string).isRequired,
    dx: PropTypes.number,
    dy: PropTypes.number,
    totalYOffset: PropTypes.number,
    fontSize: PropTypes.number,
    color: PropTypes.arrayOf(isPropHexColorString).isRequired,
    isProtein : PropTypes.arrayOf(PropTypes.bool)
}
TextLabel.defaultProps = {
    x: 0,
    y: 0,
    margins: { left: 0, right: 0, top: 0, bottom: 0 },
    dx: 1,
    dy: 0,
    totalYOffset: 4,
    fontSize: 14,
    color: ["#00000"],
    isProtein: [false],
    verticalAnchor: "start",
    textAnchor : "start"
}

export function TextLabel({x, y, margins, labelTexts, dx, dy, totalYOffset, fontSize, color, isProtein, verticalAnchor, textAnchor}) {

    return (
        <Group left={margins.left} top={margins.top + totalYOffset}>

            {labelTexts.map((text, textIdx) => {
                const textProps = {
                    key: `${text}-${textIdx}`,
                    fill : color ? color[textIdx] : "#000000",
                    x : x,
                    dx: dx,
                    dy : dy,
                    fontSize,
                    y : y + fontSize * textIdx,
                    verticalAnchor,
                    textAnchor
                }
                if (isProtein[textIdx]) return <ProteinLabel text={text} {...textProps} />
                return <Text
                    {...textProps}>
                    {text}
                </Text>
            })}
    </Group>) 
}



