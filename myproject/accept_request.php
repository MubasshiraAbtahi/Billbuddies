<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

require_once 'db_connect.php';

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

header('Location: dashboard.php');
exit();
?>



