-- =============================================================
-- Orders table for the order-service
-- Mount this file as docker-entrypoint-initdb.d/02-orders.sql
-- so it runs after 01-aether_motors.sql on first DB init.
-- =============================================================

USE aether_motors;

CREATE TABLE IF NOT EXISTS Orders (
    OrderID    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    OrderRef   VARCHAR(50)  NOT NULL UNIQUE,          -- e.g. AM-2026-04F9X1
    Status     ENUM('created', 'paid', 'cancelled') NOT NULL DEFAULT 'created',
    Type       VARCHAR(50),                            -- 'merchandise' | 'vehicle'
    CartReference VARCHAR(255),
    VehicleId  VARCHAR(255),
    VehicleName VARCHAR(255),
    Config     JSON,
    Customer   JSON,
    Address    JSON,
    Items      JSON,
    Totals     JSON,
    CreatedAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
