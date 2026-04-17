<?php
// db_config.php - Phiten CRM Database Configuration

define('DB_HOST', 'localhost');
define('DB_USER', 'your_mysql_username'); // Thay bằng Username của Hostinger
define('DB_PASS', 'your_mysql_password'); // Thay bằng Password của Hostinger
define('DB_NAME', 'your_db_name');        // Thay bằng Tên Database đã tạo

// API Security Key - Hãy copy key này vào file .env hoặc hằng số trong React
define('API_KEY', 'PhitenCRM_Secure_Key_2026'); 

function get_db_connection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
    }
    
    $conn->set_charset("utf8mb4");
    return $conn;
}
?>
