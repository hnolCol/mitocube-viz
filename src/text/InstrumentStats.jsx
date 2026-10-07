import { seriesColor } from "../colors/series"

export function SectionLabel({ children }) {
    return <strong style={{ fontSize: "0.75rem", color: "#888" }}>{children}</strong>
}

export function EmptyState({ children, className }) {
    return <div className={className} style={{ fontSize: "0.8rem", color: "#bbb" }}>{children}</div>
}

export function Dot({ color, size = 8 }) {
    return <div style={{ width: size, height: size, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
}


export function Legend({ items }) {
    return (
        <div className="flex margin-top--little" style={{ gap: "0.75rem" }}>
            {items.map(item => (
                <div key={item.label} className="flex center-items" style={{ gap: "0.3rem", fontSize: "0.7rem" }}>
                    <Dot color={item.color} />
                    <span style={{ color: "#888" }}>{item.label}</span>
                </div>
            ))}
        </div>
    )
}


export function PillToggle({ options, value, onChange }) {
    return (
        <div className="flex" style={{ backgroundColor: "#f0f0f0", borderRadius: "999px", padding: "3px", gap: "2px", width: "fit-content" }}>
            {options.map(opt => {
                const active = opt.key === value
                return (
                    <div
                        key={opt.key}
                        onClick={() => onChange(opt.key)}
                        style={{
                            padding: "0.4rem 0.9rem",
                            borderRadius: "999px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            fontWeight: active ? 700 : 400,
                            backgroundColor: active ? "white" : "transparent",
                            boxShadow: active ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
                            color: active ? "#222" : "#888",
                        }}
                    >
                        {opt.label}
                    </div>
                )
            })}
        </div>
    )
}


export function ChipMultiSelect({ options, selected, onToggle, colorFor = seriesColor }) {
    return (
        <div className="flex" style={{ gap: "0.4rem", flexWrap: "wrap" }}>
            {options.map((opt, idx) => {
                const active = selected.includes(opt)
                const color = colorFor(idx)
                return (
                    <div
                        key={opt}
                        onClick={() => onToggle(opt)}
                        style={{
                            padding: "0.3rem 0.7rem",
                            borderRadius: "999px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            border: `1.5px solid ${active ? color : "#ddd"}`,
                            color: active ? color : "#999",
                            fontWeight: active ? 700 : 400,
                            backgroundColor: active ? `${color}15` : "transparent",
                        }}
                    >
                        {opt}
                    </div>
                )
            })}
        </div>
    )
}