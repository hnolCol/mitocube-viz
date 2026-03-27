import { Text } from "@visx/text"
import hooks from "@mitocube/api-hooks"
/**
 * RowLabel - Text for Heatmap rows.
 *
 * Renders a positioned text label intended for use as a row label in a heatmap.
 * The component accepts positioning and alignment props and forwards them to the
 * underlying Text element so labels can be precisely placed and aligned relative
 * to heatmap cells.
 *
 * @param {Object} props - Component props.
 * @param {number} props.x - The x-coordinate for the label's position.
 * @param {number} props.y - The y-coordinate for the label's position.
 * @param {string|number} props.text - The label content to display.
 * @param {number} [props.dx=5] - Horizontal offset (in pixels) applied to the text position.
 *                                Useful for spacing the label away from the heatmap cells.
 * @param {number} [props.dy=0] - Vertical offset (in pixels) applied to the text position.
 *                                Useful for spacing the label away from the heatmap cells.
 * @param {number} [props.fontSize=14] - Font size for the label text (in pixels).
 * @param {string} [props.verticalAnchor="middle"] - Vertical alignment of the text. Common values:
 *                                                   "start", "middle", "end".
 * @param {string} [props.textAnchor="start"] - Horizontal alignment of the text. Common values:
 *                                              "start", "middle", "end".
 * @param {boolean} [props.isLabelProteinTag=false] - If true, treat the text as a protein tag and fetch the corresponding gene name to display.
 * @param {boolean} [props.isLabelFeatureTag=false] - If true, treat the text as a feature tag and fetch the corresponding gene name to display.
 * @param {string} [props.fill="#000000"] - Text color for the label.   
 * @returns {JSX.Element} A Text element positioned and aligned for a heatmap row label.
 *
 * @example
 * // Render a row label slightly to the right of the heatmap row
 * <RowLabel x={0} y={20} text="Row A" dx={8} fontSize={12} />
 *
 * Notes:
 * - Ensure provided x/y coordinates correspond to the same coordinate system as the heatmap.
 * - Adjust dx and fontSize to avoid overlap with heatmap cells.
 */
export function RowLabel({ x, y, text, dx = 5, dy = 0, fontSize = 14, verticalAnchor = "middle", textAnchor = "start", isLabelFeatureTag, isLabelProteinTag = false, fill = "#000000" }) {

    const { data: protein, isSuccess } = hooks.features.proteins.useGetProteinByTag({ tag: text }, { enabled: isLabelProteinTag && typeof text === "string", staleTime : Infinity })
    const { data: feature } = hooks.features.useGetFeatureByTag({ tag: text }, { enabled: isLabelFeatureTag && typeof text === "string", staleTime : Infinity })
    
    return (
        <Text {...{
            x,
            y,
            dx,
            dy,
            textAnchor,
            verticalAnchor,
            fontSize,
            fill
        }}>
            {isLabelProteinTag && isSuccess ? protein.gene_name : isLabelFeatureTag && feature ? feature.gene_name : text}
        </Text>
    )
}