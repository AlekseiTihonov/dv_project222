import { globalData, ANIM_DURATION } from '../main.js';

function renderKpiNodelay() {
    if (!globalData) return;
    
    const noDelayCount = globalData.filter(d => 
        d["Departure Delay in Minutes"] == 0 && 
        d["Arrival Delay in Minutes"] == 0
    ).length;
    
    const percentage = ((noDelayCount / globalData.length) * 100).toFixed(1);
    
    const container = d3.select("#kpi-nodelay");

    // Add KPI value with animation
    container
        .html("")
        .style("opacity", 0);
    
    container.append("div")
        .attr("class", "kpi-value")
        .text(0)
        .transition()
        .duration(ANIM_DURATION)
        .tween("text", function() {
            const selection = d3.select(this);
            const start = 0;
            const end = noDelayCount;
            const interpolator = d3.interpolateNumber(start, end);
            return function(t) {
                selection.text(Math.round(interpolator(t)));
            };
        });
    
    container.append("div")
        .attr("class", "kpi-label")
        .text(`customers (${percentage}%) experienced no delays`);
    
    // Fade in
    container.transition()
        .duration(Math.round(ANIM_DURATION/2))
        .style("opacity", 1);
}

export { renderKpiNodelay };
