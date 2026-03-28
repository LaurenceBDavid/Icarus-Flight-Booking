<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $full_name = sanitize_input($_POST['full_name']);
    $email = sanitize_input($_POST['email']);
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];

    // Validation
    if (empty($full_name)) json_response(false, "Full name is required");
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) json_response(false, "Valid email is required");
    if (empty($password)) json_response(false, "Password is required");
    if ($password !== $confirm_password) json_response(false, "Passwords do not match");

    $conn = getDBConnection();

    // Check if email exists
    $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        $stmt->close();
        $conn->close();
        json_response(false, "Email already registered");
    }
    $stmt->close();

    // Hash password
    $password_hashed = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $full_name, $email, $password_hashed);
    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
        json_response(true, "Registration successful. You can now login.");
    } else {
        $stmt->close();
        $conn->close();
        json_response(false, "Registration failed. Please try again.");
    }
}
?>
