<?php
require_once 'config.php';

$conn = getDBConnection();

// Total flights
$flights_sql = "SELECT COUNT(*) as total FROM flights WHERE status = 'active'";
$flights_result = $conn->query($flights_sql);
$total_flights = $flights_result->fetch_assoc()['total'];

// Total bookings
$bookings_sql = "SELECT COUNT(*) as total FROM bookings";
$bookings_result = $conn->query($bookings_sql);
$total_bookings = $bookings_result->fetch_assoc()['total'];

// Total revenue
$revenue_sql = "SELECT SUM(total_price) as total FROM bookings WHERE payment_status = 'completed'";
$revenue_result = $conn->query($revenue_sql);
$total_revenue = $revenue_result->fetch_assoc()['total'] ?? 0;

// Total seats
$seats_sql = "SELECT SUM(available_seats) as total FROM flights WHERE status = 'active'";
$seats_result = $conn->query($seats_sql);
$total_seats = $seats_result->fetch_assoc()['total'];

$conn->close();

$stats = [
    'total_flights' => $total_flights,
    'total_bookings' => $total_bookings,
    'total_revenue' => $total_revenue,
    'total_seats' => $total_seats
];

json_response(true, "Stats retrieved", $stats);
?>