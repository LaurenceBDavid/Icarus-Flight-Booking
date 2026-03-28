// Payment Page Handler
document.addEventListener('DOMContentLoaded', function() {
    const bookingInfo = JSON.parse(localStorage.getItem('bookingInfo'));
    
    if (!bookingInfo) {
        alert('No booking information found');
        window.location.href = 'index.html';
        return;
    }
    
    displayFlightSummary(bookingInfo);
    setupPaymentForm(bookingInfo);
});



function displayFlightSummary(booking) {
    const flightSummary = document.getElementById('flightSummary');
    if (flightSummary) {
        flightSummary.innerHTML = `
            <div style="padding:20px; background:#f9f9f9; border-radius:10px; margin-top:15px;">
                <div style="margin-bottom:15px;">
                    <strong style="font-size:1.2rem; color:#2E3135;">${booking.airline}</strong>
                    <span style="color:#666; margin-left:10px;">${booking.flight_number}</span>
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin:20px 0;">
                    <div style="text-align:center;">
                        <div style="font-size:1.5rem; font-weight:700; color:#2E3135;">${booking.departure_time}</div>
                        <div style="font-size:1rem; color:#666;">${booking.origin_code}</div>
                        <div style="font-size:0.85rem; color:#999;">${booking.origin.split(',')[0]}</div>
                    </div>
                    
                    <div style="flex:1; text-align:center; color:#d4af37;">
                        <i class="fas fa-plane" style="font-size:1.2rem;"></i>
                        <div style="font-size:0.85rem; margin-top:5px;">${Math.floor(booking.duration_minutes / 60)}h ${booking.duration_minutes % 60}m</div>
                    </div>
                    
                    <div style="text-align:center;">
                        <div style="font-size:1.5rem; font-weight:700; color:#2E3135;">${booking.arrival_time}</div>
                        <div style="font-size:1rem; color:#666;">${booking.destination_code}</div>
                        <div style="font-size:0.85rem; color:#999;">${booking.destination.split(',')[0]}</div>
                    </div>
                </div>
                
                <div style="border-top:1px solid #e0e0e0; padding-top:15px; margin-top:15px;">
                    <p style="margin:8px 0; display:flex; justify-content:space-between;">
                        <span style="color:#666;">Seat Class:</span>
                        <strong>${booking.seat_class}</strong>
                    </p>
                    <p style="margin:8px 0; display:flex; justify-content:space-between;">
                        <span style="color:#666;">Stops:</span>
                        <strong>${booking.stops === 'direct' ? 'Direct' : booking.stops.replace('stop', ' Stop')}</strong>
                    </p>
                </div>
                
                <div style="border-top:2px solid #e0e0e0; padding-top:15px; margin-top:15px;">
                    <p style="margin:8px 0; display:flex; justify-content:space-between;">
                        <span>Base Fare:</span>
                        <span>₱${parseFloat(booking.base_price).toLocaleString('en-PH', {minimumFractionDigits: 2})}</span>
                    </p>
                   <p style="margin:8px 0; display:flex; justify-content:space-between;">
                        <span>Seat Upgrade:</span>
                        <span>₱${parseInt(booking.seat_price).toLocaleString('en-PH', {minimumFractionDigits: 2})}</span>
                    </p>
                    <p style="margin:8px 0; display:flex; justify-content:space-between;">
                        <span>Taxes & Fees:</span>
                        <span>₱${parseFloat(booking.taxes).toLocaleString('en-PH', {minimumFractionDigits: 2})}</span>
                    </p>
                    
                    <p style="margin:15px 0 0 0; display:flex; justify-content:space-between; font-size:1.3rem;">
                        <strong style="color:#2E3135;">Total Amount:</strong>
                        <strong style="color:#d4af37;">₱${parseFloat(booking.total_price).toLocaleString('en-PH', {minimumFractionDigits: 2})}</strong>
                    </p>
                </div>
            </div>
        `;
    }
}

function setupPaymentForm(booking) {
    const paymentForm = document.getElementById('paymentForm');
    if (!paymentForm) return;
    
    paymentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCVV = document.getElementById('cardCVV').value;
        
        // Validation
        if (!fullName || !email) {
            alert('Please fill in all required passenger information');
            return;
        }
        
        if (!validateEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        if (!cardNumber || cardNumber.length < 13) {
            alert('Please enter a valid card number (13-16 digits)');
            return;
        }
        
        if (!cardExpiry || !cardExpiry.match(/^\d{2}\/\d{2}$/)) {
            alert('Please enter expiry in MM/YY format');
            return;
        }
        
        if (!cardCVV || cardCVV.length < 3) {
            alert('Please enter a valid CVV (3 digits)');
            return;
        }
        
        // Disable submit button
        const submitBtn = paymentForm.querySelector('.payment-btn');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Payment...';
        submitBtn.disabled = true;
        
        try {
            // Step 1: Create booking
            const bookingData = new FormData();
            bookingData.append('flight_id', booking.flight_id);
            bookingData.append('passenger_name', fullName);
            bookingData.append('passenger_email', email);
            bookingData.append('passenger_phone', phone);
            bookingData.append('seat_class', booking.seat_class);
            
            const bookingResponse = await fetch('create_booking.php', {
                method: 'POST',
                body: bookingData
            });
            
            const bookingResult = await bookingResponse.json();
            
            if (!bookingResult.success) {
                throw new Error(bookingResult.message);
            }
            
            // Step 2: Process payment
            const paymentData = new FormData();
            paymentData.append('booking_reference', bookingResult.data.booking_reference);
            paymentData.append('card_number', cardNumber);
            paymentData.append('card_expiry', cardExpiry);
            paymentData.append('card_cvv', cardCVV);
            
            const paymentResponse = await fetch('process_payment.php', {
                method: 'POST',
                body: paymentData
            });
            
            const paymentResult = await paymentResponse.json();
            
            if (paymentResult.success) {
                // Store confirmation data
                const confirmationData = {
                    ...booking,
                    passenger_name: fullName,
                    passenger_email: email,
                    passenger_phone: phone,
                    booking_reference: paymentResult.data.booking_reference,
                    transaction_id: paymentResult.data.transaction_id,
                    payment_date: new Date().toISOString()
                };
                
                localStorage.setItem('confirmationData', JSON.stringify(confirmationData));
                
                // Redirect to confirmation
                window.location.href = 'confirmation.html';
            } else {
                throw new Error(paymentResult.message);
            }
            
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Payment failed. Please try again.');
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }
    });
    
    // Auto-format card number
    document.getElementById('cardNumber').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
        e.target.value = value;
    });
    
    // Auto-format expiry
    document.getElementById('cardExpiry').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });
    
    // Only numbers for CVV
    document.getElementById('cardCVV').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}