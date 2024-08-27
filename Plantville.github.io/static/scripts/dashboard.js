let isPercentageView = false;
let currentPlantNumber = 1;
let latestValue = 0;
let latestPercentage = 0;

function setActiveNavButton(plantNumber) {
    document.querySelectorAll('.nav-button').forEach(button => {
        if (button.getAttribute('data-plant') === plantNumber.toString()) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function loadPlantData(plantNumber) {
    currentPlantNumber = plantNumber;
    const chartCanvas = document.getElementById('myChart');
    chartCanvas.dataset.chartUrl = `/static/data/Plant ${plantNumber}.csv`;

    setActiveNavButton(plantNumber);

    d3.csv(chartCanvas.dataset.chartUrl).then(function (datapoints) {
        const times = [];
        const values = [];
        
        datapoints.forEach(function (d) {
            times.push(d.time);
            values.push(+d.value);
        });
        
        latestValue = values[values.length - 1];
        const percentages = calculatePercentages(values);
        latestPercentage = percentages[percentages.length - 1];

        updateCurrentDisplay();
        checkPlantStatus(percentages);
        if (isPercentageView) {
            createChart(times, percentages, 'Percentage %');
        } else {
            createChart(times, values, 'Value');
        }
    }).catch(function (error) {
        console.error(`Error loading the CSV file for Plant ${plantNumber}:`, error);
    });
}
function updateCurrentDisplay() {
    const currentDisplay = document.getElementById('currentDisplay');
    if (isPercentageView) {
        currentDisplay.textContent = `Current Percentage: ${latestPercentage.toFixed(0)}%`;
    } else {
        currentDisplay.textContent = `Current Value: ${latestValue.toFixed(0)}`;
    }
}
function checkPlantStatus(percentages) {
    const statusElement = document.getElementById('plantStatus');
    const latestPercentage = percentages[percentages.length - 1];
    
    if (latestPercentage > 75) {
        statusElement.innerHTML = '<span class="icon">☹</span> Your plant is overwatered!';
        statusElement.className = 'plant-status status-yellow';
    } else if (latestPercentage < 25) {
        statusElement.innerHTML = '<span class="icon">☹</span> Your plant needs watering. Please water it regularly!';
        statusElement.className = 'plant-status status-red';
    } else {
        statusElement.innerHTML = '<span class="icon">☺</span> Your plant is in a good condition. Keep it up!';
        statusElement.className = 'plant-status status-green';
    }
}

function calculatePercentages(values) {
    const maxValue = 900;
    const minValue = 200;
    return values.map(value => ((1-(value - minValue)/(maxValue - minValue)) * 100));
}

function createChart(times, values, yAxisLabel) {
    const chartCanvas = document.getElementById('myChart');
    
    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }

    const data = {
        labels: times,
        datasets: [{
            label: isPercentageView ? 'Percentage' : 'Values',
            data: values,
            borderWidth: 2,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.4,
            pointRadius: 0
        }],
    };
    
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        font: {
                            family: "'Roboto', 'Arial', 'Helvetica', sans-serif",
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += isPercentageView 
                                    ? context.parsed.y.toFixed(0) + '%'
                                    : context.parsed.y.toFixed(0);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time',
                        font: {
                            family: "'Roboto', 'Arial', 'Helvetica', sans-serif",
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        font: {
                            family: "'Roboto', 'Arial', 'Helvetica', sans-serif",
                            size: 12
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: yAxisLabel,
                        font: {
                            family: "'Roboto', 'Arial', 'Helvetica', sans-serif",
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        font: {
                            family: "'Roboto', 'Arial', 'Helvetica', sans-serif",
                            size: 12
                        },
                        callback: function(value) {
                            return isPercentageView ? value.toFixed(0) + '%' : value;
                        }
                    }
                }
            }
        }
    };
    window.myChart = new Chart(chartCanvas, config);
}

document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggleDisplay');

    toggleButton.addEventListener('click', function() {
        isPercentageView = !isPercentageView;
        
        // Update button text
        if (isPercentageView) {
            toggleButton.textContent = 'Value View';
        } else {
            toggleButton.textContent = 'Percentage View';
        }
        updateCurrentDisplay();
        loadPlantData(currentPlantNumber);
    });

    // Load default plant (Plant 1) on page load
    loadPlantData(1);

    // Add click event listeners to nav buttons
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', function() {
            const plantNumber = this.getAttribute('data-plant');
            loadPlantData(plantNumber);
        });
    });
});