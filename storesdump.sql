-- MySQL dump 10.13  Distrib 5.7.30, for Linux (x86_64)
--
-- Host: localhost    Database: stores
-- ------------------------------------------------------
-- Server version	5.7.30-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accounts` (
  `account_id` int(11) NOT NULL AUTO_INCREMENT,
  `_number` varchar(255) NOT NULL,
  `_name` varchar(45) NOT NULL,
  `user_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`account_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (1,'JBU','1801 (Alnwick)',30,'2020-02-20 15:36:17','2020-07-06 13:21:18'),(2,'Test','Test',2,'2020-02-20 15:36:17','2020-02-20 15:36:17'),(3,'Tst1','Test1',2,'2020-04-07 15:34:50','2020-04-07 15:34:50'),(4,'Test','Test',26,'2020-07-06 13:28:42','2020-07-06 13:28:42'),(5,'tsfrgre','Test',28,'2020-07-06 13:29:04','2020-07-06 13:29:04'),(6,'dhrdtyh','dfxshdrh',27,'2020-07-06 16:07:59','2020-07-06 16:07:59');
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adjusts`
--

DROP TABLE IF EXISTS `adjusts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `adjusts` (
  `adjust_id` int(11) NOT NULL AUTO_INCREMENT,
  `size_id` int(11) NOT NULL,
  `stock_id` int(11) NOT NULL,
  `_type` varchar(10) NOT NULL,
  `_qty` int(11) NOT NULL,
  `_variance` int(11) NOT NULL,
  `_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` varchar(128) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`adjust_id`),
  UNIQUE KEY `count_id_UNIQUE` (`adjust_id`)
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adjusts`
--

LOCK TABLES `adjusts` WRITE;
/*!40000 ALTER TABLE `adjusts` DISABLE KEYS */;
INSERT INTO `adjusts` VALUES (3,258,112,'Count',2,2,'2020-02-18 11:23:27','2','2020-02-18 11:23:27','2020-07-02 14:50:36'),(4,260,113,'Count',1,1,'2020-02-18 11:24:24','2','2020-02-18 11:24:24','2020-07-02 14:50:36'),(5,259,114,'Count',1,1,'2020-02-18 11:41:49','2','2020-02-18 11:41:49','2020-07-02 14:50:36'),(6,261,115,'Count',1,1,'2020-02-18 11:43:04','2','2020-02-18 11:43:04','2020-07-02 14:50:36'),(7,128,35,'Count',4,-1,'2020-02-18 13:47:24','2','2020-02-18 13:47:25','2020-07-02 14:50:36'),(8,130,34,'Count',1,-1,'2020-02-18 13:47:24','2','2020-02-18 13:47:25','2020-07-02 14:50:36'),(9,131,33,'Count',0,0,'2020-02-18 13:47:24','2','2020-02-18 13:47:25','2020-07-02 14:50:36'),(10,133,32,'Count',1,0,'2020-02-18 13:47:24','2','2020-02-18 13:47:25','2020-07-02 14:50:36'),(11,134,31,'Count',1,1,'2020-02-18 13:47:24','2','2020-02-18 13:47:25','2020-07-02 14:50:36'),(12,135,30,'Count',1,0,'2020-02-18 13:47:24','2','2020-02-18 13:47:25','2020-07-02 14:50:36'),(13,139,29,'Count',1,-1,'2020-02-18 13:47:24','2','2020-02-18 13:47:25','2020-07-02 14:50:36'),(14,150,27,'Count',0,0,'2020-02-18 13:47:24','2','2020-02-18 13:47:25','2020-07-02 14:50:36'),(15,148,28,'Count',2,-2,'2020-02-18 13:47:24','2','2020-02-18 13:47:25','2020-07-02 14:50:36'),(16,151,26,'Count',0,0,'2020-02-18 13:47:24','2','2020-02-18 13:47:25','2020-07-02 14:50:36'),(17,152,25,'Count',0,-1,'2020-02-18 13:47:24','2','2020-02-18 13:47:25','2020-07-02 14:50:36'),(18,155,24,'Count',0,-2,'2020-02-18 13:47:24','2','2020-02-18 13:47:25','2020-07-02 14:50:36'),(19,156,23,'Count',0,-1,'2020-02-18 13:47:24','2','2020-02-18 13:47:25','2020-07-02 14:50:36'),(20,157,22,'Count',1,0,'2020-02-18 13:47:24','2','2020-02-18 13:47:25','2020-07-02 14:50:36'),(21,158,21,'Count',1,0,'2020-02-18 13:47:24','2','2020-02-18 13:47:25','2020-07-02 14:50:36'),(22,167,20,'Count',1,0,'2020-02-18 13:47:24','2','2020-02-18 13:47:25','2020-07-02 14:50:36'),(23,227,82,'Count',67,8,'2020-02-18 13:50:15','2','2020-02-18 13:50:15','2020-07-02 14:50:36'),(24,226,81,'Count',20,7,'2020-02-18 13:50:15','2','2020-02-18 13:50:15','2020-07-02 14:50:36'),(25,228,83,'Count',16,11,'2020-02-18 13:51:41','2','2020-02-18 13:51:41','2020-07-02 14:50:36'),(26,198,80,'Count',16,7,'2020-02-18 13:52:33','2','2020-02-18 13:52:33','2020-07-02 14:50:36'),(27,229,91,'Count',16,18,'2020-02-18 13:57:12','2','2020-02-18 13:57:12','2020-07-02 14:50:36'),(28,230,92,'Count',113,115,'2020-02-18 13:57:12','2','2020-02-18 13:57:12','2020-07-02 14:50:36'),(29,231,90,'Count',19,23,'2020-02-18 13:57:12','2','2020-02-18 13:57:12','2020-07-02 14:50:36'),(30,4,70,'Count',14,12,'2020-02-18 14:00:20','2','2020-02-18 14:00:20','2020-07-02 14:50:36'),(31,1,71,'Count',15,8,'2020-02-18 14:00:20','2','2020-02-18 14:00:20','2020-07-02 14:50:36'),(32,146,101,'Count',0,1,'2020-02-18 14:01:38','2','2020-02-18 14:01:38','2020-02-18 14:01:38'),(33,24,117,'Count',1,1,'2020-02-18 14:05:07','2','2020-02-18 14:05:07','2020-07-02 14:50:36'),(34,26,37,'Count',2,0,'2020-02-18 14:06:22','2','2020-02-18 14:06:23','2020-07-02 14:50:36'),(35,25,38,'Count',5,1,'2020-02-18 14:06:22','2','2020-02-18 14:06:23','2020-07-02 14:50:36'),(36,20,42,'Count',0,4,'2020-02-18 14:06:22','2','2020-02-18 14:06:23','2020-07-02 14:50:36'),(37,21,41,'Count',0,2,'2020-02-18 14:06:22','2','2020-02-18 14:06:23','2020-07-02 14:50:36'),(38,22,40,'Count',0,-1,'2020-02-18 14:06:22','2','2020-02-18 14:06:23','2020-07-02 14:50:36'),(39,23,39,'Count',4,1,'2020-02-18 14:06:22','2','2020-02-18 14:06:23','2020-07-02 14:50:36'),(40,20,120,'Count',1,1,'2020-02-18 14:09:44','2','2020-02-18 14:09:44','2020-07-02 14:50:36'),(41,21,119,'Count',4,4,'2020-02-18 14:09:44','2','2020-02-18 14:09:44','2020-07-02 14:50:36'),(42,22,118,'Count',6,6,'2020-02-18 14:09:44','2','2020-02-18 14:09:44','2020-07-02 14:50:36'),(43,56,50,'Count',2,0,'2020-02-18 14:13:06','2','2020-02-18 14:13:06','2020-07-02 14:50:36'),(44,59,48,'Count',2,2,'2020-02-18 14:13:06','2','2020-02-18 14:13:06','2020-07-02 14:50:36'),(45,57,49,'Count',3,2,'2020-02-18 14:13:06','2','2020-02-18 14:13:06','2020-07-02 14:50:36'),(46,58,98,'Count',0,2,'2020-02-18 14:13:06','2','2020-02-18 14:13:06','2020-07-02 14:50:36'),(47,60,47,'Count',0,1,'2020-02-18 14:13:06','2','2020-02-18 14:13:06','2020-07-02 14:50:36'),(48,61,46,'Count',7,2,'2020-02-18 14:13:06','2','2020-02-18 14:13:06','2020-07-02 14:50:36'),(49,62,45,'Count',0,0,'2020-02-18 14:13:06','2','2020-02-18 14:13:06','2020-07-02 14:50:36'),(50,70,43,'Count',1,0,'2020-02-18 14:13:06','2','2020-02-18 14:13:06','2020-07-02 14:50:36'),(51,63,73,'Count',0,0,'2020-02-18 14:13:06','2','2020-02-18 14:13:06','2020-07-02 14:50:36'),(52,112,58,'Count',1,1,'2020-02-18 14:14:58','2','2020-02-18 14:14:59','2020-07-02 14:50:36'),(53,113,57,'Count',1,0,'2020-02-18 14:14:58','2','2020-02-18 14:14:59','2020-07-02 14:50:36'),(54,114,56,'Count',22,20,'2020-02-18 14:14:58','2','2020-02-18 14:14:59','2020-07-02 14:50:36'),(55,115,55,'Count',1,-1,'2020-02-18 14:14:58','2','2020-02-18 14:14:59','2020-07-02 14:50:36'),(56,116,54,'Count',1,0,'2020-02-18 14:14:58','2','2020-02-18 14:14:59','2020-07-02 14:50:36'),(57,117,53,'Count',2,1,'2020-02-18 14:14:58','2','2020-02-18 14:14:59','2020-07-02 14:50:36'),(58,120,52,'Count',1,0,'2020-02-18 14:14:58','2','2020-02-18 14:14:59','2020-07-02 14:50:36'),(59,122,51,'Count',1,0,'2020-02-18 14:14:58','2','2020-02-18 14:14:59','2020-07-02 14:50:36'),(60,118,72,'Count',0,1,'2020-02-18 14:14:58','2','2020-02-18 14:14:59','2020-07-02 14:50:36'),(61,262,121,'Count',9,9,'2020-02-18 14:18:13','2','2020-02-18 14:18:13','2020-07-02 14:50:36'),(62,209,95,'Count',0,2,'2020-02-18 14:30:06','2','2020-02-18 14:30:06','2020-02-18 14:30:06'),(63,215,96,'Count',0,1,'2020-02-18 14:30:06','2','2020-02-18 14:30:06','2020-02-18 14:30:06'),(64,213,89,'Count',0,2,'2020-02-18 14:30:06','2','2020-02-18 14:30:06','2020-02-18 14:30:06'),(65,212,123,'Count',3,3,'2020-02-18 14:31:26','2','2020-02-18 14:31:26','2020-07-02 14:50:36'),(66,206,102,'Count',0,1,'2020-02-18 14:32:39','2','2020-02-18 14:32:40','2020-02-18 14:32:40'),(67,209,124,'Count',3,3,'2020-02-18 14:33:53','2','2020-02-18 14:33:53','2020-07-02 14:50:36'),(68,211,125,'Count',1,1,'2020-02-18 14:35:49','2','2020-02-18 14:35:49','2020-07-02 14:50:36'),(69,217,126,'Count',3,3,'2020-02-18 14:40:39','2','2020-02-18 14:40:39','2020-07-02 14:50:36'),(70,216,127,'Count',6,6,'2020-02-18 14:42:05','2','2020-02-18 14:42:05','2020-07-02 14:50:36'),(71,214,128,'Count',1,1,'2020-02-18 14:42:55','2','2020-02-18 14:42:55','2020-07-02 14:50:36'),(72,213,129,'Count',2,2,'2020-02-18 14:43:44','2','2020-02-18 14:43:44','2020-07-02 14:50:36'),(73,210,131,'Count',3,3,'2020-02-18 14:45:02','2','2020-02-18 14:45:02','2020-07-02 14:50:36'),(74,205,136,'Count',2,2,'2020-02-18 14:50:57','2','2020-02-18 14:50:57','2020-07-02 14:50:36'),(75,204,137,'Count',5,5,'2020-02-18 14:51:57','2','2020-02-18 14:51:57','2020-07-02 14:50:36'),(76,202,138,'Count',4,4,'2020-02-18 14:52:30','2','2020-02-18 14:52:30','2020-07-02 14:50:36'),(77,200,140,'Count',4,4,'2020-02-18 14:53:26','2','2020-02-18 14:53:26','2020-07-02 14:50:36'),(78,199,141,'Count',1,1,'2020-02-18 14:54:04','2','2020-02-18 14:54:05','2020-07-02 14:50:36'),(79,263,142,'Count',1,1,'2020-02-18 15:05:20','2','2020-02-18 15:05:20','2020-07-02 14:50:36'),(80,9,68,'Count',1,1,'2020-02-18 15:08:50','2','2020-02-18 15:08:50','2020-07-02 14:50:36'),(81,6,69,'Count',4,0,'2020-02-18 15:08:50','2','2020-02-18 15:08:50','2020-07-02 14:50:36'),(82,10,67,'Count',4,0,'2020-02-18 15:08:50','2','2020-02-18 15:08:50','2020-07-02 14:50:36'),(83,11,66,'Count',2,1,'2020-02-18 15:08:50','2','2020-02-18 15:08:50','2020-07-02 14:50:36'),(84,12,65,'Count',1,3,'2020-02-18 15:08:50','2','2020-02-18 15:08:50','2020-07-02 14:50:36'),(85,14,63,'Count',3,0,'2020-02-18 15:08:50','2','2020-02-18 15:08:50','2020-07-02 14:50:36'),(86,13,64,'Count',1,2,'2020-02-18 15:08:50','2','2020-02-18 15:08:50','2020-07-02 14:50:36'),(87,15,62,'Count',2,3,'2020-02-18 15:08:50','2','2020-02-18 15:08:50','2020-07-02 14:50:36'),(88,16,61,'Count',3,0,'2020-02-18 15:08:50','2','2020-02-18 15:08:50','2020-07-02 14:50:36'),(89,17,60,'Count',1,0,'2020-02-18 15:08:50','2','2020-02-18 15:08:50','2020-07-02 14:50:36'),(90,19,85,'Count',0,2,'2020-02-18 15:08:50','2','2020-02-18 15:08:50','2020-07-02 14:50:36'),(91,18,59,'Count',1,0,'2020-02-18 15:08:50','2','2020-02-18 15:08:50','2020-07-02 14:50:36'),(92,49,97,'Count',0,5,'2020-02-18 15:19:00','2','2020-02-18 15:19:00','2020-07-02 14:50:36'),(93,50,79,'Count',3,6,'2020-02-18 15:19:00','2','2020-02-18 15:19:00','2020-07-02 14:50:36'),(94,51,78,'Count',7,4,'2020-02-18 15:19:00','2','2020-02-18 15:19:00','2020-07-02 14:50:36'),(95,52,77,'Count',3,0,'2020-02-18 15:19:00','2','2020-02-18 15:19:00','2020-07-02 14:50:36'),(96,55,143,'Count',0,0,'2020-02-18 15:19:00','2','2020-02-18 15:19:00','2020-07-02 14:50:36'),(97,54,75,'Count',1,0,'2020-02-18 15:19:00','2','2020-02-18 15:19:01','2020-07-02 14:50:36'),(98,53,76,'Count',1,0,'2020-02-18 15:19:00','2','2020-02-18 15:19:01','2020-07-02 14:50:36'),(99,38,144,'Count',2,2,'2020-02-18 15:23:29','2','2020-02-18 15:23:29','2020-07-02 14:50:36'),(100,37,145,'Count',2,2,'2020-02-18 15:24:06','2','2020-02-18 15:24:06','2020-07-02 14:50:36'),(101,36,146,'Count',4,4,'2020-02-18 15:25:24','2','2020-02-18 15:25:24','2020-07-02 14:50:36'),(102,35,147,'Count',3,3,'2020-02-18 15:26:29','2','2020-02-18 15:26:29','2020-07-02 14:50:36'),(103,34,148,'Count',4,4,'2020-02-18 15:27:42','2','2020-02-18 15:27:42','2020-07-02 14:50:36'),(104,33,149,'Count',3,3,'2020-02-18 15:29:36','2','2020-02-18 15:29:36','2020-07-02 14:50:36'),(105,32,84,'Count',0,2,'2020-02-18 15:31:06','2','2020-02-18 15:31:07','2020-02-18 15:31:07'),(106,32,150,'Count',4,4,'2020-02-18 15:33:36','2','2020-02-18 15:33:36','2020-07-02 14:50:36'),(107,31,87,'Count',0,5,'2020-02-18 15:34:35','2','2020-02-18 15:34:35','2020-02-18 15:34:35'),(108,31,151,'Count',10,10,'2020-02-18 15:35:13','2','2020-02-18 15:35:13','2020-07-02 14:50:36'),(109,33,149,'Count',4,1,'2020-02-18 15:38:57','2','2020-02-18 15:38:57','2020-07-02 14:50:36'),(110,264,152,'Count',5,5,'2020-02-18 15:44:53','2','2020-02-18 15:44:53','2020-07-02 14:50:36'),(111,265,153,'Count',2,2,'2020-02-18 15:45:23','2','2020-02-18 15:45:23','2020-07-02 14:50:36'),(112,232,93,'Count',0,2,'2020-02-19 00:11:02','2','2020-02-19 00:11:02','2020-07-02 14:50:36'),(113,218,94,'Count',0,4,'2020-02-19 00:13:20','2','2020-02-19 00:13:21','2020-07-02 14:50:36'),(114,219,88,'Count',0,2,'2020-02-19 00:13:20','2','2020-02-19 00:13:21','2020-07-02 14:50:36'),(115,250,103,'Count',0,1,'2020-02-25 21:09:17','2','2020-02-25 21:09:17','2020-07-02 14:50:36'),(116,99,6,'Count',1,3,'2020-02-25 21:12:07','2','2020-02-25 21:12:07','2020-07-02 14:50:36'),(117,100,5,'Count',1,3,'2020-02-25 21:13:20','2','2020-02-25 21:13:20','2020-07-02 14:50:36'),(118,21,41,'Count',0,1,'2020-03-27 16:25:01','2','2020-03-27 16:25:01','2020-07-02 14:50:36');
/*!40000 ALTER TABLE `adjusts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `canteen_items`
--

DROP TABLE IF EXISTS `canteen_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `canteen_items` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `_name` varchar(45) NOT NULL,
  `_cost` decimal(6,2) NOT NULL DEFAULT '0.00',
  `_price` decimal(6,2) NOT NULL DEFAULT '0.00',
  `_qty` int(11) NOT NULL DEFAULT '0',
  `_current` tinyint(4) NOT NULL DEFAULT '0',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `canteen_items`
--

LOCK TABLES `canteen_items` WRITE;
/*!40000 ALTER TABLE `canteen_items` DISABLE KEYS */;
INSERT INTO `canteen_items` VALUES (0,'Paid Out',0.00,0.00,0,1,'2020-02-16 12:13:28','2020-02-16 12:13:28'),(1,'Dairy Milk',0.50,0.50,35,1,'2020-02-18 11:48:50','2020-03-26 12:20:23'),(2,'Strawberry Pencils',0.50,0.50,49,1,'2020-02-18 11:49:50','2020-03-26 12:20:23'),(3,'Strawberry Laces',0.50,0.50,11,1,'2020-02-18 11:50:20','2020-03-24 16:22:45'),(4,'Fizzy Rainbow Belts',0.50,0.50,24,1,'2020-02-18 11:50:50','2020-03-24 16:22:45'),(5,'Fizzy Cola Straws',0.50,0.50,14,1,'2020-02-18 11:51:39','2020-03-24 16:54:58'),(6,'Fizzy Fangs',0.50,0.50,4,1,'2020-02-18 11:52:03','2020-02-23 14:55:03'),(7,'Flying Saucers',0.50,0.50,3,1,'2020-02-18 11:52:34','2020-02-18 11:52:34'),(8,'Fizzy Strawberry Straws',0.50,0.50,2,1,'2020-02-18 11:53:12','2020-02-18 11:53:12'),(9,'Dolly Mixtures',0.50,0.50,5,1,'2020-02-18 11:53:46','2020-02-18 11:53:46'),(10,'Mini Jelly Beans',0.50,0.50,4,1,'2020-02-18 11:54:08','2020-02-18 11:54:08'),(11,'Smarties',0.50,0.50,8,1,'2020-02-18 11:54:37','2020-02-18 11:54:37'),(12,'Flake',0.50,0.50,14,1,'2020-02-18 11:55:14','2020-02-18 11:55:14'),(13,'Toffee Crisp',0.50,0.50,20,1,'2020-02-18 11:55:41','2020-03-24 16:54:58'),(14,'Wisps',0.50,0.50,4,1,'2020-02-18 11:55:57','2020-02-18 11:55:57'),(15,'Galaxy',0.50,0.50,2,1,'2020-02-18 11:56:23','2020-02-18 11:56:23'),(16,'Crunchie',0.50,0.50,13,1,'2020-02-18 11:56:49','2020-02-18 13:01:04'),(17,'KitKat',0.50,0.50,8,1,'2020-02-18 11:57:10','2020-02-18 13:01:04');
/*!40000 ALTER TABLE `canteen_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `canteen_receipt_lines`
--

DROP TABLE IF EXISTS `canteen_receipt_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `canteen_receipt_lines` (
  `line_id` int(11) NOT NULL AUTO_INCREMENT,
  `receipt_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `_qty` int(11) NOT NULL,
  `_new_qty` int(11) DEFAULT NULL,
  `_cost` decimal(7,2) NOT NULL DEFAULT '0.00',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`line_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `canteen_receipt_lines`
--

LOCK TABLES `canteen_receipt_lines` WRITE;
/*!40000 ALTER TABLE `canteen_receipt_lines` DISABLE KEYS */;
INSERT INTO `canteen_receipt_lines` VALUES (1,1,1,1,NULL,0.60,'2020-03-23 17:57:54','2020-03-23 17:57:54'),(2,1,2,10,NULL,0.30,'2020-03-24 16:13:31','2020-03-24 16:13:31'),(3,2,1,30,NULL,0.40,'2020-03-24 16:19:17','2020-03-24 16:19:17'),(4,2,2,30,NULL,0.30,'2020-03-24 16:19:44','2020-03-24 16:19:44'),(5,3,3,10,NULL,0.20,'2020-03-24 16:22:27','2020-03-24 16:22:27'),(6,3,4,20,NULL,0.20,'2020-03-24 16:22:39','2020-03-24 16:22:39'),(7,4,5,10,NULL,0.40,'2020-03-24 16:54:11','2020-03-24 16:54:11'),(8,4,13,15,NULL,0.30,'2020-03-24 16:54:46','2020-03-24 16:54:46'),(14,5,1,10,NULL,0.50,'2020-03-25 16:53:16','2020-03-25 16:53:16'),(15,6,1,10,31,0.50,'2020-03-26 11:05:46','2020-03-26 11:06:08'),(16,7,1,10,51,0.50,'2020-03-26 11:09:25','2020-03-26 11:09:44');
/*!40000 ALTER TABLE `canteen_receipt_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `canteen_receipts`
--

DROP TABLE IF EXISTS `canteen_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `canteen_receipts` (
  `receipt_id` int(11) NOT NULL AUTO_INCREMENT,
  `_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `_complete` tinyint(4) NOT NULL DEFAULT '0',
  `user_id` int(11) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`receipt_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `canteen_receipts`
--

LOCK TABLES `canteen_receipts` WRITE;
/*!40000 ALTER TABLE `canteen_receipts` DISABLE KEYS */;
INSERT INTO `canteen_receipts` VALUES (1,'2020-03-23 16:22:17',1,2,'2020-03-23 16:22:17','2020-03-24 16:17:08'),(2,'2020-03-24 16:18:57',1,2,'2020-03-24 16:18:57','2020-03-24 16:20:00'),(3,'2020-03-24 16:20:59',1,2,'2020-03-24 16:20:59','2020-03-24 16:22:45'),(4,'2020-03-24 16:53:33',1,2,'2020-03-24 16:53:33','2020-03-24 16:54:58'),(5,'2020-03-24 17:01:16',1,2,'2020-03-24 17:01:16','2020-03-26 09:09:36'),(6,'2020-03-26 10:50:23',1,2,'2020-03-26 10:50:23','2020-03-26 11:06:08'),(7,'2020-03-26 11:08:15',1,2,'2020-03-26 11:08:15','2020-03-26 11:09:43');
/*!40000 ALTER TABLE `canteen_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `canteen_sale_lines`
--

DROP TABLE IF EXISTS `canteen_sale_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `canteen_sale_lines` (
  `line_id` int(11) NOT NULL AUTO_INCREMENT,
  `sale_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `_qty` int(11) NOT NULL,
  `_new_qty` int(11) DEFAULT NULL,
  `_price` decimal(7,2) NOT NULL DEFAULT '0.00',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`line_id`)
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `canteen_sale_lines`
--

LOCK TABLES `canteen_sale_lines` WRITE;
/*!40000 ALTER TABLE `canteen_sale_lines` DISABLE KEYS */;
INSERT INTO `canteen_sale_lines` VALUES (8,5,1,1,NULL,0.50,'2020-02-18 13:00:41','2020-02-18 13:00:41'),(9,5,17,2,NULL,0.50,'2020-02-18 13:00:47','2020-02-18 13:00:47'),(10,5,16,1,NULL,0.50,'2020-02-18 13:00:51','2020-02-18 13:00:51'),(106,64,6,1,NULL,0.50,'2020-02-23 14:54:17','2020-02-23 14:54:17'),(107,64,5,1,NULL,0.50,'2020-02-23 14:54:19','2020-02-23 14:54:19'),(108,64,3,1,NULL,0.50,'2020-02-23 14:54:21','2020-02-23 14:54:21'),(109,66,3,1,NULL,0.50,'2020-03-05 16:16:25','2020-03-05 16:16:25'),(112,67,1,2,NULL,0.50,'2020-03-26 09:12:32','2020-03-26 09:12:34'),(113,68,1,2,NULL,0.00,'2020-03-26 11:14:26','2020-03-26 11:14:27'),(114,69,1,2,37,0.00,'2020-03-26 11:19:38','2020-03-26 11:19:47'),(123,70,1,2,35,0.50,'2020-03-26 12:18:42','2020-03-26 12:20:23'),(124,70,2,1,49,0.50,'2020-03-26 12:18:48','2020-03-26 12:20:23');
/*!40000 ALTER TABLE `canteen_sale_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `canteen_sales`
--

DROP TABLE IF EXISTS `canteen_sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `canteen_sales` (
  `sale_id` int(11) NOT NULL AUTO_INCREMENT,
  `_complete` tinyint(4) NOT NULL DEFAULT '0',
  `_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `session_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`sale_id`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `canteen_sales`
--

LOCK TABLES `canteen_sales` WRITE;
/*!40000 ALTER TABLE `canteen_sales` DISABLE KEYS */;
INSERT INTO `canteen_sales` VALUES (5,1,'2020-02-18 13:00:37',3,2,'2020-02-18 13:00:37','2020-02-18 13:01:04'),(64,1,'2020-02-23 14:54:10',27,2,'2020-02-23 14:54:10','2020-02-23 14:55:03'),(66,1,'2020-03-05 16:16:20',28,2,'2020-03-05 16:16:20','2020-03-05 16:16:30'),(67,1,'2020-03-05 16:16:30',28,2,'2020-03-05 16:16:30','2020-03-26 09:15:31'),(68,1,'2020-03-26 09:15:31',28,2,'2020-03-26 09:15:31','2020-03-26 11:14:36'),(69,1,'2020-03-26 11:14:36',28,2,'2020-03-26 11:14:36','2020-03-26 11:19:47'),(70,1,'2020-03-26 11:19:47',28,2,'2020-03-26 11:19:47','2020-03-26 12:20:23'),(71,0,'2020-03-26 12:20:23',28,2,'2020-03-26 12:20:23','2020-03-26 12:20:23');
/*!40000 ALTER TABLE `canteen_sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `canteen_sessions`
--

DROP TABLE IF EXISTS `canteen_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `canteen_sessions` (
  `session_id` int(11) NOT NULL AUTO_INCREMENT,
  `_start` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `_end` datetime DEFAULT NULL,
  `_opening_balance` decimal(6,2) NOT NULL DEFAULT '0.00',
  `_takings` decimal(6,2) DEFAULT NULL,
  `_closing_balance` decimal(6,2) DEFAULT NULL,
  `opened_by` int(11) NOT NULL,
  `closed_by` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `canteen_sessions`
--

LOCK TABLES `canteen_sessions` WRITE;
/*!40000 ALTER TABLE `canteen_sessions` DISABLE KEYS */;
INSERT INTO `canteen_sessions` VALUES (3,'2020-02-18 13:00:37','2020-02-18 13:01:26',55.00,2.00,57.00,2,2,'2020-02-18 13:00:37','2020-02-18 13:01:26'),(27,'2020-02-23 14:54:10','2020-03-05 16:08:49',44.00,1.50,45.50,2,2,'2020-02-23 14:54:10','2020-03-05 16:08:49'),(28,'2020-03-05 16:16:20',NULL,20.00,NULL,NULL,2,NULL,'2020-03-05 16:16:20','2020-03-05 16:18:09');
/*!40000 ALTER TABLE `canteen_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `canteen_writeoff_lines`
--

DROP TABLE IF EXISTS `canteen_writeoff_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `canteen_writeoff_lines` (
  `line_id` int(11) NOT NULL AUTO_INCREMENT,
  `writeoff_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `_qty` int(11) NOT NULL,
  `_new_qty` int(11) DEFAULT NULL,
  `_cost` decimal(7,2) NOT NULL DEFAULT '0.00',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`line_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `canteen_writeoff_lines`
--

LOCK TABLES `canteen_writeoff_lines` WRITE;
/*!40000 ALTER TABLE `canteen_writeoff_lines` DISABLE KEYS */;
INSERT INTO `canteen_writeoff_lines` VALUES (1,1,1,14,NULL,0.50,'2020-03-25 16:30:08','2020-03-25 16:30:08'),(3,2,1,10,NULL,0.40,'2020-03-25 16:54:32','2020-03-25 16:54:43'),(4,3,1,10,41,0.50,'2020-03-26 11:09:31','2020-03-26 11:09:58');
/*!40000 ALTER TABLE `canteen_writeoff_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `canteen_writeoffs`
--

DROP TABLE IF EXISTS `canteen_writeoffs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `canteen_writeoffs` (
  `writeoff_id` int(11) NOT NULL AUTO_INCREMENT,
  `_reason` varchar(45) NOT NULL,
  `_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `_complete` tinyint(4) NOT NULL DEFAULT '0',
  `user_id` int(11) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`writeoff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `canteen_writeoffs`
--

LOCK TABLES `canteen_writeoffs` WRITE;
/*!40000 ALTER TABLE `canteen_writeoffs` DISABLE KEYS */;
INSERT INTO `canteen_writeoffs` VALUES (1,'Out_of_Date','2020-03-25 16:12:56',1,2,'2020-03-25 16:12:56','2020-03-25 16:30:27'),(2,'Out_of_Date','2020-03-25 16:33:06',1,2,'2020-03-25 16:33:06','2020-03-25 16:55:09'),(3,'Out_of_Date','2020-03-26 11:09:05',1,2,'2020-03-26 11:09:05','2020-03-26 11:09:58');
/*!40000 ALTER TABLE `canteen_writeoffs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `_category` varchar(20) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_id_UNIQUE` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Uniform','2019-12-10 17:36:06','2019-12-10 17:36:06'),(2,'Civilian','2019-12-10 17:36:06','2019-12-10 17:36:06'),(3,'Equipment','2019-12-10 17:36:06','2019-12-10 17:36:06'),(4,'Other','2019-12-10 17:36:06','2019-12-10 17:36:06');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `demand_lines`
--

DROP TABLE IF EXISTS `demand_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `demand_lines` (
  `line_id` int(11) NOT NULL AUTO_INCREMENT,
  `demand_id` int(11) NOT NULL,
  `size_id` int(11) NOT NULL,
  `_qty` int(11) NOT NULL,
  `_status` varchar(10) NOT NULL DEFAULT 'Pending',
  `receipt_line_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`line_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1734 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `demand_lines`
--

LOCK TABLES `demand_lines` WRITE;
/*!40000 ALTER TABLE `demand_lines` DISABLE KEYS */;
INSERT INTO `demand_lines` VALUES (1715,76,84,1,'Open',NULL,2,'2020-05-03 09:48:53','2020-05-03 09:55:55'),(1716,77,13,1,'Pending',NULL,2,'2020-05-03 09:48:53','2020-05-03 09:48:53'),(1717,76,60,1,'Received',63,2,'2020-05-03 09:49:21','2020-05-03 13:52:06'),(1718,76,21,2,'Received',61,2,'2020-05-03 09:49:21','2020-05-03 13:45:49'),(1719,76,150,1,'Received',60,2,'2020-05-03 09:50:21','2020-05-03 13:37:01'),(1720,76,62,1,'Received',62,2,'2020-05-03 09:50:21','2020-05-03 13:45:49'),(1721,76,1,1,'Open',NULL,2,'2020-05-03 09:50:21','2020-05-03 09:55:55'),(1722,76,4,1,'Open',NULL,2,'2020-05-03 09:50:21','2020-05-03 09:55:55'),(1723,76,14,1,'Open',NULL,2,'2020-05-03 09:50:21','2020-05-03 09:55:55'),(1724,76,31,1,'Cancelled',NULL,2,'2020-05-03 09:50:21','2020-05-03 14:52:49'),(1725,76,50,1,'Open',NULL,2,'2020-05-03 09:50:21','2020-05-03 09:55:55'),(1726,76,76,1,'Received',59,2,'2020-05-03 09:50:21','2020-05-03 13:37:01'),(1727,76,185,1,'Open',NULL,2,'2020-05-03 09:50:21','2020-05-03 09:55:55'),(1728,76,59,1,'Received',64,2,'2020-05-03 09:50:21','2020-05-03 13:52:06'),(1729,76,172,1,'Open',NULL,2,'2020-05-03 09:50:21','2020-05-03 09:55:55'),(1730,76,262,1,'Cancelled',NULL,2,'2020-05-03 09:50:21','2020-05-03 09:52:52'),(1731,76,59,1,'Open',NULL,2,'2020-05-03 09:50:21','2020-05-03 09:55:55'),(1732,76,14,1,'Open',NULL,2,'2020-05-03 09:50:21','2020-05-03 09:55:55'),(1733,76,119,1,'Open',NULL,2,'2020-05-03 09:50:21','2020-05-03 09:55:55');
/*!40000 ALTER TABLE `demand_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `demands`
--

DROP TABLE IF EXISTS `demands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `demands` (
  `demand_id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_id` int(11) NOT NULL,
  `_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `_complete` tinyint(4) NOT NULL DEFAULT '0',
  `_closed` tinyint(4) NOT NULL DEFAULT '0',
  `_filename` varchar(255) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`demand_id`),
  UNIQUE KEY `demand_UNIQUE` (`demand_id`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `demands`
--

LOCK TABLES `demands` WRITE;
/*!40000 ALTER TABLE `demands` DISABLE KEYS */;
INSERT INTO `demands` VALUES (76,1,'2020-05-03 09:48:53',1,0,'demands/20200503 114940 demand - 76.xlsx',2,'2020-05-03 10:49:41','2020-05-03 09:48:53'),(77,1,'2020-05-03 09:48:53',0,0,NULL,2,'2020-05-03 09:48:53','2020-05-03 09:48:53');
/*!40000 ALTER TABLE `demands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `files`
--

DROP TABLE IF EXISTS `files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `files` (
  `file_id` int(11) NOT NULL AUTO_INCREMENT,
  `_path` varchar(255) NOT NULL,
  `_code` varchar(4) DEFAULT NULL,
  `_rank` varchar(4) DEFAULT NULL,
  `_name` varchar(4) DEFAULT NULL,
  `_sqn` varchar(4) DEFAULT NULL,
  `_rank_column` varchar(2) DEFAULT NULL,
  `_name_column` varchar(2) DEFAULT NULL,
  `_request_start` varchar(2) DEFAULT NULL,
  `_request_end` varchar(2) DEFAULT NULL,
  `_date` varchar(4) DEFAULT NULL,
  `_cover_sheet` varchar(20) DEFAULT NULL,
  `_items_sheet` varchar(20) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`file_id`),
  UNIQUE KEY `_path_UNIQUE` (`_path`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `files`
--

LOCK TABLES `files` WRITE;
/*!40000 ALTER TABLE `files` DISABLE KEYS */;
INSERT INTO `files` VALUES (9,'20191128-ATC Uniform Demand RAF Boulmer.xlsx','C25','F36','F35','D7','C','D','14','23','F37','ATC Certificate','ATC Dmd Proforma','2020-04-08 15:13:52','2020-07-06 20:57:59'),(11,'it bid.xlsx',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-07-06 21:15:14','2020-07-06 21:15:14'),(12,'PC checklist.xlsx',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-07-06 21:44:23','2020-07-06 21:44:23'),(13,'radio stuff.xls',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2020-07-07 07:28:58','2020-07-07 07:28:58');
/*!40000 ALTER TABLE `files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `genders`
--

DROP TABLE IF EXISTS `genders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `genders` (
  `gender_id` int(11) NOT NULL AUTO_INCREMENT,
  `_gender` varchar(20) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`gender_id`),
  UNIQUE KEY `gender_id_UNIQUE` (`gender_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `genders`
--

LOCK TABLES `genders` WRITE;
/*!40000 ALTER TABLE `genders` DISABLE KEYS */;
INSERT INTO `genders` VALUES (1,'Male','2019-12-10 17:36:06','2019-12-10 17:36:06'),(2,'Female','2019-12-10 17:36:06','2019-12-10 17:36:06'),(3,'Undisclosed','2019-12-10 17:36:06','2019-12-10 17:36:06'),(4,'Unisex','2019-12-10 17:36:06','2019-12-10 17:36:06'),(5,'Other','2019-12-10 17:36:06','2019-12-10 17:36:06');
/*!40000 ALTER TABLE `genders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `groups` (
  `group_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `_group` varchar(20) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`group_id`),
  UNIQUE KEY `group_id_UNIQUE` (`group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groups`
--

LOCK TABLES `groups` WRITE;
/*!40000 ALTER TABLE `groups` DISABLE KEYS */;
INSERT INTO `groups` VALUES (1,1,'Blues','2020-02-25 14:25:39','2020-02-25 14:25:39'),(2,1,'Greens','2020-02-25 14:25:39','2020-02-25 14:25:39'),(3,1,'Other','2020-02-25 14:25:39','2020-02-25 14:25:39'),(4,2,'Waterproofs','2020-02-25 14:25:39','2020-02-25 14:25:39'),(5,2,'Other','2020-02-25 14:25:39','2020-02-25 14:25:39'),(6,3,'Rucksacks','2020-02-25 14:25:39','2020-02-25 14:25:39'),(7,3,'Cooking','2020-02-25 14:25:39','2020-02-25 14:25:39'),(8,3,'Sleeping','2020-02-25 14:25:39','2020-02-25 14:25:39'),(9,3,'Other','2020-02-25 14:25:39','2020-02-25 14:25:39'),(13,3,'Webbing','2019-12-02 12:31:36','2019-12-02 12:31:36'),(14,3,'Tents','2019-12-02 12:53:54','2019-12-02 12:53:54'),(15,2,'Hi Vis','2019-12-02 12:56:05','2019-12-02 12:56:05'),(16,1,'Headwear','2019-12-02 12:59:26','2019-12-02 12:59:26'),(17,1,'Badges','2019-12-02 12:59:58','2019-12-02 12:59:58');
/*!40000 ALTER TABLE `groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `issue_lines`
--

DROP TABLE IF EXISTS `issue_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `issue_lines` (
  `line_id` int(11) NOT NULL AUTO_INCREMENT,
  `issue_id` int(11) NOT NULL,
  `size_id` int(11) NOT NULL,
  `stock_id` int(11) NOT NULL,
  `_line` int(11) NOT NULL,
  `nsn_id` int(11) DEFAULT NULL,
  `_qty` int(11) NOT NULL,
  `serial_id` int(11) DEFAULT NULL,
  `return_line_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`line_id`)
) ENGINE=InnoDB AUTO_INCREMENT=220 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `issue_lines`
--

LOCK TABLES `issue_lines` WRITE;
/*!40000 ALTER TABLE `issue_lines` DISABLE KEYS */;
INSERT INTO `issue_lines` VALUES (1,1,118,72,1,118,1,NULL,1,0,'2019-10-30 20:12:02','2020-04-28 20:35:09'),(2,1,134,31,2,147,1,NULL,NULL,0,'2019-10-30 20:12:02','2020-04-28 20:35:09'),(3,2,20,42,1,20,1,NULL,NULL,0,'2019-11-06 19:49:00','2020-04-28 20:35:09'),(4,3,1,71,1,1,1,NULL,NULL,0,'2019-11-06 19:53:40','2020-04-28 20:35:09'),(5,3,15,62,2,15,1,NULL,NULL,0,'2019-11-06 19:53:40','2020-04-28 20:35:09'),(6,3,227,82,3,269,1,NULL,NULL,0,'2019-11-06 19:53:40','2020-04-28 20:35:09'),(7,3,228,83,4,268,1,NULL,NULL,0,'2019-11-06 19:53:40','2020-04-28 20:35:09'),(8,3,4,70,5,4,1,NULL,NULL,0,'2019-11-06 19:53:40','2020-04-28 20:35:09'),(9,3,226,81,6,267,1,NULL,NULL,0,'2019-11-06 19:53:40','2020-04-28 20:35:09'),(10,3,198,80,7,266,1,NULL,NULL,0,'2019-11-06 19:53:40','2020-04-28 20:35:09'),(11,3,23,39,8,23,1,NULL,NULL,0,'2019-11-06 19:53:40','2020-04-28 20:35:09'),(12,3,63,73,9,32,1,NULL,NULL,0,'2019-11-06 19:53:40','2020-04-28 20:35:09'),(13,3,63,84,10,63,1,NULL,NULL,0,'2019-11-06 19:53:40','2019-11-06 19:53:40'),(14,3,51,78,11,51,1,NULL,NULL,0,'2019-11-06 19:53:40','2020-04-28 20:35:09'),(15,3,89,74,12,89,1,NULL,NULL,0,'2019-11-06 19:53:40','2020-04-28 20:35:09'),(16,4,89,74,1,89,1,NULL,NULL,0,'2019-11-06 20:24:02','2020-04-28 20:35:09'),(17,5,198,80,1,266,1,NULL,NULL,0,'2019-11-06 20:36:29','2020-04-28 20:35:09'),(18,5,226,81,2,267,1,NULL,NULL,0,'2019-11-06 20:36:29','2020-04-28 20:35:09'),(19,5,118,72,3,118,1,NULL,70,0,'2019-11-06 20:36:29','2020-05-17 11:46:07'),(20,5,19,85,4,19,1,NULL,NULL,0,'2019-11-06 20:36:29','2020-04-28 20:35:09'),(21,5,227,82,5,269,1,NULL,NULL,0,'2019-11-06 20:36:29','2020-04-28 20:35:09'),(22,5,4,70,6,4,1,NULL,69,0,'2019-11-06 20:36:29','2020-05-17 11:46:07'),(23,5,228,83,7,268,1,NULL,NULL,0,'2019-11-06 20:36:29','2020-04-28 20:35:09'),(24,5,51,78,8,51,1,NULL,NULL,0,'2019-11-06 20:36:29','2020-04-28 20:35:09'),(25,5,23,39,9,23,1,NULL,68,0,'2019-11-06 20:36:29','2020-05-17 11:46:07'),(26,5,33,86,10,33,1,NULL,NULL,0,'2019-11-06 20:36:29','2019-11-06 20:36:29'),(27,6,21,41,1,21,1,NULL,NULL,0,'2019-11-06 20:38:20','2020-04-28 20:35:09'),(28,7,1,71,1,1,1,NULL,NULL,0,'2019-11-06 20:41:09','2020-04-28 20:35:09'),(29,7,11,66,2,11,1,NULL,NULL,0,'2019-11-06 20:41:09','2020-04-28 20:35:09'),(30,7,20,42,3,20,1,NULL,NULL,0,'2019-11-06 20:41:09','2020-04-28 20:35:09'),(31,7,228,83,4,268,1,NULL,NULL,0,'2019-11-06 20:41:09','2020-04-28 20:35:09'),(32,7,4,70,5,4,1,NULL,NULL,0,'2019-11-06 20:41:09','2020-04-28 20:35:09'),(33,7,50,79,6,50,1,NULL,NULL,0,'2019-11-06 20:41:09','2020-04-28 20:35:09'),(34,7,59,48,7,59,1,NULL,NULL,0,'2019-11-06 20:41:09','2020-04-28 20:35:09'),(35,7,77,18,8,77,1,NULL,NULL,0,'2019-11-06 20:41:09','2020-04-28 20:35:10'),(36,48,21,41,1,129,1,NULL,NULL,0,'2019-12-04 19:51:30','2020-04-28 20:35:10'),(37,48,60,47,2,60,1,NULL,NULL,0,'2019-12-04 19:51:30','2020-04-28 20:35:10'),(38,49,150,27,1,163,1,NULL,NULL,0,'2019-12-04 19:58:32','2020-04-28 20:35:10'),(39,51,31,87,1,31,1,NULL,NULL,0,'2019-12-11 21:13:16','2019-12-11 21:13:16'),(40,52,213,89,1,244,1,NULL,NULL,0,'2020-01-27 20:55:08','2020-01-27 20:55:08'),(41,52,219,88,2,219,1,NULL,NULL,0,'2020-01-27 20:55:08','2020-04-28 20:35:10'),(42,53,12,65,1,12,1,NULL,NULL,0,'2020-01-27 20:57:11','2020-04-28 20:35:10'),(43,54,4,70,1,4,1,NULL,NULL,0,'2020-01-27 21:06:28','2020-04-28 20:35:10'),(44,54,15,62,2,15,1,NULL,NULL,0,'2020-01-27 21:06:28','2020-04-28 20:35:10'),(45,54,20,42,3,128,1,NULL,NULL,0,'2020-01-27 21:06:28','2020-04-28 20:35:10'),(46,54,32,84,4,32,1,NULL,NULL,0,'2020-01-27 21:06:28','2020-01-27 21:06:28'),(47,54,50,79,5,50,1,NULL,NULL,0,'2020-01-27 21:06:28','2020-04-28 20:35:10'),(48,54,115,55,6,115,1,NULL,NULL,0,'2020-01-27 21:06:28','2020-04-28 20:35:11'),(49,54,134,31,7,147,1,NULL,NULL,0,'2020-01-27 21:06:28','2020-04-28 20:35:11'),(50,54,198,80,8,266,1,NULL,NULL,0,'2020-01-27 21:06:28','2020-04-28 20:35:11'),(51,54,218,94,10,216,1,NULL,NULL,0,'2020-01-27 21:06:28','2020-04-28 20:35:11'),(52,54,209,95,9,237,1,NULL,NULL,0,'2020-01-27 21:06:28','2020-01-27 21:06:28'),(53,54,226,81,11,267,1,NULL,NULL,0,'2020-01-27 21:06:28','2020-04-28 20:35:11'),(54,54,227,82,12,269,1,NULL,NULL,0,'2020-01-27 21:06:28','2020-04-28 20:35:11'),(55,54,228,83,13,268,1,NULL,NULL,0,'2020-01-27 21:06:28','2020-04-28 20:35:11'),(56,54,229,91,14,297,1,NULL,NULL,0,'2020-01-27 21:06:28','2020-04-28 20:35:11'),(57,54,230,92,15,298,1,NULL,NULL,0,'2020-01-27 21:06:28','2020-04-28 20:35:11'),(58,54,231,90,16,296,1,NULL,NULL,0,'2020-01-27 21:06:28','2020-05-17 12:27:59'),(59,54,232,93,17,299,1,NULL,NULL,0,'2020-01-27 21:06:28','2020-04-28 20:35:11'),(60,55,1,71,1,1,1,NULL,NULL,0,'2020-01-27 21:12:48','2020-04-28 20:35:11'),(61,55,4,70,2,4,1,NULL,NULL,0,'2020-01-27 21:12:48','2020-04-28 20:35:11'),(62,55,15,62,3,15,1,NULL,NULL,0,'2020-01-27 21:12:48','2020-04-28 20:35:11'),(63,55,51,78,5,51,1,NULL,NULL,0,'2020-01-27 21:12:48','2020-04-28 20:35:11'),(64,55,21,41,4,21,1,NULL,NULL,0,'2020-01-27 21:12:48','2020-04-28 20:35:12'),(65,55,61,46,6,61,1,NULL,NULL,0,'2020-01-27 21:12:48','2020-04-28 20:35:12'),(66,55,89,74,7,89,1,NULL,NULL,0,'2020-01-27 21:12:48','2020-04-28 20:35:12'),(67,55,198,80,8,266,1,NULL,NULL,0,'2020-01-27 21:12:48','2020-04-28 20:35:12'),(68,55,215,96,9,243,1,NULL,NULL,0,'2020-01-27 21:12:48','2020-01-27 21:12:48'),(69,55,219,88,10,219,1,NULL,NULL,0,'2020-01-27 21:12:48','2020-04-28 20:35:12'),(70,55,226,81,11,267,1,NULL,NULL,0,'2020-01-27 21:12:48','2020-04-28 20:35:12'),(71,55,227,82,12,269,1,NULL,NULL,0,'2020-01-27 21:12:48','2020-04-28 20:35:12'),(72,55,228,83,13,268,1,NULL,NULL,0,'2020-01-27 21:12:48','2020-04-28 20:35:12'),(73,56,4,70,1,4,1,NULL,NULL,0,'2020-01-27 21:15:39','2020-04-28 20:35:12'),(74,56,19,85,2,19,1,NULL,NULL,0,'2020-01-27 21:15:39','2020-04-28 20:35:12'),(75,56,22,40,3,22,1,NULL,NULL,0,'2020-01-27 21:15:39','2020-04-28 20:35:12'),(76,56,31,87,4,31,1,NULL,NULL,0,'2020-01-27 21:15:39','2020-01-27 21:15:39'),(77,56,50,79,5,50,1,NULL,NULL,0,'2020-01-27 21:15:39','2020-04-28 20:35:12'),(78,56,117,53,6,117,1,NULL,NULL,0,'2020-01-27 21:15:39','2020-04-28 20:35:12'),(79,56,151,26,7,164,1,NULL,NULL,0,'2020-01-27 21:15:39','2020-04-28 20:35:12'),(80,56,198,80,8,266,1,NULL,NULL,0,'2020-01-27 21:15:39','2020-04-28 20:35:12'),(81,56,226,81,9,267,1,NULL,NULL,0,'2020-01-27 21:15:39','2020-04-28 20:35:12'),(82,56,227,82,10,269,1,NULL,NULL,0,'2020-01-27 21:15:39','2020-04-28 20:35:12'),(83,56,228,83,11,268,1,NULL,NULL,0,'2020-01-27 21:15:39','2020-04-28 20:35:12'),(84,57,1,71,1,1,1,NULL,NULL,0,'2020-01-27 21:19:13','2020-04-28 20:35:12'),(85,57,13,64,2,13,1,NULL,NULL,0,'2020-01-27 21:19:13','2020-04-28 20:35:12'),(86,57,209,95,7,238,1,NULL,NULL,0,'2020-01-27 21:19:13','2020-01-27 21:19:13'),(87,57,21,41,3,21,1,NULL,NULL,0,'2020-01-27 21:19:13','2020-04-28 20:35:12'),(88,57,50,79,4,50,1,NULL,NULL,0,'2020-01-27 21:19:13','2020-04-28 20:35:12'),(89,57,61,46,5,61,1,NULL,NULL,0,'2020-01-27 21:19:13','2020-04-28 20:35:12'),(90,57,78,17,6,78,1,NULL,NULL,0,'2020-01-27 21:19:13','2020-04-28 20:35:12'),(91,57,218,94,8,216,1,NULL,NULL,0,'2020-01-27 21:19:13','2020-04-28 20:35:12'),(92,57,228,83,9,268,1,NULL,NULL,0,'2020-01-27 21:19:13','2020-04-28 20:35:12'),(93,58,49,97,1,49,1,NULL,NULL,0,'2020-01-27 21:20:56','2020-04-28 20:35:12'),(94,59,1,71,1,1,1,NULL,NULL,0,'2020-01-27 21:24:13','2020-04-28 20:35:12'),(95,59,4,70,2,4,1,NULL,NULL,0,'2020-01-27 21:24:13','2020-04-28 20:35:12'),(96,59,58,98,7,58,1,NULL,NULL,0,'2020-01-27 21:24:13','2020-04-28 20:35:12'),(97,59,13,64,3,13,1,NULL,NULL,0,'2020-01-27 21:24:13','2020-04-28 20:35:12'),(98,59,31,87,5,31,1,NULL,NULL,0,'2020-01-27 21:24:13','2020-01-27 21:24:13'),(99,59,20,42,4,20,1,NULL,NULL,0,'2020-01-27 21:24:13','2020-04-28 20:35:12'),(100,59,49,97,6,49,1,NULL,NULL,0,'2020-01-27 21:24:13','2020-04-28 20:35:12'),(101,59,76,19,8,76,1,NULL,NULL,0,'2020-01-27 21:24:13','2020-04-28 20:35:12'),(102,59,198,80,9,266,1,NULL,NULL,0,'2020-01-27 21:24:13','2020-04-28 20:35:12'),(103,59,226,81,10,267,1,NULL,NULL,0,'2020-01-27 21:24:13','2020-04-28 20:35:12'),(104,59,227,82,11,269,1,NULL,NULL,0,'2020-01-27 21:24:13','2020-04-28 20:35:12'),(105,59,228,83,12,268,1,NULL,NULL,0,'2020-01-27 21:24:13','2020-04-28 20:35:12'),(106,60,1,71,1,1,1,NULL,NULL,0,'2020-01-27 21:27:31','2020-04-28 20:35:12'),(107,60,4,70,2,4,1,NULL,NULL,0,'2020-01-27 21:27:31','2020-04-28 20:35:12'),(108,60,32,84,5,32,1,NULL,NULL,0,'2020-01-27 21:27:31','2020-01-27 21:27:31'),(109,60,9,68,3,9,1,NULL,NULL,0,'2020-01-27 21:27:31','2020-04-28 20:35:12'),(110,60,22,40,4,22,1,NULL,NULL,0,'2020-01-27 21:27:31','2020-04-28 20:35:12'),(111,60,51,78,6,51,1,NULL,NULL,0,'2020-01-27 21:27:31','2020-04-28 20:35:12'),(112,60,57,49,7,57,1,NULL,NULL,0,'2020-01-27 21:27:31','2020-04-28 20:35:12'),(113,60,87,99,8,87,1,NULL,NULL,0,'2020-01-27 21:27:31','2020-04-28 20:35:12'),(114,60,228,83,9,268,1,NULL,NULL,0,'2020-01-27 21:27:31','2020-04-28 20:35:12'),(115,61,1,71,1,1,1,NULL,NULL,0,'2020-01-29 17:53:46','2020-04-28 20:35:12'),(116,61,4,70,2,4,1,NULL,NULL,0,'2020-01-29 17:53:46','2020-04-28 20:35:12'),(117,61,58,98,7,58,1,NULL,NULL,0,'2020-01-29 17:53:46','2020-04-28 20:35:12'),(118,61,12,65,3,12,1,NULL,NULL,0,'2020-01-29 17:53:46','2020-04-28 20:35:12'),(119,61,20,42,4,20,1,NULL,NULL,0,'2020-01-29 17:53:46','2020-04-28 20:35:12'),(120,61,31,87,5,31,1,NULL,NULL,0,'2020-01-29 17:53:46','2020-01-29 17:53:46'),(121,61,49,97,6,49,1,NULL,NULL,0,'2020-01-29 17:53:46','2020-04-28 20:35:12'),(122,61,77,18,8,77,1,NULL,NULL,0,'2020-01-29 17:53:46','2020-04-28 20:35:12'),(123,61,198,80,9,266,1,NULL,NULL,0,'2020-01-29 17:53:46','2020-04-28 20:35:12'),(124,61,226,81,10,267,1,NULL,NULL,0,'2020-01-29 17:53:46','2020-04-28 20:35:12'),(125,61,227,82,11,269,1,NULL,NULL,0,'2020-01-29 17:53:46','2020-04-28 20:35:12'),(126,61,228,83,12,268,1,NULL,NULL,0,'2020-01-29 17:53:46','2020-04-28 20:35:12'),(127,62,1,71,1,1,1,NULL,NULL,0,'2020-01-29 17:57:22','2020-04-28 20:35:12'),(128,62,4,70,2,4,1,NULL,NULL,0,'2020-01-29 17:57:22','2020-04-28 20:35:12'),(129,62,15,62,3,15,1,NULL,NULL,0,'2020-01-29 17:57:22','2020-04-28 20:35:12'),(130,62,22,40,4,22,1,NULL,NULL,0,'2020-01-29 17:57:22','2020-04-28 20:35:12'),(131,62,50,79,5,50,1,NULL,NULL,0,'2020-01-29 17:57:22','2020-04-28 20:35:12'),(132,62,60,47,6,60,1,NULL,NULL,0,'2020-01-29 17:57:22','2020-04-28 20:35:12'),(133,62,91,9,7,91,1,NULL,NULL,0,'2020-01-29 17:57:22','2020-04-28 20:35:12'),(134,62,213,89,9,245,1,NULL,NULL,0,'2020-01-29 17:57:22','2020-01-29 17:57:22'),(135,62,198,80,8,266,1,NULL,NULL,0,'2020-01-29 17:57:22','2020-04-28 20:35:12'),(136,62,218,94,10,217,1,NULL,NULL,0,'2020-01-29 17:57:22','2020-04-28 20:35:12'),(137,62,227,82,12,269,1,NULL,NULL,0,'2020-01-29 17:57:22','2020-04-28 20:35:12'),(138,62,226,81,11,267,1,NULL,NULL,0,'2020-01-29 17:57:22','2020-04-28 20:35:12'),(139,62,228,83,13,268,1,NULL,NULL,0,'2020-01-29 17:57:22','2020-04-28 20:35:12'),(140,63,146,101,1,159,1,NULL,NULL,0,'2020-01-29 18:01:31','2020-01-29 18:01:31'),(141,64,4,70,1,4,1,NULL,NULL,0,'2020-01-29 18:04:03','2020-04-28 20:35:12'),(142,64,12,65,2,12,1,NULL,NULL,0,'2020-01-29 18:04:03','2020-04-28 20:35:12'),(143,64,226,81,7,267,1,NULL,NULL,0,'2020-01-29 18:04:03','2020-04-28 20:35:12'),(144,64,20,42,3,20,1,NULL,NULL,0,'2020-01-29 18:04:03','2020-04-28 20:35:12'),(145,64,112,58,5,112,1,NULL,NULL,0,'2020-01-29 18:04:03','2020-04-28 20:35:12'),(146,64,31,87,4,31,1,NULL,NULL,0,'2020-01-29 18:04:03','2020-01-29 18:04:03'),(147,64,198,80,6,266,1,NULL,NULL,0,'2020-01-29 18:04:03','2020-04-28 20:35:12'),(148,64,227,82,8,269,1,NULL,NULL,0,'2020-01-29 18:04:03','2020-04-28 20:35:12'),(149,64,228,83,9,268,1,NULL,NULL,0,'2020-01-29 18:04:03','2020-04-28 20:35:12'),(150,65,206,102,1,233,1,NULL,NULL,0,'2020-01-29 18:05:21','2020-01-29 18:05:21'),(151,65,218,94,2,217,1,NULL,NULL,0,'2020-01-29 18:05:21','2020-04-28 20:35:12'),(152,66,49,97,1,49,1,NULL,NULL,0,'2020-01-29 18:08:29','2020-04-28 20:35:12'),(153,66,131,33,2,143,1,NULL,NULL,0,'2020-01-29 18:08:29','2020-04-28 20:35:12'),(154,66,230,92,4,298,1,NULL,NULL,0,'2020-01-29 18:08:29','2020-04-28 20:35:12'),(155,66,229,91,3,297,1,NULL,NULL,0,'2020-01-29 18:08:29','2020-04-28 20:35:12'),(156,66,231,90,5,296,2,NULL,NULL,0,'2020-01-29 18:08:29','2020-04-28 20:35:12'),(157,66,232,93,6,299,1,NULL,NULL,0,'2020-01-29 18:08:29','2020-04-28 20:35:12'),(158,66,250,103,7,300,1,NULL,NULL,0,'2020-01-29 18:08:29','2020-04-28 20:35:12'),(159,67,1,71,1,1,1,NULL,NULL,0,'2020-01-29 18:11:32','2020-04-28 20:35:12'),(160,67,4,70,2,4,1,NULL,NULL,0,'2020-01-29 18:11:32','2020-04-28 20:35:12'),(161,67,13,64,3,13,1,NULL,NULL,0,'2020-01-29 18:11:32','2020-04-28 20:35:12'),(162,67,31,87,4,31,1,NULL,NULL,0,'2020-01-29 18:11:32','2020-01-29 18:11:32'),(163,67,49,97,5,49,1,NULL,NULL,0,'2020-01-29 18:11:32','2020-04-28 20:35:12'),(164,67,59,48,6,59,1,NULL,NULL,0,'2020-01-29 18:11:32','2020-04-28 20:35:12'),(165,67,77,18,7,77,1,NULL,NULL,0,'2020-01-29 18:11:32','2020-04-28 20:35:12'),(166,67,198,80,8,266,1,NULL,NULL,0,'2020-01-29 18:11:32','2020-04-28 20:35:12'),(167,67,226,81,9,267,1,NULL,NULL,0,'2020-01-29 18:11:32','2020-04-28 20:35:12'),(168,67,227,82,10,269,1,NULL,NULL,0,'2020-01-29 18:11:32','2020-04-28 20:35:12'),(169,67,228,83,11,268,1,NULL,NULL,0,'2020-01-29 18:11:32','2020-04-28 20:35:12'),(170,68,62,45,1,62,1,NULL,NULL,0,'2020-02-10 19:21:58','2020-04-28 20:35:12'),(171,69,13,64,1,13,1,NULL,NULL,0,'2020-02-10 19:49:55','2020-04-28 20:35:12'),(172,71,14,63,1,14,1,NULL,NULL,0,'2020-02-26 09:19:38','2020-04-28 20:35:12'),(173,71,21,41,2,21,1,NULL,NULL,0,'2020-02-26 09:19:38','2020-04-28 20:35:12'),(174,71,31,151,3,31,1,NULL,NULL,0,'2020-02-26 09:19:38','2020-04-28 20:35:12'),(175,72,50,79,1,50,1,NULL,NULL,0,'2020-02-26 09:24:55','2020-04-28 20:35:12'),(176,72,59,48,2,59,1,NULL,NULL,0,'2020-02-26 09:24:55','2020-04-28 20:35:12'),(177,74,226,81,1,267,1,NULL,NULL,0,'2020-02-26 09:48:51','2020-04-28 20:35:12'),(178,74,228,83,2,268,1,NULL,NULL,0,'2020-02-26 09:48:51','2020-04-28 20:35:12'),(179,75,1,71,1,1,2,NULL,NULL,0,'2020-02-27 17:36:25','2020-04-28 20:35:12'),(180,50,11,66,1,11,1,NULL,NULL,2,'2020-04-18 15:38:39','2020-04-28 20:35:12'),(181,70,9,68,1,9,1,NULL,NULL,2,'2020-04-19 21:37:41','2020-04-28 20:35:12'),(182,70,9,68,2,9,1,NULL,NULL,2,'2020-04-19 21:37:46','2020-04-28 20:35:12'),(183,70,50,79,3,50,1,NULL,NULL,2,'2020-04-26 09:37:58','2020-04-28 20:35:12'),(184,70,59,48,3,59,1,NULL,NULL,2,'2020-04-26 09:37:58','2020-04-28 20:35:12'),(185,70,198,80,5,266,1,NULL,NULL,2,'2020-04-26 09:38:42','2020-04-28 20:35:12'),(186,70,1,71,6,1,1,NULL,NULL,2,'2020-04-26 09:55:50','2020-04-28 20:35:12'),(187,70,4,70,6,4,1,NULL,NULL,2,'2020-04-26 09:55:50','2020-04-28 20:35:12'),(188,70,1,71,8,1,1,NULL,NULL,2,'2020-04-26 09:57:41','2020-04-28 20:35:12'),(189,70,4,70,8,4,1,NULL,NULL,2,'2020-04-26 09:57:41','2020-04-28 20:35:12'),(190,70,1,71,10,1,1,NULL,NULL,2,'2020-04-26 09:59:04','2020-04-28 20:35:12'),(191,70,4,70,11,4,1,NULL,NULL,2,'2020-04-26 09:59:04','2020-04-28 20:35:12'),(192,70,14,63,12,14,1,NULL,NULL,2,'2020-04-26 12:10:28','2020-04-28 20:35:12'),(193,70,50,79,12,50,1,NULL,NULL,2,'2020-04-26 12:10:28','2020-04-28 20:35:12'),(194,70,1,71,14,1,1,NULL,NULL,2,'2020-04-26 12:12:42','2020-04-28 20:35:12'),(195,70,4,70,14,4,1,NULL,NULL,2,'2020-04-26 12:12:42','2020-04-28 20:35:12'),(196,70,1,71,16,1,1,NULL,NULL,2,'2020-04-26 12:15:04','2020-04-28 20:35:12'),(197,70,4,70,16,4,1,NULL,NULL,2,'2020-04-26 12:15:04','2020-04-28 20:35:12'),(198,70,1,71,18,1,1,NULL,NULL,2,'2020-04-26 12:16:16','2020-04-28 20:35:12'),(199,70,4,70,18,4,1,NULL,NULL,2,'2020-04-26 12:16:16','2020-04-28 20:35:12'),(200,70,1,71,20,1,1,NULL,NULL,2,'2020-04-26 12:23:30','2020-04-28 20:35:12'),(201,70,4,70,20,4,1,NULL,NULL,2,'2020-04-26 12:23:30','2020-04-28 20:35:12'),(202,70,1,71,22,1,1,NULL,NULL,2,'2020-04-26 12:25:41','2020-04-28 20:35:12'),(203,70,4,70,22,4,1,NULL,NULL,2,'2020-04-26 12:25:41','2020-04-28 20:35:12'),(204,70,1,71,24,1,1,NULL,NULL,2,'2020-04-26 12:26:38','2020-04-28 20:35:12'),(205,70,4,70,24,4,1,NULL,NULL,2,'2020-04-26 12:26:38','2020-04-28 20:35:12'),(206,70,1,71,26,1,1,NULL,NULL,2,'2020-04-26 12:27:51','2020-04-28 20:35:12'),(207,70,4,70,26,4,1,NULL,NULL,2,'2020-04-26 12:27:51','2020-04-28 20:35:12'),(208,70,31,151,28,31,1,NULL,NULL,2,'2020-04-26 14:11:18','2020-04-28 20:35:12'),(209,70,21,41,28,21,1,NULL,NULL,2,'2020-04-26 14:11:18','2020-04-28 20:35:12'),(210,70,226,81,30,267,1,NULL,NULL,2,'2020-04-26 14:12:12','2020-04-28 20:35:12'),(211,70,33,149,31,33,1,NULL,NULL,2,'2020-04-28 21:14:03','2020-04-28 21:14:03'),(212,70,1,71,32,1,1,NULL,NULL,2,'2020-05-02 14:02:15','2020-05-02 14:02:15'),(213,70,1,71,33,1,1,NULL,NULL,2,'2020-05-02 14:04:05','2020-05-02 14:04:05'),(214,70,21,41,34,21,1,NULL,NULL,2,'2020-05-02 14:04:05','2020-05-02 14:04:05'),(215,70,1,71,35,1,1,NULL,NULL,2,'2020-05-02 15:01:05','2020-05-02 15:01:05'),(216,70,227,82,36,269,1,NULL,NULL,2,'2020-05-02 15:02:38','2020-05-02 15:02:38'),(217,70,1,71,37,1,1,NULL,NULL,2,'2020-05-02 15:05:41','2020-05-02 15:05:41'),(218,77,62,45,1,62,1,NULL,NULL,2,'2020-05-03 14:40:21','2020-05-03 14:40:21'),(219,54,231,90,16,296,1,NULL,72,2,'2020-05-17 12:27:59','2020-05-17 12:27:59');
/*!40000 ALTER TABLE `issue_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `issues`
--

DROP TABLE IF EXISTS `issues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `issues` (
  `issue_id` int(11) NOT NULL AUTO_INCREMENT,
  `issued_to` int(11) NOT NULL,
  `_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `_date_due` datetime NOT NULL,
  `_filename` varchar(255) DEFAULT NULL,
  `_complete` tinyint(4) NOT NULL DEFAULT '0',
  `_closed` tinyint(4) NOT NULL DEFAULT '0',
  `user_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`issue_id`),
  UNIQUE KEY `issued_id_UNIQUE` (`issue_id`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `issues`
--

LOCK TABLES `issues` WRITE;
/*!40000 ALTER TABLE `issues` DISABLE KEYS */;
INSERT INTO `issues` VALUES (1,30,'2019-10-30 00:00:00','2026-10-30 00:00:00',NULL,1,0,2,'2019-10-30 20:12:02','2019-10-30 20:12:02'),(2,21,'2019-11-06 00:00:00','2026-11-06 00:00:00','loancards/Issue 2 - Smith.pdf',1,0,2,'2019-11-06 19:49:00','2020-01-29 18:22:02'),(3,19,'2019-10-30 00:00:00','2026-10-30 00:00:00','loancards/Issue 3 - Scott.pdf',1,0,2,'2019-11-06 19:53:40','2020-03-05 20:09:24'),(4,4,'2019-05-29 00:00:00','2026-05-29 00:00:00',NULL,1,0,2,'2019-11-06 20:24:02','2019-11-06 20:24:02'),(5,3,'2018-04-25 00:00:00','2025-04-25 00:00:00',NULL,1,0,2,'2019-11-06 20:36:29','2019-11-06 20:36:29'),(6,6,'2019-05-29 00:00:00','2026-05-29 00:00:00',NULL,1,0,2,'2019-11-06 20:38:20','2019-11-06 20:38:20'),(7,5,'2019-09-09 00:00:00','2026-09-09 00:00:00',NULL,1,0,2,'2019-11-06 20:41:09','2019-11-06 20:41:09'),(48,14,'2019-12-04 19:51:29','2026-12-04 00:00:00',NULL,1,0,2,'2019-12-04 19:51:29','2019-12-04 19:51:31'),(49,11,'2019-12-04 19:58:32','2026-12-04 00:00:00',NULL,1,0,2,'2019-12-04 19:58:32','2019-12-04 19:58:33'),(50,13,'2019-12-11 00:00:00','2026-12-11 00:00:00',NULL,1,0,2,'2019-12-11 21:07:57','2020-04-18 17:07:17'),(51,13,'2019-12-11 00:00:00','2026-12-11 00:00:00',NULL,1,0,2,'2019-12-11 21:13:16','2019-12-11 21:13:17'),(52,5,'2019-09-11 00:00:00','2026-09-11 00:00:00',NULL,1,0,2,'2020-01-27 20:55:08','2020-01-27 20:55:10'),(53,7,'2019-05-15 00:00:00','2026-05-15 00:00:00',NULL,1,0,2,'2020-01-27 20:57:11','2020-01-27 20:57:12'),(54,8,'2018-07-30 00:00:00','2025-07-30 00:00:00',NULL,1,0,2,'2020-01-27 21:06:28','2020-01-27 21:06:30'),(55,10,'2019-09-09 00:00:00','2026-09-09 00:00:00',NULL,1,0,2,'2020-01-27 21:12:48','2020-01-27 21:12:50'),(56,11,'2018-12-17 00:00:00','2018-12-17 00:00:00',NULL,1,0,2,'2020-01-27 21:15:39','2020-01-27 21:15:40'),(57,13,'2019-09-09 00:00:00','2026-09-09 00:00:00',NULL,1,0,2,'2020-01-27 21:19:12','2020-01-27 21:19:14'),(58,14,'2019-09-02 00:00:00','2026-09-02 00:00:00',NULL,1,0,2,'2020-01-27 21:20:56','2020-01-27 21:20:57'),(59,14,'2018-10-10 00:00:00','2025-10-10 00:00:00',NULL,1,0,2,'2020-01-27 21:24:12','2020-01-27 21:24:14'),(60,15,'2019-09-25 00:00:00','2026-09-25 00:00:00',NULL,1,0,2,'2020-01-27 21:27:31','2020-01-27 21:27:33'),(61,16,'2018-10-10 00:00:00','2025-10-10 00:00:00',NULL,1,0,2,'2020-01-29 17:53:46','2020-01-29 17:53:48'),(62,18,'2019-09-09 00:00:00','2026-09-09 00:00:00',NULL,1,0,2,'2020-01-29 17:57:22','2020-01-29 17:57:23'),(63,20,'2019-05-20 00:00:00','2026-05-20 00:00:00',NULL,1,0,2,'2020-01-29 18:01:31','2020-01-29 18:01:33'),(64,22,'2019-05-15 00:00:00','2026-05-15 00:00:00','loancards/Issue 64 - Smith.pdf',1,0,2,'2020-01-29 18:04:03','2020-01-29 18:20:43'),(65,22,'2019-06-10 00:00:00','2026-06-10 00:00:00',NULL,1,0,2,'2020-01-29 18:05:21','2020-01-29 18:05:22'),(66,22,'2019-06-19 00:00:00','2026-06-19 00:00:00',NULL,1,0,2,'2020-01-29 18:08:28','2020-01-29 18:08:30'),(67,21,'2018-10-10 00:00:00','2018-10-10 00:00:00',NULL,1,0,2,'2020-01-29 18:11:32','2020-01-29 18:11:34'),(68,10,'2020-02-10 19:21:57','2027-02-10 00:00:00','loancards/Issue 68 - Clayton.pdf',1,0,2,'2020-02-10 19:21:57','2020-02-10 19:42:15'),(69,9,'2020-02-10 19:49:55','2027-02-10 00:00:00','loancards/Issue 69 - Cheesmer.pdf',1,0,2,'2020-02-10 19:49:55','2020-02-10 19:49:56'),(70,33,'2020-02-26 00:00:00','2027-02-26 00:00:00','loancards/Issue 70 - Bell.pdf',1,0,2,'2020-02-26 09:18:33','2020-05-17 07:21:01'),(71,33,'2020-02-26 00:00:00','2027-02-26 00:00:00','loancards/Issue 71 - Bell.pdf',1,0,2,'2020-02-26 09:19:38','2020-02-26 09:19:39'),(72,33,'2020-02-26 00:00:00','2027-02-26 00:00:00','loancards/Issue 72 - Bell.pdf',1,0,2,'2020-02-26 09:24:55','2020-02-26 09:24:57'),(73,33,'2020-02-26 00:00:00','2027-02-26 00:00:00',NULL,0,0,2,'2020-02-26 09:45:59','2020-02-26 09:45:59'),(74,33,'2020-02-26 00:00:00','2027-02-26 00:00:00','loancards/Issue 74 - Bell.pdf',1,0,2,'2020-02-26 09:48:51','2020-02-26 09:48:53'),(75,33,'2020-02-27 00:00:00','2027-02-27 00:00:00','loancards/Issue 75 - Bell.pdf',1,0,2,'2020-02-27 17:36:25','2020-02-27 17:36:26'),(76,3,'2020-04-20 20:39:09','2027-04-20 00:00:00',NULL,0,0,2,'2020-04-20 20:39:09','2020-04-20 20:39:09'),(77,10,'2020-05-03 14:40:21','2027-05-03 00:00:00',NULL,0,0,2,'2020-05-03 14:40:21','2020-05-03 14:40:21');
/*!40000 ALTER TABLE `issues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `items` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `_description` varchar(45) NOT NULL,
  `gender_id` int(11) DEFAULT NULL,
  `category_id` int(11) NOT NULL DEFAULT '4',
  `group_id` int(11) DEFAULT NULL,
  `type_id` int(11) DEFAULT NULL,
  `subtype_id` int(11) DEFAULT NULL,
  `_size_text` varchar(45) NOT NULL DEFAULT 'Size',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_id`),
  UNIQUE KEY `item_id_UNIQUE` (`item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (1,'Belt, Waist',4,1,1,1,NULL,'Min/Max','2020-02-23 09:22:55','2020-02-23 09:22:55'),(2,'Beret',4,1,3,2,NULL,'Head','2020-02-23 09:22:55','2020-02-23 09:22:55'),(3,'Coveralls',4,1,3,18,NULL,'Height/Chest','2020-02-23 09:22:55','2020-02-23 09:22:55'),(4,'Tie',4,1,1,1,NULL,'Size','2020-02-23 09:22:55','2020-02-23 09:22:55'),(5,'Brassard',4,1,1,1,NULL,'Size','2020-02-23 09:22:55','2020-02-23 09:22:55'),(6,'Jumper, Utility',4,1,1,7,NULL,'Chest','2020-02-23 09:22:55','2020-02-23 09:22:55'),(7,'Skirt',2,1,1,6,NULL,'Length/Waist/Hips','2020-02-23 09:22:55','2020-02-23 09:22:55'),(8,'Trousers, Mans',1,1,1,8,NULL,'Leg/Waist/Seat','2020-02-23 09:22:55','2020-02-23 09:22:55'),(10,'Slacks',2,1,1,16,NULL,'Leg/Waist/Hips','2020-02-23 09:22:55','2020-02-23 09:22:55'),(11,'Smock, S95',4,1,2,11,NULL,'Height/Chest','2020-02-23 09:22:55','2020-02-23 09:22:55'),(13,'Shirt, Light Blue, Long Sleeve, Female',2,1,1,5,NULL,'Collar/Bust','2020-02-23 09:22:55','2020-02-23 09:22:55'),(14,'Shirt, Light Blue, Long Sleeve, Male',1,1,1,5,NULL,'Collar','2020-02-23 09:22:55','2020-02-23 09:22:55'),(15,'Shirt, Working Blue, Long Sleeve, Male',1,1,1,5,NULL,'Collar','2020-02-23 09:22:55','2020-02-23 09:22:55'),(16,'Jacket, Foul Weather',4,1,1,9,NULL,'Height/Chest','2020-02-23 09:22:55','2020-02-23 09:22:55'),(20,'Belt, Green',4,1,2,19,NULL,'Item','2020-02-23 09:22:55','2020-02-23 09:22:55'),(21,'Hi-Vis, Yellow',4,2,5,22,NULL,'Size','2020-02-23 09:22:55','2020-02-23 09:22:55'),(22,'Shirt, Working Blue, Long Sleeve, Female',2,1,1,5,NULL,'Size','2020-02-23 09:22:55','2020-02-23 09:22:55'),(23,'Trousers, PCS',4,1,2,10,NULL,'Size','2020-02-23 09:22:55','2020-02-23 09:22:55'),(24,'Jacket, PCS',4,1,2,10,NULL,'Size','2020-02-23 09:22:55','2020-02-23 09:22:55'),(25,'Smock, PCS',4,1,2,10,NULL,'Size','2020-02-23 09:22:55','2020-02-23 09:22:55'),(26,'Trousers, S95',0,19,NULL,NULL,NULL,'Size','2020-02-23 09:22:55','2020-02-23 09:22:55'),(27,'Jacket, S95',0,19,NULL,NULL,NULL,'Size','2020-02-23 09:22:55','2020-02-23 09:22:55'),(28,'Parade Shoes, Male',1,1,1,4,NULL,'Size','2020-02-23 09:22:55','2020-02-23 09:22:55'),(29,'Parade Shoes, Female',2,1,1,4,NULL,'Size','2020-02-23 09:22:55','2020-02-23 09:22:55'),(30,'Webbing',4,3,13,NULL,NULL,'Item','2020-02-23 09:22:55','2020-02-23 09:22:55'),(31,'Shirt, Light Blue, Extra Long Sleeve, Female',2,1,1,5,NULL,'Collar/Bust','2020-02-23 09:22:56','2020-02-23 09:22:56'),(32,'Shirt, Light Blue, Extra Long Sleeve, Male',1,1,1,5,NULL,'Collar','2020-02-23 09:22:56','2020-02-23 09:22:56'),(33,'TShirt',4,1,2,19,NULL,'Size','2020-02-23 09:22:56','2020-02-23 09:22:56'),(34,'Shoes, Parade, Mens',1,1,1,4,NULL,'Size','2020-02-23 09:22:56','2020-02-23 09:22:56'),(35,'Shoes, Female, Parade',2,1,1,4,NULL,'Size','2020-02-23 09:22:56','2020-02-23 09:22:56'),(36,'Shooting Equipment',4,1,2,19,NULL,'Item','2020-02-23 09:22:56','2020-02-23 09:22:56'),(37,'Test',NULL,1,1,NULL,NULL,'Size','2020-04-08 15:30:01','2020-04-08 15:56:29'),(38,'Test',NULL,4,NULL,NULL,NULL,'Test','2020-07-07 21:29:04','2020-07-07 21:29:04'),(39,'test',NULL,4,NULL,NULL,NULL,'test','2020-07-07 21:32:05','2020-07-07 21:32:05'),(40,'dfg',NULL,4,NULL,NULL,NULL,'gdfrbxfgb','2020-07-08 07:23:12','2020-07-08 07:23:12');
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `locations` (
  `location_id` int(11) NOT NULL AUTO_INCREMENT,
  `_location` varchar(20) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,'A1','2020-02-23 09:24:19','2020-02-23 09:24:19'),(2,'A2','2020-02-23 09:24:19','2020-02-23 09:24:19'),(3,'A3','2020-02-23 09:24:19','2020-02-23 09:24:19'),(4,'A4','2020-02-23 09:24:19','2020-02-23 09:24:19'),(5,'A5','2020-02-23 09:24:19','2020-02-23 09:24:19'),(6,'B1','2020-02-23 09:24:19','2020-02-23 09:24:19'),(7,'B2','2020-02-23 09:24:19','2020-02-23 09:24:19'),(8,'B3','2020-02-23 09:24:19','2020-02-23 09:24:19'),(9,'B4','2020-02-23 09:24:19','2020-02-23 09:24:19'),(10,'B5','2020-02-23 09:24:19','2020-02-23 09:24:19'),(11,'C1','2020-02-23 09:24:19','2020-02-23 09:24:19'),(12,'C2','2020-02-23 09:24:19','2020-02-23 09:24:19'),(13,'C3','2020-02-23 09:24:19','2020-02-23 09:24:19'),(14,'C4','2020-02-23 09:24:19','2020-02-23 09:24:19'),(15,'G5','2020-02-23 09:24:20','2020-02-23 09:24:20'),(16,'D1','2020-02-23 09:24:20','2020-02-23 09:24:20'),(17,'D2','2020-02-23 09:24:20','2020-02-23 09:24:20'),(18,'D3','2020-02-23 09:24:20','2020-02-23 09:24:20'),(19,'D4','2020-02-23 09:24:20','2020-02-23 09:24:20'),(20,'D5','2020-02-23 09:24:20','2020-02-23 09:24:20'),(21,'E1','2020-02-23 09:24:20','2020-02-23 09:24:20'),(22,'E2','2020-02-23 09:24:20','2020-02-23 09:24:20'),(23,'E3','2020-02-23 09:24:20','2020-02-23 09:24:20'),(24,'E4','2020-02-23 09:24:20','2020-02-23 09:24:20'),(25,'E5','2020-02-23 09:24:20','2020-02-23 09:24:20'),(26,'F1','2020-02-23 09:24:20','2020-02-23 09:24:20'),(27,'F2','2020-02-23 09:24:20','2020-02-23 09:24:20'),(28,'F3','2020-02-23 09:24:20','2020-02-23 09:24:20'),(29,'F4','2020-02-23 09:24:20','2020-02-23 09:24:20'),(30,'F5','2020-02-23 09:24:20','2020-02-23 09:24:20'),(31,'T1','2020-02-23 09:24:20','2020-02-23 09:24:20'),(32,'T2','2020-02-23 09:24:20','2020-02-23 09:24:20'),(33,'T3','2020-02-23 09:24:20','2020-02-23 09:24:20'),(34,'T4','2020-02-23 09:24:20','2020-02-23 09:24:20'),(35,'T5','2020-02-23 09:24:20','2020-02-23 09:24:20'),(36,'T6','2020-02-23 09:24:20','2020-02-23 09:24:20'),(37,'T7','2020-02-23 09:24:20','2020-02-23 09:24:20'),(38,'T8','2020-02-23 09:24:20','2020-02-23 09:24:20'),(39,'T9','2020-02-23 09:24:20','2020-02-23 09:24:20'),(40,'T10','2020-02-23 09:24:20','2020-02-23 09:24:20'),(41,'Cabinet','2020-02-23 09:24:20','2020-02-23 09:24:20'),(42,'C5','2020-02-23 09:24:20','2020-02-23 09:24:20'),(43,'dfvsvfds','2020-07-20 21:32:30','2020-07-20 21:32:30');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notes`
--

DROP TABLE IF EXISTS `notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notes` (
  `note_id` int(11) NOT NULL AUTO_INCREMENT,
  `_table` varchar(30) NOT NULL,
  `_id` int(11) NOT NULL,
  `_note` varchar(1000) NOT NULL,
  `_system` tinyint(4) NOT NULL DEFAULT '0',
  `_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`note_id`),
  UNIQUE KEY `NOTEID_UNIQUE` (`note_id`)
) ENGINE=InnoDB AUTO_INCREMENT=256 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notes`
--

LOCK TABLES `notes` WRITE;
/*!40000 ALTER TABLE `notes` DISABLE KEYS */;
INSERT INTO `notes` VALUES (51,'orders',1,'Generated from request: 1',1,'2019-11-18 10:14:03',2,'2019-11-18 10:14:03','2019-11-18 10:14:03'),(52,'orders',1,'Generated from request: 1',1,'2019-11-20 20:35:52',2,'2019-11-20 20:35:52','2019-11-20 20:35:52'),(53,'issues',48,'Generated from request',1,'2019-12-04 19:51:30',2,'2019-12-04 19:51:30','2019-12-04 19:51:30'),(54,'issues',49,'Generated from request',1,'2019-12-04 19:58:32',2,'2019-12-04 19:58:32','2019-12-04 19:58:32'),(55,'issues',68,'Generated from request',1,'2020-02-10 19:21:58',2,'2020-02-10 19:21:58','2020-02-10 19:21:58'),(56,'issues',69,'Generated from request',1,'2020-02-10 19:49:55',2,'2020-02-10 19:49:55','2020-02-10 19:49:55'),(57,'orders',2,'Generated from request',1,'2020-02-12 20:13:19',2,'2020-02-12 20:13:19','2020-02-12 20:13:19'),(159,'orders',85,'Generated from request',1,'2020-02-25 22:28:50',2,'2020-02-25 22:28:50','2020-02-25 22:28:50'),(160,'orders',86,'Generated from request',1,'2020-02-25 22:49:54',2,'2020-02-25 22:49:54','2020-02-25 22:49:54'),(161,'orders',87,'Generated from request',1,'2020-02-25 22:57:32',2,'2020-02-25 22:57:32','2020-02-25 22:57:32'),(162,'requests',6,'Request closed',1,'2020-02-26 13:02:14',2,'2020-02-26 13:02:14','2020-02-26 13:02:14'),(163,'orders',89,'Order closed',1,'2020-02-26 17:05:23',2,'2020-02-26 17:05:23','2020-02-26 17:05:23'),(164,'orders',83,'Order closed',1,'2020-02-28 14:55:58',2,'2020-02-28 14:55:58','2020-02-28 14:55:58'),(165,'orders',87,'Order closed',1,'2020-02-28 15:25:22',2,'2020-02-28 15:25:22','2020-02-28 15:25:22'),(166,'accounts',1,'Testkjffhdj',0,'2020-03-27 15:00:48',2,'2020-03-27 15:00:48','2020-03-27 15:00:48'),(167,'accounts',1,'Testkkj',0,'2020-03-27 15:01:13',2,'2020-03-27 15:01:13','2020-03-27 15:01:13'),(168,'accounts',1,'testsuhj',0,'2020-03-27 15:12:38',2,'2020-03-27 15:12:38','2020-03-27 15:12:38'),(169,'accounts',1,'Test Test',0,'2020-03-27 15:16:33',2,'2020-03-27 15:16:33','2020-03-27 15:16:33'),(171,'users',3,'Test',0,'2020-03-27 15:30:53',2,'2020-03-27 15:30:54','2020-03-27 15:30:54'),(172,'users',3,'Test test',0,'2020-03-27 15:53:13',2,'2020-03-27 15:45:05','2020-03-27 15:53:13'),(173,'items',1,'Testekdsjhkl',1,'2020-04-08 18:47:18',2,'2020-04-08 18:47:18','2020-04-08 18:47:18'),(182,'demands',54,'dfbd rtd',0,'2020-04-17 14:23:28',2,'2020-04-17 14:23:28','2020-04-17 14:23:28'),(183,'orders',2,'Order complete',1,'2020-04-19 22:17:30',2,'2020-04-19 22:17:30','2020-04-19 22:17:30'),(184,'orders',1,'Order complete',1,'2020-04-19 22:17:46',2,'2020-04-19 22:17:46','2020-04-19 22:17:46'),(185,'requests',30,'Request completed',1,'2020-04-20 22:18:20',2,'2020-04-20 22:18:20','2020-04-20 22:18:20'),(186,'requests',31,'Request completed',1,'2020-04-20 22:19:49',2,'2020-04-20 22:19:49','2020-04-20 22:19:49'),(187,'requests',7,'Request completed',1,'2020-04-20 22:21:25',2,'2020-04-20 22:21:25','2020-04-20 22:21:25'),(188,'requests',6,'Line 7 cancelled',1,'2020-04-21 19:27:04',2,'2020-04-21 19:27:04','2020-04-21 19:27:04'),(189,'requests',6,'Line 8 cancelled',1,'2020-04-21 19:35:32',2,'2020-04-21 19:35:32','2020-04-21 19:35:32'),(190,'requests',6,'Line 9 cancelled',1,'2020-04-21 19:35:32',2,'2020-04-21 19:35:32','2020-04-21 19:35:32'),(191,'requests',29,'Completed',1,'2020-04-27 11:56:09',2,'2020-04-27 11:56:09','2020-04-27 11:56:09'),(192,'requests',32,'Completed',1,'2020-04-27 12:02:02',2,'2020-04-27 12:02:02','2020-04-27 12:02:02'),(193,'requests',33,'Completed',1,'2020-04-30 14:01:05',2,'2020-04-30 14:01:05','2020-04-30 14:01:05'),(194,'orders',91,'Completed',1,'2020-04-30 14:02:22',2,'2020-04-30 14:02:22','2020-04-30 14:02:22'),(195,'orders',85,'Completed',1,'2020-04-30 15:16:56',2,'2020-04-30 15:16:56','2020-04-30 15:16:56'),(196,'orders',2,'Completed',1,'2020-05-02 07:40:28',2,'2020-05-02 07:40:28','2020-05-02 07:40:28'),(197,'orders',97,'Completed',1,'2020-05-02 08:43:52',2,'2020-05-02 08:43:52','2020-05-02 08:43:52'),(198,'orders',91,'Completed',1,'2020-05-02 08:54:30',2,'2020-05-02 08:54:30','2020-05-02 08:54:30'),(199,'orders',82,'Completed',1,'2020-05-02 09:17:29',2,'2020-05-02 09:17:29','2020-05-02 09:17:29'),(200,'order_lines',82,'Line 139 cancelled',1,'2020-05-02 09:38:59',2,'2020-05-02 09:38:59','2020-05-02 09:38:59'),(201,'order_lines',82,'Line 140 cancelled',1,'2020-05-02 09:38:59',2,'2020-05-02 09:38:59','2020-05-02 09:38:59'),(202,'order_lines',82,'Line 139 cancelled',1,'2020-05-02 09:40:46',2,'2020-05-02 09:40:46','2020-05-02 09:40:46'),(203,'order_lines',82,'Line 140 cancelled',1,'2020-05-02 09:40:46',2,'2020-05-02 09:40:46','2020-05-02 09:40:46'),(204,'orders',82,'Line 139 cancelled',1,'2020-05-02 09:42:32',2,'2020-05-02 09:42:32','2020-05-02 09:42:32'),(205,'orders',82,'Line 140 cancelled',1,'2020-05-02 09:42:32',2,'2020-05-02 09:42:32','2020-05-02 09:42:32'),(206,'orders',82,'Line 136 cancelled',1,'2020-05-02 14:05:31',2,'2020-05-02 14:05:31','2020-05-02 14:05:31'),(207,'orders',89,'Completed',1,'2020-05-02 15:02:26',2,'2020-05-02 15:02:26','2020-05-02 15:02:26'),(208,'orders',85,'Closed',1,'2020-05-02 15:05:41',2,'2020-05-02 15:05:41','2020-05-02 15:05:41'),(209,'requests',1,'Completed',1,'2020-05-02 16:31:38',2,'2020-05-02 16:31:38','2020-05-02 16:31:38'),(210,'requests',1,'Completed',1,'2020-05-03 09:31:34',2,'2020-05-03 09:31:34','2020-05-03 09:31:34'),(211,'requests',2,'Completed',1,'2020-05-03 09:32:02',2,'2020-05-03 09:32:02','2020-05-03 09:32:02'),(212,'requests',3,'Completed',1,'2020-05-03 09:32:27',2,'2020-05-03 09:32:27','2020-05-03 09:32:27'),(213,'requests',4,'Completed',1,'2020-05-03 09:32:47',2,'2020-05-03 09:32:47','2020-05-03 09:32:47'),(214,'requests',5,'Completed',1,'2020-05-03 09:33:06',2,'2020-05-03 09:33:06','2020-05-03 09:33:06'),(215,'requests',6,'Completed',1,'2020-05-03 09:33:26',2,'2020-05-03 09:33:26','2020-05-03 09:33:26'),(216,'requests',7,'Completed',1,'2020-05-03 09:34:17',2,'2020-05-03 09:34:17','2020-05-03 09:34:17'),(217,'requests',8,'Completed',1,'2020-05-03 09:34:35',2,'2020-05-03 09:34:35','2020-05-03 09:34:35'),(218,'requests',29,'Completed',1,'2020-05-03 09:34:54',2,'2020-05-03 09:34:54','2020-05-03 09:34:54'),(219,'requests',32,'Completed',1,'2020-05-03 09:35:12',2,'2020-05-03 09:35:12','2020-05-03 09:35:12'),(220,'requests',33,'Completed',1,'2020-05-03 09:35:31',2,'2020-05-03 09:35:31','2020-05-03 09:35:31'),(221,'request_lines',6,'Line 15 declined',1,'2020-05-03 09:35:54',2,'2020-05-03 09:35:54','2020-05-03 09:35:54'),(222,'requests',34,'Completed',1,'2020-05-03 09:40:05',2,'2020-05-03 09:40:05','2020-05-03 09:40:05'),(223,'request_lines',34,'Line 38 declined',1,'2020-05-03 09:40:50',2,'2020-05-03 09:40:50','2020-05-03 09:40:50'),(224,'orders',98,'Completed',1,'2020-05-03 09:48:40',2,'2020-05-03 09:48:40','2020-05-03 09:48:40'),(225,'orders',99,'Completed',1,'2020-05-03 09:49:11',2,'2020-05-03 09:49:11','2020-05-03 09:49:11'),(226,'orders',100,'Completed',1,'2020-05-03 09:49:31',2,'2020-05-03 09:49:31','2020-05-03 09:49:31'),(227,'orders',101,'Completed',1,'2020-05-03 09:49:41',2,'2020-05-03 09:49:41','2020-05-03 09:49:41'),(228,'orders',102,'Completed',1,'2020-05-03 09:49:51',2,'2020-05-03 09:49:51','2020-05-03 09:49:51'),(229,'orders',103,'Completed',1,'2020-05-03 09:50:06',2,'2020-05-03 09:50:06','2020-05-03 09:50:06'),(230,'orders',104,'Completed',1,'2020-05-03 09:50:16',2,'2020-05-03 09:50:16','2020-05-03 09:50:16'),(231,'demands',76,'Line 1730 cancelled',1,'2020-05-03 09:52:53',2,'2020-05-03 09:52:53','2020-05-03 09:52:53'),(232,'demands',76,'Completed',1,'2020-05-03 10:13:30',2,'2020-05-03 10:13:30','2020-05-03 10:13:30'),(233,'demands',76,'Completed',1,'2020-05-03 10:14:25',2,'2020-05-03 10:14:25','2020-05-03 10:14:25'),(234,'demands',76,'Completed',1,'2020-05-03 10:15:36',2,'2020-05-03 10:15:36','2020-05-03 10:15:36'),(235,'demands',76,'Completed',1,'2020-05-03 10:17:05',2,'2020-05-03 10:17:05','2020-05-03 10:17:05'),(236,'demands',76,'Completed',1,'2020-05-03 10:18:20',2,'2020-05-03 10:18:20','2020-05-03 10:18:20'),(237,'demands',76,'Completed',1,'2020-05-03 10:24:18',2,'2020-05-03 10:24:18','2020-05-03 10:24:18'),(238,'demands',76,'Completed',1,'2020-05-03 10:25:22',2,'2020-05-03 10:25:22','2020-05-03 10:25:22'),(239,'demands',76,'Completed',1,'2020-05-03 10:29:10',2,'2020-05-03 10:29:10','2020-05-03 10:29:10'),(240,'demands',76,'Completed',1,'2020-05-03 10:30:08',2,'2020-05-03 10:30:08','2020-05-03 10:30:08'),(241,'demands',76,'Completed',1,'2020-05-03 10:32:34',2,'2020-05-03 10:32:34','2020-05-03 10:32:34'),(242,'demands',76,'Completed',1,'2020-05-03 10:36:18',2,'2020-05-03 10:36:18','2020-05-03 10:36:18'),(243,'demands',76,'Completed',1,'2020-05-03 10:38:01',2,'2020-05-03 10:38:01','2020-05-03 10:38:01'),(244,'demands',76,'Completed',1,'2020-05-03 10:40:27',2,'2020-05-03 10:40:27','2020-05-03 10:40:27'),(245,'demands',76,'Completed',1,'2020-05-03 10:46:34',2,'2020-05-03 10:46:34','2020-05-03 10:46:34'),(246,'demands',76,'Completed',1,'2020-05-03 10:47:36',2,'2020-05-03 10:47:36','2020-05-03 10:47:36'),(247,'demands',76,'Completed',1,'2020-05-03 10:48:35',2,'2020-05-03 10:48:35','2020-05-03 10:48:35'),(248,'demands',76,'Completed',1,'2020-05-03 10:49:39',2,'2020-05-03 10:49:39','2020-05-03 10:49:39'),(249,'demands',76,'File created',1,'2020-05-03 10:49:42',2,'2020-05-03 10:49:42','2020-05-03 10:49:42'),(250,'orders',101,'Closed',1,'2020-05-03 14:40:21',2,'2020-05-03 14:40:21','2020-05-03 14:40:21'),(251,'demands',76,'Line 1724 cancelled',1,'2020-05-03 14:52:49',2,'2020-05-03 14:52:49','2020-05-03 14:52:49'),(252,'issues',54,'Line partially returned: 16',1,'2020-05-17 11:52:13',2,'2020-05-17 11:52:13','2020-05-17 11:52:13'),(253,'issues',54,'Line partially returned: 16',1,'2020-05-17 12:27:59',2,'2020-05-17 12:27:59','2020-05-17 12:27:59'),(255,'items',1,'Test',0,'2020-07-08 13:08:19',2,'2020-07-08 13:07:18','2020-07-08 13:08:19');
/*!40000 ALTER TABLE `notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nsn_classifications`
--

DROP TABLE IF EXISTS `nsn_classifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nsn_classifications` (
  `nsn_classification_id` int(11) NOT NULL AUTO_INCREMENT,
  `nsn_group_id` int(11) NOT NULL,
  `_code` int(2) NOT NULL,
  `_classification` varchar(100) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`nsn_classification_id`)
) ENGINE=InnoDB AUTO_INCREMENT=663 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nsn_classifications`
--

LOCK TABLES `nsn_classifications` WRITE;
/*!40000 ALTER TABLE `nsn_classifications` DISABLE KEYS */;
INSERT INTO `nsn_classifications` VALUES (1,11,5,'Weapons (from 1 mm through 30 mm)','2020-07-20 23:29:28','2020-07-20 23:29:28'),(2,11,10,'Weapons (from 31 mm to 75 mm)','2020-07-20 23:29:28','2020-07-20 23:29:28'),(3,11,15,'Weapons (from 76 mm to 125 mm)','2020-07-20 23:29:28','2020-07-20 23:29:28'),(4,11,20,'Weapons (from 126 mm to 150 mm)','2020-07-20 23:29:28','2020-07-20 23:29:28'),(5,11,25,'Weapons (from 151 mm to 300 mm)','2020-07-20 23:29:28','2020-07-20 23:29:28'),(6,11,30,'Weapons (from 300 mm+)','2020-07-20 23:29:28','2020-07-20 23:29:28'),(7,11,40,'Chemical Weapons and Equipment','2020-07-20 23:29:28','2020-07-20 23:29:28'),(8,11,45,'Launchers, Torpedo and Depth Charge','2020-07-20 23:29:28','2020-07-20 23:29:28'),(9,11,55,'Launchers, Rocket and Pyrotechnic','2020-07-20 23:29:28','2020-07-20 23:29:28'),(10,11,70,'Nets and Booms, Ordnance','2020-07-20 23:29:28','2020-07-20 23:29:28'),(11,11,75,'Degaussing and Mine Sweeping Equipment','2020-07-20 23:29:28','2020-07-20 23:29:28'),(12,11,80,'Camouflage and Deception Equipment','2020-07-20 23:29:28','2020-07-20 23:29:28'),(13,11,90,'Assemblies Interchangeable Between Weapons in Two or More Classes','2020-07-20 23:29:28','2020-07-20 23:29:28'),(14,12,5,'Nuclear Bombs','2020-07-20 23:31:24','2020-07-20 23:31:24'),(15,12,10,'Nuclear Projectiles','2020-07-20 23:31:24','2020-07-20 23:31:24'),(16,12,15,'Nuclear Warheads and Warhead Sections','2020-07-20 23:31:24','2020-07-20 23:31:24'),(17,12,20,'Nuclear Depth Charges','2020-07-20 23:31:24','2020-07-20 23:31:24'),(18,12,25,'Nuclear Demolition Charges','2020-07-20 23:31:24','2020-07-20 23:31:24'),(19,12,27,'Nuclear Rockets','2020-07-20 23:31:24','2020-07-20 23:31:24'),(20,12,30,'Conversion Kits, Nuclear Ordnance','2020-07-20 23:31:24','2020-07-20 23:31:24'),(21,12,35,'Fusing and Firing Devices, Nuclear Ordnance','2020-07-20 23:31:24','2020-07-20 23:31:24'),(22,12,40,'Nuclear Components','2020-07-20 23:31:24','2020-07-20 23:31:24'),(23,12,45,'Explosive and Pyrotechnic Components, Nuclear Ordnance','2020-07-20 23:31:24','2020-07-20 23:31:24'),(24,12,90,'Specialized Test and Handling Equipment, Nuclear Ordnance','2020-07-20 23:31:24','2020-07-20 23:31:24'),(25,12,95,'Miscellaneous Nuclear Ordnance','2020-07-20 23:31:24','2020-07-20 23:31:24'),(26,13,10,'Fire Control Directors','2020-07-20 23:32:54','2020-07-20 23:32:54'),(27,13,20,'Fire Control Computing Sights and Devices','2020-07-20 23:32:54','2020-07-20 23:32:54'),(28,13,30,'Fire Control Systems, Complete','2020-07-20 23:32:54','2020-07-20 23:32:54'),(29,13,40,'Optical Sighting and Ranging Equipment','2020-07-20 23:32:54','2020-07-20 23:32:54'),(30,13,50,'Fire Control Stabilizing Mechanisms','2020-07-20 23:32:54','2020-07-20 23:32:54'),(31,13,60,'Fire Control Designating and Indicating Equipment','2020-07-20 23:32:54','2020-07-20 23:32:54'),(32,13,65,'Fire Control Transmitting and Receiving Equipment, except Airborne','2020-07-20 23:32:54','2020-07-20 23:32:54'),(33,13,70,'Aircraft Gunnery Fire Control Components','2020-07-20 23:32:54','2020-07-20 23:32:54'),(34,13,80,' Aircraft Bombing Fire Control Components','2020-07-20 23:32:54','2020-07-20 23:32:54'),(35,13,85,'Fire Control Radar Equipment, except Airborne','2020-07-20 23:32:54','2020-07-20 23:32:54'),(36,13,87,'Fire Control Sonar Equipment','2020-07-20 23:32:54','2020-07-20 23:32:54'),(37,13,90,'Miscellaneous Fire Control Equipment','2020-07-20 23:32:54','2020-07-20 23:32:54'),(38,14,5,'Ammunition, through 30mm (1mm - 30mm)','2020-07-20 23:36:10','2020-07-20 23:36:10'),(39,14,10,'Ammunition, over 30mm through 75mm (31mm-75mm)','2020-07-20 23:36:10','2020-07-20 23:36:10'),(40,14,15,'Ammunition, over 75mm through 125mm (76mm - 125mm)','2020-07-20 23:36:10','2020-07-20 23:36:10'),(41,14,20,'Ammunition, over 125mm (126mm +)','2020-07-20 23:36:10','2020-07-20 23:36:10'),(42,14,25,'Bombs','2020-07-20 23:36:10','2020-07-20 23:36:10'),(43,14,30,'Grenades','2020-07-20 23:36:10','2020-07-20 23:36:10'),(44,14,36,'Guided Missile Warheads and Explosive Components','2020-07-20 23:36:10','2020-07-20 23:36:10'),(45,14,37,'Guided Missile and Space Vehicle Explosive Propulsion Units, Solid Fuel; and Components','2020-07-20 23:36:10','2020-07-20 23:36:10'),(46,14,38,'Guided Missile and Space Vehicle Inert Propulsion Units, Solid Fuel; and Components.','2020-07-20 23:36:10','2020-07-20 23:36:10'),(47,14,40,'Rockets, Rocket Ammunition and Rocket Components','2020-07-20 23:36:10','2020-07-20 23:36:10'),(48,14,45,'Land Mines','2020-07-20 23:36:10','2020-07-20 23:36:10'),(49,14,50,'Underwater Mine and Components, Inert','2020-07-20 23:36:10','2020-07-20 23:36:10'),(50,14,51,'Underwater Mines and Components, Explosive','2020-07-20 23:36:10','2020-07-20 23:36:10'),(51,14,52,'Underwater Mine Disposal Inert Devices','2020-07-20 23:36:10','2020-07-20 23:36:10'),(52,14,53,'Underwater Mine Disposal Explosive Devices','2020-07-20 23:36:10','2020-07-20 23:36:10'),(53,14,55,'Torpedoes and Components, Inert','2020-07-20 23:36:10','2020-07-20 23:36:10'),(54,14,56,'Torpedoes and Components, Explosive','2020-07-20 23:36:10','2020-07-20 23:36:10'),(55,14,60,'Depth Charges and Components, Inert','2020-07-20 23:36:10','2020-07-20 23:36:10'),(56,14,61,'Depth Charges and Components, Explosive','2020-07-20 23:36:10','2020-07-20 23:36:10'),(57,14,65,'Military Chemical Agents','2020-07-20 23:36:10','2020-07-20 23:36:10'),(58,14,70,'Pyrotechnics','2020-07-20 23:36:10','2020-07-20 23:36:10'),(59,14,75,'Demolition Materials','2020-07-20 23:36:10','2020-07-20 23:36:10'),(60,14,76,'Bulk Explosives','2020-07-20 23:36:10','2020-07-20 23:36:10'),(61,14,77,'Cartridge and Propellant Actuated Devices and Components','2020-07-20 23:36:10','2020-07-20 23:36:10'),(62,14,85,'Surface Use Explosive Ordnance Disposal Tools and Equipment','2020-07-20 23:36:10','2020-07-20 23:36:10'),(63,14,86,'Underwater Use Explosive Ordnance Disposal and Swimmer Weapons Systems Tools and Equipment','2020-07-20 23:36:10','2020-07-20 23:36:10'),(64,14,90,'Fuses and Primers','2020-07-20 23:36:10','2020-07-20 23:36:10'),(65,14,95,'Miscellaneous Ammunition','2020-07-20 23:36:10','2020-07-20 23:36:10'),(66,14,98,'Specialized Ammunition Handling and Servicing Equipment','2020-07-20 23:36:10','2020-07-20 23:36:10'),(67,15,10,'Guided Missiles','2020-07-20 23:37:06','2020-07-20 23:37:06'),(68,15,20,'Guided Missile Components','2020-07-20 23:37:06','2020-07-20 23:37:06'),(69,15,25,'Guided Missile Systems, Complete','2020-07-20 23:37:06','2020-07-20 23:37:06'),(70,15,27,'Guided Missile Sub-systems','2020-07-20 23:37:06','2020-07-20 23:37:06'),(71,15,30,'Guided Missile Remote Control Systems','2020-07-20 23:37:06','2020-07-20 23:37:06'),(72,15,40,'Launchers, Guided Missile','2020-07-20 23:37:06','2020-07-20 23:37:06'),(73,15,50,'Guided Missile Handling and Servicing Equipment','2020-07-20 23:37:06','2020-07-20 23:37:06'),(74,16,10,'Aircraft, Fixed Wing','2020-07-20 23:37:46','2020-07-20 23:37:46'),(75,16,20,'Aircraft, Rotary Wing','2020-07-20 23:37:46','2020-07-20 23:37:46'),(76,16,40,'Gliders','2020-07-20 23:37:46','2020-07-20 23:37:46'),(77,16,50,'Unmanned Aircraft','2020-07-20 23:37:46','2020-07-20 23:37:46'),(78,16,60,'Airframe Structural Components','2020-07-20 23:37:46','2020-07-20 23:37:46'),(79,17,10,'Aircraft Propellers and Components','2020-07-20 23:38:53','2020-07-20 23:38:53'),(80,17,15,'Helicopter Rotor Blades, Drive Mechanisms and Components','2020-07-20 23:38:53','2020-07-20 23:38:53'),(81,17,20,'Aircraft Landing Gear Components','2020-07-20 23:38:53','2020-07-20 23:38:53'),(82,17,30,'Aircraft Wheel and Brake Systems','2020-07-20 23:38:53','2020-07-20 23:38:53'),(83,17,40,'Aircraft Control Cable Products','2020-07-20 23:38:53','2020-07-20 23:38:53'),(84,17,50,'Aircraft Hydraulic, Vacuum, and De-icing System Components','2020-07-20 23:38:53','2020-07-20 23:38:53'),(85,17,60,'Aircraft Air Conditioning, Heating, and Pressurizing Equipment','2020-07-20 23:38:53','2020-07-20 23:38:53'),(86,17,70,'Parachutes; Aerial Pick Up, Delivery, Recovery Systems; and Cargo Tie Down Equipment','2020-07-20 23:38:53','2020-07-20 23:38:53'),(87,17,80,'Miscellaneous Aircraft Accessories and Components','2020-07-20 23:38:53','2020-07-20 23:38:53'),(88,18,10,'Aircraft Landing Equipment','2020-07-20 23:40:02','2020-07-20 23:40:02'),(89,18,20,'Aircraft Launching Equipment','2020-07-20 23:40:02','2020-07-20 23:40:02'),(90,18,30,'Aircraft Ground Servicing Equipment','2020-07-20 23:40:02','2020-07-20 23:40:02'),(91,18,40,'Airfield Specialized Trucks and Trailers','2020-07-20 23:40:02','2020-07-20 23:40:02'),(92,19,10,'Space Vehicles','2020-07-20 23:42:23','2020-07-20 23:42:23'),(93,19,20,'Space Vehicle Components','2020-07-20 23:42:23','2020-07-20 23:42:23'),(94,19,30,'Space Vehicle Remote Control Systems','2020-07-20 23:42:23','2020-07-20 23:42:23'),(95,19,40,'Space Vehicle Launchers','2020-07-20 23:42:23','2020-07-20 23:42:23'),(96,19,50,'Space Vehicle Handling and Servicing Equipment','2020-07-20 23:42:23','2020-07-20 23:42:23'),(97,19,60,'Space Survival Equipment','2020-07-20 23:42:23','2020-07-20 23:42:23'),(98,20,5,'Combat Ships and Landing Vessels','2020-07-20 23:43:39','2020-07-20 23:43:39'),(99,20,10,'Transport Vessels, Passenger and Troop','2020-07-20 23:43:39','2020-07-20 23:43:39'),(100,20,15,'Cargo and Tanker Vessels','2020-07-20 23:43:39','2020-07-20 23:43:39'),(101,20,20,'Fishing Vessels','2020-07-20 23:43:39','2020-07-20 23:43:39'),(102,20,25,'Special Service Vessels','2020-07-20 23:43:39','2020-07-20 23:43:39'),(103,20,30,'Barges and Lighters, Cargo','2020-07-20 23:43:39','2020-07-20 23:43:39'),(104,20,35,'Barges and Lighters, Special Purpose','2020-07-20 23:43:39','2020-07-20 23:43:39'),(105,20,40,'Small Craft','2020-07-20 23:43:39','2020-07-20 23:43:39'),(106,20,45,'Pontoons and Floating Docks','2020-07-20 23:43:39','2020-07-20 23:43:39'),(107,20,50,'Floating Drydocks','2020-07-20 23:43:39','2020-07-20 23:43:39'),(108,20,55,'Dredges','2020-07-20 23:43:39','2020-07-20 23:43:39'),(109,20,90,'Miscellaneous Vessels','2020-07-20 23:43:39','2020-07-20 23:43:39'),(110,21,10,'Ship and Boat Propulsion Components','2020-07-20 23:44:38','2020-07-20 23:44:38'),(111,21,20,'Rigging and Rigging Gear','2020-07-20 23:44:38','2020-07-20 23:44:38'),(112,21,30,'Deck Machinery','2020-07-20 23:44:38','2020-07-20 23:44:38'),(113,21,40,'Marine Hardware and Hull Items','2020-07-20 23:44:38','2020-07-20 23:44:38'),(114,21,50,'Buoys','2020-07-20 23:44:38','2020-07-20 23:44:38'),(115,21,60,'Commercial Fishing Equipment','2020-07-20 23:44:38','2020-07-20 23:44:38'),(116,21,90,'Miscellaneous Ship and Marine Equipment','2020-07-20 23:44:38','2020-07-20 23:44:38'),(117,22,10,'Locomotives','2020-07-20 23:45:14','2020-07-20 23:45:14'),(118,22,20,'Rail Cars','2020-07-20 23:45:14','2020-07-20 23:45:14'),(119,22,30,'Right-of-Way Construction and Maintenance Equipment, Railroad','2020-07-20 23:45:14','2020-07-20 23:45:14'),(120,22,40,'Locomotive and Rail Car Accessories and Components','2020-07-20 23:45:14','2020-07-20 23:45:14'),(121,22,50,'Track Material, Railroad','2020-07-20 23:45:14','2020-07-20 23:45:14'),(122,23,5,'Ground Effect Vehicles','2020-07-20 23:46:11','2020-07-20 23:46:11'),(123,23,10,'Passenger Motor Vehicles','2020-07-20 23:46:11','2020-07-20 23:46:11'),(124,23,20,'Trucks and Truck Tractors, Wheeled','2020-07-20 23:46:11','2020-07-20 23:46:11'),(125,23,30,'Trailers','2020-07-20 23:46:11','2020-07-20 23:46:11'),(126,23,40,'Motorcycles, Motor Scooters, and Bicycles','2020-07-20 23:46:11','2020-07-20 23:46:11'),(127,23,50,'Combat, Assault, and Tactical Vehicles, Tracked','2020-07-20 23:46:11','2020-07-20 23:46:11'),(128,23,55,'Combat, Assault, and Tactical Vehicles, Wheeled','2020-07-20 23:46:11','2020-07-20 23:46:11'),(129,24,10,'Tractor, Full Tracked, Low Speed','2020-07-20 23:46:33','2020-07-20 23:46:33'),(130,24,20,'Tractors, Wheeled','2020-07-20 23:46:33','2020-07-20 23:46:33'),(131,24,30,'Tractors, Full Tracked, High Speed','2020-07-20 23:46:33','2020-07-20 23:46:33'),(132,25,10,'Vehicular Cab, Body, and Frame Structural Components','2020-07-20 23:47:22','2020-07-20 23:47:22'),(133,25,20,'Vehicular Power Transmission Components','2020-07-20 23:47:22','2020-07-20 23:47:22'),(134,25,30,'Vehicular Brake, Steering, Axle, Wheel, and Track Components','2020-07-20 23:47:22','2020-07-20 23:47:22'),(135,25,40,'Vehicular Furniture and Accessories','2020-07-20 23:47:22','2020-07-20 23:47:22'),(136,25,41,'Weapons Systems Specific Vehicular Accessories','2020-07-20 23:47:22','2020-07-20 23:47:22'),(137,25,90,'Miscellaneous Vehicular Components','2020-07-20 23:47:22','2020-07-20 23:47:22'),(138,26,10,'Tyres and Tubes, Pneumatic, Except Aircraft','2020-07-20 23:48:04','2020-07-20 23:48:04'),(139,26,20,'Tyres and Tubes, Pneumatic, Aircraft','2020-07-20 23:48:04','2020-07-20 23:48:04'),(140,26,30,'Tyres, Solid and Cushion','2020-07-20 23:48:04','2020-07-20 23:48:04'),(141,26,40,'Tyre Rebuilding and Tire and Tube Repair Materials','2020-07-20 23:48:04','2020-07-20 23:48:04'),(142,27,5,'Gasoline Reciprocating Engines, Except Aircraft; and Components','2020-07-20 23:49:25','2020-07-20 23:49:25'),(143,27,10,'Gasoline Reciprocating Engines, Aircraft Prime Mover; and Components','2020-07-20 23:49:25','2020-07-20 23:49:25'),(144,27,15,'Diesel Engines and Components','2020-07-20 23:49:25','2020-07-20 23:49:25'),(145,27,20,'Steam Engines, Reciprocating; and Components','2020-07-20 23:49:25','2020-07-20 23:49:25'),(146,27,25,'Steam Turbines and Components','2020-07-20 23:49:25','2020-07-20 23:49:25'),(147,27,30,'Water Turbines and Water Wheels; and Components','2020-07-20 23:49:25','2020-07-20 23:49:25'),(148,27,35,'Gas Turbines and Jet Engines; Non-Aircraft Prime Mover, Aircraft Non-Prime Mover, and Components','2020-07-20 23:49:25','2020-07-20 23:49:25'),(149,27,40,'Gas Turbines and Jet Engines, Aircraft, Prime Moving; and Components','2020-07-20 23:49:25','2020-07-20 23:49:25'),(150,27,45,'Rocket Engines and Components','2020-07-20 23:49:25','2020-07-20 23:49:25'),(151,27,50,'Gasoline Rotary Engines and Components','2020-07-20 23:49:25','2020-07-20 23:49:25'),(152,27,95,'Miscellaneous Engines and Components','2020-07-20 23:49:25','2020-07-20 23:49:25'),(153,28,10,'Engine Fuel System Components, Nonaircraft','2020-07-20 23:50:41','2020-07-20 23:50:41'),(154,28,15,'Engine Fuel System Components, Aircraft and Missile Prime Movers','2020-07-20 23:50:41','2020-07-20 23:50:41'),(155,28,20,'Engine Electrical System Components, Nonaircraft','2020-07-20 23:50:41','2020-07-20 23:50:41'),(156,28,25,'Engine Electrical System Components, Aircraft Prime Moving','2020-07-20 23:50:41','2020-07-20 23:50:41'),(157,28,30,'Engine Cooling System Components, Nonaircraft','2020-07-20 23:50:41','2020-07-20 23:50:41'),(158,28,35,'Engine System Cooling Components, Aircraft Prime Moving','2020-07-20 23:50:41','2020-07-20 23:50:41'),(159,28,40,'Engine Air and Oil Filters, Strainers, and Cleaners, Nonaircraft','2020-07-20 23:50:41','2020-07-20 23:50:41'),(160,28,45,'Engine Air and Oil Filters, Cleaners, Aircraft Prime Moving','2020-07-20 23:50:41','2020-07-20 23:50:41'),(161,28,50,'Turbo Supercharger and Components','2020-07-20 23:50:41','2020-07-20 23:50:41'),(162,28,90,'Miscellaneous Engine Accessories, Nonaircraft','2020-07-20 23:50:41','2020-07-20 23:50:41'),(163,28,95,'Miscellaneous Engine Accessories, Aircraft','2020-07-20 23:50:41','2020-07-20 23:50:41'),(164,29,10,'orque Converters and Speed Changers','2020-07-20 23:51:15','2020-07-20 23:51:15'),(165,29,20,'Gears, Pulleys, Sprockets, and Transmission Chain','2020-07-20 23:51:15','2020-07-20 23:51:15'),(166,29,30,'Belting, Drive Belts, Fan Belts, and Accessories','2020-07-20 23:51:15','2020-07-20 23:51:15'),(167,29,40,'Miscellaneous Power Transmission Equipment','2020-07-20 23:51:15','2020-07-20 23:51:15'),(168,30,10,'Ball Bearings, Anti-Friction, Unmounted','2020-07-20 23:51:49','2020-07-20 23:51:49'),(169,30,20,'Bearings, Plain, Unmounted','2020-07-20 23:51:49','2020-07-20 23:51:49'),(170,30,30,'Bearings, Mounted','2020-07-20 23:51:49','2020-07-20 23:51:49'),(171,30,40,'Bearings, Spherical roller','2020-07-20 23:51:49','2020-07-20 23:51:49'),(172,31,10,'Sawmill and Planing Mill Machinery','2020-07-20 23:52:14','2020-07-20 23:52:14'),(173,31,20,'Woodworking Machines','2020-07-20 23:52:14','2020-07-20 23:52:14'),(174,31,30,'Tools and Attachments for Woodworking Machinery','2020-07-20 23:52:14','2020-07-20 23:52:14'),(175,32,65,'Historical FSC','2020-07-20 23:52:33','2020-07-20 23:52:33'),(176,32,75,'Historical FSC','2020-07-20 23:52:33','2020-07-20 23:52:33'),(177,33,5,'Saws and Filing Machines','2020-07-21 12:33:50','2020-07-21 12:33:50'),(178,33,8,'Machining Centers and Way-Type Machines','2020-07-21 12:33:50','2020-07-21 12:33:50'),(179,33,10,'Electrical and Ultrasonic Erosion Machines','2020-07-21 12:33:50','2020-07-21 12:33:50'),(180,33,11,'Boring Machines','2020-07-21 12:33:50','2020-07-21 12:33:50'),(181,33,12,'Broaching Machines','2020-07-21 12:33:50','2020-07-21 12:33:50'),(182,33,13,'Drilling and Tapping Machines','2020-07-21 12:33:50','2020-07-21 12:33:50'),(183,33,14,'Gear Cutting and Finishing Machines','2020-07-21 12:33:50','2020-07-21 12:33:50'),(184,33,15,'Grinding Machines','2020-07-21 12:33:50','2020-07-21 12:33:50'),(185,33,16,'Lathes','2020-07-21 12:33:50','2020-07-21 12:33:50'),(186,33,17,'Milling Machines','2020-07-21 12:33:50','2020-07-21 12:33:50'),(187,33,18,'Planers and Shapers','2020-07-21 12:33:50','2020-07-21 12:33:50'),(188,33,19,'Miscellaneous Machine Tools','2020-07-21 12:33:50','2020-07-21 12:33:50'),(189,33,22,'Rolling Mills and Drawing Machines','2020-07-21 12:33:50','2020-07-21 12:33:50'),(190,33,24,'Metal Heat Treating and Non-Thermal Treating Equipment','2020-07-21 12:33:50','2020-07-21 12:33:50'),(191,33,26,'Metal Finishing Equipment','2020-07-21 12:33:50','2020-07-21 12:33:50'),(192,33,31,'Electric Arc Welding Equipment','2020-07-21 12:33:50','2020-07-21 12:33:50'),(193,33,32,'Electric Resistance Welding Equipment','2020-07-21 12:33:50','2020-07-21 12:33:50'),(194,33,33,'Gas Welding, Heat Cutting, and Metalizing Equipment','2020-07-21 12:33:50','2020-07-21 12:33:50'),(195,33,36,'Welding Positioners and Manipulators','2020-07-21 12:33:50','2020-07-21 12:33:50'),(196,33,38,'Miscellaneous Welding Equipment','2020-07-21 12:33:50','2020-07-21 12:33:50'),(197,33,39,'Miscellaneous Welding, Soldering, and Brazing Supplies and Accessories','2020-07-21 12:33:50','2020-07-21 12:33:50'),(198,33,41,'Bending and Forming Machines','2020-07-21 12:33:50','2020-07-21 12:33:50'),(199,33,42,'Hydraulic and Pneumatic Presses, Power Driven','2020-07-21 12:33:50','2020-07-21 12:33:50'),(200,33,43,'Mechanical Presses, Power Driven','2020-07-21 12:33:50','2020-07-21 12:33:50'),(201,33,44,'Manual Presses','2020-07-21 12:33:50','2020-07-21 12:33:50'),(202,33,45,'Punching and Shearing Machines','2020-07-21 12:33:50','2020-07-21 12:33:50'),(203,33,46,'Forging Machinery and Hammers','2020-07-21 12:33:50','2020-07-21 12:33:50'),(204,33,47,'Wire and Metal Ribbon Forming Machines','2020-07-21 12:33:50','2020-07-21 12:33:50'),(205,33,48,'Riveting Machines','2020-07-21 12:33:50','2020-07-21 12:33:50'),(206,33,49,'Miscellaneous Secondary Metal Forming and Cutting Machines','2020-07-21 12:33:50','2020-07-21 12:33:50'),(207,33,50,'Machine Tools, Portable','2020-07-21 12:33:50','2020-07-21 12:33:50'),(208,33,55,'Cutting Tools for Machine Tools','2020-07-21 12:33:50','2020-07-21 12:33:50'),(209,33,56,'Cutting and Forming Tools for Secondary Metalworking Machinery','2020-07-21 12:33:50','2020-07-21 12:33:50'),(210,33,60,'Machine Tool accessories','2020-07-21 12:33:50','2020-07-21 12:33:50'),(211,33,61,'Accessories for Secondary Metalworking Machinery','2020-07-21 12:33:50','2020-07-21 12:33:50'),(212,33,65,'Production Jigs, Fixtures, and Templates','2020-07-21 12:33:50','2020-07-21 12:33:50'),(213,33,70,'Machine Shop Sets, Kits, and Outfits','2020-07-21 12:33:50','2020-07-21 12:33:50'),(214,34,10,'Laundry and Dry Cleaning Equipment','2020-07-21 12:33:50','2020-07-21 12:33:50'),(215,34,20,'Shoe Repairing Equipment','2020-07-21 12:33:50','2020-07-21 12:33:50'),(216,34,30,'Industrial Sewing Machines and Mobile Textile Repair Shops','2020-07-21 12:33:50','2020-07-21 12:33:50'),(217,34,40,'Wrapping and Packaging Machinery','2020-07-21 12:33:50','2020-07-21 12:33:50'),(218,34,50,'Vending and Coin Operated Machines','2020-07-21 12:33:50','2020-07-21 12:33:50'),(219,34,90,'Miscellaneous Service and Trade Equipment','2020-07-21 12:33:50','2020-07-21 12:33:50'),(220,35,5,'Food Products Machinery and Equipment','2020-07-21 12:36:03','2020-07-21 12:36:03'),(221,35,10,'Printing, Duplicating, and Bookbinding Equipment','2020-07-21 12:36:03','2020-07-21 12:36:03'),(222,35,11,'Industrial Marking Machines','2020-07-21 12:36:03','2020-07-21 12:36:03'),(223,35,15,'Pulp and Paper Industries Machinery','2020-07-21 12:36:03','2020-07-21 12:36:03'),(224,35,20,'Rubber and Plastics Working Machinery','2020-07-21 12:36:03','2020-07-21 12:36:03'),(225,35,25,'Textile Industries Machinery','2020-07-21 12:36:03','2020-07-21 12:36:03'),(226,35,30,'Clay and Concrete Products Industries Machinery','2020-07-21 12:36:03','2020-07-21 12:36:03'),(227,35,35,'Crystal and Glass Industries Machinery','2020-07-21 12:36:03','2020-07-21 12:36:03'),(228,35,40,'Tobacco Manufacturing Machinery','2020-07-21 12:36:03','2020-07-21 12:36:03'),(229,35,45,'Leather Tanning and Leather Working Industries Machinery','2020-07-21 12:36:03','2020-07-21 12:36:03'),(230,35,50,'Chemical and Pharmaceutical Products Manufacturing Machinery','2020-07-21 12:36:03','2020-07-21 12:36:03'),(231,35,55,'Gas Generating and Dispensing Systems, Fixed or Mobile','2020-07-21 12:36:03','2020-07-21 12:36:03'),(232,35,60,'Industrial Size Reduction Machinery','2020-07-21 12:36:03','2020-07-21 12:36:03'),(233,35,70,'Specialized Semiconductor, Microcircuit, and Printed Circuit Board Manufacturing Machinery','2020-07-21 12:36:03','2020-07-21 12:36:03'),(234,35,80,'Foundry Machinery, Related Equipment and Supplies','2020-07-21 12:36:03','2020-07-21 12:36:03'),(235,35,85,'Specialized Metal Container Manufacturing Machinery and Related Equipment','2020-07-21 12:36:03','2020-07-21 12:36:03'),(236,35,90,'Specialized Ammunition and Ordnance Machinery and Related Equipment','2020-07-21 12:36:03','2020-07-21 12:36:03'),(237,35,93,'Industrial Assembly Machines','2020-07-21 12:36:03','2020-07-21 12:36:03'),(238,35,94,'Clean Work Stations, Controlled Environment, and Related Equipment','2020-07-21 12:36:03','2020-07-21 12:36:03'),(239,35,95,'Miscellaneous Special Industry Machinery','2020-07-21 12:36:03','2020-07-21 12:36:03'),(240,36,10,'Soil Preparation Equipment','2020-07-21 12:36:53','2020-07-21 12:36:53'),(241,36,20,'Harvesting Equipment','2020-07-21 12:36:53','2020-07-21 12:36:53'),(242,36,30,'Dairy, Poultry, and Livestock Equipment','2020-07-21 12:36:53','2020-07-21 12:36:53'),(243,36,40,'Pest, Disease, and Frost Control Equipment','2020-07-21 12:36:53','2020-07-21 12:36:53'),(244,36,50,'Gardening Implements and Tools','2020-07-21 12:36:53','2020-07-21 12:36:53'),(245,36,60,'Animal Drawn Vehicles and Farm Trailers','2020-07-21 12:36:53','2020-07-21 12:36:53'),(246,36,70,'Saddlery, Harness, Whips, and Related Animal Furnishings','2020-07-21 12:36:53','2020-07-21 12:36:53'),(247,37,5,'Earth Moving and Excavating Equipment','2020-07-21 12:37:56','2020-07-21 12:37:56'),(248,37,10,'Cranes and Crane-Shovels','2020-07-21 12:37:56','2020-07-21 12:37:56'),(249,37,15,'Crane and Crane-Shovel Attachments','2020-07-21 12:37:56','2020-07-21 12:37:56'),(250,37,20,'Mining, Rock Drilling, Earth Boring, and Related Equipment','2020-07-21 12:37:56','2020-07-21 12:37:56'),(251,37,25,'Road Clearing, Cleaning, and Marking Equipment','2020-07-21 12:37:56','2020-07-21 12:37:56'),(252,37,30,'Truck and Tractor Attachments','2020-07-21 12:37:56','2020-07-21 12:37:56'),(253,37,35,'Petroleum Production and Distribution Equipment','2020-07-21 12:37:56','2020-07-21 12:37:56'),(254,37,95,'Miscellaneous Construction Equipment','2020-07-21 12:37:56','2020-07-21 12:37:56'),(255,38,10,'Conveyors','2020-07-21 12:38:49','2020-07-21 12:38:49'),(256,38,15,'Materials Feeders','2020-07-21 12:38:49','2020-07-21 12:38:49'),(257,38,20,'Material Handling Equipment, Nonself-Propelled','2020-07-21 12:38:49','2020-07-21 12:38:49'),(258,38,30,'Warehouse Trucks and Tractors, Self-Propelled','2020-07-21 12:38:49','2020-07-21 12:38:49'),(259,38,40,'Blocks, Tackle, Rigging, and Slings','2020-07-21 12:38:49','2020-07-21 12:38:49'),(260,38,50,'Winches, Hoists, Cranes, and Derricks','2020-07-21 12:38:49','2020-07-21 12:38:49'),(261,38,60,'Freight Elevators','2020-07-21 12:38:49','2020-07-21 12:38:49'),(262,38,90,'Miscellaneous Materials Handling Equipment','2020-07-21 12:38:49','2020-07-21 12:38:49'),(263,39,10,'Chain and Wire Rope','2020-07-21 12:39:19','2020-07-21 12:39:19'),(264,39,20,'Fiber Rope, Cordage, and Twine','2020-07-21 12:39:19','2020-07-21 12:39:19'),(265,39,30,'Fittings for Rope, Cable, and Chain','2020-07-21 12:39:19','2020-07-21 12:39:19'),(266,40,10,'Refrigeration Equipment','2020-07-21 12:39:58','2020-07-21 12:39:58'),(267,40,20,'Air Conditioning Equipment','2020-07-21 12:39:58','2020-07-21 12:39:58'),(268,40,30,'Refrigeration and Air Conditioning Components','2020-07-21 12:39:58','2020-07-21 12:39:58'),(269,40,40,'Fans, Air Circulators, and Blower Equipment','2020-07-21 12:39:58','2020-07-21 12:39:58'),(270,40,50,'Vortex Tubes and Other Related Cooling Tubes','2020-07-21 12:39:58','2020-07-21 12:39:58'),(271,41,10,'Fire Fighting Equipment','2020-07-21 12:40:38','2020-07-21 12:40:38'),(272,41,20,'Marine Lifesaving and Diving Equipment','2020-07-21 12:40:38','2020-07-21 12:40:38'),(273,41,30,'Decontaminating and Impregnating Equipment','2020-07-21 12:40:38','2020-07-21 12:40:38'),(274,41,35,' Hazardous Material Spill Containment and Clean-up Equipment and Material','2020-07-21 12:40:38','2020-07-21 12:40:38'),(275,41,40,'Safety and Rescue Equipment','2020-07-21 12:40:38','2020-07-21 12:40:38'),(276,41,50,'Recycling and Reclamation Equipment','2020-07-21 12:40:38','2020-07-21 12:40:38'),(277,42,10,'Compressors and Vacuum Pumps','2020-07-21 12:41:03','2020-07-21 12:41:03'),(278,42,20,'Power and Hand Pumps','2020-07-21 12:41:03','2020-07-21 12:41:03'),(279,42,30,'Centrifugals, Separators, and Pressure and Vacuum Filters','2020-07-21 12:41:03','2020-07-21 12:41:03'),(280,43,10,'Industrial Boilers','2020-07-21 12:41:39','2020-07-21 12:41:39'),(281,43,20,'Heat Exchangers and Steam Condensers','2020-07-21 12:41:39','2020-07-21 12:41:39'),(282,43,30,'Industrial Furnaces, Kilns, Lehrs, and Ovens','2020-07-21 12:41:39','2020-07-21 12:41:39'),(283,43,40,'Driers, Dehydrators, and Anhydrators','2020-07-21 12:41:39','2020-07-21 12:41:39'),(284,43,60,'Air Purification Equipment','2020-07-21 12:41:39','2020-07-21 12:41:39'),(285,43,70,'Nuclear Reactors','2020-07-21 12:41:39','2020-07-21 12:41:39'),(286,44,10,'Plumbing Fixtures and Accessories','2020-07-21 12:42:06','2020-07-21 12:42:06'),(287,44,20,'Space and Water Heating Equipment','2020-07-21 12:42:06','2020-07-21 12:42:06'),(288,44,30,'Fuel Burning Equipment Units','2020-07-21 12:42:06','2020-07-21 12:42:06'),(289,44,40,'Waste Disposal Equipment','2020-07-21 12:42:06','2020-07-21 12:42:06'),(290,45,10,'Water Purification Equipment','2020-07-21 12:42:28','2020-07-21 12:42:28'),(291,45,20,'Water Distillation Equipment, Marine and Industrial','2020-07-21 12:42:28','2020-07-21 12:42:28'),(292,45,30,'Sewage Treatment Equipment','2020-07-21 12:42:28','2020-07-21 12:42:28'),(293,46,10,'Pipe, Tube and Rigid Tubing','2020-07-21 12:42:50','2020-07-21 12:42:50'),(294,46,20,'Hose and Flexible Tubing','2020-07-21 12:42:50','2020-07-21 12:42:50'),(295,46,30,'Hose, Pipe, Tube, Lubrication, and Railing Fittings','2020-07-21 12:42:50','2020-07-21 12:42:50'),(296,47,10,'Valves, Powered','2020-07-21 12:43:17','2020-07-21 12:43:17'),(297,47,20,'Valves, Nonpowered','2020-07-21 12:43:17','2020-07-21 12:43:17'),(298,48,10,'Motor Vehicle Maintenance and Repair Shop Specialized Equipment','2020-07-21 12:44:31','2020-07-21 12:44:31'),(299,48,20,'Aircraft Maintenance and Repair Shop Specialized Equipment','2020-07-21 12:44:31','2020-07-21 12:44:31'),(300,48,21,'Torpedo Maintenance, Repair, and Checkout Specialized Equipment','2020-07-21 12:44:31','2020-07-21 12:44:31'),(301,48,23,' Depth Charges and Underwater Mines Maintenance, Repair, and Checkout Specialized Equipment','2020-07-21 12:44:31','2020-07-21 12:44:31'),(302,48,25,'Ammunition Maintenance, Repair, and Checkout Specialized Equipment','2020-07-21 12:44:31','2020-07-21 12:44:31'),(303,48,27,'Rocket Maintenance, Repair and Checkout Specialized Equipment','2020-07-21 12:44:31','2020-07-21 12:44:31'),(304,48,30,'Lubrication and Fuel Dispensing Equipment','2020-07-21 12:44:31','2020-07-21 12:44:31'),(305,48,31,'Fire Control Maintenance and Repair Shop Specialized Equipment','2020-07-21 12:44:31','2020-07-21 12:44:31'),(306,48,33,'Weapons Maintenance and Repair Shop Specialized Equipment','2020-07-21 12:44:31','2020-07-21 12:44:31'),(307,48,35,'Guided Missile Maintenance, Repair, and Checkout Specialized Equipment','2020-07-21 12:44:31','2020-07-21 12:44:31'),(308,48,40,'Miscellaneous Maintenance and Repair Shop Specialized Equipment','2020-07-21 12:44:31','2020-07-21 12:44:31'),(309,48,60,'Space Vehicle Maintenance, Repair, and Checkout Specialized Equipment','2020-07-21 12:44:31','2020-07-21 12:44:31'),(310,48,70,'Multiple Guided Weapons, Specialized Maintenance and Repair Shop Equipment','2020-07-21 12:44:31','2020-07-21 12:44:31'),(311,49,10,'Hand Tools, Edged, Non-powered','2020-07-21 23:12:20','2020-07-21 23:12:20'),(312,49,20,'Hand Tools, Non-edged, Non-powered','2020-07-21 23:12:20','2020-07-21 23:12:20'),(313,49,30,'Hand Tools, Power Driven','2020-07-21 23:12:20','2020-07-21 23:12:20'),(314,49,33,'Drill Bits, Counterbores, and Countersinks: Hand and Machine','2020-07-21 23:12:20','2020-07-21 23:12:20'),(315,49,36,'Taps, Dies, and Collets; Hand and Machine','2020-07-21 23:12:20','2020-07-21 23:12:20'),(316,49,40,'Tool and Hardware Boxes','2020-07-21 23:12:20','2020-07-21 23:12:20'),(317,49,80,'Sets, Kits, and Outfits of Hand Tools','2020-07-21 23:12:20','2020-07-21 23:12:20'),(318,50,10,'Measuring Tools, Craftsmen\'s','2020-07-21 23:12:43','2020-07-21 23:12:43'),(319,50,20,'Inspection Gages and Precision Layout Tools','2020-07-21 23:12:43','2020-07-21 23:12:43'),(320,50,80,'Sets, Kits, and Outfits of Measuring Tools','2020-07-21 23:12:43','2020-07-21 23:12:43'),(321,51,5,'Screws','2020-07-21 23:14:35','2020-07-21 23:14:35'),(322,51,6,'Bolts','2020-07-21 23:14:35','2020-07-21 23:14:35'),(323,51,7,'Studs','2020-07-21 23:14:35','2020-07-21 23:14:35'),(324,51,10,'Nuts and Washers','2020-07-21 23:14:35','2020-07-21 23:14:35'),(325,51,15,'Nails, Machine Keys, and Pins','2020-07-21 23:14:35','2020-07-21 23:14:35'),(326,51,20,'Rivets','2020-07-21 23:14:35','2020-07-21 23:14:35'),(327,51,25,'Fastening Devices','2020-07-21 23:14:35','2020-07-21 23:14:35'),(328,51,30,'Packing and Gasket Materials','2020-07-21 23:14:35','2020-07-21 23:14:35'),(329,51,31,'O-Ring','2020-07-21 23:14:35','2020-07-21 23:14:35'),(330,51,35,'Metal Screening','2020-07-21 23:14:35','2020-07-21 23:14:35'),(331,51,40,'Hardware, Commercial','2020-07-21 23:14:35','2020-07-21 23:14:35'),(332,51,41,'Brackets','2020-07-21 23:14:35','2020-07-21 23:14:35'),(333,51,42,'Hardware, Weapon System','2020-07-21 23:14:35','2020-07-21 23:14:35'),(334,51,45,'Disks and Stones, Abrasive','2020-07-21 23:14:35','2020-07-21 23:14:35'),(335,51,50,'Abrasive Materials','2020-07-21 23:14:35','2020-07-21 23:14:35'),(336,51,55,'Knobs and Pointers','2020-07-21 23:14:35','2020-07-21 23:14:35'),(337,51,60,'Coil, Flat, Leaf, and Wire Springs','2020-07-21 23:14:35','2020-07-21 23:14:35'),(338,51,65,'Bushings, Rings, Shims, and Spacers','2020-07-21 23:14:35','2020-07-21 23:14:35'),(339,52,10,'Prefabricated and Portable Buildings','2020-07-21 23:15:31','2020-07-21 23:15:31'),(340,52,11,'Rigid Wall Shelters','2020-07-21 23:15:31','2020-07-21 23:15:31'),(341,52,19,'Collective Modular Support System','2020-07-21 23:15:31','2020-07-21 23:15:31'),(342,52,20,'Bridges, Fixed and Floating','2020-07-21 23:15:31','2020-07-21 23:15:31'),(343,52,30,'Storage Tanks','2020-07-21 23:15:31','2020-07-21 23:15:31'),(344,52,40,'Scaffolding Equipment and Concrete Forms','2020-07-21 23:15:31','2020-07-21 23:15:31'),(345,52,45,'Prefabricated Tower Structures','2020-07-21 23:15:31','2020-07-21 23:15:31'),(346,52,50,'Miscellaneous Prefabricated Structures','2020-07-21 23:15:31','2020-07-21 23:15:31'),(347,53,10,'Lumber and Related Basic Wood Materials','2020-07-21 23:16:02','2020-07-21 23:16:02'),(348,53,20,'Millwork','2020-07-21 23:16:02','2020-07-21 23:16:02'),(349,53,30,'Plywood and Veneer','2020-07-21 23:16:02','2020-07-21 23:16:02'),(350,54,10,'Mineral Construction Materials, Bulk','2020-07-21 23:16:57','2020-07-21 23:16:57'),(351,54,20,'Tile, Brick and Block','2020-07-21 23:16:57','2020-07-21 23:16:57'),(352,54,30,'Pipe and Conduit, Nonmetallic','2020-07-21 23:16:57','2020-07-21 23:16:57'),(353,54,40,'Wallboard, Building Paper, and Thermal Insulation Materials','2020-07-21 23:16:57','2020-07-21 23:16:57'),(354,54,50,'Roofing and Siding Materials','2020-07-21 23:16:57','2020-07-21 23:16:57'),(355,54,60,'Fencing, Fences, Gates and Components','2020-07-21 23:16:57','2020-07-21 23:16:57'),(356,54,70,'Building Components, Prefabricated','2020-07-21 23:16:57','2020-07-21 23:16:57'),(357,54,75,'Non-wood Construction Lumber and Related Materials','2020-07-21 23:16:57','2020-07-21 23:16:57'),(358,54,80,'Miscellaneous Construction Materials','2020-07-21 23:16:57','2020-07-21 23:16:57'),(359,55,5,'Telephone and Telegraph Equipment','2020-07-21 23:19:12','2020-07-21 23:19:12'),(360,55,10,'Communications Security Equipment and Components','2020-07-21 23:19:12','2020-07-21 23:19:12'),(361,55,11,'Other Cryptologic Equipment and Components','2020-07-21 23:19:12','2020-07-21 23:19:12'),(362,55,15,'Teletype and Facsimile Equipment','2020-07-21 23:19:12','2020-07-21 23:19:12'),(363,55,20,'Radio and Television Communication Equipment, Except Airborne','2020-07-21 23:19:12','2020-07-21 23:19:12'),(364,55,21,'Radio and Television Communication Equipment, Airborne','2020-07-21 23:19:12','2020-07-21 23:19:12'),(365,55,25,'Radio Navigation Equipment, Except Airborne','2020-07-21 23:19:12','2020-07-21 23:19:12'),(366,55,26,'Radio Navigation Equipment, Airborne','2020-07-21 23:19:12','2020-07-21 23:19:12'),(367,55,30,'Intercommunication and Public Address Systems, Except Airborne','2020-07-21 23:19:12','2020-07-21 23:19:12'),(368,55,31,'Intercommunication and Public Address Systems, Airborne','2020-07-21 23:19:12','2020-07-21 23:19:12'),(369,55,35,'Sound Recording and Reproducing Equipment','2020-07-21 23:19:12','2020-07-21 23:19:12'),(370,55,36,'Video Recording and Reproducing Equipment','2020-07-21 23:19:12','2020-07-21 23:19:12'),(371,55,40,'Radar Equipment, Except Airborne','2020-07-21 23:19:12','2020-07-21 23:19:12'),(372,55,41,'Radar Equipment, Airborne','2020-07-21 23:19:12','2020-07-21 23:19:12'),(373,55,45,'Underwater Sound Equipment','2020-07-21 23:19:12','2020-07-21 23:19:12'),(374,55,50,'Visible and Invisible Light Communication Equipment','2020-07-21 23:19:12','2020-07-21 23:19:12'),(375,55,55,'Night Vision Equipment, Emitted and Reflected Radiation','2020-07-21 23:19:12','2020-07-21 23:19:12'),(376,55,60,'Stimulated Coherent Radiation Devices, Components, and Accessories','2020-07-21 23:19:12','2020-07-21 23:19:12'),(377,55,65,'Electronic Countermeasures, Counter-Countermeasures, and Quick Reaction Capability Equipment','2020-07-21 23:19:12','2020-07-21 23:19:12'),(378,55,95,'Miscellaneous Communication Equipment','2020-07-21 23:19:12','2020-07-21 23:19:12'),(379,56,5,'Resistors','2020-07-21 23:21:39','2020-07-21 23:21:39'),(380,56,10,'Capacitors','2020-07-21 23:21:39','2020-07-21 23:21:39'),(381,56,15,'Filters and Networks','2020-07-21 23:21:39','2020-07-21 23:21:39'),(382,56,20,'Fuses, Arrestors, Absorbers, and Protectors','2020-07-21 23:21:39','2020-07-21 23:21:39'),(383,56,25,'Circuit Breakers','2020-07-21 23:21:39','2020-07-21 23:21:39'),(384,56,30,'Switches','2020-07-21 23:21:39','2020-07-21 23:21:39'),(385,56,35,'Connectors, Electrical','2020-07-21 23:21:39','2020-07-21 23:21:39'),(386,56,40,'Lugs, Terminals, and Terminal Strips','2020-07-21 23:21:39','2020-07-21 23:21:39'),(387,56,45,'Relays and Solenoids','2020-07-21 23:21:39','2020-07-21 23:21:39'),(388,56,50,'Coils and Transformers','2020-07-21 23:21:39','2020-07-21 23:21:39'),(389,56,55,'Oscillators and Piezoelectric Crystals','2020-07-21 23:21:39','2020-07-21 23:21:39'),(390,56,60,'Electron Tubes and Associated Hardware','2020-07-21 23:21:39','2020-07-21 23:21:39'),(391,56,61,'Semiconductor Devices and Associated Hardware','2020-07-21 23:21:39','2020-07-21 23:21:39'),(392,56,62,'Microcircuits, Electronic','2020-07-21 23:21:39','2020-07-21 23:21:39'),(393,56,63,'Electronic Modules','2020-07-21 23:21:39','2020-07-21 23:21:39'),(394,56,65,'Headsets, Handsets, Microphones and Speakers','2020-07-21 23:21:39','2020-07-21 23:21:39'),(395,56,70,'Electrical Insulators and Insulating Materials','2020-07-21 23:21:39','2020-07-21 23:21:39'),(396,56,75,'Electrical Hardware and Supplies','2020-07-21 23:21:39','2020-07-21 23:21:39'),(397,56,77,'Electrical Contact Brushes and Electrodes','2020-07-21 23:21:39','2020-07-21 23:21:39'),(398,56,80,'Optoelectronic Devices and Associated Hardware','2020-07-21 23:21:39','2020-07-21 23:21:39'),(399,56,85,'Antennas, Waveguides, and Related Equipment','2020-07-21 23:21:39','2020-07-21 23:21:39'),(400,56,90,'Synchros and Resolvers','2020-07-21 23:21:39','2020-07-21 23:21:39'),(401,56,95,'Cable, Cord, and Wire Assemblies: Communication Equipment','2020-07-21 23:21:39','2020-07-21 23:21:39'),(402,56,96,'Amplifiers','2020-07-21 23:21:39','2020-07-21 23:21:39'),(403,56,98,'Electrical and Electronic assemblies, Boards, Cards, and Associated Hardware','2020-07-21 23:21:39','2020-07-21 23:21:39'),(404,56,99,'Miscellaneous Electrical and Electronic Components','2020-07-21 23:21:39','2020-07-21 23:21:39'),(405,57,4,'Rotary Joints','2020-07-21 23:24:00','2020-07-21 23:24:00'),(406,57,5,'Couplers, Splitters, and Mixers','2020-07-21 23:24:00','2020-07-21 23:24:00'),(407,57,6,'Attenuators','2020-07-21 23:24:00','2020-07-21 23:24:00'),(408,57,7,'Filters','2020-07-21 23:24:00','2020-07-21 23:24:00'),(409,57,8,'Optical Multiplexers/Demultiplexers','2020-07-21 23:24:00','2020-07-21 23:24:00'),(410,57,10,'Fiber Optic Conductors','2020-07-21 23:24:00','2020-07-21 23:24:00'),(411,57,15,'Fiber Optic Cables','2020-07-21 23:24:00','2020-07-21 23:24:00'),(412,57,20,'Fiber Optic Cable Assemblies and Harnesses','2020-07-21 23:24:00','2020-07-21 23:24:00'),(413,57,21,'Fiber Optic Switches','2020-07-21 23:24:00','2020-07-21 23:24:00'),(414,57,25,'Fiber Optic Transmitters','2020-07-21 23:24:00','2020-07-21 23:24:00'),(415,57,26,'Fiber Optic Receivers','2020-07-21 23:24:00','2020-07-21 23:24:00'),(416,57,29,'Optical Repeaters','2020-07-21 23:24:00','2020-07-21 23:24:00'),(417,57,30,'Fiber Optic Devices','2020-07-21 23:24:00','2020-07-21 23:24:00'),(418,57,31,'Integrated Optical Circuits','2020-07-21 23:24:00','2020-07-21 23:24:00'),(419,57,32,'Fiber Optic Light Sources and Photo Detectors','2020-07-21 23:24:00','2020-07-21 23:24:00'),(420,57,33,'Fiber Optic Photo Detectors','2020-07-21 23:24:00','2020-07-21 23:24:00'),(421,57,34,'Fiber Optic Modulators/Demodulators','2020-07-21 23:24:00','2020-07-21 23:24:00'),(422,57,35,'Fiber Optic Light Transfer and Image Transfer Devices','2020-07-21 23:24:00','2020-07-21 23:24:00'),(423,57,40,'Fiber Optic Sensors','2020-07-21 23:24:00','2020-07-21 23:24:00'),(424,57,50,'Fiber Optic Passive Devices','2020-07-21 23:24:00','2020-07-21 23:24:00'),(425,57,60,'Fiber Optic Interconnectors','2020-07-21 23:24:00','2020-07-21 23:24:00'),(426,57,70,'Fiber Optic Accessories and Supplies','2020-07-21 23:24:00','2020-07-21 23:24:00'),(427,57,80,'Fiber Optic Kits and Sets','2020-07-21 23:24:00','2020-07-21 23:24:00'),(428,57,99,'Miscellaneous Fiber Optic Components','2020-07-21 23:24:00','2020-07-21 23:24:00'),(429,58,5,'Motors, Electrical','2020-07-21 23:25:33','2020-07-21 23:25:33'),(430,58,10,'Electrical Control Equipment','2020-07-21 23:25:33','2020-07-21 23:25:33'),(431,58,15,'Generators and Generator Sets, Electrical','2020-07-21 23:25:33','2020-07-21 23:25:33'),(432,58,16,'Fuel Cell Power Units, Components, and Accessories','2020-07-21 23:25:33','2020-07-21 23:25:33'),(433,58,17,'Solar Electric Power Systems','2020-07-21 23:25:33','2020-07-21 23:25:33'),(434,58,20,'Transformers: Distribution and Power Station','2020-07-21 23:25:33','2020-07-21 23:25:33'),(435,58,25,'Converters, Electrical, Rotating','2020-07-21 23:25:33','2020-07-21 23:25:33'),(436,58,30,'Converters, Electrical, Nonrotating','2020-07-21 23:25:33','2020-07-21 23:25:33'),(437,58,35,'Batteries, Non-rechargeable','2020-07-21 23:25:33','2020-07-21 23:25:33'),(438,58,40,'Batteries, Rechargeable','2020-07-21 23:25:33','2020-07-21 23:25:33'),(439,58,45,'Wire and Cable, Electrical','2020-07-21 23:25:33','2020-07-21 23:25:33'),(440,58,50,'Miscellaneous Electric Power and Distribution Equipment','2020-07-21 23:25:33','2020-07-21 23:25:33'),(441,58,60,'Miscellaneous Battery Retaining Fixtures, Liners and Ancillary Items','2020-07-21 23:25:33','2020-07-21 23:25:33'),(442,59,10,'Indoor and Outdoor Electric Lighting Fixtures','2020-07-21 23:26:14','2020-07-21 23:26:14'),(443,59,20,'Electric Vehicular Lights and Fixtures','2020-07-21 23:26:14','2020-07-21 23:26:14'),(444,59,30,'Electric Portable and Hand Lighting Equipment','2020-07-21 23:26:14','2020-07-21 23:26:14'),(445,59,40,'Electric Lamps','2020-07-21 23:26:14','2020-07-21 23:26:14'),(446,59,50,'Ballasts, Lampholders, and Starters','2020-07-21 23:26:14','2020-07-21 23:26:14'),(447,59,60,'Non-Electrical Lighting Fixtures','2020-07-21 23:26:14','2020-07-21 23:26:14'),(448,60,10,'Traffic and Transit Signal Systems','2020-07-21 23:26:49','2020-07-21 23:26:49'),(449,60,20,'Shipboard Alarm and Signal Systems','2020-07-21 23:26:49','2020-07-21 23:26:49'),(450,60,30,'Railroad Signal and Warning Devices','2020-07-21 23:26:49','2020-07-21 23:26:49'),(451,60,40,'Aircraft Alarm and Signal Systems','2020-07-21 23:26:49','2020-07-21 23:26:49'),(452,60,50,'Miscellaneous Alarm, Signal, and Security Detection Systems','2020-07-21 23:26:49','2020-07-21 23:26:49'),(453,61,5,'Drugs and Biologicals','2020-07-21 23:27:58','2020-07-21 23:27:58'),(454,61,8,'Medicated Cosmetics and Toiletries','2020-07-21 23:27:58','2020-07-21 23:27:58'),(455,61,9,'Drugs and Biologicals, Veterinary Use','2020-07-21 23:27:58','2020-07-21 23:27:58'),(456,61,10,'Surgical Dressing Materials','2020-07-21 23:27:58','2020-07-21 23:27:58'),(457,61,15,'Medical and Surgical Instruments, Equipment, and Supplies','2020-07-21 23:27:58','2020-07-21 23:27:58'),(458,61,20,'Dental Instruments, Equipment, and Supplies','2020-07-21 23:27:58','2020-07-21 23:27:58'),(459,61,25,'Imaging Equipment and Supplies: Medical, Dental, Veterinary','2020-07-21 23:27:58','2020-07-21 23:27:58'),(460,61,30,'Hospital Furniture, Equipment, Utensils, and Supplies','2020-07-21 23:27:58','2020-07-21 23:27:58'),(461,61,32,'Hospital and Surgical Clothing and Related Special Purpose Items','2020-07-21 23:27:58','2020-07-21 23:27:58'),(462,61,40,'Ophthalmic Instruments, Equipment, and Supplies','2020-07-21 23:27:58','2020-07-21 23:27:58'),(463,61,45,'Replenishable Field Medical Sets, Kits, and Outfits','2020-07-21 23:27:58','2020-07-21 23:27:58'),(464,61,50,'In Vitro Diagnostic Substances, Reagents, Test Kits and Sets','2020-07-21 23:27:58','2020-07-21 23:27:58'),(465,62,5,'Navigational Instruments','2020-07-21 23:29:57','2020-07-21 23:29:57'),(466,62,10,'Flight Instruments','2020-07-21 23:29:57','2020-07-21 23:29:57'),(467,62,15,'Automatic Pilot Mechanisms and Airborne Gyro Components','2020-07-21 23:29:57','2020-07-21 23:29:57'),(468,62,20,'Engine Instruments','2020-07-21 23:29:57','2020-07-21 23:29:57'),(469,62,25,'Electrical and Electronic Properties Measuring and Testing Instruments','2020-07-21 23:29:57','2020-07-21 23:29:57'),(470,62,30,'Chemical Analysis Instruments','2020-07-21 23:29:57','2020-07-21 23:29:57'),(471,62,35,'Physical Properties Testing and Inspection','2020-07-21 23:29:57','2020-07-21 23:29:57'),(472,62,36,'Environmental Chambers and Related Equipment','2020-07-21 23:29:57','2020-07-21 23:29:57'),(473,62,40,' Laboratory Equipment and Supplies','2020-07-21 23:29:57','2020-07-21 23:29:57'),(474,62,45,'Time Measuring Instruments','2020-07-21 23:29:57','2020-07-21 23:29:57'),(475,62,50,'Optical Instruments, Test Equipment, Components and Accessories','2020-07-21 23:29:57','2020-07-21 23:29:57'),(476,62,55,'Geophysical Instruments','2020-07-21 23:29:57','2020-07-21 23:29:57'),(477,62,60,'Meteorological Instruments and Apparatus','2020-07-21 23:29:57','2020-07-21 23:29:57'),(478,62,65,'Hazard-Detecting Instruments and Apparatus','2020-07-21 23:29:57','2020-07-21 23:29:57'),(479,62,70,'Scales and Balances','2020-07-21 23:29:57','2020-07-21 23:29:57'),(480,62,75,'Drafting, Surveying, and Mapping Instruments','2020-07-21 23:29:57','2020-07-21 23:29:57'),(481,62,80,'Liquid and Gas Flow, Liquid Level, and Mechanical Motion Measuring Instruments','2020-07-21 23:29:57','2020-07-21 23:29:57'),(482,62,85,'Pressure, Temperature, and Humidity Measuring and Controlling Instruments','2020-07-21 23:29:57','2020-07-21 23:29:57'),(483,62,95,' Combination and Miscellaneous Instruments','2020-07-21 23:29:57','2020-07-21 23:29:57'),(484,63,10,'Cameras, Motion Picture','2020-07-21 23:30:47','2020-07-21 23:30:47'),(485,63,20,'Cameras, Still Picture','2020-07-21 23:30:47','2020-07-21 23:30:47'),(486,63,30,'Photographic Projection Equipment','2020-07-21 23:30:47','2020-07-21 23:30:47'),(487,63,40,'Photographic Developing and Finishing Equipment','2020-07-21 23:30:47','2020-07-21 23:30:47'),(488,63,50,'Photographic Supplies','2020-07-21 23:30:47','2020-07-21 23:30:47'),(489,63,60,'Photographic Equipment and Accessories','2020-07-21 23:30:47','2020-07-21 23:30:47'),(490,63,70,'Film, Processed','2020-07-21 23:30:47','2020-07-21 23:30:47'),(491,63,80,'Photographic Sets, Kits, and Outfits','2020-07-21 23:30:47','2020-07-21 23:30:47'),(492,64,10,'Chemicals','2020-07-21 23:31:17','2020-07-21 23:31:17'),(493,64,20,'Dyes','2020-07-21 23:31:17','2020-07-21 23:31:17'),(494,64,30,'Gases: Compressed and Liquefied','2020-07-21 23:31:17','2020-07-21 23:31:17'),(495,64,40,'Pest Control Agents and Disinfectants','2020-07-21 23:31:17','2020-07-21 23:31:17'),(496,64,50,'Miscellaneous Chemical Specialties','2020-07-21 23:31:17','2020-07-21 23:31:17'),(497,65,10,'Training Aids','2020-07-21 23:31:50','2020-07-21 23:31:50'),(498,65,20,'Armament Training Devices','2020-07-21 23:31:50','2020-07-21 23:31:50'),(499,65,30,'Operation Training Devices','2020-07-21 23:31:50','2020-07-21 23:31:50'),(500,65,40,'Communication Training Devices','2020-07-21 23:31:50','2020-07-21 23:31:50'),(501,66,10,'ADPE System Configuration','2020-07-21 23:33:16','2020-07-21 23:33:16'),(502,66,20,'ADP Central Processing Unit (CPU, Computer), Analog','2020-07-21 23:33:16','2020-07-21 23:33:16'),(503,66,21,'ADP Central Processing Unit (CPU, Computer), Digital','2020-07-21 23:33:16','2020-07-21 23:33:16'),(504,66,22,'ADP Central Processing Unit (CPU, Computer), Hybrid','2020-07-21 23:33:16','2020-07-21 23:33:16'),(505,66,25,'ADP Input/ Output and Storage Devices','2020-07-21 23:33:16','2020-07-21 23:33:16'),(506,66,30,'ADP Software','2020-07-21 23:33:16','2020-07-21 23:33:16'),(507,66,35,'ADP Support Equipment','2020-07-21 23:33:16','2020-07-21 23:33:16'),(508,66,40,'Punched Card Equipment','2020-07-21 23:33:16','2020-07-21 23:33:16'),(509,66,42,'Mini and Micro Computer Control Devices','2020-07-21 23:33:16','2020-07-21 23:33:16'),(510,66,45,'ADP Supplies','2020-07-21 23:33:16','2020-07-21 23:33:16'),(511,66,50,'ADP Components','2020-07-21 23:33:16','2020-07-21 23:33:16'),(512,67,5,'Household Furniture','2020-07-21 23:33:49','2020-07-21 23:33:49'),(513,67,10,'Office Furniture','2020-07-21 23:33:49','2020-07-21 23:33:49'),(514,67,25,'Cabinets, Lockers, Bins, and Shelving','2020-07-21 23:33:49','2020-07-21 23:33:49'),(515,67,95,'Miscellaneous Furniture and Fixtures','2020-07-21 23:33:49','2020-07-21 23:33:49'),(516,68,10,'Household Furnishings','2020-07-21 23:34:38','2020-07-21 23:34:38'),(517,68,20,'Floor Coverings','2020-07-21 23:34:38','2020-07-21 23:34:38'),(518,68,30,'Draperies, Awnings, and Shades','2020-07-21 23:34:38','2020-07-21 23:34:38'),(519,68,40,'Household and Commercial Utility Containers','2020-07-21 23:34:38','2020-07-21 23:34:38'),(520,68,90,'Miscellaneous Household and Commercial Furnishings and Appliances','2020-07-21 23:34:38','2020-07-21 23:34:38'),(521,69,10,'Food Cooking, Baking, and Serving Equipment','2020-07-21 23:35:17','2020-07-21 23:35:17'),(522,69,20,'Kitchen Equipment and Appliances','2020-07-21 23:35:17','2020-07-21 23:35:17'),(523,69,30,'Kitchen Hand Tools and Utensils','2020-07-21 23:35:17','2020-07-21 23:35:17'),(524,69,40,'Cutlery and Flatware','2020-07-21 23:35:17','2020-07-21 23:35:17'),(525,69,50,'Tableware','2020-07-21 23:35:17','2020-07-21 23:35:17'),(526,69,60,'Sets, Kits, Outfits and Modules, Food Preparation and Serving','2020-07-21 23:35:17','2020-07-21 23:35:17'),(527,70,20,'Accounting and Calculating Machines','2020-07-21 23:36:05','2020-07-21 23:36:05'),(528,70,30,'Typewriters and Office Type Composing Machines','2020-07-21 23:36:05','2020-07-21 23:36:05'),(529,70,35,'Office Information System Equipment','2020-07-21 23:36:05','2020-07-21 23:36:05'),(530,70,50,'Office Type Sound Recording and Reproducing Machines','2020-07-21 23:36:05','2020-07-21 23:36:05'),(531,70,60,'Visible Record Equipment','2020-07-21 23:36:05','2020-07-21 23:36:05'),(532,70,90,'Miscellaneous Office Machines','2020-07-21 23:36:05','2020-07-21 23:36:05'),(533,71,10,'Office Supplies','2020-07-21 23:36:44','2020-07-21 23:36:44'),(534,71,20,'Office Devices and Accessories','2020-07-21 23:36:44','2020-07-21 23:36:44'),(535,71,30,'Stationery and Record Forms','2020-07-21 23:36:44','2020-07-21 23:36:44'),(536,71,40,'Standard Forms','2020-07-21 23:36:44','2020-07-21 23:36:44'),(537,72,10,'Books and Pamphlets','2020-07-21 23:37:52','2020-07-21 23:37:52'),(538,72,30,'Newspapers and Periodicals','2020-07-21 23:37:52','2020-07-21 23:37:52'),(539,72,40,'Maps, Atlases, Charts, and Globes','2020-07-21 23:37:52','2020-07-21 23:37:52'),(540,72,41,'Aeronautical Maps, Charts and Geodetic Products','2020-07-21 23:37:52','2020-07-21 23:37:52'),(541,72,42,'Hydrographic Maps, Charts and Geodetic Products','2020-07-21 23:37:52','2020-07-21 23:37:52'),(542,72,43,'Topographic Maps, Charts and Geodetic Products','2020-07-21 23:37:52','2020-07-21 23:37:52'),(543,72,44,'Digital Maps, Charts and Geodetic Products','2020-07-21 23:37:52','2020-07-21 23:37:52'),(544,72,50,'Drawings and Specifications','2020-07-21 23:37:52','2020-07-21 23:37:52'),(545,72,60,'Sheet and Book Music','2020-07-21 23:37:52','2020-07-21 23:37:52'),(546,72,70,'Microfilm, Processed','2020-07-21 23:37:52','2020-07-21 23:37:52'),(547,72,90,'Miscellaneous Printed Matter','2020-07-21 23:37:52','2020-07-21 23:37:52'),(548,73,10,'Musical Instruments','2020-07-21 23:38:29','2020-07-21 23:38:29'),(549,73,20,'Musical Instrument Parts and Accessories','2020-07-21 23:38:29','2020-07-21 23:38:29'),(550,73,30,'Phonographs, Radios, and Television Sets: Home Type','2020-07-21 23:38:29','2020-07-21 23:38:29'),(551,73,35,'Parts and Accessories of Phonographs, Radios, and Television Set: Home Type','2020-07-21 23:38:29','2020-07-21 23:38:29'),(552,73,40,'Phonograph Records','2020-07-21 23:38:29','2020-07-21 23:38:29'),(553,74,10,'Athletic and Sporting Equipment','2020-07-21 23:38:52','2020-07-21 23:38:52'),(554,74,20,'Games, Toys, and Wheeled Goods','2020-07-21 23:38:52','2020-07-21 23:38:52'),(555,74,30,'Recreational and Gymnastic Equipment','2020-07-21 23:38:52','2020-07-21 23:38:52'),(556,75,10,'Floor Polishers and Vacuum Cleaning Equipment','2020-07-21 23:39:13','2020-07-21 23:39:13'),(557,75,20,'Brooms, Brushes, Mops, and Sponges','2020-07-21 23:39:13','2020-07-21 23:39:13'),(558,75,30,'Cleaning and Polishing Compounds and Preparations','2020-07-21 23:39:13','2020-07-21 23:39:13'),(559,76,10,'Paint','2020-07-21 23:40:01','2020-07-21 23:40:01'),(560,76,20,'Paint and Artists\' Brushes','2020-07-21 23:40:01','2020-07-21 23:40:01'),(561,76,30,'Preservative and Sealing Compounds','2020-07-21 23:40:01','2020-07-21 23:40:01'),(562,76,40,'Adhesives','2020-07-21 23:40:01','2020-07-21 23:40:01'),(563,77,5,'Bags and Sacks','2020-07-21 23:41:00','2020-07-21 23:41:00'),(564,77,10,'Drums and Cans','2020-07-21 23:41:00','2020-07-21 23:41:00'),(565,77,15,'Boxes, Cartons, and Crates','2020-07-21 23:41:00','2020-07-21 23:41:00'),(566,77,20,'Commercial and Industrial Gas Cylinders','2020-07-21 23:41:00','2020-07-21 23:41:00'),(567,77,25,'Bottles and Jars','2020-07-21 23:41:00','2020-07-21 23:41:00'),(568,77,30,'Reels and Spools','2020-07-21 23:41:00','2020-07-21 23:41:00'),(569,77,35,'Packaging and Packing Bulk Materials','2020-07-21 23:41:00','2020-07-21 23:41:00'),(570,77,40,'Ammunition and Nuclear Ordnance Boxes, Packages and Special Containers','2020-07-21 23:41:00','2020-07-21 23:41:00'),(571,77,45,'Specialized Shipping and Storage Containers','2020-07-21 23:41:00','2020-07-21 23:41:00'),(572,77,50,'Freight Containers','2020-07-21 23:41:00','2020-07-21 23:41:00'),(573,78,5,'Textile Fabrics','2020-07-21 23:42:11','2020-07-21 23:42:11'),(574,78,10,'Yarn and Thread','2020-07-21 23:42:11','2020-07-21 23:42:11'),(575,78,15,'Notions and Apparel Findings','2020-07-21 23:42:11','2020-07-21 23:42:11'),(576,78,20,'Padding and Stuffing Materials','2020-07-21 23:42:11','2020-07-21 23:42:11'),(577,78,25,'Fur Materials','2020-07-21 23:42:11','2020-07-21 23:42:11'),(578,78,30,'Leather Materials','2020-07-21 23:42:11','2020-07-21 23:42:11'),(579,78,35,'Shoe Findings and Soling Materials','2020-07-21 23:42:11','2020-07-21 23:42:11'),(580,78,40,'Tents and Tarpaulins','2020-07-21 23:42:11','2020-07-21 23:42:11'),(581,78,45,'Flags and Pennants','2020-07-21 23:42:11','2020-07-21 23:42:11'),(582,79,5,'Outerwear, Men\'s','2020-07-21 23:43:50','2020-07-21 23:43:50'),(583,79,10,'Outerwear, Women\'s','2020-07-21 23:43:50','2020-07-21 23:43:50'),(584,79,15,'Clothing, Special Purpose','2020-07-21 23:43:50','2020-07-21 23:43:50'),(585,79,20,'Underwear and Nightwear, Men\'s','2020-07-21 23:43:50','2020-07-21 23:43:50'),(586,79,25,'Underwear and Nightwear, Women\'s','2020-07-21 23:43:50','2020-07-21 23:43:50'),(587,79,30,'Footwear, Men\'s','2020-07-21 23:43:50','2020-07-21 23:43:50'),(588,79,35,'Footwear, Women\'s','2020-07-21 23:43:50','2020-07-21 23:43:50'),(589,79,40,'Hosiery, Handwear, and Clothing Accessories, Men\'s','2020-07-21 23:43:50','2020-07-21 23:43:50'),(590,79,45,'Hosiery, Handwear, and Clothing Accessories, Women\'s','2020-07-21 23:43:50','2020-07-21 23:43:50'),(591,79,50,'Children\'s and Infants\' Apparel and Accessories','2020-07-21 23:43:50','2020-07-21 23:43:50'),(592,79,55,'Badges and Insignia','2020-07-21 23:43:50','2020-07-21 23:43:50'),(593,79,60,'Luggage','2020-07-21 23:43:50','2020-07-21 23:43:50'),(594,79,65,'Individual Equipment','2020-07-21 23:43:50','2020-07-21 23:43:50'),(595,79,70,'Armor, Personal','2020-07-21 23:43:50','2020-07-21 23:43:50'),(596,79,75,'Specialized Flight Clothing and Accessories','2020-07-21 23:43:50','2020-07-21 23:43:50'),(597,80,10,'Perfumes, Toilet Preparations, and Powders','2020-07-21 23:44:27','2020-07-21 23:44:27'),(598,80,20,'Toilet Soap, Shaving Preparations, and Dentifrices','2020-07-21 23:44:27','2020-07-21 23:44:27'),(599,80,30,'Personal Toiletry Articles','2020-07-21 23:44:27','2020-07-21 23:44:27'),(600,80,40,'Toiletry Paper Products','2020-07-21 23:44:27','2020-07-21 23:44:27'),(601,81,10,'Forage and Feed','2020-07-21 23:45:36','2020-07-21 23:45:36'),(602,81,20,'Fertilizers','2020-07-21 23:45:36','2020-07-21 23:45:36'),(603,81,30,'Seeds and Nursery Stock','2020-07-21 23:45:36','2020-07-21 23:45:36'),(604,82,10,'Live Animals, Raised for Food','2020-07-21 23:45:36','2020-07-21 23:45:36'),(605,82,20,'Live Animals, Not Raised for Food','2020-07-21 23:45:36','2020-07-21 23:45:36'),(606,83,5,'Meat, Poultry, and Fish','2020-07-21 23:47:10','2020-07-21 23:47:10'),(607,83,10,'Dairy Foods and Eggs','2020-07-21 23:47:10','2020-07-21 23:47:10'),(608,83,15,'Fruits and Vegetables','2020-07-21 23:47:10','2020-07-21 23:47:10'),(609,83,20,'Bakery and Cereal Products','2020-07-21 23:47:10','2020-07-21 23:47:10'),(610,83,25,'Sugar, Confectionery, and Nuts','2020-07-21 23:47:10','2020-07-21 23:47:10'),(611,83,30,'Jams, Jellies, and Preserves','2020-07-21 23:47:10','2020-07-21 23:47:10'),(612,83,35,'Soups and Bouillons','2020-07-21 23:47:10','2020-07-21 23:47:10'),(613,83,40,'Special Dietary Foods and Food Specialty Preparations','2020-07-21 23:47:10','2020-07-21 23:47:10'),(614,83,45,'Food, Oils and Fats','2020-07-21 23:47:10','2020-07-21 23:47:10'),(615,83,50,'Condiments and Related Products','2020-07-21 23:47:10','2020-07-21 23:47:10'),(616,83,55,'Coffee, Tea, and Cocoa','2020-07-21 23:47:10','2020-07-21 23:47:10'),(617,83,60,'Beverages, Nonalcoholic','2020-07-21 23:47:10','2020-07-21 23:47:10'),(618,83,65,'Beverages, Alcoholic','2020-07-21 23:47:10','2020-07-21 23:47:10'),(619,83,70,'Composite Food Packages','2020-07-21 23:47:10','2020-07-21 23:47:10'),(620,83,75,'Tobacco Products','2020-07-21 23:47:10','2020-07-21 23:47:10'),(621,84,10,'Fuels, Solid','2020-07-21 23:47:57','2020-07-21 23:47:57'),(622,84,30,'Liquid Propellants and Fuels, Petroleum Base','2020-07-21 23:47:57','2020-07-21 23:47:57'),(623,84,35,'Liquid Propellant Fuels and Oxidizers, Chemical Base','2020-07-21 23:47:57','2020-07-21 23:47:57'),(624,84,40,'Fuel Oils','2020-07-21 23:47:57','2020-07-21 23:47:57'),(625,84,50,'Oils and Greases: Cutting, Lubricating, and Hydraulic','2020-07-21 23:47:57','2020-07-21 23:47:57'),(626,84,60,'Miscellaneous Waxes, Oils, and Fats','2020-07-21 23:47:57','2020-07-21 23:47:57'),(627,85,10,'Paper and Paperboard','2020-07-21 23:48:42','2020-07-21 23:48:42'),(628,85,20,'Rubber Fabricated Materials','2020-07-21 23:48:42','2020-07-21 23:48:42'),(629,85,30,'Plastics Fabricated Materials','2020-07-21 23:48:42','2020-07-21 23:48:42'),(630,85,40,'Glass Fabricated Materials','2020-07-21 23:48:42','2020-07-21 23:48:42'),(631,85,50,'Refractories and Fire Surfacing Materials','2020-07-21 23:48:42','2020-07-21 23:48:42'),(632,85,90,'Miscellaneous Fabricated Nonmetallic Materials','2020-07-21 23:48:42','2020-07-21 23:48:42'),(633,86,10,'Crude Grades of Plant Materials','2020-07-21 23:49:21','2020-07-21 23:49:21'),(634,86,20,'Fibers: Vegetable, Animal, and Synthetic','2020-07-21 23:49:21','2020-07-21 23:49:21'),(635,86,30,'Miscellaneous Crude Animal Products, Inedible','2020-07-21 23:49:21','2020-07-21 23:49:21'),(636,86,40,'Miscellaneous Crude Agricultural and Forestry Products','2020-07-21 23:49:21','2020-07-21 23:49:21'),(637,86,50,'Nonmetallic Scrap, Except Textile','2020-07-21 23:49:21','2020-07-21 23:49:21'),(638,87,5,'Nonelectrical Wires','2020-07-21 23:50:14','2020-07-21 23:50:14'),(639,87,10,'Bars and Rods','2020-07-21 23:50:14','2020-07-21 23:50:14'),(640,87,15,'Plate, Sheet, Strip, Foil, and Leaf','2020-07-21 23:50:14','2020-07-21 23:50:14'),(641,87,20,'Structural Shapes','2020-07-21 23:50:14','2020-07-21 23:50:14'),(642,87,25,'Wire, Nonelectrical, Nonferrous Base Metal','2020-07-21 23:50:14','2020-07-21 23:50:14'),(643,87,30,'Bars and Rods, Nonferrous Base Metal','2020-07-21 23:50:14','2020-07-21 23:50:14'),(644,87,35,'Plate, Sheet, Strip, and Foil; Nonferrous Base Metal','2020-07-21 23:50:14','2020-07-21 23:50:14'),(645,87,40,'Structural Shapes, Nonferrous Base Metal','2020-07-21 23:50:14','2020-07-21 23:50:14'),(646,87,45,'Plate, Sheet, Strip, Foil, and Wire: Precious Metal','2020-07-21 23:50:14','2020-07-21 23:50:14'),(647,88,10,'Ores','2020-07-21 23:51:01','2020-07-21 23:51:01'),(648,88,20,'Minerals, Natural and Synthetic','2020-07-21 23:51:01','2020-07-21 23:51:01'),(649,88,30,'Additive Metal Materials','2020-07-21 23:51:01','2020-07-21 23:51:01'),(650,88,40,'Iron and Steel Primary and Semi-finished Products','2020-07-21 23:51:01','2020-07-21 23:51:01'),(651,88,50,'Nonferrous Base Metal Refinery and Intermediate Forms','2020-07-21 23:51:01','2020-07-21 23:51:01'),(652,88,60,'Precious Metals Primary Forms','2020-07-21 23:51:01','2020-07-21 23:51:01'),(653,88,70,'Iron and Steel Scrap','2020-07-21 23:51:01','2020-07-21 23:51:01'),(654,88,80,'Nonferrous Scrap','2020-07-21 23:51:01','2020-07-21 23:51:01'),(655,89,5,'Signs, Advertising Displays, and Identification Plates','2020-07-21 23:51:50','2020-07-21 23:51:50'),(656,89,10,'Jewelry','2020-07-21 23:51:50','2020-07-21 23:51:50'),(657,89,15,'Collectors\' and/or Historical Items','2020-07-21 23:51:50','2020-07-21 23:51:50'),(658,89,20,'Smokers\' Articles and Matches','2020-07-21 23:51:50','2020-07-21 23:51:50'),(659,89,25,'Ecclesiastical Equipment, Furnishings, and Supplies','2020-07-21 23:51:50','2020-07-21 23:51:50'),(660,89,30,'Memorials; Cemetery and Mortuary Equipment and Supplies','2020-07-21 23:51:50','2020-07-21 23:51:50'),(661,89,99,'Miscellaneous Items','2020-07-21 23:51:50','2020-07-21 23:51:50'),(662,90,0,'Not Specified','2020-07-22 21:04:02','2020-07-22 21:04:02');
/*!40000 ALTER TABLE `nsn_classifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nsn_countries`
--

DROP TABLE IF EXISTS `nsn_countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nsn_countries` (
  `nsn_country_id` int(11) NOT NULL,
  `_code` int(2) NOT NULL,
  `_country` varchar(45) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`nsn_country_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nsn_countries`
--

LOCK TABLES `nsn_countries` WRITE;
/*!40000 ALTER TABLE `nsn_countries` DISABLE KEYS */;
INSERT INTO `nsn_countries` VALUES (1,0,'USA','2020-07-20 23:06:37','2020-07-20 23:06:37'),(2,1,'USA','2020-07-20 23:06:37','2020-07-20 23:06:37'),(3,2,'USA','2020-07-20 23:06:37','2020-07-20 23:06:37'),(4,3,'USA','2020-07-20 23:06:37','2020-07-20 23:06:37'),(5,4,'USA','2020-07-20 23:06:37','2020-07-20 23:06:37'),(6,5,'USA','2020-07-20 23:06:37','2020-07-20 23:06:37'),(7,6,'USA','2020-07-20 23:06:37','2020-07-20 23:06:37'),(8,7,'USA','2020-07-20 23:06:37','2020-07-20 23:06:37'),(9,8,'USA','2020-07-20 23:06:37','2020-07-20 23:06:37'),(10,9,'USA','2020-07-20 23:06:37','2020-07-20 23:06:37'),(11,10,'USA','2020-07-20 23:06:37','2020-07-20 23:06:37'),(12,11,'NATO','2020-07-20 23:06:37','2020-07-20 23:06:37'),(13,12,'Germany','2020-07-20 23:06:37','2020-07-20 23:06:37'),(14,13,'Belgium','2020-07-20 23:06:37','2020-07-20 23:06:37'),(15,14,'France','2020-07-20 23:06:37','2020-07-20 23:06:37'),(16,15,'Italy','2020-07-20 23:06:37','2020-07-20 23:06:37'),(17,16,'Czech Republic','2020-07-20 23:06:37','2020-07-20 23:06:37'),(18,17,'Netherlands','2020-07-20 23:06:37','2020-07-20 23:06:37'),(19,18,'South Africa','2020-07-20 23:06:37','2020-07-20 23:06:37'),(20,19,'Brazil','2020-07-20 23:06:37','2020-07-20 23:06:37'),(21,20,'Canada','2020-07-20 23:06:37','2020-07-20 23:06:37'),(22,21,'Canada','2020-07-20 23:06:37','2020-07-20 23:06:37'),(23,22,'Denmark','2020-07-20 23:06:37','2020-07-20 23:06:37'),(24,23,'Greece','2020-07-20 23:06:37','2020-07-20 23:06:37'),(25,24,'Iceland','2020-07-20 23:06:37','2020-07-20 23:06:37'),(26,25,'Norway','2020-07-20 23:06:37','2020-07-20 23:06:37'),(27,26,'Portugal','2020-07-20 23:06:37','2020-07-20 23:06:37'),(28,27,'Turkey','2020-07-20 23:06:37','2020-07-20 23:06:37'),(29,28,'Luxembourg','2020-07-20 23:06:37','2020-07-20 23:06:37'),(30,29,'Argentina','2020-07-20 23:06:37','2020-07-20 23:06:37'),(31,30,'Japan','2020-07-20 23:06:37','2020-07-20 23:06:37'),(32,31,'Israel','2020-07-20 23:06:37','2020-07-20 23:06:37'),(33,32,'Singapore','2020-07-20 23:06:37','2020-07-20 23:06:37'),(34,33,'Spain','2020-07-20 23:06:37','2020-07-20 23:06:37'),(35,34,'Malaysia','2020-07-20 23:06:37','2020-07-20 23:06:37'),(36,35,'Thailand','2020-07-20 23:06:37','2020-07-20 23:06:37'),(37,36,'Egypt','2020-07-20 23:06:37','2020-07-20 23:06:37'),(38,37,'Republic of Korea','2020-07-20 23:06:37','2020-07-20 23:06:37'),(39,38,'Estonia','2020-07-20 23:06:37','2020-07-20 23:06:37'),(40,39,'Romania','2020-07-20 23:06:37','2020-07-20 23:06:37'),(41,40,'Slovakia','2020-07-20 23:06:37','2020-07-20 23:06:37'),(42,41,'Austria','2020-07-20 23:06:37','2020-07-20 23:06:37'),(43,42,'Slovenia','2020-07-20 23:06:37','2020-07-20 23:06:37'),(44,43,'Poland','2020-07-20 23:06:37','2020-07-20 23:06:37'),(45,44,'UN','2020-07-20 23:06:37','2020-07-20 23:06:37'),(46,45,'Indonesia','2020-07-20 23:06:37','2020-07-20 23:06:37'),(47,46,'Phillipines','2020-07-20 23:06:37','2020-07-20 23:06:37'),(48,47,'Lithuania','2020-07-20 23:06:37','2020-07-20 23:06:37'),(49,48,'Fiji','2020-07-20 23:06:37','2020-07-20 23:06:37'),(50,49,'Tonga','2020-07-20 23:06:37','2020-07-20 23:06:37'),(51,50,'Bulgaria','2020-07-20 23:06:37','2020-07-20 23:06:37'),(52,51,'Hungary','2020-07-20 23:06:37','2020-07-20 23:06:37'),(53,52,'Chile','2020-07-20 23:06:37','2020-07-20 23:06:37'),(54,53,'Croatia','2020-07-20 23:06:37','2020-07-20 23:06:37'),(55,54,'Republic of North Macedonia','2020-07-20 23:06:37','2020-07-20 23:06:37'),(56,55,'Latvia','2020-07-20 23:06:37','2020-07-20 23:06:37'),(57,56,'Oman','2020-07-20 23:06:37','2020-07-20 23:06:37'),(58,57,'Russian Federation','2020-07-20 23:06:37','2020-07-20 23:06:37'),(59,58,'Finland','2020-07-20 23:06:37','2020-07-20 23:06:37'),(60,59,'Albania','2020-07-20 23:06:37','2020-07-20 23:06:37'),(61,60,'Kuwait','2020-07-20 23:06:37','2020-07-20 23:06:37'),(62,61,'Ukraine','2020-07-20 23:06:37','2020-07-20 23:06:37'),(63,62,'Belarus','2020-07-20 23:06:37','2020-07-20 23:06:37'),(64,63,'Morocco','2020-07-20 23:06:37','2020-07-20 23:06:37'),(65,64,'Sweden','2020-07-20 23:06:37','2020-07-20 23:06:37'),(66,65,'Papua, New Guinea','2020-07-20 23:06:37','2020-07-20 23:06:37'),(67,66,'Australia','2020-07-20 23:06:37','2020-07-20 23:06:37'),(68,67,'Afghanistan','2020-07-20 23:06:37','2020-07-20 23:06:37'),(69,68,'Georgia','2020-07-20 23:06:37','2020-07-20 23:06:37'),(70,70,'Saudi Arabia','2020-07-20 23:06:37','2020-07-20 23:06:37'),(71,71,'UAE','2020-07-20 23:06:37','2020-07-20 23:06:37'),(72,72,'India','2020-07-20 23:06:37','2020-07-20 23:06:37'),(73,73,'Serbia','2020-07-20 23:06:37','2020-07-20 23:06:37'),(74,74,'Pakistan','2020-07-20 23:06:37','2020-07-20 23:06:37'),(75,75,'Bosnia-Herzegovina','2020-07-20 23:06:37','2020-07-20 23:06:37'),(76,76,'Brunei Darusslam','2020-07-20 23:06:37','2020-07-20 23:06:37'),(77,77,'Montenegro','2020-07-20 23:06:37','2020-07-20 23:06:37'),(78,78,'Jordan','2020-07-20 23:06:37','2020-07-20 23:06:37'),(79,79,'Peru','2020-07-20 23:06:37','2020-07-20 23:06:37'),(80,80,'Colombia','2020-07-20 23:06:37','2020-07-20 23:06:37'),(81,98,'New Zealand','2020-07-20 23:06:37','2020-07-20 23:06:37'),(82,99,'UK','2020-07-20 23:06:37','2020-07-20 23:06:37'),(83,0,'Not Specified','2020-07-22 21:03:05','2020-07-22 21:03:05');
/*!40000 ALTER TABLE `nsn_countries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nsn_groups`
--

DROP TABLE IF EXISTS `nsn_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nsn_groups` (
  `nsn_group_id` int(11) NOT NULL AUTO_INCREMENT,
  `_code` int(2) NOT NULL,
  `_group` varchar(100) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`nsn_group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nsn_groups`
--

LOCK TABLES `nsn_groups` WRITE;
/*!40000 ALTER TABLE `nsn_groups` DISABLE KEYS */;
INSERT INTO `nsn_groups` VALUES (11,10,'Weapons','2020-07-20 23:26:16','2020-07-20 23:26:16'),(12,11,'Nuclear Ordnance','2020-07-20 23:26:16','2020-07-20 23:26:16'),(13,12,'Fire Control Equipment','2020-07-20 23:26:16','2020-07-20 23:26:16'),(14,13,'Ammuinition and Explosives','2020-07-20 23:26:16','2020-07-20 23:26:16'),(15,14,'Guided Missiles','2020-07-20 23:26:16','2020-07-20 23:26:16'),(16,15,'Aircraft and Airframe Structural Components','2020-07-20 23:26:16','2020-07-20 23:26:16'),(17,16,'Aircraft Components and Accessories','2020-07-20 23:26:16','2020-07-20 23:26:16'),(18,17,'Aircraft Launching, Landing, and Ground Handling Equipment','2020-07-20 23:26:16','2020-07-20 23:26:16'),(19,18,'Space Vehicles','2020-07-20 23:26:16','2020-07-20 23:26:16'),(20,19,'Ships, Small Craft, Pontoons, and Floating Docks','2020-07-20 23:26:16','2020-07-20 23:26:16'),(21,20,'Ship and Marine Equipment','2020-07-20 23:26:16','2020-07-20 23:26:16'),(22,22,'Railway Equipment','2020-07-20 23:26:16','2020-07-20 23:26:16'),(23,23,'Ground Effect Vehicles, Motor Vehicles, Trailers, and Cycles','2020-07-20 23:26:16','2020-07-20 23:26:16'),(24,24,'Tractors','2020-07-20 23:26:16','2020-07-20 23:26:16'),(25,25,'Vehicular Equipment Components','2020-07-20 23:26:16','2020-07-20 23:26:16'),(26,26,'Tyres and Tubes','2020-07-20 23:26:16','2020-07-20 23:26:16'),(27,28,'Engines, Turbines, and Components','2020-07-20 23:26:16','2020-07-20 23:26:16'),(28,29,'Engine Accessories','2020-07-20 23:26:16','2020-07-20 23:26:16'),(29,30,'Mechanical Power Transmission Equipment','2020-07-20 23:26:16','2020-07-20 23:26:16'),(30,31,'Bearings','2020-07-20 23:26:16','2020-07-20 23:26:16'),(31,32,'Woodworking Machinery and Equipment','2020-07-20 23:26:16','2020-07-20 23:26:16'),(32,33,'Historical FSG (used for file maintenance purposes only)','2020-07-20 23:26:16','2020-07-20 23:26:16'),(33,34,'Metalworking Machinery','2020-07-20 23:26:16','2020-07-20 23:26:16'),(34,35,'Service and Trade Equipment','2020-07-20 23:26:16','2020-07-20 23:26:16'),(35,36,'Special Industry Machinery','2020-07-20 23:26:16','2020-07-20 23:26:16'),(36,37,'Agricultural Machinery and Equipment','2020-07-20 23:26:16','2020-07-20 23:26:16'),(37,38,'Construction, Mining, Excavating, and Highway Maintenance Equipment','2020-07-20 23:26:16','2020-07-20 23:26:16'),(38,39,'Materials Handling Equipment','2020-07-20 23:26:16','2020-07-20 23:26:16'),(39,40,'Rope, Cable, Chain, and Fittings','2020-07-20 23:26:16','2020-07-20 23:26:16'),(40,41,'Refrigeration, Air Conditioning, and Air Circulating Equipment','2020-07-20 23:26:16','2020-07-20 23:26:16'),(41,42,'Fire Fighting, Rescue, and Safety Equipment; and Environmental Protection Equipment and Materials','2020-07-20 23:26:16','2020-07-20 23:26:16'),(42,43,'Pumps and Compressors','2020-07-20 23:26:16','2020-07-20 23:26:16'),(43,44,'Furnace, Steam Plant, and Drying Equipment; and Nuclear Reactors','2020-07-20 23:26:16','2020-07-20 23:26:16'),(44,45,'Plumbing, Heating, and Waste Disposal Equipment','2020-07-20 23:26:16','2020-07-20 23:26:16'),(45,46,'Water Purification and Sewage Treatment Equipment','2020-07-20 23:26:16','2020-07-20 23:26:16'),(46,47,'Pipe, Tubing, Hose, and Fittings','2020-07-20 23:26:16','2020-07-20 23:26:16'),(47,48,'Valves','2020-07-20 23:26:17','2020-07-20 23:26:17'),(48,49,'Maintenance and Repair Shop Equipment','2020-07-20 23:26:17','2020-07-20 23:26:17'),(49,51,'Hand Tools','2020-07-20 23:26:17','2020-07-20 23:26:17'),(50,52,'Measuring Tools','2020-07-20 23:26:17','2020-07-20 23:26:17'),(51,53,'Hardware and Abrasives','2020-07-20 23:26:17','2020-07-20 23:26:17'),(52,54,'Prefabricated Structures and Scaffolding','2020-07-20 23:26:17','2020-07-20 23:26:17'),(53,55,'Lumber, Millwork, Plywood, and Veneer','2020-07-20 23:26:17','2020-07-20 23:26:17'),(54,56,'Construction and Building Materials','2020-07-20 23:26:17','2020-07-20 23:26:17'),(55,58,'Communication, Detection, and Coherent Radiation Equipment','2020-07-20 23:26:17','2020-07-20 23:26:17'),(56,59,'Electrical and Electronic Equipment Components','2020-07-20 23:26:17','2020-07-20 23:26:17'),(57,60,'Fiber Optics Materials, Components, Assemblies, and Accessories','2020-07-20 23:26:17','2020-07-20 23:26:17'),(58,61,'Electric Wire, and Power and Distribution Equipment','2020-07-20 23:26:17','2020-07-20 23:26:17'),(59,62,'Lighting Fixtures and Lamps','2020-07-20 23:26:17','2020-07-20 23:26:17'),(60,63,'Alarm, Signal and Security Detection Systems','2020-07-20 23:26:17','2020-07-20 23:26:17'),(61,65,'Medical, Dental, and Veterinary Equipment and Supplies','2020-07-20 23:26:17','2020-07-20 23:26:17'),(62,66,'Instruments and Laboratory Equipment','2020-07-20 23:26:17','2020-07-20 23:26:17'),(63,67,'Photographic Equipment','2020-07-20 23:26:17','2020-07-20 23:26:17'),(64,68,'Chemicals and Chemical Products','2020-07-20 23:26:17','2020-07-20 23:26:17'),(65,69,'Training Aids and Devices','2020-07-20 23:26:17','2020-07-20 23:26:17'),(66,70,'Automatic Data Processing Equipment (Including Firmware), Software, Supplies and Support Equipment','2020-07-20 23:26:17','2020-07-20 23:26:17'),(67,71,'Furniture','2020-07-20 23:26:17','2020-07-20 23:26:17'),(68,72,'Household and Commercial Furnishings and Appliances','2020-07-20 23:26:17','2020-07-20 23:26:17'),(69,73,'Food Preparation and Serving Equipment','2020-07-20 23:26:17','2020-07-20 23:26:17'),(70,74,'Office Machines, Text Processing Systems and Visible Record Equipment','2020-07-20 23:26:17','2020-07-20 23:26:17'),(71,75,'Office Supplies and Devices','2020-07-20 23:26:17','2020-07-20 23:26:17'),(72,76,'Books, Maps, and Other Publications','2020-07-20 23:26:17','2020-07-20 23:26:17'),(73,77,'Musical Instruments, Phonographs, and Home-Type Radios','2020-07-20 23:26:17','2020-07-20 23:26:17'),(74,78,'Recreational and Athletic Equipment','2020-07-20 23:26:17','2020-07-20 23:26:17'),(75,79,'Cleaning Equipment and Supplies','2020-07-20 23:26:17','2020-07-20 23:26:17'),(76,80,'Brushes, Paints, Sealers, and Adhesives','2020-07-20 23:26:17','2020-07-20 23:26:17'),(77,81,'Containers, Packaging, and Packing Supplies','2020-07-20 23:26:17','2020-07-20 23:26:17'),(78,83,'Textiles, Leather and Furs, Apparel and Shoe Findings, Tents, and Flags','2020-07-20 23:26:17','2020-07-20 23:26:17'),(79,84,'Clothing, Individual Equipment, and Insignia','2020-07-20 23:26:17','2020-07-20 23:26:17'),(80,85,'Toiletries','2020-07-20 23:26:17','2020-07-20 23:26:17'),(81,87,'Agricultural Supplies','2020-07-20 23:26:17','2020-07-20 23:26:17'),(82,88,'Live Animals','2020-07-20 23:26:17','2020-07-20 23:26:17'),(83,89,'Subsistence','2020-07-20 23:26:17','2020-07-20 23:26:17'),(84,91,'Fuels, Lubricants, Oils, and Waxes','2020-07-20 23:26:17','2020-07-20 23:26:17'),(85,93,'Nonmetallic Fabricated Materials','2020-07-20 23:26:17','2020-07-20 23:26:17'),(86,94,'Nonmetallic Crude Materials','2020-07-20 23:26:17','2020-07-20 23:26:17'),(87,95,'Metal Bars, Sheets, and Shapes','2020-07-20 23:26:17','2020-07-20 23:26:17'),(88,96,'Ores, Minerals, and Their Primary Products','2020-07-20 23:26:17','2020-07-20 23:26:17'),(89,99,'Miscellaneous','2020-07-20 23:26:17','2020-07-20 23:26:17'),(90,0,'Unspecified','2020-07-20 23:53:34','2020-07-20 23:53:34');
/*!40000 ALTER TABLE `nsn_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nsns`
--

DROP TABLE IF EXISTS `nsns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nsns` (
  `nsn_id` int(11) NOT NULL AUTO_INCREMENT,
  `size_id` int(11) NOT NULL,
  `nsn_group_id` int(11) NOT NULL,
  `nsn_classification_id` int(11) NOT NULL,
  `nsn_country_id` int(11) NOT NULL,
  `_item_number` varchar(8) NOT NULL,
  `_nsn` varchar(20) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`nsn_id`),
  UNIQUE KEY `stocknum_id_UNIQUE` (`nsn_id`),
  UNIQUE KEY `_nsn_UNIQUE` (`_nsn`)
) ENGINE=InnoDB AUTO_INCREMENT=315 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nsns`
--

LOCK TABLES `nsns` WRITE;
/*!40000 ALTER TABLE `nsns` DISABLE KEYS */;
INSERT INTO `nsns` VALUES (1,1,79,589,82,'1270973','8440-99-1270973','0000-00-00 00:00:00','2020-04-08 20:53:29'),(2,2,79,589,82,'4712784','8440-99-4712784','0000-00-00 00:00:00','2019-12-16 17:33:09'),(3,3,79,589,82,'1301832','8440-99-1301832','0000-00-00 00:00:00','0000-00-00 00:00:00'),(4,4,79,589,82,'2193037','8440-99-2193037','0000-00-00 00:00:00','0000-00-00 00:00:00'),(5,5,79,582,82,'1278122','8405-99-1278122','0000-00-00 00:00:00','0000-00-00 00:00:00'),(6,6,79,582,82,'1278123','8405-99-1278123','0000-00-00 00:00:00','0000-00-00 00:00:00'),(7,7,79,582,82,'1278124','8405-99-1278124','0000-00-00 00:00:00','0000-00-00 00:00:00'),(8,8,79,582,82,'1278125','8405-99-1278125','0000-00-00 00:00:00','0000-00-00 00:00:00'),(9,9,79,582,82,'1278126','8405-99-1278126','0000-00-00 00:00:00','0000-00-00 00:00:00'),(10,10,79,582,82,'1278127','8405-99-1278127','0000-00-00 00:00:00','0000-00-00 00:00:00'),(11,11,79,582,82,'1278128','8405-99-1278128','0000-00-00 00:00:00','0000-00-00 00:00:00'),(12,12,79,582,82,'1278129','8405-99-1278129','0000-00-00 00:00:00','0000-00-00 00:00:00'),(13,13,79,582,82,'1278130','8405-99-1278130','0000-00-00 00:00:00','0000-00-00 00:00:00'),(14,14,79,582,82,'1278131','8405-99-1278131','0000-00-00 00:00:00','0000-00-00 00:00:00'),(15,15,79,582,82,'1278132','8405-99-1278132','0000-00-00 00:00:00','0000-00-00 00:00:00'),(16,16,79,582,82,'1278133','8405-99-1278133','0000-00-00 00:00:00','0000-00-00 00:00:00'),(17,17,79,582,82,'1278134','8405-99-1278134','0000-00-00 00:00:00','0000-00-00 00:00:00'),(18,18,79,582,82,'1278135','8405-99-1278135','0000-00-00 00:00:00','0000-00-00 00:00:00'),(19,19,79,582,82,'1278136','8405-99-1278136','0000-00-00 00:00:00','0000-00-00 00:00:00'),(20,20,79,582,82,'7485128','8405-99-7485128','0000-00-00 00:00:00','2020-01-08 11:12:26'),(21,21,79,582,82,'7485129','8405-99-7485129','0000-00-00 00:00:00','2020-01-08 11:12:47'),(22,22,79,582,82,'7485130','8405-99-7485130','0000-00-00 00:00:00','2020-01-08 11:13:09'),(23,23,79,582,82,'7485131','8405-99-7485131','0000-00-00 00:00:00','2020-01-08 11:13:25'),(24,24,79,582,82,'7485132','8405-99-7485132','0000-00-00 00:00:00','2020-01-08 11:13:36'),(25,25,79,582,82,'7485133','8405-99-7485133','0000-00-00 00:00:00','2020-01-08 11:13:45'),(26,26,79,582,82,'7485134','8405-99-7485134','0000-00-00 00:00:00','2020-01-08 11:13:55'),(27,27,79,582,82,'7485135','8405-99-7485135','0000-00-00 00:00:00','2020-01-08 11:14:04'),(28,28,79,582,82,'7485136','8405-99-7485136','0000-00-00 00:00:00','2020-01-08 11:14:22'),(29,29,79,582,82,'7485137','8405-99-7485137','0000-00-00 00:00:00','2020-01-08 11:14:30'),(30,30,79,582,82,'7485138','8405-99-7485138','0000-00-00 00:00:00','2020-01-08 11:14:38'),(31,31,79,584,82,'9787280','8415-99-9787280','0000-00-00 00:00:00','2019-11-19 19:06:05'),(32,32,79,584,82,'9787588','8415-99-9787588','0000-00-00 00:00:00','2019-11-19 19:05:11'),(33,33,79,584,82,'9787589','8415-99-9787589','0000-00-00 00:00:00','2019-11-19 19:05:45'),(34,34,79,584,82,'9787590','8415-99-9787590','0000-00-00 00:00:00','2019-11-19 19:06:21'),(35,35,79,584,82,'9787591','8415-99-9787591','0000-00-00 00:00:00','2019-11-19 19:06:40'),(36,36,79,584,82,'9787592','8415-99-9787592','0000-00-00 00:00:00','2019-11-19 19:06:55'),(37,37,79,584,82,'9787593','8415-99-9787593','0000-00-00 00:00:00','2019-11-19 19:07:28'),(38,38,79,584,82,'9787594','8415-99-9787594','0000-00-00 00:00:00','2019-11-19 19:07:51'),(39,39,79,582,82,'1301160','8405-99-1301160','0000-00-00 00:00:00','2019-12-16 15:55:18'),(40,40,79,582,82,'1301161','8405-99-1301161','0000-00-00 00:00:00','2019-12-16 15:58:34'),(41,41,79,582,82,'1301162','8405-99-1301162','0000-00-00 00:00:00','2019-12-16 15:59:26'),(42,42,79,582,82,'1301163','8405-99-1301163','0000-00-00 00:00:00','2019-12-16 15:59:46'),(43,43,79,582,82,'1301164','8405-99-1301164','0000-00-00 00:00:00','2019-12-16 16:00:05'),(44,44,79,582,82,'1301165','8405-99-1301165','0000-00-00 00:00:00','2019-12-16 16:00:25'),(45,45,79,582,82,'1301166','8405-99-1301166','0000-00-00 00:00:00','2019-12-16 16:00:42'),(46,46,79,582,82,'1301167','8405-99-1301167','0000-00-00 00:00:00','2019-12-16 16:00:59'),(47,47,79,582,82,'1301168','8405-99-1301168','0000-00-00 00:00:00','2019-12-16 16:01:20'),(48,48,79,582,82,'1301169','8405-99-1301169','0000-00-00 00:00:00','2019-12-16 16:01:40'),(49,49,79,582,82,'9785971','8405-99-9785971','0000-00-00 00:00:00','2019-11-29 01:02:04'),(50,50,79,582,82,'9785972','8405-99-9785972','0000-00-00 00:00:00','2019-11-29 01:01:50'),(51,51,79,582,82,'9785973','8405-99-9785973','0000-00-00 00:00:00','2019-11-29 01:01:36'),(52,52,79,582,82,'9785974','8405-99-9785974','0000-00-00 00:00:00','2019-11-29 01:01:19'),(53,53,79,582,82,'9785975','8405-99-9785975','0000-00-00 00:00:00','2019-11-29 01:01:01'),(54,54,79,582,82,'9785976','8405-99-9785976','0000-00-00 00:00:00','2019-11-29 01:00:44'),(55,55,79,582,82,'9785977','8405-99-9785977','0000-00-00 00:00:00','2019-11-29 01:02:22'),(56,56,79,582,82,'8696028','8405-99-8696028','0000-00-00 00:00:00','2019-11-29 00:57:26'),(57,57,79,582,82,'8696029','8405-99-8696029','0000-00-00 00:00:00','2019-11-29 00:57:11'),(58,58,79,582,82,'8696030','8405-99-8696030','0000-00-00 00:00:00','2019-11-29 00:57:55'),(59,59,79,582,82,'8696031','8405-99-8696031','0000-00-00 00:00:00','2019-11-29 00:56:55'),(60,60,79,582,82,'8696032','8405-99-8696032','0000-00-00 00:00:00','2019-11-29 00:56:39'),(61,61,79,582,82,'8696033','8405-99-8696033','0000-00-00 00:00:00','2019-11-29 00:56:22'),(62,62,79,582,82,'8696034','8405-99-8696034','0000-00-00 00:00:00','2019-11-29 00:56:05'),(63,63,79,582,82,'8696035','8405-99-8696035','0000-00-00 00:00:00','2019-11-29 00:57:39'),(64,64,79,582,82,'8696036','8405-99-8696036','0000-00-00 00:00:00','2019-11-29 00:58:09'),(65,65,79,582,82,'8696037','8405-99-8696037','0000-00-00 00:00:00','2019-11-29 00:58:26'),(66,66,79,582,82,'8696038','8405-99-8696038','0000-00-00 00:00:00','2019-11-29 00:58:46'),(67,67,79,582,82,'8696039','8405-99-8696039','0000-00-00 00:00:00','2019-11-29 00:59:00'),(68,68,79,582,82,'8696040','8405-99-8696040','0000-00-00 00:00:00','2019-11-29 00:59:14'),(69,69,79,582,82,'8696041','8405-99-8696041','0000-00-00 00:00:00','2019-11-29 00:59:31'),(70,70,79,582,82,'8696042','8405-99-8696042','0000-00-00 00:00:00','2019-11-29 00:55:44'),(71,71,79,582,82,'8696043','8405-99-8696043','0000-00-00 00:00:00','2019-11-29 00:59:44'),(72,72,79,582,82,'8696044','8405-99-8696044','0000-00-00 00:00:00','2019-11-29 01:00:00'),(73,73,79,582,82,'8696045','8405-99-8696045','0000-00-00 00:00:00','2019-11-29 01:00:15'),(74,74,79,582,82,'2691039','8405-99-2691039','0000-00-00 00:00:00','0000-00-00 00:00:00'),(75,75,79,582,82,'2691040','8405-99-2691040','0000-00-00 00:00:00','0000-00-00 00:00:00'),(76,76,79,582,82,'2691041','8405-99-2691041','0000-00-00 00:00:00','2019-11-29 00:37:47'),(77,77,79,582,82,'2691042','8405-99-2691042','0000-00-00 00:00:00','2019-11-29 00:38:05'),(78,78,79,582,82,'2691043','8405-99-2691043','0000-00-00 00:00:00','2019-11-29 00:38:27'),(79,79,79,582,82,'2691044','8405-99-2691044','0000-00-00 00:00:00','2019-11-29 00:38:54'),(80,80,79,582,82,'2691045','8405-99-2691045','0000-00-00 00:00:00','2019-11-29 00:39:10'),(81,81,79,582,82,'2691046','8405-99-2691046','0000-00-00 00:00:00','2019-11-29 00:39:35'),(82,82,79,582,82,'2691047','8405-99-2691047','0000-00-00 00:00:00','2019-11-29 00:40:12'),(83,83,79,582,82,'2691048','8405-99-2691048','0000-00-00 00:00:00','2019-11-29 00:40:33'),(84,84,79,582,82,'2691049','8405-99-2691049','0000-00-00 00:00:00','2019-11-29 00:40:52'),(85,85,79,582,82,'2691050','8405-99-2691050','0000-00-00 00:00:00','2019-11-29 00:41:12'),(86,86,79,582,82,'2691051','8405-99-2691051','0000-00-00 00:00:00','2019-11-29 00:41:29'),(87,87,79,582,82,'2691052','8405-99-2691052','0000-00-00 00:00:00','2019-11-29 00:41:55'),(88,88,79,582,82,'2691053','8405-99-2691053','0000-00-00 00:00:00','2019-11-29 00:42:18'),(89,89,79,582,82,'2691054','8405-99-2691054','0000-00-00 00:00:00','2019-11-29 00:42:36'),(90,90,79,582,82,'2691055','8405-99-2691055','0000-00-00 00:00:00','2019-11-29 00:42:57'),(91,91,79,582,82,'2691056	','8405-99-2691056','0000-00-00 00:00:00','2019-11-29 00:43:18'),(92,92,79,582,82,'2691057','8405-99-2691057','0000-00-00 00:00:00','2019-11-29 00:43:39'),(93,93,79,582,82,'2691058','8405-99-2691058','0000-00-00 00:00:00','2019-11-29 00:44:18'),(94,94,79,582,82,'2691059','8405-99-2691059','0000-00-00 00:00:00','2019-11-29 00:44:35'),(95,95,79,582,82,'2691060','8405-99-2691060','0000-00-00 00:00:00','2019-11-29 00:45:27'),(96,96,79,582,82,'2691061','8405-99-2691061','0000-00-00 00:00:00','2019-11-29 00:45:52'),(97,97,79,582,82,'2691062','8405-99-2691062','0000-00-00 00:00:00','2019-11-29 00:46:10'),(98,98,79,582,82,'2691063','8405-99-2691063','0000-00-00 00:00:00','2019-11-29 00:46:29'),(99,99,79,582,82,'2691064','8405-99-2691064','0000-00-00 00:00:00','2019-11-29 00:46:52'),(100,100,79,582,82,'2691065','8405-99-2691065','0000-00-00 00:00:00','2019-11-29 00:47:10'),(101,101,79,582,82,'2691066','8405-99-2691066','0000-00-00 00:00:00','2019-11-29 00:47:34'),(102,102,79,582,82,'2691067','8405-99-2691067','0000-00-00 00:00:00','2019-11-29 00:47:56'),(103,103,79,582,82,'2691068','8405-99-2691068','0000-00-00 00:00:00','2019-11-29 00:48:13'),(104,104,79,582,82,'2691069','8405-99-2691069','0000-00-00 00:00:00','2019-11-29 00:48:38'),(105,105,79,583,82,'8696669','8410-99-8696669','0000-00-00 00:00:00','0000-00-00 00:00:00'),(106,106,79,583,82,'8696670','8410-99-8696670','0000-00-00 00:00:00','0000-00-00 00:00:00'),(107,107,79,583,82,'8696671','8410-99-8696671','0000-00-00 00:00:00','0000-00-00 00:00:00'),(108,108,79,583,82,'8696672','8410-99-8696672','0000-00-00 00:00:00','0000-00-00 00:00:00'),(109,109,79,583,82,'8696673','8410-99-8696673','0000-00-00 00:00:00','0000-00-00 00:00:00'),(110,110,79,583,82,'8696674','8410-99-8696674','0000-00-00 00:00:00','0000-00-00 00:00:00'),(111,111,79,583,82,'8696675','8410-99-8696675','0000-00-00 00:00:00','0000-00-00 00:00:00'),(112,112,79,583,82,'8695660','8410-99-8695660','0000-00-00 00:00:00','2019-11-29 00:51:54'),(113,113,79,583,82,'8695661','8410-99-8695661','0000-00-00 00:00:00','2019-11-29 00:51:36'),(114,114,79,583,82,'8695662','8410-99-8695662','0000-00-00 00:00:00','2019-11-29 00:51:20'),(115,115,79,583,82,'8695663','8410-99-8695663','0000-00-00 00:00:00','2019-11-29 00:51:05'),(116,116,79,583,82,'8695664','8410-99-8695664','0000-00-00 00:00:00','2019-11-29 00:50:51'),(117,117,79,583,82,'8695665','8410-99-8695665','0000-00-00 00:00:00','2019-11-29 00:50:36'),(118,118,79,583,82,'8695666','8410-99-8695666','0000-00-00 00:00:00','2019-11-29 00:52:20'),(119,119,79,583,82,'8695667','8410-99-8695667','0000-00-00 00:00:00','2019-11-29 00:52:37'),(120,120,79,583,82,'8695668','8410-99-8695668','0000-00-00 00:00:00','2019-11-29 00:50:18'),(121,121,79,583,82,'8695669','8410-99-8695669','0000-00-00 00:00:00','2019-11-29 00:52:56'),(122,122,79,583,82,'8695670','8410-99-8695670','0000-00-00 00:00:00','2019-11-29 00:49:54'),(123,123,79,583,82,'8695671','8410-99-8695671','0000-00-00 00:00:00','2019-11-29 00:53:12'),(124,124,79,583,82,'8695672','8410-99-8695672','0000-00-00 00:00:00','2019-11-29 00:53:32'),(125,125,79,583,82,'8695673','8410-99-8695673','0000-00-00 00:00:00','2019-11-29 00:53:47'),(126,126,79,583,82,'8695674','8410-99-8695674','0000-00-00 00:00:00','2019-11-29 00:54:07'),(127,127,79,583,82,'8695675','8410-99-8695675','0000-00-00 00:00:00','2019-11-29 00:54:24'),(128,20,79,582,82,'2124015','8405-99-2124015','0000-00-00 00:00:00','2019-11-19 18:48:25'),(129,21,79,582,82,'2124016','8405-99-2124016','0000-00-00 00:00:00','2019-11-19 18:48:46'),(130,22,79,582,82,'2124017','8405-99-2124017','0000-00-00 00:00:00','2019-11-19 18:49:11'),(131,23,79,582,82,'2124018','8405-99-2124018','0000-00-00 00:00:00','2019-11-19 18:49:32'),(132,24,79,582,82,'2124019','8405-99-2124019','0000-00-00 00:00:00','2019-11-19 18:49:56'),(133,25,79,582,82,'2124020','8405-99-2124020','0000-00-00 00:00:00','2019-11-19 18:50:19'),(134,26,79,582,82,'2124021','8405-99-2124021','0000-00-00 00:00:00','2019-11-19 18:50:47'),(135,27,79,582,82,'2124022','8405-99-2124022','0000-00-00 00:00:00','2019-11-19 18:51:11'),(136,28,79,582,82,'2124022	','8405-99-6027375','0000-00-00 00:00:00','2019-11-19 18:51:35'),(137,29,79,582,82,'6027376','8405-99-6027376','0000-00-00 00:00:00','2019-11-19 18:51:58'),(138,30,79,582,82,'6027377','8405-99-6027377','0000-00-00 00:00:00','2019-11-19 18:52:22'),(139,128,79,583,82,'9830772','8410-99-9830772','0000-00-00 00:00:00','2019-12-16 15:00:39'),(140,128,79,583,82,'2278814','8410-99-2278814','0000-00-00 00:00:00','2019-12-16 15:00:45'),(142,130,79,583,82,'2278815','8410-99-2278815','0000-00-00 00:00:00','2019-12-16 15:00:23'),(143,131,79,583,82,'2278816','8410-99-2278816','0000-00-00 00:00:00','2019-12-16 14:59:49'),(145,133,79,583,82,'2278817','8410-99-2278817','0000-00-00 00:00:00','2019-12-16 14:59:34'),(146,133,79,583,82,'9830775','8410-99-9830775','0000-00-00 00:00:00','2019-12-16 14:59:30'),(147,134,79,583,82,'2278818','8410-99-2278818','0000-00-00 00:00:00','2019-12-16 14:58:36'),(148,134,79,583,82,'9830776','8410-99-9830776','0000-00-00 00:00:00','2019-12-16 14:58:31'),(149,135,79,583,82,'2278819','8410-99-2278819','0000-00-00 00:00:00','2019-12-16 14:58:03'),(151,137,79,583,82,'2278820','8410-99-2278820','0000-00-00 00:00:00','2019-12-16 15:01:59'),(152,138,79,583,82,'9830778','8410-99-9830778','0000-00-00 00:00:00','0000-00-00 00:00:00'),(153,139,79,583,82,'2278821','8410-99-2278821','0000-00-00 00:00:00','2019-12-16 14:57:30'),(155,141,79,583,82,'2278822','8410-99-2278822','0000-00-00 00:00:00','2019-12-16 15:03:04'),(156,142,79,583,82,'8471054','8410-99-8471054','0000-00-00 00:00:00','2019-11-29 00:14:04'),(157,145,79,583,82,'2278823','8410-99-2278823','0000-00-00 00:00:00','2019-12-16 15:03:59'),(158,145,79,583,82,'9830779','8410-99-9830779','0000-00-00 00:00:00','2019-12-16 15:03:52'),(159,146,79,583,82,'9830780','8410-99-9830780','0000-00-00 00:00:00','2019-11-29 00:15:27'),(160,147,79,583,82,'2278824','8410-99-2278824','0000-00-00 00:00:00','2019-12-16 15:04:38'),(161,148,79,583,82,'2278825','8410-99-2278825','0000-00-00 00:00:00','2019-12-16 14:57:04'),(163,150,79,583,82,'2278826','8410-99-2278826','0000-00-00 00:00:00','2019-12-16 14:56:47'),(164,151,79,583,82,'9830783','8410-99-9830783','0000-00-00 00:00:00','2019-12-16 14:56:23'),(165,152,79,583,82,'2278828','8410-99-2278828','0000-00-00 00:00:00','2019-12-16 14:55:35'),(166,153,79,583,82,'9830784','8410-99-9830784','0000-00-00 00:00:00','2019-11-29 00:18:09'),(167,154,79,583,82,'2278829','8410-99-2278829','0000-00-00 00:00:00','2019-12-16 15:06:04'),(168,155,79,583,82,'9830785','8410-99-9830785','0000-00-00 00:00:00','2019-11-29 00:19:10'),(169,156,79,583,82,'2278830','8410-99-2278830','0000-00-00 00:00:00','2019-12-16 14:54:43'),(170,157,79,583,82,'9830786','8410-99-9830786','0000-00-00 00:00:00','2019-11-29 00:19:51'),(171,158,79,583,82,'2278831','8410-99-2278831','0000-00-00 00:00:00','0000-00-00 00:00:00'),(172,159,79,583,82,'8471055','8410-99-8471055','0000-00-00 00:00:00','2019-11-29 00:20:30'),(174,160,79,583,82,'9830787','8410-99-9830787','0000-00-00 00:00:00','2019-11-29 00:21:15'),(176,161,79,583,82,'9830788','8410-99-9830788','0000-00-00 00:00:00','2019-11-29 00:21:37'),(177,162,79,583,82,'2278836','8410-99-2278836','0000-00-00 00:00:00','2019-12-16 15:08:03'),(178,162,79,583,82,'9830789','8410-99-9830789','0000-00-00 00:00:00','2019-12-16 15:08:07'),(179,163,79,583,82,'2278837','8410-99-2278837','0000-00-00 00:00:00','2019-12-16 15:08:36'),(180,163,79,583,82,'9830790','8410-99-9830790','0000-00-00 00:00:00','2019-12-16 15:08:40'),(181,164,79,583,82,'2278838','8410-99-2278838','0000-00-00 00:00:00','2019-12-16 15:09:05'),(182,165,79,583,82,'9830791','8410-99-9830791','0000-00-00 00:00:00','2019-11-29 00:23:50'),(184,167,79,583,82,'8471056','8410-99-8471056','0000-00-00 00:00:00','2019-11-28 23:59:00'),(186,168,79,583,82,'2278841','8410-99-2278841','0000-00-00 00:00:00','2019-12-16 15:10:17'),(188,170,79,583,82,'2278842','8410-99-2278842','0000-00-00 00:00:00','2019-12-16 15:11:04'),(189,171,79,583,82,'2278843','8410-99-2278843','0000-00-00 00:00:00','2019-12-16 15:11:30'),(190,172,79,583,82,'5096895','8410-99-5096895','0000-00-00 00:00:00','0000-00-00 00:00:00'),(191,173,79,583,82,'5096896','8410-99-5096896','0000-00-00 00:00:00','0000-00-00 00:00:00'),(192,174,79,583,82,'5096897','8410-99-5096897','0000-00-00 00:00:00','0000-00-00 00:00:00'),(193,175,79,583,82,'5096898','8410-99-5096898','0000-00-00 00:00:00','0000-00-00 00:00:00'),(194,176,79,583,82,'5096899','8410-99-5096899','0000-00-00 00:00:00','0000-00-00 00:00:00'),(195,177,79,583,82,'5096900','8410-99-5096900','0000-00-00 00:00:00','0000-00-00 00:00:00'),(196,178,79,583,82,'5096901','8410-99-5096901','0000-00-00 00:00:00','0000-00-00 00:00:00'),(197,179,79,583,82,'8471059','8410-99-8471059','0000-00-00 00:00:00','0000-00-00 00:00:00'),(198,180,79,583,82,'8471060','8410-99-8471060','0000-00-00 00:00:00','0000-00-00 00:00:00'),(199,181,79,583,82,'5096902','8410-99-5096902','0000-00-00 00:00:00','0000-00-00 00:00:00'),(200,182,79,583,82,'5096903','8410-99-5096903','0000-00-00 00:00:00','0000-00-00 00:00:00'),(201,183,79,583,82,'5096904','8410-99-5096904','0000-00-00 00:00:00','0000-00-00 00:00:00'),(202,184,79,583,82,'5096905','8410-99-5096905','0000-00-00 00:00:00','0000-00-00 00:00:00'),(203,185,79,583,82,'5096906','8410-99-5096906','0000-00-00 00:00:00','0000-00-00 00:00:00'),(204,186,79,583,82,'5096907','8410-99-5096907','0000-00-00 00:00:00','0000-00-00 00:00:00'),(205,187,79,583,82,'5096908','8410-99-5096908','0000-00-00 00:00:00','0000-00-00 00:00:00'),(206,188,79,583,82,'5096909','8410-99-5096909','0000-00-00 00:00:00','0000-00-00 00:00:00'),(207,189,79,583,82,'8471061','8410-99-8471061','0000-00-00 00:00:00','0000-00-00 00:00:00'),(208,190,79,583,82,'5096910','8410-99-5096910','0000-00-00 00:00:00','0000-00-00 00:00:00'),(209,191,79,583,82,'5096911','8410-99-5096911','0000-00-00 00:00:00','0000-00-00 00:00:00'),(210,192,79,583,82,'5096912','8410-99-5096912','0000-00-00 00:00:00','0000-00-00 00:00:00'),(211,193,79,583,82,'5096913','8410-99-5096913','0000-00-00 00:00:00','0000-00-00 00:00:00'),(212,194,79,583,82,'5096914','8410-99-5096914','0000-00-00 00:00:00','0000-00-00 00:00:00'),(213,195,79,583,82,'8471062','8410-99-8471062','0000-00-00 00:00:00','0000-00-00 00:00:00'),(214,196,79,583,82,'8471063','8410-99-8471063','0000-00-00 00:00:00','0000-00-00 00:00:00'),(215,197,79,583,82,'8471064','8410-99-8471064','0000-00-00 00:00:00','0000-00-00 00:00:00'),(216,218,79,584,82,'6674046','8415-99-667-4046','2019-10-19 09:55:28','2020-01-27 21:05:00'),(217,218,79,584,82,'3178360','8415-99-317-8360','2019-10-19 09:55:46','2019-10-19 09:55:46'),(218,218,79,584,82,'2556782','8415-99-255-6782','2019-10-19 09:56:04','2019-10-19 09:56:04'),(219,219,79,584,82,'5970431','8415-99-597-0431','2019-10-19 09:56:34','2019-10-19 09:56:34'),(220,219,79,584,82,'3178363','8415-99-317-8363','2019-10-19 09:56:46','2019-10-19 09:56:46'),(221,223,79,584,82,'3178348','8415-99-317-8348','2019-10-19 09:57:12','2019-10-19 09:57:12'),(222,223,79,584,82,'3178368','8415-99-317-8368','2019-10-19 09:57:37','2019-10-19 09:57:37'),(223,223,79,584,82,'6674227','8415-99-667-4227','2019-10-19 09:57:50','2019-10-19 09:57:50'),(224,221,79,584,82,'3178369','8415-99-317-8369','2019-10-19 09:58:11','2019-10-19 09:58:11'),(225,221,79,584,82,'6674228','8415-99-667-4228','2019-10-19 09:58:25','2019-10-19 09:58:25'),(226,220,79,584,82,'3178347','8415-99-317-8347','2019-10-19 09:58:58','2019-10-19 09:58:58'),(227,220,79,584,82,'3178367','8415-99-317-8367','2019-10-19 09:59:14','2019-10-19 09:59:14'),(228,224,79,584,82,'3178372','8415-99-317-8372','2019-10-19 09:59:43','2019-10-19 09:59:43'),(229,224,79,584,82,'3178352','8415-99-317-8352','2019-10-19 09:59:52','2019-10-19 09:59:52'),(230,224,79,584,82,'6674231','8415-99-667-4231','2019-10-19 10:00:03','2019-10-19 10:00:03'),(231,222,79,584,82,'2556793','8415-99-255-6793','2019-10-19 10:00:29','2019-10-19 10:00:29'),(232,222,79,584,82,'3178371','8415-99-317-8371','2019-10-19 10:00:41','2019-10-19 10:00:41'),(233,206,79,584,82,'3178309','8415-99-317-8309','2019-10-19 10:03:33','2019-10-19 10:03:33'),(234,207,79,584,82,'3178310','8415-99-317-8310','2019-10-19 10:03:49','2019-10-19 10:03:49'),(235,208,79,584,82,'3178311','8415-99-317-8311','2019-10-19 10:04:07','2019-10-19 10:04:07'),(236,211,79,584,82,'3178312','8415-99-317-8312','2019-10-19 10:04:28','2019-10-19 10:04:28'),(237,209,79,584,82,'3178313','8415-99-317-8313','2019-10-19 10:04:48','2020-01-27 21:05:19'),(238,209,79,584,82,'3178278','8415-99-317-8278','2019-10-19 10:04:58','2019-10-19 10:04:58'),(239,209,79,584,82,'6674250','8415-99-667-4250','2019-10-19 10:05:09','2019-10-19 10:05:09'),(240,212,79,584,82,'3178314','8415-99-317-8314','2019-10-19 10:05:41','2019-10-19 10:05:41'),(241,210,79,584,82,'3178281','8415-99-317-8281','2019-10-19 10:05:58','2019-10-19 10:05:58'),(242,210,79,584,82,'3178316','8415-99-317-8316','2019-10-19 10:06:10','2019-10-19 10:06:10'),(243,215,79,584,82,'3178317','8415-99-317-8317','2019-10-19 10:06:30','2020-01-27 21:09:30'),(244,213,79,584,82,'3178318','8415-99-317-8318','2019-10-19 10:06:51','2019-10-19 10:06:51'),(245,213,79,584,82,'3178283','8415-99-317-8283','2019-10-19 10:07:01','2019-10-19 10:07:01'),(246,214,79,584,82,'3178319','8415-99-317-8319','2019-10-19 10:07:24','2019-10-19 10:07:24'),(247,216,79,584,82,'3178320','8415-99-317-8320','2019-10-19 10:07:40','2019-10-19 10:07:40'),(248,216,79,584,82,'3178285','8415-99-317-8285','2019-10-19 10:07:50','2019-10-19 10:07:50'),(249,216,79,584,82,'6674257','8415-99-667-4257','2019-10-19 10:08:01','2019-10-19 10:08:01'),(250,217,79,584,82,'3178321','8415-99-317-8321','2019-10-19 10:08:25','2019-10-19 10:08:25'),(251,217,79,584,82,'6674258','8415-99-667-4258','2019-10-19 10:08:33','2019-10-19 10:08:33'),(252,203,79,584,82,'3178330','8415-99-317-8330','2019-10-19 10:08:56','2019-10-19 10:08:56'),(253,205,79,584,82,'3178332','8415-99-317-8332','2019-10-19 10:09:14','2019-10-19 10:09:14'),(254,199,79,584,82,'3178324','8415-99-317-8324','2019-10-19 10:09:35','2019-10-19 10:09:35'),(255,200,79,584,82,'3178290','8415-99-317-8290','2019-10-19 10:09:54','2019-10-19 10:09:54'),(256,201,79,584,82,'3178291','8415-99-317-8291','2019-10-19 10:10:09','2019-10-19 10:10:09'),(257,202,79,584,82,'3178292','8415-99-317-8292','2019-10-19 10:10:26','2019-10-19 10:10:26'),(258,202,79,584,82,'6674264','8415-99-667-4264','2019-10-19 10:10:38','2019-10-19 10:10:38'),(259,204,79,584,82,'3178328','8415-99-317-8328','2019-10-19 10:10:54','2019-10-19 10:10:54'),(260,204,79,584,82,'3178293','8415-99-317-8293','2019-10-19 10:11:06','2019-10-19 10:11:06'),(263,27,79,582,82,'8692451','8405-99-8692451','2019-10-30 18:42:57','2019-10-30 18:42:57'),(264,25,79,582,82,'8692449','8405-99-8692449','2019-10-30 18:48:21','2019-10-30 18:48:21'),(265,22,79,582,82,'8692446','8405-99-8692446','2019-10-30 18:53:55','2019-10-30 18:53:55'),(266,198,79,592,82,'1376123','8455-99-1376123','2019-10-30 20:27:40','2019-10-30 20:27:40'),(267,226,79,592,82,'1376440','8455-99-1376440','2019-10-30 20:34:52','2019-10-30 20:34:52'),(268,228,79,592,82,'1271767','8455-99-1271767','2019-10-30 20:38:57','2019-10-30 20:38:57'),(269,227,90,662,83,'','18011','2019-11-04 20:45:48','2019-11-04 20:45:48'),(271,129,79,583,82,'9830773','8410-99-9830773','2019-11-29 00:04:12','2019-11-29 00:04:12'),(272,132,79,583,82,'9830774','8410-99-9830774','2019-11-29 00:05:37','2019-11-29 00:05:37'),(273,136,79,583,82,'9830777','8410-99-9830777','2019-11-29 00:11:21','2019-11-29 00:11:21'),(274,140,79,583,82,'8471053','8410-99-8471053','2019-11-29 00:13:15','2019-11-29 00:13:15'),(275,149,79,583,82,'9830781','8410-99-9830781','2019-11-29 00:16:11','2019-11-29 00:16:11'),(276,150,79,583,82,'9830782','8410-99-9830782','2019-11-29 00:16:56','2019-12-16 14:56:43'),(278,166,79,583,82,'8471055a','8410-99-8471055a','2019-11-29 00:25:11','2019-11-29 00:25:11'),(280,169,79,583,82,'8471057','8410-99-8471057','2019-11-29 00:27:15','2019-11-29 00:27:15'),(287,151,79,583,82,'2278827','8410-99-2278827','2019-12-16 14:56:16','2019-12-16 14:56:16'),(288,240,79,583,82,'2278839','8410-99-2278839','2019-12-16 15:31:04','2019-12-16 15:31:04'),(289,241,79,583,82,'2278840','8410-99-2278840','2019-12-16 15:33:11','2019-12-16 15:33:11'),(290,243,79,583,82,'2278835','8410-99-2278835','2019-12-16 15:36:29','2019-12-16 15:36:29'),(291,244,79,583,82,'2278834','8410-99-2278834','2019-12-16 15:37:00','2019-12-16 15:37:00'),(292,245,79,583,82,'2278833','8410-99-2278833','2019-12-16 15:37:34','2019-12-16 15:37:34'),(293,242,79,583,82,'2278832','8410-99-2278832','2019-12-16 15:38:07','2019-12-16 15:38:07'),(294,246,79,582,82,'1301313','8405-99-1301313','2019-12-16 15:57:52','2019-12-16 15:57:52'),(295,247,79,582,82,'1301314','8405-99-1301314','2019-12-16 15:58:50','2019-12-16 15:58:50'),(296,231,79,594,82,'9736828','8465-99-973-6828','2020-01-27 21:01:22','2020-01-27 21:01:27'),(297,229,51,331,82,'9736818','5340-99-973-6818','2020-01-27 21:02:09','2020-01-27 21:02:09'),(298,230,90,662,83,'','BELTGREENMALE','2020-01-27 21:02:36','2020-01-27 21:02:36'),(299,232,90,662,83,'','WEBBINGGREEN','2020-01-27 21:03:44','2020-01-27 21:03:44'),(300,250,90,662,83,'','TShirtBrownSmall','2020-01-29 18:07:29','2020-01-29 18:07:29'),(301,254,79,587,82,'2976296','8430-99-297-6296','2020-02-18 10:56:43','2020-02-18 10:56:43'),(302,253,79,587,82,'2976287','8430-99-297-6287','2020-02-18 10:57:21','2020-02-18 10:57:21'),(303,255,79,587,82,'9752231','8430-99-975-2231','2020-02-18 10:58:27','2020-02-18 10:58:27'),(304,251,79,587,82,'2976284','8430-99-297-6284','2020-02-18 10:59:27','2020-02-18 10:59:27'),(305,256,79,587,82,'2976289','8430-99-297-6289','2020-02-18 11:15:44','2020-02-18 11:15:44'),(306,257,79,587,82,'2976290','8430-99-297-6290','2020-02-18 11:16:05','2020-02-18 11:16:05'),(307,258,79,588,82,'9772122','8435-99-977-2122','2020-02-18 11:23:07','2020-02-18 11:23:07'),(308,260,79,588,82,'9772107','8435-99-977-2107','2020-02-18 11:24:07','2020-02-18 11:24:07'),(309,259,79,588,82,'9770000','8435-99-977-0000','2020-02-18 11:25:25','2020-02-18 11:25:25'),(310,261,90,662,83,'','000000000','2020-02-18 11:42:41','2020-02-18 11:42:41'),(311,262,41,275,82,'9576913','4240-99-957-6913','2020-02-18 14:17:46','2020-07-20 21:44:34'),(312,263,79,584,82,'6674304','8415-99-667-4304','2020-02-18 15:05:03','2020-02-18 15:05:03'),(313,264,90,662,83,'','11111','2020-02-18 15:44:33','2020-02-18 15:44:33'),(314,265,90,662,83,'','2214','2020-02-18 15:45:07','2020-02-18 15:45:07');
/*!40000 ALTER TABLE `nsns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_lines`
--

DROP TABLE IF EXISTS `order_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_lines` (
  `line_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `size_id` int(11) NOT NULL,
  `_qty` int(11) NOT NULL,
  `_status` varchar(15) NOT NULL DEFAULT 'Pending',
  `demand_line_id` int(11) DEFAULT NULL,
  `receipt_line_id` int(11) DEFAULT NULL,
  `issue_line_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`line_id`)
) ENGINE=InnoDB AUTO_INCREMENT=189 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_lines`
--

LOCK TABLES `order_lines` WRITE;
/*!40000 ALTER TABLE `order_lines` DISABLE KEYS */;
INSERT INTO `order_lines` VALUES (165,98,84,1,'Open',1715,NULL,NULL,2,'2020-05-03 09:31:45','2020-05-03 09:48:53'),(166,99,60,1,'Open',1717,63,NULL,2,'2020-05-03 09:32:13','2020-05-03 13:52:06'),(167,99,21,1,'Open',1718,61,NULL,2,'2020-05-03 09:32:13','2020-05-03 13:45:49'),(168,100,150,1,'Open',1719,60,NULL,2,'2020-05-03 09:32:34','2020-05-03 13:37:01'),(169,101,62,1,'Complete',1720,62,218,2,'2020-05-03 09:32:54','2020-05-03 14:40:21'),(170,98,13,1,'Open',1716,NULL,NULL,2,'2020-05-03 09:33:15','2020-05-03 09:48:53'),(171,102,1,1,'Open',1721,NULL,NULL,2,'2020-05-03 09:34:00','2020-05-03 09:50:21'),(172,102,4,1,'Open',1722,NULL,NULL,2,'2020-05-03 09:34:00','2020-05-03 09:50:21'),(173,102,31,1,'Open',NULL,NULL,NULL,2,'2020-05-03 09:34:00','2020-05-03 14:52:49'),(174,102,14,1,'Open',1723,NULL,NULL,2,'2020-05-03 09:34:00','2020-05-03 09:50:21'),(175,102,21,1,'Open',1718,61,NULL,2,'2020-05-03 09:34:00','2020-05-03 13:45:49'),(176,102,50,1,'Open',1725,NULL,NULL,2,'2020-05-03 09:34:00','2020-05-03 09:50:21'),(177,102,59,1,'Open',1728,64,NULL,2,'2020-05-03 09:34:00','2020-05-03 13:52:06'),(178,102,198,1,'Open',NULL,NULL,NULL,2,'2020-05-03 09:34:00','2020-05-03 09:49:51'),(179,102,226,1,'Open',NULL,NULL,NULL,2,'2020-05-03 09:34:00','2020-05-03 09:49:51'),(180,102,227,1,'Open',NULL,NULL,NULL,2,'2020-05-03 09:34:00','2020-05-03 09:49:51'),(181,102,228,1,'Open',NULL,NULL,NULL,2,'2020-05-03 09:34:00','2020-05-03 09:49:51'),(182,102,76,1,'Open',1726,59,NULL,2,'2020-05-03 09:34:24','2020-05-03 13:37:01'),(183,100,185,1,'Open',1727,NULL,NULL,2,'2020-05-03 09:34:42','2020-05-03 09:50:21'),(184,102,172,1,'Open',1729,NULL,NULL,2,'2020-05-03 09:35:01','2020-05-03 09:50:21'),(185,103,262,1,'Open',1730,NULL,NULL,2,'2020-05-03 09:35:21','2020-05-03 09:50:21'),(186,103,59,1,'Open',1731,NULL,NULL,2,'2020-05-03 09:35:21','2020-05-03 09:50:21'),(187,104,14,1,'Open',1732,NULL,NULL,2,'2020-05-03 09:35:41','2020-05-03 09:50:21'),(188,104,119,1,'Open',1733,NULL,NULL,2,'2020-05-03 09:35:41','2020-05-03 09:50:21');
/*!40000 ALTER TABLE `order_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `ordered_for` int(11) NOT NULL DEFAULT '-1',
  `_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `_complete` tinyint(4) NOT NULL DEFAULT '0',
  `_closed` tinyint(4) NOT NULL DEFAULT '0',
  `user_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `order_id_UNIQUE` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (98,9,'2020-05-03 09:31:45',0,0,2,'2020-05-03 09:31:45','2020-05-03 09:48:40'),(99,14,'2020-05-03 09:32:13',1,0,2,'2020-05-03 09:32:13','2020-05-03 09:49:11'),(100,11,'2020-05-03 09:32:34',1,0,2,'2020-05-03 09:32:34','2020-05-03 09:49:31'),(101,10,'2020-05-03 09:32:54',1,1,2,'2020-05-03 09:32:54','2020-05-03 14:40:21'),(102,33,'2020-05-03 09:34:00',1,0,2,'2020-05-03 09:34:00','2020-05-03 09:49:51'),(103,6,'2020-05-03 09:35:20',1,0,2,'2020-05-03 09:35:20','2020-05-03 09:50:06'),(104,3,'2020-05-03 09:35:41',1,0,2,'2020-05-03 09:35:41','2020-05-03 09:50:16');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions` (
  `permission_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `_permission` varchar(45) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`permission_id`)
) ENGINE=InnoDB AUTO_INCREMENT=157 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (2,2,'account_enabled','2020-04-11 12:25:39','2020-04-11 12:25:39'),(6,3,'issue_add','2020-04-11 21:01:00','2020-04-11 21:01:00'),(9,3,'access_issue_lines','2020-04-11 20:27:08','2020-04-11 20:27:08'),(10,3,'access_items','2020-04-11 20:28:12','2020-04-11 20:28:12'),(11,3,'access_returns','2020-04-11 20:28:12','2020-04-11 20:28:12'),(16,2,'access_issues','2020-04-13 16:43:23','2020-04-13 16:43:23'),(17,2,'issue_add','2020-04-13 16:43:23','2020-04-13 16:43:23'),(18,2,'issue_edit','2020-04-13 16:43:23','2020-04-13 16:43:23'),(19,2,'issue_delete','2020-04-13 16:43:23','2020-04-13 16:43:23'),(20,2,'access_issue_lines','2020-04-13 16:43:23','2020-04-13 16:43:23'),(21,2,'issue_line_add','2020-04-13 16:43:23','2020-04-13 16:43:23'),(22,2,'issue_line_edit','2020-04-13 16:43:23','2020-04-13 16:43:23'),(23,2,'issue_line_delete','2020-04-13 16:43:23','2020-04-13 16:43:23'),(24,2,'access_returns','2020-04-13 16:43:23','2020-04-13 16:43:23'),(25,2,'return_add','2020-04-13 16:43:23','2020-04-13 16:43:23'),(26,2,'return_edit','2020-04-13 16:43:23','2020-04-13 16:43:23'),(27,2,'return_delete','2020-04-13 16:43:23','2020-04-13 16:43:23'),(28,2,'access_return_lines','2020-04-13 16:43:23','2020-04-13 16:43:23'),(29,2,'return_line_add','2020-04-13 16:43:23','2020-04-13 16:43:23'),(30,2,'return_line_edit','2020-04-13 16:43:23','2020-04-13 16:43:23'),(31,2,'return_line_delete','2020-04-13 16:43:23','2020-04-13 16:43:23'),(32,2,'access_items','2020-04-13 16:43:23','2020-04-13 16:43:23'),(33,2,'item_add','2020-04-13 16:43:23','2020-04-13 16:43:23'),(34,2,'item_edit','2020-04-13 16:43:23','2020-04-13 16:43:23'),(35,2,'item_delete','2020-04-13 16:43:23','2020-04-13 16:43:23'),(39,2,'permission_edit','2020-04-13 19:21:51','2020-04-13 19:21:51'),(40,2,'access_sizes','2020-04-13 18:22:28','2020-04-13 18:22:28'),(41,2,'size_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(42,2,'size_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(43,2,'size_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(44,2,'access_adjusts','2020-04-13 18:22:28','2020-04-13 18:22:28'),(45,2,'adjust_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(46,2,'adjust_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(47,2,'adjust_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(48,2,'access_nsns','2020-04-13 18:22:28','2020-04-13 18:22:28'),(49,2,'nsn_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(50,2,'nsn_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(51,2,'nsn_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(52,2,'access_serials','2020-04-13 18:22:28','2020-04-13 18:22:28'),(53,2,'serial_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(54,2,'serial_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(55,2,'serial_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(56,2,'access_stock','2020-04-13 18:22:28','2020-04-13 18:22:28'),(57,2,'stock_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(58,2,'stock_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(59,2,'stock_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(60,2,'access_locations','2020-04-13 18:22:28','2020-04-13 18:22:28'),(61,2,'location_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(62,2,'location_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(63,2,'location_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(64,2,'access_categories','2020-04-13 18:22:28','2020-04-13 18:22:28'),(65,2,'category_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(66,2,'category_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(67,2,'category_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(68,2,'access_groups','2020-04-13 18:22:28','2020-04-13 18:22:28'),(69,2,'group_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(70,2,'group_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(71,2,'group_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(72,2,'access_types','2020-04-13 18:22:28','2020-04-13 18:22:28'),(73,2,'type_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(74,2,'type_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(75,2,'type_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(76,2,'access_subtypes','2020-04-13 18:22:28','2020-04-13 18:22:28'),(77,2,'subtype_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(78,2,'subtype_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(79,2,'subtype_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(80,2,'access_genders','2020-04-13 18:22:28','2020-04-13 18:22:28'),(81,2,'gender_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(82,2,'gender_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(83,2,'gender_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(84,2,'access_notes','2020-04-13 18:22:28','2020-04-13 18:22:28'),(85,2,'note_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(86,2,'note_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(87,2,'note_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(88,2,'access_orders','2020-04-13 18:22:28','2020-04-13 18:22:28'),(89,2,'order_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(90,2,'order_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(91,2,'order_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(92,2,'access_order_lines','2020-04-13 18:22:28','2020-04-13 18:22:28'),(93,2,'order_line_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(94,2,'order_line_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(95,2,'order_line_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(96,2,'access_receipts','2020-04-13 18:22:28','2020-04-13 18:22:28'),(97,2,'receipt_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(98,2,'receipt_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(99,2,'receipt_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(100,2,'access_receipt_lines','2020-04-13 18:22:28','2020-04-13 18:22:28'),(101,2,'receipt_line_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(102,2,'receipt_line_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(103,2,'receipt_line_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(104,2,'access_requests','2020-04-13 18:22:28','2020-04-13 18:22:28'),(105,2,'request_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(106,2,'request_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(107,2,'request_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(108,2,'access_request_lines','2020-04-13 18:22:28','2020-04-13 18:22:28'),(109,2,'request_line_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(111,2,'request_line_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(112,2,'access_settings','2020-04-13 18:22:28','2020-04-13 18:22:28'),(113,2,'setting_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(114,2,'setting_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(115,2,'setting_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(116,2,'access_suppliers','2020-04-13 18:22:28','2020-04-13 18:22:28'),(117,2,'supplier_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(118,2,'supplier_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(119,2,'supplier_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(120,2,'access_accounts','2020-04-13 18:22:28','2020-04-13 18:22:28'),(121,2,'account_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(122,2,'account_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(123,2,'account_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(124,2,'access_files','2020-04-13 18:22:28','2020-04-13 18:22:28'),(125,2,'file_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(126,2,'file_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(127,2,'file_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(128,2,'access_demands','2020-04-13 18:22:28','2020-04-13 18:22:28'),(129,2,'demand_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(130,2,'demand_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(131,2,'demand_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(132,2,'access_demand_lines','2020-04-13 18:22:28','2020-04-13 18:22:28'),(133,2,'demand_line_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(134,2,'demand_line_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(135,2,'demand_line_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(136,2,'access_users','2020-04-13 18:22:28','2020-04-13 18:22:28'),(137,2,'user_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(138,2,'user_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(139,2,'user_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(140,2,'access_permissions','2020-04-13 18:22:28','2020-04-13 18:22:28'),(141,2,'permission_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(142,2,'permission_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(143,2,'access_statuses','2020-04-13 18:22:28','2020-04-13 18:22:28'),(144,2,'status_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(145,2,'status_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(146,2,'status_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(147,2,'access_ranks','2020-04-13 18:22:28','2020-04-13 18:22:28'),(148,2,'rank_add','2020-04-13 18:22:28','2020-04-13 18:22:28'),(149,2,'rank_edit','2020-04-13 18:22:28','2020-04-13 18:22:28'),(150,2,'rank_delete','2020-04-13 18:22:28','2020-04-13 18:22:28'),(151,2,'file_download','2020-04-18 16:28:55','2020-04-18 16:28:55'),(152,2,'request_line_edit','2020-04-30 15:35:00','2020-04-30 15:35:00'),(153,2,'option_add','2020-06-28 21:21:16','2020-06-28 21:21:16'),(154,2,'option_edit','2020-06-28 21:21:16','2020-06-28 21:21:16'),(155,2,'option_delete','2020-06-28 21:21:16','2020-06-28 21:21:16'),(156,2,'access_options','2020-06-28 21:21:16','2020-06-28 21:21:16');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ranks`
--

DROP TABLE IF EXISTS `ranks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ranks` (
  `rank_id` int(11) NOT NULL AUTO_INCREMENT,
  `_rank` varchar(10) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`rank_id`),
  UNIQUE KEY `rank_id_UNIQUE` (`rank_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ranks`
--

LOCK TABLES `ranks` WRITE;
/*!40000 ALTER TABLE `ranks` DISABLE KEYS */;
INSERT INTO `ranks` VALUES (1,'Cdt','2020-01-29 14:41:38','2020-01-29 14:41:38'),(2,'Cpl','2020-01-29 14:41:38','2020-01-29 14:41:38'),(3,'Sgt','2020-01-29 14:41:38','2020-01-29 14:41:38'),(4,'FS','2020-01-29 14:41:38','2020-01-29 14:41:38'),(5,'CWO','2020-01-29 14:41:38','2020-01-29 14:41:38'),(6,'A Sgt','2020-01-29 14:41:38','2020-01-29 14:41:38'),(7,'A FS','2020-01-29 14:41:38','2020-01-29 14:41:38'),(8,'A WO','2020-01-29 14:41:38','2020-01-29 14:41:38'),(9,'Plt Off','2020-01-29 14:41:38','2020-01-29 14:41:38'),(10,'Fg Off','2020-01-29 14:41:38','2020-01-29 14:41:38'),(11,'Flt Lt','2020-01-29 14:41:38','2020-01-29 14:41:38'),(12,'Sqn Ldr','2020-01-29 14:41:38','2020-01-29 14:41:38'),(13,'Other','2020-01-29 14:41:38','2020-01-29 14:41:38'),(14,'CI','2020-01-29 14:41:38','2020-01-29 14:41:38'),(15,'LAC','2020-01-29 14:41:38','2020-01-29 14:41:38'),(16,'SAC','2020-01-29 14:41:38','2020-01-29 14:41:38'),(17,'SAC(T)','2020-01-29 14:41:38','2020-01-29 14:41:38');
/*!40000 ALTER TABLE `ranks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receipt_lines`
--

DROP TABLE IF EXISTS `receipt_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `receipt_lines` (
  `line_id` int(11) NOT NULL AUTO_INCREMENT,
  `receipt_id` int(11) NOT NULL,
  `size_id` int(11) NOT NULL,
  `stock_id` int(11) NOT NULL,
  `serial_id` int(11) DEFAULT NULL,
  `_status` varchar(15) NOT NULL DEFAULT 'Pending',
  `_qty` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`line_id`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receipt_lines`
--

LOCK TABLES `receipt_lines` WRITE;
/*!40000 ALTER TABLE `receipt_lines` DISABLE KEYS */;
INSERT INTO `receipt_lines` VALUES (59,32,76,19,NULL,'Pending',1,2,'2020-05-03 13:37:00','2020-05-03 13:37:00'),(60,32,150,27,NULL,'Pending',1,2,'2020-05-03 13:37:01','2020-05-03 13:37:01'),(61,32,21,41,NULL,'Pending',2,2,'2020-05-03 13:45:49','2020-05-03 13:45:49'),(62,32,62,45,NULL,'Pending',1,2,'2020-05-03 13:45:49','2020-05-03 13:45:49'),(63,32,60,47,NULL,'Pending',1,2,'2020-05-03 13:52:06','2020-05-03 13:52:06'),(64,32,59,48,NULL,'Pending',1,2,'2020-05-03 13:52:06','2020-05-03 13:52:06');
/*!40000 ALTER TABLE `receipt_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receipts`
--

DROP TABLE IF EXISTS `receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `receipts` (
  `receipt_id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_id` int(11) NOT NULL,
  `_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `_complete` tinyint(4) NOT NULL DEFAULT '0',
  `user_id` varchar(128) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`receipt_id`),
  UNIQUE KEY `receipt_id_UNIQUE` (`receipt_id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receipts`
--

LOCK TABLES `receipts` WRITE;
/*!40000 ALTER TABLE `receipts` DISABLE KEYS */;
INSERT INTO `receipts` VALUES (32,1,'2020-05-03 13:17:12',0,'2','2020-05-03 13:17:12','2020-05-03 13:17:12');
/*!40000 ALTER TABLE `receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `request_lines`
--

DROP TABLE IF EXISTS `request_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `request_lines` (
  `line_id` int(11) NOT NULL AUTO_INCREMENT,
  `request_id` int(11) NOT NULL,
  `size_id` int(11) NOT NULL,
  `_qty` int(11) NOT NULL,
  `_status` varchar(15) NOT NULL DEFAULT 'Pending',
  `_action` varchar(15) DEFAULT NULL,
  `_date` datetime DEFAULT NULL,
  `_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`line_id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `request_lines`
--

LOCK TABLES `request_lines` WRITE;
/*!40000 ALTER TABLE `request_lines` DISABLE KEYS */;
INSERT INTO `request_lines` VALUES (1,1,84,1,'Approved','Order','2020-05-03 09:31:45',165,2,'2019-11-06 20:53:55','2020-05-03 09:31:45'),(2,2,60,1,'Approved','Order','2020-05-03 09:32:13',166,2,'2019-11-25 19:14:18','2020-05-03 09:32:13'),(3,2,21,1,'Approved','Order','2020-05-03 09:32:13',167,2,'2019-11-25 19:14:18','2020-05-03 09:32:13'),(4,3,150,1,'Approved','Order','2020-05-03 09:32:34',168,2,'2019-11-25 20:24:14','2020-05-03 09:32:34'),(5,4,62,1,'Approved','Order','2020-05-03 09:32:54',169,2,'2020-02-10 19:19:19','2020-05-03 09:32:54'),(6,5,13,1,'Approved','Order','2020-05-03 09:33:15',170,2,'2020-02-10 19:47:38','2020-05-03 09:33:15'),(7,6,1,1,'Approved','Order','2020-05-03 09:34:00',171,2,'2020-02-12 19:52:37','2020-05-03 09:34:00'),(8,6,4,1,'Approved','Order','2020-05-03 09:34:00',172,2,'2020-02-12 19:52:37','2020-05-03 09:34:00'),(9,6,31,1,'Approved','Order','2020-05-03 09:34:00',173,2,'2020-02-12 19:52:37','2020-05-03 09:34:00'),(10,6,21,1,'Approved','Order','2020-05-03 09:34:00',175,2,'2020-02-12 19:52:37','2020-05-03 09:34:00'),(11,6,14,1,'Approved','Order','2020-05-03 09:34:00',174,2,'2020-02-12 19:52:37','2020-05-03 09:34:00'),(12,6,50,1,'Approved','Order','2020-05-03 09:34:00',176,2,'2020-02-12 19:52:37','2020-05-03 09:34:00'),(13,6,59,1,'Approved','Order','2020-05-03 09:34:00',177,2,'2020-02-12 19:52:37','2020-05-03 09:34:00'),(14,6,198,1,'Approved','Order','2020-05-03 09:34:00',178,2,'2020-02-12 19:52:37','2020-05-03 09:34:00'),(15,6,75,1,'Declined',NULL,'2020-05-03 09:35:54',NULL,NULL,'2020-02-12 19:52:37','2020-05-03 09:35:54'),(16,6,226,1,'Approved','Order','2020-05-03 09:34:00',179,2,'2020-02-12 19:52:37','2020-05-03 09:34:00'),(17,6,227,1,'Approved','Order','2020-05-03 09:34:00',180,2,'2020-02-12 19:52:37','2020-05-03 09:34:00'),(18,6,228,1,'Approved','Order','2020-05-03 09:34:00',181,2,'2020-02-12 19:52:37','2020-05-03 09:34:00'),(19,7,76,1,'Approved','Order','2020-05-03 09:34:24',182,2,'2020-02-12 19:56:11','2020-05-03 09:34:24'),(20,8,185,1,'Approved','Order','2020-05-03 09:34:42',183,2,'2020-02-12 20:12:42','2020-05-03 09:34:42'),(32,29,172,1,'Approved','Order','2020-05-03 09:35:01',184,2,'2020-02-25 11:13:22','2020-05-03 09:35:01'),(33,32,262,1,'Approved','Order','2020-05-03 09:35:21',185,2,'2020-04-27 12:01:21','2020-05-03 09:35:21'),(35,32,59,1,'Approved','Order','2020-05-03 09:35:21',186,2,'2020-04-27 12:01:41','2020-05-03 09:35:21'),(36,33,14,1,'Approved','Order','2020-05-03 09:35:41',187,2,'2020-04-30 13:55:42','2020-05-03 09:35:41'),(37,33,119,1,'Approved','Order','2020-05-03 09:35:41',188,2,'2020-04-30 13:56:05','2020-05-03 09:35:41'),(38,34,108,1,'Declined',NULL,'2020-05-03 09:40:50',NULL,2,'2020-05-03 09:39:57','2020-05-03 09:40:50');
/*!40000 ALTER TABLE `request_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `requests`
--

DROP TABLE IF EXISTS `requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `requests` (
  `request_id` int(11) NOT NULL AUTO_INCREMENT,
  `requested_for` int(11) NOT NULL,
  `_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `_complete` tinyint(4) NOT NULL DEFAULT '0',
  `_closed` tinyint(4) NOT NULL DEFAULT '0',
  `user_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  UNIQUE KEY `REQUESTID_UNIQUE` (`request_id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requests`
--

LOCK TABLES `requests` WRITE;
/*!40000 ALTER TABLE `requests` DISABLE KEYS */;
INSERT INTO `requests` VALUES (1,9,'2019-11-06 20:53:55',1,1,9,'2019-11-06 20:53:55','2020-05-03 09:31:45'),(2,14,'2019-11-25 19:14:18',1,1,14,'2019-11-25 19:14:18','2020-05-03 09:32:13'),(3,11,'2019-11-25 20:24:14',1,1,11,'2019-11-25 20:24:14','2020-05-03 09:32:34'),(4,10,'2020-02-10 19:19:19',1,1,10,'2020-02-10 19:19:19','2020-05-03 09:32:54'),(5,9,'2020-02-10 19:47:38',1,1,9,'2020-02-10 19:47:38','2020-05-03 09:33:15'),(6,33,'2020-02-12 19:52:37',1,1,2,'2020-02-12 19:52:37','2020-05-03 09:35:54'),(7,33,'2020-02-12 19:56:10',1,1,2,'2020-02-12 19:56:10','2020-05-03 09:34:24'),(8,11,'2020-02-12 20:12:42',1,1,2,'2020-02-12 20:12:42','2020-05-03 09:34:42'),(29,33,'2020-02-25 11:13:22',1,1,2,'2020-02-25 11:13:22','2020-05-03 09:35:01'),(32,6,'2020-04-20 22:20:30',1,1,2,'2020-04-20 22:20:30','2020-05-03 09:35:21'),(33,3,'2020-04-30 13:55:26',1,1,2,'2020-04-30 13:55:26','2020-05-03 09:35:41'),(34,4,'2020-05-03 09:39:31',1,1,2,'2020-05-03 09:39:31','2020-05-03 09:40:50');
/*!40000 ALTER TABLE `requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `return_lines`
--

DROP TABLE IF EXISTS `return_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `return_lines` (
  `line_id` int(11) NOT NULL AUTO_INCREMENT,
  `return_id` int(11) NOT NULL,
  `size_id` int(11) NOT NULL,
  `stock_id` int(11) NOT NULL,
  `issue_line_id` int(11) NOT NULL,
  `_qty` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`line_id`),
  UNIQUE KEY `line_id_UNIQUE` (`line_id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `return_lines`
--

LOCK TABLES `return_lines` WRITE;
/*!40000 ALTER TABLE `return_lines` DISABLE KEYS */;
INSERT INTO `return_lines` VALUES (1,1,118,72,0,1,0,'2019-12-12 11:42:09','2019-12-12 11:42:09'),(55,15,23,39,25,1,2,'2020-05-17 10:38:21','2020-05-17 10:38:21'),(56,16,4,70,22,1,2,'2020-05-17 10:38:21','2020-05-17 10:38:21'),(57,15,23,39,25,1,2,'2020-05-17 10:39:37','2020-05-17 10:39:37'),(58,15,4,70,22,1,2,'2020-05-17 10:39:37','2020-05-17 10:39:37'),(59,15,23,39,25,1,2,'2020-05-17 11:37:53','2020-05-17 11:37:53'),(60,15,4,70,22,1,2,'2020-05-17 11:37:53','2020-05-17 11:37:53'),(61,15,118,72,19,1,2,'2020-05-17 11:37:53','2020-05-17 11:37:53'),(62,15,23,39,25,1,2,'2020-05-17 11:40:23','2020-05-17 11:40:23'),(63,15,4,70,22,1,2,'2020-05-17 11:40:23','2020-05-17 11:40:23'),(64,15,118,72,19,1,2,'2020-05-17 11:40:23','2020-05-17 11:40:23'),(65,15,23,39,25,1,2,'2020-05-17 11:41:51','2020-05-17 11:41:51'),(66,15,4,70,22,1,2,'2020-05-17 11:41:51','2020-05-17 11:41:51'),(67,15,118,72,19,1,2,'2020-05-17 11:41:51','2020-05-17 11:41:51'),(68,15,23,39,25,1,2,'2020-05-17 11:46:07','2020-05-17 11:46:07'),(69,15,4,70,22,1,2,'2020-05-17 11:46:07','2020-05-17 11:46:07'),(70,15,118,72,19,1,2,'2020-05-17 11:46:07','2020-05-17 11:46:07'),(71,17,231,90,58,1,2,'2020-05-17 11:52:13','2020-05-17 11:52:13'),(72,17,231,90,58,1,2,'2020-05-17 12:27:59','2020-05-17 12:27:59');
/*!40000 ALTER TABLE `return_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `returns`
--

DROP TABLE IF EXISTS `returns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `returns` (
  `return_id` int(11) NOT NULL AUTO_INCREMENT,
  `from` int(11) NOT NULL,
  `_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `_complete` tinyint(4) NOT NULL DEFAULT '0',
  `user_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`return_id`),
  UNIQUE KEY `return_id_UNIQUE` (`return_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `returns`
--

LOCK TABLES `returns` WRITE;
/*!40000 ALTER TABLE `returns` DISABLE KEYS */;
INSERT INTO `returns` VALUES (1,30,'2019-12-12 11:42:09',0,2,'2019-12-12 11:42:09','2019-12-12 11:42:09'),(15,3,'2020-05-17 10:38:21',0,2,'2020-05-17 10:38:21','2020-05-17 10:38:21'),(16,3,'2020-05-17 10:38:21',0,2,'2020-05-17 10:38:21','2020-05-17 10:38:21'),(17,8,'2020-05-17 11:52:13',0,2,'2020-05-17 11:52:13','2020-05-17 11:52:13');
/*!40000 ALTER TABLE `returns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `serials`
--

DROP TABLE IF EXISTS `serials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `serials` (
  `serial_id` int(11) NOT NULL AUTO_INCREMENT,
  `_serial` varchar(45) NOT NULL,
  `size_id` int(11) NOT NULL,
  `location_id` int(11) NOT NULL,
  `issue_line_id` int(11) NOT NULL DEFAULT '-1',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`serial_id`),
  UNIQUE KEY `_serial_UNIQUE` (`_serial`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `serials`
--

LOCK TABLES `serials` WRITE;
/*!40000 ALTER TABLE `serials` DISABLE KEYS */;
INSERT INTO `serials` VALUES (1,'EarDef1',262,5,-1,'2020-02-18 14:18:34','2020-07-20 21:36:44'),(2,'EarDef2',262,5,-1,'2020-02-18 14:18:46','2020-02-18 14:18:46'),(3,'EarDef3',262,5,-1,'2020-02-18 14:18:55','2020-02-18 14:18:55'),(4,'EarDef4',262,5,-1,'2020-02-18 14:19:03','2020-02-18 14:19:03'),(5,'EarDef5',262,5,-1,'2020-02-18 14:19:12','2020-02-18 14:19:12'),(6,'EarDef6',262,5,-1,'2020-02-18 14:19:20','2020-02-18 14:19:20'),(7,'EarDef7',262,5,-1,'2020-02-18 14:19:28','2020-02-18 14:19:28'),(9,'EarDef8',262,5,-1,'2020-02-18 14:19:51','2020-02-18 14:19:51'),(10,'EarDef9',262,5,-1,'2020-02-18 14:20:00','2020-02-18 14:20:00');
/*!40000 ALTER TABLE `serials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `setting_id` int(11) NOT NULL AUTO_INCREMENT,
  `_name` varchar(45) NOT NULL,
  `_value` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `SETTINGS_NAME_UNIQUE` (`_name`),
  UNIQUE KEY `setting_id_UNIQUE` (`setting_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (19,'default_supplier','1','2020-01-01 22:50:15','2020-07-06 08:30:42'),(20,'canteen_session','28','2020-02-13 16:24:58','2020-03-05 16:16:20'),(21,'sale_2','71','2020-02-16 12:46:40','2020-03-26 12:20:23'),(22,'default supplier','-1','2020-06-24 21:56:47','2020-06-24 21:56:47');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sizes`
--

DROP TABLE IF EXISTS `sizes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sizes` (
  `size_id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `_size` varchar(15) NOT NULL,
  `_orderable` tinyint(4) NOT NULL DEFAULT '0',
  `_issueable` tinyint(4) NOT NULL DEFAULT '1',
  `_demand_page` varchar(20) DEFAULT NULL,
  `_demand_cell` varchar(3) DEFAULT NULL,
  `_ordering_details` varchar(1000) DEFAULT NULL,
  `_serials` tinyint(4) NOT NULL DEFAULT '0',
  `_nsns` tinyint(4) NOT NULL DEFAULT '1',
  `nsn_id` int(11) DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`size_id`)
) ENGINE=InnoDB AUTO_INCREMENT=274 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sizes`
--

LOCK TABLES `sizes` WRITE;
/*!40000 ALTER TABLE `sizes` DISABLE KEYS */;
INSERT INTO `sizes` VALUES (1,1,'64/114',1,1,'ATC Dmd Proforma','K33','New Test',0,1,NULL,1,'2020-02-23 09:21:03','2020-07-10 08:35:03'),(2,1,'114/130',1,1,'ATC Dmd Proforma','K34',NULL,0,1,2,1,'2020-02-23 09:21:03','2020-02-23 09:21:03'),(3,4,'Short',1,1,'ATC Dmd Proforma','K37',NULL,0,1,NULL,1,'2020-02-23 09:21:03','2020-02-23 09:21:03'),(4,4,'Long',1,1,'ATC Dmd Proforma','K38',NULL,0,1,NULL,1,'2020-02-23 09:21:03','2020-02-23 09:21:03'),(5,2,'48',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:03','2020-02-23 09:21:03'),(6,2,'49',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(7,2,'50',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(8,2,'51',1,1,'ATC Dmd Proforma','K6',NULL,0,1,NULL,1,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(9,2,'52',1,1,'ATC Dmd Proforma','K7',NULL,0,1,NULL,1,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(10,2,'53',1,1,'ATC Dmd Proforma','K8',NULL,0,1,NULL,1,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(11,2,'54',1,1,'ATC Dmd Proforma','K9',NULL,0,1,NULL,1,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(12,2,'55',1,1,'ATC Dmd Proforma','K10',NULL,0,1,NULL,1,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(13,2,'56',1,1,'ATC Dmd Proforma','K11',NULL,0,1,NULL,1,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(14,2,'57',1,1,'ATC Dmd Proforma','K12',NULL,0,1,NULL,1,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(15,2,'58',1,1,'ATC Dmd Proforma','K13',NULL,0,1,NULL,1,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(16,2,'59',1,1,'ATC Dmd Proforma','K14',NULL,0,1,NULL,1,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(17,2,'60',1,1,'ATC Dmd Proforma','K15',NULL,0,1,NULL,1,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(18,2,'61',1,1,'ATC Dmd Proforma','K16',NULL,0,1,NULL,1,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(19,2,'62',1,1,'ATC Dmd Proforma','K17',NULL,0,1,NULL,1,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(20,6,'74',1,1,'ATC Dmd Proforma','K20',NULL,0,1,20,1,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(21,6,'82',1,1,'ATC Dmd Proforma','K21',NULL,0,1,21,1,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(22,6,'88',1,1,'ATC Dmd Proforma','K22',NULL,0,1,22,1,'2020-02-23 09:21:04','2020-07-22 20:48:35'),(23,6,'94',1,1,'ATC Dmd Proforma','K23',NULL,0,1,23,1,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(24,6,'100',1,1,'ATC Dmd Proforma','K24',NULL,0,1,24,1,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(25,6,'106',1,1,'ATC Dmd Proforma','K25',NULL,0,1,25,1,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(26,6,'112',1,1,'ATC Dmd Proforma','K26',NULL,0,1,26,1,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(27,6,'118',1,1,'ATC Dmd Proforma','K27',NULL,0,1,27,1,'2020-02-23 09:21:04','2020-02-23 09:21:04'),(28,6,'124',1,1,'ATC Dmd Proforma','K28',NULL,0,1,28,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(29,6,'130',1,1,'ATC Dmd Proforma','K29',NULL,0,1,29,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(30,6,'136',1,1,'ATC Dmd Proforma','K30',NULL,0,1,30,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(31,16,'160/88',1,1,'ATC Dmd Proforma','O27',NULL,0,1,31,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(32,16,'170/96',1,1,'ATC Dmd Proforma','O28',NULL,0,1,32,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(33,16,'170/104',1,1,'ATC Dmd Proforma','O29',NULL,0,1,33,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(34,16,'170/112',1,1,'ATC Dmd Proforma','O30',NULL,0,1,34,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(35,16,'180/96',1,1,'ATC Dmd Proforma','O31',NULL,0,1,35,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(36,16,'180/104',1,1,'ATC Dmd Proforma','O32',NULL,0,1,36,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(37,16,'180/112',1,1,'ATC Dmd Proforma','O33',NULL,0,1,37,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(38,16,'190/120',1,1,'ATC Dmd Proforma','O34',NULL,0,1,38,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(39,3,'160/84',1,1,'ATC Dmd Proforma','G68',NULL,0,1,39,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(40,3,'170/92',1,1,'ATC Dmd Proforma','G71',NULL,0,1,40,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(41,3,'170/100',1,1,'ATC Dmd Proforma','G72',NULL,0,1,41,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(42,3,'170/108',1,1,'ATC Dmd Proforma','G73',NULL,0,1,42,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(43,3,'180/92',1,1,'ATC Dmd Proforma','G74',NULL,0,1,43,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(44,3,'180/100',1,1,'ATC Dmd Proforma','G75',NULL,0,1,44,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(45,3,'180/108',1,1,'ATC Dmd Proforma','G76',NULL,0,1,45,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(46,3,'190/100',1,1,'ATC Dmd Proforma','G77',NULL,0,1,46,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(47,3,'190/108',1,1,'ATC Dmd Proforma','G78',NULL,0,1,47,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(48,3,'190/116',1,1,'ATC Dmd Proforma','G79',NULL,0,1,48,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(49,15,'31',1,1,'ATC Dmd Proforma','C37',NULL,0,1,49,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(50,15,'32/34',1,1,'ATC Dmd Proforma','C38',NULL,0,1,50,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(51,15,'35/37',1,1,'ATC Dmd Proforma','C39',NULL,0,1,51,1,'2020-02-23 09:21:05','2020-02-23 09:21:05'),(52,15,'38/40',1,1,'ATC Dmd Proforma','C40',NULL,0,1,52,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(53,15,'41/43',1,1,'ATC Dmd Proforma','C41',NULL,0,1,53,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(54,15,'44/46',1,1,'ATC Dmd Proforma','C42',NULL,0,1,54,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(55,15,'47/48',1,1,'ATC Dmd Proforma','C43',NULL,0,1,55,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(56,14,'31',1,1,'ATC Dmd Proforma','G6',NULL,0,1,56,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(57,14,'32',1,1,'ATC Dmd Proforma','G7',NULL,0,1,57,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(58,14,'33',1,1,'ATC Dmd Proforma','G8',NULL,0,1,58,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(59,14,'34',1,1,'ATC Dmd Proforma','G9',NULL,0,1,59,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(60,14,'35',1,1,'ATC Dmd Proforma','G10',NULL,0,1,60,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(61,14,'36',1,1,'ATC Dmd Proforma','G11',NULL,0,1,61,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(62,14,'37',1,1,'ATC Dmd Proforma','G12',NULL,0,1,62,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(63,14,'38',1,1,'ATC Dmd Proforma','G13',NULL,0,1,63,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(64,14,'39',1,1,'ATC Dmd Proforma','G14',NULL,0,1,64,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(65,14,'40',1,1,'ATC Dmd Proforma','G15',NULL,0,1,65,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(66,14,'41',1,1,'ATC Dmd Proforma','G16',NULL,0,1,66,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(67,14,'42',1,1,'ATC Dmd Proforma','G17',NULL,0,1,67,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(68,14,'43',1,1,'ATC Dmd Proforma','G18',NULL,0,1,68,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(69,14,'44',1,1,'ATC Dmd Proforma','G19',NULL,0,1,69,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(70,14,'45',1,1,'ATC Dmd Proforma','G20',NULL,0,1,70,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(71,14,'46',1,1,'ATC Dmd Proforma','G21',NULL,0,1,71,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(72,14,'47',1,1,'ATC Dmd Proforma','G22',NULL,0,1,72,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(73,14,'48',1,1,'ATC Dmd Proforma','G23',NULL,0,1,73,1,'2020-02-23 09:21:06','2020-02-23 09:21:06'),(74,8,'66/68/76',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:07','2020-02-23 09:21:07'),(75,8,'69/72/84',0,0,'','',NULL,0,1,NULL,1,'2020-02-23 09:21:07','2020-04-28 15:21:38'),(76,8,'72/72/88',1,1,'ATC Dmd Proforma','C6',NULL,0,1,76,1,'2020-02-23 09:21:07','2020-02-23 09:21:07'),(77,8,'72/76/92',1,1,'ATC Dmd Proforma','C7',NULL,0,1,77,1,'2020-02-23 09:21:07','2020-02-23 09:21:07'),(78,8,'72/80/96',1,1,'ATC Dmd Proforma','C8',NULL,0,1,78,1,'2020-02-23 09:21:07','2020-02-23 09:21:07'),(79,8,'72/84/100',1,1,'ATC Dmd Proforma','C9',NULL,0,1,79,1,'2020-02-23 09:21:07','2020-02-23 09:21:07'),(80,8,'72/88/104',1,1,'ATC Dmd Proforma','C10',NULL,0,1,80,1,'2020-02-23 09:21:07','2020-02-23 09:21:07'),(81,8,'75/72/88',1,1,'ATC Dmd Proforma','C11',NULL,0,1,81,1,'2020-02-23 09:21:07','2020-02-23 09:21:07'),(82,8,'75/76/92',1,1,'ATC Dmd Proforma','C12',NULL,0,1,82,1,'2020-02-23 09:21:07','2020-02-23 09:21:07'),(83,8,'75/80/96',1,1,'ATC Dmd Proforma','C13',NULL,0,1,83,1,'2020-02-23 09:21:07','2020-02-23 09:21:07'),(84,8,'75/84/100',1,1,'ATC Dmd Proforma','C14',NULL,0,1,84,1,'2020-02-23 09:21:07','2020-02-23 09:21:07'),(85,8,'75/88/104',1,1,'ATC Dmd Proforma','C15',NULL,0,1,85,1,'2020-02-23 09:21:07','2020-02-23 09:21:07'),(86,8,'75/92/108',1,1,'ATC Dmd Proforma','C16',NULL,0,1,86,1,'2020-02-23 09:21:07','2020-02-23 09:21:07'),(87,8,'80/72/88',1,1,'ATC Dmd Proforma','C17',NULL,0,1,87,1,'2020-02-23 09:21:07','2020-02-23 09:21:07'),(88,8,'80/76/92',1,1,'ATC Dmd Proforma','C18',NULL,0,1,88,1,'2020-02-23 09:21:07','2020-02-23 09:21:07'),(89,8,'80/80/96',1,1,'ATC Dmd Proforma','C19',NULL,0,1,89,1,'2020-02-23 09:21:07','2020-02-23 09:21:07'),(90,8,'80/84/100',1,1,'ATC Dmd Proforma','C20',NULL,0,1,90,1,'2020-02-23 09:21:07','2020-02-23 09:21:07'),(91,8,'80/88/104',1,1,'ATC Dmd Proforma','C21',NULL,0,1,91,1,'2020-02-23 09:21:07','2020-02-23 09:21:07'),(92,8,'80/92/108',1,1,'ATC Dmd Proforma','C22',NULL,0,1,92,1,'2020-02-23 09:21:07','2020-02-23 09:21:07'),(93,8,'80/96/112',1,1,'ATC Dmd Proforma','C23',NULL,0,1,93,1,'2020-02-23 09:21:07','2020-02-23 09:21:07'),(94,8,'80/100/116',1,1,'ATC Dmd Proforma','C24',NULL,0,1,94,1,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(95,8,'80/104/120',1,1,'ATC Dmd Proforma','C25',NULL,0,1,95,1,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(96,8,'85/76/92',1,1,'ATC Dmd Proforma','C26',NULL,0,1,96,1,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(97,8,'85/80/96',1,1,'ATC Dmd Proforma','C27',NULL,0,1,97,1,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(98,8,'85/84/100',1,1,'ATC Dmd Proforma','C28',NULL,0,1,98,1,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(99,8,'85/88/104',1,1,'ATC Dmd Proforma','C29',NULL,0,1,99,1,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(100,8,'85/92/108',1,1,'ATC Dmd Proforma','C30',NULL,0,1,100,1,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(101,8,'85/96/112',1,1,'ATC Dmd Proforma','C31',NULL,0,1,101,1,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(102,8,'85/100/116',1,1,'ATC Dmd Proforma','C32',NULL,0,1,102,1,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(103,8,'85/104/120',1,1,'ATC Dmd Proforma','C33',NULL,0,1,103,1,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(104,8,'85/108/124',1,1,'ATC Dmd Proforma','C34',NULL,0,1,104,1,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(105,22,'33/88',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(106,22,'34/92',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(107,22,'36/96',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(108,22,'36/100',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(109,22,'37/104',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(110,22,'38/108',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(111,22,'39/112',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(112,13,'32/88',1,1,'ATC Dmd Proforma','C50',NULL,0,1,112,1,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(113,13,'33/88',1,1,'ATC Dmd Proforma','C51',NULL,0,1,113,1,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(114,13,'34/88',1,1,'ATC Dmd Proforma','C52',NULL,0,1,114,1,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(115,13,'34/92',1,1,'ATC Dmd Proforma','C53',NULL,0,1,115,1,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(116,13,'35/92',1,1,'ATC Dmd Proforma','C54',NULL,0,1,116,1,'2020-02-23 09:21:08','2020-02-23 09:21:08'),(117,13,'35/96',1,1,'ATC Dmd Proforma','C55',NULL,0,1,117,1,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(118,13,'36/96',1,1,'ATC Dmd Proforma','C56',NULL,0,1,118,1,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(119,13,'36/100',1,1,'ATC Dmd Proforma','C57',NULL,0,1,119,1,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(120,13,'37/100',1,1,'ATC Dmd Proforma','C58',NULL,0,1,120,1,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(121,13,'37/104',1,1,'ATC Dmd Proforma','C59',NULL,0,1,121,1,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(122,13,'38/104',1,1,'ATC Dmd Proforma','C60',NULL,0,1,122,1,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(123,13,'38/108',1,1,'ATC Dmd Proforma','C61',NULL,0,1,123,1,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(124,13,'39/108',1,1,'ATC Dmd Proforma','C62',NULL,0,1,124,1,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(125,13,'39/112',1,1,'ATC Dmd Proforma','C63',NULL,0,1,125,1,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(126,13,'40/112',1,1,'ATC Dmd Proforma','C64',NULL,0,1,126,1,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(127,13,'41/112',1,1,'ATC Dmd Proforma','C65',NULL,0,1,127,1,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(128,7,'67/64/92',1,1,'ATC Dmd Proforma','O50',NULL,0,1,140,1,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(129,7,'67/68/100',0,1,NULL,NULL,NULL,0,1,271,NULL,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(130,7,'67/68/96',1,1,'ATC Dmd Proforma','O51',NULL,0,1,142,1,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(131,7,'67/72/100',1,1,'ATC Dmd Proforma','O52',NULL,0,1,143,1,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(132,7,'67/72/104',0,1,NULL,NULL,NULL,0,1,272,NULL,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(133,7,'67/76/104',1,1,'ATC Dmd Proforma','O53',NULL,0,1,145,1,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(134,7,'67/80/108',1,1,'ATC Dmd Proforma','O54',NULL,0,1,147,1,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(135,7,'67/84/108',1,1,'ATC Dmd Proforma','O55',NULL,0,1,149,1,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(136,7,'67/84/112',0,1,NULL,NULL,NULL,0,1,273,NULL,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(137,7,'67/88/112',1,1,'ATC Dmd Proforma','O56',NULL,0,1,151,1,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(138,7,'67/88/116',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(139,7,'67/92/116',0,1,'ATC Dmd Proforma','O57',NULL,0,1,153,1,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(140,7,'67/92/120',0,1,NULL,NULL,NULL,0,1,274,NULL,'2020-02-23 09:21:09','2020-02-23 09:21:09'),(141,7,'67/96/120',1,1,'ATC Dmd Proforma','O58',NULL,0,1,155,1,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(142,7,'67/96/124',0,1,NULL,NULL,NULL,0,1,156,NULL,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(145,7,'71/64/92',1,1,'ATC Dmd Proforma','O59',NULL,0,1,157,1,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(146,7,'71/68/100',0,1,NULL,NULL,NULL,0,1,159,NULL,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(147,7,'71/68/96',1,1,'ATC Dmd Proforma','O60',NULL,0,1,160,1,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(148,7,'71/72/100',1,1,'ATC Dmd Proforma','O61',NULL,0,1,161,1,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(149,7,'71/72/104',0,1,NULL,NULL,NULL,0,1,275,NULL,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(150,7,'71/76/104',1,1,'ATC Dmd Proforma','O62',NULL,0,1,163,1,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(151,7,'71/80/108',1,1,'ATC Dmd Proforma','O63',NULL,0,1,287,1,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(152,7,'71/84/108',1,1,'ATC Dmd Proforma','O64',NULL,0,1,165,1,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(153,7,'71/84/112',0,1,NULL,NULL,NULL,0,1,166,NULL,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(154,7,'71/88/112',1,1,'ATC Dmd Proforma','O65',NULL,0,1,167,1,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(155,7,'71/88/116',0,1,NULL,NULL,NULL,0,1,168,NULL,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(156,7,'71/92/116',1,1,'ATC Dmd Proforma','O66',NULL,0,1,169,1,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(157,7,'71/92/120',0,1,NULL,NULL,NULL,0,1,170,NULL,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(158,7,'71/96/120',1,1,'ATC Dmd Proforma','O67',NULL,0,1,NULL,1,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(159,7,'71/96/124',0,1,NULL,NULL,NULL,0,1,172,NULL,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(160,7,'75/68/100',0,1,NULL,NULL,NULL,0,1,174,NULL,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(161,7,'75/72/104',0,1,NULL,NULL,NULL,0,1,176,NULL,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(162,7,'75/76/104',1,1,'ATC Dmd Proforma','O72',NULL,0,1,177,1,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(163,7,'75/80/108',1,1,'ATC Dmd Proforma','O73',NULL,0,1,179,1,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(164,7,'75/84/108',1,1,'ATC Dmd Proforma','O74',NULL,0,1,181,1,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(165,7,'75/84/112',0,1,NULL,NULL,NULL,0,1,182,NULL,'2020-02-23 09:21:10','2020-02-23 09:21:10'),(166,7,'75/88/116',0,1,NULL,NULL,NULL,0,1,278,NULL,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(167,7,'75/92/120',0,1,NULL,NULL,NULL,0,1,184,NULL,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(168,7,'75/96/120',1,1,'ATC Dmd Proforma','O77',NULL,0,1,186,1,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(169,7,'75/96/124',0,1,NULL,NULL,NULL,0,1,280,NULL,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(170,7,'75/100/124',1,1,'ATC Dmd Proforma','O78',NULL,0,1,188,1,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(171,7,'75/104/128',1,1,'ATC Dmd Proforma','O79',NULL,0,1,189,1,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(172,10,'72/64/92',1,1,'ATC Dmd Proforma','K50',NULL,0,1,NULL,1,'2020-02-23 09:21:11','2020-05-03 10:34:13'),(173,10,'72/68/96',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(174,10,'72/72/104',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(175,10,'72/76/104',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(176,10,'72/80/108',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(177,10,'72/84/108',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(178,10,'72/88/112',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(179,10,'72/92/120',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(180,10,'72/96/124',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(181,10,'77/64/92',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(182,10,'77/68/96',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(183,10,'77/72/100',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(184,10,'77/76/104',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(185,10,'77/80/108',1,1,'ATC Dmd Proforma','K63',NULL,0,1,NULL,1,'2020-02-23 09:21:11','2020-05-03 10:34:40'),(186,10,'77/84/108',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(187,10,'77/88/112',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(188,10,'77/92/116',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(189,10,'77/96/124',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:11','2020-02-23 09:21:11'),(190,10,'82/68/96',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(191,10,'82/72/100',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(192,10,'82/76/104',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(193,10,'82/80/108',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(194,10,'82/84/108',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(195,10,'82/88/116',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(196,10,'82/92/120',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(197,10,'82/96/120',1,1,'ATC Dmd Proforma','K',NULL,0,1,NULL,1,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(198,5,'One',1,1,NULL,NULL,NULL,0,1,NULL,2,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(199,23,'85/80/96',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(200,23,'85/84/100',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(201,23,'85/88/104',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(202,23,'85/92/108',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(203,23,'85/104/120',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(204,23,'85/96/112',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(205,23,'85/112/108',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(206,23,'75/72/88',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(207,23,'75/76/92',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(208,23,'75/80/96',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(209,23,'75/88/104',0,1,NULL,NULL,NULL,0,1,237,NULL,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(210,23,'80/76/92',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(211,23,'75/84/100',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(212,23,'75/92/108',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(213,23,'80/84/100',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(214,23,'80/88/104',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:12','2020-02-23 09:21:12'),(215,23,'80/80/96',0,1,NULL,NULL,NULL,0,1,243,NULL,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(216,23,'80/92/108',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(217,23,'80/96/112',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(218,24,'160/88',0,1,NULL,NULL,NULL,0,1,216,NULL,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(219,24,'170/88',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(220,24,'180/96',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(221,24,'180/112',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(222,24,'190/96',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(223,24,'180/104',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(224,24,'190/104',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(225,11,'160/88',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(226,5,'Badge, ATC',1,1,NULL,NULL,NULL,0,1,NULL,2,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(227,5,'Badge, 1801',1,1,NULL,NULL,'batches of 70 @ 36p per badge +£3.95 p+p\r\n\r\n70 badges would cost £29.15p\r\n\r\nPayment is up front by either paypal to greenfrogsales@outlook.com\r\nor bacs\r\nsort code 09-01-52\r\na/c no 70568689',0,1,NULL,4,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(228,2,'Badge, Beret',1,1,NULL,NULL,NULL,0,1,NULL,2,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(229,20,'Buckle, Female',0,1,NULL,NULL,NULL,0,1,297,NULL,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(230,20,'Buckle, Male',0,1,NULL,NULL,NULL,0,1,298,NULL,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(231,20,'Retainer',0,1,NULL,NULL,NULL,0,1,296,NULL,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(232,20,'Webbing',0,1,NULL,NULL,NULL,0,1,299,NULL,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(233,30,'Pouch, Utility',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(234,30,'Pouch, Ammo',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(235,30,'Yoke',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(236,30,'Belt',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(237,30,'Complete',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(240,7,'75/88/112',1,1,'ATC Dmd Proforma','O75',NULL,0,1,288,1,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(241,7,'75/92/116',1,1,'ATC Dmd Proforma','O76',NULL,0,1,289,1,'2020-02-23 09:21:13','2020-02-23 09:21:13'),(242,7,'71/100/124',1,1,'ATC Dmd Proforma','O68',NULL,0,1,293,1,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(243,7,'75/72/100',1,1,'ATC Dmd Proforma','O71',NULL,0,1,290,1,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(244,7,'75/68/96',1,1,'ATC Dmd Proforma','O70',NULL,0,1,291,1,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(245,7,'71/104/128',1,1,'ATC Dmd Proforma','O69',NULL,0,1,292,1,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(246,3,'160/92',1,1,'ATC Dmd Proforma','G69',NULL,0,1,294,1,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(247,3,'160/100',1,1,'ATC Dmd Proforma','G70',NULL,0,1,295,1,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(248,2,'Cloth, Turban',0,1,'ATC Dmd Proforma','O37',NULL,0,1,NULL,1,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(249,2,'Badge, Turban',0,1,'ATC Dmd Proforma','O40',NULL,0,1,NULL,1,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(250,33,'Small',0,1,NULL,NULL,NULL,0,1,300,NULL,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(251,34,'7L',0,1,NULL,NULL,NULL,0,1,304,NULL,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(252,34,'9L',0,1,NULL,NULL,NULL,0,1,NULL,NULL,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(253,34,'8M',0,1,NULL,NULL,NULL,0,1,302,NULL,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(254,34,'10L',0,1,NULL,NULL,NULL,0,1,301,NULL,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(255,34,'8L',0,1,NULL,NULL,NULL,0,1,303,NULL,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(256,34,'8.5 M',0,1,NULL,NULL,NULL,0,1,305,1,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(257,34,'8.5 L',0,1,NULL,NULL,NULL,0,1,306,1,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(258,35,'240 L',0,1,NULL,NULL,NULL,0,1,307,NULL,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(259,35,'4',0,1,NULL,NULL,NULL,0,1,309,NULL,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(260,35,'215',0,1,NULL,NULL,NULL,0,1,308,NULL,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(261,35,'Unknown',0,1,NULL,NULL,NULL,0,1,310,NULL,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(262,36,'Ear Defenders',0,1,'','','',1,1,311,1,'2020-02-23 09:21:14','2020-07-09 18:48:09'),(263,23,'90/96/112',0,1,NULL,NULL,NULL,0,1,312,NULL,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(264,36,'L98 Magazines',0,1,NULL,NULL,NULL,0,1,313,NULL,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(265,36,'Cleaning Kit',0,1,NULL,NULL,NULL,0,1,314,NULL,'2020-02-23 09:21:14','2020-02-23 09:21:14'),(273,1,'vgsedrv',0,0,NULL,NULL,NULL,0,0,NULL,NULL,'2020-07-10 08:09:09','2020-07-10 08:09:09');
/*!40000 ALTER TABLE `sizes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `statuses`
--

DROP TABLE IF EXISTS `statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `statuses` (
  `status_id` int(11) NOT NULL AUTO_INCREMENT,
  `_status` varchar(20) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`status_id`),
  UNIQUE KEY `status_id_UNIQUE` (`status_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `statuses`
--

LOCK TABLES `statuses` WRITE;
/*!40000 ALTER TABLE `statuses` DISABLE KEYS */;
INSERT INTO `statuses` VALUES (1,'Current Cadets','2020-01-29 19:53:43','2020-01-29 19:53:43'),(2,'Current Staff','2020-01-29 19:53:43','2020-01-29 19:53:43'),(3,'Suspended','2020-01-29 19:53:43','2020-01-29 19:53:43'),(4,'Discharged','2020-01-29 19:53:43','2020-01-29 19:53:43'),(5,'Admin','2020-01-29 19:53:43','2020-01-29 19:53:43');
/*!40000 ALTER TABLE `statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock`
--

DROP TABLE IF EXISTS `stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock` (
  `stock_id` int(11) NOT NULL AUTO_INCREMENT,
  `size_id` int(11) NOT NULL,
  `location_id` int(11) NOT NULL,
  `_qty` int(11) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`stock_id`),
  UNIQUE KEY `location_id_UNIQUE` (`stock_id`)
) ENGINE=InnoDB AUTO_INCREMENT=154 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock`
--

LOCK TABLES `stock` WRITE;
/*!40000 ALTER TABLE `stock` DISABLE KEYS */;
INSERT INTO `stock` VALUES (4,104,2,1,'2019-10-30 17:44:02','2020-02-18 10:49:03'),(5,100,2,1,'2019-10-30 17:44:38','2020-02-25 21:13:20'),(6,99,2,1,'2019-10-30 17:45:08','2020-02-25 21:12:07'),(7,94,2,1,'2019-10-30 17:48:36','2020-02-18 10:49:03'),(8,92,2,1,'2019-10-30 17:49:18','2020-02-18 10:49:03'),(9,91,2,1,'2019-10-30 17:49:52','2020-02-18 10:49:03'),(10,90,2,1,'2019-10-30 17:50:31','2020-02-18 10:49:03'),(11,88,2,2,'2019-10-30 17:50:53','2020-02-18 10:49:03'),(12,85,2,3,'2019-10-30 17:52:49','2020-02-18 10:49:03'),(13,83,2,3,'2019-10-30 17:53:46','2020-02-18 10:49:03'),(14,82,2,1,'2019-10-30 17:54:17','2020-02-18 10:49:03'),(15,81,2,1,'2019-10-30 17:54:42','2020-02-18 10:49:03'),(16,79,2,1,'2019-10-30 17:56:01','2020-02-18 10:49:03'),(17,78,2,1,'2019-10-30 17:56:24','2020-02-18 10:49:03'),(18,77,2,3,'2019-10-30 17:57:03','2020-02-18 10:49:03'),(19,76,2,3,'2019-10-30 17:57:40','2020-02-18 10:49:03'),(20,167,7,1,'2019-10-30 18:04:17','2020-02-18 13:47:25'),(21,158,7,1,'2019-10-30 18:06:20','2020-02-18 13:47:25'),(22,157,7,1,'2019-10-30 18:07:06','2020-02-18 13:47:25'),(23,156,7,0,'2019-10-30 18:07:39','2020-02-18 13:47:25'),(24,155,7,0,'2019-10-30 18:08:16','2020-02-18 13:47:25'),(25,152,7,0,'2019-10-30 18:08:49','2020-02-18 13:47:25'),(26,151,7,0,'2019-10-30 18:09:43','2020-02-18 13:47:25'),(27,150,7,0,'2019-10-30 18:10:07','2020-02-18 13:47:25'),(28,148,7,2,'2019-10-30 18:14:49','2020-02-18 13:47:25'),(29,139,7,1,'2019-10-30 18:22:03','2020-02-18 13:47:25'),(30,135,7,1,'2019-10-30 18:22:35','2020-02-18 13:47:25'),(31,134,7,1,'2019-10-30 18:22:55','2020-02-18 13:47:25'),(32,133,7,1,'2019-10-30 18:23:18','2020-02-18 13:47:25'),(33,131,7,0,'2019-10-30 18:24:32','2020-02-18 13:47:25'),(34,130,7,1,'2019-10-30 18:25:28','2020-02-18 13:47:25'),(35,128,7,4,'2019-10-30 18:26:50','2020-02-18 13:47:25'),(37,26,8,2,'2019-10-30 18:47:51','2020-02-18 14:06:23'),(38,25,8,5,'2019-10-30 18:48:37','2020-02-18 14:06:23'),(39,23,8,9,'2019-10-30 18:51:32','2020-05-17 11:46:07'),(40,22,8,0,'2019-10-30 18:54:19','2020-02-18 14:06:23'),(41,21,8,-2,'2019-10-30 18:56:03','2020-05-02 14:04:05'),(42,20,8,0,'2019-10-30 18:57:27','2020-02-18 14:06:23'),(43,70,4,1,'2019-10-30 19:00:48','2020-02-18 14:13:06'),(45,62,4,-1,'2019-10-30 19:03:24','2020-05-03 14:40:21'),(46,61,4,7,'2019-10-30 19:08:37','2020-02-18 14:13:06'),(47,60,4,1,'2019-10-30 19:12:42','2020-05-03 13:52:06'),(48,59,4,1,'2019-10-30 19:13:16','2020-05-03 13:52:06'),(49,57,4,3,'2019-10-30 19:14:54','2020-02-18 14:13:06'),(50,56,4,2,'2019-10-30 19:16:01','2020-02-18 14:13:06'),(51,122,9,1,'2019-10-30 19:20:08','2020-02-18 14:14:59'),(52,120,9,1,'2019-10-30 19:20:28','2020-02-18 14:14:59'),(53,117,9,2,'2019-10-30 19:21:31','2020-02-18 14:14:59'),(54,116,9,1,'2019-10-30 19:21:46','2020-02-18 14:14:59'),(55,115,9,1,'2019-10-30 19:22:49','2020-02-18 14:14:59'),(56,114,9,22,'2019-10-30 19:28:32','2020-02-18 14:14:59'),(57,113,9,1,'2019-10-30 19:29:14','2020-02-18 14:14:59'),(58,112,9,1,'2019-10-30 19:29:37','2020-02-18 14:14:59'),(59,18,14,1,'2019-10-30 19:34:20','2020-02-18 15:08:50'),(60,17,14,1,'2019-10-30 19:34:37','2020-02-18 15:08:50'),(61,16,14,3,'2019-10-30 19:35:07','2020-02-18 15:08:50'),(62,15,14,2,'2019-10-30 19:35:26','2020-02-18 15:08:50'),(63,14,14,1,'2019-10-30 19:35:49','2020-04-26 12:10:28'),(64,13,14,1,'2019-10-30 19:36:11','2020-02-18 15:08:50'),(65,12,14,1,'2019-10-30 19:36:27','2020-02-18 15:08:50'),(66,11,14,1,'2019-10-30 19:36:47','2020-04-18 15:38:39'),(67,10,14,4,'2019-10-30 19:37:12','2020-02-18 15:08:50'),(68,9,14,-1,'2019-10-30 19:37:27','2020-04-19 21:37:47'),(69,6,14,4,'2019-10-30 19:37:43','2020-02-18 15:08:50'),(70,4,37,9,'2019-10-30 19:47:21','2020-05-17 11:46:07'),(71,1,38,2,'2019-10-30 19:50:30','2020-05-02 15:05:41'),(72,118,9,4,'2019-10-30 19:53:04','2020-05-17 11:46:07'),(73,63,4,0,'2019-10-30 19:53:49','2020-02-18 14:13:06'),(74,89,2,0,'2019-10-30 19:57:47','2020-02-18 10:49:03'),(75,54,15,1,'2019-10-30 20:07:47','2020-02-18 15:19:01'),(76,53,15,1,'2019-10-30 20:08:44','2020-02-18 15:19:01'),(77,52,15,3,'2019-10-30 20:09:06','2020-02-18 15:19:00'),(78,51,15,7,'2019-10-30 20:09:22','2020-02-18 15:19:00'),(79,50,15,0,'2019-10-30 20:09:43','2020-04-26 12:10:28'),(80,198,36,15,'2019-10-30 20:28:59','2020-04-26 09:38:42'),(81,226,31,18,'2019-10-30 20:34:35','2020-04-26 14:12:12'),(82,227,31,66,'2019-10-30 20:37:15','2020-05-02 15:02:38'),(83,228,34,15,'2019-10-30 20:39:36','2020-02-26 09:48:51'),(85,19,14,0,'2019-11-06 20:33:02','2020-02-18 15:08:50'),(88,219,23,0,'2020-01-27 18:09:36','2020-02-19 00:13:21'),(90,231,35,21,'2020-01-27 21:01:46','2020-05-17 12:27:59'),(91,229,35,16,'2020-01-27 21:02:14','2020-02-18 13:57:12'),(92,230,35,113,'2020-01-27 21:02:43','2020-02-18 13:57:12'),(93,232,41,0,'2020-01-27 21:03:59','2020-02-19 00:11:02'),(94,218,23,0,'2020-01-27 21:04:52','2020-02-19 00:13:21'),(97,49,15,0,'2020-01-27 21:20:28','2020-02-18 15:19:00'),(98,58,4,0,'2020-01-27 21:23:10','2020-02-18 14:13:06'),(99,87,2,1,'2020-01-27 21:25:22','2020-02-18 10:49:03'),(100,220,23,0,'2020-01-29 17:58:38','2020-01-29 17:58:38'),(103,250,19,0,'2020-01-29 18:07:35','2020-02-25 21:09:17'),(105,96,2,1,'2020-02-18 10:42:49','2020-02-18 10:49:03'),(106,254,1,1,'2020-02-18 10:56:52','2020-02-18 11:01:40'),(107,253,1,2,'2020-02-18 10:57:35','2020-02-18 11:01:40'),(108,255,1,2,'2020-02-18 10:58:34','2020-02-18 11:01:40'),(109,251,1,1,'2020-02-18 10:59:52','2020-02-18 11:01:40'),(110,256,1,1,'2020-02-18 11:15:13','2020-02-18 11:16:44'),(111,257,1,1,'2020-02-18 11:16:13','2020-02-18 11:16:44'),(112,258,6,2,'2020-02-18 11:22:33','2020-02-18 11:23:27'),(113,260,6,1,'2020-02-18 11:24:15','2020-02-18 11:24:24'),(114,259,6,1,'2020-02-18 11:25:33','2020-02-18 11:41:49'),(115,261,6,1,'2020-02-18 11:42:49','2020-02-18 11:43:04'),(116,146,7,0,'2020-02-18 14:01:59','2020-02-18 14:01:59'),(117,24,8,1,'2020-02-18 14:04:56','2020-02-18 14:05:07'),(118,22,3,6,'2020-02-18 14:07:28','2020-02-18 14:09:44'),(119,21,3,4,'2020-02-18 14:07:44','2020-02-18 14:09:44'),(120,20,3,1,'2020-02-18 14:08:00','2020-02-18 14:09:44'),(121,262,10,9,'2020-02-18 14:17:55','2020-02-18 14:18:13'),(123,212,12,3,'2020-02-18 14:31:10','2020-02-18 14:31:26'),(124,209,12,3,'2020-02-18 14:33:30','2020-02-18 14:33:53'),(125,211,12,1,'2020-02-18 14:35:38','2020-02-18 14:35:49'),(126,217,17,3,'2020-02-18 14:40:01','2020-02-18 14:40:39'),(127,216,17,6,'2020-02-18 14:41:53','2020-02-18 14:42:05'),(128,214,17,1,'2020-02-18 14:42:26','2020-02-18 14:42:55'),(129,213,17,2,'2020-02-18 14:43:19','2020-02-18 14:43:44'),(130,215,17,0,'2020-02-18 14:44:04','2020-02-18 14:44:04'),(131,210,17,3,'2020-02-18 14:44:20','2020-02-18 14:45:03'),(132,208,12,0,'2020-02-18 14:45:38','2020-02-18 14:45:38'),(133,207,12,0,'2020-02-18 14:45:51','2020-02-18 14:45:51'),(134,206,12,0,'2020-02-18 14:46:08','2020-02-18 14:46:08'),(135,203,11,0,'2020-02-18 14:50:19','2020-02-18 14:50:19'),(136,205,11,2,'2020-02-18 14:50:34','2020-02-18 14:50:57'),(137,204,11,5,'2020-02-18 14:51:27','2020-02-18 14:51:57'),(138,202,11,4,'2020-02-18 14:52:17','2020-02-18 14:52:30'),(139,201,11,0,'2020-02-18 14:52:52','2020-02-18 14:52:52'),(140,200,11,4,'2020-02-18 14:53:10','2020-02-18 14:53:26'),(141,199,11,1,'2020-02-18 14:53:55','2020-02-18 14:54:05'),(142,263,16,1,'2020-02-18 15:05:11','2020-02-18 15:05:21'),(143,55,15,0,'2020-02-18 15:17:27','2020-02-18 15:19:01'),(144,38,30,2,'2020-02-18 15:23:13','2020-02-18 15:23:29'),(145,37,30,2,'2020-02-18 15:23:52','2020-02-18 15:24:06'),(146,36,30,4,'2020-02-18 15:24:21','2020-02-18 15:25:24'),(147,35,30,3,'2020-02-18 15:25:47','2020-02-18 15:26:29'),(148,34,30,4,'2020-02-18 15:27:21','2020-02-18 15:27:42'),(149,33,30,3,'2020-02-18 15:29:27','2020-04-28 21:14:03'),(150,32,25,4,'2020-02-18 15:31:21','2020-02-18 15:33:36'),(151,31,25,8,'2020-02-18 15:34:58','2020-04-26 14:11:18'),(152,264,5,5,'2020-02-18 15:44:40','2020-02-18 15:44:53'),(153,265,5,2,'2020-02-18 15:45:14','2020-02-18 15:45:23');
/*!40000 ALTER TABLE `stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subtypes`
--

DROP TABLE IF EXISTS `subtypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subtypes` (
  `subtype_id` int(11) NOT NULL AUTO_INCREMENT,
  `type_id` int(11) NOT NULL,
  `_subtype` varchar(20) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`subtype_id`),
  UNIQUE KEY `subtype_id_UNIQUE` (`subtype_id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subtypes`
--

LOCK TABLES `subtypes` WRITE;
/*!40000 ALTER TABLE `subtypes` DISABLE KEYS */;
INSERT INTO `subtypes` VALUES (47,40,'Foam','2019-12-02 12:51:36','2019-12-02 12:51:36'),(48,40,'Inflatable','2019-12-02 12:51:48','2019-12-02 12:51:48'),(49,47,'PCS','2019-12-05 23:30:53','2019-12-05 23:30:53'),(50,47,'S95','2019-12-05 23:31:07','2019-12-05 23:31:07'),(51,48,'PCS','2019-12-05 23:31:15','2019-12-05 23:31:15'),(52,48,'S95','2019-12-05 23:31:22','2019-12-05 23:31:22'),(53,49,'PCS','2019-12-05 23:31:31','2019-12-05 23:31:31'),(54,49,'S95','2019-12-05 23:31:39','2019-12-05 23:31:39'),(55,50,'PCS','2019-12-05 23:31:49','2019-12-05 23:31:49'),(56,50,'S95','2019-12-05 23:31:57','2019-12-05 23:31:57');
/*!40000 ALTER TABLE `subtypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `suppliers` (
  `supplier_id` int(11) NOT NULL AUTO_INCREMENT,
  `_name` varchar(20) NOT NULL,
  `_address1` varchar(45) DEFAULT NULL,
  `_address2` varchar(45) DEFAULT NULL,
  `_address3` varchar(45) DEFAULT NULL,
  `_address4` varchar(45) DEFAULT NULL,
  `_address5` varchar(45) DEFAULT NULL,
  `_telephone` varchar(20) DEFAULT NULL,
  `_email` varchar(255) DEFAULT NULL,
  `_stores` tinyint(4) NOT NULL DEFAULT '0',
  `account_id` int(11) DEFAULT NULL,
  `file_id` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`supplier_id`),
  UNIQUE KEY `SUPPLIERID_UNIQUE` (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'Parent Stores','RAF Boulmer','Alnwick','Northumberland','NE66 3JF','','01665 607448','Steve.Williams144@mod.gov.uk',1,1,9,'2019-11-06 20:06:35','2020-07-07 08:21:03'),(2,'Wing HQ','Durham & Northumberland Wing ATC','RFCA Centre','Gosforth','Newcastle-upon-Tyne','NE2 3JJ','0191 213 1919','media.dnl@aircadets.org',0,NULL,NULL,'2019-11-06 20:06:35','2019-11-06 20:06:35'),(4,'Green Frog Promotion','Unit 2 (First Floor)','15 Station Street','Whetstone','Leicestershire','LE8 6JS','07733 260598','sales@greenfrogpromotions.co.uk',0,NULL,NULL,'2019-11-06 20:06:35','2019-11-06 20:06:35'),(27,'Test','Test',NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2020-07-06 16:04:52','2020-07-06 16:04:52');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `types`
--

DROP TABLE IF EXISTS `types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `types` (
  `type_id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `_type` varchar(20) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`type_id`),
  UNIQUE KEY `combo_id_UNIQUE` (`type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `types`
--

LOCK TABLES `types` WRITE;
/*!40000 ALTER TABLE `types` DISABLE KEYS */;
INSERT INTO `types` VALUES (1,1,'Ancilliaries','2020-02-23 09:58:51','2020-02-23 09:58:51'),(4,1,'Shoes','2020-02-23 09:58:51','2020-02-23 09:58:51'),(5,1,'Shirts','2020-02-23 09:58:51','2020-02-23 09:58:51'),(6,1,'Skirts','2020-02-23 09:58:51','2020-02-23 09:58:51'),(7,1,'Jumpers','2020-02-23 09:58:51','2020-02-23 09:58:51'),(8,1,'Trousers','2020-02-23 09:58:51','2020-02-23 09:58:51'),(9,1,'Foul Weather','2020-02-23 09:58:51','2020-02-23 09:58:51'),(16,1,'Slacks','2020-02-23 09:58:51','2020-02-23 09:58:51'),(17,2,'Boots','2020-02-23 09:58:51','2020-02-23 09:58:51'),(18,1,'Other','2020-02-23 09:58:51','2020-02-23 09:58:51'),(19,2,'Other','2020-02-23 09:58:51','2020-02-23 09:58:51'),(21,4,'Other','2020-02-23 09:58:51','2020-02-23 09:58:51'),(23,6,'Other','2020-02-23 09:58:51','2020-02-23 09:58:51'),(24,7,'Other','2020-02-23 09:58:51','2020-02-23 09:58:51'),(25,8,'Other','2020-02-23 09:58:51','2020-02-23 09:58:51'),(32,13,'Pouch','2020-02-23 09:58:51','2020-02-23 09:58:51'),(33,13,'Yolk','2020-02-23 09:58:51','2020-02-23 09:58:51'),(34,13,'Belt','2020-02-23 09:58:51','2020-02-23 09:58:51'),(35,6,'Bergen','2020-02-23 09:58:52','2020-02-23 09:58:52'),(36,6,'Civilian','2020-02-23 09:58:52','2020-02-23 09:58:52'),(37,7,'Stove','2020-02-23 09:58:52','2020-02-23 09:58:52'),(38,7,'Gas','2020-02-23 09:58:52','2020-02-23 09:58:52'),(39,8,'Sleeping Bag','2020-02-23 09:58:52','2020-02-23 09:58:52'),(40,8,'Mat','2020-02-23 09:58:52','2020-02-23 09:58:52'),(41,8,'Liner','2020-02-23 09:58:52','2020-02-23 09:58:52'),(42,14,'2 Man','2020-02-23 09:58:52','2020-02-23 09:58:52'),(43,14,'3 Man','2020-02-23 09:58:52','2020-02-23 09:58:52'),(44,4,'Trousers','2020-02-23 09:58:52','2020-02-23 09:58:52'),(45,4,'Jackets','2020-02-23 09:58:52','2020-02-23 09:58:52'),(46,16,'Berets','2020-02-23 09:58:52','2020-02-23 09:58:52'),(47,2,'Trousers','2020-02-23 09:58:52','2020-02-23 09:58:52'),(48,2,'Jackets','2020-02-23 09:58:52','2020-02-23 09:58:52'),(49,2,'Smocks','2020-02-23 09:58:52','2020-02-23 09:58:52'),(50,2,'Waterproofs','2020-02-23 09:58:52','2020-02-23 09:58:52');
/*!40000 ALTER TABLE `types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `_bader` varchar(20) NOT NULL,
  `_name` varchar(50) NOT NULL,
  `_ini` varchar(5) DEFAULT NULL,
  `full_name` varchar(57) GENERATED ALWAYS AS (concat(`_name`,', ',`_ini`)) VIRTUAL,
  `rank_id` int(11) DEFAULT NULL,
  `status_id` int(11) NOT NULL DEFAULT '1',
  `_login_id` varchar(30) NOT NULL,
  `_password` varchar(512) NOT NULL,
  `_salt` varchar(255) NOT NULL,
  `_reset` tinyint(4) NOT NULL DEFAULT '1',
  `_last_login` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_id_UNIQUE` (`user_id`,`_bader`,`_login_id`),
  UNIQUE KEY `_bader_UNIQUE` (`_bader`),
  UNIQUE KEY `_login_id_UNIQUE` (`_login_id`),
  KEY `_rank` (`rank_id`),
  KEY `_status` (`status_id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`user_id`, `_bader`, `_name`, `_ini`, `rank_id`, `status_id`, `_login_id`, `_password`, `_salt`, `_reset`, `_last_login`, `createdAt`, `updatedAt`) VALUES (1,'admin','Administrator','',13,5,'admin','$2b$10$ZI5hx9zS/9DFEau3eGPC1uzYjVgVUs/wj8nO3KGRmSO1dFNQq0qRi','$2b$10$ZI5hx9zS/9DFEau3eGPC1u',0,'2016-10-31 00:00:00','2019-10-30 17:16:06','2019-10-30 17:16:06'),(2,'30215564','Davis','I',17,2,'30215564','2425e38f7e2ac5afcdad566ba23ac0eb0880ffd397069ba7e1415b59b26e28da9fc97462e76e702d1a6dfd97910511e2bbd2d46ff90e3abdef4161e519af2ab040b664e7ccdbfd244dda2907980a42b23b9e62f9d48909ddfe186bd9725c01fbd41f82d47e2def7f1d2a427a9ef308eb90384e00ede5681ca550632cf88e4b29','$2b$10$VtQAkp4KP2YCxFQ.Nhdm3e',0,NULL,'2019-10-30 17:16:06','2019-11-04 20:03:33'),(3,'1311720016002','Anitche','SM',2,1,'1311720016002','$2b$10$1/IRODb9umQjGeC5hiheD.dy1uke.GKmTUAZTVMZ8kJQxmVs6pAwe','$2b$10$1/IRODb9umQjGeC5hiheD.',0,NULL,'2019-10-30 17:16:06','2020-04-20 20:58:29'),(4,'1311720016028','Anitche','C',3,1,'1311720016028','$2b$10$fyZOkbB1jQO2xI/Kx1SUsOLTrH4Ei4T7ZclSHwHFxLaR2tyJxppJa','$2b$10$fyZOkbB1jQO2xI/Kx1SUsO',0,NULL,'2019-10-30 17:16:58','2020-05-03 16:03:38'),(5,'2118010019007','Bainbridge','J',1,1,'2118010019007','$2b$10$tYAitx4.6soKS8cxFJp/ae/AP6a0mCEKf23PdCI1PK9vaFI4qKwcG','$2b$10$tYAitx4.6soKS8cxFJp/ae',1,NULL,'2019-10-30 17:17:49','2019-10-30 17:17:49'),(6,'2118010015006','Browell','I',2,1,'2118010015006','$2b$10$IrYBVSqvMIEB/OCKguuXaePvHuVA5R5QQ1ktK/sHdoloLSvmUq5je','$2b$10$IrYBVSqvMIEB/OCKguuXae',1,NULL,'2019-10-30 17:18:27','2019-12-16 19:48:34'),(7,'2118010017007','Brown','T',1,1,'2118010017007','$2b$10$WW4hliZoHauYEx.7wwyGD.PNu6k1XWQ7pWfQjWak2fTi4E.boJGlK','$2b$10$WW4hliZoHauYEx.7wwyGD.',1,NULL,'2019-10-30 17:19:07','2019-10-30 17:19:07'),(8,'2118010018005','Carnegie','GA',1,1,'2118010018005','$2b$10$cNuOkCsspNiDXUIddzigAuoRzi5W6wIl4Xz7ry9eMxXCSZkF8ApH6','$2b$10$cNuOkCsspNiDXUIddzigAu',1,NULL,'2019-10-30 17:19:49','2019-10-30 17:19:49'),(9,'2118010016017','Cheesmer','T',4,1,'2118010016017','$2b$10$JMtcYf6xPDaOK49/oJeVC.IZ7SlddXJXLABOwss6owoqxJTtQ/L1y','$2b$10$JMtcYf6xPDaOK49/oJeVC.',0,NULL,'2019-10-30 17:20:24','2020-02-23 11:54:23'),(10,'2118010019005','Clayton','B',1,1,'2118010019005','$2b$10$x6TSdh.mYZtKtxZhR6dp1eo/Eh5MOYW46YZoexzqZNa2ldN3DzMf2','$2b$10$x6TSdh.mYZtKtxZhR6dp1e',0,NULL,'2019-10-30 17:20:55','2020-02-10 19:18:19'),(11,'2118010018009','Davison','G',1,1,'2118010018009','$2b$10$gocrukTPd3PR/sD4F.3b7.zUIvSsOzYzypVVipd/sELRktaVBZ7su','$2b$10$gocrukTPd3PR/sD4F.3b7.',0,NULL,'2019-10-30 17:21:39','2019-11-25 20:22:32'),(12,'2118010018001','Dunn','S',1,1,'2118010018001','$2b$10$mA4ZR49knTOJDC5xn3kBouUj7V73Xus1V1ZK3cdpBJI3/YXu.3zTK','$2b$10$mA4ZR49knTOJDC5xn3kBou',1,NULL,'2019-10-30 17:22:15','2019-10-30 17:22:15'),(13,'2118010019006','Field','T',1,1,'2118010019006','$2b$10$DIyKl5cuI5llAj8PY60wK.ED2sIGE74lwvPHlSPIQcTfgeGh00g1u','$2b$10$DIyKl5cuI5llAj8PY60wK.',1,NULL,'2019-10-30 17:22:48','2019-10-30 17:22:48'),(14,'2118010018006','Gardner','A',1,1,'2118010018006','$2b$10$MO8OAj1rQPYFhi6h7m60LeTTy9wOY/m/Yfl46sdzSzLDbDC3pAxpC','$2b$10$MO8OAj1rQPYFhi6h7m60Le',0,NULL,'2019-10-30 17:24:59','2019-11-25 19:11:47'),(15,'2118010019008','Gladstone','T',1,1,'2118010019008','$2b$10$YKnTqBjboNqKrAs5q4vd8ur2PUjhhJV5ZGHuAcK1ol2O70ztmxfyK','$2b$10$YKnTqBjboNqKrAs5q4vd8u',1,NULL,'2019-10-30 17:25:22','2019-10-30 17:25:22'),(16,'2118010018007','Mitchell','D',1,1,'2118010018007','$2b$10$tMWN7zaoCPpsLxHkxTsxoOrINnB.H1N4nZ6Wm8DaHyeLfzX7CRGXK','$2b$10$tMWN7zaoCPpsLxHkxTsxoO',1,NULL,'2019-10-30 17:26:00','2019-10-30 17:26:00'),(17,'2118010016010','Mitchell','A',14,1,'2118010016010','$2b$10$lidf7py38gF32kdM91SrJOgVx9iIFUsHT3cRFlPcYde58nLLXgfJm','$2b$10$lidf7py38gF32kdM91SrJO',1,NULL,'2019-10-30 17:26:27','2019-11-12 20:36:10'),(18,'2118010019003','Scollick','D',1,1,'2118010019003','$2b$10$S9583cQZrffNuw9oYK8xbu5ZGX/ML3NBF0Pot/NfL5zY786WYtPAq','$2b$10$S9583cQZrffNuw9oYK8xbu',1,NULL,'2019-10-30 17:27:48','2019-10-30 17:27:48'),(19,'2118010019009','Scott','J',1,1,'2118010019009','$2b$10$pN1uYZF6xNxgd/SAhaLv4.kMNiSF9yIsMxqnRYqdTrZbtBuSlDfza','$2b$10$pN1uYZF6xNxgd/SAhaLv4.',1,NULL,'2019-10-30 17:28:09','2019-10-30 17:28:09'),(20,'2118010016007','Slater','B',1,1,'2118010016007','$2b$10$76N6e4KmIZq/kBpr/pn3Gu0HxIGtOfjcwte6SfN7UU5OvCE3a/bTG','$2b$10$76N6e4KmIZq/kBpr/pn3Gu',0,NULL,'2019-10-30 17:28:33','2020-02-23 12:48:20'),(21,'2118010018008','Smith','J',1,1,'2118010018008','$2b$10$8qkaIluUP8iMbAQNzpUV2eOg5YSj2lCuJjwrPkbzjOkjwsjtyR2VG','$2b$10$8qkaIluUP8iMbAQNzpUV2e',1,NULL,'2019-10-30 17:28:59','2019-10-30 17:28:59'),(22,'2118010019002','Smith','CA',1,1,'2118010019002','$2b$10$7nY2BnEwZvHF4f25IlMoUuuSQ4s46tZhXTK3UJUNo1ex/GIBOWdRC','$2b$10$7nY2BnEwZvHF4f25IlMoUu',1,NULL,'2019-10-30 17:29:19','2019-10-30 17:29:19'),(23,'2118010017004','Taylor','J',1,1,'2118010017004','$2b$10$L8i0AQ1MF11ATaCaMoC2XOje/Bxj4YMfZwg2LsVIJq9oP9Qhc/QT.','$2b$10$L8i0AQ1MF11ATaCaMoC2XO',1,NULL,'2019-10-30 17:29:48','2019-10-30 17:29:48'),(24,'2118010016020','Taylor','H',2,1,'2118010016020','$2b$10$SmE9cmjAF8ZF51XPDMxCl.cvBlKhLumX2I1s8kX.LZjc06xSGzpfm','$2b$10$SmE9cmjAF8ZF51XPDMxCl.',0,NULL,'2019-10-30 17:30:09','2020-02-23 11:56:00'),(25,'2118010013002','Wallace','C',5,1,'2118010013002','$2b$10$OwvF/oxJpSdIFZxa6/uHNeqVcUkO1Thr30dZJi1KxgcCJsDnmxo5.','$2b$10$OwvF/oxJpSdIFZxa6/uHNe',0,NULL,'2019-10-30 17:30:37','2020-02-23 11:55:00'),(26,'00230892','Buxton','C',14,2,'00230892','$2b$10$5gUOIUf2y5s7g2Ty6ytxquBL0DNZZG5QKaeAmpKNd95pnrAtpxQBC','$2b$10$5gUOIUf2y5s7g2Ty6ytxqu',1,NULL,'2019-10-30 17:31:27','2019-10-30 17:31:27'),(27,'00234643','Cheesmer','T',14,2,'00234643','$2b$10$NBysUTi/HPG6lDcNPjTjEuZWttJqMs1.72jPrQpeskrN5abzyRFpu','$2b$10$NBysUTi/HPG6lDcNPjTjEu',1,NULL,'2019-10-30 17:31:51','2019-10-30 17:31:51'),(28,'00228365','Don','A',14,2,'00228365','$2b$10$xEa2/r2pq62szJedZXr2p.o60saUmy44OFv7zQczet5LPZFDZq3KW','$2b$10$xEa2/r2pq62szJedZXr2p.',1,NULL,'2019-10-30 17:32:15','2019-10-30 17:32:15'),(29,'30109073','Haslam','D',12,2,'30109073','$2b$10$RZG7O1h/edeIi0AyHToHc.ovfBXI9BSMmUZP/1PT262jB8a86.5rq','$2b$10$RZG7O1h/edeIi0AyHToHc.',1,NULL,'2019-10-30 17:32:46','2019-10-30 17:32:46'),(30,'K2698351','McGrail','R',7,2,'K2698351','$2b$10$VUdItawKbDSHqwUBSi5MhOvROO5Rn9NzQblXNg8U1Dbu8GLv5ZW5m','$2b$10$VUdItawKbDSHqwUBSi5MhO',0,NULL,'2019-10-30 17:33:12','2019-11-06 20:17:32'),(31,'00232281','Wallace','M',14,2,'00232281','$2b$10$DZP49XnIyXbPYl46m2jop.cjB/KBCWAFHN2MLUVQxTUGiLQpnpMdm','$2b$10$DZP49XnIyXbPYl46m2jop.',1,NULL,'2019-10-30 17:33:39','2019-10-30 17:33:39'),(32,'R8438857','Brown','M',3,2,'BrownM914','$2b$10$az0k/iH3u/9HCptp5IIo/.m86ISRlT5/tK997uxPrMKFUo5q1zBXO','$2b$10$az0k/iH3u/9HCptp5IIo/.',0,NULL,'2020-01-29 19:03:47','2020-01-29 19:33:47'),(33,'2118010020001','Bell','K',1,1,'2118010020001','$2b$10$z9kVv75unBIJm9mITh7Yyel/v0ySDdjks.tmNFa419XMpgdlJIQ/6','$2b$10$z9kVv75unBIJm9mITh7Yye',0,NULL,'2020-02-10 20:43:31','2020-02-10 20:43:31');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-07-31 13:12:56
