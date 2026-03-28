// Admin Panel JavaScript
document.addEventListener('DOMContentLoaded', async function() {
    // Check admin access first
    await checkAdminAccess();
    
    loadFlights();
    loadBookings();
    loadStats();
    setupFlightForm();
});

async function checkAdminAccess() {
    try {
        const response = await fetch('check_admin.php');
        const result = await response.json();
        
        if (!result.success) {
            alert(result.message);
            window.location.href = result.data?.redirect || 'login.html';
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error checking admin access:', error);
        alert('Please login to access admin panel');
        window.location.href = 'login.html';
        return false;
    }
}

function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    if (tab === 'flights') {
        document.getElementById('flightsTab').classList.add('active');
    } else if (tab === 'bookings') {
        document.getElementById('bookingsTab').classList.add('active');
    }
}

function showFlightForm() {
    document.getElementById('flightFormContainer').style.display = 'block';
    document.getElementById('formTitle').textContent = 'Add New Flight';
    document.getElementById('flightForm').reset();
    document.getElementById('flightId').value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideFlightForm() {
    document.getElementById('flightFormContainer').style.display = 'none';
}

async function loadFlights() {
    try {
        const response = await fetch('admin_get_flights.php');
        const result = await response.json();
        
        const tbody = document.getElementById('flightsTableBody');
        
        if (result.success && result.data.length > 0) {
            tbody.innerHTML = result.data.map(flight => `
                <tr>
                    <td><strong>${flight.flight_number}</strong></td>
                    <td>${flight.airline}</td>
                    <td>${flight.origin_code} → ${flight.destination_code}</td>
                    <td>${flight.departure_time}</td>
                    <td>₱${parseFloat(flight.price).toLocaleString()}</td>
                    <td>${flight.available_seats}</td>
                    <td><span style="color:${flight.status === 'active' ? '#28a745' : '#dc3545'}">${flight.status.toUpperCase()}</span></td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-edit" onclick="editFlight(${flight.flight_id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn-delete" onclick="deleteFlight(${flight.flight_id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px;">No flights found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading flights:', error);
    }
}

async function loadBookings() {
    try {
        const response = await fetch('admin_get_bookings.php');
        const result = await response.json();
        
        const tbody = document.getElementById('bookingsTableBody');
        
        if (result.success && result.data.length > 0) {
            tbody.innerHTML = result.data.map(booking => `
                <tr>
                    <td><strong>${booking.booking_reference}</strong></td>
                    <td>${booking.passenger_name}<br><small>${booking.passenger_email}</small></td>
                    <td>${booking.flight_number}<br><small>${booking.airline}</small></td>
                    <td>${new Date(booking.booking_date).toLocaleDateString()}</td>
                    <td>₱${parseFloat(booking.total_price).toLocaleString()}</td>
                    <td><span style="color:${booking.booking_status === 'confirmed' ? '#28a745' : booking.booking_status === 'pending' ? '#ffc107' : '#dc3545'}">${booking.booking_status.toUpperCase()}</span></td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px;">No bookings found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

async function loadStats() {
    try {
        const response = await fetch('admin_get_stats.php');
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('totalFlights').textContent = result.data.total_flights;
            document.getElementById('totalBookings').textContent = result.data.total_bookings;
            document.getElementById('totalRevenue').textContent = '₱' + parseFloat(result.data.total_revenue).toLocaleString();
            document.getElementById('totalSeats').textContent = result.data.total_seats;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function setupFlightForm() {
    const form = document.getElementById('flightForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const flightData = {
            flight_id: document.getElementById('flightId').value,
            flight_number: document.getElementById('flightNumber').value,
            airline: document.getElementById('airline').value,
            origin: document.getElementById('origin').value,
            origin_code: document.getElementById('originCode').value.toUpperCase(),
            destination: document.getElementById('destination').value,
            destination_code: document.getElementById('destinationCode').value.toUpperCase(),
            departure_time: document.getElementById('departureTime').value,
            arrival_time: document.getElementById('arrivalTime').value,
            duration_minutes: document.getElementById('duration').value,
            price: document.getElementById('price').value,
            available_seats: document.getElementById('seats').value,
            flight_class: document.getElementById('flightClass').value,
            stops: document.getElementById('stops').value,
            aircraft_type: document.getElementById('aircraftType').value,
            status: document.getElementById('status').value
        };
        
        try {
            const formData = new FormData();
            Object.keys(flightData).forEach(key => {
                if (flightData[key]) {
                    formData.append(key, flightData[key]);
                }
            });
            
            const response = await fetch('admin_save_flight.php', {
                method: 'POST',
                body: formData
            });
            
            // FIX: Get the text from response first
            const text = await response.text();
            console.log('Raw response:', text);
            
            const result = JSON.parse(text);
            
            if (result.success) {
                alert(result.message);
                hideFlightForm();
                loadFlights();
                loadStats();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while saving the flight');
        }
    });
}

async function editFlight(flightId) {
    try {
        const response = await fetch(`admin_get_flight.php?id=${flightId}`);
        const result = await response.json();
        
        if (result.success) {
            const flight = result.data;
            
            document.getElementById('flightId').value = flight.flight_id;
            document.getElementById('flightNumber').value = flight.flight_number;
            document.getElementById('airline').value = flight.airline;
            document.getElementById('origin').value = flight.origin;
            document.getElementById('originCode').value = flight.origin_code;
            document.getElementById('destination').value = flight.destination;
            document.getElementById('destinationCode').value = flight.destination_code;
            document.getElementById('departureTime').value = flight.departure_time;
            document.getElementById('arrivalTime').value = flight.arrival_time;
            document.getElementById('duration').value = flight.duration_minutes;
            document.getElementById('price').value = flight.price;
            document.getElementById('seats').value = flight.available_seats;
            document.getElementById('flightClass').value = flight.flight_class;
            document.getElementById('stops').value = flight.stops;
            document.getElementById('aircraftType').value = flight.aircraft_type || '';
            document.getElementById('status').value = flight.status;
            
            document.getElementById('formTitle').textContent = 'Edit Flight';
            document.getElementById('flightFormContainer').style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error loading flight:', error);
        alert('Error loading flight details');
    }
}

async function deleteFlight(flightId) {
    if (!confirm('Are you sure you want to delete this flight? This action cannot be undone.')) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('flight_id', flightId);
        
        const response = await fetch('admin_delete_flight.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            loadFlights();
            loadStats();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while deleting the flight');
    }
}