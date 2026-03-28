<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!is_logged_in()) {
        json_response(false, "Please login to cancel booking");
    }
    
    $booking_id = isset($_POST['booking_id']) ? intval($_POST['booking_id']) : 0;
    
    if ($booking_id <= 0) {
        json_response(false, "Invalid booking ID");
    }
    
    $user_id = get_current_user_id();
    $conn = getDBConnection();
    
    // Check if booking belongs to user and can be cancelled
    $check_sql = "SELECT b.booking_id, b.flight_id, b.booking_status 
                  FROM bookings b 
                  WHERE b.booking_id = ? AND b.user_id = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("ii", $booking_id, $user_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows === 0) {
        $check_stmt->close();
        $conn->close();
        json_response(false, "Booking not found");
    }
    
    $booking = $check_result->fetch_assoc();
    $check_stmt->close();
    
    if ($booking['booking_status'] === 'cancelled') {
        $conn->close();
        json_response(false, "Booking is already cancelled");
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Update booking status to cancelled
        $update_sql = "UPDATE bookings SET booking_status = 'cancelled' WHERE booking_id = ?";
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->bind_param("i", $booking_id);
        $update_stmt->execute();
        $update_stmt->close();
        
        // Return seat to available inventory
        $seat_sql = "UPDATE flights SET available_seats = available_seats + 1 WHERE flight_id = ?";
        $seat_stmt = $conn->prepare($seat_sql);
        $seat_stmt->bind_param("i", $booking['flight_id']);
        $seat_stmt->execute();
        $seat_stmt->close();
        
        $conn->commit();
        $conn->close();
        
        json_response(true, "Booking cancelled successfully");
        
    } catch (Exception $e) {
        $conn->rollback();
        $conn->close();
        json_response(false, "Failed to cancel booking. Please try again.");
    }
}
?>