<?php
// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();
require_once 'db_connect.php'; // Database connection

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Retrieve user input from form
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    // Check if all fields are filled
    if (empty($username) || empty($email) || empty($password)) {
        echo "All fields are required!";
    } else {
        // Check if the user already exists
        $check_sql = "SELECT * FROM users WHERE email = ?";
        $stmt = $conn->prepare($check_sql);
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            echo "User with this email already exists!";
        } else {
            // Hash the password for security
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);

            // Insert new user into the database
            $insert_sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
            $stmt_insert = $conn->prepare($insert_sql);
            $stmt_insert->bind_param('sss', $username, $email, $hashed_password);
            
            if ($stmt_insert->execute()) {
                echo "User successfully registered!";
                // Redirect to login page or dashboard
                header('Location: login.php');
                exit();
            } else {
                echo "Error: " . $stmt_insert->error;
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up - Bill Buddies</title>
</head>
<body>
    <h2>Create an Account</h2>
    <form method="POST" action="signup.php">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required><br><br>
        
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required><br><br>
        
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required><br><br>
        
        <input type="submit" value="Sign Up">
    </form>
</body>
</html>


