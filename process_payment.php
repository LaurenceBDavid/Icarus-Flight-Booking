<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $booking_reference = sanitize_input($_POST['booking_reference']);
    $card_number = sanitize_input($_POST['card_number']);
    $card_expiry = sanitize_input($_POST['card_expiry']);
    $card_cvv = sanitize_input($_POST['card_cvv']);
    
    // Validation
    if (empty($booking_reference)) {
        json_response(false, "Booking reference is required");
    }
    
    if (empty($card_number) || strlen($card_number) < 13) {
        json_response(false, "Valid card number is required");
    }
    
    if (empty($card_expiry) || !preg_match('/^\d{2}\/\d{2}$/', $card_expiry)) {
        json_response(false, "Valid expiry date (MM/YY) is required");
    }
    
    if (empty($card_cvv) || strlen($card_cvv) < 3) {
        json_response(false, "Valid CVV is required");
    }
    
    $conn = getDBConnection();
    
    // Get booking details
    $booking_sql = "SELECT booking_id, total_price, booking_status, payment_status 
                    FROM bookings WHERE booking_reference = ?";
    $booking_stmt = $conn->prepare($booking_sql);
    $booking_stmt->bind_param("s", $booking_reference);
    $booking_stmt->execute();
    $booking_result = $booking_stmt->get_result();
    
    if ($booking_result->num_rows === 0) {
        $booking_stmt->close();
        $conn->close();
        json_response(false, "Booking not found");
    }
    
    $booking = $booking_result->fetch_assoc();
    $booking_stmt->close();
    
    // Check if already paid
    if ($booking['payment_status'] === 'completed') {
        $conn->close();
        json_response(false, "This booking has already been paid");
    }
    
    // Simulate payment processing (In production, integrate with real payment gateway)
    $card_last_four = substr($card_number, -4);
    $transaction_id = 'TXN' . strtoupper(substr(md5(uniqid(rand(), true)), 0, 12));
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Insert payment record
        $payment_sql = "INSERT INTO payments (booking_id, amount, payment_method, card_last_four, 
                        payment_status, transaction_id) 
                        VALUES (?, ?, 'credit_card', ?, 'completed', ?)";
        $payment_stmt = $conn->prepare($payment_sql);
        $payment_stmt->bind_param("idss", $booking['booking_id'], $booking['total_price'], 
                                   $card_last_four, $transaction_id);
        $payment_stmt->execute();
        $payment_stmt->close();
        
        // Update booking status
        $update_sql = "UPDATE bookings SET booking_status = 'confirmed', payment_status = 'completed' 
                       WHERE booking_id = ?";
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->bind_param("i", $booking['booking_id']);
        $update_stmt->execute();
        $update_stmt->close();
        
        $conn->commit();
        $conn->close();
        
        json_response(true, "Payment successful", [
            'transaction_id' => $transaction_id,
            'booking_reference' => $booking_reference,
            'redirect' => 'booking_success.html?ref=' . $booking_reference
        ]);
        
    } catch (Exception $e) {
        $conn->rollback();
        $conn->close();
        json_response(false, "Payment processing failed. Please try again.");
    }
}
?>