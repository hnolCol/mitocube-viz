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
import { ProfileChart } from "./src/charts/profile/ProfileChart"
import { linearRegression } from "./src/utils/stats"
import Line from "./src/primitives/Line"
import { MinimalBoxplot } from "./src/charts/minimal/Boxplot"
import { MinimalBoxplots } from "./src/charts/minimal/Boxplots"
import { CrosslinkViewer } from "./src/charts/crosslinks/Crosslinks"
import { computeCrosslinkLayout } from "./src/utils/crosslinks"
import { featureColor } from "./src/colors/crosslinks"

export default {

    axis: {
        'XYaxis': XYAxisWithBackground
    },
    colors: {
        palette: {
            STD_CHART_COLOR_PALETTE,
            STD_CHART_COLOR_PALETTE_DARK
        },
        crosslinks: {
            featureColor
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
        "ScatterPoints": ScatterPoints,
        "Line" : Line
    },
    charts: {
        "minimal": {
            "MinimalBoxplot": MinimalBoxplot,
            "MinimalBoxplots": MinimalBoxplots
        },
        "Categorical": Categorical,
        "Heatmap": Heatmap,
        "HeatmapGrouping": HeatmapGrouping,
        "Network": Network,
        "ProfileChart": ProfileChart,
        "CrosslinkViewer": CrosslinkViewer
    },
    utils: {
        "linearRegression" : linearRegression,
        "computeCrosslinkLayout": computeCrosslinkLayout
    }}