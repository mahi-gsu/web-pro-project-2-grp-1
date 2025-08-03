<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/supabase.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $puzzleType = $_GET['puzzle_type'] ?? null;
    
    try {
        $supabase = new Supabase();
        $result = $supabase->getLeaderboard($puzzleType);
        
        http_response_code(200);
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?> 