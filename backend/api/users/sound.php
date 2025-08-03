<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/supabase.php';

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $headers = getallheaders();
    $accessToken = null;
    
    if (isset($headers['Authorization'])) {
        $accessToken = str_replace('Bearer ', '', $headers['Authorization']);
    }
    
    if (!$accessToken) {
        http_response_code(401);
        echo json_encode(['error' => 'Access token required']);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['user_id']) || !isset($data['sound_setting'])) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID and sound setting are required']);
        exit;
    }

    try {
        $supabase = new Supabase();
        $result = $supabase->updateUserSoundSetting($data['user_id'], $data['sound_setting']);
        
        http_response_code(200);
        echo json_encode(['message' => 'Sound setting updated successfully']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?> 