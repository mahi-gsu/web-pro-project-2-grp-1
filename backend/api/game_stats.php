<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/supabase.php';

$supabase = new Supabase();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['user_id']) || !isset($data['puzzle_type']) || 
            !isset($data['time_taken_seconds']) || !isset($data['moves_count'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }

        try {
            $result = $supabase->saveGameStats($data);
            http_response_code(201);
            echo json_encode(['message' => 'Game stats saved successfully', 'data' => $result]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'GET':
        $userId = $_GET['user_id'] ?? null;
        $puzzleType = $_GET['puzzle_type'] ?? null;
        
        try {
            $result = $supabase->getGameStats($userId, $puzzleType);
            http_response_code(200);
            echo json_encode($result);
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