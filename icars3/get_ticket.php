<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $ticket_number = isset($_GET['ticket']) ? sanitize_input($_GET['ticket']) : '';
    
    if (empty($ticket_number)) {
        json_response(false, "Ticket number is required");
    }
    
    $conn = getDBConnection();
    
    // Get ticket information
    $sql = "SELECT ticket_id, ticket_number, name, email, subject, message, status, 
            created_at, updated_at 
            FROM support_tickets 
            WHERE ticket_number = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $ticket_number);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        $stmt->close();
        $conn->close();
        json_response(false, "Ticket not found");
    }
    
    $ticket = $result->fetch_assoc();
    $stmt->close();
    $conn->close();
    
    json_response(true, "Ticket found", $ticket);
}
?>