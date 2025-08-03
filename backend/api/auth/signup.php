<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/supabase.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['email']) || !isset($data['password']) || !isset($data['username'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email, password, and username are required']);
        exit;
    }

    try {
        $supabase = new Supabase();
        
        // Sign up with Supabase Auth
        $authResult = $supabase->signUp($data['email'], $data['password']);
        
        if (isset($authResult['user']['id'])) {
            $userId = $authResult['user']['id'];
            
            // Create user profile in public.users table
            $profileResult = $supabase->createUserProfile($userId, $data['email'], $data['username']);
            
            http_response_code(201);
            echo json_encode([
                'user' => $authResult['user'],
                'session' => $authResult['session'] ?? null,
                'profile' => $profileResult[0] ?? null
            ]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Signup failed', 'details' => $authResult]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?> 