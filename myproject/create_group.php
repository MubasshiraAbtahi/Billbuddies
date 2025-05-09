<?php
session_start();

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

require_once 'db_connect.php'; // Include database connection
require_once 'notification_functions.php'; // Include notification functions

// Get the logged-in user ID
$user_id = $_SESSION['user_id'];

// Check if the user already belongs to a group
$sql_check_group = "SELECT group_id FROM users WHERE user_id = ?";
$stmt_check_group = $conn->prepare($sql_check_group);
$stmt_check_group->bind_param('i', $user_id);
$stmt_check_group->execute();
$result = $stmt_check_group->get_result();
$user = $result->fetch_assoc();

if ($user['group_id']) {
    // If the user is already part of a group, redirect to dashboard
    header('Location: dashboard.php');
    exit();
}

// Fetch the list of friends who are not in a group
$friends_sql = "SELECT u.user_id, u.username 
                FROM users u 
                JOIN friends f ON (f.user_id = u.user_id OR f.friend_id = u.user_id) 
                WHERE (f.user_id = ? OR f.friend_id = ?) 
                AND u.user_id != ? 
                AND u.group_id IS NULL";  
$friends_stmt = $conn->prepare($friends_sql);
$friends_stmt->bind_param('iii', $user_id, $user_id, $user_id);
$friends_stmt->execute();
$friends_result = $friends_stmt->get_result();

// Process the form submission to create a group
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $group_name = $_POST['group_name'];
    $selected_members = $_POST['members']; // Selected group members
    
    if (empty($group_name) || empty($selected_members)) {
        echo "Group name and members are required!";
        exit();
    }

    // Insert the new group into the groups table
    $insert_group_sql = "INSERT INTO groups (group_name, created_by) VALUES (?, ?)";
    $stmt_group = $conn->prepare($insert_group_sql);
    $stmt_group->bind_param('si', $group_name, $user_id);
    $stmt_group->execute();

    // Get the group ID of the newly created group
    $group_id = $stmt_group->insert_id;

    // Insert the group creator into the group_members table
    $insert_member_sql = "INSERT INTO group_members (group_id, user_id) VALUES (?, ?)";
    $stmt_member = $conn->prepare($insert_member_sql);
    $stmt_member->bind_param('ii', $group_id, $user_id);
    $stmt_member->execute();

    // Add the selected members to the group
    foreach ($selected_members as $member_id) {
        $check_group_sql = "SELECT group_id FROM users WHERE user_id = ?";
        $check_group_stmt = $conn->prepare($check_group_sql);
        $check_group_stmt->bind_param('i', $member_id);
        $check_group_stmt->execute();
        $check_group_result = $check_group_stmt->get_result();
        $member_group = $check_group_result->fetch_assoc();

        if ($member_group['group_id'] == NULL) {
            // Add the member to the group if they are not already in a group
            $stmt_add_member = $conn->prepare($insert_member_sql);
            $stmt_add_member->bind_param('ii', $group_id, $member_id);
            $stmt_add_member->execute();

            // Send a notification to the added member
            $message = "You have been added to the group: " . $group_name;
            $type = 'group_created'; // You can define this type to represent group creation notifications
            add_notification($member_id, $message, $type, $conn); // Add notification
        }
    }

    // Notify the group creator that the group has been created
    $message_creator = "You have created the group: " . $group_name;
    $type_creator = 'group_created';
    add_notification($user_id, $message_creator, $type_creator, $conn);

    // Update the user's group_id in the users table
    $update_user_group_sql = "UPDATE users SET group_id = ? WHERE user_id = ?";
    $stmt_update_user_group = $conn->prepare($update_user_group_sql);
    $stmt_update_user_group->bind_param('ii', $group_id, $user_id);
    $stmt_update_user_group->execute();

    // Redirect to the dashboard
    header('Location: dashboard.php');
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Group - Bill Buddies</title>
</head>
<body>
    <h2>Create a New Group</h2>
    <form method="POST" action="create_group.php">
        <label for="group_name">Group Name:</label>
        <input type="text" id="group_name" name="group_name" required><br><br>

        <h3>Select Members for the Group:</h3>
        <?php if ($friends_result->num_rows > 0): ?>
            <?php while ($friend = $friends_result->fetch_assoc()): ?>
                <label>
                    <input type="checkbox" name="members[]" value="<?php echo $friend['user_id']; ?>"> 
                    <?php echo htmlspecialchars($friend['username']); ?>
                </label><br>
            <?php endwhile; ?>
        <?php else: ?>
            <p>You have no friends to add to a group. Please add some friends first.</p>
        <?php endif; ?>

        <br>
        <input type="submit" value="Create Group">
    </form>
    <br>
    <a href="dashboard.php">Go to Dashboard</a>
</body>
</html>


