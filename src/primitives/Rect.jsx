/**
 * Render a simple SVG rectangle (<rect />) with common layout and styling props.
 *
 * The component forwards the provided props to an SVG <rect> element and maps
 * `opacity` to both `fillOpacity` and `strokeOpacity`.
 *
 * @param {Object} props - Props object.
 * @param {number|string} props.x - The x coordinate of the rectangle's origin. May be a number (user units) or a CSS-like string (e.g. "10%").
 * @param {number|string} props.y - The y coordinate of the rectangle's origin. May be a number or string.
 * @param {number|string} props.width - Width of the rectangle. May be a number or string.
 * @param {number|string} props.height - Height of the rectangle. May be a number or string.
 * @param {string} props.fill - Fill color for the rectangle (any valid CSS color string).
 * @param {string} [props.stroke="#000000"] - Stroke (border) color. Defaults to "#000000".
 * @param {number} [props.strokeWidth=0.5] - Stroke width in user units. Defaults to 0.5.
 * @param {number} [props.opacity=1] - Opacity applied to both fill and stroke (range 0 to 1). Defaults to 1.
 * @returns {import('react').ReactElement} An SVG <rect> element configured with the provided attributes.
 *
 * @example
 * // Basic usage
 * <Rect x={10} y={20} width={100} height={50} fill="#e74c3c" />
 *
 * @example
 * // Using strings and custom stroke
 * <Rect x="5%" y="10%" width="90%" height="80%" fill="navy" stroke="white" strokeWidth={2} opacity={0.8} />
 */
export function Rect({x,y,width,height,fill,stroke = "#000000", strokeWidth = 0.5, opacity = 1}) {
    return (
        <rect 
            {...{
                x,
                y,
                width,
                height,
                stroke,
                fill,
                strokeWidth,
                fillOpacity: opacity,
                strokeOpacity: opacity
            }} />
    )
}