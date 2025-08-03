<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/supabase.php';

$supabase = new Supabase();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        try {
            $result = $supabase->getUsers();
            http_response_code(200);
            echo json_encode($result);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['user_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID required']);
            exit;
        }

        try {
            $result = $supabase->deleteUser($data['user_id']);
            http_response_code(200);
            echo json_encode(['message' => 'User deleted successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?> 