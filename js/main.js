// Main dashboard initialization
export let globalData = [];
export const ANIM_DURATION = 1500;
// Reference to optional module instances
let scatterModuleRef = null;
let barRatingsModuleRef = null;
let barSeatModuleRef = null;
let stackedModuleRef = null;
let donutModuleRef = null;

// Load CSV data
async function loadData() {
    try {
        // Try different paths for XAMPP
        const csvPath = "data/customer_satisfaction.csv";
        const response = await fetch(csvPath);
        const csvText = await response.text();
        
        // Parse CSV manually
        const rows = csvText.split('\n');
        const headers = rows[0].split(',');
        
        const parsed = rows.slice(1).map(row => {
            const values = row.split(',');
            const obj = {};
            headers.forEach((header, index) => {
                const raw = values[index] ? values[index].trim() : '';
                // Convert numeric-looking values to numbers
                if (raw !== '' && !isNaN(raw)) {
                    obj[header.trim()] = parseFloat(raw);
                } else {
                    obj[header.trim()] = raw;
                }
            });
            return obj;
        }).filter(d => d.id); // Remove empty rows

        // Keep the same exported array reference so modules see updates
        globalData.length = 0;
        parsed.forEach(d => globalData.push(d));
        
        console.log("Data loaded:", globalData.length, "records");
        return true;
    } catch (error) {
        console.error("Error loading data:", error);
        // Create dummy data for testing
        const dummy = createDummyData();
        globalData.length = 0;
        dummy.forEach(d => globalData.push(d));
        console.log("Using dummy data for testing");
        return true;
    }
}

// Create dummy data for testing if CSV fails
function createDummyData() {
    const dummy = [];
    for (let i = 0; i < 100; i++) {
        dummy.push({
            id: i,
            "Customer Type": i % 3 === 0 ? "Loyal Customer" : "disloyal Customer",
            "Flight Distance": Math.floor(Math.random() * 4000),
            "Total Departure and Arrival Delay in Minutes": Math.floor(Math.random() * 200),
            "Departure/Arrival time convenient": Math.floor(Math.random() * 5) + 1,
            "Checkin service": Math.floor(Math.random() * 5) + 1,
            "Ease of Online booking": Math.floor(Math.random() * 5) + 1,
            "Gate location": Math.floor(Math.random() * 5) + 1,
            "On-board service": Math.floor(Math.random() * 5) + 1,
            "Baggage handling": Math.floor(Math.random() * 5) + 1,
            satisfaction: i % 2 === 0 ? "satisfied" : "neutral or dissatisfied",
            "Average Satisfaction": (Math.random() * 3 + 2).toFixed(2),
            Class: ["Business", "Eco", "Eco Plus"][Math.floor(Math.random() * 3)],
            "1st Ticket Price": Math.floor(Math.random() * 1000),
            "2nd Ticket Price": Math.floor(Math.random() * 800),
            "3rd Ticket Price": Math.floor(Math.random() * 600),
            "4th Ticket Price": Math.floor(Math.random() * 400)
        });
    }
    return dummy;
}

// Initialize dashboard
async function initDashboard() {
    console.log("Initializing dashboard...");
    
    // Load data
    await loadData();
    
    // Update KPI charts immediately
    updateKPIs();
    
    // Render charts (module implementations)
    await renderAllCharts();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log("Dashboard initialized!");
}

// Update KPI charts
function updateKPIs() {
    if (!globalData.length) return;
    
    // KPI 1: Loyal Customers
    const loyalCount = globalData.filter(d => d["Customer Type"] === "Loyal Customer").length;
    const totalCount = globalData.length;
    const loyalPercentage = ((loyalCount / totalCount) * 100).toFixed(1);
    
    document.getElementById("kpi-loyal").innerHTML = `
        <div class="kpi-value">${loyalCount}</div>
        <div class="kpi-label">of ${totalCount} total customers (${loyalPercentage}%)</div>
    `;
    
    // KPI 2: Total Flight Distance
    const totalDistance = globalData.reduce((sum, d) => sum + (parseFloat(d["Flight Distance"]) || 0), 0);
    const avgDistance = Math.round(totalDistance / globalData.length);
    const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    document.getElementById("kpi-distance").innerHTML = `
        <div class="kpi-value">${formatNumber(Math.round(totalDistance))} km</div>
        <div class="kpi-label">Average: ${formatNumber(avgDistance)} km per customer</div>
    `;
    
    // KPI 3: No Delays Count
    const noDelayCount = globalData.filter(d => 
        (parseInt(d["Departure Delay in Minutes"]) || 0) === 0 && 
        (parseInt(d["Arrival Delay in Minutes"]) || 0) === 0
    ).length;
    const noDelayPercentage = ((noDelayCount / totalCount) * 100).toFixed(1);
    
    document.getElementById("kpi-nodelay").innerHTML = `
        <div class="kpi-value">${noDelayCount}</div>
        <div class="kpi-label">customers (${noDelayPercentage}%) experienced no delays</div>
    `;
}

// Render all charts (attempt to use module implementations)
async function renderAllCharts() {
    try {
        const [
            kpiLoyalMod,
            kpiDistanceMod,
            kpiNodelayMod,
            barRatingsMod,
            lineMod,
            donutMod,
            barSeatMod,
            stackedMod,
            scatterMod
        ] = await Promise.all([
            import('./modules/kpi-loyal.js'),
            import('./modules/kpi-distance.js'),
            import('./modules/kpi-nodelay.js'),
            import('./modules/chart-bar-ratings.js'),
            import('./modules/chart-line-distance.js'),
            import('./modules/chart-donut-satisfaction.js'),
            import('./modules/chart-bar-seat.js'),
            import('./modules/chart-stacked-prices.js'),
            import('./modules/chart-scatter-delay.js')
        ]);

        // Store refs and call KPI renderers
        if (kpiLoyalMod) {/* no ref needed */}
        if (kpiLoyalMod && kpiLoyalMod.renderKpiLoyal) kpiLoyalMod.renderKpiLoyal();
        if (kpiDistanceMod && kpiDistanceMod.renderKpiDistance) kpiDistanceMod.renderKpiDistance();
        if (kpiNodelayMod && kpiNodelayMod.renderKpiNodelay) kpiNodelayMod.renderKpiNodelay();

        // Charts: store refs so UI can call them
        if (barRatingsMod) barRatingsModuleRef = barRatingsMod;
        if (barRatingsModuleRef && barRatingsModuleRef.renderBarRatings) barRatingsModuleRef.renderBarRatings();

        if (lineMod && lineMod.renderLineDistance) lineMod.renderLineDistance();

        if (donutMod) donutModuleRef = donutMod;
        if (donutModuleRef && donutModuleRef.renderDonutSatisfaction) donutModuleRef.renderDonutSatisfaction();

        if (barSeatMod) barSeatModuleRef = barSeatMod;
        if (barSeatModuleRef && barSeatModuleRef.renderBarSeat) barSeatModuleRef.renderBarSeat();

        if (stackedMod) stackedModuleRef = stackedMod;
        if (stackedModuleRef && stackedModuleRef.renderStackedPrices) stackedModuleRef.renderStackedPrices();

        if (scatterMod && scatterMod.renderScatterDelay) {
            scatterMod.renderScatterDelay();
            scatterModuleRef = scatterMod;
        }
    } catch (err) {
        console.error('Error loading chart modules, falling back to local renderers:', err);
        // Fallback to local renderers
        try { renderBarRatings(); } catch(e){}
        try { renderLineDistance(); } catch(e){}
        try { renderDonutSatisfaction(); } catch(e){}
        try { renderBarSeat(); } catch(e){}
        try { renderStackedPrices(); } catch(e){}
        try { renderScatterDelay(); } catch(e){}
    }
}

// Chart 1: Service Ratings Distribution
function renderBarRatings() {
    const container = document.getElementById("chart-bar-ratings");
    const select = document.getElementById("category-select");
    const category = select.value;
    
    // Count ratings
    const counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    globalData.forEach(d => {
        const rating = parseInt(d[category]) || 0;
        if (rating >= 1 && rating <= 5) {
            counts[rating]++;
        }
    });
    
    // Create simple bar chart with SVG
    const width = 400;
    const height = 250;
    const margin = {top: 20, right: 20, bottom: 40, left: 40};
    
    const svg = d3.select(container)
        .html("")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`);
    
    const xScale = d3.scaleBand()
        .domain(["1", "2", "3", "4", "5"])
        .range([margin.left, width - margin.right])
        .padding(0.3);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(Object.values(counts))])
        .range([height - margin.bottom, margin.top]);
    
    // Add bars
    svg.selectAll("rect")
        .data(Object.entries(counts))
        .enter()
        .append("rect")
        .attr("x", d => xScale(d[0]))
        .attr("y", d => yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d[1]))
        .attr("fill", "#ED1C24")
        .attr("opacity", 0.7)
        .transition()
        .duration(1000)
        .attr("opacity", 1);
    
    // Add labels
    svg.selectAll("text.bar-label")
        .data(Object.entries(counts))
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", d => xScale(d[0]) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d[1]) - 5)
        .attr("text-anchor", "middle")
        .attr("font-family", "Georgia")
        .attr("font-size", "12px")
        .text(d => d[1]);
    
    // Add axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d => `Rating ${d}`);
    const yAxis = d3.axisLeft(yScale);
    
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis);
    
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis);
}

// Chart 2: Line Distance (simplified)
function renderLineDistance() {
    const container = document.getElementById("chart-line-distance");
    
    // Get first 30 customers sorted by distance
    const sortedData = [...globalData]
        .filter(d => d["Flight Distance"])
        .sort((a, b) => parseFloat(a["Flight Distance"]) - parseFloat(b["Flight Distance"]))
        .slice(0, 30);
    
    const width = 400;
    const height = 250;
    const margin = {top: 20, right: 20, bottom: 40, left: 40};
    
    const svg = d3.select(container)
        .html("")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`);
    
    const xScale = d3.scaleLinear()
        .domain([0, sortedData.length - 1])
        .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(sortedData, d => parseFloat(d["Flight Distance"]))])
        .range([height - margin.bottom, margin.top]);
    
    // Create line
    const line = d3.line()
        .x((d, i) => xScale(i))
        .y(d => yScale(parseFloat(d["Flight Distance"])))
        .curve(d3.curveMonotoneX);
    
    svg.append("path")
        .datum(sortedData)
        .attr("fill", "none")
        .attr("stroke", "#ED1C24")
        .attr("stroke-width", 2)
        .attr("d", line);
    
    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickFormat((d, i) => i % 5 === 0 ? `#${i+1}` : ""));
    
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));
}

// Chart 3: Donut Satisfaction
function renderDonutSatisfaction() {
    const container = document.getElementById("chart-donut-satisfaction");
    const legendContainer = document.getElementById("legend-satisfaction");
    
    // Count satisfaction
    const counts = {};
    globalData.forEach(d => {
        const sat = d.satisfaction || "neutral or dissatisfied";
        counts[sat] = (counts[sat] || 0) + 1;
    });
    
    const chartData = Object.entries(counts).map(([key, value]) => ({
        category: key,
        value: value,
        percentage: ((value / globalData.length) * 100).toFixed(1)
    }));
    
    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2;
    
    const svg = d3.select(container)
        .html("")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
        .attr("transform", `translate(${width/2},${height/2})`);
    
    const color = d3.scaleOrdinal()
        .domain(chartData.map(d => d.category))
        .range(["#22c55e", "#f59e0b", "#ef4444"]);
    
    const pie = d3.pie()
        .value(d => d.value);
    
    const arc = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius);
    
    const arcs = g.selectAll("arc")
        .data(pie(chartData))
        .enter()
        .append("g");
    
    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.category))
        .attr("stroke", "white")
        .attr("stroke-width", 2);
    
    // Update legend
    legendContainer.innerHTML = chartData.map(d => `
        <div class="legend-item">
            <div style="width: 12px; height: 12px; background: ${color(d.category)}; display: inline-block; margin-right: 8px;"></div>
            <span style="font-family: Georgia;">${d.category}: ${d.value} (${d.percentage}%)</span>
        </div>
    `).join("");
}

// Chart 4: Bar Seat
// Track chart style state
let isHorizontalBarSeat = false;

function renderBarSeat() {
    const container = document.getElementById("chart-bar-seat");
    
    // Group by class
    const groups = {};
    globalData.forEach(d => {
        const cls = d.Class || "Eco";
        if (!groups[cls]) groups[cls] = { sum: 0, count: 0 };
        groups[cls].sum += parseFloat(d["Average Satisfaction"]) || 0;
        groups[cls].count++;
    });
    
    const chartData = Object.entries(groups).map(([cls, values]) => ({
        class: cls,
        avg: values.sum / values.count
    }));
    
    const width = 400;
    const height = 250;
    const margin = isHorizontalBarSeat ? {top: 20, right: 20, bottom: 40, left: 100} : {top: 20, right: 20, bottom: 40, left: 40};
    
    const svg = d3.select(container)
        .html("")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`);
    
    if (isHorizontalBarSeat) {
        // Horizontal bar chart
        const yScale = d3.scaleBand()
            .domain(chartData.map(d => d.class))
            .range([margin.top, height - margin.bottom])
            .padding(0.3);
        
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d.avg)])
            .range([margin.left, width - margin.right])
            .nice();
        
        // Add bars
        svg.selectAll("rect")
            .data(chartData)
            .enter()
            .append("rect")
            .attr("x", margin.left)
            .attr("y", d => yScale(d.class))
            .attr("width", d => xScale(d.avg) - margin.left)
            .attr("height", yScale.bandwidth())
            .attr("fill", "#0056b3")
            .transition()
            .duration(1000)
            .attr("opacity", 0.8);
        
        // Add labels
        svg.selectAll("text.bar-label")
            .data(chartData)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .attr("x", d => xScale(d.avg) + 5)
            .attr("y", d => yScale(d.class) + yScale.bandwidth() / 2)
            .attr("text-anchor", "start")
            .attr("dominant-baseline", "middle")
            .attr("font-family", "Georgia")
            .attr("font-size", "12px")
            .text(d => d.avg.toFixed(2));
        
        // Add axes
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale));
        
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale));
    } else {
        // Vertical bar chart
        const xScale = d3.scaleBand()
            .domain(chartData.map(d => d.class))
            .range([margin.left, width - margin.right])
            .padding(0.3);
        
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d.avg)])
            .range([height - margin.bottom, margin.top])
            .nice();
        
        // Add bars
        svg.selectAll("rect")
            .data(chartData)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.class))
            .attr("y", d => yScale(d.avg))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - margin.bottom - yScale(d.avg))
            .attr("fill", "#0056b3")
            .transition()
            .duration(1000)
            .attr("opacity", 0.8);
        
        // Add labels
        svg.selectAll("text.bar-label")
            .data(chartData)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .attr("x", d => xScale(d.class) + xScale.bandwidth() / 2)
            .attr("y", d => yScale(d.avg) - 5)
            .attr("text-anchor", "middle")
            .attr("font-family", "Georgia")
            .attr("font-size", "12px")
            .text(d => d.avg.toFixed(2));
        
        // Add axes
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale));
        
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale));
    }
}

// Track stacked prices view state
let isStackedView = true;

// Chart 5: Stacked Prices
function renderStackedPrices() {
    const container = document.getElementById("chart-stacked-prices");
    
    // Get first 15 disloyal customers
    const disloyal = globalData
        .filter(d => d["Customer Type"] === "disloyal Customer")
        .slice(0, 15);
    
    const width = 400;
    const height = 250;
    const margin = {top: 20, right: 20, bottom: 60, left: 40};
    
    const svg = d3.select(container)
        .html("")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`);
    
    const xScale = d3.scaleBand()
        .domain(disloyal.map(d => d.id))
        .range([margin.left, width - margin.right])
        .padding(0.2);
    
    const yScale = d3.scaleLinear()
        .domain([0, 3000])
        .range([height - margin.bottom, margin.top]);
    
    const colors = ["#ED1C24", "#0056b3", "#f59e0b", "#22c55e"];
    
    if (isStackedView) {
        // Draw stacked bars
        disloyal.forEach((customer, index) => {
            let yOffset = 0;
            for (let i = 1; i <= 4; i++) {
                const price = parseFloat(customer[`${i}st Ticket Price`]) || 0;
                if (price > 0) {
                    svg.append("rect")
                        .attr("x", xScale(customer.id))
                        .attr("y", yScale(yOffset + price))
                        .attr("width", xScale.bandwidth())
                        .attr("height", yScale(yOffset) - yScale(yOffset + price))
                        .attr("fill", colors[i-1])
                        .attr("opacity", 0.7);
                    yOffset += price;
                }
            }
        });
    } else {
        // Draw grouped bars
        const groupWidth = xScale.bandwidth();
        const barWidth = groupWidth / 4;
        
        disloyal.forEach((customer, index) => {
            for (let i = 1; i <= 4; i++) {
                const price = parseFloat(customer[`${i}st Ticket Price`]) || 0;
                if (price > 0) {
                    svg.append("rect")
                        .attr("x", xScale(customer.id) + (i - 1) * barWidth)
                        .attr("y", yScale(price))
                        .attr("width", barWidth - 1)
                        .attr("height", height - margin.bottom - yScale(price))
                        .attr("fill", colors[i-1])
                        .attr("opacity", 0.7);
                }
            }
        });
    }
    
    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickFormat(d => `ID: ${d}`))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .attr("text-anchor", "end");
    
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));
}

// Chart 6: Scatter Delay
function renderScatterDelay() {
    const container = document.getElementById("chart-scatter-delay");
    
    const width = 400;
    const height = 300;
    const margin = {top: 20, right: 20, bottom: 40, left: 40};
    
    const svg = d3.select(container)
        .html("")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`);
    
    const xScale = d3.scaleLinear()
        .domain([0, 200])
        .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
        .domain([1, 5])
        .range([height - margin.bottom, margin.top]);
    
    // Add some sample points
    const points = Array.from({length: 50}, (_, i) => ({
        x: Math.random() * 200,
        y: Math.floor(Math.random() * 5) + 1,
        satisfied: Math.random() > 0.5
    }));
    
    svg.selectAll("circle")
        .data(points)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", 4)
        .attr("fill", d => d.satisfied ? "#22c55e" : "#ef4444")
        .attr("opacity", 0.7);
    
    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));
    
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(5));
}

// Zoom functionality for scatter plot
let scatterZoomState = { k: 1, x: 0, y: 0 }; // Track zoom state

function zoomScatterPlot(factor) {
    const container = document.getElementById("chart-scatter-delay");
    const svg = d3.select(container).select("svg");
    
    if (!svg.node()) return; // Ensure chart exists
    
    scatterZoomState.k *= factor;
    
    // Apply zoom transformation to circles
    svg.selectAll("circle")
        .attr("r", 4 / scatterZoomState.k)
        .attr("transform", `scale(${scatterZoomState.k})`);
    
    // Optionally update axes if needed
    console.log(`Zoomed to ${(scatterZoomState.k * 100).toFixed(0)}%`);
}

function resetScatterZoom() {
    const container = document.getElementById("chart-scatter-delay");
    const svg = d3.select(container).select("svg");
    
    if (!svg.node()) return; // Ensure chart exists
    
    scatterZoomState = { k: 1, x: 0, y: 0 };
    
    // Reset all circles to original state
    svg.selectAll("circle")
        .attr("r", 4)
        .attr("transform", "scale(1)");
    
    console.log("Zoom reset to 100%");
}

// Setup event listeners
function setupEventListeners() {
    // Category dropdown
    document.getElementById('category-select').addEventListener('change', function() {
        if (barRatingsModuleRef && barRatingsModuleRef.renderBarRatings) {
            barRatingsModuleRef.renderBarRatings();
        } else {
            renderBarRatings();
        }
    });
    
    // Chart style toggle
    document.getElementById('toggle-chart-style').addEventListener('click', function() {
        // Prefer module toggle if available
        if (barSeatModuleRef && barSeatModuleRef.toggleChartStyle) {
            barSeatModuleRef.toggleChartStyle();
            return;
        }

        // Fallback to local toggle
        isHorizontalBarSeat = !isHorizontalBarSeat;
        const button = this;
        
        if (isHorizontalBarSeat) {
            button.textContent = "Switch to Vertical";
        } else {
            button.textContent = "Switch to Horizontal";
        }
        if (barSeatModuleRef && barSeatModuleRef.renderBarSeat) {
            barSeatModuleRef.renderBarSeat();
        } else {
            renderBarSeat();
        }
    });
    
    // Stacked view toggle
    document.getElementById('toggle-stacked').addEventListener('change', function() {
        isStackedView = this.checked;
        if (stackedModuleRef && stackedModuleRef.renderStackedPrices) {
            stackedModuleRef.renderStackedPrices();
        } else {
            renderStackedPrices();
        }
    });
    
    // Zoom buttons
    document.getElementById('zoom-in-btn').addEventListener('click', function() {
        if (scatterModuleRef && scatterModuleRef.zoomScatter) {
            scatterModuleRef.zoomScatter(1.2);
        } else {
            zoomScatterPlot(1.2);
        }
    });
    
    document.getElementById('zoom-out-btn').addEventListener('click', function() {
        if (scatterModuleRef && scatterModuleRef.zoomScatter) {
            scatterModuleRef.zoomScatter(0.8);
        } else {
            zoomScatterPlot(0.8);
        }
    });
    
    document.getElementById('reset-zoom-btn').addEventListener('click', function() {
        if (scatterModuleRef && scatterModuleRef.resetScatterZoom) {
            scatterModuleRef.resetScatterZoom();
        } else {
            resetScatterZoom();
        }
    });
    
    // Navigation buttons
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show message about what would happen
            const page = this.textContent;
            alert(`Navigating to ${page} page. In a real dashboard, this would load different views.`);
        });
    });
}

// Start when page loads
document.addEventListener('DOMContentLoaded', initDashboard);
