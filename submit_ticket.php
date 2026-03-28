<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = sanitize_input($_POST['name']);
    $email = sanitize_input($_POST['email']);
    $subject = sanitize_input($_POST['subject']);
    $message = sanitize_input($_POST['message']);
    
    // Validation
    if (empty($name)) {
        json_response(false, "Name is required");
    }
    
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_response(false, "Valid email is required");
    }
    
    if (empty($subject)) {
        json_response(false, "Subject is required");
    }
    
    if (empty($message)) {
        json_response(false, "Message is required");
    }
    
    $conn = getDBConnection();
    
    // Generate ticket number
    $ticket_number = generate_ticket_number();
    
    // Get user ID if logged in
    $user_id = get_current_user_id();
    
    // Insert support ticket
    $sql = "INSERT INTO support_tickets (user_id, ticket_number, name, email, subject, message) 
            VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isssss", $user_id, $ticket_number, $name, $email, $subject, $message);
    
    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
        json_response(true, "Support ticket submitted successfully", [
            'ticket_number' => $ticket_number
        ]);
    } else {
        $stmt->close();
        $conn->close();
        json_response(false, "Failed to submit ticket. Please try again.");
    }
}
?>