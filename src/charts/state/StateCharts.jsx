import { Dot } from "../../text/InstrumentStats"
import { DAY_MS, MONTH_LABELS } from "../../utils/time"


export function StateDurationPie({ segments, size = 90 }) {
    const total = segments.reduce((sum, s) => sum + s.totalMs, 0)
    if (total === 0) return null

    let cumulative = 0
    const gradient = segments
        .map(seg => {
            const start = (cumulative / total) * 360
            cumulative += seg.totalMs
            return `${seg.color} ${start}deg ${(cumulative / total) * 360}deg`
        })
        .join(", ")

    return (
        <div className="flex center-items" style={{ gap: "1rem" }}>
            <div style={{ width: size, height: size, borderRadius: "50%", background: `conic-gradient(${gradient})`, flexShrink: 0 }} />
            <div className="flex flex-column" style={{ gap: "0.25rem" }}>
                {segments.map(seg => (
                    <div key={seg.state_tag} className="flex center-items" style={{ gap: "0.4rem", fontSize: "0.75rem" }}>
                        <Dot color={seg.color} size={9} />
                        <span>{seg.text}</span>
                        <span style={{ color: "#999" }}>{(seg.totalMs / DAY_MS).toFixed(1)}d</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function YearBar({ segments }) {
    return (
        <div style={{ position: "relative", width: "100%", height: "28px", borderRadius: "4px", overflow: "hidden", backgroundColor: "#f0f0f0" }}>
            {segments.map((seg, idx) => (
                <div
                    key={idx}
                    style={{
                        position: "absolute",
                        left: `${seg.startFraction * 100}%`,
                        width: `${(seg.endFraction - seg.startFraction) * 100}%`,
                        height: "100%",
                        backgroundColor: seg.color,
                    }}
                    title={`${seg.state}\n${new Date(seg.startMs).toLocaleDateString()} – ${new Date(seg.endMs).toLocaleDateString()}`}
                />
            ))}
        </div>
    )
}


export function StateTimeline({ years, byYear, minWidth = 520 }) {
    return (
        <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth }}>
                <div className="flex" style={{ paddingLeft: "50px", marginBottom: "4px" }}>
                    {MONTH_LABELS.map(label => (
                        <div key={label} style={{ flex: 1, fontSize: "0.65rem", color: "#aaa", textAlign: "center" }}>
                            {label}
                        </div>
                    ))}
                </div>
                <div className="flex flex-column" style={{ gap: "8px" }}>
                    {years.map(year => (
                        <div key={year} className="flex center-items" style={{ gap: "0.5rem" }}>
                            <div style={{ width: "42px", fontSize: "0.75rem", color: "#888", flexShrink: 0 }}>{year}</div>
                            <YearBar segments={byYear[year]} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}