import { Text } from "@visx/text"

import hooks from "@mitocube/api-hooks"
import PropTypes from "prop-types";



ConditionApplicationLabel.propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    tag: PropTypes.string,
    textProps: PropTypes.object,
};

export function ConditionApplicationLabel({ x, y, tag, textProps }) {

    const { data : condition_application_text } =  hooks.condition_applications.useGetConditionApplicationText({ tag }, { enabled: !!tag })
    // // Fetch all condition applications for all tags at once
    return (
        <Text
            dx={x}
            dy={y}
            aria-multiline={true}
            textAnchor="middle"
            verticalAnchor="middle"
            fontSize={12}
            fill="#333"
            {...textProps}
        >
            {condition_application_text}
        </Text>
    );
}
