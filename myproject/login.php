<?php
session_start(); // Start the session to manage user login

error_reporting(E_ALL);  // Show all errors
ini_set('display_errors', 1);  // Display errors on the page

// Check if form is submitted
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    require_once 'db_connect.php';  // Ensure your DB connection file is included

    $username = $_POST['username'];
    $password = $_POST['password'];

    // Check if the user exists in the database
    $sql = "SELECT * FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $username); // Bind username parameter
    $stmt->execute();
    $result = $stmt->get_result();

    // If user exists, check password
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // Verify the password (use password_verify to match hash)
        if (password_verify($password, $user['password'])) {
            // Set session variables for user
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['username'] = $user['username'];

            // Redirect to dashboard after successful login
            header('Location: dashboard.php');
            exit();
        } else {
            // Incorrect password
            echo "Invalid username or password.";
        }
    } else {
        // User not found
        echo "Invalid username or password.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Bill Buddies</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="login-form">
        <h2>Login</h2>
        <form action="login.php" method="post">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
        <p>Don't have an account? <a href="signup.php">Sign Up</a></p>
    </div>
</body>
</html>


