import { globalData, ANIM_DURATION } from '../main.js';

let isHorizontal = false;

function renderBarSeat() {
    if (!globalData) return;
    
    // Calculate average satisfaction by class
    const classGroups = d3.group(globalData, d => d.Class);
    const data = Array.from(classGroups, ([key, values]) => ({
        class: key,
        avgSatisfaction: d3.mean(values, d => d["Average Satisfaction"]),
        count: values.length
    }));
    
    // Sort by satisfaction
    data.sort((a, b) => b.avgSatisfaction - a.avgSatisfaction);
    
    const container = d3.select("#chart-bar-seat");
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
    
    // color mapping per seat class
    const colorMap = {
        'Business': '#0056b3',
        'Eco': '#22c55e',
        'Eco Plus': '#f59e0b'
    };

    if (isHorizontal) {
        // Horizontal bars
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.avgSatisfaction)])
            .range([0, chartWidth])
            .nice();
        
        const yScale = d3.scaleBand()
            .domain(data.map(d => d.class))
            .range([0, chartHeight])
            .padding(0.3);
        
        // Draw bars
        svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => yScale(d.class))
            .attr("width", 0)
            .attr("height", yScale.bandwidth())
            .attr("fill", d => colorMap[d.class] || '#ED1C24')
            .transition()
            .delay((d, i) => i * Math.round(ANIM_DURATION/10))
            .duration(Math.round(ANIM_DURATION/2))
            .attr("width", d => xScale(d.avgSatisfaction));
        
        // Add value labels
        svg.selectAll(".bar-label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .attr("x", d => xScale(d.avgSatisfaction) + 5)
            .attr("y", d => yScale(d.class) + yScale.bandwidth() / 2)
            .attr("dy", "0.35em")
            .attr("font-family", "Georgia")
            .attr("font-size", "12px")
            .text(d => d.avgSatisfaction.toFixed(2))
            .style("opacity", 0)
            .transition()
            .delay(Math.round(ANIM_DURATION/1.2))
            .duration(Math.round(ANIM_DURATION/3))
            .style("opacity", 1);
        
        // Add axes
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("font-family", "Georgia");
        
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale))
            .selectAll("text")
            .attr("font-family", "Georgia");
        
        // Axis labels
        svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("x", chartWidth / 2)
            .attr("y", chartHeight + margin.bottom - 10)
            .attr("font-family", "Georgia")
            .attr("font-size", "14px")
            .text("Average Satisfaction");
        
        svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -chartHeight / 2)
            .attr("y", -margin.left + 15)
            .attr("font-family", "Georgia")
            .attr("font-size", "14px")
            .text("Seat Class");
            
    } else {
        // Vertical bars (default)
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.class))
            .range([0, chartWidth])
            .padding(0.3);
        
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.avgSatisfaction)])
            .range([chartHeight, 0])
            .nice();
        
        // Draw bars
        svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.class))
            .attr("width", xScale.bandwidth())
            .attr("y", chartHeight)
            .attr("height", 0)
            .attr("fill", d => colorMap[d.class] || '#ED1C24')
            .transition()
            .delay((d, i) => i * Math.round(ANIM_DURATION/10))
            .duration(Math.round(ANIM_DURATION/2))
            .attr("y", d => yScale(d.avgSatisfaction))
            .attr("height", d => chartHeight - yScale(d.avgSatisfaction));
        
        // Add value labels
        svg.selectAll(".bar-label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .attr("x", d => xScale(d.class) + xScale.bandwidth() / 2)
            .attr("y", d => yScale(d.avgSatisfaction) - 5)
            .attr("text-anchor", "middle")
            .attr("font-family", "Georgia")
            .attr("font-size", "12px")
                .text(d => d.avgSatisfaction.toFixed(2))
                .style("opacity", 0)
                .transition()
                .delay(Math.round(ANIM_DURATION/1.2))
                .duration(Math.round(ANIM_DURATION/3))
                .style("opacity", 1);
        
        // Add axes
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("font-family", "Georgia");
        
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale))
            .selectAll("text")
            .attr("font-family", "Georgia");
        
        // Axis labels
        svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("x", chartWidth / 2)
            .attr("y", chartHeight + margin.bottom - 10)
            .attr("font-family", "Georgia")
            .attr("font-size", "14px")
            .text("Seat Class");
        
        svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -chartHeight / 2)
            .attr("y", -margin.left + 15)
            .attr("font-family", "Georgia")
            .attr("font-size", "14px")
            .text("Average Satisfaction");
    }
    
    // Fade in
    container.select("svg").transition()
        .duration(Math.round(ANIM_DURATION/1.5))
        .style("opacity", 1);
}

function toggleChartStyle() {
    isHorizontal = !isHorizontal;
    const button = document.getElementById('toggle-chart-style');
    button.textContent = isHorizontal ? "Switch to Vertical" : "Switch to Horizontal";
    renderBarSeat();
}

export { renderBarSeat, toggleChartStyle };
