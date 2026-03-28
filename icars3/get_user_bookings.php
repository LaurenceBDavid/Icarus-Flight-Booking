<?php
require_once 'config.php';

// Check if user is logged in
if (!is_logged_in()) {
    json_response(false, "Please login to view bookings");
}

$user_id = get_current_user_id();
$conn = getDBConnection();

// Get user's bookings with flight details
$sql = "SELECT 
            b.booking_id,
            b.booking_reference,
            b.passenger_name,
            b.passenger_email,
            b.passenger_phone,
            b.seat_class,
            b.total_price,
            b.booking_status,
            b.payment_status,
            b.booking_date,
            f.flight_number,
            f.airline,
            f.origin,
            f.origin_code,
            f.destination,
            f.destination_code,
            f.departure_time,
            f.arrival_time,
            f.duration_minutes
        FROM bookings b
        INNER JOIN flights f ON b.flight_id = f.flight_id
        WHERE b.user_id = ?
        ORDER BY b.booking_date DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$bookings = [];
while ($row = $result->fetch_assoc()) {
    // Format times
    $row['departure_time'] = date('H:i', strtotime($row['departure_time']));
    $row['arrival_time'] = date('H:i', strtotime($row['arrival_time']));
    
    $bookings[] = $row;
}

$stmt->close();
$conn->close();

if (empty($bookings)) {
    json_response(true, "No bookings found", []);
}

json_response(true, "Bookings retrieved successfully", $bookings);
?>