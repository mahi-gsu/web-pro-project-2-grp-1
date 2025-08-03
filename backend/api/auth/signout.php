<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/supabase.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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

    try {
        $supabase = new Supabase();
        $result = $supabase->signOut($accessToken);
        
        http_response_code(200);
        echo json_encode(['message' => 'Signed out successfully']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?> 