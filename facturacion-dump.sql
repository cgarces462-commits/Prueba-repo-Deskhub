/*M!999999\- enable the sandbox mode */ 

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;
DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero_cuenta` varchar(20) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `nit` varchar(20) NOT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `barrio` varchar(100) DEFAULT NULL,
  `estrato` int(11) NOT NULL DEFAULT 3,
  `tipo` enum('residencial','comercial','oficial') NOT NULL DEFAULT 'residencial',
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `medidor` varchar(30) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_cuenta` (`numero_cuenta`),
  UNIQUE KEY `nit` (`nit`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES
(1,'MED-001-0001','Carlos Alberto Pérez Gómez','1.234.567.890','Cra 45 #67-12','Envigado',4,'residencial','3001234567','carlos@correo.com','AC-0001234',1,'2026-09-14 15:10:16','2026-09-14 15:10:16'),
(2,'MED-001-0002','Empresa ABC S.A.S.','900.123.456-7','Cra 80 #12-34','Zona Industrial',6,'comercial','3109876543','facturacion@empresaabc.co','EN-0005678',1,'2026-09-14 15:10:16','2026-09-14 15:10:16'),
(3,'MED-001-0003','María Fernanda López Ríos','1.098.765.432','Calle 10 #5-89','Sabaneta',3,'residencial','3155556666','maria@correo.com','AC-0009876',1,'2026-09-14 15:10:16','2026-09-14 15:10:16'),
(4,'MED-001-0004','Cliente Demo Medellín','1.123.456.789','Cra 7 #45-12','Centro',3,'residencial','3009998888','cliente@facturacionmedellin.com','AC-0003210',1,'2026-09-14 15:16:22','2026-09-14 15:16:22');
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
DROP TABLE IF EXISTS `facturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `facturas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente_id` int(11) NOT NULL,
  `tarifa_id` int(11) NOT NULL,
  `periodo_mes` int(11) NOT NULL,
  `periodo_anio` int(11) NOT NULL,
  `consumo` decimal(12,2) NOT NULL DEFAULT 0.00,
  `valor_unitario_aplicado` decimal(12,2) NOT NULL DEFAULT 0.00,
  `valor_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `fecha_emision` date NOT NULL,
  `fecha_limite` date NOT NULL,
  `estado` enum('emitida','pagada','vencida','anulada') NOT NULL DEFAULT 'emitida',
  `notas` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `tarifa_id` (`tarifa_id`),
  CONSTRAINT `1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`tarifa_id`) REFERENCES `tarifas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `facturas` WRITE;
/*!40000 ALTER TABLE `facturas` DISABLE KEYS */;
INSERT INTO `facturas` VALUES
(1,1,2,9,2026,120.00,6800.00,816000.00,'2026-09-14','2026-09-30','emitida','Verificacion','2026-09-14 15:14:55','2026-09-14 15:14:55'),
(2,4,1,9,2026,50.00,4825.00,241250.00,'2026-09-14','2026-09-30','emitida',NULL,'2026-09-14 15:16:44','2026-09-14 15:16:44');
/*!40000 ALTER TABLE `facturas` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `factura_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `metodo` enum('caja','banco','movil') NOT NULL DEFAULT 'caja',
  `valor_pagado` decimal(12,2) NOT NULL,
  `fecha_pago` datetime NOT NULL,
  `referencia` varchar(50) DEFAULT NULL,
  `notas` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `factura_id` (`factura_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `1` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
INSERT INTO `pagos` VALUES
(1,1,3,'banco',100000.00,'2026-09-14 15:15:12','TEST-001',NULL,'2026-09-14 15:15:12','2026-09-14 15:15:12');
/*!40000 ALTER TABLE `pagos` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `descripcion` varchar(150) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES
(1,'super_admin','Control total del sistema','2026-09-14 15:10:16','2026-09-14 15:10:16'),
(2,'administrador','Gestiona clientes, servicios y tarifas','2026-09-14 15:10:16','2026-09-14 15:10:16'),
(3,'facturador','Crea facturas y registra pagos','2026-09-14 15:10:16','2026-09-14 15:10:16'),
(4,'cliente','Consulta sus facturas y paga','2026-09-14 15:10:16','2026-09-14 15:10:16'),
(5,'auditor','Solo lectura sobre todo el sistema','2026-09-14 15:10:16','2026-09-14 15:10:16');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
DROP TABLE IF EXISTS `servicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `abreviatura` varchar(10) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `abreviatura` (`abreviatura`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `servicios` WRITE;
/*!40000 ALTER TABLE `servicios` DISABLE KEYS */;
INSERT INTO `servicios` VALUES
(1,'Acueducto','ACUE','Servicio de agua potable',1,'2026-09-14 15:10:16','2026-09-14 15:10:16'),
(2,'Alcantarillado','ALCA','Servicio de evacuación de aguas residuales',1,'2026-09-14 15:10:16','2026-09-14 15:10:16'),
(3,'Energía Eléctrica','ENER','Servicio de energía eléctrica',1,'2026-09-14 15:10:16','2026-09-14 15:10:16'),
(4,'Gas Natural','GAS','Servicio de distribución de gas natural',1,'2026-09-14 15:10:16','2026-09-14 15:10:16'),
(5,'Aseo','ASEO','Servicio de recolección de residuos',1,'2026-09-14 15:10:16','2026-09-14 15:10:16');
/*!40000 ALTER TABLE `servicios` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
DROP TABLE IF EXISTS `tarifas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarifas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `servicio_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `valor_unitario` decimal(12,2) NOT NULL DEFAULT 0.00,
  `unidad` varchar(30) NOT NULL DEFAULT 'm3',
  `vigencia_desde` date NOT NULL,
  `vigencia_hasta` date DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `servicio_id` (`servicio_id`),
  CONSTRAINT `1` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `tarifas` WRITE;
/*!40000 ALTER TABLE `tarifas` DISABLE KEYS */;
INSERT INTO `tarifas` VALUES
(1,1,'Tarifa Residencial',4825.00,'m3','2026-01-01','2026-12-31',1,'2026-09-14 15:10:16','2026-09-14 15:10:16'),
(2,1,'Tarifa Comercial',6800.00,'m3','2026-01-01','2026-12-31',1,'2026-09-14 15:10:16','2026-09-14 15:10:16'),
(3,2,'Tarifa Alcantarillado',2413.00,'m3','2026-01-01','2026-12-31',1,'2026-09-14 15:10:16','2026-09-14 15:10:16'),
(4,3,'Tarifa Básica Residencial',632.00,'kWh','2026-01-01','2026-12-31',1,'2026-09-14 15:10:16','2026-09-14 15:10:16'),
(5,4,'Tarifa Gas Natural',1850.00,'m3','2026-01-01','2026-12-31',1,'2026-09-14 15:10:16','2026-09-14 15:10:16'),
(6,5,'Tarifa Aseo Residencial',8500.00,'mes','2026-01-01','2026-12-31',1,'2026-09-14 15:10:16','2026-09-14 15:10:16');
/*!40000 ALTER TABLE `tarifas` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `apellido` varchar(80) DEFAULT NULL,
  `email` varchar(120) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `role_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'Super','Admin','superadmin@facturacionmedellin.com','$2a$10$gaAW2SGVg.AXuN/EHhoE9uFuFHuzoWWSHUDucuUcW8DDrEdzMBpH2',NULL,1,1,'2026-09-14 15:10:16','2026-09-14 15:10:16'),
(2,'Admin','Medellín','admin@facturacionmedellin.com','$2a$10$7chWeBte6tJJjXRrFnuBrOk2BeNWzqkboDkP/G2mlZIV2CA5lfStO',NULL,1,2,'2026-09-14 15:10:16','2026-09-14 15:10:16'),
(3,'Facturador','Medellín','facturador@facturacionmedellin.com','$2a$10$USG0kMyCFCyIqk/E5pWAy.oaFkRgJOLNBPLINfIk1JzVlaoW/qpUC',NULL,1,3,'2026-09-14 15:10:16','2026-09-14 15:10:16'),
(4,'Cliente','Medellín','cliente@facturacionmedellin.com','$2a$10$YNKohiIOZtGfkzuy1GgEYOi11BcBCOcwJ5SwsfMq/tNVKQx3Glc7K',NULL,1,4,'2026-09-14 15:10:16','2026-09-14 15:10:16'),
(5,'Auditor','Medellín','auditor@facturacionmedellin.com','$2a$10$WAltK6n4xdMPq6ibsZw5Du5zVyyUwDgqeM9JdMPMfzxnMXTb0nR4S',NULL,1,5,'2026-09-14 15:10:16','2026-09-14 15:10:16');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

