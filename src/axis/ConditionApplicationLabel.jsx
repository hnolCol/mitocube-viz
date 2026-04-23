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
//    console.log(tag)
//     const condition_application_text = getConditionApplicationText(tag)
//     console.log(condition_application_text,"ConditionApplicationLabel -__LABEL")
    // const { data: isGenotype } = hooks.genotypes.useGetGenotypeExists({ tag }, { enabled: _.isString(tag) })
    // const { data : condition_application_text } =  hooks.condition_applications.useGetConditionApplicationText({ tag }, { enabled: _.isString(tag) && !isGenotype })
    // const { data: genotype_text } = hooks.genotypes.useGetGenotypeText({genotype_tag : tag}, { enabled: _.isString(tag) && isGenotype })
    // // Fetch all condition applications for all tags at once

export function ConditionApplicationLabel({ x, y, tag, textProps, caTagToText }) {
    return <Text x={x} y={y}  {...{ fill: "#333", fontSize: 12, textAnchor: "middle", verticalAnchor: "middle", fontSize: 12, ...textProps }}>{caTagToText.get(tag)}</Text>
}
