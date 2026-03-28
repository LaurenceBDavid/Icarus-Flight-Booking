<?php
// check_admin.php
// This file checks if the user has admin access
// Place this in your root folder (same level as index.html)

require_once 'config.php';

// Check if user is logged in
if (!is_logged_in()) {
    json_response(false, "Please login to access admin panel");
    exit;
}

// Check if user is admin
if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
    json_response(false, "Access denied. Admin privileges required.");
    exit;
}

// Admin access granted
json_response(true, "Admin access granted", [
    'user_name' => $_SESSION['user_name'],
    'user_email' => $_SESSION['user_email'],
    'is_admin' => $_SESSION['is_admin']
]);
?>