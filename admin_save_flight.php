<?php
// CRITICAL: Suppress ALL errors and warnings
error_reporting(0);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);

// Start output buffering FIRST
ob_start();

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Clear any buffered output
while (ob_get_level() > 1) {
    ob_end_clean();
}

// Set JSON header
header('Content-Type: application/json; charset=utf-8');

// Function to safely output JSON and exit
function jsonResponse($success, $message, $data = null) {
    while (ob_get_level()) {
        ob_end_clean();
    }
    ob_start();
    
    $response = ['success' => $success, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response);
    ob_end_flush();
    exit;
}

// Debug: Log session info (remove this after debugging)
// error_log('Session ID: ' . session_id());
// error_log('User ID: ' . ($_SESSION['user_id'] ?? 'not set'));
// error_log('Role: ' . ($_SESSION['role'] ?? 'not set'));

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id'])) {
    jsonResponse(false, 'Session expired. Please login again.');
}

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    jsonResponse(false, 'Admin access required. Your role: ' . ($_SESSION['role'] ?? 'none'));
}

// Include database connection
if (file_exists('db_connection.php')) {
    require_once 'db_connection.php';
} else {
    jsonResponse(false, 'Database configuration file not found');
}

// Check database connection
if (!isset($conn) || $conn->connect_error) {
    jsonResponse(false, 'Database connection failed');
}

try {
    // Get and sanitize form data
    $flight_id = isset($_POST['flight_id']) && $_POST['flight_id'] !== '' ? intval($_POST['flight_id']) : null;
    $flight_number = isset($_POST['flight_number']) ? trim($_POST['flight_number']) : '';
    $airline = isset($_POST['airline']) ? trim($_POST['airline']) : '';
    $origin = isset($_POST['origin']) ? trim($_POST['origin']) : '';
    $origin_code = isset($_POST['origin_code']) ? strtoupper(trim($_POST['origin_code'])) : '';
    $destination = isset($_POST['destination']) ? trim($_POST['destination']) : '';
    $destination_code = isset($_POST['destination_code']) ? strtoupper(trim($_POST['destination_code'])) : '';
    $departure_time = isset($_POST['departure_time']) ? trim($_POST['departure_time']) : '';
    $arrival_time = isset($_POST['arrival_time']) ? trim($_POST['arrival_time']) : '';
    $duration_minutes = isset($_POST['duration_minutes']) ? intval($_POST['duration_minutes']) : 0;
    $price = isset($_POST['price']) ? floatval($_POST['price']) : 0;
    $available_seats = isset($_POST['available_seats']) ? intval($_POST['available_seats']) : 0;
    $flight_class = isset($_POST['flight_class']) ? trim($_POST['flight_class']) : 'Economy';
    $stops = isset($_POST['stops']) ? trim($_POST['stops']) : 'direct';
    $aircraft_type = isset($_POST['aircraft_type']) ? trim($_POST['aircraft_type']) : '';
    $status = isset($_POST['status']) ? trim($_POST['status']) : 'active';

    // Validate required fields
    if (empty($flight_number)) {
        jsonResponse(false, 'Flight number is required');
    }
    if (empty($airline)) {
        jsonResponse(false, 'Airline is required');
    }
    if (empty($origin) || empty($origin_code)) {
        jsonResponse(false, 'Origin city and code are required');
    }
    if (empty($destination) || empty($destination_code)) {
        jsonResponse(false, 'Destination city and code are required');
    }
    if (empty($departure_time)) {
        jsonResponse(false, 'Departure time is required');
    }
    if (empty($arrival_time)) {
        jsonResponse(false, 'Arrival time is required');
    }
    if ($price <= 0) {
        jsonResponse(false, 'Price must be greater than 0');
    }

    // Determine if UPDATE or INSERT
    if ($flight_id && $flight_id > 0) {
        // UPDATE existing flight
        $sql = "UPDATE flights SET 
                flight_number = ?,
                airline = ?,
                origin = ?,
                origin_code = ?,
                destination = ?,
                destination_code = ?,
                departure_time = ?,
                arrival_time = ?,
                duration_minutes = ?,
                price = ?,
                available_seats = ?,
                flight_class = ?,
                stops = ?,
                aircraft_type = ?,
                status = ?
                WHERE flight_id = ?";
        
        $stmt = mysqli_prepare($conn, $sql);
        
        if (!$stmt) {
            jsonResponse(false, 'Database prepare failed: ' . mysqli_error($conn));
        }
        
        // Bind 16 parameters (15 SET + 1 WHERE)
        mysqli_stmt_bind_param(
            $stmt,
            'ssssssssidissssi',
            $flight_number,
            $airline,
            $origin,
            $origin_code,
            $destination,
            $destination_code,
            $departure_time,
            $arrival_time,
            $duration_minutes,
            $price,
            $available_seats,
            $flight_class,
            $stops,
            $aircraft_type,
            $status,
            $flight_id
        );
        
        $message = 'Flight updated successfully';
        
    } else {
        // INSERT new flight
        $sql = "INSERT INTO flights (
                flight_number, airline, origin, origin_code,
                destination, destination_code, departure_time, arrival_time,
                duration_minutes, price, available_seats, flight_class,
                stops, aircraft_type, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = mysqli_prepare($conn, $sql);
        
        if (!$stmt) {
            jsonResponse(false, 'Database prepare failed: ' . mysqli_error($conn));
        }
        
        // Bind 15 parameters for INSERT
        mysqli_stmt_bind_param(
            $stmt,
            'ssssssssidissss',
            $flight_number,
            $airline,
            $origin,
            $origin_code,
            $destination,
            $destination_code,
            $departure_time,
            $arrival_time,
            $duration_minutes,
            $price,
            $available_seats,
            $flight_class,
            $stops,
            $aircraft_type,
            $status
        );
        
        $message = 'Flight added successfully';
    }

    // Execute the statement
    if (!mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);
        jsonResponse(false, 'Database execution failed: ' . mysqli_stmt_error($stmt));
    }

    mysqli_stmt_close($stmt);
    mysqli_close($conn);
    
    jsonResponse(true, $message);

} catch (Exception $e) {
    jsonResponse(false, 'Error: ' . $e->getMessage());
} catch (Error $e) {
    jsonResponse(false, 'Fatal error: ' . $e->getMessage());
}
?>