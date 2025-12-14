import { globalData, ANIM_DURATION } from '../main.js';

function renderKpiLoyal() {
    if (!globalData) return;
    
    const loyalCount = globalData.filter(d => d["Customer Type"] === "Loyal Customer").length;
    const totalCount = globalData.length;
    const percentage = ((loyalCount / totalCount) * 100).toFixed(1);
    
    const container = d3.select("#kpi-loyal");
    
    // Clear and add transition
    container
        .html("")
        .style("opacity", 0);
    
    // Add KPI value with counting animation
    container.append("div")
        .attr("class", "kpi-value")
        .text(0)
        .transition()
        .duration(ANIM_DURATION)
        .tween("text", function() {
            const selection = d3.select(this);
            const start = 0;
            const end = loyalCount;
            const interpolator = d3.interpolateNumber(start, end);
            return function(t) {
                selection.text(Math.round(interpolator(t)));
            };
        });
    
    // Add label
    container.append("div")
        .attr("class", "kpi-label")
        .text(`of ${totalCount} total customers (${percentage}%)`);
    
    // Fade in
    container.transition()
        .duration(Math.round(ANIM_DURATION/2))
        .style("opacity", 1);
}

export { renderKpiLoyal };
