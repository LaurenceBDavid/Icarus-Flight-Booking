<?php
// FILE 4: admin_get_flight.php
require_once 'config.php';

if (!isset($_GET['id'])) {
    json_response(false, "Flight ID required");
}

$flight_id = intval($_GET['id']);
$conn = getDBConnection();

$sql = "SELECT * FROM flights WHERE flight_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $flight_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    $conn->close();
    json_response(false, "Flight not found");
}

$flight = $result->fetch_assoc();
$stmt->close();
$conn->close();

json_response(true, "Flight retrieved", $flight);
?>