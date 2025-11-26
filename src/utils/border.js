
/**
 * @description Calcultates the ```chartWidth```and ```chartHeight``` based on the defined margins.
 * @param {Object} props 
 * @param {Number} props.width 
 * @param {Number} props.height 
 * @param {import("../../types/charts").ChartMargins} props.margins 
 * @returns {Object}  The chartWidth and chartHeight in an object.
 */
export function getChartWidthAndHeightWithMargins({ width, height, margins }) {
    const chartWidth = width - margins.left - margins.right
    const chartHeight = height - margins.top - margins.bottom
    return { chartWidth, chartHeight }
}



/**
 * @description Calculates the boundaries from a data array using keyNames. In additional it adds 
 * a margin to the boundaries using 8% of the euclidean distance between min and max. 
 * @param {Object} props
 * @param {Object[]} props.data - The data array of objects of type [{x : 2},{x : 1}, ...]
 * @param {String | String[]} props.keyName - The keyNames to access the data in the data array. 
 * @returns {import("../../types/calculations").MinMaxResult} - The boundaries e.g. axis limits. 
 */
export function getDomainWithBoundaries({ data, keyName, frac = 0.08}) {
    const domain = getBoundariesFromArrayOfObjects({ data , keyName })
    const domainWithMargin = addMarginToBoundaries({ domain: domain, frac })
    return domainWithMargin    
}


/**
 * @description Calculated the min and maximum in an array of objects. 
 * Data are filtered using ``_.isNumber()`` on individual items in the data for each keyName. If multiple keyNames are provided, then 
 * a global min and max are calculated. If you you want to get them by keyName use the function ``getMinMaxForMultipleKeyNames({data, keyNames})``. 
 * @param {Object} props
 * @param {Object[]} props.data - The data array each item must contain the keyName for which the boundaries (e.g. most likely axis limits)
 * should be calculated.
 * @param {String} props.keyName - The keyName(s) to get the data to calculate boundaries /e.g min and max.
 * @returns {Object} The minimum and maximum of the data accessed by the keyName(s). If multiple keyNames
 * are provided, the minimum in flattened data are provided. 
 * @returns {import("../../types/calculations").MinMaxResult} - The min max in the data array. 
 */
export function getBoundariesFromArrayOfObjects({ data = [{ x: 1 }, { x: 2 }], keyName = "x"}) {
    
    if (_.isArray(keyName)) {     
        return (
            {
                min: _.min(data.map(d => _.min(_.filter(keyName, key => _.isNumber(d[key])).map(key => d[key])))),
                max: _.max(data.map(d => _.max(_.filter(keyName, key => _.isNumber(d[key])).map(key => d[key]))))
            } 
    )   
    }
    const filteredData = data.filter(d => _.isNumber(d[keyName]))
    return ({
            min: _.minBy(filteredData, keyName)[keyName],
            max: _.maxBy(filteredData, keyName)[keyName]
        }
    )
}


export function addMarginToBoundaries({ domain = { min: 1, max: 2 }, frac = 0.1 }) {
    //adds some margin to a domain which can be used for plotting.
    var m = Math.sqrt(Math.pow(domain.max-domain.min, 2)) * frac
    if (m === 0) m += 1 // add 1 if boundary is zero. 
    return (
        {
            min: domain.min - m,
            max : domain.max + m 
        }
    )
}
