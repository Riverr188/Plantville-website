function saveSensor(id, sensor, description, status, editable = false) {
    var sensors = JSON.parse(localStorage.getItem('sensors')) || [];
    sensors.push({ id, sensor, description, status, editable });
    localStorage.setItem('sensors', JSON.stringify(sensors));
}

function updateSensor(id, sensor, description, status) {
    var sensors = JSON.parse(localStorage.getItem('sensors')) || [];
    var index = sensors.findIndex(s => s.id === id);
    if (index !== -1) {
        sensors[index] = { id, sensor, description, status, editable: sensors[index].editable }; // Preserve editable property
        localStorage.setItem('sensors', JSON.stringify(sensors));
    }
}

function removeSensor(id) {
    var sensors = JSON.parse(localStorage.getItem('sensors')) || [];
    var index = sensors.findIndex(s => s.id === id);
    if (index !== -1) {
        sensors.splice(index, 1);
        localStorage.setItem('sensors', JSON.stringify(sensors));
    }
}

function loadSensors() {
    var sensors = JSON.parse(localStorage.getItem('sensors')) || [];
    sensors.forEach(function(sensor) {
        // Assume you have a function to add the sensor to your DataTable
        addSensorToTable(sensor);
    });
}

function addSensorToTable(sensor) {
    var table = new DataTable('#example'); // Replace with your table initialization
    table.row.add([
        sensor.sensor,
        sensor.description,
        getStatusBadge(sensor.status),
        '<button class="btn btn-danger" onclick="deleteSensor(this)">Delete</button> <button class="btn btn-warning" onclick="editSensorModal(this)">Edit</button>',
        sensor.editable ? '<button class="btn btn-secondary not-connected-btn">Not Connected</button>' : '<a href="/dashboard" target="_blank" class="btn btn-primary">Connected</a>'
    ]).draw();
}

function getStatusBadge(status) {
    var badgeClass = status.toLowerCase() === 'active' ? 'status-badge active' : 'status-badge inactive';
    return `<span class="${badgeClass}">${status}</span>`;
}
