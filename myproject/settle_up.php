<?php
session_start();
require_once 'db_connect.php';

// Ensure the user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

$user_id = $_SESSION['user_id'];

// Fetch group ID of the logged-in user
$sql_group = "SELECT group_id FROM users WHERE user_id = ?";
$stmt_group = $conn->prepare($sql_group);
$stmt_group->bind_param('i', $user_id);
$stmt_group->execute();
$result_group = $stmt_group->get_result();
$user = $result_group->fetch_assoc();

if (!$user['group_id']) {
    echo "You are not part of any group.";
    exit();
}

$group_id = $user['group_id'];

// Fetch all expenses for the group
$sql_expenses = "SELECT e.expense_id, e.description, e.amount, e.paid_by, e.split_type, e.created_at, u.username AS payer_name, e.status
                 FROM expense_details e
                 JOIN users u ON e.paid_by = u.user_id
                 WHERE e.group_id = ?
                 ORDER BY e.created_at DESC";
$stmt_expenses = $conn->prepare($sql_expenses);
$stmt_expenses->bind_param('i', $group_id);
$stmt_expenses->execute();
$result_expenses = $stmt_expenses->get_result();

$expenses = [];
while ($row = $result_expenses->fetch_assoc()) {
    $expenses[] = $row;
}

// Fetch group members
$sql_members = "SELECT user_id, username FROM users WHERE group_id = ?";
$stmt_members = $conn->prepare($sql_members);
$stmt_members->bind_param('i', $group_id);
$stmt_members->execute();
$result_members = $stmt_members->get_result();

$members = [];
while ($row = $result_members->fetch_assoc()) {
    $members[$row['user_id']] = $row['username'];
}

// Initialize paid and owed arrays with zero for each member in the group
$paid = array_fill_keys(array_keys($members), 0); // All members start with 0 paid
$owed = array_fill_keys(array_keys($members), 0); // All members start with 0 owed

// Calculate total paid and owed per member
foreach ($expenses as $expense) {
    $expense_id = $expense['expense_id'];
    $amount = $expense['amount'];
    $paid_by = $expense['paid_by'];

    // Add to paid amount for the payer
    $paid[$paid_by] += $amount;

    // Fetch transactions for this expense
    $sql_transactions = "SELECT user_id, amount FROM transactions WHERE expense_id = ?";
    $stmt_transactions = $conn->prepare($sql_transactions);
    $stmt_transactions->bind_param('i', $expense_id);
    $stmt_transactions->execute();
    $result_transactions = $stmt_transactions->get_result();

    // Add owed amounts for members who are part of this expense
    while ($row = $result_transactions->fetch_assoc()) {
        $user_id = $row['user_id'];
        $owed[$user_id] += $row['amount'];
    }
}

// Calculate net balances (paid - owed)
$net_balance = [];
foreach ($members as $member_id => $member_name) {
    $net_balance[$member_id] = $paid[$member_id] - $owed[$member_id];
}

// Settlement calculations
$settlements = [];
$creditors = [];
$debtors = [];

foreach ($net_balance as $user_id => $balance) {
    if ($balance > 0) {
        $creditors[$user_id] = $balance;
    } elseif ($balance < 0) {
        $debtors[$user_id] = -$balance; // Store as positive owed amount
    }
}

// Match debtors to creditors and create settlement suggestions
foreach ($debtors as $debtor_id => $debt_amount) {
    foreach ($creditors as $creditor_id => $credit_amount) {
        if ($debt_amount == 0) {
            break;
        }

        $settle_amount = min($debt_amount, $credit_amount);

        $settlements[] = [
            'from' => $members[$debtor_id],
            'to' => $members[$creditor_id],
            'amount' => $settle_amount
        ];

        $debt_amount -= $settle_amount;
        $creditors[$creditor_id] -= $settle_amount;

        if ($creditors[$creditor_id] == 0) {
            unset($creditors[$creditor_id]);
        }
    }
}

// Handling the "Confirm Settlement" functionality
if (isset($_POST['settle'])) {
    $expense_id = $_POST['expense_id'];
    $sql_settle = "UPDATE expense_details SET status = 'settled' WHERE expense_id = ?";
    $stmt_settle = $conn->prepare($sql_settle);
    $stmt_settle->bind_param('i', $expense_id);
    $stmt_settle->execute();

    // Redirect to settle up page to reflect changes
    header('Location: settle_up.php');
    exit();
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Settle Up</title>
</head>
<body>
    <h2>Group Expenses</h2>
    <table border="1">
        <tr>
            <th>Description</th>
            <th>Amount</th>
            <th>Paid By</th>
            <th>Split Type</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
        </tr>
        <?php foreach ($expenses as $expense): ?>
            <tr>
                <td><?php echo htmlspecialchars($expense['description']); ?></td>
                <td><?php echo number_format($expense['amount'], 2); ?></td>
                <td><?php echo htmlspecialchars($expense['payer_name']); ?></td>
                <td><?php echo htmlspecialchars($expense['split_type']); ?></td>
                <td><?php echo htmlspecialchars($expense['created_at']); ?></td>
                <td><?php echo htmlspecialchars($expense['status']); ?></td>
                <td>
                    <?php if ($expense['status'] == 'pending'): ?>
                        <form method="POST" action="">
                            <input type="hidden" name="expense_id" value="<?php echo $expense['expense_id']; ?>">
                            <input type="submit" name="settle" value="Confirm Settlement">
                        </form>
                    <?php else: ?>
                        <p>Settled</p>
                    <?php endif; ?>
                </td>
            </tr>
        <?php endforeach; ?>
    </table>

    <h2>Balances</h2>
    <table border="1">
        <tr>
            <th>Member</th>
            <th>Paid</th>
            <th>Owed</th>
            <th>Net Balance</th>
        </tr>
        <?php foreach ($members as $member_id => $member_name): ?>
            <tr>
                <td><?php echo htmlspecialchars($member_name); ?></td>
                <td><?php echo number_format($paid[$member_id], 2); ?></td>
                <td><?php echo number_format($owed[$member_id], 2); ?></td>
                <td><?php echo number_format($net_balance[$member_id], 2); ?></td>
            </tr>
        <?php endforeach; ?>
    </table>

    <h2>Settlements</h2>
    <?php if (empty($settlements)): ?>
        <p>All balances are settled.</p>
    <?php else: ?>
        <ul>
            <?php foreach ($settlements as $settlement): ?>
                <li><?php echo htmlspecialchars($settlement['from']); ?> owes <?php echo htmlspecialchars($settlement['to']); ?>: <?php echo number_format($settlement['amount'], 2); ?></li>
            <?php endforeach; ?>
        </ul>
    <?php endif; ?>
</body>
</html>

    

