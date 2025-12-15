import { globalData, ANIM_DURATION } from '../main.js';

function renderBarSeat() {
    if (!globalData) return;
    
    // Calculate average satisfaction
    const classGroups = d3.group(globalData, d => d.Class);
    const data = Array.from(classGroups, ([key, values]) => ({
        class: key,
        avgSatisfaction: d3.mean(values, d => d["Average Satisfaction"])
    }));
    
    // Sort by type
    data.sort((a, b) => b.avgSatisfaction - a.avgSatisfaction);
    
    const container = d3.select("#chart-bar-seat");
    if (container.empty()) return;

    // Dimensions
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
    const margin = {top: 20, right: 50, bottom: 40, left: 80};
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    container.selectAll("*").remove();
    
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const yScale = d3.scaleBand()
        .domain(data.map(d => d.class))
        .range([0, chartHeight])
        .padding(0.3);
    
    const xScale = d3.scaleLinear()
        .domain([0, 5])
        .range([0, chartWidth]);
    
    // Get CSS colors
    const styles = getComputedStyle(document.documentElement);
    const colorPrimary = styles.getPropertyValue('--color-secondary').trim();
    const colorSuccess = styles.getPropertyValue('--color-success').trim();
    const colorWarning = styles.getPropertyValue('--color-warning').trim();
    const colorText = styles.getPropertyValue('--color-text').trim();
    const colorMuted = styles.getPropertyValue('--color-muted').trim();

    // Colors
    const colorMap = {
        'Business': colorPrimary,
        'Eco': colorSuccess,
        'Eco Plus': colorWarning
    };

    // Draw Bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => yScale(d.class))
        .attr("height", yScale.bandwidth())
        .attr("x", 0)
        .attr("width", 0)
        .attr("fill", d => colorMap[d.class] || colorMuted)
        .transition()
        .duration(ANIM_DURATION)
        .attr("width", d => xScale(d.avgSatisfaction));

    // Add labels
    svg.selectAll(".bar-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("y", d => yScale(d.class) + yScale.bandwidth() / 2 + 4)
        .attr("x", d => xScale(d.avgSatisfaction) + 5) 
        .text(d => d.avgSatisfaction.toFixed(2))
        .attr("font-family", "Georgia")
        .attr("font-size", "12px")
        .attr("fill", colorText)
        .style("opacity", 0)
        .transition()
        .delay(ANIM_DURATION / 2)
        .duration(ANIM_DURATION / 2)
        .style("opacity", 1);

    // Y Axis
    svg.append("g")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .attr("font-family", "Georgia")
        .attr("font-size", "12px");

    // X Axis
    svg.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale).ticks(5))
        .selectAll("text")
        .attr("font-family", "Georgia");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight + 35)
        .attr("font-family", "Georgia")
        .attr("font-size", "13px")
        .text("Average Satisfaction Rating");
}

export { renderBarSeat };