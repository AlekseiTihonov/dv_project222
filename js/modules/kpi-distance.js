import { globalData, ANIM_DURATION } from '../main.js';

function renderKpiDistance() {
    if (!globalData) return;
    
    const totalDistance = globalData.reduce((sum, d) => sum + d["Flight Distance"], 0);
    const avgDistance = Math.round(totalDistance / globalData.length);
    
    const container = d3.select("#kpi-distance");
    
    container
        .html("")
        .style("opacity", 0);
    
    // Format number with commas
    const formatNumber = d3.format(",");
    
    container.append("div")
        .attr("class", "kpi-value")
        .text("0 km")
        .transition()
        .duration(ANIM_DURATION)
        .tween("text", function() {
            const selection = d3.select(this);
            const start = 0;
            const end = totalDistance;
            const interpolator = d3.interpolateNumber(start, end);
            return function(t) {
                selection.text(`${formatNumber(Math.round(interpolator(t)))} km`);
            };
        });
    
    container.append("div")
        .attr("class", "kpi-label")
        .text(`Average: ${formatNumber(avgDistance)} km per customer`);
    
    container.transition()
        .duration(Math.round(ANIM_DURATION/2))
        .style("opacity", 1);
}

export { renderKpiDistance };
