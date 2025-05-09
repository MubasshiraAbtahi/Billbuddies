<?php
session_start();
include('db_connect.php'); // Include the database connection

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login_signup.php');
    exit;
}

// Get the user_id (the currently logged-in user)
$user_id = $_SESSION['user_id'];

// Create a notification when a friend request is sent
if (isset($_GET['receiver_id'])) {
    $receiver_id = $_GET['receiver_id']; // The user receiving the friend request
    $sender_id = $user_id; // The logged-in user who is sending the request

    // Check if a request already exists (to avoid multiple requests)
    $check_request_sql = "SELECT * FROM friend_requests WHERE (sender_id = '$sender_id' AND receiver_id = '$receiver_id') OR (sender_id = '$receiver_id' AND receiver_id = '$sender_id')";
    $check_request_result = $conn->query($check_request_sql);

    // If no request exists, insert the friend request and create a notification
    if ($check_request_result->num_rows == 0) {
        // Insert a pending friend request
        $sql = "INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES ('$sender_id', '$receiver_id', 'pending')";
        $conn->query($sql);

        // Create a notification for the receiver
        $message = "$sender_id has sent you a friend request.";
        $notification_sql = "INSERT INTO notifications (user_id, message, status, is_read) VALUES ('$receiver_id', '$message', 'unread', 0)";
        $conn->query($notification_sql);

        header('Location: home.php'); // Redirect back to the home page
        exit;
    } else {
        // Redirect if a request already exists
        header('Location: home.php');
        exit;
    }
}

// Handle Accept/Decline Actions for Friend Requests
if (isset($_GET['action']) && isset($_GET['request_id'])) {
    $action = $_GET['action']; // 'accept' or 'decline'
    $request_id = $_GET['request_id'];

    if ($action == 'accept') {
        // Update the friend request status to 'accepted'
        $update_sql = "UPDATE friend_requests SET status = 'accepted' WHERE id = '$request_id'";
        $conn->query($update_sql);

        // Add both users to each other's friends list
        $request_sql = "SELECT sender_id, receiver_id FROM friend_requests WHERE id = '$request_id'";
        $request_result = $conn->query($request_sql);
        $request_data = $request_result->fetch_assoc();

        // Add the accepted friend relationship for both users
        $insert_sql = "INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES ('{$request_data['sender_id']}', '{$request_data['receiver_id']}', 'accepted')";
        $conn->query($insert_sql);

        // Create a notification for both users
        $notification_message = "You are now friends with {$user_id}.";
        $notification_sql = "INSERT INTO notifications (user_id, message, status, is_read) VALUES ('{$request_data['sender_id']}', '$notification_message', 'unread', 0)";
        $conn->query($notification_sql);

    } elseif ($action == 'decline') {
        // If declined, just delete the request
        $delete_sql = "DELETE FROM friend_requests WHERE id = '$request_id'";
        $conn->query($delete_sql);
    }

    // Redirect back to home page after handling the request
    header('Location: home.php');
    exit;
}
?>
