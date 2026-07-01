export const CROSSLINK_COLORS = ["#378ADD", "#1D9E75", "#D85A30", "#D4537E", "#BA7517", "#7F77DD"]

export const FEATURE_TYPE_COLORS = {
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