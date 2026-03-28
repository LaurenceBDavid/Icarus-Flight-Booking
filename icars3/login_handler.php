<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = sanitize_input($_POST['email']);
    $password = $_POST['password'];
    
    // Validation - DON'T validate email format, accept username too
    if (empty($email)) {
        json_response(false, "Email/Username is required");
    }
    
    if (empty($password)) {
        json_response(false, "Password is required");
    }
    
    $conn = getDBConnection();
    
    // Check for admin login (username: admin, password: 123)
    if ($email === 'admin' && $password === '123') {
        // Admin login - check if admin user exists in database
        $admin_sql = "SELECT user_id, full_name, email, is_admin FROM users WHERE email = 'admin' OR full_name = 'Administrator'";
        $admin_result = $conn->query($admin_sql);
        
        if ($admin_result->num_rows === 0) {
            // Create admin user if doesn't exist
            $admin_name = 'Administrator';
            $admin_email = 'admin';
            $hashed_password = password_hash('123', PASSWORD_DEFAULT);
            
            $insert_sql = "INSERT INTO users (full_name, email, password, is_admin) VALUES (?, ?, ?, 1)";
            $insert_stmt = $conn->prepare($insert_sql);
            $insert_stmt->bind_param("sss", $admin_name, $admin_email, $hashed_password);
            $insert_stmt->execute();
            $admin_id = $conn->insert_id;
            $insert_stmt->close();
        } else {
            $admin_data = $admin_result->fetch_assoc();
            $admin_id = $admin_data['user_id'];
            $admin_name = $admin_data['full_name'];
            $admin_email = $admin_data['email'];
        }
        
        // Set admin session
        $_SESSION['user_id'] = $admin_id;
        $_SESSION['user_name'] = $admin_name;
        $_SESSION['user_email'] = $admin_email;
        $_SESSION['is_admin'] = true;
        
        $conn->close();
        json_response(true, "Admin login successful", ['redirect' => 'admin.html']);
    }
    
    // Regular user login - accept both email and username
    // Try to find user by email OR username
    $sql = "SELECT user_id, full_name, email, password, is_admin FROM users WHERE email = ? OR full_name = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $email, $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        $stmt->close();
        $conn->close();
        json_response(false, "Invalid email/username or password");
    }
    
    $user = $result->fetch_assoc();
    $stmt->close();
    $conn->close();
    
    // Verify password
    if (password_verify($password, $user['password'])) {
        // Set session
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['user_name'] = $user['full_name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['is_admin'] = isset($user['is_admin']) && $user['is_admin'] == 1;
        
        // Redirect based on admin status
        if ($_SESSION['is_admin']) {
            json_response(true, "Admin login successful", ['redirect' => 'admin.html']);
        } else {
            json_response(true, "Login successful", ['redirect' => 'index.html']);
        }
    } else {
        json_response(false, "Invalid email/username or password");
    }
}
?>