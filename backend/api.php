<?php
// api.php - Phiten Vietnam CRM API
require_once 'db_config.php';

// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-API-Key");

// Handle Preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Security Check: API Key Verification
$headers = getallheaders();
$received_key = $headers['X-API-Key'] ?? $_GET['api_key'] ?? null;

if ($received_key !== API_KEY) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized: Invalid API Key"]);
    exit();
}

$conn = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

// Helper function to format date from DD/MM/YYYY to YYYY-MM-DD for MySQL
function format_date($vn_date) {
    if (empty($vn_date) || $vn_date == 'NON') return null;
    $parts = explode('/', $vn_date);
    if (count($parts) == 3) {
        return "{$parts[2]}-{$parts[1]}-{$parts[0]}";
    }
    return null;
}

if ($method === 'GET') {
    // GET: Retrieve all customers for RFM analysis
    $sql = "SELECT * FROM customers ORDER BY last_purchase_date DESC";
    $result = $conn->query($sql);
    
    $customers = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $customers[] = $row;
        }
    }
    echo json_encode($customers);

} elseif ($method === 'POST') {
    // POST: Add or Update Customer
    $input = json_decode(file_get_contents("php://input"), true);
    
    if (!$input || !isset($input['customer_id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid Input: customer_id is required"]);
        exit();
    }

    // Mapping and Sanity
    $c_id = $conn->real_escape_string($input['customer_id']);
    $name = $conn->real_escape_string($input['name'] ?? '');
    $phone = $conn->real_escape_string($input['phone'] ?? '');
    $email = $conn->real_escape_string($input['email'] ?? '');
    $address = $conn->real_escape_string($input['address'] ?? '');
    $location = $conn->real_escape_string($input['location'] ?? '');
    $gender = $conn->real_escape_string($input['gender'] ?? '');
    $membership = $conn->real_escape_string($input['membership'] ?? '');
    $status = $conn->real_escape_string($input['status'] ?? '');
    $sports = $conn->real_escape_string($input['sports'] ?? '');
    $channel = $conn->real_escape_string($input['channel'] ?? '');
    $account = $conn->real_escape_string($input['account'] ?? '');
    $zalo_oa = $conn->real_escape_string($input['zalo_oa'] ?? '');
    $medical = $conn->real_escape_string($input['medical'] ?? '');
    $job = $conn->real_escape_string($input['job'] ?? '');
    $foreign_cust = $conn->real_escape_string($input['foreign_cust'] ?? '');
    $note = $conn->real_escape_string($input['note'] ?? '');
    $assignee = $conn->real_escape_string($input['assignee'] ?? '');
    $revenue = floatval(str_replace(',', '', $input['revenue'] ?? '0'));
    $stage = $conn->real_escape_string($input['stage'] ?? '');

    // Dates
    $member_date = format_date($input['member_date'] ?? '');
    $birthday = format_date($input['birthday'] ?? '');
    $first_date = format_date($input['first_purchase_date'] ?? '');
    $last_date = format_date($input['last_purchase_date'] ?? '');

    // UPSERT Logic
    $sql = "INSERT INTO customers (
                customer_id, name, phone, email, address, location, gender,
                member_date, birthday, membership, status, sports, channel,
                account, zalo_oa, medical, job, foreign_cust, note, assignee,
                revenue, stage, first_purchase_date, last_purchase_date
            ) VALUES (
                '$c_id', '$name', '$phone', '$email', '$address', '$location', '$gender',
                " . ($member_date ? "'$member_date'" : "NULL") . ",
                " . ($birthday ? "'$birthday'" : "NULL") . ",
                '$membership', '$status', '$sports', '$channel',
                '$account', '$zalo_oa', '$medical', '$job', '$foreign_cust', '$note', '$assignee',
                $revenue, '$stage', 
                " . ($first_date ? "'$first_date'" : "NULL") . ", 
                " . ($last_date ? "'$last_date'" : "NULL") . "
            ) ON DUPLICATE KEY UPDATE 
                name = '$name',
                phone = '$phone',
                email = '$email',
                address = '$address',
                location = '$location',
                gender = '$gender',
                membership = '$membership',
                status = '$status',
                sports = '$sports',
                channel = '$channel',
                account = '$account',
                zalo_oa = '$zalo_oa',
                medical = '$medical',
                job = '$job',
                foreign_cust = '$foreign_cust',
                note = '$note',
                assignee = '$assignee',
                revenue = $revenue,
                stage = '$stage',
                last_purchase_date = " . ($last_date ? "'$last_date'" : "NULL") . "";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success", "message" => "Customer processed successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "SQL Error: " . $conn->error]);
    }
}

$conn->close();
?>
