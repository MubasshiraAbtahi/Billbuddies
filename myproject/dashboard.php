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

// Get user data (username, email, group_id)
$sql = "SELECT username, email, group_id FROM users WHERE user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$username = $user['username'];
$email = $user['email'];
$group_id = $user['group_id'];

// Check if the user is part of a group
if ($group_id) {
    // Fetch the group name
    $group_sql = "SELECT group_name FROM groups WHERE group_id = ?";
    $group_stmt = $conn->prepare($group_sql);
    $group_stmt->bind_param('i', $group_id);
    $group_stmt->execute();
    $group_result = $group_stmt->get_result();

    // Check if the group exists and get the group name
    if ($group_result->num_rows > 0) {
        $group = $group_result->fetch_assoc();
        $group_name = $group['group_name'];

        // Fetch members of the group
        $members_sql = "SELECT u.username FROM users u JOIN group_members gm ON u.user_id = gm.user_id WHERE gm.group_id = ?";
        $members_stmt = $conn->prepare($members_sql);
        $members_stmt->bind_param('i', $group_id);
        $members_stmt->execute();
        $members_result = $members_stmt->get_result();
    } else {
        $group_name = "Group not found";
        $members_result = null;
    }
} else {
    $group_name = "Not in any group";
    $members_result = null;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Bill Buddies</title>
    <link rel="stylesheet" href="dashboard.css">
</head>
<body>
    <div class="dashboard-container">
        <!-- Left Sidebar -->
        <div class="sidebar">
            <h2>Dashboard</h2>
            <div class="menu">
                <h3>Welcome, <?php echo htmlspecialchars($username); ?>!</h3>

                <!-- Show group information -->
                <?php if ($group_name != "Not in any group"): ?>
                    <h3>Your Group</h3>
                    <p>You're in a group: <strong><?php echo htmlspecialchars($group_name); ?></strong></p>
                    <h4>Group Members:</h4>
                    <ul>
                        <?php if ($members_result && $members_result->num_rows > 0): ?>
                            <?php while ($member = $members_result->fetch_assoc()): ?>
                                <li><?php echo htmlspecialchars($member['username']); ?></li>
                            <?php endwhile; ?>
                        <?php else: ?>
                            <li>No members in the group yet.</li>
                        <?php endif; ?>
                    </ul>
                <?php else: ?>
                    <p>You are not part of any group. <a href="create_group.php">Create a Group</a></p>
                <?php endif; ?>

                <!-- Pending Friend Requests -->
                <h3>Friend Requests</h3>
                <h4>Pending Requests</h4>
                <ul>
                    <?php
                    // Fetch and display pending friend requests
                    $request_sql = "SELECT * FROM friend_requests WHERE receiver_id = ? AND status = 'sent'";
                    $request_stmt = $conn->prepare($request_sql);
                    $request_stmt->bind_param('i', $user_id);
                    $request_stmt->execute();
                    $friend_requests = $request_stmt->get_result();

                    if ($friend_requests->num_rows > 0) {
                        while ($request = $friend_requests->fetch_assoc()) {
                            $sender_id = $request['sender_id'];
                            $sender_sql = "SELECT username FROM users WHERE user_id = ?";
                            $sender_stmt = $conn->prepare($sender_sql);
                            $sender_stmt->bind_param('i', $sender_id);
                            $sender_stmt->execute();
                            $sender_result = $sender_stmt->get_result();
                            $sender = $sender_result->fetch_assoc();

                            // Display the pending request with options to accept or decline
                            echo "<li>" . htmlspecialchars($sender['username']) . " sent you a friend request. 
                            <a href='accept_request.php?id=" . $request['request_id'] . "'>Accept</a> | 
                            <a href='decline_request.php?id=" . $request['request_id'] . "'>Decline</a></li>";
                        }
                    } else {
                        echo "<li>No pending friend requests.</li>";
                    }
                    ?>
                </ul>

                <!-- Send Friend Request Section -->
                <h4>Send Friend Request</h4>
                <ul>
                    <?php
                    // Fetch users to send friend requests
                    $potential_friends_sql = "SELECT * FROM users WHERE user_id != ? AND user_id NOT IN (SELECT friend_id FROM friends WHERE user_id = ?)";
                    $potential_friends_stmt = $conn->prepare($potential_friends_sql);
                    $potential_friends_stmt->bind_param('ii', $user_id, $user_id);
                    $potential_friends_stmt->execute();
                    $potential_friends_result = $potential_friends_stmt->get_result();

                    if ($potential_friends_result->num_rows > 0) {
                        while ($potential_friend = $potential_friends_result->fetch_assoc()) {
                            // Check if a request already exists (A -> B)
                            $check_request_sql = "SELECT * FROM friend_requests WHERE sender_id = ? AND receiver_id = ? AND status = 'sent'";
                            $check_request_stmt = $conn->prepare($check_request_sql);
                            $check_request_stmt->bind_param('ii', $user_id, $potential_friend['user_id']);
                            $check_request_stmt->execute();
                            $check_request_result = $check_request_stmt->get_result();
                            
                            if ($check_request_result->num_rows == 0) {
                                echo "<li>" . htmlspecialchars($potential_friend['username']) . " 
                                    <a href='send_friend_request.php?friend_id=" . $potential_friend['user_id'] . "'>Send Request</a>
                                  </li>";
                            } else {
                                echo "<li>" . htmlspecialchars($potential_friend['username']) . " - Request Sent</li>";
                            }
                        }
                    } else {
                        echo "<li>No potential friends to send requests to.</li>";
                    }
                    ?>
                </ul>

                <!-- Friends List Section -->
                <h3>Your Friends</h3>
                <ul>
                    <?php
                    // Fetch and display the user's friends
                    $friends_sql = "SELECT * FROM friends WHERE user_id = ? OR friend_id = ?";
                    $friends_stmt = $conn->prepare($friends_sql);
                    $friends_stmt->bind_param('ii', $user_id, $user_id);
                    $friends_stmt->execute();
                    $friends_result = $friends_stmt->get_result();

                    if ($friends_result->num_rows > 0) {
                        while ($friend = $friends_result->fetch_assoc()) {
                            $friend_id = ($friend['user_id'] == $user_id) ? $friend['friend_id'] : $friend['user_id'];
                            $friend_sql = "SELECT username FROM users WHERE user_id = ?";
                            $friend_stmt = $conn->prepare($friend_sql);
                            $friend_stmt->bind_param('i', $friend_id);
                            $friend_stmt->execute();
                            $friend_result = $friend_stmt->get_result();
                            $friend_details = $friend_result->fetch_assoc();
                            echo "<li>" . htmlspecialchars($friend_details['username']) . "</li>";
                        }
                    } else {
                        echo "<li>No friends yet.</li>";
                    }
                    ?>
                </ul>

                <button onclick="window.location.href='logout.php'">Logout</button>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="main-content">
            <h1>You're all settled up. Awesome!</h1>
            <p>To add a new expense, click the orange "Add an expense" button below.</p>
            <div class="buttons">
                <button class="add-expense-btn" onclick="window.location.href='add_expense.php'">Add an expense</button>
                <button class="settle-up-btn">Settle up</button>
            </div>
        </div>

        <!-- Right Sidebar with App Links -->
        <div class="right-sidebar">
            <h3>Bill Buddies on the Go</h3>
            <p>Get the free Bill Buddies app and add expenses from anywhere:</p>
            <a href="#" class="app-link">
                <img src="app-store.png" alt="App Store" />
            </a>
            <a href="#" class="app-link">
                <img src="google-play.png" alt="Google Play" />
            </a>
        </div>
    </div>

    <script src="dashboard.js"></script>
</body>
</html>



