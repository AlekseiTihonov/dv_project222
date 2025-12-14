import { globalData, ANIM_DURATION } from '../main.js';

let xScale, yScale, zoom;
let currentTransform = d3.zoomIdentity;

function renderScatterDelay() {
    if (!globalData) return;
    
    // Filter out extreme outliers for better visualization
    const data = globalData.filter(d => 
        d["Total Departure and Arrival Delay in Minutes"] <= 300 &&
        d["Departure/Arrival time convenient"] >= 1
    );
    
    const container = d3.select("#chart-scatter-delay");
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
    const margin = {top: 30, right: 30, bottom: 50, left: 60};
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    container.selectAll("*").remove();
    
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("opacity", 0)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d["Total Departure and Arrival Delay in Minutes"])])
        .range([0, chartWidth])
        .nice();
    
    yScale = d3.scaleLinear()
        .domain([1, 5])
        .range([chartHeight, 0]);
    
    // Draw axes
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale));
    
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(5));
    
    // Add axis labels
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight + margin.bottom - 10)
        .attr("font-family", "Georgia")
        .attr("font-size", "14px")
        .text("Total Delay Minutes");
    
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight / 2)
        .attr("y", -margin.left + 15)
        .attr("font-family", "Georgia")
        .attr("font-size", "14px")
        .text("Time Convenience Rating (1-5)");
    
    // Create brush for selection
    const brush = d3.brush()
        .extent([[0, 0], [chartWidth, chartHeight]])
        .on("brush", brushed)
        .on("end", brushEnded);
    
    svg.append("g")
        .attr("class", "brush")
        .call(brush);
    
    // Add data points
    svg.selectAll(".scatter-point")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "scatter-point")
        .attr("cx", d => xScale(d["Total Departure and Arrival Delay in Minutes"]))
        .attr("cy", d => yScale(d["Departure/Arrival time convenient"]))
        .attr("r", 0)
        .attr("fill", d => d.satisfaction === "satisfied" ? "#22c55e" : "#ef4444")
        .attr("opacity", 0.7)
        .transition()
        .delay((d, i) => i * Math.round(ANIM_DURATION/300))
        .duration(Math.round(ANIM_DURATION/3))
        .attr("r", 5);
    
    // Add zoom behavior
    zoom = d3.zoom()
        .scaleExtent([1, 10])
        .translateExtent([[0, 0], [chartWidth, chartHeight]])
        .extent([[0, 0], [chartWidth, chartHeight]])
        .on("zoom", zoomed);
    
    svg.call(zoom);
    
    // Fade in
    container.select("svg").transition()
        .duration(Math.round(ANIM_DURATION/1.5))
        .style("opacity", 1);
}

function zoomed(event) {
    currentTransform = event.transform;
    
    const container = d3.select("#chart-scatter-delay");
    const svg = container.select("svg g");
    
    svg.selectAll(".scatter-point")
        .attr("transform", currentTransform)
        .attr("r", 5 / currentTransform.k);
    
    svg.select(".x-axis").call(d3.axisBottom(currentTransform.rescaleX(xScale)));
    svg.select(".y-axis").call(d3.axisLeft(currentTransform.rescaleY(yScale)));
}

function zoomScatter(factor) {
    const container = d3.select("#chart-scatter-delay");
    const svg = container.select("svg g");
    
    currentTransform = currentTransform.scale(factor);
    svg.call(zoom.transform, currentTransform);
}

function resetScatterZoom() {
    const container = d3.select("#chart-scatter-delay");
    const svg = container.select("svg g");
    
    currentTransform = d3.zoomIdentity;
    svg.call(zoom.transform, currentTransform);
}

function brushed(event) {
    if (!event.selection) return;
    
    const [[x0, y0], [x1, y1]] = event.selection;
    
    // Highlight points within brush
    d3.select("#chart-scatter-delay").selectAll(".scatter-point")
        .attr("stroke", d => {
            const cx = currentTransform.applyX(xScale(d["Total Departure and Arrival Delay in Minutes"]));
            const cy = currentTransform.applyY(yScale(d["Departure/Arrival time convenient"]));
            
            if (cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1) {
                return "black";
            }
            return "none";
        })
        .attr("stroke-width", d => {
            const cx = currentTransform.applyX(xScale(d["Total Departure and Arrival Delay in Minutes"]));
            const cy = currentTransform.applyY(yScale(d["Departure/Arrival time convenient"]));
            
            if (cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1) {
                return 2;
            }
            return 0;
        });
}

function brushEnded(event) {
    if (!event.selection) {
        // Reset all points when brush is cleared
        d3.select("#chart-scatter-delay").selectAll(".scatter-point")
            .attr("stroke", "none")
            .attr("stroke-width", 0);
    }
}

export { renderScatterDelay, zoomScatter, resetScatterZoom };
