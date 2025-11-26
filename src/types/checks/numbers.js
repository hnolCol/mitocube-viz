
import _ from "lodash"  
/**
 * @description Checks if all values in the array are a number *AND* not NaN
 * @param {Array} array The array to check 
 * @returns {Boolean} Returns true if all values in an array are not nan and a number.
 */
export function areAllValuesNumbers(array) {
    return _.every(array,x=>_.isNumber(x) && !_.isNaN(x))
}
