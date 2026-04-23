
import hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { getStrokeColor } from "../../colors/stroke"

export function AnnotationRectangle({ x, y, width, height, stroke, tag, protein_tag, darkmode }) {
    
    // const { data : protein_in_annotation, isLoading } = hooks.annotations.proteins.useGetIsProteinInAnnotation({tag, protein_tag : protein_tag}, { enabled: _.isString(tag) && _.isString(protein_tag) })
    const protein_in_annotation = true
    return (
        <rect
            x={x}
            y={y}
            fill={protein_in_annotation ? "#ff0000" : "transparent"}
            width={width}
            height={height}
            stroke={getStrokeColor(darkmode)} />
    )
}


export function Annotations({ x, protein_tag, annotation_tags = ["dXtpH"], width, height, y, darkmode = false}) {
    


    return (
    
        <g>{annotation_tags.map((tag, idx) => (
            <AnnotationRectangle
                key={`${tag}-${idx}`}
                x={x + idx * width}
                y={y}
                width={width}
                height={height}
                stroke={getStrokeColor(darkmode)}
                tag={tag}
                protein_tag={protein_tag}
                darkmode={darkmode} />
        ))}</g>
    )
}