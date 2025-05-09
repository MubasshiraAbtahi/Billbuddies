<?php
session_start();
include('db_connect.php');

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

// Get the current user ID
$current_user_id = $_SESSION['user_id'];

if (isset($_GET['accept_request'])) {
    $friend_id = $_GET['accept_request'];

    // Update the status of the friend request to 'accepted'
    $update_request_query = "UPDATE friend_requests SET status = 'accepted' WHERE sender_id = '$friend_id' AND receiver_id = '$current_user_id'";
    mysqli_query($conn, $update_request_query);

    // Add both users to the friends table
    $insert_friend_1 = "INSERT INTO friends (user_id, friend_id) VALUES ('$current_user_id', '$friend_id')";
    $insert_friend_2 = "INSERT INTO friends (user_id, friend_id) VALUES ('$friend_id', '$current_user_id')";
    mysqli_query($conn, $insert_friend_1);
    mysqli_query($conn, $insert_friend_2);

    // Redirect back to the home page
    header("Location: home.php");
}

if (isset($_GET['reject_request'])) {
    $friend_id = $_GET['reject_request'];

    // Update the status of the friend request to 'rejected'
    $update_request_query = "UPDATE friend_requests SET status = 'rejected' WHERE sender_id = '$friend_id' AND receiver_id = '$current_user_id'";
    mysqli_query($conn, $update_request_query);

    // Redirect back to the home page
    header("Location: home.php");
}
?>
