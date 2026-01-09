/**
 * @description Function to be used to get the fill color of a text element.
 * @returns {String} The hex color code for the fill color of a text element. 
 */
export function getFillColor(darkmode = false) {
    return darkmode ? "#FFFFFF" : "#000000"
}
