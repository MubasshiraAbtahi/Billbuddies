<?php
session_start();
include('db_connect.php');

if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

$current_user_id = $_SESSION['user_id'];

if (isset($_GET['add_friend'])) {
    $friend_user_id = $_GET['add_friend'];

    // Check if the users are already friends
    $check_friend_query = "SELECT * FROM friends WHERE (user_id = '$current_user_id' AND friend_user_id = '$friend_user_id') 
                           OR (user_id = '$friend_user_id' AND friend_user_id = '$current_user_id')";
    $result = mysqli_query($conn, $check_friend_query);

    if (mysqli_num_rows($result) == 0) {
        // Send the friend request
        $sql = "INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES ('$current_user_id', '$friend_user_id', 'pending')";
        if (mysqli_query($conn, $sql)) {
            // Notify the receiver
            $notification_message = "You have a new friend request from user $current_user_id";
            $notification_sql = "INSERT INTO notifications (user_id, message, status) VALUES ('$friend_user_id', '$notification_message', 'unread')";
            mysqli_query($conn, $notification_sql);

            echo "Friend request sent!";
        }
    } else {
        echo "You are already friends!";
    }
}
?>
