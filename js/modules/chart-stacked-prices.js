import { globalData, ANIM_DURATION } from "../main.js";

function renderStackedPrices() {
  if (!globalData) return;

  // Ticket prices for first 15 disloyal customers
  const disloyalCustomers = globalData
    .filter((d) => d["Customer Type"] === "disloyal Customer")
    .slice(0, 15);

  // Prepare data structure
  const data = disloyalCustomers.map((d) => ({
    id: d.id,
    ticket1: d["1st Ticket Price"] || 0,
    ticket2: d["2nd Ticket Price"] || 0,
    ticket3: d["3rd Ticket Price"] || 0,
    ticket4: d["4th Ticket Price"] || 0,
  }));

  const ticketTypes = ["ticket1", "ticket2", "ticket3", "ticket4"];

  // Get CSS colors
  const styles = getComputedStyle(document.documentElement);
  const colors = [
    styles.getPropertyValue("--color-primary").trim(),
    styles.getPropertyValue("--color-secondary").trim(),
    styles.getPropertyValue("--color-accent").trim(),
    styles.getPropertyValue("--color-success").trim(),
  ];

  const container = d3.select("#chart-stacked-prices");

  // Dimensions
  const width = container.node().clientWidth;
  const height = container.node().clientHeight;
  const margin = { top: 30, right: 30, bottom: 50, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  container.selectAll("*").remove();

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.id))
    .range([0, chartWidth])
    .padding(0.2);

  // Calculate max total for Y domain
  const maxTotal = d3.max(
    data,
    (d) => d.ticket1 + d.ticket2 + d.ticket3 + d.ticket4
  );

  const yScale = d3
    .scaleLinear()
    .domain([0, maxTotal])
    .range([chartHeight, 0])
    .nice();

  const stackGenerator = d3.stack().keys(ticketTypes);
  const stackedData = stackGenerator(data);

  // Draw Stacked Bars
  svg
    .selectAll(".customer-group")
    .data(stackedData)
    .enter()
    .append("g")
    .attr("class", "customer-group")
    .attr("fill", (d, i) => colors[i])
    .selectAll("rect")
    .data((d) => d)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.data.id))
    .attr("width", xScale.bandwidth())
    .attr("y", chartHeight)
    .attr("height", 0)
    .transition()
    .duration(ANIM_DURATION)
    .attr("y", (d) => yScale(d[1]))
    .attr("height", (d) => yScale(d[0]) - yScale(d[1]));

  // X Axis
  svg
    .append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(xScale).tickFormat((d) => `ID: ${d}`))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .attr("font-family", "Georgia")
    .attr("font-size", "10px");

  // Y Axis
  svg
    .append("g")
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .attr("font-family", "Georgia");

  // Axis Labels
  svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight + margin.bottom - 5)
    .attr("font-family", "Georgia")
    .attr("font-size", "14px")
    .text("Customer ID");

  svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -chartHeight / 2)
    .attr("y", -margin.left + 15)
    .attr("font-family", "Georgia")
    .attr("font-size", "14px")
    .text("Ticket Price ($)");

  // Legend
  const legend = svg
    .append("g")
    .attr("transform", `translate(${chartWidth - 80}, 0)`);

  ticketTypes.forEach((type, i) => {
    const legendItem = legend
      .append("g")
      .attr("transform", `translate(0, ${i * 20})`);

    legendItem
      .append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", colors[i]);

    legendItem
      .append("text")
      .attr("x", 20)
      .attr("y", 10)
      .attr("font-family", "Georgia")
      .attr("font-size", "11px")
      .text(`Ticket ${i + 1}`);
  });
}

export { renderStackedPrices };
