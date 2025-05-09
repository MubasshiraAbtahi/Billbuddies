<?php
session_start();
include('db_connect.php'); // Include the database connection

// Redirect if the user is not logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login_signup.php'); // Redirect to login/signup page if not logged in
    exit;
}

// Fetch user data
$user_id = $_SESSION['user_id'];
$sql = "SELECT * FROM users WHERE user_id = '$user_id'"; // Use 'user_id' to fetch user data
$result = $conn->query($sql);
$user = $result->fetch_assoc();

// Fetch all users excluding the logged-in user
$all_users_sql = "SELECT user_id, username, name FROM users WHERE user_id != '$user_id'";
$all_users_result = $conn->query($all_users_sql);

// Fetch the user's pending friend requests
$friend_requests_sql = "SELECT fr.*, u.username, u.name FROM friend_requests fr 
                        JOIN users u ON u.user_id = fr.sender_id
                        WHERE fr.receiver_id = '$user_id' AND fr.status = 'pending'";
$friend_requests_result = $conn->query($friend_requests_sql);

// Fetch the user's friends (excluding the logged-in user)
$friends_sql = "SELECT u.user_id, u.username, u.name FROM users u
                JOIN friend_requests fr ON (fr.sender_id = u.user_id OR fr.receiver_id = u.user_id)
                WHERE (fr.sender_id = '$user_id' OR fr.receiver_id = '$user_id') 
                AND fr.status = 'accepted' AND u.user_id != '$user_id'"; // Exclude the logged-in user
$friends_result = $conn->query($friends_sql);

// Fetch user's notifications
$notifications_sql = "SELECT * FROM notifications WHERE user_id = '$user_id' AND is_read = FALSE";
$notifications_result = $conn->query($notifications_sql);

// Handle Accept or Decline Actions for Friend Requests
if (isset($_GET['action']) && isset($_GET['request_id'])) {
    $action = $_GET['action']; // 'accept' or 'decline'
    $request_id = $_GET['request_id'];

    if ($action == 'accept') {
        // Update friend request status to 'accepted'
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

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bill Buddies - Home</title>
    <link rel="stylesheet" href="home.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to Bill Buddies, <?php echo $user['name']; ?>!</h1>
        <p>Your go-to place to manage friends and group activities easily.</p>

        <div class="sections">
            <!-- Add Friend Section -->
            <div class="section">
                <h2>Add Friends</h2>
                <ul>
                    <?php while ($row = $all_users_result->fetch_assoc()) { ?>
                        <li>
                            <?php echo $row['name']; ?>
                            <?php
                            // Check if already friends or request is pending
                            $check_friend_sql = "SELECT * FROM friend_requests 
                                                WHERE (sender_id = '$user_id' AND receiver_id = '{$row['user_id']}' 
                                                OR sender_id = '{$row['user_id']}' AND receiver_id = '$user_id') 
                                                AND status = 'accepted'";
                            $check_friend_result = $conn->query($check_friend_sql);

                            if ($check_friend_result->num_rows > 0) {
                                echo " - Already Friends";
                            } else {
                                $check_request_sql = "SELECT * FROM friend_requests 
                                                    WHERE sender_id = '$user_id' AND receiver_id = '{$row['user_id']}' 
                                                    AND status = 'pending'";
                                $check_request_result = $conn->query($check_request_sql);
                                if ($check_request_result->num_rows > 0) {
                                    echo " - Request Sent";
                                } else {
                                    echo "<a href='send_request.php?receiver_id={$row['user_id']}'>Add Friend</a>";
                                }
                            }
                            ?>
                        </li>
                    <?php } ?>
                </ul>
            </div>

            <!-- Notifications Section -->
            <div class="section">
                <h2>Notifications</h2>
                <ul>
                    <?php while ($notification = $notifications_result->fetch_assoc()) { ?>
                        <li>
                            <?php echo $notification['message']; ?>
                            <?php
                            // Show accept/decline only for pending friend requests
                            $request_id_sql = "SELECT * FROM friend_requests WHERE sender_id = '{$notification['user_id']}' AND receiver_id = '$user_id' AND status = 'pending'";
                            $request_result = $conn->query($request_id_sql);
                            
                            if ($request_result->num_rows > 0) {
                                echo " 
                                <a href='home.php?action=accept&request_id={$notification['notification_id']}'>Accept</a> | 
                                <a href='home.php?action=decline&request_id={$notification['notification_id']}'>Decline</a>";
                            }
                            ?>
                        </li>
                    <?php } ?>
                </ul>
            </div>

            <!-- Friends Section -->
            <div class="section">
                <h2>Your Friends</h2>
                <ul>
                    <?php while ($friend = $friends_result->fetch_assoc()) { ?>
                        <li>
                            <?php echo $friend['name']; ?>
                        </li>
                    <?php } ?>
                </ul>
            </div>

            <!-- Create Group Section -->
            <div class="section">
                <h2>Create Group</h2>
                <a href="create_group.php">Create a Group</a>
            </div>
        </div>
    </div>
</body>
</html>



