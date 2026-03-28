<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $from = isset($_GET['from']) ? sanitize_input($_GET['from']) : '';
    $to = isset($_GET['to']) ? sanitize_input($_GET['to']) : '';
    
    // Extract airport codes from input (e.g., "Manila (MNL)" -> "MNL")
    preg_match('/\(([A-Z]{3})\)/', $from, $from_matches);
    preg_match('/\(([A-Z]{3})\)/', $to, $to_matches);
    
    $origin_code = isset($from_matches[1]) ? $from_matches[1] : '';
    $destination_code = isset($to_matches[1]) ? $to_matches[1] : '';
    
    if (empty($origin_code) || empty($destination_code)) {
        json_response(false, "Please select valid origin and destination");
    }
    
    $conn = getDBConnection();
    
    // Search flights
    $sql = "SELECT flight_id, flight_number, airline, origin, origin_code, 
            destination, destination_code, departure_time, arrival_time, 
            duration_minutes, price, available_seats, flight_class, stops, 
            aircraft_type, status 
            FROM flights 
            WHERE origin_code = ? 
            AND destination_code = ? 
            AND status = 'active' 
            AND available_seats > 0
            ORDER BY departure_time ASC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $origin_code, $destination_code);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $flights = [];
    while ($row = $result->fetch_assoc()) {
        // Format time for display
        $departure = date('H:i', strtotime($row['departure_time']));
        $arrival = date('H:i', strtotime($row['arrival_time']));
        
        // Determine time category
        $hour = (int)date('H', strtotime($row['departure_time']));
        if ($hour >= 0 && $hour < 6) {
            $time_category = 'early';
        } elseif ($hour >= 6 && $hour < 12) {
            $time_category = 'morning';
        } elseif ($hour >= 12 && $hour < 18) {
            $time_category = 'afternoon';
        } else {
            $time_category = 'night';
        }
        
        $row['departure_display'] = $departure;
        $row['arrival_display'] = $arrival;
        $row['time_category'] = $time_category;
        $row['times'] = $departure . ' → ' . $arrival;
        
        $flights[] = $row;
    }
    
    $stmt->close();
    $conn->close();
    
    if (empty($flights)) {
        json_response(false, "No flights found for this route");
    }
    
    json_response(true, "Flights found", $flights);
}
?>