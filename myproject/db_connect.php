<?php
$host = 'localhost';
$dbname = 'billbuddies'; // Your database name
$username = 'root'; // Your database username
$password = ''; // Your database password

// Create connection using MySQLi
$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} else {
    // Connection successful
    // echo "Connected successfully";
}
?>


