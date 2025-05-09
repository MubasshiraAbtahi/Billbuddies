<?php
session_start();

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

// Include the database connection
require_once 'db_connect.php';

// Get the logged-in user ID
$user_id = $_SESSION['user_id'];
$friend_id = $_GET['friend_id']; // Get the potential friend's ID from the URL

// Check if the logged-in user is trying to send a request to someone else (User A -> User B)
if ($user_id == $friend_id) {
    // Prevent sending a request to oneself
    echo "You cannot send a request to yourself.";
    exit();
}

// Check if a friend request already exists (from A -> B, but not from B -> A)
$sql_check = "SELECT * FROM friend_requests WHERE sender_id = ? AND receiver_id = ? AND status = 'sent'";
$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param('ii', $user_id, $friend_id);
$stmt_check->execute();
$result_check = $stmt_check->get_result();

// If no existing request, send a new request
if ($result_check->num_rows == 0) {
    // Insert the new friend request (status = 'sent')
    $sql = "INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES (?, ?, 'sent')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $user_id, $friend_id);
    $stmt->execute();
    
    // Redirect back to the dashboard
    header('Location: dashboard.php');
    exit();
} else {
    // If a request already exists, handle it (either show a message or do nothing)
    echo "Friend request already sent!";
}
?>




