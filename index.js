import XYAxisWithBackground  from "./src/axis/Axis"
import Bar from "./src/primitives/Bar"
import Box from "./src/primitives/Box"
import Point from "./src/primitives/Point"
import ScatterPoints from "./src/primitives/ScatterPoints"
import Categorical from "./src/charts/categorical/Chart"
import { TextLabel } from "./src/text/TextLabel"
import ScatterLabel from "./src/text/ScatterLabel"
import Heatmap from "./src/charts/heatmap/Heatmap"
import { HeatmapGrouping } from "./src/charts/heatmap/Grouping" 
import { Network } from "./src/charts/network/Network"
import { STD_CHART_COLOR_PALETTE, STD_CHART_COLOR_PALETTE_DARK } from "./src/colors/palette"

export default {

    axis: {
        'XYaxis': XYAxisWithBackground
    },
    colors: {
        palette: {
            STD_CHART_COLOR_PALETTE,
            STD_CHART_COLOR_PALETTE_DARK
        }
    },
    text: {
        "TextLabel": TextLabel,
        "ScatterLabel": ScatterLabel
    },
    primitives: {
        'Box': Box,
        "Bar": Bar,
        "Point": Point,
        "ScatterPoints": ScatterPoints
    },
    charts : {
        "Categorical": Categorical,
        "Heatmap": Heatmap,
        "HeatmapGrouping": HeatmapGrouping,
        "Network" : Network
    }
}