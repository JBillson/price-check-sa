-- Insert admin user
INSERT INTO `User` (`id`, `email`, `name`, `password`, `role`, `createdAt`, `updatedAt`)
VALUES (
    'admin_user',
    'justinbillson@gmail.com',
    'Justin Billson',
    '$2b$10$EImV6J02AYVoZP5H1IJMi.qj9BT6WgVEXTAcQbX29esUYoqPk0aM.',
    'ADMIN',
    NOW(),
    NOW()
); 