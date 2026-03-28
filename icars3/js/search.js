// Enhanced Flight Search Handler
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fromInput = document.getElementById('fromInput').value;
            const toInput = document.getElementById('toInput').value;
            
            if (!fromInput || !toInput) {
                alert('Please select both origin and destination');
                return;
            }
            
            if (fromInput === toInput) {
                alert('Origin and destination cannot be the same');
                return;
            }
            
            const submitBtn = bookingForm.querySelector('.view-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Searching...';
            submitBtn.disabled = true;
            
            try {
                const params = new URLSearchParams({
                    from: fromInput,
                    to: toInput
                });
                
                const response = await fetch(`search_flights.php?${params}`);
                const result = await response.json();
                
                if (result.success && result.data) {
                    sessionStorage.setItem('searchResults', JSON.stringify(result.data));
                    sessionStorage.setItem('searchFrom', fromInput);
                    sessionStorage.setItem('searchTo', toInput);
                    window.location.href = 'result.html';
                } else {
                    alert(result.message || 'No flights found');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while searching. Please try again.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});

// Load and display results on result.html
if (window.location.pathname.includes('result.html')) {
    window.addEventListener('DOMContentLoaded', function() {
        const searchResults = sessionStorage.getItem('searchResults');
        const searchFrom = sessionStorage.getItem('searchFrom');
        const searchTo = sessionStorage.getItem('searchTo');
        
        if (!searchResults) {
            document.getElementById('loadingState').style.display = 'none';
            document.getElementById('noResults').style.display = 'flex';
            return;
        }
        
        const flights = JSON.parse(searchResults);
        
        setTimeout(() => {
            displayFlights(flights, searchFrom, searchTo);
            document.getElementById('loadingState').style.display = 'none';
        }, 800);
    });
}

function displayFlights(flights, from, to) {
    const flightList = document.getElementById('flight-list');
    const resultsTitle = document.getElementById('resultsTitle');
    const flightCount = document.getElementById('flightCount');
    const routeInfo = document.getElementById('routeInfo');
    const breadcrumb = document.getElementById('routeBreadcrumb');
    
    // Update header info
    const fromCity = from ? from.split('(')[0].trim() : '';
    const toCity = to ? to.split('(')[0].trim() : '';
    
    if (resultsTitle) resultsTitle.textContent = `Flights to ${toCity}`;
    if (flightCount) flightCount.textContent = `${flights.length} flight${flights.length !== 1 ? 's' : ''} found`;
    if (routeInfo) routeInfo.textContent = `${fromCity} → ${toCity}`;
    if (breadcrumb) breadcrumb.textContent = `${fromCity} to ${toCity}`;
    
    if (!flightList) return;
    
    flightList.innerHTML = '';
    
    if (flights.length === 0) {
        document.getElementById('noResults').style.display = 'flex';
        return;
    }
    
    flights.forEach(flight => {
        const flightCard = createFlightCard(flight);
        flightList.appendChild(flightCard);
    });
    
    // Generate dynamic airline filters
    generateAirlineFilters(flights);
    updateFilterCounts(flights);
    initializeFilters();
    initializeSorting();
    initializePriceSliders(flights);
    initializeViewToggle();
}

function createFlightCard(flight) {
    const div = document.createElement('div');
    div.className = 'flight-card2';
    div.dataset.price = flight.price;
    div.dataset.duration = flight.duration_minutes;
    div.dataset.airline = flight.airline.toLowerCase().replace(/\s+/g, '');
    div.dataset.stop = flight.stops;
    div.dataset.time = flight.time_category;
    div.dataset.flightId = flight.flight_id;
    
    const duration = `${Math.floor(flight.duration_minutes / 60)}h ${flight.duration_minutes % 60}m`;
    const stopText = flight.stops === 'direct' ? 'Direct' : flight.stops.replace('stop', ' Stop').replace('1 ', '1 ');
    
    div.innerHTML = `
        <div class="flight-card2-header">
            <div class="airline-info">
                <div class="airline-logo-circle">
                    <i class="fas fa-plane"></i>
                </div>
                <div>
                    <h3>${flight.airline}</h3>
                    <p class="flight-number">${flight.flight_number}</p>
                </div>
            </div>
            <div class="flight-badge ${flight.stops === 'direct' ? 'badge-direct' : 'badge-stop'}">
                ${stopText}
            </div>
        </div>
        
        <div class="flight-card2-body">
            <div class="flight-times">
                <div class="time-block">
                    <div class="time-large">${flight.departure_display}</div>
                    <div class="location-code">${flight.origin_code}</div>
                    <div class="location-name">${flight.origin.split(',')[0]}</div>
                </div>
                
                <div class="flight-duration">
                    <i class="fas fa-clock"></i>
                    <span>${duration}</span>
                    <div class="flight-line">
                        <div class="flight-line-bar"></div>
                        <i class="fas fa-plane"></i>
                    </div>
                </div>
                
                <div class="time-block">
                    <div class="time-large">${flight.arrival_display}</div>
                    <div class="location-code">${flight.destination_code}</div>
                    <div class="location-name">${flight.destination.split(',')[0]}</div>
                </div>
            </div>
        </div>
        
        <div class="flight-card2-footer">
            <div class="flight-details-mini">
                <span><i class="fas fa-chair"></i> ${flight.available_seats} seats left</span>
                <span><i class="fas fa-layer-group"></i> ${flight.flight_class}</span>
            </div>
            <div class="flight-price-action">
                <div class="price-info">
                    <span class="price-label">Total Price</span>
                    <span class="price-amount">₱${parseFloat(flight.price).toLocaleString()}</span>
                </div>
                <button class="btn-select" onclick="selectFlight(${flight.flight_id})">
    <i class="fas fa-lock"></i> Select Flight </i>
</button>
            </div>
        </div>
    `;
    
    return div;
}

function generateAirlineFilters(flights) {
    const airlines = [...new Set(flights.map(f => f.airline))];
    const container = document.getElementById('airlineFilters');
    
    if (container) {
        container.innerHTML = airlines.map(airline => {
            const value = airline.toLowerCase().replace(/\s+/g, '');
            return `
                <label>
                    <input type="checkbox" class="filter-airline" value="${value}">
                    ${airline}
                    <span class="filter-count" data-filter="${value}">0</span>
                </label>
            `;
        }).join('');
    }
}

function updateFilterCounts(flights) {
    // Update stop counts
    const directCount = flights.filter(f => f.stops === 'direct').length;
    const oneStopCount = flights.filter(f => f.stops === '1stop').length;
    
    updateCount('direct', directCount);
    updateCount('1stop', oneStopCount);
    
    // Update time counts
    ['early', 'morning', 'afternoon', 'night'].forEach(time => {
        const count = flights.filter(f => f.time_category === time).length;
        updateCount(time, count);
    });
    
    // Update airline counts
    flights.forEach(flight => {
        const airlineValue = flight.airline.toLowerCase().replace(/\s+/g, '');
        const count = flights.filter(f => f.airline.toLowerCase().replace(/\s+/g, '') === airlineValue).length;
        updateCount(airlineValue, count);
    });
}

function updateCount(filter, count) {
    const element = document.querySelector(`[data-filter="${filter}"]`);
    if (element) {
        element.textContent = count;
    }
}

function initializePriceSliders(flights) {
    const prices = flights.map(f => parseFloat(f.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    const minSlider = document.getElementById('minPrice');
    const maxSlider = document.getElementById('maxPrice');
    const minLabel = document.getElementById('minPriceLabel');
    const maxLabel = document.getElementById('maxPriceLabel');
    
    if (minSlider && maxSlider) {
        minSlider.min = minPrice;
        minSlider.max = maxPrice;
        minSlider.value = minPrice;
        
        maxSlider.min = minPrice;
        maxSlider.max = maxPrice;
        maxSlider.value = maxPrice;
        
        minLabel.textContent = `₱${Math.floor(minPrice).toLocaleString()}`;
        maxLabel.textContent = `₱${Math.floor(maxPrice).toLocaleString()}`;
        
        minSlider.addEventListener('input', function() {
            if (parseInt(this.value) > parseInt(maxSlider.value)) {
                this.value = maxSlider.value;
            }
            minLabel.textContent = `₱${parseInt(this.value).toLocaleString()}`;
            applyFilters();
        });
        
        maxSlider.addEventListener('input', function() {
            if (parseInt(this.value) < parseInt(minSlider.value)) {
                this.value = minSlider.value;
            }
            maxLabel.textContent = `₱${parseInt(this.value).toLocaleString()}`;
            applyFilters();
        });
    }
}

// REPLACE the existing selectFlight function with this protected version
async function selectFlight(flightId) {
    // Check authentication first
    try {
        const response = await fetch('check_session.php');
        const result = await response.json();
        
        if (!result.logged_in) {
            // User not logged in
            if (confirm('You need to login to book a flight. Would you like to login now?')) {
                // Store intended flight for after login
                sessionStorage.setItem('intendedFlightId', flightId);
                window.location.href = 'login.html';
            }
            return;
        }
        
        // User is authenticated - proceed with flight selection
        const searchResults = JSON.parse(sessionStorage.getItem('searchResults'));
        const selectedFlight = searchResults.find(f => f.flight_id == flightId);
        
        if (selectedFlight) {
            localStorage.setItem('selectedFlight', JSON.stringify(selectedFlight));
            window.location.href = 'flightdetails.html';
        } else {
            alert('Flight not found. Please try again.');
        }
        
    } catch (error) {
        console.error('Error checking authentication:', error);
        alert('Please login to continue booking');
        window.location.href = 'login.html';
    }
}

// Make function globally accessible
window.selectFlight = selectFlight;

function initializeFilters() {
    const filterInputs = document.querySelectorAll('.filter-stop, .filter-airline, .filter-time');
    filterInputs.forEach(input => {
        input.addEventListener('change', applyFilters);
    });
}

function applyFilters() {
    const stopFilters = Array.from(document.querySelectorAll('.filter-stop:checked')).map(e => e.value);
    const airlineFilters = Array.from(document.querySelectorAll('.filter-airline:checked')).map(e => e.value);
    const timeFilters = Array.from(document.querySelectorAll('.filter-time:checked')).map(e => e.value);
    
    const minPrice = parseInt(document.getElementById('minPrice')?.value || 0);
    const maxPrice = parseInt(document.getElementById('maxPrice')?.value || 999999);
    
    let visibleCount = 0;
    
    document.querySelectorAll('.flight-card2').forEach(card => {
        const cardStop = card.dataset.stop;
        const cardAirline = card.dataset.airline;
        const cardTime = card.dataset.time;
        const cardPrice = parseFloat(card.dataset.price);
        
        const matchStop = stopFilters.length === 0 || stopFilters.includes(cardStop);
        const matchAirline = airlineFilters.length === 0 || airlineFilters.includes(cardAirline);
        const matchTime = timeFilters.length === 0 || timeFilters.includes(cardTime);
        const matchPrice = cardPrice >= minPrice && cardPrice <= maxPrice;
        
        if (matchStop && matchAirline && matchTime && matchPrice) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update flight count
    const flightCount = document.getElementById('flightCount');
    if (flightCount) {
        flightCount.textContent = `${visibleCount} flight${visibleCount !== 1 ? 's' : ''} found`;
    }
    
    // Show no results if all filtered out
    const noResults = document.getElementById('noResults');
    if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'flex' : 'none';
    }
}

function clearAllFilters() {
    document.querySelectorAll('.filter-stop, .filter-airline, .filter-time').forEach(input => {
        input.checked = false;
    });
    
    const searchResults = JSON.parse(sessionStorage.getItem('searchResults'));
    if (searchResults) {
        const prices = searchResults.map(f => parseFloat(f.price));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        const minSlider = document.getElementById('minPrice');
        const maxSlider = document.getElementById('maxPrice');
        
        if (minSlider) minSlider.value = minPrice;
        if (maxSlider) maxSlider.value = maxPrice;
        
        document.getElementById('minPriceLabel').textContent = `₱${Math.floor(minPrice).toLocaleString()}`;
        document.getElementById('maxPriceLabel').textContent = `₱${Math.floor(maxPrice).toLocaleString()}`;
    }
    
    applyFilters();
}

function initializeSorting() {
    document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', function() {
            document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const sortType = this.dataset.sort;
            const list = document.getElementById('flight-list');
            const cards = Array.from(list.querySelectorAll('.flight-card2'));
            
            cards.sort((a, b) => {
                if (sortType === 'cheapest') {
                    return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
                } else if (sortType === 'fastest') {
                    return parseInt(a.dataset.duration) - parseInt(b.dataset.duration);
                } else if (sortType === 'earliest') {
                    const timeA = a.querySelector('.time-large').textContent;
                    const timeB = b.querySelector('.time-large').textContent;
                    return timeA.localeCompare(timeB);
                } else if (sortType === 'recommended') {
                    const scoreA = parseFloat(a.dataset.price) / parseInt(a.dataset.duration);
                    const scoreB = parseFloat(b.dataset.price) / parseInt(b.dataset.duration);
                    return scoreA - scoreB;
                }
                return 0;
            });
            
            cards.forEach(card => list.appendChild(card));
        });
    });
}

function initializeViewToggle() {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.dataset.view;
            const flightList = document.getElementById('flight-list');
            
            if (view === 'grid') {
                flightList.classList.add('grid-view');
            } else {
                flightList.classList.remove('grid-view');
            }
        });
    });
}
// Add this at the top of search.js, right after the DOMContentLoaded event

// Protect the selectFlight function - require login
async function selectFlight(flightId) {
    // Check if user is logged in before proceeding
    try {
        const response = await fetch('check_session.php');
        const result = await response.json();
        
        if (!result.logged_in) {
            // User not logged in - show alert and redirect
            alert('Please login to book a flight');
            // Store the intended flight for after login
            sessionStorage.setItem('intendedFlightId', flightId);
            window.location.href = 'login.html';
            return;
        }
        
        // User is logged in - proceed with booking
        const searchResults = JSON.parse(sessionStorage.getItem('searchResults'));
        const selectedFlight = searchResults.find(f => f.flight_id == flightId);
        
        if (selectedFlight) {
            localStorage.setItem('selectedFlight', JSON.stringify(selectedFlight));
            window.location.href = 'flightdetails.html';
        }
    } catch (error) {
        console.error('Error checking auth:', error);
        alert('Please login to book a flight');
        window.location.href = 'login.html';
    }
}

// Make selectFlight globally accessible
window.selectFlight = selectFlight;
// Handle redirect after login (if user was trying to book a flight)
document.addEventListener('DOMContentLoaded', function() {
    const intendedFlightId = sessionStorage.getItem('intendedFlightId');

});