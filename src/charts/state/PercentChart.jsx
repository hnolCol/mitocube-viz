/** Circular percentage gauge. */
export function RingGauge({ percent, size = 80, color = "#558ba4", strokeWidth = 10 }) {
    const center = size / 2
    const radius = center - 8
    const circumference = 2 * Math.PI * radius
    const dashLength = (percent / 100) * circumference

    return (
        <svg width={size} height={size}>
            <circle cx={center} cy={center} r={radius} fill="none" stroke="#eee" strokeWidth={strokeWidth} />
            <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${circumference}`}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
            />
            <text x={center} y={center} textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="700" fill="#333">
                {percent.toFixed(0)}%
            </text>
        </svg>
    )
}

/** Horizontal bar showing value / total. */
export function ProportionBar({ value, total, color = "#558ba4", height = 14, valueLabel = "done", restLabel = "remaining" }) {
    const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0
    const rest = Math.max(total - value, 0)

    return (
        <div style={{ display: "flex", height, borderRadius: height / 2, overflow: "hidden", backgroundColor: "#f0f0f0" }}>
            {total > 0 ? (
                <>
                    <div style={{ width: `${pct}%`, backgroundColor: color }} title={`${value} ${valueLabel}`} />
                    <div style={{ width: `${100 - pct}%`, backgroundColor: "#eee" }} title={`${rest} ${restLabel}`} />
                </>
            ) : null}
        </div>
    )
}