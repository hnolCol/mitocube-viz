import  XYAxisWithBackground  from "./src/axis/Axis"
import Bar from "./src/primitives/Bar"
import Box from "./src/primitives/Box"
import Categorical from "./src/charts/categorical/Chart"

export default {

    axis: {
        'XYaxis': XYAxisWithBackground
    },
    primitives: {
        'Box': Box,
        "Bar": Bar
    },
    charts : {
        "Categorical" : Categorical
    }
}