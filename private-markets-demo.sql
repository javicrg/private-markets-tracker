CREATE DATABASE IF NOT EXISTS `private_markets_tracker` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `private_markets_tracker`;

CREATE TABLE IF NOT EXISTS `customers` (
  `codigo` varchar(15) NOT NULL DEFAULT '',
  `products` longtext NOT NULL DEFAULT '',
  PRIMARY KEY (`codigo`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `name` varchar(50) NOT NULL DEFAULT '',
  `label` varchar(50) DEFAULT NULL,
  `capitalCalls` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '',
  `distributions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '',
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- All names, commitments, and cash-flow assumptions are fictional demo data.
INSERT INTO `customers` (`codigo`, `products`) VALUES
  ('demo-investor-1', '[{"id":"1","name":"northstar-growth-fund","entryDate":"","compromiso":100000,"buyType":"emision"},{"id":"2","name":"harbor-secondary-opportunities","entryDate":"2024-01-15","compromiso":75000,"buyType":"secundario","valorCompra":68000}]'),
  ('demo-investor-2', '[{"id":"3","name":"northstar-growth-fund","entryDate":"","compromiso":150000,"buyType":"emision"},{"id":"4","name":"summit-infrastructure-fund","entryDate":"2023-07-01","compromiso":125000,"buyType":"ampliacion"}]');

INSERT INTO `products` (`name`, `label`, `capitalCalls`, `distributions`) VALUES
  ('northstar-growth-fund', 'Northstar Growth Fund', '[{"type":"actual","date":"2022-01-01","percentage":20},{"type":"actual","date":"2023-01-01","percentage":25},{"type":"actual","date":"2024-01-01","percentage":20},{"type":"projected","date":"2025-01-01","percentage":15}]', '[{"type":"actual","date":"2024-01-01","percentage":8},{"type":"projected","date":"2025-01-01","percentage":15},{"type":"projected","date":"2026-01-01","percentage":25},{"type":"projected","date":"2027-01-01","percentage":30}]'),
  ('harbor-secondary-opportunities', 'Harbor Secondary Opportunities', '[{"type":"actual","date":"2023-01-01","percentage":45},{"type":"actual","date":"2024-01-01","percentage":30},{"type":"projected","date":"2025-01-01","percentage":15}]', '[{"type":"projected","date":"2025-01-01","percentage":10},{"type":"projected","date":"2026-01-01","percentage":25},{"type":"projected","date":"2027-01-01","percentage":35},{"type":"projected","date":"2028-01-01","percentage":20}]'),
  ('summit-infrastructure-fund', 'Summit Infrastructure Fund', '[{"type":"actual","date":"2021-01-01","percentage":15},{"type":"actual","date":"2022-01-01","percentage":20},{"type":"actual","date":"2023-01-01","percentage":20},{"type":"projected","date":"2024-01-01","percentage":20}]', '[{"type":"projected","date":"2025-01-01","percentage":8},{"type":"projected","date":"2026-01-01","percentage":18},{"type":"projected","date":"2027-01-01","percentage":28},{"type":"projected","date":"2028-01-01","percentage":32}]');
