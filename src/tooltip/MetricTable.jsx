import PropTypes from "prop-types"
import "./table.css"
import _ from "lodash"
import { copyTextToClipboardFromArrayOfObjects } from "../utils/copy"


import hooks from "@mitocube/api-hooks" 


function AttributeConditionApplication({ idx, attribute_tag, condition_application_tag }) {
    
    return <tr></tr>
    const { data : attribute, isSuccess : isSuccessAttribute } =  hooks.attributes.useGetAttribute({ tag : attribute_tag }, { enabled: _.isString(attribute_tag) })
    const { data: condition_application_text, isSuccess: isSuccessConditionApplication } = hooks.condition_applications.useGetConditionApplicationText({ tag: condition_application_tag }, { enabled: !!condition_application_tag })
    console.log(attribute_tag, "???", condition_application_text, condition_application_tag)
    return (
        <tr key={`${idx}-metric-table-row`}>
            <td
                className="table__item table__item--align-right table__item--wrap"
            >
                {isSuccessAttribute ? attribute.text : "..."}
            </td>
            <td
                className="table__item table__item--align-left bg--lightgrey table__item--wrap"
            >
                {isSuccessConditionApplication ? condition_application_text : "..."}
            </td>
        </tr>
    )
}   



MetricTable.propTypes = {
    data: PropTypes.array,
    showClipboard: PropTypes.bool,
    round: PropTypes.bool,
    roundPrecision: PropTypes.number
}

/**
 * @description JSX Element to display multiple metrices
 * @param {Object} props
 * @param {Object[]} props.data - The data metrices to display. Object are expected to have a ```text``` and ```value``` property. 
 * @param {Boolean} props.showClipboard - If true, a clipboard icon will be shown, a click on the icon copies the table. 
 * @param {Boolean} props.round - If true the value (if number) will be rounded using ```_.round(value, roundPrecision)```. 
 * @param {Number} props.roundPrecision - If rounding is enabled, the precision to be used. Defaults to 2. 
 * @returns {Element} JSX Element.
 */
function MetricTable({
    data = [
        { text: "Proteins", value: 8230, type : "default" },
        { text: "Peptides", value: 28230, type : "default" },
        { text: "Material", value: "HeLa", type : "default" }],
    showClipboard = false,
    round = true,
    roundPrecision = 2,
    isAttribute = false,
    isConditionApplication = false,
    isGenotype = false 
}) {
    console.log(data)
    // Small default renderers for different contexts. You can replace these
    // with imports of real components if you have them elsewhere.
    const DefaultValue = ({ value }) => (
        <span>
            {_.isNumber(value) && round ? _.round(value, roundPrecision) : _.isBoolean(value) ? _.toString(value) : value}
        </span>
    )

    const AttributeValue = ({ value }) => (
        // attributes often are simple labels; keep original formatting
        <span className="attr-value">{_.toString(value)}</span>
    )

    const ConditionApplicationValue = ({ value }) => (
        // emphasize condition-related values
        <em className="condition-value">{_.toString(value)}</em>
    )

    const GenotypeValue = ({ value }) => (
        // genotype often benefits from monospace / uppercase
        <code className="genotype-value" style={{ fontFamily: "monospace" }}>{_.toString(value).toUpperCase()}</code>
    )

    // componentMap maps a lightweight "type" key on each data row to a renderer.
    // This gives per-row control if desired. Otherwise, global flags (isAttribute, ...)
    // determine the renderer.
    const componentMap = {
        attribute: AttributeValue,
        condition: ConditionApplicationValue,
        genotype: GenotypeValue,
        default: DefaultValue
    }

    const getRendererForRow = (row) => {
        // 1) Per-row explicit renderer function (highest priority)
        if (typeof row.renderer === "function") return row.renderer

        // 2) Per-row "type" string mapping
        if (row.type && componentMap[row.type]) return componentMap[row.type]

        // 3) Global flags (fallback to the first matching flag)
        if (isAttribute) return AttributeValue
        if (isConditionApplication) return ConditionApplicationValue
        if (isGenotype) return GenotypeValue

        // 4) Default
        return DefaultValue
    }

    return (
        <div className="table__container" style={{ maxWidth: "15rem", fontSize: "0.75rem" }}>
            {showClipboard ? <button onClick={() => copyTextToClipboardFromArrayOfObjects({ data })}> Copy to Clipboard </button> : null}
            <table>
                <tbody>
                    {data
                        .filter(d => _.has(d, "text") && _.has(d, "type"))
                        .map((d, idx) => {
                            if (d.type === "attribute") return <AttributeConditionApplication
                                    key={`${idx}-metric-table-row`}
                                    idx={idx} attribute_tag={d.text}
                                    condition_application_tag={d.value} />
                            return (
                                <tr key={`${idx}-metric-table-row`}>
                                    <td className="table__item table__item--align-right">
                                        {d.text}:
                                    </td>
                                    <td className="table__item table__item--align-left bg--lightgrey">
                                        {/* pass rounding options so default renderer can use them */}
                                        <span>
                                            {_.isNumber(d.value) && round ?
                                                _.round(d.value, roundPrecision) :
                                                _.isBoolean(d.value) ?
                                                    _.toString(d.value) : d.value}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                </tbody>
            </table>
        </div>
    )
}


export default MetricTable