import XYAxisWithBackground  from "./src/axis/Axis"
import { HeatmapColumnNames } from "./src/charts/heatmap/ColumnNames"
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
import { computeTopologyLayout } from "./src/utils/topology"
import { MembraneTopologyDiagram } from "./src/charts/crosslinks/MembraneTopologyDiagram"
import { computeCrosslinkLayout } from "./src/utils/crosslinks"
import { featureColor } from "./src/colors/crosslinks"
import { randomColor } from "./src/colors/palette"
import { isHex, isHexColorLight } from "./src/types/checks/color"
import { areAllValuesNumbers, areAllValuesArrays, arraysInArrayHaveSameLength } from "./src/types/checks/numbers"
import { copyTextToClipboard, copyTextToClipboardFromArrayOfObjects } from "./src/utils/copy"
import { downloadSVG } from "./src/export/svg"
import { getNumberTicks } from "./src/axis/ticks"
import { getChartWidthAndHeightWithMargins, getBoundariesFromArrayOfObjects, getDomainWithBoundaries, addMarginToBoundaries } from "./src/utils/border"
import { getUniqueValuesInArrayOfObjects } from "./src/utils/arrays"
import { abbreviateNumber, roundNumber } from "./src/transforms/numbers"
import { RingGauge, ProportionBar } from "./src/charts/state/PercentChart"
import { StateDurationPie, StateTimeline } from "./src/charts/state/StateCharts"
import { MonthlyBarLineChart, MonthlyTrendLine } from "./src/charts/state/MonthlyStats"
import { SectionLabel, EmptyState, Dot, Legend, PillToggle, ChipMultiSelect } from "./src/text/InstrumentStats"
import { MONTH_LABELS, DAY_MS, parseYearMonth, groupByYearMonth,totalDurationByState, splitStatesByYear, stateTimeShare } from "./src/utils/time"
import { median } from "./src/utils/stats"
import { normalizeQuantiles } from "./src/utils/quantiles"
import { SERIES_COLORS, seriesColor } from "./src/colors/series"

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
        },
        series: {
            SERIES_COLORS,
            seriesColor
                    }
    },
    text: {
        "TextLabel": TextLabel,
        "ScatterLabel": ScatterLabel,
        "SectionLabel": SectionLabel,
        "EmptyState": EmptyState,
        "Dot": Dot,
        "Legend": Legend,
        "PillToggle": PillToggle,
        "ChipMultiSelect": ChipMultiSelect
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
        "state": {
            "RingGauge": RingGauge,
            "ProportionBar": ProportionBar,
            "StateDurationPie": StateDurationPie,
            "StateTimeline": StateTimeline,
            "MonthlyBarLineChart": MonthlyBarLineChart,
            "MonthlyTrendLine": MonthlyTrendLine
                    },
        "Categorical": Categorical,
        "Heatmap": Heatmap,
        "HeatmapGrouping": HeatmapGrouping,
        "HeatmapColumnNames": HeatmapColumnNames,
        "Network": Network,
        "ProfileChart": ProfileChart,
        "CrosslinkViewer": CrosslinkViewer,
        "MembraneTopologyDiagram": MembraneTopologyDiagram
    },
    utils: {
        "linearRegression" : linearRegression,
        "computeCrosslinkLayout": computeCrosslinkLayout,
        "computeTopologyLayout": computeTopologyLayout,
        "median": median,
        "normalizeQuantiles": normalizeQuantiles,
        "MONTH_LABELS": MONTH_LABELS,
        "DAY_MS": DAY_MS,
        "parseYearMonth": parseYearMonth,
        "groupByYearMonth": groupByYearMonth,
        "totalDurationByState": totalDurationByState,
        "splitStatesByYear": splitStatesByYear,
        "stateTimeShare": stateTimeShare,
        "getChartWidthAndHeightWithMargins": getChartWidthAndHeightWithMargins,
        "getBoundariesFromArrayOfObjects": getBoundariesFromArrayOfObjects,
        "getDomainWithBoundaries": getDomainWithBoundaries,
        "addMarginToBoundaries": addMarginToBoundaries,
        "getUniqueValuesInArrayOfObjects": getUniqueValuesInArrayOfObjects,
        "abbreviateNumber": abbreviateNumber,
        "roundNumber": roundNumber,
        "copyTextToClipboard": copyTextToClipboard,
        "copyTextToClipboardFromArrayOfObjects": copyTextToClipboardFromArrayOfObjects,
        "downloadSVG": downloadSVG,
        "getNumberTicks": getNumberTicks,
        "isHex": isHex,
        "isHexColorLight": isHexColorLight,
        "areAllValuesNumbers": areAllValuesNumbers,
        "areAllValuesArrays": areAllValuesArrays,
        "arraysInArrayHaveSameLength": arraysInArrayHaveSameLength,
        "randomColor": randomColor
    }}
