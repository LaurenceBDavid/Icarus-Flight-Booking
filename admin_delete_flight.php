<?php
// ============================================================================
// FILE 2: admin_delete_flight.php
// Save this as admin_delete_flight.php
// ============================================================================
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, "Invalid request method");
}

$flight_id = intval($_POST['flight_id']);

if ($flight_id <= 0) {
    json_response(false, "Invalid flight ID");
}

$conn = getDBConnection();

// Check if there are bookings for this flight
$check_sql = "SELECT COUNT(*) as count FROM bookings WHERE flight_id = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("i", $flight_id);
$check_stmt->execute();
$check_result = $check_stmt->get_result();
$count = $check_result->fetch_assoc()['count'];
$check_stmt->close();

if ($count > 0) {
    $conn->close();
    json_response(false, "Cannot delete flight with existing bookings. Cancel bookings first.");
}

// Delete flight
$delete_sql = "DELETE FROM flights WHERE flight_id = ?";
$delete_stmt = $conn->prepare($delete_sql);
$delete_stmt->bind_param("i", $flight_id);

if ($delete_stmt->execute()) {
    $delete_stmt->close();
    $conn->close();
    json_response(true, "Flight deleted successfully");
} else {
    $delete_stmt->close();
    $conn->close();
    json_response(false, "Failed to delete flight");
}
?>