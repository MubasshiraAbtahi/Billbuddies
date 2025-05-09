<?php
// Include your database connection here
require_once 'db_connect.php';

// Function to add a new notification
function add_notification($user_id, $message, $type, $conn) {
    // Insert the notification into the database
    $sql = "INSERT INTO notifications (user_id, message, type, status) VALUES (?, ?, ?, 'unread')";
    
    // Prepare and bind the SQL query to insert a notification
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iss", $user_id, $message, $type);  // Bind user_id as integer, message and type as string
    
    // Execute the statement
    if ($stmt->execute()) {
        return true; // Return true if the notification was added successfully
    } else {
        return false; // Return false if there was an error
    }
}

// Function to fetch unread notifications for a user
function get_unread_notifications($user_id, $conn) {
    // Select unread notifications from the database
    $sql = "SELECT * FROM notifications WHERE user_id = ? AND status = 'unread' ORDER BY created_at DESC";
    
    // Prepare and bind the SQL query to get unread notifications
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);  // Bind user_id as integer
    
    // Execute the statement
    $stmt->execute();
    
    // Get the result set
    $result = $stmt->get_result();
    
    // Return the result set
    return $result;
}

// Function to mark notifications as read
function mark_notifications_as_read($user_id, $conn) {
    // Update all unread notifications to mark them as read
    $sql = "UPDATE notifications SET status = 'read' WHERE user_id = ?";
    
    // Prepare and bind the SQL query to update the notification status
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);  // Bind user_id as integer
    
    // Execute the statement
    if ($stmt->execute()) {
        return true; // Return true if the notifications were marked as read
    } else {
        return false; // Return false if there was an error
    }
}
?>
