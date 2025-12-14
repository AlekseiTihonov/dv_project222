import { globalData } from '../main.js';

let currentCategory = "Checkin service";

function renderBarRatings() {
    if (!globalData) return;
    
    // Get selected category
    const select = document.getElementById('category-select');
    currentCategory = select.value;
    
    // Update chart title (use DOM node's closest; d3 selections don't have closest())
    const cardNode = d3.select("#chart-bar-ratings").node();
    if (cardNode) {
        const parentCard = cardNode.closest('.card');
        if (parentCard) d3.select(parentCard).select('h3').text(`Service Ratings: ${currentCategory}`);
    }
    
    // Count ratings 1-5 for selected category
    const ratingCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    
    globalData.forEach(d => {
        const rating = +d[currentCategory];
        if (rating >= 1 && rating <= 5) {
            ratingCounts[rating]++;
        }
    });
    
    // Prepare data for chart
    const data = Object.keys(ratingCounts).map(key => ({
        rating: key,
        count: ratingCounts[key],
        label: `Rating ${key}`
    }));
    
    // Chart dimensions
    const container = d3.select("#chart-bar-ratings");
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
    const margin = {top: 30, right: 30, bottom: 50, left: 60};
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Clear previous chart
    container.selectAll("*").remove();
    
    // Create SVG
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("opacity", 0)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.rating))
        .range([0, chartWidth])
        .padding(0.3);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([chartHeight, 0])
        .nice();
    
    // Create bars with transition
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.rating))
        .attr("width", xScale.bandwidth())
        .attr("y", chartHeight)
        .attr("height", 0)
        .attr("fill", (d, i) => d3.interpolateReds((d.rating / 5) * 0.8 + 0.2))
        .transition()
        .delay((d, i) => i * 100)
        .duration(800)
        .attr("y", d => yScale(d.count))
        .attr("height", d => chartHeight - yScale(d.count));
    
    // Add value labels on bars
    svg.selectAll(".bar-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", d => xScale(d.rating) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d.count) - 5)
        .attr("text-anchor", "middle")
        .attr("font-family", "Georgia")
        .attr("font-size", "12px")
        .attr("fill", "#1e293b")
        .text(d => d.count)
        .style("opacity", 0)
        .transition()
        .delay(1000)
        .duration(500)
        .style("opacity", 1);
    
    // Add axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d => `Rating ${d}`);
    const yAxis = d3.axisLeft(yScale);
    
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(xAxis)
        .selectAll("text")
        .attr("font-family", "Georgia");
    
    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
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
        .text("Satisfaction Rating (1-5)");
    
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight / 2)
        .attr("y", -margin.left + 15)
        .attr("font-family", "Georgia")
        .attr("font-size", "14px")
        .text("Number of Customers");
    
    // Chart title
    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", chartWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("font-family", "Poppins")
        .attr("font-size", "16px")
        .attr("font-weight", "600")
        .text(currentCategory);
    
    // Fade in entire chart
    container.select("svg").transition()
        .duration(1000)
        .style("opacity", 1);
}

export { renderBarRatings };
