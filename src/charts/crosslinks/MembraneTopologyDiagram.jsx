import PropTypes from "prop-types"
import { useMemo } from "react"
import { useTooltip, useTooltipInPortal } from "@visx/tooltip"
import { localPoint } from "@visx/event"

import { computeTopologyLayout } from "../../utils/topology"

const WIDTH = 800
const HEIGHT = 300
const MARGIN_X = 70
const TOP_Y = 70
const BOTTOM_Y = 230
const MEMBRANE_TOP = TOP_Y + 40
const MEMBRANE_BOTTOM = BOTTOM_Y - 40
const TM_TUBE_WIDTH = 16

MembraneTopologyDiagram.defaultProps = {
    aaLength: 435,
    tmSegments: [
        { start: 114, end: 134, description: "Helical" },
        { start: 140, end: 160, description: "Helical" },
        { start: 213, end: 233, description: "Helical" },
        { start: 261, end: 281, description: "Helical" },
        { start: 300, end: 320, description: "Helical" },
    ],
    topologicalDomains: [
        { start: 1, end: 113, label: "Mitochondrial intermembrane" },
        { start: 135, end: 139, label: "Mitochondrial matrix" },
        { start: 161, end: 212, label: "Mitochondrial intermembrane" },
        { start: 234, end: 260, label: "Mitochondrial matrix" },
        { start: 282, end: 299, label: "Mitochondrial intermembrane" },
        { start: 321, end: 435, label: "Mitochondrial matrix" },
    ],
    labeledSites: [
        { residue: 195, label: "195" },
        { residue: 196, label: "196" },
        { residue: 411, label: "411" },
        { residue: 427, label: "427" },
        { residue: 428, label: "428" },
    ],
}

MembraneTopologyDiagram.propTypes = {
    aaLength: PropTypes.number.isRequired,
    tmSegments: PropTypes.arrayOf(PropTypes.shape({
        start: PropTypes.number.isRequired,
        end: PropTypes.number.isRequired,
        description: PropTypes.string,
    })).isRequired,
    topologicalDomains: PropTypes.arrayOf(PropTypes.shape({
        start: PropTypes.number.isRequired,
        end: PropTypes.number.isRequired,
        label: PropTypes.string,
    })),
    labeledSites: PropTypes.arrayOf(PropTypes.shape({
        residue: PropTypes.number.isRequired,
        label: PropTypes.string.isRequired,
    })),
}

export function MembraneTopologyDiagram({ aaLength, tmSegments, topologicalDomains, labeledSites }) {
    const hasTM = tmSegments && tmSegments.length > 0

    const layout = useMemo(() => {
        if (!hasTM) return null
        return computeTopologyLayout({ tmSegments, topologicalDomains, aaLength, labeledSites })
    }, [hasTM, tmSegments, topologicalDomains, aaLength, labeledSites])

    const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } = useTooltip()
    const { containerRef, TooltipInPortal } = useTooltipInPortal({ detectBounds: true, scroll: true })

    if (!layout) {
        return (
            <div style={{
                padding: 20, textAlign: "center", color: "#888", fontSize: 13,
                border: "1px dashed #ccc", borderRadius: 6, maxWidth: 800,
            }}>
                No transmembrane topology data available 
            </div>
        )
    }

    const { segments, compartments, labelAnchors } = layout

    // const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } = useTooltip()
    // const { containerRef, TooltipInPortal } = useTooltipInPortal({ detectBounds: true, scroll: true })

    if (!layout) return null

    // const { segments, compartments, labelAnchors } = layout
    const usableWidth = WIDTH - MARGIN_X * 2
    const xForResidue = (r) => MARGIN_X + ((r - 1) / (aaLength - 1)) * usableWidth
    const yForSide = (side) => (side === 0 ? TOP_Y : BOTTOM_Y)

    // Build one continuous polyline: flat across domains, diagonal across TM crossings
    const pathPoints = []
    segments.forEach((seg, i) => {
        if (i === 0) {
            const startY = seg.type === "tm" ? yForSide(seg.sideBefore) : yForSide(seg.side)
            pathPoints.push({ x: xForResidue(seg.start), y: startY })
        }
        const endY = seg.type === "tm" ? yForSide(seg.sideAfter) : yForSide(seg.side)
        pathPoints.push({ x: xForResidue(seg.end), y: endY })
    })
    const pathD = pathPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")

    // Y position for a labeled site, interpolating across TM crossings
    const yForResidue = (residue, segment) => {
        if (!segment) return TOP_Y
        if (segment.type === "domain") return yForSide(segment.side)
        const frac = (residue - segment.start) / Math.max(1, segment.end - segment.start)
        const y0 = yForSide(segment.sideBefore)
        const y1 = yForSide(segment.sideAfter)
        return y0 + (y1 - y0) * frac
    }

    return (
        <div ref={containerRef} style={{ position: "relative", width: "100%", maxWidth: WIDTH }}>
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ width: "100%", height: "auto", display: "block" }}>
                {compartments[0] && (
                    <text x={8} y={TOP_Y + 4} fontSize={11} fontWeight={600} fill="#5c7080">{compartments[0]}</text>
                )}
                {compartments[1] && (
                    <text x={8} y={BOTTOM_Y + 4} fontSize={11} fontWeight={600} fill="#5c7080">{compartments[1]}</text>
                )}

                <rect
                    x={MARGIN_X} y={MEMBRANE_TOP}
                    width={usableWidth} height={MEMBRANE_BOTTOM - MEMBRANE_TOP}
                    fill="#e8dcc8" opacity={0.5}
                />

                {/* the continuous chain */}
                <path d={pathD} fill="none" stroke="#8f99a3" strokeWidth={2.5} strokeLinecap="round" />

                {/* TM tubes drawn on top of the chain, at each crossing */}
                {segments.filter(s => s.type === "tm").map((seg, i) => {
                    const xStart = xForResidue(seg.start)
                    const xEnd = xForResidue(seg.end)
                    const x = (xStart + xEnd) / 2
                    // whichever band this TM exits into at the top vs bottom determines label placement
                    const topResidue = seg.sideBefore === 0 ? seg.start : seg.end
                    const bottomResidue = seg.sideBefore === 0 ? seg.end : seg.start
                    return (
                        <g key={`tm-${i}`}>
                            <rect
                                x={x - TM_TUBE_WIDTH / 2} y={MEMBRANE_TOP - 6}
                                width={TM_TUBE_WIDTH} height={(MEMBRANE_BOTTOM - MEMBRANE_TOP) + 12}
                                rx={5} fill="#4C9A6A"
                                style={{ cursor: "pointer" }}
                                onMouseMove={(ev) => {
                                    const coords = localPoint(ev.target.ownerSVGElement, ev)
                                    showTooltip({ tooltipLeft: coords.x, tooltipTop: coords.y, tooltipData: seg })
                                }}
                                onMouseLeave={hideTooltip}
                            />
                            <text x={x} y={MEMBRANE_TOP - 12} fontSize={9} fill="#555" textAnchor="middle">{topResidue}</text>
                            <text x={x} y={MEMBRANE_BOTTOM + 18} fontSize={9} fill="#555" textAnchor="middle">{bottomResidue}</text>
                        </g>
                    )
                })}
                {/* N-term / C-term labels */}
                <text x={pathPoints[0].x} y={pathPoints[0].y - 14} fontSize={10} fontWeight={700} fill="#333" textAnchor="middle">N</text>
                <text
                    x={pathPoints[pathPoints.length - 1].x}
                    y={pathPoints[pathPoints.length - 1].y - 14}
                    fontSize={10} fontWeight={700} fill="#333" textAnchor="middle"
                >
                    C
                </text>

                {labelAnchors.map((site, i) => {
                    if (!site.segment) return null
                    const x = xForResidue(site.residue)
                    const y = yForResidue(site.residue, site.segment)
                    const labelY = y - 26
                    return (
                        <g key={`${site.residue}-${i}`}>
                            <line x1={x} y1={y} x2={x} y2={labelY + 6} stroke="#D85A30" strokeWidth={1} />
                            <circle cx={x} cy={y} r={3} fill="#D85A30" />
                            <text x={x} y={labelY} fontSize={10} fontWeight={600} fill="#D85A30" textAnchor="middle">
                                {site.label}
                            </text>
                        </g>
                    )
                })}
            </svg>

            {tooltipOpen && tooltipData && (
                <TooltipInPortal key={Math.random()} top={tooltipTop} left={tooltipLeft}>
                    <div style={{ fontSize: 12 }}>
                        <b>TM segment</b><br />
                        Residues {tooltipData.start}–{tooltipData.end}
                        {tooltipData.description ? <><br />{tooltipData.description}</> : null}
                    </div>
                </TooltipInPortal>
            )}
        </div>
    )
}