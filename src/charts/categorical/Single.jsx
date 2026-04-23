import { useMemo } from "react"
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale"
import _ from "lodash"
import PropTypes from "prop-types"
import { addMarginToBoundaries, getBoundariesFromArrayOfObjects, getChartWidthAndHeightWithMargins } from "../../utils/border"
import { getColorPalette } from "../../colors/palette"
import { SVG } from "../base/SVG"


SingleCategoricalChart.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    data: PropTypes.arrayOf(PropTypes.object),
    margins: PropTypes.object,
    yaxisName: PropTypes.string,
    colorName: PropTypes.string,
    innerColorPadding: PropTypes.number,
    outerColorPadding: PropTypes.number,
    svgID: PropTypes.string,
    svgRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    colorPalette: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    minMaxYDomain: PropTypes.shape({
        min: PropTypes.number,
        max: PropTypes.number
    }),
    yScaleStartsAtZero: PropTypes.bool,
    darkmode: PropTypes.bool,
    children: PropTypes.func,
    chartType: PropTypes.oneOf(["boxplot", "barplot", "lineplot"]),
    caTagToText : PropTypes.object
}

SingleCategoricalChart.defaultProps = {
    width: 600,
    height: 300,
    data: [
        { y: 5, T: "A", G: "WT", O: "0.5h" },
        { y: 4, T: "B", G: "WT", O: "0.5h" },
        { y: 10, T: "C", G: "WT", O: "0.5h" }
    ],
    margins: {
        left: 15,
        right: 5,
        bottom: 30,
        top: 5
    },
    yaxisName: "y",
    colorName: "Treatment",
    innerColorPadding: 0.1,
    outerColorPadding: 0.2,
    svgID: undefined,
    svgRef: undefined,
    colorPalette: [],
    minMaxYDomain: undefined,
    yScaleStartsAtZero: true,
    darkmode: false,
    children: () => null,
    chartType: "boxplot"
}

/**
 * SingleCategoricalChart
 *
 * Renders a single categorical chart as an SVG and invokes a render-prop (children)
 * with a computed categoricalSplit array (keeps API consistent with multi-category charts).
 *
 * @typedef {Object} CategoricalSplitItem
 * @property {number} idx
 * @property {string[]} colorCategories
 * @property {Array<Object>} data
 * @property {string} yaxisName
 * @property {string|undefined} colorName
 * @property {Margins} margins
 * @property {import("d3-scale").ScaleBand<string>} splitColorScale
 * @property {import("d3-scale").ScaleOrdinal<string,string>} colorScale
 * @property {import("d3-scale").ScaleLinear<number,number>} yScale
 * @property {number} chartHeight
 * @property {number} chartWidth
 * @property {boolean} darkmode
 * @property {number} colorBandwidth
 * @property {number} xcenter
 *
 * Parameters:
 *
 * @param {Object} props - Component props.
 * @param {number} props.width - Total SVG width.
 * @param {number} props.height - Total SVG height.
 * @param {Array<Object>} props.data - Input data array.
 * @param {Margins} props.margins - Chart margins (top, right, bottom, left).
 * @param {string} props.yaxisName - Key in data objects for y values.
 * @param {string|undefined} [props.colorName] - Key in data objects for color grouping.
 * @param {number} props.innerColorPadding - Inner padding for the split (band) color scale.
 * @param {number} props.outerColorPadding - Outer padding for the split (band) color scale.
 * @param {string|undefined} [props.svgID] - Optional id for the SVG element.
 * @param {import('react').RefObject<SVGSVGElement>|undefined} [props.svgRef] - Optional ref forwarded to the SVG element.
 * @param {Array<string>|Object.<string,string>|undefined} [props.colorPalette] - Optional color palette override (array or map).
 * @param {MinMaxDomain|undefined} [props.minMaxYDomain] - Optional explicit min/max for the Y domain.
 * @param {boolean|undefined} [props.yScaleStartsAtZero=false] - Force Y scale to start at zero when appropriate.
 * @param {boolean|undefined} [props.darkmode=false] - Dark mode flag used when generating fallback palettes.
 * @param {(split: CategoricalSplitItem[]) => import('react').ReactNode} props.children - Render-prop called with the computed categoricalSplit array.
 * @param {string|undefined} [props.chartType] - Optional chart type that may affect memoization.
 *
 * @returns {import('react').ReactElement} The component returns a JSX SVG element containing the chart. The children render-prop receives an array of CategoricalSplitItem objects to render marks.
 *
 * Notes on typing the return:
 * - In JSDoc/TypeScript contexts you can annotate the component's return type as React.ReactElement or JSX.Element:
 *     @returns {React.ReactElement}
 *   or
 *     function SingleCategoricalChart(...): JSX.Element { ... }
 * - If the component may return null conditionally, use React.ReactElement|null or JSX.Element|null.
 */
function SingleCategoricalChart({
    width,
    height,
    data,
    margins,
    yaxisName,
    colorName,
    innerColorPadding,
    outerColorPadding,
    svgID,
    svgRef,
    colorPalette,
    minMaxYDomain,
    yScaleStartsAtZero,
    darkmode,
    children,
    chartType,
    caTagToText,
    attributeTagToText
}) {

    const { chartHeight, chartWidth } = getChartWidthAndHeightWithMargins({ width, height, margins })
    const uniqueColorValues = _.uniqBy(data, colorName).map(d => d[colorName])
    
    const splitColorScale = useMemo(() => {
        // color scale taking care of the position of the color (e.g horizontal)
        return (
            scaleBand({
                range: [0, chartWidth],
                domain: uniqueColorValues,
                paddingOuter: outerColorPadding,
                paddingInner: innerColorPadding,
                round: true,
            })
        )
    }, [chartWidth, colorName, chartType])

    const colorScale = useMemo(() => {
        // scale taking care of the fill color.
        if (colorName === undefined) return () => undefined //return a function that color the by in the default color if no colorName given
        
        var colorRange = []
        if (colorPalette.length === 0){
            colorRange = getColorPalette(uniqueColorValues.length, darkmode)
        }
        else if (_.isArray(colorPalette)) {
            //check if colorPalette is same length? 
            colorRange = colorPalette.slice()
        }
        else if (_.isObject(colorPalette)) {
            // if an object is provided each colorValue must be in the color Palette
            if (uniqueColorValues.filter(uniqueColorValue => !_.has(colorPalette, uniqueColorValue)).length !== 0) {
                colorRange  = getColorPalette(uniqueColorValues.length, darkmode)
            }
            else {
                colorRange = uniqueColorValues.map(uniqueColorValue => colorPalette[uniqueColorValue])
            }
        }
        else {
            colorRange = getColorPalette(uniqueColorValues.length, darkmode)
        }

        return (
            scaleOrdinal({
                domain: uniqueColorValues, 
                range : colorRange
            })
        )
    }, [colorName, _.join(uniqueColorValues), chartType])

    const yScale = useMemo(() => {
        // y scale
        const preDefinedYDomain = minMaxYDomain !== undefined && _.isObject(minMaxYDomain) && _.has(minMaxYDomain, "min") && _.has(minMaxYDomain, "max")
        const yDomain = preDefinedYDomain ? {} : getBoundariesFromArrayOfObjects({ data, keyName: yaxisName })
        const yDomainWithMargin = preDefinedYDomain ? minMaxYDomain : addMarginToBoundaries({ domain: yDomain })
        
        return scaleLinear(
            {
                domain: [yDomainWithMargin.max, yDomainWithMargin.min < 0 ? yDomainWithMargin.min : yScaleStartsAtZero  ? 0 : yDomainWithMargin.min],
                range: [margins.top, margins.top + chartHeight],
                nice: true
            }
        )
    }, [yaxisName, chartHeight, minMaxYDomain,yScaleStartsAtZero, chartType])
    
    //_.range(1) since we should return an array (e.g. subplots) to be consistent with the MultipleCategory chart, 
    //for a single category only a single subplot is required
    const categoricalSplit = _.range(1).map(subplotIdx => {
        return {
            idx: subplotIdx,
            colorCategories : uniqueColorValues,
            data,
            yaxisName,
            colorName,
            margins,
            splitColorScale,
            colorScale,
            yScale,
            chartHeight,
            chartWidth,
            chartType,
            darkmode,
            colorBandwidth : splitColorScale.bandwidth(),
            xcenter: margins.left + chartWidth / 2,
            caTagToText,
            attributeTagToText
        }
    })
    return (
        
        <SVG {...{width,height,svgID,svgRef}}>
            <>{children(categoricalSplit)}</>
            
        </SVG>

    )   
}
    

export default SingleCategoricalChart