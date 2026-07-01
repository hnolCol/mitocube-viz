import PropTypes from "prop-types"
import _ from "lodash"
import { useState, useMemo, useEffect } from "react"
import { useTooltip, useTooltipInPortal } from "@visx/tooltip"
import { localPoint } from "@visx/event"

import { CROSSLINK_COLORS, featureColor } from "../../colors/crosslinks"
import { toRad, baseArcPath, featureBandPath, residuePoint, R, ARC_THICK, computeCrosslinkLayout } from "../../utils/crosslinks"

CrosslinkViewer.defaultProps = {
    tag: "A",
    crosslinks: [
        { tag: "xl1", protein_tag_a: "A", protein_tag_b: "B", pos_a: 50,  pos_b: 75,  score: 0.9 },
        { tag: "xl2", protein_tag_a: "A", protein_tag_b: "C", pos_a: 120, pos_b: 40,  score: 0.6 },
        { tag: "xl3", protein_tag_a: "A", protein_tag_b: "B", pos_a: 180, pos_b: 100, score: 0.4 },
    ],
    allTags: ["A", "B", "C"],
    proteinsByTag: {
        "A": { aa_length: 200, label: "Protein A", features: [] },
        "B": { aa_length: 150, label: "Protein B", features: [] },
        "C": { aa_length: 100, label: "Protein C", features: [] },
    },
    showInterPartner: false,
    selectedInterPartners: new Set(),
    interPartnerLinks: [],
    focusedPartnerTag: null,
    onArcClick: () => {},
    onLayoutComputed: null,
    getLabelText: null,
}

CrosslinkViewer.propTypes = {
    tag: PropTypes.string.isRequired,
    crosslinks: PropTypes.array.isRequired,
    allTags: PropTypes.array.isRequired,
    proteinsByTag: PropTypes.object.isRequired,
    interPartnerLinks: PropTypes.array,
    focusedPartnerTag: PropTypes.string,
    showInterPartner: PropTypes.bool,
    selectedInterPartners: PropTypes.instanceOf(Set),
    onArcClick: PropTypes.func,
    onLayoutComputed: PropTypes.func,
    getLabelText: PropTypes.func,
}

export function CrosslinkViewer({
    tag,
    crosslinks,
    allTags,
    proteinsByTag,
    interPartnerLinks,
    focusedPartnerTag,
    showInterPartner,
    selectedInterPartners,
    onArcClick,
    onLayoutComputed,
    getLabelText,
}) {
    const [selected, setSelected] = useState(null)

    const layout = useMemo(() =>
        computeCrosslinkLayout({ crosslinks, allTags, proteinsByTag, getLabelText }),
        [crosslinks, allTags, proteinsByTag, getLabelText]
    )

    useEffect(() => {
        if (layout && onLayoutComputed) onLayoutComputed(layout)
    }, [layout])

    const {
        tooltipData,
        tooltipLeft,
        tooltipTop,
        tooltipOpen,
        showTooltip,
        hideTooltip,
    } = useTooltip()

    const {
        tooltipData: bandTooltipData,
        tooltipLeft: bandTooltipLeft,
        tooltipTop: bandTooltipTop,
        tooltipOpen: bandTooltipOpen,
        showTooltip: showBandTooltip,
        hideTooltip: hideBandTooltip,
    } = useTooltip()

    const { containerRef, TooltipInPortal } = useTooltipInPortal({
        detectBounds: true,
        scroll: true,
    })

    if (!layout) return null

    const { arcs, links } = layout
    const arcList = Object.values(arcs)
    const maxScore = _.max(links.map(l => l.score || 0)) || 1
    const maxInterScore = _.max((interPartnerLinks || []).map(l => l.score || 0)) || 1
    const hasInterSelection = selectedInterPartners.size > 0

    const getLabel = (p) => {
        if (getLabelText) return getLabelText(p.id, proteinsByTag[p.id])
        return p.label ?? proteinsByTag[p.id]?.label ?? p.id
    }

    return (
        <div ref={containerRef} style={{ position: "relative", width: "100%", maxWidth: 850 }}>
            <svg
                viewBox="-380 -380 760 760"
                style={{ width: "100%", height: "auto", display: "block" }}
                onMouseLeave={() => { hideTooltip(); hideBandTooltip() }}
            >
                {arcList.map((p, i) => {
                    const isPartner = p.id !== tag
                    const isFocused = focusedPartnerTag === p.id
                    const isInterSelected = selectedInterPartners.has(p.id)
                    const baseColor = focusedPartnerTag
                        ? "#ccc"
                        : (p.id === tag ? "#1D9E75" : CROSSLINK_COLORS[i % CROSSLINK_COLORS.length])
                    const labelColor = p.id === tag ? "#1D9E75" : CROSSLINK_COLORS[i % CROSSLINK_COLORS.length]
                    const midRad = toRad(p.midDeg)
                    const labelR = R + ARC_THICK + 10
                    const lx = Math.cos(midRad) * labelR
                    const ly = Math.sin(midRad) * labelR
                    const flip = p.midDeg > 90 && p.midDeg < 270
                    const rotation = flip ? p.midDeg + 180 : p.midDeg
                    // features now live inside proteinsByTag
                    const features = proteinsByTag[p.id]?.features || []
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
                                stroke={showInterPartner && isInterSelected ? "rgba(156,128,221,0.4)" : "none"}
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
                                            const coords = localPoint(ev.target.ownerSVGElement, ev)
                                            showBandTooltip({
                                                tooltipLeft: coords.x,
                                                tooltipTop: coords.y,
                                                tooltipData: f,
                                            })
                                        }}
                                        onMouseLeave={hideBandTooltip}
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
                                {getLabel(p)}
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
                            ? "rgba(183,164,229,0.45)"
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
                                const coords = localPoint(ev.target.ownerSVGElement, ev)
                                showTooltip({
                                    tooltipLeft: coords.x,
                                    tooltipTop: coords.y,
                                    tooltipData: l,
                                })
                            }}
                            onMouseLeave={hideTooltip}
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
                            : "rgba(0,100,220,0.85)"
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
                                const coords = localPoint(ev.target.ownerSVGElement, ev)
                                showTooltip({
                                    tooltipLeft: coords.x,
                                    tooltipTop: coords.y,
                                    tooltipData: l,
                                })
                            }}
                            onMouseLeave={showInterPartner ? undefined : hideTooltip}
                            onClick={showInterPartner ? undefined : () => setSelected(isSel ? null : l.tag)}
                        />
                    )
                })}
            </svg>

            {bandTooltipOpen && bandTooltipData && (
                <TooltipInPortal key={Math.random()} top={bandTooltipTop} left={bandTooltipLeft}>
                    <div style={{ fontSize: 12 }}>
                        <b style={{ textTransform: "capitalize" }}>
                            {bandTooltipData.type?.replace(/_/g, " ")}
                        </b>
                        {bandTooltipData.name ? `: ${bandTooltipData.name}` : ""}
                        <br />
                        <span style={{ color: "#888", fontSize: 11 }}>{bandTooltipData.source}</span>
                        <br />
                        Residues {bandTooltipData.start}–{bandTooltipData.end}
                    </div>
                </TooltipInPortal>
            )}

            {tooltipOpen && tooltipData && (
                <TooltipInPortal key={Math.random()} top={tooltipTop} left={tooltipLeft}>
                    <div style={{ fontSize: 12 }}>
                        <b>{proteinsByTag[tooltipData.protein_tag_a]?.label ?? tooltipData.protein_tag_a}</b> res {tooltipData.pos_a}
                        {" "}&harr;{" "}
                        <b>{proteinsByTag[tooltipData.protein_tag_b]?.label ?? tooltipData.protein_tag_b}</b> res {tooltipData.pos_b}
                        <br />Score: {(tooltipData.score ?? 0).toExponential(2)}
                    </div>
                </TooltipInPortal>
            )}
        </div>
    )
}