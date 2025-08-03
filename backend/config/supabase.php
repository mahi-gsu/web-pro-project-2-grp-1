<?php
class Supabase {
    private $supabase_url;
    private $supabase_key;
    private $headers;

    public function __construct() {
        // Load from .env.local in project root
        $envFile = __DIR__ . '/../../.env.local';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, '#') === 0) continue;
                list($name, $value) = explode('=', $line, 2);
                $name = trim($name);
                $value = trim($value);
                if (preg_match('/^(["\'])(.*)\1$/', $value, $matches)) {
                    $value = $matches[2];
                }
                putenv("$name=$value");
                $_ENV[$name] = $value;
            }
        }

        $this->supabase_url = getenv('VITE_SUPABASE_URL');
        $this->supabase_key = getenv('VITE_SUPABASE_ANON_KEY');

        $this->headers = [
            'Content-Type: application/json',
            'apikey: ' . $this->supabase_key,
            'Authorization: Bearer ' . $this->supabase_key
        ];
    }

    public function apiCall($endpoint, $method = 'GET', $data = null) {
        $url = $this->supabase_url . '/rest/v1/' . $endpoint;

        $headers = $this->headers;
        if ($data) {
            $headers[] = 'Content-Length: ' . strlen(json_encode($data));
        }

        $options = [
            'http' => [
                'method' => $method,
                'header' => implode("\r\n", $headers),
                'content' => $data ? json_encode($data) : null,
                'ignore_errors' => true
            ]
        ];

        $context = stream_context_create($options);
        $response = file_get_contents($url, false, $context);
        $responseHeaders = $http_response_header ?? [];

        if ($response === false) {
            throw new Exception('API call failed');
        }

        if (isset($responseHeaders[0])) {
            $statusLine = $responseHeaders[0];
            if (strpos($statusLine, '200') === false && strpos($statusLine, '201') === false) {
                throw new Exception('HTTP Error: ' . $statusLine . ' - Response: ' . $response);
            }
        }

        return json_decode($response, true);
    }

    // Auth methods
    public function signUp($email, $password) {
        $authUrl = $this->supabase_url . '/auth/v1/signup';
        $authData = [
            'email' => $email,
            'password' => $password
        ];

        $options = [
            'http' => [
                'method' => 'POST',
                'header' => implode("\r\n", $this->headers),
                'content' => json_encode($authData),
                'ignore_errors' => true
            ]
        ];

        $context = stream_context_create($options);
        $response = file_get_contents($authUrl, false, $context);

        if ($response === false) {
            throw new Exception('Signup failed');
        }

        return json_decode($response, true);
    }

    public function signIn($email, $password) {
        $authUrl = $this->supabase_url . '/auth/v1/token?grant_type=password';
        $authData = [
            'email' => $email,
            'password' => $password
        ];

        $options = [
            'http' => [
                'method' => 'POST',
                'header' => implode("\r\n", $this->headers),
                'content' => json_encode($authData),
                'ignore_errors' => true
            ]
        ];

        $context = stream_context_create($options);
        $response = file_get_contents($authUrl, false, $context);

        if ($response === false) {
            throw new Exception('Signin failed');
        }

        return json_decode($response, true);
    }

    public function signOut($accessToken) {
        $authUrl = $this->supabase_url . '/auth/v1/logout';
        $headers = array_merge($this->headers, ['Authorization: Bearer ' . $accessToken]);

        $options = [
            'http' => [
                'method' => 'POST',
                'header' => implode("\r\n", $headers),
                'ignore_errors' => true
            ]
        ];

        $context = stream_context_create($options);
        $response = file_get_contents($authUrl, false, $context);

        return json_decode($response, true);
    }

    // User methods
    public function createUserProfile($userId, $email, $username) {
        $userData = [
            'id' => $userId,
            'username' => $username,
            'email' => $email,
            'role' => 'player',
            'registration_date' => date('c'),
            'is_active' => true,
            'sound_setting' => true
        ];
        return $this->apiCall("users", 'POST', $userData);
    }

    public function updateUserSoundSetting($userId, $soundSetting) {
        $updateData = ['sound_setting' => $soundSetting];
        return $this->apiCall("users?id=eq." . urlencode($userId), 'PATCH', $updateData);
    }

    public function getUsers() {
        return $this->apiCall("users");
    }

    public function deleteUser($userId) {
        return $this->apiCall("users?id=eq." . urlencode($userId), 'DELETE');
    }

    // Game stats methods
    public function saveGameStats($gameStats) {
        return $this->apiCall("game_stats", 'POST', $gameStats);
    }

    public function getGameStats($userId = null, $puzzleType = null) {
        $endpoint = "game_stats";
        $params = [];
        
        if ($userId) $params[] = "user_id=eq." . urlencode($userId);
        if ($puzzleType) $params[] = "puzzle_type=eq." . urlencode($puzzleType);
        
        if (!empty($params)) {
            $endpoint .= "?" . implode("&", $params);
        }
        
        return $this->apiCall($endpoint);
    }

    public function getLeaderboard($puzzleType = null) {
        // Use a more complex query to get user information
        $endpoint = "game_stats";
        $params = [
            "select=*,users!inner(username)",
            "order=time_taken_seconds.asc",
            "limit=100"
        ];
        
        if ($puzzleType) {
            $params[] = "puzzle_type=eq." . urlencode($puzzleType);
        }
        
        $endpoint .= "?" . implode("&", $params);
        return $this->apiCall($endpoint);
    }

    // Image methods
    public function uploadImage($imageData) {
        return $this->apiCall("background_images", 'POST', $imageData);
    }

    public function getImages() {
        return $this->apiCall("background_images");
    }

    public function deleteImage($imageId) {
        return $this->apiCall("background_images?image_id=eq." . urlencode($imageId), 'DELETE');
    }
}
?> 