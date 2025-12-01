import XYAxisWithBackground  from "./src/axis/Axis"
import Bar from "./src/primitives/Bar"
import Box from "./src/primitives/Box"
import Point from "./src/primitives/Point"
import ScatterPoints from "./src/primitives/ScatterPoints"
import Categorical from "./src/charts/categorical/Chart"
import { TextLabel } from "./src/text/TextLabel"
import ScatterLabel from "./src/text/ScatterLabel"


export default {

    axis: {
        'XYaxis': XYAxisWithBackground
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
        "Categorical" : Categorical
    }
}