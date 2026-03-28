<?php
require_once 'config.php';

$response = [
    'logged_in' => false,
    'user_id' => null,
    'user_name' => null,
    'user_email' => null
];

if (is_logged_in()) {
    $response['logged_in'] = true;
    $response['user_id'] = $_SESSION['user_id'];
    $response['user_name'] = $_SESSION['user_name'];
    $response['user_email'] = $_SESSION['user_email'];
}

header('Content-Type: application/json');
echo json_encode($response);
?>