<?php
session_start();
require_once 'db_connect.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

$user_id = $_SESSION['user_id'];

// Fetch user info
$sql_user = "SELECT username, email FROM users WHERE user_id = ?";
$stmt_user = $conn->prepare($sql_user);
$stmt_user->bind_param("i", $user_id);
$stmt_user->execute();
$result_user = $stmt_user->get_result();
$user = $result_user->fetch_assoc();
$username = $user['username'];

// Fetch group ID from group_members
$sql_group = "SELECT gm.group_id, g.group_name
              FROM group_members gm
              JOIN groups g ON gm.group_id = g.group_id
              WHERE gm.user_id = ?";
$stmt_group = $conn->prepare($sql_group);
$stmt_group->bind_param("i", $user_id);
$stmt_group->execute();
$result_group = $stmt_group->get_result();

$group_id = null;
$group_name = "";

if ($result_group->num_rows > 0) {
    $group = $result_group->fetch_assoc();
    $group_id = $group['group_id'];
    $group_name = $group['group_name'];
}

// Fetch friend requests
$sql_requests = "SELECT fr.request_id, u.username AS sender_username
                 FROM friend_requests fr
                 JOIN users u ON fr.sender_id = u.user_id
                 WHERE fr.receiver_id = ? AND fr.status = 'sent'";
$stmt_requests = $conn->prepare($sql_requests);
$stmt_requests->bind_param("i", $user_id);
$stmt_requests->execute();
$friend_requests = $stmt_requests->get_result();

// Fetch potential friends
$sql_potential = "SELECT u.user_id, u.username FROM users u
                  WHERE u.user_id != ? AND u.user_id NOT IN (
                      SELECT CASE
                          WHEN f.user_id = ? THEN f.friend_id
                          WHEN f.friend_id = ? THEN f.user_id
                      END FROM friends f
                      WHERE f.user_id = ? OR f.friend_id = ?
                  )";
$stmt_potential = $conn->prepare($sql_potential);
$stmt_potential->bind_param("iiiii", $user_id, $user_id, $user_id, $user_id, $user_id);
$stmt_potential->execute();
$potential_friends = $stmt_potential->get_result();

// Fetch friends
$sql_friends = "SELECT u.username FROM users u
                WHERE u.user_id IN (
                    SELECT CASE
                        WHEN f.user_id = ? THEN f.friend_id
                        WHEN f.friend_id = ? THEN f.user_id
                    END FROM friends f
                    WHERE f.user_id = ? OR f.friend_id = ?
                )";
$stmt_friends = $conn->prepare($sql_friends);
$stmt_friends->bind_param("iiii", $user_id, $user_id, $user_id, $user_id);
$stmt_friends->execute();
$friends = $stmt_friends->get_result();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard - Bill Buddies</title>
    <link rel="stylesheet" href="dashboard.css">
</head>
<body>
    <div class="dashboard-container">
        <div class="sidebar">
            <h2>Dashboard</h2>
            <div class="menu">
                <h3>Welcome, <?php echo htmlspecialchars($username); ?>!</h3>

                <!-- Group Info -->
                <?php if ($group_id): ?>
                    <h3>Your Group</h3>
                    <p>You are in group: <strong><?php echo htmlspecialchars($group_name); ?></strong></p>
                <?php else: ?>
                    <p>You are not in any group. <a href="create_group.php">Create a Group</a></p>
                <?php endif; ?>

                <!-- Friend Requests -->
                <h3>Friend Requests</h3>
                <ul>
                    <?php if ($friend_requests->num_rows > 0): ?>
                        <?php while ($request = $friend_requests->fetch_assoc()): ?>
                            <li><?php echo htmlspecialchars($request['sender_username']); ?> sent a request.
                                <a href="accept_request.php?id=<?php echo $request['request_id']; ?>">Accept</a> |
                                <a href="decline_request.php?id=<?php echo $request['request_id']; ?>">Decline</a>
                            </li>
                        <?php endwhile; ?>
                    <?php else: ?>
                        <li>No pending friend requests.</li>
                    <?php endif; ?>
                </ul>

                <!-- Add Friends -->
                <h4>Send Friend Request</h4>
                <ul>
                    <?php if ($potential_friends->num_rows > 0): ?>
                        <?php while ($friend = $potential_friends->fetch_assoc()): ?>
                            <li><?php echo htmlspecialchars($friend['username']); ?>
                                <a href="send_friend_request.php?friend_id=<?php echo $friend['user_id']; ?>">Send Request</a>
                            </li>
                        <?php endwhile; ?>
                    <?php else: ?>
                        <li>No new users to add.</li>
                    <?php endif; ?>
                </ul>

                <!-- Friends List -->
                <h3>Your Friends</h3>
                <ul>
                    <?php if ($friends->num_rows > 0): ?>
                        <?php while ($friend = $friends->fetch_assoc()): ?>
                            <li><?php echo htmlspecialchars($friend['username']); ?></li>
                        <?php endwhile; ?>
                    <?php else: ?>
                        <li>No friends yet.</li>
                    <?php endif; ?>
                </ul>

                <button onclick="window.location.href='logout.php'">Logout</button>
            </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <h1>You're all settled up. Awesome!</h1>
            <p>To add a new expense, click the orange "Add an expense" button below.</p>
            <div class="buttons">
                <button class="add-expense-btn" onclick="window.location.href='add_expense.php'">Add an expense</button>
                <form action="settle_up.php" method="post" style="display:inline;">
                    <button type="submit" class="settle-up-btn">Settle up</button>
                </form>
            </div>
        </div>

        <!-- Right Sidebar -->
        <div class="right-sidebar">
            <h3>Bill Buddies on the Go</h3>
            <p>Get the app:</p>
            <a href="#"><img src="app-store.png" alt="App Store" /></a>
            <a href="#"><img src="google-play.png" alt="Google Play" /></a>
        </div>
    </div>
</body>
</html>






