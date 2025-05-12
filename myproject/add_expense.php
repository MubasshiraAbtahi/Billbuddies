<?php
session_start();
require_once 'db_connect.php';

// Ensure user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

$user_id = $_SESSION['user_id'];

// Get user's group
$sql_group = "SELECT group_id FROM users WHERE user_id = ?";
$stmt_group = $conn->prepare($sql_group);
$stmt_group->bind_param("i", $user_id);
$stmt_group->execute();
$result_group = $stmt_group->get_result();
$user_data = $result_group->fetch_assoc();

if (!$user_data || !$user_data['group_id']) {
    echo "You are not part of any group.";
    exit();
}

$group_id = $user_data['group_id'];

// Fetch all group members
$sql_members = "SELECT u.user_id, u.username 
                FROM users u 
                JOIN group_members gm ON u.user_id = gm.user_id 
                WHERE gm.group_id = ?";
$stmt_members = $conn->prepare($sql_members);
$stmt_members->bind_param("i", $group_id);
$stmt_members->execute();
$members_result = $stmt_members->get_result();

$members = [];
while ($row = $members_result->fetch_assoc()) {
    $members[] = $row;
}

// Handle form submission for multiple expenses
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Loop through multiple expense categories
    $total_amount = 0;
    $paid_by = $_POST['paid_by'];
    $selected_members = $_POST['members'] ?? [];

    // Make sure the user selected members
    if (empty($selected_members)) {
        echo "Please select at least one member.";
        exit();
    }

    $split_type = $_POST['split_type'];

    // Loop through expense categories
    foreach ($_POST['expenses'] as $expense) {
        $description = $expense['description'];
        $amount = floatval($expense['amount']);

        if (!$description || !$amount) {
            echo "Please fill all expense details.";
            exit();
        }

        $total_amount += $amount;

        // Insert each expense into the database
        $sql_expense = "INSERT INTO expense_details (group_id, paid_by, description, amount, split_type)
                        VALUES (?, ?, ?, ?, ?)";
        $stmt_expense = $conn->prepare($sql_expense);
        $stmt_expense->bind_param("iisds", $group_id, $paid_by, $description, $amount, $split_type);
        $stmt_expense->execute();
        $expense_id = $stmt_expense->insert_id;

        // Insert transactions for each selected member
        if ($split_type === 'equal') {
            $share = round($amount / count($selected_members), 2);
            foreach ($selected_members as $member_id) {
                $stmt_trans = $conn->prepare("INSERT INTO transactions (expense_id, user_id, amount) VALUES (?, ?, ?)");
                $stmt_trans->bind_param("iid", $expense_id, $member_id, $share);
                $stmt_trans->execute();
            }
        } else if ($split_type === 'uneven') {
            // Handle uneven split if custom amounts are provided
            $total_split = 0;
            foreach ($selected_members as $member_id) {
                $amt = floatval($_POST['custom_amount'][$member_id] ?? 0);
                $total_split += $amt;
            }

            // Ensure the total split amount matches the total expense amount
            if (round($total_split, 2) != round($amount, 2)) {
                echo "Sum of custom amounts does not match the total amount.";
                exit();
            }

            // Insert uneven amounts for each selected member
            foreach ($selected_members as $member_id) {
                $amt = floatval($_POST['custom_amount'][$member_id]);
                $stmt_trans = $conn->prepare("INSERT INTO transactions (expense_id, user_id, amount) VALUES (?, ?, ?)");
                $stmt_trans->bind_param("iid", $expense_id, $member_id, $amt);
                $stmt_trans->execute();
            }
        }
    }

    header("Location: settle_up.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Multiple Expenses</title>
</head>
<body>
    <h2>Add Multiple Expenses</h2>
    <form method="post">
        <!-- Paid By Dropdown -->
        <label>Paid By:</label><br>
        <select name="paid_by" required>
            <?php foreach ($members as $m): ?>
                <option value="<?= $m['user_id'] ?>"><?= htmlspecialchars($m['username']) ?></option>
            <?php endforeach; ?>
        </select><br><br>

        <!-- Split Type (Equal or Uneven) -->
        <label>Split Type:</label><br>
        <input type="radio" name="split_type" value="equal" checked> Equal
        <input type="radio" name="split_type" value="uneven"> Uneven<br><br>

        <!-- Members to Split Expense -->
        <label>Select Members:</label><br>
        <?php foreach ($members as $m): ?>
            <input type="checkbox" name="members[]" value="<?= $m['user_id'] ?>" checked>
            <?= htmlspecialchars($m['username']) ?><br>
        <?php endforeach; ?><br>

        <!-- Multiple Expense Inputs -->
        <div id="expense-container">
            <h3>Expense 1</h3>
            <label>Description:</label><br>
            <input type="text" name="expenses[0][description]" required><br><br>

            <label>Amount:</label><br>
            <input type="number" name="expenses[0][amount]" step="0.01" required><br><br>
        </div>

        <button type="button" onclick="addExpense()">Add Another Expense</button><br><br>

        <!-- Custom Amounts (for uneven split) -->
        <div id="custom-fields" style="display:none;">
            <h4>Custom Amounts</h4>
            <?php foreach ($members as $m): ?>
                <label><?= htmlspecialchars($m['username']) ?>:</label>
                <input type="number" name="custom_amount[<?= $m['user_id'] ?>]" step="0.01"><br>
            <?php endforeach; ?>
        </div><br>

        <input type="submit" value="Add Expenses">
    </form>

    <script>
        // Add a new expense input
        let expenseCount = 1;
        function addExpense() {
            const container = document.getElementById("expense-container");
            const newExpense = document.createElement("div");
            newExpense.innerHTML = `
                <h3>Expense ${expenseCount + 1}</h3>
                <label>Description:</label><br>
                <input type="text" name="expenses[${expenseCount}][description]" required><br><br>
                <label>Amount:</label><br>
                <input type="number" name="expenses[${expenseCount}][amount]" step="0.01" required><br><br>
            `;
            container.appendChild(newExpense);
            expenseCount++;
        }

        // Toggle uneven split fields
        document.querySelectorAll('input[name="split_type"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const customFields = document.getElementById('custom-fields');
                customFields.style.display = (this.value === 'uneven') ? 'block' : 'none';
            });
        });
    </script>
</body>
</html>


