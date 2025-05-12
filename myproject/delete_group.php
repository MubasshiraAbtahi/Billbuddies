<?php
session_start();
require_once 'db_connect.php';

// Ensure user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['group_id'])) {
    $group_id = $_POST['group_id'];

    // Delete all expenses related to the group
    $delete_expenses_sql = "DELETE FROM expense_details WHERE group_id = ?";
    $stmt_delete_expenses = $conn->prepare($delete_expenses_sql);
    $stmt_delete_expenses->bind_param('i', $group_id);
    $stmt_delete_expenses->execute();

    // Delete all transactions related to the group
    $delete_transactions_sql = "DELETE FROM transactions WHERE expense_id IN (SELECT expense_id FROM expense_details WHERE group_id = ?)";
    $stmt_delete_transactions = $conn->prepare($delete_transactions_sql);
    $stmt_delete_transactions->bind_param('i', $group_id);
    $stmt_delete_transactions->execute();

    // Delete the group itself
    $delete_group_sql = "DELETE FROM groups WHERE group_id = ?";
    $stmt_delete_group = $conn->prepare($delete_group_sql);
    $stmt_delete_group->bind_param('i', $group_id);
    $stmt_delete_group->execute();

    // Remove all users from the group
    $update_users_sql = "UPDATE users SET group_id = NULL WHERE group_id = ?";
    $stmt_update_users = $conn->prepare($update_users_sql);
    $stmt_update_users->bind_param('i', $group_id);
    $stmt_update_users->execute();

    // Redirect to the dashboard after deletion
    header("Location: dashboard.php");
    exit();
} else {
    echo "Invalid request.";
}
?>
