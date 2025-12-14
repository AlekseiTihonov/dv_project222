import { globalData, ANIM_DURATION } from '../main.js';

function renderDonutSatisfaction() {
    if (!globalData) return;
    
    // Count satisfaction levels
    const satisfactionCounts = d3.rollup(
        globalData,
        v => v.length,
        d => d.satisfaction
    );
    
    const data = Array.from(satisfactionCounts, ([key, value]) => ({
        category: key,
        value: value,
        percentage: ((value / globalData.length) * 100).toFixed(1)
    }));
    
    // Colors
    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.category))
        .range(["#22c55e", "#f59e0b", "#ef4444"]);
    
    const container = d3.select("#chart-donut-satisfaction");
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
    const radius = Math.min(width, height) / 2 - 20;
    
    container.selectAll("*").remove();
    
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("opacity", 0)
        .append("g")
        .attr("transform", `translate(${width/2},${height/2})`);
    
    // Pie generator
    const pie = d3.pie()
        .value(d => d.value)
        .sort(null);
    
    const arc = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius);
    
    // Create arcs with transition
    const arcs = svg.selectAll(".arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc");
    
    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => colorScale(d.data.category))
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .style("opacity", 0.8)
        .transition()
        .delay((d, i) => i * Math.round(ANIM_DURATION/5))
        .duration(Math.round(ANIM_DURATION/2))
        .attrTween("d", function(d) {
            const interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
            return function(t) {
                return arc(interpolate(t));
            };
        });
    
    // Add labels
    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("font-family", "Georgia")
        .attr("font-size", "14px")
        .attr("fill", "white")
        .style("opacity", 0)
        .text(d => `${d.data.percentage}%`)
        .transition()
        .delay(Math.round(ANIM_DURATION/1.2))
        .duration(Math.round(ANIM_DURATION/3))
        .style("opacity", 1);
    
    // Create interactive legend
    const legendContainer = d3.select("#legend-satisfaction");
    legendContainer.selectAll("*").remove();
    
    const legendItems = legendContainer.selectAll(".legend-item")
        .data(data)
        .enter()
        .append("div")
        .attr("class", "legend-item")
        .style("opacity", 1)
        .on("click", function(event, d) {
            const item = d3.select(this);
            const isInactive = item.classed("inactive");
            
            item.classed("inactive", !isInactive);
            
            // Toggle corresponding arc
            const index = data.findIndex(item => item.category === d.category);
            svg.selectAll(".arc").filter((arcData, i) => i === index)
                .transition()
                .duration(Math.round(ANIM_DURATION/5))
                .style("opacity", isInactive ? 0.8 : 0.2);
        });
    
    legendItems.append("div")
        .attr("class", "legend-color-box")
        .style("background-color", d => colorScale(d.category));
    
    legendItems.append("span")
        .text(d => `${d.category}: ${d.value} customers (${d.percentage}%)`)
        .style("font-family", "Georgia");
    
    // Add center text
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("font-family", "Georgia")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("fill", "#1e293b")
        .text("Satisfaction")
        .attr("dy", -10);
    
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("font-family", "Georgia")
        .attr("font-size", "14px")
        .attr("fill", "#64748b")
        .text(`${globalData.length} total`)
        .attr("dy", 10);
    
    // Fade in
    container.select("svg").transition()
        .duration(Math.round(ANIM_DURATION/1.5))
        .style("opacity", 1);
}

export { renderDonutSatisfaction };
