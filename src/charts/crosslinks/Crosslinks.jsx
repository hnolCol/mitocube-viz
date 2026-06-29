import PropTypes from "prop-types"
import _ from "lodash"
import { useState, useRef } from "react"

const GAP_DEG = 5
const R = 280
const ARC_THICK = 18
const COLORS = ["#378ADD", "#1D9E75", "#D85A30", "#D4537E", "#BA7517", "#7F77DD"]

const FEATURE_TYPE_COLORS = {
    domain: "#E63946",
    family: "#457B9D",
    homologous_superfamily: "#2A9D8F",
    repeat: "#E9C46A",
    site: "#F4A261",
    binding_site: "#D85A30",
    active_site: "#E76F51",
    conserved_site: "#A8DADC",
    ptm: "#C77DFF",
}

export function featureColor(type) {
    return FEATURE_TYPE_COLORS[type?.toLowerCase()] || "#999"
}

function toRad(deg) { return (deg * Math.PI) / 180 }

function arcPath(startDeg, endDeg, r1, r2) {
    const s = toRad(startDeg), e = toRad(endDeg)
    const lg = endDeg - startDeg > 180 ? 1 : 0
    const c = Math.cos, sn = Math.sin
    return `M${(c(s) * r1).toFixed(1)},${(sn(s) * r1).toFixed(1)} A${r1},${r1} 0 ${lg} 1 ${(c(e) * r1).toFixed(1)},${(sn(e) * r1).toFixed(1)} L${(c(e) * r2).toFixed(1)},${(sn(e) * r2).toFixed(1)} A${r2},${r2} 0 ${lg} 0 ${(c(s) * r2).toFixed(1)},${(sn(s) * r2).toFixed(1)} Z`
}

function baseArcPath(startDeg, endDeg) {
    return arcPath(startDeg, endDeg, R, R + ARC_THICK)
}

function featureBandPath(arc, feature, typeIndex, totalTypes) {
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

function residuePoint(arcs, protId, res) {
    const p = arcs[protId]
    if (!p) return null
    if (res == null || res < 1 || res > p.length) return null
    const deg = p.startDeg + (res / p.length) * (p.endDeg - p.startDeg)
    const rad = toRad(deg)
    return { x: Math.cos(rad) * R, y: Math.sin(rad) * R }
}

export function computeCrosslinkLayout({ crosslinks, allTags, proteinsByTag }) {
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
        arcs[t] = { id: t, length, startDeg, endDeg, midDeg: startDeg + span / 2, geneName: proteinsByTag[t].gene_name || t }
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

CrosslinkViewer.defaultProps = {
    showInterPartner: false,
    selectedInterPartners: new Set(),
    interPartnerLinks: [],
    featuresByTag: {},
    proteinsByTag: {},
    focusedPartnerTag: null,
    onArcClick: () => {},
}

CrosslinkViewer.propTypes = {
    tag: PropTypes.string.isRequired,
    arcs: PropTypes.object.isRequired,
    links: PropTypes.array.isRequired,
    proteinsByTag: PropTypes.object,
    featuresByTag: PropTypes.object,
    interPartnerLinks: PropTypes.array,
    focusedPartnerTag: PropTypes.string,
    showInterPartner: PropTypes.bool,
    selectedInterPartners: PropTypes.instanceOf(Set),
    onArcClick: PropTypes.func,
}

export function CrosslinkViewer({
    tag,
    arcs,
    links,
    proteinsByTag,
    featuresByTag,
    interPartnerLinks,
    focusedPartnerTag,
    showInterPartner,
    selectedInterPartners,
    onArcClick,
}) {
    const svgRef = useRef(null)
    const [tooltip, setTooltip] = useState(null)
    const [bandTooltip, setBandTooltip] = useState(null)
    const [selected, setSelected] = useState(null)

    const arcList = Object.values(arcs)
    const maxScore = _.max(links.map(l => l.score || 0)) || 1
    const maxInterScore = _.max((interPartnerLinks || []).map(l => l.score || 0)) || 1
    const hasInterSelection = selectedInterPartners.size > 0

    return (
        <div style={{ position: "relative", width: "100%", maxWidth: 850 }}>
            <svg
                ref={svgRef}
                viewBox="-380 -380 760 760"
                style={{ width: "100%", height: "auto", display: "block" }}
                onMouseLeave={() => { setTooltip(null); setBandTooltip(null) }}
            >
                {arcList.map((p, i) => {
                    const isPartner = p.id !== tag
                    const isFocused = focusedPartnerTag === p.id
                    const isInterSelected = selectedInterPartners.has(p.id)
                    const baseColor = focusedPartnerTag
                        ? "#ccc"
                        : (p.id === tag ? "#1D9E75" : COLORS[i % COLORS.length])
                    const labelColor = p.id === tag ? "#1D9E75" : COLORS[i % COLORS.length]
                    const midRad = toRad(p.midDeg)
                    const labelR = R + ARC_THICK + 10
                    const lx = Math.cos(midRad) * labelR
                    const ly = Math.sin(midRad) * labelR
                    const flip = p.midDeg > 90 && p.midDeg < 270
                    const rotation = flip ? p.midDeg + 180 : p.midDeg
                    const features = featuresByTag[p.id] || []
                    const featureTypes = [...new Set(features.map(f => f.type))]
                    const arcOpacity = showInterPartner && isPartner
                        ? (hasInterSelection && !isInterSelected ? 0.3 : 0.88)
                        : isFocused ? 1 : 0.88

                    return (
                        <g key={p.id}>
                            <path
                                d={baseArcPath(p.startDeg, p.endDeg)}
                                fill={baseColor}
                                opacity={arcOpacity}
                                stroke={showInterPartner && isInterSelected ? "rgba(155,109,255,0.4)" : "none"}
                                strokeWidth={2.5}
                                style={{ cursor: isPartner ? "pointer" : "default" }}
                                onClick={() => isPartner && onArcClick(p.id)}
                            />
                            {focusedPartnerTag && features.map((f, fi) => {
                                const typeIndex = featureTypes.indexOf(f.type)
                                const d = featureBandPath(p, f, typeIndex, featureTypes.length)
                                if (!d) return null
                                return (
                                    <path
                                        key={fi}
                                        d={d}
                                        fill={featureColor(f.type)}
                                        opacity={0.92}
                                        style={{ cursor: "pointer" }}
                                        onMouseMove={(ev) => {
                                            const r = svgRef.current?.getBoundingClientRect()
                                            if (!r) return
                                            setBandTooltip({
                                                x: ev.clientX - r.left + 12,
                                                y: ev.clientY - r.top - 8,
                                                feature: f,
                                            })
                                        }}
                                        onMouseLeave={() => setBandTooltip(null)}
                                    />
                                )
                            })}
                            <text
                                x={lx} y={ly}
                                transform={`rotate(${rotation} ${lx} ${ly})`}
                                textAnchor={flip ? "end" : "start"}
                                dominantBaseline="middle"
                                fontSize={10}
                                fontWeight={p.id === tag ? 600 : 500}
                                fill={labelColor}
                                style={{ pointerEvents: "none" }}
                            >
                                {p.geneName}
                            </text>
                        </g>
                    )
                })}

                    {showInterPartner && (interPartnerLinks || []).map((l, i) => {
                    const a = residuePoint(arcs, l.protein_tag_a, l.pos_a)
                    const b = residuePoint(arcs, l.protein_tag_b, l.pos_b)
                    if (!a || !b) return null
                    const isSel = selected === l.tag
                    const isInvolvingSelected =
                        selectedInterPartners.has(l.protein_tag_a) ||
                        selectedInterPartners.has(l.protein_tag_b)
                        const stroke = isSel
                        ? "#D85A30"
                        : hasInterSelection && isInvolvingSelected
                            ? "rgba(157, 135, 206, 0.09)"
                            : "rgba(180,180,180,0.15)"
                    return (
                        <path
                            key={`ip-${l.tag}-${i}`}
                            d={`M${a.x.toFixed(1)},${a.y.toFixed(1)} Q0,0 ${b.x.toFixed(1)},${b.y.toFixed(1)}`}
                            fill="none"
                            stroke={stroke}
                            strokeWidth={isSel ? 2.5 : Math.max(0.6, ((l.score || 0) / maxInterScore) * 2)}
                            strokeLinecap="round"
                            style={{ cursor: "pointer" }}
                            onMouseMove={(ev) => {
                                const r = svgRef.current?.getBoundingClientRect()
                                if (!r) return
                                setTooltip({ x: ev.clientX - r.left + 12, y: ev.clientY - r.top - 8, link: l })
                            }}
                            onMouseLeave={() => setTooltip(null)}
                            onClick={() => setSelected(isSel ? null : l.tag)}
                        />
                    )
                })}

                {links.map((l) => {
                    const a = residuePoint(arcs, l.protein_tag_a, l.pos_a)
                    const b = residuePoint(arcs, l.protein_tag_b, l.pos_b)
                    if (!a || !b) return null
                    if (showInterPartner && hasInterSelection) {
                        const partner = l.protein_tag_a === tag ? l.protein_tag_b : l.protein_tag_a
                        if (!selectedInterPartners.has(partner)) return null
                    }
                    const isSel = selected === l.tag
                    const isSelfLink = l.protein_tag_a === l.protein_tag_b
                    const stroke = isSel
                        ? "#D85A30"
                        : isSelfLink
                            ? "rgba(29,158,117,0.5)"
                            : "rgba(0, 100, 220, 0.85)"
                    return (
                        <path
                            key={l.tag}
                            d={`M${a.x.toFixed(1)},${a.y.toFixed(1)} Q0,0 ${b.x.toFixed(1)},${b.y.toFixed(1)}`}
                            fill="none"
                            stroke={stroke}
                            strokeWidth={isSel ? 2.5 : Math.max(0.6, ((l.score || 0) / maxScore) * 2)}
                            strokeLinecap="round"
                            style={{ cursor: showInterPartner ? "default" : "pointer" }}
                            onMouseMove={showInterPartner ? undefined : (ev) => {
                                const r = svgRef.current?.getBoundingClientRect()
                                if (!r) return
                                setTooltip({ x: ev.clientX - r.left + 12, y: ev.clientY - r.top - 8, link: l })
                            }}
                            onMouseLeave={showInterPartner ? undefined : () => setTooltip(null)}
                            onClick={showInterPartner ? undefined : () => setSelected(isSel ? null : l.tag)}
                        />
                    )
                })}
            </svg>

            {bandTooltip && (
                <div style={{
                    position: "absolute", left: bandTooltip.x, top: bandTooltip.y,
                    background: "#fff", border: "1px solid #ddd", borderRadius: 6,
                    padding: "6px 10px", fontSize: 12, pointerEvents: "none", zIndex: 10
                }}>
                    <b style={{ textTransform: "capitalize" }}>{bandTooltip.feature.type?.replace(/_/g, " ")}</b>
                    {bandTooltip.feature.name ? `: ${bandTooltip.feature.name}` : ""}
                    <br />
                    <span style={{ color: "#888", fontSize: 11 }}>{bandTooltip.feature.source}</span>
                    <br />
                    Residues {bandTooltip.feature.start}-{bandTooltip.feature.end}
                </div>
            )}

            {tooltip && (
                <div style={{
                    position: "absolute", left: tooltip.x, top: tooltip.y,
                    background: "#fff", border: "1px solid #ddd", borderRadius: 6,
                    padding: "6px 10px", fontSize: 12, pointerEvents: "none", zIndex: 10
                }}>
                    <b>{proteinsByTag[tooltip.link.protein_tag_a]?.gene_name || tooltip.link.protein_tag_a}</b> res {tooltip.link.pos_a}
                    {" "}&harr;{" "}
                    <b>{proteinsByTag[tooltip.link.protein_tag_b]?.gene_name || tooltip.link.protein_tag_b}</b> res {tooltip.link.pos_b}
                    <br />Score: {(tooltip.link.score ?? 0).toExponential(2)}
                </div>
            )}
        </div>
    )
}