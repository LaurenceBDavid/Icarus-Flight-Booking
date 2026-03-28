<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $flight_id = isset($_POST['flight_id']) ? intval($_POST['flight_id']) : 0;
    $passenger_name = sanitize_input($_POST['passenger_name']);
    $passenger_email = sanitize_input($_POST['passenger_email']);
    $passenger_phone = sanitize_input($_POST['passenger_phone']);
    $seat_class = sanitize_input($_POST['seat_class']);
    
    // Validation
    if ($flight_id <= 0) {
        json_response(false, "Invalid flight selected");
    }
    
    if (empty($passenger_name)) {
        json_response(false, "Passenger name is required");
    }
    
    if (empty($passenger_email) || !filter_var($passenger_email, FILTER_VALIDATE_EMAIL)) {
        json_response(false, "Valid email is required");
    }
    
    $conn = getDBConnection();
    
    // Get flight details
    $flight_sql = "SELECT flight_id, airline, origin, destination, price, available_seats, status 
                   FROM flights WHERE flight_id = ? AND status = 'active'";
    $flight_stmt = $conn->prepare($flight_sql);
    $flight_stmt->bind_param("i", $flight_id);
    $flight_stmt->execute();
    $flight_result = $flight_stmt->get_result();
    
    if ($flight_result->num_rows === 0) {
        $flight_stmt->close();
        $conn->close();
        json_response(false, "Flight not available");
    }
    
    $flight = $flight_result->fetch_assoc();
    $flight_stmt->close();
    
    // Check seat availability
    if ($flight['available_seats'] <= 0) {
        $conn->close();
        json_response(false, "No seats available");
    }
    
    // Calculate total price based on seat class
$base_price = $flight['price'];
$class_multiplier = 1;

switch($seat_class) {
    case 'Premium Economy':
        $class_multiplier = 1.5;
        break;
    case 'Business':
        $class_multiplier = 3;
        break;
    case 'First':
        $class_multiplier = 5;
        break;
}

// Correct order: calculate total price first
$total_final = $base_price * $class_multiplier;

// Then calculate taxes and final total if needed
$taxes = $total_final * 0.12;
$total_price = $total_final + $taxes;

// Use $total_final for saving or return, or just save $total_price depending on your DB
    
    // Get user ID if logged in
    $user_id = get_current_user_id();
    if (!$user_id) {
        // Create guest user
        $user_id = 1; // You can create a guest user or require login
    }
    
    // Generate booking reference
    $booking_reference = generate_booking_reference();
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Insert booking
        $booking_sql = "INSERT INTO bookings (user_id, flight_id, passenger_name, passenger_email, 
                        passenger_phone, seat_class, total_price, booking_reference, booking_status) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')";
        $booking_stmt = $conn->prepare($booking_sql);
        $booking_stmt->bind_param("iissssds", $user_id, $flight_id, $passenger_name, 
                                   $passenger_email, $passenger_phone, $seat_class, 
                                   $total_price, $booking_reference);
        $booking_stmt->execute();
        $booking_id = $conn->insert_id;
        $booking_stmt->close();
        
        // Update available seats
        $update_sql = "UPDATE flights SET available_seats = available_seats - 1 WHERE flight_id = ?";
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->bind_param("i", $flight_id);
        $update_stmt->execute();
        $update_stmt->close();
        
        $conn->commit();
        
        json_response(true, "Booking created successfully", [
            'booking_id' => $booking_id,
            'booking_reference' => $booking_reference,
            'total_price' => $total_price,
            'redirect' => 'payment.html?booking=' . $booking_reference
        ]);
        
    } catch (Exception $e) {
        $conn->rollback();
        $conn->close();
        json_response(false, "Booking failed. Please try again.");
    }
}
?>