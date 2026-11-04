import PropType from 'prop-types'
import { memo } from 'react'
import { Text } from '@visx/text'
import { areAllValuesNumbers } from '../types/checks/numbers'
import { abbreviateNumber } from '../transforms/numbers'
import { isPropHexColorString } from '../types/checks/color'
import { getStrokeColor } from '../colors/stroke'
import { getFillColor } from '../colors/fill'

Box.propTypes = {
    x: PropType.number.isRequired,
    width: PropType.number.isRequired,
    median: PropType.number.isRequired,
    min: PropType.number.isRequired,
    max: PropType.number.isRequired,
    q25: PropType.number.isRequired,
    q75: PropType.number.isRequired,
    fill: isPropHexColorString,
    stroke: isPropHexColorString,
    strokeWidth: PropType.number,
    showWhiskers: PropType.bool,
    whiskerScale: PropType.number,
    opacity: PropType.number,
    N: PropType.number
}

/**
 * @description Plots a vertical box with whiskers as part of a boxplot. Uses memoization to avoid rerenderings. All coordinates must be
 * given in pixels and *not* real numbers. E.g. use the y-scale to convert real numbers to pixel coordinates before passing them to the box.
 * @param {Object} props
 * @param {Number} props.x The center x position of the box.
 * @param {Number} props.width The width of the box in pixel. Often from scale.bandwidth()
 * @param {Number} props.min The min y-coordinate
 * @param {Number} props.max The max y-coordinate
 * @param {Number} props.q25 The 25% quantile coordinate
 * @param {Number} props.q75 The 75% quantile coordinate
 * @param {String} props.fill The fill color of the box. Must be in hex format.
 * @param {String} props.stroke The stroke color in hex code.
 * @param {Number} props.strokeWidth The width of the stroke around the box and of the min/max whiskers.
 * @param {Number} props.opacity The opacity of the box, fill does not expect hex colors with alpha.
 * @param {Boolean} props.showWhiskers If whiskers should be shown.
 * @param {Number} props.whiskerScale The fraction of the box with that is used for the whiskers.
 * @param {Number} props.N Optional number of datapoints to be shown above the box.
 * @returns
 */
function Box({
    x,
    width,
    median,
    min,
    max,
    q25,
    q75,
    fill,
    stroke,
    strokeWidth = 0.5,
    darkmode = false,
    showWhiskers = true,
    opacity = 1,
    whiskerScale = 0.5,
    N
}) {
    if (!areAllValuesNumbers([x, width, median, min, max, q25, q75])) return null

    // provide box coordinates in pixel
    const whiskerWidth = width * whiskerScale
    const halfWidth = width / 2
    const medianStrokeWidth = strokeWidth * 1.2
    const strokeColor = stroke !== undefined ? stroke : getStrokeColor(darkmode)
    const fillColor = fill !== undefined ? fill : darkmode ? "#3a3a3a" : "#efefef"

    return (
        <g opacity={opacity}>
            <rect x={x - halfWidth} y={q75} height={q25 - q75} width={width} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />

            {/* Min-Max lines */}
            <line x1={x} x2={x} y1={min} y2={q25} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={x} x2={x} y1={max} y2={q75} stroke={strokeColor} strokeWidth={strokeWidth} />

            {/* Whiskers */}
            {showWhiskers && (
                <>
                    <line x1={x - whiskerWidth / 2} x2={x + whiskerWidth / 2} y1={min} y2={min} stroke={strokeColor} strokeWidth={strokeWidth} />
                    <line x1={x - whiskerWidth / 2} x2={x + whiskerWidth / 2} y1={max} y2={max} stroke={strokeColor} strokeWidth={strokeWidth} />
                </>
            )}

            {/* Median line gets a 1.2x strokeWidth by default */}
            <line x1={x - halfWidth} x2={x + halfWidth} y1={median} y2={median} stroke={strokeColor} strokeWidth={medianStrokeWidth} />

            {typeof N === 'number' && (
                <Text x={x} y={max - halfWidth / 2} verticalAnchor='center' textAnchor='middle' fontSize={9} fill={getFillColor(darkmode)}>
                    {abbreviateNumber(N)}
                </Text>
            )}
        </g>
    )
}

function areEqual(prevProps, nextProps) {
    const numericKeys = ['x', 'width', 'median', 'min', 'max', 'q25', 'q75', 'opacity', 'strokeWidth', 'whiskerScale', 'N']
    for (const key of numericKeys) {
        if (prevProps[key] !== nextProps[key]) return false
    }
    if (prevProps.fill !== nextProps.fill) return false
    if (prevProps.stroke !== nextProps.stroke) return false
    if (prevProps.darkmode !== nextProps.darkmode) return false
    if (prevProps.showWhiskers !== nextProps.showWhiskers) return false
    return true
}

export default memo(Box, areEqual)