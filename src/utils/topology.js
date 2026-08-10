export function computeTopologyLayout({ tmSegments, topologicalDomains = [], aaLength, labeledSites = [] }) {
    const sortedTM = [...tmSegments].sort((a, b) => a.start - b.start)
    const sortedDomains = [...topologicalDomains].sort((a, b) => a.start - b.start)

    const labelForPosition = (pos) => {
        const domain = sortedDomains.find(d => pos >= d.start && pos <= d.end)
        return domain?.label ?? "Unknown"
    }

    const segments = []
    let cursor = 1
    let side = 0 // 0 = top band, 1 = bottom band — flips at every TM crossing
    sortedTM.forEach(tm => {
        if (cursor < tm.start) {
            segments.push({
                type: "domain",
                start: cursor,
                end: tm.start - 1,
                side,
                label: labelForPosition(cursor),
            })
        }
        segments.push({
            type: "tm",
            start: tm.start,
            end: tm.end,
            sideBefore: side,
            sideAfter: side === 0 ? 1 : 0,
            description: tm.description,
        })
        side = side === 0 ? 1 : 0
        cursor = tm.end + 1
    })
    if (cursor <= aaLength) {
        segments.push({
            type: "domain",
            start: cursor,
            end: aaLength,
            side,
            label: labelForPosition(cursor),
        })
    }

    const compartments = []
    segments.forEach(s => {
        if (s.type === "domain" && !compartments.includes(s.label)) compartments.push(s.label)
    })

    const labelAnchors = labeledSites.map(site => {
        const segment = segments.find(s => site.residue >= s.start && site.residue <= s.end)
        return { ...site, segment }
    })

    return { segments, compartments, labelAnchors, nTermSide: segments[0]?.side ?? 0 }
}