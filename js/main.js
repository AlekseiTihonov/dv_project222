import { renderBarRatings } from './modules/chart-bar-ratings.js';
import { renderBarSeat } from './modules/chart-bar-seat.js';
import { renderDonutSatisfaction } from './modules/chart-donut-satisfaction.js';
import { renderLineDistance } from './modules/chart-line-distance.js';
import { renderScatterDelay, zoomScatter, resetScatterZoom } from './modules/chart-scatter-delay.js';
import { renderStackedPrices } from './modules/chart-stacked-prices.js';
import { renderKpiDistance } from './modules/kpi-distance.js';
import { renderKpiLoyal } from './modules/kpi-loyal.js';
import { renderKpiNodelay } from './modules/kpi-nodelay.js';

// Global state
export let globalData = [];
export const ANIM_DURATION = 1500;

// Load CSV data
async function loadData() {
    try {
        const csvPath = "./data/customer_satisfaction.csv"; 
        const data = await d3.csv(csvPath);
        
        globalData = data.map(d => {
            const numericFields = [
                "Age", "Flight Distance", "Departure Delay in Minutes", 
                "Arrival Delay in Minutes", "Total Departure and Arrival Delay in Minutes",
                "Average Satisfaction", "1st Ticket Price", "2nd Ticket Price", 
                "3rd Ticket Price", "4th Ticket Price"
            ];
            
            numericFields.forEach(field => {
                if (d[field]) d[field] = +d[field];
            });

            const ratingFields = [
                "Inflight wifi service", "Departure/Arrival time convenient", "Ease of Online booking",
                "Gate location", "Food and drink", "Online boarding", "Seat comfort",
                "Inflight entertainment", "On-board service", "Leg room service",
                "Baggage handling", "Checkin service", "Inflight service", "Cleanliness"
            ];

            ratingFields.forEach(field => {
                if (d[field]) d[field] = +d[field];
            });

            return d;
        }).filter(d => d.id);

        console.log("Data loaded:", globalData.length, "records");
        return true;
    } catch (error) {
        console.error("Error loading data:", error);
        return false;
    }
}

// Initialize dashboard
async function initDashboard() {
    console.log("Initializing dashboard...");
    
    const loaded = await loadData();
    if (!loaded) {
        alert("Failed to load data. Please check the console.");
        return;
    }
    
    // Render charts
    updateKPIs();
    renderAllCharts();
    setupEventListeners();
    
    console.log("Dashboard initialized!");
}

// Update KPI widgets
function updateKPIs() {
    try {
        renderKpiLoyal();
        renderKpiDistance();
        renderKpiNodelay();
    } catch (e) {
        console.error("Error updating KPIs:", e);
    }
}

// Render all charts
function renderAllCharts() {
    const safeRender = (fn, name) => {
        try {
            if (typeof fn === 'function') fn();
            else console.warn(`${name} is not a function`);
        } catch (err) {
            console.error(`Error rendering ${name}:`, err);
        }
    };

    safeRender(renderBarRatings, 'Bar Ratings');
    safeRender(renderLineDistance, 'Line Distance');
    safeRender(renderDonutSatisfaction, 'Donut Satisfaction');
    safeRender(renderBarSeat, 'Bar Seat');
    safeRender(renderStackedPrices, 'Stacked Prices');
    safeRender(renderScatterDelay, 'Scatter Delay');
}

// Setup event listeners
function setupEventListeners() {
    // Bar Ratings Category Select
    const categorySelect = document.getElementById('category-select');
    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            renderBarRatings();
        });
    }

    // Line Distance Color Buttons
    const colorButtons = document.querySelectorAll('.color-btn');
    colorButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            colorButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const theme = e.target.getAttribute('data-color');
            renderLineDistance(theme);
        });
    });

    // Scatter Plot Zoom Controls
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomResetBtn = document.getElementById('zoom-reset');

    if (zoomInBtn) zoomInBtn.addEventListener('click', () => zoomScatter(1.2));
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => zoomScatter(0.8));
    if (zoomResetBtn) zoomResetBtn.addEventListener('click', resetScatterZoom);

    // Window resize handler for responsiveness
    window.addEventListener('resize', () => {
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(() => {
            renderAllCharts();
        }, 250);
    });
}

// Start application
document.addEventListener('DOMContentLoaded', initDashboard);