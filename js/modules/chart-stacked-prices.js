import { globalData, ANIM_DURATION } from '../main.js';

function renderStackedPrices() {
    if (!globalData) return;
    
    // Get first 15 disloyal customers
    const disloyalCustomers = globalData
        .filter(d => d["Customer Type"] === "disloyal Customer")
        .slice(0, 15);
    
    // Prepare data for stacked chart
    const data = disloyalCustomers.map(d => ({
        id: d.id,
        ticket1: d["1st Ticket Price"] || 0,
        ticket2: d["2nd Ticket Price"] || 0,
        ticket3: d["3rd Ticket Price"] || 0,
        ticket4: d["4th Ticket Price"] || 0,
        total: (d["1st Ticket Price"] || 0) + (d["2nd Ticket Price"] || 0) + 
               (d["3rd Ticket Price"] || 0) + (d["4th Ticket Price"] || 0)
    }));
    
    const ticketTypes = ["ticket1", "ticket2", "ticket3", "ticket4"];
    const colors = ["#ED1C24", "#0056b3", "#f59e0b", "#22c55e"];
    
    const isStacked = document.getElementById('toggle-stacked').checked;
    
    const container = d3.select("#chart-stacked-prices");
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
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.id))
        .range([0, chartWidth])
        .padding(0.2);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.total)])
        .range([chartHeight, 0])
        .nice();
    
    // Stack generator for stacked bars
    const stackGenerator = d3.stack().keys(ticketTypes);
    const stackedData = stackGenerator(data);
    
    // Create bars
    if (isStacked) {
        // Stacked bars
        const barGroups = svg.selectAll(".customer-group")
            .data(stackedData)
            .enter()
            .append("g")
            .attr("class", "customer-group")
            .attr("fill", (d, i) => colors[i]);
        
        barGroups.selectAll("rect")
            .data(d => d)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.data.id))
            .attr("width", xScale.bandwidth())
            .attr("y", chartHeight)
            .attr("height", 0)
            .transition()
            .delay((d, i) => i * Math.round(ANIM_DURATION/30))
            .duration(Math.round(ANIM_DURATION/2))
            .attr("y", d => yScale(d[1]))
            .attr("height", d => yScale(d[0]) - yScale(d[1]));
    } else {
        // Grouped bars
        const xSubScale = d3.scaleBand()
            .domain(ticketTypes)
            .range([0, xScale.bandwidth()])
            .padding(0.05);
        
        data.forEach((customer, customerIndex) => {
            ticketTypes.forEach((ticketType, typeIndex) => {
                svg.append("rect")
                    .attr("x", xScale(customer.id) + xSubScale(ticketType))
                    .attr("width", xSubScale.bandwidth())
                    .attr("y", chartHeight)
                    .attr("height", 0)
                    .attr("fill", colors[typeIndex])
                    .transition()
                    .delay(customerIndex * Math.round(ANIM_DURATION/15) + typeIndex * Math.round(ANIM_DURATION/75))
                    .duration(Math.round(ANIM_DURATION/2))
                    .attr("y", d => yScale(customer[ticketType]))
                    .attr("height", d => chartHeight - yScale(customer[ticketType]));
            });
        });
    }
    
    // Add axes
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale).tickFormat(d => `ID: ${d}`))
        .selectAll("text")
        .attr("font-family", "Georgia")
        .attr("font-size", "10px");
    
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
        .text("Customer ID");
    
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight / 2)
        .attr("y", -margin.left + 15)
        .attr("font-family", "Georgia")
        .attr("font-size", "14px")
        .text("Ticket Price ($)");
    
    // Add legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${chartWidth - 100}, 0)`);
    
    ticketTypes.forEach((type, i) => {
        const legendItem = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);
        
        legendItem.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", colors[i]);
        
        legendItem.append("text")
            .attr("x", 20)
            .attr("y", 10)
            .attr("font-family", "Georgia")
            .attr("font-size", "11px")
            .text(`Ticket ${i + 1}`);
    });
    
    // Fade in
    container.select("svg").transition()
        .duration(Math.round(ANIM_DURATION/1.5))
        .style("opacity", 1);
}

export { renderStackedPrices };
