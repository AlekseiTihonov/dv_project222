import { globalData, ANIM_DURATION } from '../main.js';

function renderDonutSatisfaction() {
    if (!globalData) return;
    
    // Process data
    const satisfactionCounts = d3.rollup(
        globalData,
        v => v.length,
        d => {
            const score = d["Average Satisfaction"];
            if (score >= 3) return "Satisfied/Neutral";
            return "Unsatisfied";
        }
    );
    
    // Calculate percentages
    let data = Array.from(satisfactionCounts, ([key, value]) => ({
        category: key,
        value: value,
        percentage: ((value / globalData.length) * 100).toFixed(1)
    }));
    
    // Sort data
    const order = ["Satisfied/Neutral", "Unsatisfied"];
    data.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
    
    // Get CSS colors
    const styles = getComputedStyle(document.documentElement);
    const colorSuccess = styles.getPropertyValue('--color-success').trim();
    const colorDanger = styles.getPropertyValue('--color-danger').trim();
    const colorSurface = styles.getPropertyValue('--color-surface').trim();
    
    const colorScale = d3.scaleOrdinal()
        .domain(order)
        .range([colorSuccess, colorDanger]);
    
    // Dimensions
    const container = d3.select("#chart-donut-satisfaction");
    if (container.empty()) return;

    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
    
    const radius = Math.min(width, height) / 2 - 5;
    
    container.selectAll("*").remove();
    
    // SVG
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/2},${height/2})`);
    
    // D3 Generators
    const pie = d3.pie()
        .value(d => d.value)
        .sort(null);
    
    const arc = d3.arc()
        .innerRadius(radius * 0.55) 
        .outerRadius(radius);
    
    // Draw donut slices
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
        .transition()
        .duration(ANIM_DURATION)
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
        .attr("dy", "0.35em")
        .attr("font-family", "Georgia")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("fill", colorSurface) 
        .style("pointer-events", "none")
        .text(d => `${d.data.percentage}%`)
        .style("opacity", 0)
        .transition()
        .delay(ANIM_DURATION)
        .duration(500)
        .style("opacity", 1);
    
    // Add center text
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.5em") 
        .attr("font-family", "Georgia")
        .attr("font-weight", "bold")
        .attr("font-size", "14px")
        .attr("fill", "var(--color-muted)")
        .text("Total");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.8em")
        .attr("font-family", "Georgia")
        .attr("font-weight", "bold")
        .attr("font-size", "24px")
        .text("100%");
    
    // Legend
    const legendContainer = d3.select("#legend-satisfaction");
    legendContainer.selectAll("*").remove();
    
    const legendItems = legendContainer.selectAll(".legend-item")
        .data(data)
        .enter()
        .append("div")
        .attr("class", "legend-item")
        .style("cursor", "pointer")
        .on("click", function(event, d) {
            const item = d3.select(this);
            const isInactive = item.classed("inactive");
            item.classed("inactive", !isInactive);

            const idx = data.indexOf(d);
            svg.selectAll(".arc").filter((_, i) => i === idx)
                .transition()
                .duration(200)
                .style("opacity", isInactive ? 1 : 0.3);
                
            item.style("opacity", isInactive ? 1 : 0.5);
        });
    
    legendItems.append("div")
        .attr("class", "legend-color-box")
        .style("background-color", d => colorScale(d.category));
    
    legendItems.append("span")
        .text(d => `${d.category}: ${d.percentage}%`)
        .style("font-family", "Georgia");
}

export { renderDonutSatisfaction };