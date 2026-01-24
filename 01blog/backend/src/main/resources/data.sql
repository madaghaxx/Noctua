-- Initialize admin user for testing
-- Password is 'admin123' (BCrypt encoded)
INSERT INTO
    users (
        id,
        username,
        email,
        password,
        role,
        status,
        created_at,
        updated_at
    )
VALUES
    (
        '550e8400-e29b-41d4-a716-446655440000',
        'admin',
        'admin@noctua.com',
        '$2a$10$8K3W2VzJfQ8JcXcQgQX8MeO8JcXcQgQX8MeO8JcXcQgQX8MeO8JcXc', -- admin123
        'ADMIN',
        'ACTIVE',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ) ON CONFLICT (username) DO NOTHING;