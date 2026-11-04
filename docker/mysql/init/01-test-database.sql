-- Roda só na primeira criação do volume. Banco separado para os testes (etapa 6).
CREATE DATABASE IF NOT EXISTS shoplite_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON shoplite_test.* TO 'shoplite'@'%';
