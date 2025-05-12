<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

require_once 'db_connect.php';

$user_id = $_SESSION['user_id'];
$request_id = $_GET['id']; // Get the request ID from the URL

// Delete the friend request from the database
$sql = "DELETE FROM friend_requests WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $request_id);
$stmt->execute();

header('Location: dashboard.php'); // Redirect back to dashboard
exit();
?>


