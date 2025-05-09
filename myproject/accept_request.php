<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

require_once 'db_connect.php';
require_once 'notification_functions.php'; // Include the notification function file

$user_id = $_SESSION['user_id'];
$request_id = $_GET['id']; 

if (!isset($request_id)) {
    echo "Invalid request.";
    exit();
}

$sql = "SELECT * FROM friend_requests WHERE request_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $request_id);
$stmt->execute();
$result = $stmt->get_result();
$request = $result->fetch_assoc();

if (!$request) {
    echo "Request not found.";
    exit();
}

$sender_id = $request['sender_id'];
$receiver_id = $request['receiver_id'];

if ($user_id != $receiver_id) {
    echo "You are not authorized to accept this request.";
    exit();
}

$update_sql = "UPDATE friend_requests SET status = 'accepted' WHERE request_id = ?";
$update_stmt = $conn->prepare($update_sql);
$update_stmt->bind_param('i', $request_id);
$update_stmt->execute();

$insert_sql = "INSERT INTO friends (user_id, friend_id) VALUES (?, ?), (?, ?)";
$insert_stmt = $conn->prepare($insert_sql);
$insert_stmt->bind_param('iiii', $sender_id, $receiver_id, $receiver_id, $sender_id);
$insert_stmt->execute();

// Add notification for both the sender and receiver
$message_receiver = "You have accepted the friend request from " . get_username($sender_id, $conn);
$message_sender = "Your friend request has been accepted by " . get_username($receiver_id, $conn);
$type = 'friend_request_accepted';

// Insert notifications into the database
add_notification($receiver_id, $message_receiver, $type, $conn);
add_notification($sender_id, $message_sender, $type, $conn);

header('Location: dashboard.php');
exit();

// Function to fetch username
function get_username($user_id, $conn) {
    $sql = "SELECT username FROM users WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    return $user['username'];
}
?>



