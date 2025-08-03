<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
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
            $result = $supabase->getImages();
            http_response_code(200);
            echo json_encode($result);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['image_name']) || !isset($data['image_url'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Image name and URL required']);
            exit;
        }

        $imageData = [
            'image_name' => $data['image_name'],
            'image_url' => $data['image_url'],
            'is_active' => $data['is_active'] ?? true,
            'uploaded_by_user_id' => $data['uploaded_by_user_id'] ?? null
        ];

        try {
            $result = $supabase->uploadImage($imageData);
            http_response_code(201);
            echo json_encode(['message' => 'Image uploaded successfully', 'data' => $result]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['image_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Image ID required']);
            exit;
        }

        try {
            $result = $supabase->deleteImage($data['image_id']);
            http_response_code(200);
            echo json_encode(['message' => 'Image deleted successfully']);
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