import { Text } from "@visx/text"

import PropTypes from "prop-types";
import _ from "lodash"


ConditionApplicationLabel.propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    tag: PropTypes.string,
    textProps: PropTypes.object,
    caTagToText: PropTypes.objectOf(PropTypes.string)
    
};


export function ConditionApplicationLabel({ x, y, tag, textProps, caTagToText }) {
    if (tag.includes(";")) {
        const tags = tag.split(";")
        return (
            <g>
                {tags.map((t, idx) => (
                    <Text key={idx} x={x} y={y + idx * 14} {...{ fill: "#333",  textAnchor: "middle", verticalAnchor: "middle", fontSize: 12, ...textProps }}>{caTagToText.get(t)}</Text>
                ))}
            </g>
        )
    }
    return <Text x={x} y={y}  {...{ fill: "#333",  textAnchor: "middle", verticalAnchor: "middle", fontSize: 12, ...textProps }}>{caTagToText.get(tag)}</Text>
}
