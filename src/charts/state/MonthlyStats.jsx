import { MONTH_LABELS } from "../../utils/time"
import { median as computeMedian } from "../../utils/stats"

const formatTick = (t, decimals) => (t >= 1000 ? `${(t / 1000).toFixed(0)}k` : t.toFixed(decimals))

/**
 * Jan–Dec chart. One series -> bars (optional median line); several -> one line per series.
 * series: [{ year, color, months: (number|null)[12] }]
 */
export function MonthlyBarLineChart({ series, tickStep = 1, decimals = 0, showMedian = false, width = 620, height = 255 }) {
    const padding = { top: 10, right: 40, bottom: 24, left: 10 }
    const plotWidth = width - padding.left - padding.right
    const plotHeight = height - padding.top - padding.bottom
    const baseline = padding.top + plotHeight

    const allValues = series.flatMap(s => s.months.filter(v => v != null))
    const niceMax = Math.ceil(Math.max(...allValues, 1) / tickStep) * tickStep || tickStep

    const barW = plotWidth / 12
    const toHeight = v => (v / niceMax) * plotHeight
    const toY = v => baseline - toHeight(v)
    const centerX = idx => padding.left + idx * barW + barW / 2

    const isSingle = series.length === 1
    const median = showMedian && isSingle ? computeMedian(allValues) : null
    const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => niceMax * f)

    return (
        <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
            {ticks.map(t => (
                <g key={t}>
                    <line x1={padding.left} x2={width - padding.right} y1={toY(t)} y2={toY(t)} stroke="#f0f0f0" strokeWidth="1" />
                    <text x={width - padding.right + 8} y={toY(t)} fontSize="9" fill="#aaa" dominantBaseline="middle">
                        {formatTick(t, decimals)}
                    </text>
                </g>
            ))}
            <line x1={padding.left} x2={padding.left} y1={padding.top} y2={baseline} stroke="#ccc" strokeWidth="1" />
            <line x1={padding.left} x2={width - padding.right} y1={baseline} y2={baseline} stroke="#ccc" strokeWidth="1" />

            {isSingle
                ? series[0].months.map((val, idx) => {
                      const barHeight = val ? toHeight(val) : 0
                      return (
                          <rect
                              key={idx}
                              x={padding.left + idx * barW + barW * 0.15}
                              y={baseline - barHeight}
                              width={barW * 0.7}
                              height={barHeight}
                              rx="3"
                              fill={val != null ? series[0].color : "#eee"}
                          >
                              <title>{val != null ? `${MONTH_LABELS[idx]}: ${val.toFixed(decimals)}` : `${MONTH_LABELS[idx]}: no data`}</title>
                          </rect>
                      )
                  })
                : series.map(s => (
                      <g key={s.year}>
                          <polyline
                              points={s.months.map((v, idx) => (v != null ? `${centerX(idx)},${toY(v)}` : null)).filter(Boolean).join(" ")}
                              fill="none"
                              stroke={s.color}
                              strokeWidth="2"
                          />
                          {s.months.map((v, idx) =>
                              v != null ? (
                                  <circle key={idx} cx={centerX(idx)} cy={toY(v)} r="3" fill={s.color}>
                                      <title>{`${MONTH_LABELS[idx]} ${s.year}: ${v.toFixed(decimals)}`}</title>
                                  </circle>
                              ) : null
                          )}
                      </g>
                  ))}

            {median != null ? (
                <g>
                    <line x1={padding.left} x2={width - padding.right} y1={toY(median)} y2={toY(median)} stroke="#ac3e30" strokeWidth="1.5" strokeDasharray="4 3" />
                    <text x={width - padding.right + 8} y={toY(median) - 8} fontSize="9" fill="#ac3e30" textAnchor="end">
                        median {median.toFixed(decimals)}
                    </text>
                </g>
            ) : null}

            {MONTH_LABELS.map((label, idx) => (
                <text key={label} x={centerX(idx)} y={height - 6} textAnchor="middle" fontSize="9" fill="#aaa">
                    {label}
                </text>
            ))}
        </svg>
    )
}

/**
 * Compact Jan–Dec line chart, one line per series (null months are skipped).
 * series: [{ year, color, months: (number|null)[12] }]
 */
export function MonthlyTrendLine({ series, yLabel, unit = "", tickStep = 5, width = 300, height = 100 }) {
    const padding = { top: 10, right: 10, bottom: 20, left: 40 }
    const plotWidth = width - padding.left - padding.right
    const plotHeight = height - padding.top - padding.bottom

    const allValues = series.flatMap(s => s.months.filter(v => v != null))
    if (allValues.length === 0) return null

    const niceMax = Math.ceil(Math.max(...allValues, 1) / tickStep) * tickStep || tickStep
    const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => niceMax * f)
    const scaleY = v => padding.top + plotHeight - (v / niceMax) * plotHeight
    const scaleX = idx => padding.left + idx * (plotWidth / 11)

    return (
        <svg width={width} height={height} style={{ overflow: "visible" }}>
            {yLabel ? (
                <text x={-(padding.top + plotHeight / 2)} y={12} textAnchor="middle" fontSize="9" fill="#999" transform="rotate(-90)">
                    {yLabel}
                </text>
            ) : null}

            {ticks.map(t => (
                <g key={t}>
                    <line x1={padding.left} x2={width - padding.right} y1={scaleY(t)} y2={scaleY(t)} stroke="#f0f0f0" strokeWidth="1" />
                    <text x={padding.left - 6} y={scaleY(t)} textAnchor="end" dominantBaseline="middle" fontSize="9" fill="#aaa">
                        {Math.round(t)}
                    </text>
                </g>
            ))}

            <line x1={padding.left} x2={padding.left} y1={padding.top} y2={padding.top + plotHeight} stroke="#ccc" strokeWidth="1" />
            <line x1={padding.left} x2={width - padding.right} y1={padding.top + plotHeight} y2={padding.top + plotHeight} stroke="#ccc" strokeWidth="1" />

            {series.map((s, sIdx) => {
                // Small vertical offset so overlapping series stay visible
                const jitter = sIdx * 0.15
                const points = s.months.map((v, idx) => (v != null ? [idx, v] : null)).filter(Boolean)
                return (
                    <g key={s.year}>
                        <polyline points={points.map(([m, v]) => `${scaleX(m)},${scaleY(v + jitter)}`).join(" ")} fill="none" stroke={s.color} strokeWidth="2" />
                        {points.map(([m, v]) => (
                            <circle key={m} cx={scaleX(m)} cy={scaleY(v + jitter)} r="3" fill={s.color}>
                                <title>{`${MONTH_LABELS[m]} ${s.year}: ${v}${unit ? ` ${unit}` : ""}`}</title>
                            </circle>
                        ))}
                    </g>
                )
            })}

            {MONTH_LABELS.map((label, idx) => (
                <text key={label} x={scaleX(idx)} y={height - 4} textAnchor="middle" fontSize="9" fill="#aaa">
                    {label}
                </text>
            ))}
        </svg>
    )
}