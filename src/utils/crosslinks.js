import _ from "lodash"

export const GAP_DEG = 5
export const R = 280
export const ARC_THICK = 18

export function toRad(deg) { return (deg * Math.PI) / 180 }

export function arcPath(startDeg, endDeg, r1, r2) {
    const s = toRad(startDeg), e = toRad(endDeg)
    const lg = endDeg - startDeg > 180 ? 1 : 0
    const c = Math.cos, sn = Math.sin
    return `M${(c(s) * r1).toFixed(1)},${(sn(s) * r1).toFixed(1)} A${r1},${r1} 0 ${lg} 1 ${(c(e) * r1).toFixed(1)},${(sn(e) * r1).toFixed(1)} L${(c(e) * r2).toFixed(1)},${(sn(e) * r2).toFixed(1)} A${r2},${r2} 0 ${lg} 0 ${(c(s) * r2).toFixed(1)},${(sn(s) * r2).toFixed(1)} Z`
}

export function baseArcPath(startDeg, endDeg) {
    return arcPath(startDeg, endDeg, R, R + ARC_THICK)
}

export function featureBandPath(arc, feature, typeIndex, totalTypes) {
    const startFrac = Math.max(0, (feature.start - 1) / arc.length)
    const endFrac = Math.min(1, feature.end / arc.length)
    if (startFrac >= endFrac) return null
    const startDeg = arc.startDeg + startFrac * (arc.endDeg - arc.startDeg)
    const endDeg = arc.startDeg + endFrac * (arc.endDeg - arc.startDeg)
    if (endDeg - startDeg < 0.1) return null
    const laneHeight = ARC_THICK / totalTypes
    const r1 = R + typeIndex * laneHeight
    const r2 = r1 + laneHeight
    return arcPath(startDeg, endDeg, r1, r2)
}

export function residuePoint(arcs, protId, res) {
    const p = arcs[protId]
    if (!p) return null
    if (res == null || res < 1 || res > p.length) return null
    const deg = p.startDeg + (res / p.length) * (p.endDeg - p.startDeg)
    const rad = toRad(deg)
    return { x: Math.cos(rad) * R, y: Math.sin(rad) * R }
}

export function computeCrosslinkLayout({ crosslinks, allTags, proteinsByTag, getLabelText }) {
    if (!_.isArray(crosslinks) || crosslinks.length === 0) return null
    if (allTags.some(t => !proteinsByTag[t]?.aa_length)) return null

    const noOfGaps = allTags.length
    const gap = Math.min(90 / noOfGaps, GAP_DEG)
    const totalLen = _.sumBy(allTags, t => proteinsByTag[t].aa_length || 1)

    let cursor = -90
    const arcs = {}
    allTags.forEach(t => {
        const length = proteinsByTag[t].aa_length || 1
        const span = (length / totalLen) * (360 - gap * noOfGaps)
        const startDeg = cursor
        const endDeg = cursor + span
        arcs[t] = {
            id: t,
            length,
            startDeg,
            endDeg,
            midDeg: startDeg + span / 2,
            label: getLabelText ? getLabelText(t, proteinsByTag[t]) : t,
        }
        cursor = endDeg + gap
    })

    const visibleTags = new Set(allTags)
    const links = crosslinks.filter(xl =>
        visibleTags.has(xl.protein_tag_a) && visibleTags.has(xl.protein_tag_b)
    )
    const droppedTags = new Set(
        links
            .filter(l => !residuePoint(arcs, l.protein_tag_a, l.pos_a) || !residuePoint(arcs, l.protein_tag_b, l.pos_b))
            .map(l => l.tag)
    )

    return { arcs, links, droppedCount: droppedTags.size, droppedTags }
}