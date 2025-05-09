<?php
session_start();
require_once 'db_connect.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit();
}

if (!isset($_GET['id'])) {
    echo json_encode(['error' => 'Notification ID is missing']);
    exit();
}

$notification_id = $_GET['id'];
$user_id = $_SESSION['user_id'];

// Update the notification status to 'read'
$sql = "UPDATE notifications SET status = 'read' WHERE notification_id = ? AND user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('ii', $notification_id, $user_id);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false]);
}
?>
