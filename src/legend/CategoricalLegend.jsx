import React from "react";
import { LegendItem, LegendLabel, LegendOrdinal } from "@visx/legend";
import { Tooltip, useTooltip } from "@visx/tooltip";
import _ from "lodash"



export function ConditionApplicationLegendLabel({ tag, props, caTagToText }) {
    const condition_application_text = tag.includes(";") ? tag.split(";").map(t => caTagToText.get(t)).join(", ") : caTagToText.get(tag)
    return <LegendLabel {...props}>
        {_.isString(condition_application_text) ? condition_application_text : "" }
    </LegendLabel>
}




/**
 * @description Checks if the legend should rerender. basically only a change in colorName or sizeName causes a rerender. 
 * This might be important if the list of items is long.
 * @param {Object} prevProps 
 * @param {*} nextProps 
 * @returns 
 */
function areEqual(prevProps, nextProps) {
    if (prevProps.colorName !== nextProps.colorName) return false 
    if (prevProps.sizeName !== nextProps.sizeName) return false 
    return true
  }


const CategoricalLegend = React.memo(
    /**
     * 
     * @param {Object} props 
     * @param {Object[]} props.data 
     * @param {Function} props.colorScale 
     * @param {String} props.colorName 
     * @returns 
     */
    function CategoricalLegend({
        chartIdx,
        data,
        maxWidth,
        colorScale,
        colorName,
        filterDataInKeyByValue,
        resetSearchIdcs,
        size = 20,
        caTagToText,
        attributeTagToText

    }) {


        const {
            tooltipData,
            tooltipLeft,
            tooltipTop,
            tooltipOpen,
            showTooltip,
            hideTooltip,
        
        } = useTooltip();

        
    /**
     * 
     * @param {MouseEvent} e 
     * @param {import("../../../../types/attributes").AttributeValue[]} props.attributeValues
     */
    const handleTooltip = (e,attributeValues,attribute) => {

        showTooltip({
            tooltipTop : e.clientY,
            tooltipLeft: e.clientX,
            tooltipData: { attributeValues, attribute, has_features_value : attribute.has_features_value }
        })
    }
    /**
     * 
     * @param {Number} size - The size of the SVG 
     * @param {String} fill - The hex color fill of the circle.
     * @param {Number} r - The radius of the circle.
     * @returns 
     */
    const renderLegendRectangle = (size, fill, r) => {
        return <svg width={size} height={size} ><circle cx={size / 2} cy={size / 2}
                fill={fill}
                r={r}
                stroke="#000"
                strokeWidth={0.5} />
            </svg>
        } 

    
        

    return (
        <div>
            <div className="flex" style={{maxWidth : "150px", maxHeight : "400px", overflowY:"scroll"}}>
                {_.has(colorScale, "domain") ? attributeTagToText.get(colorName) ?
                    <div className="margin-left--little">
                    {/* //onMouseLeave={() => resetSearchIdcs(chartIdx)} */}
                        <div style={{maxWidth : "12rem"}}><h5>{attributeTagToText.get(colorName)}</h5></div>
                        <LegendOrdinal scale={colorScale}>
                            {(labels) => labels.map((label, idx) => {
                                if (idx > 25) return null
                                return (
                                    <LegendItem key={`${idx}-${label}`} >
                                        {renderLegendRectangle(size, label.value, size / 3.5)}
                                        <ConditionApplicationLegendLabel caTagToText={caTagToText}  tag={label.text} props={{margin: "0 12px", onMouseEnter: (e) => handleTooltip(e, [label.text], attributeTagToText.get(colorName)), onMouseLeave: hideTooltip, style : {fontSize : "0.75rem"} }} />
                                    </LegendItem>
                                )
                            })}
                        </LegendOrdinal></div> : null  : null }

            </div>
            {tooltipOpen && _.isObject(tooltipData) ?
                <Tooltip top={tooltipTop} left={tooltipLeft} key={Math.random()}>
                    <div style={{ maxWidth: "300px", maxHeight: "400px", overflowY: "scroll" }}>
                        <span> this is a nice tool tip</span>
                    </div>
            </Tooltip> : null}

        </div>
    )
    }, areEqual )

export { CategoricalLegend }






