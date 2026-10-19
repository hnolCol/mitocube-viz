import _ from "lodash"

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

/**
 * @description Mixes two hex colors linearly. Both colors must be in 6-digit hex
 * format (e.g. "#aabbcc"). The result is opaque, so it can be used to tint
 * colors toward a background instead of rendering with opacity, which lets
 * underlying elements shine through.
 * @param {String} colorA - First hex color, e.g. "#466688"
 * @param {String} colorB - Second hex color, e.g. "#fafafa"
 * @param {Number} weightB - Fraction in [0, 1] of colorB in the mix. 0 returns colorA, 1 returns colorB.
 * @returns {String} The mixed color as 6-digit hex.
 */
export function mixHexColors(colorA, colorB, weightB = 0.5) {
    const clamp01 = v => Math.min(1, Math.max(0, v))
    const w = clamp01(_.isNumber(weightB) ? weightB : 0.5)
    const parse = hex => {
        const m = /^#?([0-9a-f]{6})$/i.exec(_.toString(hex).trim())
        if (m === null) return { r: 0, g: 0, b: 0 }
        const n = parseInt(m[1], 16)
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
    }
    const a = parse(colorA)
    const b = parse(colorB)
    const to2 = v => _.padStart(Math.round(clamp01(v / 255) * 255).toString(16), 2, "0")
    return `#${to2(a.r + (b.r - a.r) * w)}${to2(a.g + (b.g - a.g) * w)}${to2(a.b + (b.b - a.b) * w)}`
}
