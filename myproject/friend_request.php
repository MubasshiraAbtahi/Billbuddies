<?php
session_start();

// Check if the user is logged in, otherwise redirect to login page
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php'); // Redirect to login page if not logged in
    exit();
}

// Include the database connection
require_once 'db_connect.php';

// Get current user
$user_id = $_SESSION['user_id'];

// Get all incoming friend requests for the logged-in user
$sql = "SELECT * FROM friend_requests WHERE receiver_id = ? AND status = 'sent'";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $user_id);
$stmt->execute();
$friend_requests = $stmt->get_result();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Friend Requests</title>
    <link rel="stylesheet" href="dashboard.css">
</head>
<body>
    <div class="dashboard-container">
        <!-- Left Sidebar -->
        <div class="sidebar">
            <h2>Friend Requests</h2>

            <!-- Display friend requests -->
            <div class="friend-requests">
                <?php if ($friend_requests->num_rows > 0): ?>
                    <ul>
                        <?php while ($request = $friend_requests->fetch_assoc()): ?>
                            <?php
                            // Get the sender's name
                            $sender_id = $request['sender_id'];
                            $sender_sql = "SELECT username FROM users WHERE user_id = ?";
                            $sender_stmt = $conn->prepare($sender_sql);
                            $sender_stmt->bind_param('i', $sender_id);
                            $sender_stmt->execute();
                            $sender_result = $sender_stmt->get_result();
                            $sender = $sender_result->fetch_assoc();
                            ?>
                            <li>
                                <strong><?php echo htmlspecialchars($sender['username']); ?></strong> sent you a friend request.
                                <a href="accept_request.php?id=<?php echo $request['id']; ?>">Accept</a> |
                                <a href="decline_request.php?id=<?php echo $request['id']; ?>">Decline</a>
                            </li>
                        <?php endwhile; ?>
                    </ul>
                <?php else: ?>
                    <p>You don't have any friend requests.</p>
                <?php endif; ?>
            </div>

            <!-- Logout Button -->
            <button onclick="window.location.href='logout.php'">Logout</button>
        </div>

        <!-- Main Content Area -->
        <div class="main-content">
            <h1>Manage Your Friend Requests</h1>
            <p>Accept or decline requests as needed.</p>
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


