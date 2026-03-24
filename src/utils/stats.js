
import _ from "lodash"


export function getQuantiles(
    array,
    qs = [0, 0.25, 0.5, 0.75, 1.0],
    NIQR = 1.5,
    removeOutlier = true,
    valueName = "values",
    labels = ["min", "q25", "median", "q75", "max"]) {
    
    // remove falsly numbers (includes 0!)
    let sortedFilteredArray = _.sortBy(_.filter(array.filter(x => _.isNumber(x)),Boolean))
    let N = sortedFilteredArray.length
    if (removeOutlier){
            //remove outlier before calculating quantiles
            let idxsForIQR = [0.25,0.5,0.75].map(q => (N-1) * q)
            const generousIQR = idxsForIQR.map(idx => {
                let b = Math.floor(idx)
                let r = idx - b 
                if (sortedFilteredArray[b+1]!==undefined) {
                    return sortedFilteredArray[b] + r * (sortedFilteredArray[b + 1] - sortedFilteredArray[b]);
                }
                else {
                    return sortedFilteredArray[b]
                }
            })
            // get min and max values
            const IQR = generousIQR[2] - generousIQR[0]
            const maxValue = generousIQR[1] + NIQR * IQR
            const minValue = generousIQR[1] - NIQR * IQR
            
            //overwrite array and calculate distribution again
            sortedFilteredArray = sortedFilteredArray.filter(x => x <= maxValue && x >= minValue)
        }
    let filteredN = sortedFilteredArray.length
    let idxs = qs.map(q => (filteredN-1) * q)
    const numberOutliers = N - filteredN 
    // return filtered quantiles 
    var caluclatedQuantiles =  idxs.map(idx => {
        let b = Math.floor(idx)
        let r = idx - b 
        if (sortedFilteredArray[b+1]!==undefined) {
            return sortedFilteredArray[b] + r * (sortedFilteredArray[b + 1] - sortedFilteredArray[b]);
        }
        else {
            return sortedFilteredArray[b]
        }
    })    
    if (qs.length === 1) {
        caluclatedQuantiles = caluclatedQuantiles[0]
    }
    return {[valueName]:caluclatedQuantiles, n_removed:numberOutliers, N: sortedFilteredArray.length, quantiles : qs, labels}
}   

/**
 * 
 * @param {Object} props 
 * @param {Object[]} props.data - Array of objects 
 * @param {String[]} props.keyNames - Array of keyNames to calculate the quantiles for. 
 * @returns {Object.<string, import("../../types/calculations").QuantileResult>} 
 */
export function getQuantilesInArrayByKeyNames({ data, keyNames }) {
    const quantiles =  _.map(keyNames, keyName => {
        return ([keyName, getQuantiles(_.map(data, d=>d[keyName]),[0.25,0.5,0.75], 1.8, false)])
    })
    return _.fromPairs(quantiles)
}


export function linearRegression({x, y}) {
  if (x.length !== y.length) throw new Error("x and y must have same length");
  const n = x.length;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
  }

  // slope (m) and intercept (b)
  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const b = (sumY - m * sumX) / n;

  // R² calculation
  const meanY = sumY / n;
  let ssTot = 0; // total sum of squares
  let ssRes = 0; // residual sum of squares

  for (let i = 0; i < n; i++) {
    const yPred = m * x[i] + b;
    ssTot += Math.pow(y[i] - meanY, 2);
    ssRes += Math.pow(y[i] - yPred, 2);
  }

  const r2 = 1 - ssRes / ssTot;

  return { slope: m, intercept: b, r2: r2 };
}