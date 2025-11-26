import _ from "lodash"

/**
 * @description Checks if a given string is a hex color.
 * @param {Object} props 
 * @param {String} propName 
 * @param {String} componentName 
 * @returns 
 */
export function isPropHexColorString(props, propName, componentName) {
    const colorProp = props[propName]
    if (!_.isString(colorProp)) {
        return new Error(
            'Invalid prop `' + propName + '` supplied to' +
            ' `' + componentName + '`. Must be a string value and match the hex code.'
          );
    }
    if (!isHex(props[propName])) {
        return new Error(
            'Invalid prop `' + propName + '` supplied to' +
            ' `' + componentName + '`. Must be a valid hex color code.'
          );
    }
}

/**
 * @description Checks if a string  matches the hex color string style. Does *not* support
 * the transparent format. 
 * @param {string} colorString The color string to be checked.
 * @returns 
 */
export function isHex(colorString) {
    return /^#[0-9A-F]{6}$/i.test(colorString)
}
