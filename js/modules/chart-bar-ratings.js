import { globalData } from '../main.js';

let currentCategory = "Checkin service";

function renderBarRatings() {
    if (!globalData || globalData.length === 0) {
        console.warn("renderBarRatings: No globalData available");
        return;
    }
    
    // Get selected category
    const select = document.getElementById('category-select');
    if (select) {
        currentCategory = select.value;
    }
    
    // Check container
    const container = d3.select("#chart-bar-ratings");
    if (container.empty()) {
        console.warn("renderBarRatings: Container #chart-bar-ratings not found");
        return;
    }

    const cardNode = container.node();
    if (cardNode) {
        const parentCard = cardNode.closest('.card');
        if (parentCard) {
            d3.select(parentCard).select('h3').text(`Service Ratings: ${currentCategory}`);
        }
    }
    
    // Process Data
    const ratingCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    
    globalData.forEach(d => {
        const rating = +d[currentCategory];
        if (rating >= 1 && rating <= 5) {
            ratingCounts[rating]++;
        }
    });
    
    const data = Object.keys(ratingCounts).map(key => ({
        rating: key,
        count: ratingCounts[key],
        label: `Rating ${key}`
    }));
    
    // Get CSS colors
    const styles = getComputedStyle(document.documentElement);
    const colorPrimary = styles.getPropertyValue('--color-primary').trim();
    const colorSecondary = styles.getPropertyValue('--color-secondary').trim();
    const colorAccent = styles.getPropertyValue('--color-accent').trim();
    const colorSuccess = styles.getPropertyValue('--color-success').trim(); 
    const colorText = styles.getPropertyValue('--color-text').trim();
    const colorGrey = "#2B2B2B"; 

    const colorMap = {
        1: colorGrey,
        2: colorPrimary,
        3: colorAccent,
        4: colorSecondary,
        5: colorSuccess
    };
    
    // Dimensions
    const width = container.node().clientWidth || 500;
    const height = container.node().clientHeight || 300;
    const margin = {top: 40, right: 30, bottom: 50, left: 60};
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    container.selectAll("*").remove();
    
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.rating))
        .range([0, chartWidth])
        .padding(0.3);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count) || 10]) 
        .range([chartHeight, 0])
        .nice();
    
    // Draw Bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.rating))
        .attr("width", xScale.bandwidth())
        .attr("y", chartHeight)
        .attr("height", 0)
        .attr("fill", d => colorMap[d.rating])
        .attr("opacity", 0.9)
        .transition()
        .duration(800)
        .attr("y", d => yScale(d.count))
        .attr("height", d => chartHeight - yScale(d.count));
    
    // Labels
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
        .attr("fill", colorText)
        .text(d => d.count)
        .style("opacity", 0)
        .transition()
        .delay(500)
        .duration(500)
        .style("opacity", 1);
    
    // Axes
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
    
    // Axis Titles
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
}

export { renderBarRatings };