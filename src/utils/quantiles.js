import _ from "lodash"

/**
 * @description Normalizes a quantile summary object to the canonical key names
 * { min, q25, median, q75, max, N }. Accepts the legacy `q1`/`q3`/`m` key spellings
 * used by older data sources (e.g. pandas `describe` responses or older backend models).
 * @param {Object} q - The quantile summary object.
 * @returns {Object} The quantile object with canonical key names.
 */
export function normalizeQuantiles(q) {
    if (!_.isObject(q)) return q
    return {
        min: q.min,
        q25: q.q25 ?? q.q1,
        median: q.median ?? q.m,
        q75: q.q75 ?? q.q3,
        max: q.max,
        N: q.N ?? q.count
    }
}
