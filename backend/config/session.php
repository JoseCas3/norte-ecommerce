<?php

return ['driver' => 'file', 'lifetime' => 120, 'files' => storage_path('framework/sessions'), 'cookie' => 'norte_api_session', 'path' => '/', 'http_only' => true, 'same_site' => 'lax'];
