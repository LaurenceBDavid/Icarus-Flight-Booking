<?php
// FILE 2: admin_get_bookings.php
require_once 'config.php';

$conn = getDBConnection();

$sql = "SELECT b.booking_id, b.booking_reference, b.passenger_name, b.passenger_email, 
        b.total_price, b.booking_status, b.booking_date,
        f.flight_number, f.airline
        FROM bookings b
        INNER JOIN flights f ON b.flight_id = f.flight_id
        ORDER BY b.booking_date DESC";

$result = $conn->query($sql);

$bookings = [];
while ($row = $result->fetch_assoc()) {
    $bookings[] = $row;
}

$conn->close();

json_response(true, "Bookings retrieved", $bookings);
?>

<?php