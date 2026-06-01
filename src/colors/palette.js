
export const STD_CHART_COLOR_PALETTE_DARK = [
    "#61dafb", // light blue
    "#06d6a0", // teal
    "#ffd166", // warm yellow
    "#ef476f", // pink/red
    "#118ab2", // deep cyan
    "#8338ec", // purple
    "#ff7b00", // orange
    "#2dd4bf"  // mint
]
export const STD_CHART_COLOR_PALETTE = [
    "#466688",
    "#79c29e",
    "#e7ad00",
    "#b62444",
    "#c5959d",
    "#297d37",
    "#b2b2b2",
    "#d97a4b"
    ]


export const STD_CHART_COLOR_PALETTE_2 = [
        "#A6CEE3",
        "#1F78B4",
        "#B2DF8A",
        "#33A02C",
        "#FB9A99",
        "#E31A1C",
        "#FDBF6F",
        "#FF7F00",
        "#CAB2D6",
        "#6A3D9A",
        "#FFFF99",
        "#B15928"]

export const STD_CHART_COLOR_PALETTE_3 = [
    ["#BF616A", "#D08770", "#EBCB8B", "#A3BE8C", "#B48EAD"]
]

export const STD_CHART_COLOR_PALETTE_4 =  ["#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F", "#EDC948", "#B07AA1", "#FF9DA7", "#9C755F", "#BAB0AC"]


const colorPalettes = new Map([
  [0, STD_CHART_COLOR_PALETTE],
  [1, STD_CHART_COLOR_PALETTE_2],
  [2, STD_CHART_COLOR_PALETTE_3],
  [3, STD_CHART_COLOR_PALETTE_4]
]);

export function getColorPalette(n, darkmode = false, paletteIndex = 0) {
    const colorPalette = darkmode ? STD_CHART_COLOR_PALETTE_DARK : colorPalettes.get(paletteIndex) || STD_CHART_COLOR_PALETTE;
    return colorPalette.slice(0,n)
}

export function getRedBlueColorScale() {
    return ["#466688","#ffffff","#a82331"]
}

export const STROKE_COLOR = "#000000" 
export const HIGHLIGHT_COLOR = "#466688" // this is the color used for highlighting elements in the UI, like selected items or important notifications
/**
 * @description Function to be used to get the axis color. Currently does not implement any checks when it should change, but it is intended to be used for example in darkmode conditions. 
 * @returns {String} The hex color code for the stroke color of an axis. 
 */
export function getAxisStrokeColor(){
    return "#000000"
}




// /**
//  * Generates a color scale based on a palette name and number of colors needed
//  * @param {string} paletteName - The name of the color palette from visx
//  * @param {number} numColors - The number of colors needed
//  * @returns {function} A scale function that maps index to color
//  */
// export function createColorScale(paletteName = 'schemeCategory10', values = [], numColors = 10) {
//     const palette = allColors[paletteName] || allColors.schemeCategory10;
    
//     if (values.length > 0) {
//         return scaleOrdinal({
//             domain: values,
//             range: palette
//         });
//     }

//     return scaleOrdinal({
//         domain: Array.from({ length: numColors }, (_, i) => i),
//         range: palette
//     });
// }

// /**
//  * Get color by index from a specific palette
//  * @param {number} colorIndex - The index of the color
//  * @param {string} paletteName - The name of the palette
//  * @returns {string} The color value
//  */
// export function getColorByIndex(colorIndex, paletteName = 'schemeCategory10') {
//     const palette = allColors[paletteName] || allColors.schemeCategory10;
//     return palette[colorIndex % palette.length];
// }

// /**
//  * Get palette name by index from available palettes
//  * @param {number} paletteIndex - The index of the palette
//  * @returns {string} The palette name
//  */
// export function getPaletteNameByIndex(paletteIndex) {
//     const paletteNames = Object.keys(allColors);
//     return paletteNames[paletteIndex % paletteNames.length];
// }

