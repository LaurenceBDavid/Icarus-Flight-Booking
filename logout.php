<?php
require_once 'config.php';

// Destroy session
session_unset();
session_destroy();

json_response(true, "Logged out successfully");
?>