<?php
// FILE 1: admin_get_flights.php
require_once 'config.php';

$conn = getDBConnection();

$sql = "SELECT flight_id, flight_number, airline, origin, origin_code, destination, 
        destination_code, departure_time, arrival_time, duration_minutes, price, 
        available_seats, flight_class, stops, aircraft_type, status 
        FROM flights 
        ORDER BY departure_time ASC";

$result = $conn->query($sql);

$flights = [];
while ($row = $result->fetch_assoc()) {
    $flights[] = $row;
}

$conn->close();

json_response(true, "Flights retrieved", $flights);
?>

<?php