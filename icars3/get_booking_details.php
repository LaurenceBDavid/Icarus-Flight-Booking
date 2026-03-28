<?php
require_once 'config.php';

if (!is_logged_in()) {
    json_response(false, "Please login to view booking details");
}

$booking_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($booking_id <= 0) {
    json_response(false, "Invalid booking ID");
}

$user_id = get_current_user_id();
$conn = getDBConnection();

// Get booking details (ensure it belongs to the logged-in user)
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
            f.duration_minutes,
            f.aircraft_type
        FROM bookings b
        INNER JOIN flights f ON b.flight_id = f.flight_id
        WHERE b.booking_id = ? AND b.user_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $booking_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    $conn->close();
    json_response(false, "Booking not found");
}

$booking = $result->fetch_assoc();

// Format times
$booking['departure_time'] = date('H:i', strtotime($booking['departure_time']));
$booking['arrival_time'] = date('H:i', strtotime($booking['arrival_time']));

$stmt->close();
$conn->close();

json_response(true, "Booking details retrieved", $booking);
?>