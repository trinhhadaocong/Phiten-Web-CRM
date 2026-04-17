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
    $c_id = $input['customer_id'];
    $name = $input['name'] ?? '';
    $phone = $input['phone'] ?? '';
    $email = $input['email'] ?? '';
    $address = $input['address'] ?? '';
    $location = $input['location'] ?? '';
    $gender = $input['gender'] ?? '';
    $membership = $input['membership'] ?? '';
    $status = $input['status'] ?? '';
    $sports = $input['sports'] ?? '';
    $channel = $input['channel'] ?? '';
    $account = $input['account'] ?? '';
    $zalo_oa = $input['zalo_oa'] ?? '';
    $medical = $input['medical'] ?? '';
    $job = $input['job'] ?? '';
    $foreign_cust = $input['foreign_cust'] ?? '';
    $note = $input['note'] ?? '';
    $assignee = $input['assignee'] ?? '';
    $revenue = floatval(str_replace(',', '', $input['revenue'] ?? '0'));
    $stage = $input['stage'] ?? '';

    // Dates
    $member_date = format_date($input['member_date'] ?? '');
    $birthday = format_date($input['birthday'] ?? '');
    $first_date = format_date($input['first_purchase_date'] ?? '');
    $last_date = format_date($input['last_purchase_date'] ?? '');

    // UPSERT Logic using Prepared Statements
    $sql = "INSERT INTO customers (
                customer_id, name, phone, email, address, location, gender,
                member_date, birthday, membership, status, sports, channel,
                account, zalo_oa, medical, job, foreign_cust, note, assignee,
                revenue, stage, first_purchase_date, last_purchase_date
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            ) ON DUPLICATE KEY UPDATE 
                name = VALUES(name),
                phone = VALUES(phone),
                email = VALUES(email),
                address = VALUES(address),
                location = VALUES(location),
                gender = VALUES(gender),
                membership = VALUES(membership),
                status = VALUES(status),
                sports = VALUES(sports),
                channel = VALUES(channel),
                account = VALUES(account),
                zalo_oa = VALUES(zalo_oa),
                medical = VALUES(medical),
                job = VALUES(job),
                foreign_cust = VALUES(foreign_cust),
                note = VALUES(note),
                assignee = VALUES(assignee),
                revenue = VALUES(revenue),
                stage = VALUES(stage),
                last_purchase_date = VALUES(last_purchase_date)";

    $stmt = $conn->prepare($sql);
    
    // Type string: 20 strings ('s'), 1 double ('d'), 1 string ('s'), 2 strings ('s') = 24 parameters
    // Wait, let's count carefully:
    // 1(id), 2(name), 3(phone), 4(email), 5(address), 6(loc), 7(gender), 8(member_date), 9(birthday), 
    // 10(membership), 11(status), 12(sports), 13(channel), 14(account), 15(zalo), 16(medical), 
    // 17(job), 18(foreign), 19(note), 20(assignee), 21(revenue - d), 22(stage), 23(first), 24(last)
    // types: s s s s s s s s s s s s s s s s s s s s d s s s
    $types = "ssssssssssssssssssssdsss";
    
    $stmt->bind_param($types, 
        $c_id, $name, $phone, $email, $address, $location, $gender,
        $member_date, $birthday, $membership, $status, $sports, $channel,
        $account, $zalo_oa, $medical, $job, $foreign_cust, $note, $assignee,
        $revenue, $stage, $first_date, $last_date
    );

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Customer processed successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "SQL Error: " . $stmt->error]);
    }
    $stmt->close();
}

$conn->close();
?>
