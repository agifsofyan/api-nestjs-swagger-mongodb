return [
    'mongodb' => [
        'driver' => 'mongodb',
        'dsn' => env('DB_DSN'),
        'database' => env('DB_DATABASE', 'homestead'),
    ]
]