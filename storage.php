<?php
/**
 * DnD Valten — Character Sheet Storage API
 *
 * SETUP:
 * 1. Upload this file to your hosting (e.g. public_html/valten/storage.php)
 * 2. Create a  data/  directory next to it and add a .htaccess inside:
 *       Deny from all
 * 3. Set API_KEY below to a random secret.
 * 4. In Vercel project settings → Environment Variables, add:
 *       PHP_STORAGE_URL  =  https://yourdomain.com/valten/storage.php
 *       PHP_STORAGE_KEY  =  [same value as API_KEY]
 *
 * Resources (pass as ?r=...):
 *   state   – character runtime state JSON  (GET / PUT)
 *   config  – sheet-synced config JSON      (GET / PUT)
 *   avatar  – avatar image                  (GET returns image, PUT accepts {mimeType,b64})
 */

define('API_KEY',  'DNDValtenKey');
define('DATA_DIR', __DIR__ . '/data');

// ── Auth ──────────────────────────────────────────────────────────────────────
// Key arrives as ?k= query param — avoids Apache stripping the Authorization header.
$key = $_GET['k'] ?? '';
if ($key !== API_KEY) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'unauthorized']);
    exit;
}

// ── Route ─────────────────────────────────────────────────────────────────────
$resource = $_GET['r'] ?? '';
if (!in_array($resource, ['state', 'config', 'avatar'], true)) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'invalid_resource']);
    exit;
}

if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}

$file   = DATA_DIR . '/' . $resource . '.json';
$method = $_SERVER['REQUEST_METHOD'];

// ── GET ───────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    if (!file_exists($file)) {
        if ($resource === 'avatar') {
            http_response_code(404);
        } else {
            header('Content-Type: application/json');
            header('Cache-Control: no-store');
            echo '{}';
        }
        exit;
    }

    if ($resource === 'avatar') {
        $data = json_decode(file_get_contents($file), true);
        if (!$data || empty($data['b64'])) {
            http_response_code(404);
            exit;
        }
        header('Content-Type: ' . ($data['mimeType'] ?? 'image/png'));
        header('Cache-Control: public, max-age=31536000, immutable');
        echo base64_decode($data['b64']);
    } else {
        header('Content-Type: application/json');
        header('Cache-Control: no-store');
        echo file_get_contents($file);
    }
    exit;
}

// ── PUT ───────────────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $body = file_get_contents('php://input');
    $data = json_decode($body, true);

    if ($data === null) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'invalid_json']);
        exit;
    }

    if ($resource === 'avatar' && empty($data['b64'])) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'missing_b64']);
        exit;
    }

    file_put_contents($file, $body, LOCK_EX);
    header('Content-Type: application/json');
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
header('Content-Type: application/json');
echo json_encode(['error' => 'method_not_allowed', 'method' => $method]);
