export const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
export const DAY_MS = 1000 * 60 * 60 * 24


export function parseYearMonth(month) {
    const [yearStr, monthStr] = month.split("-")
    return { year: Number(yearStr), monthIdx: Number(monthStr) - 1 }
}




export function groupByYearMonth(rows, { key = "month", init = () => null, add }) {
    const byYear = {}
    rows.forEach(row => {
        const { year, monthIdx } = parseYearMonth(row[key])
        byYear[year] = byYear[year] || Array.from({ length: 12 }, () => init())
        byYear[year][monthIdx] = add(byYear[year][monthIdx], row)
    })
    const years = Object.keys(byYear).map(Number).sort((a, b) => b - a)
    return { years, byYear }
}

/*  State timelines  */

const sortedByStart = durations =>
    durations.filter(d => d.started_at != null).sort((a, b) => a.started_at - b.started_at)

const indexByTag = states => Object.fromEntries(states.map(s => [s.tag, s]))

/** Total `duration` (ms) per state */
export function totalDurationByState(durations, states) {
    const stateByTag = indexByTag(states)
    const totals = {}
    durations.forEach(d => {
        if (d.duration == null) return
        totals[d.state_tag] = (totals[d.state_tag] || 0) + d.duration
    })
    return Object.entries(totals)
        .filter(([tag]) => stateByTag[tag])
        .map(([state_tag, totalMs]) => ({ state_tag, totalMs, text: stateByTag[state_tag].text, color: stateByTag[state_tag].color }))
}

/**
 * Merges back-to-back spans of the same state, then splits them at year boundaries.
 * Returns { years (oldest first), byYear: { [year]: [{ state, color, startMs, endMs, startFraction, endFraction }] } }
 */
export function splitStatesByYear(durations, states, { mergeGapMs = 60000, now = Date.now() } = {}) {
    const stateByTag = indexByTag(states)

    const merged = []
    sortedByStart(durations).forEach(d => {
        const endMs = d.ended_at ?? d.started_at + (d.duration ?? now - d.started_at)
        const last = merged[merged.length - 1]
        if (last && last.state_tag === d.state_tag && Math.abs(last.endMs - d.started_at) < mergeGapMs) {
            last.endMs = endMs
        } else {
            merged.push({ state_tag: d.state_tag, startMs: d.started_at, endMs })
        }
    })

    const byYear = {}
    merged.forEach(span => {
        const state = stateByTag[span.state_tag]
        if (!state) return
        let cursor = span.startMs
        while (cursor < span.endMs) {
            const year = new Date(cursor).getFullYear()
            const yearStart = new Date(year, 0, 1).getTime()
            const yearEnd = new Date(year + 1, 0, 1).getTime()
            const yearSpan = yearEnd - yearStart
            const sliceEnd = Math.min(span.endMs, yearEnd)

            byYear[year] = byYear[year] || []
            byYear[year].push({
                state: state.text,
                color: state.color,
                startMs: cursor,
                endMs: sliceEnd,
                startFraction: (cursor - yearStart) / yearSpan,
                endFraction: (sliceEnd - yearStart) / yearSpan,
            })
            cursor = sliceEnd
        }
    })

    const years = Object.keys(byYear).map(Number).sort((a, b) => a - b)
    return { years, byYear }
}

/** % of tracked time (first recorded state -> now) spent in `stateTag`. null if nothing tracked. */
export function stateTimeShare(durations, stateTag, now = Date.now()) {
    const sorted = sortedByStart(durations)
    let inStateMs = 0
    let totalMs = 0
    sorted.forEach((d, idx) => {
        const end = idx < sorted.length - 1 ? sorted[idx + 1].started_at : now
        const span = end - d.started_at
        totalMs += span
        if (d.state_tag === stateTag) inStateMs += span
    })
    return totalMs > 0 ? (inStateMs / totalMs) * 100 : null
}