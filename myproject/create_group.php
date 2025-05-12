<?php
session_start();

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

require_once 'db_connect.php';

$user_id = $_SESSION['user_id'];

// Check if the user is already in a group (from group_members table)
$sql_check_group = "SELECT group_id FROM group_members WHERE user_id = ?";
$stmt_check_group = $conn->prepare($sql_check_group);
$stmt_check_group->bind_param('i', $user_id);
$stmt_check_group->execute();
$result = $stmt_check_group->get_result();

if ($result->num_rows > 0) {
    // Already in a group
    header('Location: dashboard.php');
    exit();
}

// Get the user's friends who are NOT in any group
$sql_friends = "SELECT u.user_id, u.username
                FROM users u
                WHERE u.user_id IN (
                    SELECT CASE
                        WHEN f.user_id = ? THEN f.friend_id
                        WHEN f.friend_id = ? THEN f.user_id
                    END
                    FROM friends f
                    WHERE f.user_id = ? OR f.friend_id = ?
                )
                AND u.user_id NOT IN (
                    SELECT user_id FROM group_members
                )";
$stmt_friends = $conn->prepare($sql_friends);
$stmt_friends->bind_param("iiii", $user_id, $user_id, $user_id, $user_id);
$stmt_friends->execute();
$friends_result = $stmt_friends->get_result();

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $group_name = trim($_POST['group_name']);
    $selected_members = $_POST['members'] ?? [];

    if (empty($group_name) || empty($selected_members)) {
        echo "Please provide a group name and select at least one friend.";
        exit();
    }

    // Create group
    $insert_group_sql = "INSERT INTO groups (group_name, created_by) VALUES (?, ?)";
    $stmt_group = $conn->prepare($insert_group_sql);
    $stmt_group->bind_param('si', $group_name, $user_id);
    $stmt_group->execute();
    $group_id = $stmt_group->insert_id;

    // Add group creator to group_members
    $stmt_add_member = $conn->prepare("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)");
    $stmt_add_member->bind_param("ii", $group_id, $user_id);
    $stmt_add_member->execute();

    // Update creator's group_id in users table
    $stmt_update_user = $conn->prepare("UPDATE users SET group_id = ? WHERE user_id = ?");
    $stmt_update_user->bind_param("ii", $group_id, $user_id);
    $stmt_update_user->execute();

    // Add selected friends to group
    foreach ($selected_members as $friend_id) {
        $stmt_add_member->bind_param("ii", $group_id, $friend_id);
        $stmt_add_member->execute();

        // Also update their group_id in users table
        $stmt_update_user->bind_param("ii", $group_id, $friend_id);
        $stmt_update_user->execute();
    }

    // Redirect back to dashboard
    header('Location: dashboard.php');
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Create Group - Bill Buddies</title>
</head>
<body>
    <h2>Create a New Group</h2>

    <form method="POST" action="create_group.php">
        <label for="group_name">Group Name:</label>
        <input type="text" name="group_name" id="group_name" required><br><br>

        <h3>Select Friends to Add:</h3>
        <?php if ($friends_result->num_rows > 0): ?>
            <?php while ($friend = $friends_result->fetch_assoc()): ?>
                <label>
                    <input type="checkbox" name="members[]" value="<?= $friend['user_id'] ?>">
                    <?= htmlspecialchars($friend['username']) ?>
                </label><br>
            <?php endwhile; ?>
        <?php else: ?>
            <p>You have no eligible friends to add. Either they are already in a group or you have no friends yet.</p>
        <?php endif; ?>

        <br>
        <button type="submit">Create Group</button>
    </form>
    <br>
    <a href="dashboard.php">Back to Dashboard</a>
</body>
</html>
