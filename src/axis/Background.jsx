
import PropTypes from 'prop-types'
import { isPropHexColorString } from '../types/checks/color'
import { getAxisBackgroundFill } from '../colors/fill'


AxisBackground.propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    fill: isPropHexColorString
}
export function AxisBackground({x, y, height, width, fill, darkmode = false}) {
    const fillColor = fill !== undefined ? fill : getAxisBackgroundFill(darkmode)
    
    return (
        <rect {...{x,y,width,height,fill: fillColor}} />
    )
}
