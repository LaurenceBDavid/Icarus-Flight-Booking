// Booked Flights Management
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in
    const authCheck = await requireAuth();
    if (!authCheck) return;
    
    loadUserBookings();
    initializeBookingTabs();
});

async function loadUserBookings() {
    const loadingState = document.getElementById('bookingsLoading');
    const noBookings = document.getElementById('noBookings');
    const bookingsList = document.getElementById('bookingsList');
    
    try {
        const response = await fetch('get_user_bookings.php');
        const result = await response.json();
        
        loadingState.style.display = 'none';
        
        if (result.success && result.data && result.data.length > 0) {
            displayBookings(result.data);
            updateTabCounts(result.data);
        } else {
            noBookings.style.display = 'flex';
            bookingsList.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        loadingState.style.display = 'none';
        noBookings.style.display = 'flex';
    }
}

function displayBookings(bookings) {
    const bookingsList = document.getElementById('bookingsList');
    bookingsList.innerHTML = '';
    
    bookings.forEach(booking => {
        const bookingCard = createBookingCard(booking);
        bookingsList.appendChild(bookingCard);
    });
}

function createBookingCard(booking) {
    const div = document.createElement('div');
    div.className = 'booking-card';
    div.dataset.status = booking.booking_status;
    
    const statusClass = {
        'confirmed': 'status-confirmed',
        'pending': 'status-pending',
        'cancelled': 'status-cancelled'
    }[booking.booking_status] || 'status-pending';
    
    const statusIcon = {
        'confirmed': 'fa-check-circle',
        'pending': 'fa-clock',
        'cancelled': 'fa-times-circle'
    }[booking.booking_status] || 'fa-clock';
    
    div.innerHTML = `
        <div class="booking-card-header">
            <div class="booking-ref">
                <i class="fas fa-ticket-alt"></i>
                <span>${booking.booking_reference}</span>
            </div>
            <div class="booking-status ${statusClass}">
                <i class="fas ${statusIcon}"></i>
                ${booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
            </div>
        </div>
        
        <div class="booking-card-body">
            <div class="booking-flight-info">
                <div class="airline-header">
                    <i class="fas fa-plane"></i>
                    <h3>${booking.airline}</h3>
                    <span class="flight-num">${booking.flight_number}</span>
                </div>
                
                <div class="booking-route">
                    <div class="route-point">
                        <div class="route-code">${booking.origin_code}</div>
                        <div class="route-city">${booking.origin.split(',')[0]}</div>
                        <div class="route-time">${booking.departure_time}</div>
                    </div>
                    
                    <div class="route-connector">
                        <i class="fas fa-plane"></i>
                        <div class="route-line"></div>
                    </div>
                    
                    <div class="route-point">
                        <div class="route-code">${booking.destination_code}</div>
                        <div class="route-city">${booking.destination.split(',')[0]}</div>
                        <div class="route-time">${booking.arrival_time}</div>
                    </div>
                </div>
                
                <div class="booking-details-row">
                    <span><i class="fas fa-user"></i> ${booking.passenger_name}</span>
                    <span><i class="fas fa-chair"></i> ${booking.seat_class}</span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(booking.booking_date)}</span>
                </div>
            </div>
            
            <div class="booking-price-section">
                <div class="booking-price">
                    <span class="price-label">Total Paid</span>
                    <span class="price-amount">₱${parseFloat(booking.total_price).toLocaleString()}</span>
                </div>
                ${booking.payment_status === 'completed' ? '<div class="payment-badge"><i class="fas fa-check"></i> Paid</div>' : '<div class="payment-badge pending"><i class="fas fa-clock"></i> Payment Pending</div>'}
            </div>
        </div>
        
        <div class="booking-card-footer">
            <button class="btn-secondary" onclick="viewBookingDetails(${booking.booking_id})">
                <i class="fas fa-info-circle"></i> View Details
            </button>
            <button class="btn-secondary" onclick="downloadTicket('${booking.booking_reference}')">
                <i class="fas fa-download"></i> Download Ticket
            </button>
            ${booking.booking_status === 'confirmed' ? `
                <button class="btn-danger" onclick="cancelBooking(${booking.booking_id}, '${booking.booking_reference}')">
                    <i class="fas fa-times"></i> Cancel
                </button>
            ` : ''}
        </div>
    `;
    
    return div;
}

function initializeBookingTabs() {
    document.querySelectorAll('.booking-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.booking-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const status = this.dataset.status;
            filterBookingsByStatus(status);
        });
    });
}

function filterBookingsByStatus(status) {
    const bookingCards = document.querySelectorAll('.booking-card');
    let visibleCount = 0;
    
    bookingCards.forEach(card => {
        if (status === 'all' || card.dataset.status === status) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show no bookings message if none visible
    const noBookings = document.getElementById('noBookings');
    const bookingsList = document.getElementById('bookingsList');
    
    if (visibleCount === 0) {
        noBookings.style.display = 'flex';
        bookingsList.style.display = 'none';
    } else {
        noBookings.style.display = 'none';
        bookingsList.style.display = 'block';
    }
}

function updateTabCounts(bookings) {
    const allCount = bookings.length;
    const confirmedCount = bookings.filter(b => b.booking_status === 'confirmed').length;
    const pendingCount = bookings.filter(b => b.booking_status === 'pending').length;
    const cancelledCount = bookings.filter(b => b.booking_status === 'cancelled').length;
    
    document.getElementById('allCount').textContent = allCount;
    document.getElementById('confirmedCount').textContent = confirmedCount;
    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('cancelledCount').textContent = cancelledCount;
}

async function viewBookingDetails(bookingId) {
    try {
        const response = await fetch(`get_booking_details.php?id=${bookingId}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            showBookingModal(result.data);
        } else {
            alert('Failed to load booking details');
        }
    } catch (error) {
        console.error('Error loading details:', error);
        alert('Error loading booking details');
    }
}

function showBookingModal(booking) {
    const modal = document.getElementById('bookingModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="modal-booking-details">
            <h2><i class="fas fa-ticket-alt"></i> Booking Details</h2>
            
            <div class="detail-section">
                <h3>Booking Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Booking Reference</label>
                        <strong>${booking.booking_reference}</strong>
                    </div>
                    <div class="detail-item">
                        <label>Status</label>
                        <strong class="status-${booking.booking_status}">${booking.booking_status.toUpperCase()}</strong>
                    </div>
                    <div class="detail-item">
                        <label>Booking Date</label>
                        <span>${formatDate(booking.booking_date)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Payment Status</label>
                        <strong>${booking.payment_status === 'completed' ? '✓ Paid' : 'Pending'}</strong>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Flight Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Airline</label>
                        <strong>${booking.airline}</strong>
                    </div>
                    <div class="detail-item">
                        <label>Flight Number</label>
                        <span>${booking.flight_number}</span>
                    </div>
                    <div class="detail-item">
                        <label>Route</label>
                        <span>${booking.origin} (${booking.origin_code}) → ${booking.destination} (${booking.destination_code})</span>
                    </div>
                    <div class="detail-item">
                        <label>Departure</label>
                        <span>${booking.departure_time}</span>
                    </div>
                    <div class="detail-item">
                        <label>Arrival</label>
                        <span>${booking.arrival_time}</span>
                    </div>
                    <div class="detail-item">
                        <label>Duration</label>
                        <span>${Math.floor(booking.duration_minutes / 60)}h ${booking.duration_minutes % 60}m</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Passenger Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Name</label>
                        <strong>${booking.passenger_name}</strong>
                    </div>
                    <div class="detail-item">
                        <label>Email</label>
                        <span>${booking.passenger_email}</span>
                    </div>
                    <div class="detail-item">
                        <label>Phone</label>
                        <span>${booking.passenger_phone || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Seat Class</label>
                        <strong>${booking.seat_class}</strong>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Payment Summary</h3>
                <div class="price-breakdown">
                    <div class="price-row">
                        <span>Total Amount</span>
                        <strong>₱${parseFloat(booking.total_price).toLocaleString()}</strong>
                    </div>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn-primary" onclick="downloadTicket('${booking.booking_reference}')">
                    <i class="fas fa-download"></i> Download Ticket
                </button>
                <button class="btn-secondary" onclick="closeBookingModal()">Close</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    modal.style.display = 'none';
}

async function cancelBooking(bookingId, bookingRef) {
    if (!confirm(`Are you sure you want to cancel booking ${bookingRef}?\n\nThis action cannot be undone.`)) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('booking_id', bookingId);
        
        const response = await fetch('cancel_booking.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Booking cancelled successfully');
            loadUserBookings(); // Reload bookings
        } else {
            alert(result.message || 'Failed to cancel booking');
        }
    } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Error cancelling booking. Please try again.');
    }
}

function downloadTicket(bookingRef) {
    // Generate downloadable ticket (PDF or image)
    alert(`Downloading ticket for booking: ${bookingRef}\n\nThis feature will generate a PDF ticket in the full version.`);
    
    // In production, redirect to PDF generation endpoint
    // window.open(`generate_ticket.php?ref=${bookingRef}`, '_blank');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('bookingModal');
    if (event.target === modal) {
        closeBookingModal();
    }
}