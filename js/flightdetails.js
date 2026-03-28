// Flight Details Page Handler
document.addEventListener('DOMContentLoaded', function() {
    const selectedFlight = JSON.parse(localStorage.getItem('selectedFlight'));
    
    if (!selectedFlight) {
        alert('No flight selected');
        window.location.href = 'index.html';
        return;
    }
    
    displayFlightDetails(selectedFlight);
    setupSeatSelection(selectedFlight);
    setupContinueButton(selectedFlight);
});

function displayFlightDetails(flight) {
    // Display flight header
    const flightHeader = document.getElementById('flightHeader');
    if (flightHeader) {
        flightHeader.innerHTML = `
            <div class="airline-logo-circle">
                <i class="fas fa-plane"></i>
            </div>
            <div>
                <h2>${flight.airline} ${flight.flight_number}</h2>
                <p>${flight.origin} (${flight.origin_code}) → ${flight.destination} (${flight.destination_code})</p>
                <p><strong>Departure:</strong> ${flight.departure_display} | 
                   <strong>Arrival:</strong> ${flight.arrival_display} | 
                   <strong>Duration:</strong> ${Math.floor(flight.duration_minutes / 60)}h ${flight.duration_minutes % 60}m 
                   (${flight.stops === 'direct' ? 'Nonstop' : flight.stops.replace('stop', ' Stop')})</p>
            </div>
        `;
    }
    
    // Display itinerary
    const itineraryDetails = document.getElementById('itineraryDetails');
    if (itineraryDetails) {
        itineraryDetails.innerHTML = `
            <div class="leg">
                <p><strong>Flight:</strong> ${flight.flight_number} (${flight.airline})</p>
                <p><strong>Aircraft:</strong> ${flight.aircraft_type || 'Standard Aircraft'}</p>
                <p><strong>Route:</strong> ${flight.origin} → ${flight.destination}</p>
                <p><strong>Layovers:</strong> ${flight.stops === 'direct' ? 'None (Direct Flight)' : flight.stops}</p>
                <p><strong>Available Seats:</strong> ${flight.available_seats}</p>
            </div>
        `;
    }
    
    // Display initial fare table
    updateFareTable(flight.price, 'Economy');
}

function updateFareTable(basePrice, seatClass) {
    let multiplier = 1;
    let extraCost = 0;
    let className = seatClass;
    
    if (seatClass === 'Premium Economy') {
        multiplier = 1.5;
        extraCost = basePrice * 0.5;
    } else if (seatClass === 'Business') {
        multiplier = 3;
        extraCost = basePrice * 2;
        className = 'Business Class';
    } else if (seatClass === 'First') {
        multiplier = 5;
        extraCost = basePrice * 4;
        className = 'First Class';
    } else {
        className = 'Economy Class';
    }
    
    const subtotal = basePrice * multiplier;
    const taxes = subtotal * 0.12; // 12% tax
    const finalTotal = subtotal + taxes;
    
    const fareTable = document.getElementById('fareTable');
    if (fareTable) {
        fareTable.innerHTML = `
            <tr>
                <td>Base Fare (${className})</td>
                <td>₱${parseFloat(basePrice).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>
            ${extraCost > 0 ? `
            <tr>
                <td>Seat Class Upgrade</td>
                <td>₱${parseFloat(extraCost).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>` : ''}
            <tr>
                <td>Subtotal</td>
                <td><strong>₱${parseFloat(subtotal).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
            </tr>
            <tr>
                <td>Taxes & Fees (12%)</td>
                <td>₱${parseFloat(taxes).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>
            <tr class="total">
                <td><strong>Total Amount</strong></td>
                <td><strong>₱${parseFloat(finalTotal).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
            </tr>
        `;
    }
}

function setupSeatSelection(flight) {
    const seatOptions = document.querySelectorAll('.seat-options input[type="radio"]');
    seatOptions.forEach(option => {
        option.addEventListener('change', function() {
            const selectedClass = this.value;
            updateFareTable(flight.price, selectedClass);
        });
    });
}

function setupContinueButton(flight) {
    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            // Get selected seat class
            const selectedSeat = document.querySelector('.seat-options input[type="radio"]:checked');
            const seatClass = selectedSeat ? selectedSeat.value : 'Economy';
            
            // Calculate final price
            let multiplier = 1;
            if (seatClass === 'Premium Economy') multiplier = 1.5;
            else if (seatClass === 'Business') multiplier = 3;
            else if (seatClass === 'First') multiplier = 5;
            
  const subtotal = flight.price * multiplier;
const taxes = subtotal * 0.12;

const seatPrice = subtotal - flight.price;  // This is the upgrade cost
const totalPrice = subtotal + taxes;

const bookingInfo = {
    flight_id: flight.flight_id,
    flight_number: flight.flight_number,
    airline: flight.airline,
    origin: flight.origin,
    origin_code: flight.origin_code,
    destination: flight.destination,
    destination_code: flight.destination_code,
    departure_time: flight.departure_display,
    arrival_time: flight.arrival_display,
    duration_minutes: flight.duration_minutes,
    stops: flight.stops,
    seat_class: seatClass,
    base_price: flight.price,
    subtotal: subtotal,
    taxes: taxes,
    total_price: totalPrice,
    seat_price: seatPrice  // ✅ Make sure variable name matches
};
            
            // Save to localStorage
            localStorage.setItem('bookingInfo', JSON.stringify(bookingInfo));
            
            // Redirect to payment
            window.location.href = 'payment.html';
        });
    }
}