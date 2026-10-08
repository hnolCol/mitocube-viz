/**
 * @description Function to be used to get the fill color of a text element.
 * @returns {String} The hex color code for the fill color of a text element. 
 */
export function getFillColor(darkmode = false) {
    return darkmode ? "#FFFFFF" : "#000000"
}

/**
 * @description Returns the background fill color of a chart area depending on darkmode.
 * @returns {String} The hex color code of the chart background fill.
 */
export function getAxisBackgroundFill(darkmode = false) {
    return darkmode ? "#2b2b2b" : "#fafafa"
}
