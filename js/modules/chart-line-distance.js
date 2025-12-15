import { globalData, ANIM_DURATION } from '../main.js';

function renderLineDistance(colorTheme = 'primary') {
    if (!globalData || globalData.length === 0) return;
    
    // Sort data
    const data = [...globalData]
        .sort((a, b) => a["Flight Distance"] - b["Flight Distance"])
        .slice(0, 50); 

    const container = d3.select("#chart-line-distance");
    if (container.empty()) return;

    const styles = getComputedStyle(document.documentElement);
    const colors = {
        primary: styles.getPropertyValue('--color-primary').trim(),
        secondary: styles.getPropertyValue('--color-secondary').trim(),
        accent: styles.getPropertyValue('--color-accent').trim()
    };
    
    // Select color 
    const activeColor = colors[colorTheme] || colors.primary;

    const width = container.node().clientWidth || 500;
    const height = container.node().clientHeight || 300;
    const margin = {top: 30, right: 30, bottom: 50, left: 60};
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    container.selectAll("*").remove();
    
    // Create SVG
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("opacity", 0)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scalePoint()
        .domain(data.map((d, i) => i))
        .range([0, chartWidth])
        .padding(0.5);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d["Flight Distance"])])
        .range([chartHeight, 0])
        .nice();
    
    // Line generator
    const line = d3.line()
        .x((d, i) => xScale(i))
        .y(d => yScale(d["Flight Distance"]))
        .curve(d3.curveMonotoneX);
    
    // Line animation 
    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", activeColor) 
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round")
        .attr("d", line)
        .style("stroke-dasharray", function() {
            const length = this.getTotalLength();
            return length + " " + length;
        })
        .style("stroke-dashoffset", function() {
            return this.getTotalLength();
        })
        .transition()
        .duration(Math.round(ANIM_DURATION * 1.2))
        .style("stroke-dashoffset", 0);
    
    // Add circles for data points 
    let tooltip = d3.select("#tooltip");
    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("background", "white")
            .style("padding", "8px")
            .style("border", "1px solid #ccc")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("opacity", 0);
    }
    
    svg.selectAll(".data-point")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "data-point")
        .attr("cx", (d, i) => xScale(i))
        .attr("cy", d => yScale(d["Flight Distance"]))
        .attr("r", 0)
        .attr("fill", activeColor)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .on("mouseover", function(event, d) {
            tooltip.style("opacity", 0.95)
                .html(`
                    <strong>Customer ID: ${d.id}</strong><br/>
                    Distance: ${d["Flight Distance"]} km<br/>
                    Age: ${d.Age}<br/>
                    Class: ${d.Class}
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 6)
                .attr("fill", "#333");
        })
        .on("mouseout", function() {
            tooltip.style("opacity", 0);
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 4)
                .attr("fill", activeColor);
        })
        .transition()
            .delay((d, i) => i * 20 + Math.round(ANIM_DURATION/1.5))
            .duration(Math.round(ANIM_DURATION/3))
        .attr("r", 4);
    
    // Add axes
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale).tickFormat((d, i) => i % 10 === 0 ? `#${i+1}` : ""))
        .selectAll("text")
        .attr("font-family", "Georgia");
    
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .attr("font-family", "Georgia");
    
    // Add axis labels
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight + margin.bottom - 10)
        .attr("font-family", "Georgia")
        .attr("font-size", "14px")
        .text("Customer Index");
    
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight / 2)
        .attr("y", -margin.left + 15)
        .attr("font-family", "Georgia")
        .attr("font-size", "14px")
        .text("Flight Distance (km)");
    
    // Fade in
    container.select("svg").transition()
        .duration(Math.round(ANIM_DURATION/1.5))
        .style("opacity", 1);
}

export { renderLineDistance };