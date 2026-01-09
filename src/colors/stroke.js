/**
 * @description Function to be used to get the axis color. Currently does not implement any checks when it should change, but it is intended to be used for example in darkmode conditions. 
 * @returns {String} The hex color code for the stroke color of an axis. 
 */
export function getAxisStrokeColor(darkmode = false) {
    return darkmode ? "#FFFFFF" : "#000000"
}

/**
 * @description Function to be used to get the stroke color of an element.
 * @returns {String} The stroke color.
 */
export function getStrokeColor(darkmode = false) {
    return darkmode ? "#FFFFFF" : "#000000"
}
