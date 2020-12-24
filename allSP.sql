-- MySQL dump 10.13  Distrib 5.7.31, for Linux (x86_64)
--
-- Host: %    Database: fasp
-- ------------------------------------------------------
-- Server version	5.7.31-0ubuntu0.18.04.1

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
-- Dumping routines for database 'fasp'
--
/*!50003 DROP PROCEDURE IF EXISTS `aggregateShipmentByProduct` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `aggregateShipmentByProduct`(VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_PROGRAM_ID INT, VAR_VERSION_ID INT, VAR_PLANNING_UNIT_IDS VARCHAR(200), VAR_INCLUDE_PLANNED_SHIPMENTS TINYINT)
BEGIN
	
    -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	-- Report no 24 
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
    -- programId must be a single Program cannot be muti-program select or -1 for all programs
    -- versionId must be the actual version that you want to refer to for this report or -1 in which case it will automatically take the latest version (not approved or final just latest)
    -- report will be run using startDate and stopDate based on Delivered Date or Expected Delivery Date
    -- planningUnitIds is provided as a list of planningUnitId's or empty for all
    -- includePlannedShipments = 1 means only Approve, Shipped, Arrived, Delivered statuses will be included in the report
    -- includePlannedShipments = 0 means the report will include all shipments that are Active and not Cancelled
    -- FreightCost and ProductCost are converted to USD
    -- FreightPerc is in SUM(FREIGHT_COST)/SUM(PRODUCT_COST) for that ProcurementAgent and that PlanningUnit
    
    SET @programId = VAR_PROGRAM_ID;
	SET @versionId = VAR_VERSION_ID;
    IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) INTO @versionId FROM rm_program_version pv WHERE pv.PROGRAM_ID=@programId;
	END IF;
	SET @startDate = CONCAT(VAR_START_DATE,' 00:00:00');
	SET @stopDate = CONCAT(VAR_STOP_DATE, ' 23:59:59');
	SET @includePlannedShipments = VAR_INCLUDE_PLANNED_SHIPMENTS;

	SET @sqlString = "";
    SET @sqlString = CONCAT(@sqlString,"SELECT ");
	SET @sqlString = CONCAT(@sqlString,"	pu.PLANNING_UNIT_ID, pu.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pu.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pu.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pu.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pu.LABEL_PR `PLANNING_UNIT_LABEL_PR`, ");
	SET @sqlString = CONCAT(@sqlString,"	SUM(st.SHIPMENT_QTY) QTY, SUM(st.PRODUCT_COST*s.CONVERSION_RATE_TO_USD) `PRODUCT_COST`, SUM(st.FREIGHT_COST*s.CONVERSION_RATE_TO_USD) `FREIGHT_COST`, SUM(st.FREIGHT_COST*s.CONVERSION_RATE_TO_USD)/SUM(st.PRODUCT_COST*s.CONVERSION_RATE_TO_USD)*100 `FREIGHT_PERC` ");
	SET @sqlString = CONCAT(@sqlString,"FROM ");
	SET @sqlString = CONCAT(@sqlString,"	(");
	SET @sqlString = CONCAT(@sqlString,"	SELECT ");
	SET @sqlString = CONCAT(@sqlString,"		s.PROGRAM_ID, s.SHIPMENT_ID, s.CONVERSION_RATE_TO_USD, MAX(st.VERSION_ID) MAX_VERSION_ID ");
	SET @sqlString = CONCAT(@sqlString,"	FROM rm_shipment s ");
	SET @sqlString = CONCAT(@sqlString,"	LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID ");
	SET @sqlString = CONCAT(@sqlString,"	WHERE ");
	SET @sqlString = CONCAT(@sqlString,"		s.PROGRAM_ID=@programId ");
	SET @sqlString = CONCAT(@sqlString,"		AND st.VERSION_ID<=@versionId ");
	SET @sqlString = CONCAT(@sqlString,"		AND st.SHIPMENT_TRANS_ID IS NOT NULL ");
	SET @sqlString = CONCAT(@sqlString,"	GROUP BY s.SHIPMENT_ID ");
	SET @sqlString = CONCAT(@sqlString,") AS s ");
	SET @sqlString = CONCAT(@sqlString,"LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND s.MAX_VERSION_ID=st.VERSION_ID ");
	SET @sqlString = CONCAT(@sqlString,"LEFT JOIN vw_planning_unit pu ON st.PLANNING_UNIT_ID = pu.PLANNING_UNIT_ID ");
	SET @sqlString = CONCAT(@sqlString,"WHERE ");
	SET @sqlString = CONCAT(@sqlString,"	st.ACTIVE ");
    SET @sqlString = CONCAT(@sqlString,"	AND st.SHIPMENT_STATUS_ID != 8 ");
	SET @sqlString = CONCAT(@sqlString,"	AND ((@includePlannedShipments=0 && st.SHIPMENT_STATUS_ID in (4,5,6,7)) OR @includePlannedShipments=1) ");
	SET @sqlString = CONCAT(@sqlString,"	AND COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) BETWEEN @startDate AND @stopDate ");
    IF LENGTH(VAR_PLANNING_UNIT_IDS)>0 THEN 
		SET @sqlString = CONCAT(@sqlString,"	AND (st.PLANNING_UNIT_ID IN (",VAR_PLANNING_UNIT_IDS,")) ");
	END IF;
	SET @sqlString = CONCAT(@sqlString,"GROUP BY st.PLANNING_UNIT_ID");
    
    PREPARE s1 FROM @sqlString;
    EXECUTE s1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `annualShipmentCost` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `annualShipmentCost`(PROGRAM_ID INT, VERSION_ID INT, PROCUREMENT_AGENT_ID INT, PLANNING_UNIT_ID INT, FUNDING_SOURCE_ID INT, SHIPMENT_STATUS_ID INT, START_DATE DATE, STOP_DATE DATE, REPORT_BASED_ON INT)
BEGIN

	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	-- Report no 22 
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
	-- programId must be a single Program cannot be muti-program select or -1 for all programs
    -- versionId must be the actual version that you want to refer to for this report or -1 in which case it will automatically take the latest version (not approved or final just latest)
    -- reportBasedOn = 1 means the report will be run using startDate and stopDate based on Shipped Date
    -- reportBasedOn = 2 means the report will be run using startDate and stopDate based on Delivered date if available or Expected Delivery Date
    -- If ProcurementAgent has not been selected as yet in the Shipment, that Shipment will be excluded
    -- 
    -- 
	SET @programId = PROGRAM_ID;
	SET @procurementAgentId = PROCUREMENT_AGENT_ID;
	SET @planningUnitId = PLANNING_UNIT_ID;
	SET @fundingSourceId = FUNDING_SOURCE_ID;
	SET @shipmentStatusId = SHIPMENT_STATUS_ID;
	SET @startDate = CONCAT(START_DATE, ' 00:00:00');
	SET @stopDate = CONCAT(STOP_DATE, ' 23:59:59');
	SET @reportBasedOn=REPORT_BASED_ON; -- 1 = Shipped and 2 = RECEIVED
    SET @versionId = VERSION_ID;
    DROP TABLE IF EXISTS `tmp_year`;
	CREATE TABLE `tmp_year` (`YR` INT(10) UNSIGNED NOT NULL,PRIMARY KEY (`YR`)) ENGINE=INNODB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
    IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) INTO @versionId FROM rm_program_version pv WHERE pv.PROGRAM_ID=@programId;
	END IF;
    
    SET @dtPtr = @startDate;
    SET @sql2 = "";
	SET @isFirst = TRUE;
    REPEAT
		INSERT INTO tmp_year VALUES (YEAR(@dtPtr));
        SET @sql2 = CONCAT(@sql2, ", SUM(IF(b1.SHIP_YR=",YEAR(@dtPtr),", (IFNULL(b1.PRODUCT_COST,0)+IFNULL(b1.FREIGHT_COST,0)), 0)) `YR-",YEAR(@dtPtr),"` ");
        SET @dtPtr = DATE_ADD(@dtPtr, INTERVAL 1 YEAR);
	UNTIL YEAR(@dtPtr)>YEAR(@stopDate) END REPEAT;
    SET @sql1 = "";
	SET @sql1 = CONCAT(@sql1, "	SELECT ");
	SET @sql1 = CONCAT(@sql1, "		b1.PROCUREMENT_AGENT_ID, b1.PROCUREMENT_AGENT_CODE, b1.PROCUREMENT_AGENT_LABEL_ID, b1.PROCUREMENT_AGENT_LABEL_EN, b1.PROCUREMENT_AGENT_LABEL_FR, b1.PROCUREMENT_AGENT_LABEL_SP, b1.PROCUREMENT_AGENT_LABEL_PR, ");
    SET @sql1 = CONCAT(@sql1, "		b1.FUNDING_SOURCE_ID, b1.FUNDING_SOURCE_CODE, b1.FUNDING_SOURCE_LABEL_ID, b1.FUNDING_SOURCE_LABEL_EN, b1.FUNDING_SOURCE_LABEL_FR, b1.FUNDING_SOURCE_LABEL_SP, b1.FUNDING_SOURCE_LABEL_PR, ");
    SET @sql1 = CONCAT(@sql1, "		b1.PLANNING_UNIT_ID, b1.PLANNING_UNIT_LABEL_ID, b1.PLANNING_UNIT_LABEL_EN, b1.PLANNING_UNIT_LABEL_FR, b1.PLANNING_UNIT_LABEL_SP, b1.PLANNING_UNIT_LABEL_PR ");
	SET @sql1 = CONCAT(@sql1, "		",@sql2);
   	SET @sql1 = CONCAT(@sql1, " FROM tmp_year y ");
	SET @sql1 = CONCAT(@sql1, " LEFT JOIN ( ");
	SET @sql1 = CONCAT(@sql1, " 	SELECT ");
	IF @reportBasedOn=1 THEN 
		SET @sql1 = CONCAT(@sql1, " 	YEAR(st.PLANNED_DATE) SHIP_YR, ");
	ELSE
		SET @sql1 = CONCAT(@sql1, " 	YEAR(COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE)) SHIP_YR, ");
	END IF;
	SET @sql1 = CONCAT(@sql1, " 		pa.PROCUREMENT_AGENT_ID, pa.PROCUREMENT_AGENT_CODE, pa.LABEL_ID `PROCUREMENT_AGENT_LABEL_ID`, pa.LABEL_EN `PROCUREMENT_AGENT_LABEL_EN`, pa.LABEL_FR `PROCUREMENT_AGENT_LABEL_FR`, pa.LABEL_SP `PROCUREMENT_AGENT_LABEL_SP`, pa.LABEL_PR `PROCUREMENT_AGENT_LABEL_PR`, ");
	SET @sql1 = CONCAT(@sql1, " 		fs.FUNDING_SOURCE_ID, fs.FUNDING_SOURCE_CODE, fs.LABEL_ID `FUNDING_SOURCE_LABEL_ID`, fs.LABEL_EN `FUNDING_SOURCE_LABEL_EN`, fs.LABEL_FR `FUNDING_SOURCE_LABEL_FR`, fs.LABEL_SP `FUNDING_SOURCE_LABEL_SP`, fs.LABEL_PR `FUNDING_SOURCE_LABEL_PR`, ");
    SET @sql1 = CONCAT(@sql1, " 		pu.PLANNING_UNIT_ID, pu.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pu.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pu.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pu.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pu.LABEL_PR `PLANNING_UNIT_LABEL_PR`, ");
    SET @sql1 = CONCAT(@sql1, " 		st.PRODUCT_COST * s.CONVERSION_RATE_TO_USD `PRODUCT_COST`, st.FREIGHT_COST * s.CONVERSION_RATE_TO_USD `FREIGHT_COST` ");
    SET @sql1 = CONCAT(@sql1, " 	FROM ");
    SET @sql1 = CONCAT(@sql1, "			(");
    SET @sql1 = CONCAT(@sql1, "				SELECT ");
	SET @sql1 = CONCAT(@sql1, "					s.PROGRAM_ID, s.SHIPMENT_ID, s.CONVERSION_RATE_TO_USD, MAX(st.VERSION_ID) MAX_VERSION_ID ");
	SET @sql1 = CONCAT(@sql1, "				FROM rm_shipment s ");
	SET @sql1 = CONCAT(@sql1, "				LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID ");
	SET @sql1 = CONCAT(@sql1, "				WHERE s.PROGRAM_ID=@programId AND st.VERSION_ID<=@versionId AND st.SHIPMENT_TRANS_ID IS NOT NULL ");
	SET @sql1 = CONCAT(@sql1, "				GROUP BY s.SHIPMENT_ID ");
    SET @sql1 = CONCAT(@sql1, "		) s ");
	SET @sql1 = CONCAT(@sql1, " 	LEFT JOIN rm_shipment_trans  st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND s.MAX_VERSION_ID=st.VERSION_ID ");
	SET @sql1 = CONCAT(@sql1, " 	LEFT JOIN rm_budget b on st.BUDGET_ID=b.BUDGET_ID ");
	SET @sql1 = CONCAT(@sql1, " 	LEFT JOIN vw_funding_source fs on fs.FUNDING_SOURCE_ID=b.FUNDING_SOURCE_ID ");
	SET @sql1 = CONCAT(@sql1, " 	LEFT JOIN vw_procurement_agent pa on pa.PROCUREMENT_AGENT_ID=st.PROCUREMENT_AGENT_ID ");
	SET @sql1 = CONCAT(@sql1, " 	LEFT JOIN vw_planning_unit pu on pu.PLANNING_UNIT_ID=st.PLANNING_UNIT_ID ");
	SET @sql1 = CONCAT(@sql1, " 	WHERE ");
	SET @sql1 = CONCAT(@sql1, " 		st.ACTIVE ");
    SET @sql1 = CONCAT(@sql1, " 		AND (st.SHIPMENT_STATUS_ID != 8) ");
	SET @sql1 = CONCAT(@sql1, " 		AND (@programId = -1 OR s.PROGRAM_ID = @programId) ");
	SET @sql1 = CONCAT(@sql1, " 		AND (@procurementAgentId = -1 OR st.PROCUREMENT_AGENT_ID = @procurementAgentId) ");
	SET @sql1 = CONCAT(@sql1, " 		AND (@planningUnitId = -1 OR st.PLANNING_UNIT_ID = @planningUnitId) ");
	SET @sql1 = CONCAT(@sql1, " 		AND (@shipmentStatusId = -1 OR st.SHIPMENT_STATUS_ID = @shipmentStatusId) ");
	-- If you want on Order Date change here
	IF @reportBasedOn=1 THEN 
		SET @sql1 = CONCAT(@sql1, " 	AND st.PLANNED_DATE BETWEEN @startDate AND @stopDate ");
	ELSE
		SET @sql1 = CONCAT(@sql1, " 	AND COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) BETWEEN @startDate AND @stopDate ");
	END IF;
	SET @sql1 = CONCAT(@sql1, " 		AND (@fundingSourceId = -1 OR b.FUNDING_SOURCE_ID = @fundingSourceId)   ");
	SET @sql1 = CONCAT(@sql1, " 	GROUP BY s.SHIPMENT_ID ");
	SET @sql1 = CONCAT(@sql1, " ) as b1 ON y.YR=b1.SHIP_YR ");
	SET @sql1 = CONCAT(@sql1, " GROUP BY b1.PROCUREMENT_AGENT_ID, b1.FUNDING_SOURCE_ID, b1.PLANNING_UNIT_ID ");
	SET @sql1 = CONCAT(@sql1, " HAVING PROCUREMENT_AGENT_ID IS NOT NULL ");
--  	select @sql1;
 	PREPARE s1 FROM @sql1;
 	EXECUTE s1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `budgetReport` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `budgetReport`(VAR_PROGRAM_ID INT(10), VAR_VERSION_ID INT)
BEGIN
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    -- Report no 29
    -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
    -- ProgramId and Version Id that you want to run the report for
    -- Returns the Budget Amts in the Currency of the Budget
    -- Amts are in Millions
    
	SET @programId = VAR_PROGRAM_ID;
    SET @versionId = VAR_VERSION_ID;
    SELECT IF(@versionId=-1, MAX(pv.VERSION_ID), @versionId) INTO @versionId FROM rm_program_version pv WHERE pv.PROGRAM_ID=@programId;
    
		SELECT 
		b.BUDGET_ID, b.BUDGET_CODE, b.LABEL_ID, b.LABEL_EN, b.LABEL_FR, b.LABEL_SP, b.LABEL_PR, 
		fs.FUNDING_SOURCE_ID, fs.FUNDING_SOURCE_CODE, fs.LABEL_ID `FUNDING_SOURCE_LABEL_ID`, fs.LABEL_EN `FUNDING_SOURCE_LABEL_EN`, fs.LABEL_FR `FUNDING_SOURCE_LABEL_FR`, fs.LABEL_SP `FUNDING_SOURCE_LABEL_SP`, fs.LABEL_PR `FUNDING_SOURCE_LABEL_PR`, 
		p.PROGRAM_ID, p.PROGRAM_CODE, p.LABEL_ID `PROGRAM_LABEL_ID`, p.LABEL_EN `PROGRAM_LABEL_EN`, p.LABEL_FR `PROGRAM_LABEL_FR`, p.LABEL_SP `PROGRAM_LABEL_SP`, p.LABEL_PR `PROGRAM_LABEL_PR`, 
        c.CURRENCY_ID, c.CURRENCY_CODE, c.LABEL_ID `CURRENCY_LABEL_ID`, c.LABEL_EN `CURRENCY_LABEL_EN`, c.LABEL_FR `CURRENCY_LABEL_FR`, c.LABEL_SP `CURRENCY_LABEL_SP`, c.LABEL_PR `CURRENCY_LABEL_PR`, 
		b.BUDGET_AMT/1000000 `BUDGET_AMT`, IFNULL(ua.PLANNED_BUDGET,0)/b.CONVERSION_RATE_TO_USD `PLANNED_BUDGET_AMT`, IFNULL(ua.ORDERED_BUDGET,0)/b.CONVERSION_RATE_TO_USD `ORDERED_BUDGET_AMT`,  b.START_DATE, b.STOP_DATE
	FROM vw_budget b 
	LEFT JOIN vw_program p ON b.PROGRAM_ID=p.PROGRAM_ID 
	LEFT JOIN vw_funding_source fs ON b.FUNDING_SOURCE_ID=fs.FUNDING_SOURCE_ID 
    LEFT JOIN vw_currency c ON c.CURRENCY_ID=b.CURRENCY_ID
	LEFT JOIN 
		(
		SELECT 
			st.BUDGET_ID, 
			SUM(IF(st.SHIPMENT_STATUS_ID IN (1), ((IFNULL(st.FREIGHT_COST,0)+IFNULL(st.PRODUCT_COST,0))*s1.CONVERSION_RATE_TO_USD),0))/1000000 `PLANNED_BUDGET`, -- Only Planned
			SUM(IF(st.SHIPMENT_STATUS_ID IN (3,4,5,6,7,9), ((IFNULL(st.FREIGHT_COST,0)+IFNULL(st.PRODUCT_COST,0))*s1.CONVERSION_RATE_TO_USD),0))/1000000 `ORDERED_BUDGET` -- Submitted, Approved, Shipped, Arrived, Received and On-hold
		FROM 
			(
			SELECT 
				s.SHIPMENT_ID, MAX(st.VERSION_ID) MAX_VERSION_ID, s.CONVERSION_RATE_TO_USD 
			FROM rm_shipment s 
			LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID 
			WHERE 
				s.PROGRAM_ID=@programId 
				AND st.VERSION_ID<=@versionId 
				AND st.SHIPMENT_TRANS_ID IS NOT NULL 
			GROUP BY s.SHIPMENT_ID
		) s1 
		LEFT JOIN rm_shipment_trans st ON s1.SHIPMENT_ID=st.SHIPMENT_ID AND s1.MAX_VERSION_ID=st.VERSION_ID
		WHERE st.ACTIVE AND st.SHIPMENT_STATUS_ID !=8
		GROUP BY st.BUDGET_ID
	) as ua ON ua.BUDGET_ID=b.BUDGET_ID 
	WHERE 
		b.PROGRAM_ID=@programId
		AND b.ACTIVE;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `buildNewSupplyPlanBatch` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `buildNewSupplyPlanBatch`(VAR_PROGRAM_ID INT(10), VAR_VERSION_ID INT(10))
BEGIN
    SET @programId = VAR_PROGRAM_ID;
    SET @versionId = VAR_VERSION_ID;
    
    SELECT 
        o.PROGRAM_ID, @versionId, o.PLANNING_UNIT_ID, DATE(CONCAT(o.TRANS_DATE,"-01")) `TRANS_DATE`, o.BATCH_ID, o.EXPIRY_DATE, o.SHELF_LIFE,
        SUM(o.FORECASTED_CONSUMPTION) `FORECASTED_CONSUMPTION`, SUM(o.ACTUAL_CONSUMPTION) `ACTUAL_CONSUMPTION`, 
        SUM(o.SHIPMENT) `SHIPMENT`, SUM(o.SHIPMENT_WPS) `SHIPMENT_WPS`, SUM(o.ADJUSTMENT) `ADJUSTMENT`, SUM(o.STOCK) `STOCK` 
        FROM (
            SELECT 
            tc.PROGRAM_ID, tc.CONSUMPTION_ID `TRANS_ID`, tc.PLANNING_UNIT_ID, LEFT(tc.CONSUMPTION_DATE, 7) `TRANS_DATE`, tc.BATCH_ID, tc.EXPIRY_DATE `EXPIRY_DATE`, tc.SHELF_LIFE,
            SUM(FORECASTED_CONSUMPTION) `FORECASTED_CONSUMPTION`, SUM(ACTUAL_CONSUMPTION) `ACTUAL_CONSUMPTION`, 
            null `SHIPMENT`, null `SHIPMENT_WPS`,null `ADJUSTMENT`, null  `STOCK` 
            FROM (
                SELECT 
                    c.PROGRAM_ID, c.CONSUMPTION_ID, ct.REGION_ID, ct.PLANNING_UNIT_ID, ct.CONSUMPTION_DATE, 
                    ctbi.BATCH_ID `BATCH_ID`, bi.EXPIRY_DATE, IFNULL(ppu.SHELF_LIFE,24) `SHELF_LIFE`,
                    SUM(IF(ct.ACTUAL_FLAG=1, COALESCE(ctbi.CONSUMPTION_QTY, ct.CONSUMPTION_QTY), null)) `ACTUAL_CONSUMPTION`, 
                    SUM(IF(ct.ACTUAL_FLAG=0, COALESCE(ctbi.CONSUMPTION_QTY, ct.CONSUMPTION_QTY), null)) `FORECASTED_CONSUMPTION`
                FROM (
                    SELECT c.CONSUMPTION_ID, MAX(ct.VERSION_ID) MAX_VERSION_ID FROM rm_consumption c LEFT JOIN rm_consumption_trans ct ON c.CONSUMPTION_ID=ct.CONSUMPTION_ID WHERE c.PROGRAM_ID=@programId AND ct.VERSION_ID<=@versionId AND ct.CONSUMPTION_TRANS_ID IS NOT NULL GROUP BY c.CONSUMPTION_ID
                ) tc
                LEFT JOIN rm_consumption c ON c.CONSUMPTION_ID=tc.CONSUMPTION_ID
                LEFT JOIN rm_consumption_trans ct ON c.CONSUMPTION_ID=ct.CONSUMPTION_ID AND tc.MAX_VERSION_ID=ct.VERSION_ID
                LEFT JOIN rm_consumption_trans_batch_info ctbi ON ct.CONSUMPTION_TRANS_ID=ctbi.CONSUMPTION_TRANS_ID
                LEFT JOIN rm_batch_info bi ON ctbi.BATCH_ID=bi.BATCH_ID
                LEFT JOIN rm_program_planning_unit ppu ON c.PROGRAM_ID=ppu.PROGRAM_ID AND ct.PLANNING_UNIT_ID=ppu.PLANNING_UNIT_ID
                WHERE ct.ACTIVE AND ctbi.BATCH_ID IS NOT NULL -- AND ct.PLANNING_UNIT_ID=8293
                GROUP BY c.PROGRAM_ID, ct.REGION_ID, ct.PLANNING_UNIT_ID, ct.CONSUMPTION_DATE, ctbi.BATCH_ID
            ) tc 
            GROUP BY tc.PROGRAM_ID, tc.PLANNING_UNIT_ID, tc.CONSUMPTION_DATE, tc.BATCH_ID

            UNION

            SELECT 
                s.PROGRAM_ID, s.SHIPMENT_ID `TRANS_ID`, st.PLANNING_UNIT_ID, LEFT(COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE),7) `TRANS_DATE`, stbi.BATCH_ID, bi.EXPIRY_DATE, IFNULL(ppu.SHELF_LIFE,24) `SHELF_LIFE`,
                null `FORECASTED_CONSUMPTION`, null `ACTUAL_CONSUMPTION`, 
                SUM(IF(st.SHIPMENT_STATUS_ID IN (1,3,4,5,6,7,9), COALESCE(stbi.BATCH_SHIPMENT_QTY ,st.SHIPMENT_QTY),0)) `SHIPMENT`, 
                SUM(IF(st.SHIPMENT_STATUS_ID IN (3,4,5,6,7,9), COALESCE(stbi.BATCH_SHIPMENT_QTY ,st.SHIPMENT_QTY), 0)) `SHIPMENT_WPS`, 
                null  `ADJUSTMENT_MULTIPLIED_QTY`, null  `STOCK_MULTIPLIED_QTY`
            FROM (
                SELECT s.PROGRAM_ID, s.SHIPMENT_ID, MAX(st.VERSION_ID) MAX_VERSION_ID FROM rm_shipment s LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID WHERE s.PROGRAM_ID=@programId AND st.VERSION_ID<=@versionId AND st.SHIPMENT_TRANS_ID IS NOT NULL GROUP BY s.SHIPMENT_ID
            ) ts
            LEFT JOIN rm_shipment s ON s.SHIPMENT_ID=ts.SHIPMENT_ID
            LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND ts.MAX_VERSION_ID=st.VERSION_ID
            LEFT JOIN rm_shipment_trans_batch_info stbi ON st.SHIPMENT_TRANS_ID=stbi.SHIPMENT_TRANS_ID
            LEFT JOIN rm_batch_info bi ON stbi.BATCH_ID=bi.BATCH_ID
            LEFT JOIN rm_program_planning_unit ppu ON s.PROGRAM_ID=ppu.PROGRAM_ID AND st.PLANNING_UNIT_ID=ppu.PLANNING_UNIT_ID
            WHERE st.ACTIVE AND st.ACCOUNT_FLAG AND st.SHIPMENT_STATUS_ID!=8 AND stbi.BATCH_ID IS NOT NULL -- AND st.PLANNING_UNIT_ID=8293
            GROUP BY s.PROGRAM_ID, st.PLANNING_UNIT_ID, COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE), stbi.BATCH_ID

            UNION

            SELECT 
                i.PROGRAM_ID, i.INVENTORY_ID `TRANS_ID`, rcpu.PLANNING_UNIT_ID, LEFT(it.INVENTORY_DATE,7) `TRANS_DATE`, itbi.BATCH_ID, bi.EXPIRY_DATE, IFNULL(ppu.SHELF_LIFE,24) `SHELF_LIFE`,
                null `FORECASTED_CONSUMPTION`, null `ACTUAL_CONSUMPTION`, 
                null `SHIPMENT`, null `SHIPMENT_WPS`, SUM(COALESCE(itbi.ADJUSTMENT_QTY, it.ADJUSTMENT_QTY)*rcpu.MULTIPLIER) `ADJUSTMENT`,  SUM(COALESCE(itbi.ACTUAL_QTY, it.ACTUAL_QTY)*rcpu.MULTIPLIER) `STOCK`
            FROM (
                SELECT i.PROGRAM_ID, i.INVENTORY_ID, MAX(it.VERSION_ID) MAX_VERSION_ID FROM rm_inventory i LEFT JOIN rm_inventory_trans it ON i.INVENTORY_ID=it.INVENTORY_ID WHERE i.PROGRAM_ID=@programId AND it.VERSION_ID<=@versionId AND it.INVENTORY_TRANS_ID IS NOT NULL GROUP BY i.INVENTORY_ID
            ) ti
            LEFT JOIN rm_inventory i ON i.INVENTORY_ID=ti.INVENTORY_ID
            LEFT JOIN rm_inventory_trans it ON i.INVENTORY_ID=it.INVENTORY_ID AND ti.MAX_VERSION_ID=it.VERSION_ID
            LEFT JOIN rm_inventory_trans_batch_info itbi ON it.INVENTORY_TRANS_ID=itbi.INVENTORY_TRANS_ID
            LEFT JOIN rm_batch_info bi ON itbi.BATCH_ID=bi.BATCH_ID
            LEFT JOIN rm_realm_country_planning_unit rcpu ON it.REALM_COUNTRY_PLANNING_UNIT_ID=rcpu.REALM_COUNTRY_PLANNING_UNIT_ID
            LEFT JOIN rm_program_planning_unit ppu ON i.PROGRAM_ID=ppu.PROGRAM_ID AND rcpu.PLANNING_UNIT_ID=ppu.PLANNING_UNIT_ID
            WHERE it.ACTIVE AND itbi.BATCH_ID IS NOT NULL -- AND rcpu.PLANNING_UNIT_ID=8293
            GROUP BY i.PROGRAM_ID, rcpu.PLANNING_UNIT_ID, it.INVENTORY_DATE, itbi.BATCH_ID
        ) AS o GROUP BY o.PROGRAM_ID, o.PLANNING_UNIT_ID, o.TRANS_DATE, o.BATCH_ID ORDER BY o.PROGRAM_ID, o.PLANNING_UNIT_ID, o.TRANS_DATE, IFNULL(o.EXPIRY_DATE,'2999-12-31');

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `buildNewSupplyPlanBatchOld` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `buildNewSupplyPlanBatchOld`(VAR_PROGRAM_ID INT(10), VAR_VERSION_ID INT(10))
BEGIN
    SET @programId = VAR_PROGRAM_ID;
    SET @versionId = VAR_VERSION_ID;
    SELECT COUNT(*) INTO @currentCount FROM rm_nsp_region nspr WHERE nspr.PROGRAM_ID=@programId AND nspr.VERSION_ID=@versionId;
    --    DELETE spbi.* FROM rm_supply_plan_batch_info spbi WHERE spbi.PROGRAM_ID=@programId AND spbi.VERSION_ID=@versionId;
    -- DELETE nspb.* FROM rm_nsp_batch nspb WHERE nspb.PROGRAM_ID=@programId AND nspb.VERSION_ID=@versionId;
--    DROP TABLE IF EXISTS `tmp_nsp_batch`;
--    CREATE TABLE IF NOT EXISTS `tmp_nsp_batch` (
--        `NSP_BATCH_ID` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
--        `PROGRAM_ID` INT(10) UNSIGNED NOT NULL,
--        `VERSION_ID` INT(10) UNSIGNED NOT NULL,
--        `PLANNING_UNIT_ID` INT(10) UNSIGNED NOT NULL,
--        `TRANS_DATE` DATE NOT NULL,
--        `BATCH_ID` INT(10) UNSIGNED NULL DEFAULT NULL,
--        `FORECASTED_CONSUMPTION` INT(10) UNSIGNED NULL DEFAULT NULL,
--        `ACTUAL_CONSUMPTION` INT(10) UNSIGNED NULL DEFAULT NULL,
--        `USE_ACTUAL_CONSUMPTION` TINYINT(1) UNSIGNED NULL DEFAULT NULL,
--        `SHIPMENT` INT(10) UNSIGNED NULL DEFAULT NULL,
--        `SHIPMENT_WPS` INT(10) UNSIGNED NULL,
--        `EXPIRY_DATE` DATE NULL DEFAULT NULL,
--        `SHELF_LIFE` INT(10) UNSIGNED NOT NULL,
--        `ADJUSTMENT` INT(10) NULL DEFAULT NULL,
--        `STOCK` INT(10) UNSIGNED NULL DEFAULT NULL,
--        `USE_ADJUSTMENT` TINYINT(1) UNSIGNED NULL DEFAULT NULL,
--    PRIMARY KEY (`NSP_BATCH_ID`),
--    UNIQUE INDEX `unq_tmp_nsp_batch_record` (`PROGRAM_ID` ASC, `VERSION_ID` ASC, `PLANNING_UNIT_ID` ASC, `TRANS_DATE` ASC, `BATCH_ID` ASC),
--    INDEX `tmp_nsp_region_programId_idx` (`PROGRAM_ID` ASC),
--    INDEX `tmp_nsp_region_planningUnitId_idx` (`PLANNING_UNIT_ID` ASC),
--    INDEX `tmp_nsp_region_versionId` (`VERSION_ID` ASC),
--    INDEX `tmp_nsp_region_transDate` (`TRANS_DATE` ASC),
--    INDEX `tmp_nsp_region_batchId_idx` (`BATCH_ID` ASC))
--    ENGINE = InnoDB DEFAULT CHARACTER SET = utf8 COLLATE = utf8_bin;
--    INSERT INTO tmp_nsp_batch (
--        PROGRAM_ID, VERSION_ID, PLANNING_UNIT_ID, TRANS_DATE, BATCH_ID, EXPIRY_DATE, SHELF_LIFE,
--        FORECASTED_CONSUMPTION, ACTUAL_CONSUMPTION, SHIPMENT, SHIPMENT_WPS, ADJUSTMENT, STOCK
--    )
    SELECT 
        o.PROGRAM_ID, @versionId, o.PLANNING_UNIT_ID, DATE(CONCAT(o.TRANS_DATE,"-01")) `TRANS_DATE`, o.BATCH_ID, o.EXPIRY_DATE, o.SHELF_LIFE,
        SUM(o.FORECASTED_CONSUMPTION) `FORECASTED_CONSUMPTION`, SUM(o.ACTUAL_CONSUMPTION) `ACTUAL_CONSUMPTION`, 
        SUM(o.SHIPMENT) `SHIPMENT`, SUM(o.SHIPMENT_WPS) `SHIPMENT_WPS`, SUM(o.ADJUSTMENT) `ADJUSTMENT`, SUM(o.STOCK) `STOCK` 
        FROM (
            SELECT 
            tc.PROGRAM_ID, tc.CONSUMPTION_ID `TRANS_ID`, tc.PLANNING_UNIT_ID, LEFT(tc.CONSUMPTION_DATE, 7) `TRANS_DATE`, tc.BATCH_ID, tc.EXPIRY_DATE `EXPIRY_DATE`, tc.SHELF_LIFE,
            SUM(FORECASTED_CONSUMPTION) `FORECASTED_CONSUMPTION`, SUM(ACTUAL_CONSUMPTION) `ACTUAL_CONSUMPTION`, 
            null `SHIPMENT`, null `SHIPMENT_WPS`,null `ADJUSTMENT`, null  `STOCK` 
            FROM (
                SELECT 
                    c.PROGRAM_ID, c.CONSUMPTION_ID, ct.REGION_ID, ct.PLANNING_UNIT_ID, ct.CONSUMPTION_DATE, 
                    ctbi.BATCH_ID `BATCH_ID`, bi.EXPIRY_DATE, IFNULL(ppu.SHELF_LIFE,24) `SHELF_LIFE`,
                    SUM(IF(ct.ACTUAL_FLAG=1, COALESCE(ctbi.CONSUMPTION_QTY, ct.CONSUMPTION_QTY), null)) `ACTUAL_CONSUMPTION`, 
                    SUM(IF(ct.ACTUAL_FLAG=0, COALESCE(ctbi.CONSUMPTION_QTY, ct.CONSUMPTION_QTY), null)) `FORECASTED_CONSUMPTION`
                FROM (
                    SELECT c.CONSUMPTION_ID, MAX(ct.VERSION_ID) MAX_VERSION_ID FROM rm_consumption c LEFT JOIN rm_consumption_trans ct ON c.CONSUMPTION_ID=ct.CONSUMPTION_ID WHERE c.PROGRAM_ID=@programId AND ct.VERSION_ID<=@versionId AND ct.CONSUMPTION_TRANS_ID IS NOT NULL GROUP BY c.CONSUMPTION_ID
                ) tc
                LEFT JOIN rm_consumption c ON c.CONSUMPTION_ID=tc.CONSUMPTION_ID
                LEFT JOIN rm_consumption_trans ct ON c.CONSUMPTION_ID=ct.CONSUMPTION_ID AND tc.MAX_VERSION_ID=ct.VERSION_ID
                LEFT JOIN rm_consumption_trans_batch_info ctbi ON ct.CONSUMPTION_TRANS_ID=ctbi.CONSUMPTION_TRANS_ID
                LEFT JOIN rm_batch_info bi ON ctbi.BATCH_ID=bi.BATCH_ID
                LEFT JOIN rm_program_planning_unit ppu ON c.PROGRAM_ID=ppu.PROGRAM_ID AND ct.PLANNING_UNIT_ID=ppu.PLANNING_UNIT_ID
                WHERE ct.ACTIVE AND ctbi.BATCH_ID IS NOT NULL
                GROUP BY c.PROGRAM_ID, ct.REGION_ID, ct.PLANNING_UNIT_ID, ct.CONSUMPTION_DATE, ctbi.BATCH_ID
            ) tc 
            GROUP BY tc.PROGRAM_ID, tc.PLANNING_UNIT_ID, tc.CONSUMPTION_DATE, tc.BATCH_ID

            UNION

            SELECT 
                s.PROGRAM_ID, s.SHIPMENT_ID `TRANS_ID`, st.PLANNING_UNIT_ID, LEFT(COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE),7) `TRANS_DATE`, stbi.BATCH_ID, bi.EXPIRY_DATE, IFNULL(ppu.SHELF_LIFE,24) `SHELF_LIFE`,
                null `FORECASTED_CONSUMPTION`, null `ACTUAL_CONSUMPTION`, 
                SUM(COALESCE(stbi.BATCH_SHIPMENT_QTY ,st.SHIPMENT_QTY)) `SHIPMENT`, 
                SUM(IF(st.SHIPMENT_STATUS_ID IN (3,4,5,6,7,9), COALESCE(stbi.BATCH_SHIPMENT_QTY ,st.SHIPMENT_QTY), 0)) `SHIPMENT_WPS`, null  `ADJUSTMENT_MULTIPLIED_QTY`, null  `STOCK_MULTIPLIED_QTY`
            FROM (
                SELECT s.PROGRAM_ID, s.SHIPMENT_ID, MAX(st.VERSION_ID) MAX_VERSION_ID FROM rm_shipment s LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID WHERE s.PROGRAM_ID=@programId AND st.VERSION_ID<=@versionId AND st.SHIPMENT_TRANS_ID IS NOT NULL GROUP BY s.SHIPMENT_ID
            ) ts
            LEFT JOIN rm_shipment s ON s.SHIPMENT_ID=ts.SHIPMENT_ID
            LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND ts.MAX_VERSION_ID=st.VERSION_ID
            LEFT JOIN rm_shipment_trans_batch_info stbi ON st.SHIPMENT_TRANS_ID=stbi.SHIPMENT_TRANS_ID
            LEFT JOIN rm_batch_info bi ON stbi.BATCH_ID=bi.BATCH_ID
            LEFT JOIN rm_program_planning_unit ppu ON s.PROGRAM_ID=ppu.PROGRAM_ID AND st.PLANNING_UNIT_ID=ppu.PLANNING_UNIT_ID
            WHERE st.ACTIVE AND st.ACCOUNT_FLAG AND st.SHIPMENT_STATUS_ID!=8 AND stbi.BATCH_ID IS NOT NULL
            GROUP BY s.PROGRAM_ID, st.PLANNING_UNIT_ID, COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE), stbi.BATCH_ID

            UNION

            SELECT 
                i.PROGRAM_ID, i.INVENTORY_ID `TRANS_ID`, rcpu.PLANNING_UNIT_ID, LEFT(it.INVENTORY_DATE,7) `TRANS_DATE`, itbi.BATCH_ID, bi.EXPIRY_DATE, IFNULL(ppu.SHELF_LIFE,24) `SHELF_LIFE`,
                null `FORECASTED_CONSUMPTION`, null `ACTUAL_CONSUMPTION`, 
                null `SHIPMENT`, null `SHIPMENT_WPS`, SUM(COALESCE(itbi.ADJUSTMENT_QTY, it.ADJUSTMENT_QTY)*rcpu.MULTIPLIER) `ADJUSTMENT`,  SUM(COALESCE(itbi.ACTUAL_QTY, it.ACTUAL_QTY)*rcpu.MULTIPLIER) `STOCK`
            FROM (
                SELECT i.PROGRAM_ID, i.INVENTORY_ID, MAX(it.VERSION_ID) MAX_VERSION_ID FROM rm_inventory i LEFT JOIN rm_inventory_trans it ON i.INVENTORY_ID=it.INVENTORY_ID WHERE i.PROGRAM_ID=@programId AND it.VERSION_ID<=@versionId AND it.INVENTORY_TRANS_ID IS NOT NULL GROUP BY i.INVENTORY_ID
            ) ti
            LEFT JOIN rm_inventory i ON i.INVENTORY_ID=ti.INVENTORY_ID
            LEFT JOIN rm_inventory_trans it ON i.INVENTORY_ID=it.INVENTORY_ID AND ti.MAX_VERSION_ID=it.VERSION_ID
            LEFT JOIN rm_inventory_trans_batch_info itbi ON it.INVENTORY_TRANS_ID=itbi.INVENTORY_TRANS_ID
            LEFT JOIN rm_batch_info bi ON itbi.BATCH_ID=bi.BATCH_ID
            LEFT JOIN rm_realm_country_planning_unit rcpu ON it.REALM_COUNTRY_PLANNING_UNIT_ID=rcpu.REALM_COUNTRY_PLANNING_UNIT_ID
            LEFT JOIN rm_program_planning_unit ppu ON i.PROGRAM_ID=ppu.PROGRAM_ID AND rcpu.PLANNING_UNIT_ID=ppu.PLANNING_UNIT_ID
            WHERE it.ACTIVE AND itbi.BATCH_ID IS NOT NULL
            GROUP BY i.PROGRAM_ID, rcpu.PLANNING_UNIT_ID, it.INVENTORY_DATE, itbi.BATCH_ID
        ) AS o GROUP BY o.PROGRAM_ID, o.PLANNING_UNIT_ID, o.TRANS_DATE, o.BATCH_ID ORDER BY o.PROGRAM_ID, o.PLANNING_UNIT_ID, o.TRANS_DATE, IFNULL(o.EXPIRY_DATE,'2999-12-31');

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `buildNewSupplyPlanRegion` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `buildNewSupplyPlanRegion`(VAR_PROGRAM_ID INT(10), VAR_VERSION_ID INT(10))
BEGIN
    SET @programId = VAR_PROGRAM_ID;
    SET @versionId = VAR_VERSION_ID;
    
    SELECT COUNT(*) INTO @currentCount FROM rm_supply_plan_amc spa WHERE spa.PROGRAM_ID=@programId AND spa.VERSION_ID=@versionId;
    -- Get the Region count for this Program
    SELECT count(*) INTO @regionCount FROM rm_program_region pr WHERE pr.PROGRAM_ID=@programId;
        
    DELETE tn.* FROM tmp_nsp tn WHERE tn.PROGRAM_ID=@programId AND tn.VERSION_ID=@versionId;
        
    -- DELETE nsps.* FROM rm_nsp_summary nsps WHERE nsps.PROGRAM_ID=@programId AND nsps.VERSION_ID=@versionId;
    -- DELETE nspr.* FROM rm_nsp_region nspr WHERE nspr.PROGRAM_ID=@programId AND nspr.VERSION_ID=@versionId;
       
    -- Populate the nsp_region table with all the raw data that we have for Consumption, Inventory and Shipment per Region
    INSERT INTO tmp_nsp (
        PROGRAM_ID, VERSION_ID, PLANNING_UNIT_ID, TRANS_DATE, REGION_ID, -- 5
        FORECASTED_CONSUMPTION, ACTUAL_CONSUMPTION, ADJUSTMENT, STOCK, REGION_COUNT, -- 5
        MANUAL_PLANNED_SHIPMENT, MANUAL_SUBMITTED_SHIPMENT, MANUAL_APPROVED_SHIPMENT, MANUAL_SHIPPED_SHIPMENT, MANUAL_RECEIVED_SHIPMENT, MANUAL_ONHOLD_SHIPMENT, -- 6
        ERP_PLANNED_SHIPMENT, ERP_SUBMITTED_SHIPMENT, ERP_APPROVED_SHIPMENT, ERP_SHIPPED_SHIPMENT, ERP_RECEIVED_SHIPMENT, ERP_ONHOLD_SHIPMENT -- 6
    )
    SELECT 
        o.`PROGRAM_ID`, @versionId, o.`PLANNING_UNIT_ID`, DATE(CONCAT(o.`TRANS_DATE`,"-01")) , o.`REGION_ID`, 
        SUM(o.`FORECASTED_CONSUMPTION`), SUM(o.`ACTUAL_CONSUMPTION`), SUM(o.`ADJUSTMENT`), SUM(o.`STOCK`), @regionCount, 
        SUM(o.`MANUAL_PLANNED_SHIPMENT`), SUM(o.`MANUAL_SUBMITTED_SHIPMENT`), SUM(o.`MANUAL_APPROVED_SHIPMENT`), SUM(o.`MANUAL_SHIPPED_SHIPMENT`), SUM(o.`MANUAL_RECEIVED_SHIPMENT`), SUM(o.`MANUAL_ONHOLD_SHIPMENT`), 
        SUM(o.`ERP_PLANNED_SHIPMENT`), SUM(o.`ERP_SUBMITTED_SHIPMENT`), SUM(o.`ERP_APPROVED_SHIPMENT`), SUM(o.`ERP_SHIPPED_SHIPMENT`), SUM(o.`ERP_RECEIVED_SHIPMENT`), SUM(o.`ERP_ONHOLD_SHIPMENT`)
    FROM (
        SELECT 
            tc.`PROGRAM_ID`, tc.`PLANNING_UNIT_ID`, LEFT(tc.`CONSUMPTION_DATE`, 7) `TRANS_DATE`, tc.`REGION_ID`, 
            SUM(tc.`FORECASTED_CONSUMPTION`) `FORECASTED_CONSUMPTION`, SUM(tc.`ACTUAL_CONSUMPTION`) `ACTUAL_CONSUMPTION`, null `ADJUSTMENT`, null `STOCK`, 
            null `MANUAL_PLANNED_SHIPMENT`, null `MANUAL_SUBMITTED_SHIPMENT`, null `MANUAL_APPROVED_SHIPMENT`, null `MANUAL_SHIPPED_SHIPMENT`, null `MANUAL_RECEIVED_SHIPMENT`, null `MANUAL_ONHOLD_SHIPMENT`, 
            null `ERP_PLANNED_SHIPMENT`, null `ERP_SUBMITTED_SHIPMENT`, null `ERP_APPROVED_SHIPMENT`, null `ERP_SHIPPED_SHIPMENT`, null `ERP_RECEIVED_SHIPMENT`, null `ERP_ONHOLD_SHIPMENT`
        FROM (
            SELECT 
                c.`PROGRAM_ID`, ct.`PLANNING_UNIT_ID`, ct.`CONSUMPTION_DATE`, ct.`REGION_ID`, 
                ct.`ACTIVE`, 
                SUM(IF(ct.`ACTUAL_FLAG`=0, ct.`CONSUMPTION_QTY`, null)) `FORECASTED_CONSUMPTION`,
                SUM(IF(ct.`ACTUAL_FLAG`=1, ct.`CONSUMPTION_QTY`, null)) `ACTUAL_CONSUMPTION`
            FROM (
                SELECT c.`CONSUMPTION_ID`, MAX(ct.`VERSION_ID`) `MAX_VERSION_ID` FROM rm_consumption c LEFT JOIN rm_consumption_trans ct ON c.`CONSUMPTION_ID`=ct.`CONSUMPTION_ID` WHERE c.`PROGRAM_ID`=@programId AND ct.`VERSION_ID`<=@versionId AND ct.`CONSUMPTION_TRANS_ID` IS NOT NULL GROUP BY c.`CONSUMPTION_ID`
            ) tc
            LEFT JOIN rm_consumption c ON c.`CONSUMPTION_ID`=tc.`CONSUMPTION_ID`
            LEFT JOIN rm_consumption_trans ct ON c.`CONSUMPTION_ID`=ct.`CONSUMPTION_ID` AND tc.`MAX_VERSION_ID`=ct.`VERSION_ID`
            WHERE ct.`ACTIVE`
            GROUP BY c.`PROGRAM_ID`, ct.`PLANNING_UNIT_ID`, ct.`CONSUMPTION_DATE`, ct.`REGION_ID`
        ) tc 
        GROUP BY tc.`PROGRAM_ID`, tc.`PLANNING_UNIT_ID`, tc.`CONSUMPTION_DATE`, tc.`REGION_ID`

        UNION

        SELECT 
            s.`PROGRAM_ID`, st.`PLANNING_UNIT_ID`, LEFT(COALESCE(st.`RECEIVED_DATE`, st.`EXPECTED_DELIVERY_DATE`),7) `TRANS_DATE`, null `REGION_ID`,
            null `FORECASTED_CONSUMPTION`, null `ACTUAL_CONSUMPTION`, null `ADJUSTMENT`, null `STOCK`,
            SUM(IF((st.ERP_FLAG IS NULL OR st.ERP_FLAG=0) AND st.`SHIPMENT_STATUS_ID`=1, st.`SHIPMENT_QTY`, null )) `MANUAL_PLANNED_SHIPMENT`, 
            SUM(IF((st.ERP_FLAG IS NULL OR st.ERP_FLAG=0) AND st.`SHIPMENT_STATUS_ID`=3, st.`SHIPMENT_QTY`, null )) `MANUAL_SUBMITTED_SHIPMENT`, 
            SUM(IF((st.ERP_FLAG IS NULL OR st.ERP_FLAG=0) AND st.`SHIPMENT_STATUS_ID`=4, st.`SHIPMENT_QTY`, null )) `MANUAL_APPROVED_SHIPMENT`, 
            SUM(IF((st.ERP_FLAG IS NULL OR st.ERP_FLAG=0) AND st.`SHIPMENT_STATUS_ID`=5, st.`SHIPMENT_QTY`, null )) `MANUAL_SHIPPED_SHIPMENT`, 
            SUM(IF((st.ERP_FLAG IS NULL OR st.ERP_FLAG=0) AND st.`SHIPMENT_STATUS_ID` IN (6,7), st.`SHIPMENT_QTY`, null )) `MANUAL_RECEIVED_SHIPMENT`, 
            SUM(IF((st.ERP_FLAG IS NULL OR st.ERP_FLAG=0) AND st.`SHIPMENT_STATUS_ID`=9, st.`SHIPMENT_QTY`, null )) `MANUAL_ONHOLD_SHIPMENT`, 
            SUM(IF(st.`ERP_FLAG`=1 AND st.`SHIPMENT_STATUS_ID`=1, st.`SHIPMENT_QTY`, null )) `ERP_PLANNED_SHIPMENT`, 
            SUM(IF(st.`ERP_FLAG`=1 AND st.`SHIPMENT_STATUS_ID`=3, st.`SHIPMENT_QTY`, null )) `ERP_SUBMITTED_SHIPMENT`, 
            SUM(IF(st.`ERP_FLAG`=1 AND st.`SHIPMENT_STATUS_ID`=4, st.`SHIPMENT_QTY`, null )) `ERP_APPROVED_SHIPMENT`, 
            SUM(IF(st.`ERP_FLAG`=1 AND st.`SHIPMENT_STATUS_ID`=5, st.`SHIPMENT_QTY`, null )) `ERP_SHIPPED_SHIPMENT`, 
            SUM(IF(st.`ERP_FLAG`=1 AND st.`SHIPMENT_STATUS_ID` IN (6,7), st.`SHIPMENT_QTY`, null )) `ERP_RECEIVED_SHIPMENT`, 
            SUM(IF(st.`ERP_FLAG`=1 AND st.`SHIPMENT_STATUS_ID`=9, st.`SHIPMENT_QTY`, null )) `ERP_ONHOLD_SHIPMENT`
        FROM (
            SELECT s.PROGRAM_ID, s.SHIPMENT_ID, MAX(st.VERSION_ID) MAX_VERSION_ID FROM rm_shipment s LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID WHERE s.PROGRAM_ID=@programId AND st.VERSION_ID<=@versionId AND st.SHIPMENT_TRANS_ID IS NOT NULL GROUP BY s.SHIPMENT_ID
        ) ts
        LEFT JOIN rm_shipment s ON s.SHIPMENT_ID=ts.SHIPMENT_ID
        LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND ts.MAX_VERSION_ID=st.VERSION_ID
        WHERE st.ACTIVE AND st.ACCOUNT_FLAG AND st.SHIPMENT_STATUS_ID!=8 
        GROUP BY s.PROGRAM_ID, st.PLANNING_UNIT_ID, COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE)

        UNION

        SELECT 
            i.PROGRAM_ID, rcpu.PLANNING_UNIT_ID, LEFT(it.INVENTORY_DATE,7) `TRANS_DATE`, it.REGION_ID,
            null `FORECASTED_CONSUMPTION`, null `ACTUAL_CONSUMPTION`, SUM(it.ADJUSTMENT_QTY*rcpu.MULTIPLIER) `ADJUSTMENT`,  SUM(it.ACTUAL_QTY*rcpu.MULTIPLIER) `STOCK`,
            null `MANUAL_PLANNED_SHIPMENT`, null `MANUAL_SUBMITTED_SHIPMENT`, null `MANUAL_APPROVED_SHIPMENT`, null `MANUAL_SHIPPED_SHIPMENT`, null `MANUAL_RECEIVED_SHIPMENT`, null `MANUAL_ONHOLD_SHIPMENT`, 
            null `ERP_PLANNED_SHIPMENT`, null `ERP_SUBMITTED_SHIPMENT`, null `ERP_APPROVED_SHIPMENT`, null `ERP_SHIPPED_SHIPMENT`, null `ERP_RECEIVED_SHIPMENT`, null `ERP_ONHOLD_SHIPMENT`
        FROM (
            SELECT i.PROGRAM_ID, i.INVENTORY_ID, MAX(it.VERSION_ID) MAX_VERSION_ID FROM rm_inventory i LEFT JOIN rm_inventory_trans it ON i.INVENTORY_ID=it.INVENTORY_ID WHERE i.PROGRAM_ID=@programId AND it.VERSION_ID<=@versionId AND it.INVENTORY_TRANS_ID IS NOT NULL GROUP BY i.INVENTORY_ID
        ) ti
        LEFT JOIN rm_inventory i ON i.INVENTORY_ID=ti.INVENTORY_ID
        LEFT JOIN rm_inventory_trans it ON i.INVENTORY_ID=it.INVENTORY_ID AND ti.MAX_VERSION_ID=it.VERSION_ID
        LEFT JOIN rm_realm_country_planning_unit rcpu ON it.REALM_COUNTRY_PLANNING_UNIT_ID=rcpu.REALM_COUNTRY_PLANNING_UNIT_ID
        WHERE it.ACTIVE
        GROUP BY i.PROGRAM_ID, rcpu.PLANNING_UNIT_ID, it.INVENTORY_DATE, it.REGION_ID
            
    ) AS o GROUP BY o.PROGRAM_ID, o.PLANNING_UNIT_ID, o.TRANS_DATE, o.REGION_ID;
           
    -- Update the UseActualConsumption field = 1 
    -- IF All Regions have reported Consumption or if Sum(ActualConsumption)>Sum(ForecastedConsumption)
    -- ELSE UseActualConsumption field = 0
    UPDATE tmp_nsp tn LEFT JOIN (SELECT tn.PLANNING_UNIT_ID, tn.TRANS_DATE, SUM(IF(tn.ACTUAL_CONSUMPTION IS NOT NULL, 1,0)) `COUNT_OF_ACTUAL_CONSUMPTION`, SUM(tn.ACTUAL_CONSUMPTION) `TOTAL_ACTUAL_CONSUMPTION`, SUM(tn.FORECASTED_CONSUMPTION) `TOTAL_FORECASTED_CONSUMPTION` FROM tmp_nsp tn WHERE tn.PROGRAM_ID=@programId AND tn.VERSION_ID=@versionId AND tn.REGION_ID IS NOT NULL GROUP BY tn.PLANNING_UNIT_ID, tn.TRANS_DATE, tn.REGION_ID) rcount ON tn.PLANNING_UNIT_ID=rcount.PLANNING_UNIT_ID AND tn.TRANS_DATE=rcount.TRANS_DATE SET tn.USE_ACTUAL_CONSUMPTION=IF(rcount.COUNT_OF_ACTUAL_CONSUMPTION=@regionCount, 1, IF(rcount.TOTAL_ACTUAL_CONSUMPTION>rcount.TOTAL_FORECASTED_CONSUMPTION, 1, 0)) WHERE tn.PROGRAM_ID=@programId AND tn.VERSION_ID=@versionId AND tn.REGION_ID IS NOT NULL;
        
    -- Update the RegionStockCount field based on the number of Regions that have reported Stock
    UPDATE tmp_nsp tn LEFT JOIN (SELECT tn.PLANNING_UNIT_ID, tn.TRANS_DATE, COUNT(tn.STOCK) CNT FROM tmp_nsp tn WHERE tn.PROGRAM_ID=@programId AND tn.VERSION_ID=@versionId AND tn.REGION_ID IS NOT NULL GROUP BY tn.PLANNING_UNIT_ID, tn.TRANS_DATE, tn.REGION_ID) rcount ON tn.PLANNING_UNIT_ID=rcount.PLANNING_UNIT_ID AND tn.TRANS_DATE=rcount.TRANS_DATE SET tn.REGION_STOCK_COUNT = rcount.CNT WHERE tn.PROGRAM_ID=@programId AND tn.VERSION_ID=@versionId AND tn.REGION_ID IS NOT NULL;
        
    -- To get the range for AMC calculations
    -- SELECT MIN(sp.TRANS_DATE), ADDDATE(MAX(sp.TRANS_DATE), INTERVAL ppu.MONTHS_IN_PAST_FOR_AMC MONTH) INTO @startMonth, @stopMonth  FROM rm_supply_plan sp LEFT JOIN rm_program_planning_unit ppu ON sp.PROGRAM_ID=ppu.PROGRAM_ID AND sp.PLANNING_UNIT_ID=ppu.PLANNING_UNIT_ID WHERE sp.PROGRAM_ID=@programId and sp.VERSION_ID=@versionId;
    
    SELECT 
        tn.PLANNING_UNIT_ID, tn.TRANS_DATE, tn.REGION_ID, tn.FORECASTED_CONSUMPTION, tn.ACTUAL_CONSUMPTION,
        tn.USE_ACTUAL_CONSUMPTION, tn.ADJUSTMENT, tn.STOCK, tn.REGION_STOCK_COUNT, tn.REGION_COUNT,
        tn.MANUAL_PLANNED_SHIPMENT, tn.MANUAL_SUBMITTED_SHIPMENT, tn.MANUAL_APPROVED_SHIPMENT, tn.MANUAL_SHIPPED_SHIPMENT, tn.MANUAL_RECEIVED_SHIPMENT, tn.MANUAL_ONHOLD_SHIPMENT, 
        tn.ERP_PLANNED_SHIPMENT, tn.ERP_SUBMITTED_SHIPMENT, tn.ERP_APPROVED_SHIPMENT, tn.ERP_SHIPPED_SHIPMENT, tn.ERP_RECEIVED_SHIPMENT, tn.ERP_ONHOLD_SHIPMENT
    FROM tmp_nsp tn WHERE tn.PROGRAM_ID=@programId AND tn.VERSION_ID=@versionId -- AND tn.PLANNING_UNIT_ID=8293
    ;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `buildNewSupplyPlanRegionOld` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `buildNewSupplyPlanRegionOld`(VAR_PROGRAM_ID INT(10), VAR_VERSION_ID INT(10), VAR_REBUILD TINYINT(1))
BEGIN
    SET @programId = VAR_PROGRAM_ID;
    SET @versionId = VAR_VERSION_ID;
    SET @rebuild = VAR_REBUILD;
    SELECT COUNT(*) INTO @currentCount FROM rm_nsp_region nspr WHERE nspr.PROGRAM_ID=@programId AND nspr.VERSION_ID=@versionId;
    -- Get the Region count for this Program
    SELECT count(*) INTO @regionCount FROM rm_program_region pr WHERE pr.PROGRAM_ID=@programId;
    
    IF @rebuild = 1 OR @currentCount = 0 THEN
    --    DELETE spbi.* FROM rm_supply_plan_batch_info spbi WHERE spbi.PROGRAM_ID=@programId AND spbi.VERSION_ID=@versionId;
        DELETE nspr.* FROM rm_nsp_region nspr WHERE nspr.PROGRAM_ID=@programId AND nspr.VERSION_ID=@versionId;
       
        -- Populate the nsp_region table with all the raw data that we have for Consumption, Inventory and Shipment per Region
        INSERT INTO rm_nsp_region (
            PROGRAM_ID, VERSION_ID, PLANNING_UNIT_ID, TRANS_DATE, REGION_ID, REGION_COUNT, 
            FORECASTED_CONSUMPTION, ACTUAL_CONSUMPTION, SHIPMENT, ADJUSTMENT, STOCK
        )
        SELECT 
            o.PROGRAM_ID, @versionId, o.PLANNING_UNIT_ID, DATE(CONCAT(o.TRANS_DATE,"-01")) `TRANS_DATE`, o.REGION_ID, @regionCount,
            SUM(o.FORECASTED_CONSUMPTION) `FORECASTED_CONSUMPTION`, SUM(o.ACTUAL_CONSUMPTION) `ACTUAL_CONSUMPTION`, 
            SUM(o.SHIPMENT) `SHIPMENT`, SUM(o.ADJUSTMENT) `ADJUSTMENT`, SUM(o.STOCK) `STOCK` 
        FROM (
            SELECT 
                tc.PROGRAM_ID, tc.CONSUMPTION_ID `TRANS_ID`, tc.PLANNING_UNIT_ID, LEFT(tc.CONSUMPTION_DATE, 7) `TRANS_DATE`, tc.REGION_ID, 
                SUM(tc.`FORECASTED_CONSUMPTION`) `FORECASTED_CONSUMPTION`, SUM(tc.`ACTUAL_CONSUMPTION`) `ACTUAL_CONSUMPTION`, 
                null `SHIPMENT`, null `ADJUSTMENT`, null  `STOCK` 
            FROM (
                SELECT 
                    c.PROGRAM_ID, c.CONSUMPTION_ID, ct.REGION_ID, ct.PLANNING_UNIT_ID, ct.CONSUMPTION_DATE, 
                    ct.ACTIVE, 
                    SUM(IF(ct.ACTUAL_FLAG=1, ct.CONSUMPTION_QTY, null)) `ACTUAL_CONSUMPTION`, 
                    SUM(IF(ct.ACTUAL_FLAG=0, ct.CONSUMPTION_QTY, null)) `FORECASTED_CONSUMPTION`
                FROM (
                    SELECT c.CONSUMPTION_ID, MAX(ct.VERSION_ID) MAX_VERSION_ID FROM rm_consumption c LEFT JOIN rm_consumption_trans ct ON c.CONSUMPTION_ID=ct.CONSUMPTION_ID WHERE c.PROGRAM_ID=@programId AND ct.VERSION_ID<=@versionId AND ct.CONSUMPTION_TRANS_ID IS NOT NULL GROUP BY c.CONSUMPTION_ID
                ) tc
                LEFT JOIN rm_consumption c ON c.CONSUMPTION_ID=tc.CONSUMPTION_ID
                LEFT JOIN rm_consumption_trans ct ON c.CONSUMPTION_ID=ct.CONSUMPTION_ID AND tc.MAX_VERSION_ID=ct.VERSION_ID
                WHERE ct.ACTIVE
                GROUP BY c.PROGRAM_ID, ct.PLANNING_UNIT_ID, ct.CONSUMPTION_DATE, ct.REGION_ID
            ) tc 
            GROUP BY tc.PROGRAM_ID, tc.PLANNING_UNIT_ID, tc.CONSUMPTION_DATE, tc.REGION_ID

            UNION

            SELECT 
                s.PROGRAM_ID, s.SHIPMENT_ID `TRANS_ID`, st.PLANNING_UNIT_ID, LEFT(COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE),7) `TRANS_DATE`, null `REGION_ID`, 
                null `FORECASTED_CONSUMPTION`, null `ACTUAL_CONSUMPTION`, SUM(st.SHIPMENT_QTY) `SHIPMENT`, null `ADJUSTMENT`, null `STOCK`
            FROM (
                SELECT s.PROGRAM_ID, s.SHIPMENT_ID, MAX(st.VERSION_ID) MAX_VERSION_ID FROM rm_shipment s LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID WHERE s.PROGRAM_ID=@programId AND st.VERSION_ID<=@versionId AND st.SHIPMENT_TRANS_ID IS NOT NULL GROUP BY s.SHIPMENT_ID
            ) ts
            LEFT JOIN rm_shipment s ON s.SHIPMENT_ID=ts.SHIPMENT_ID
            LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND ts.MAX_VERSION_ID=st.VERSION_ID
            WHERE st.ACTIVE AND st.ACCOUNT_FLAG AND st.SHIPMENT_STATUS_ID!=8 
            GROUP BY s.PROGRAM_ID, st.PLANNING_UNIT_ID, COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE)

            UNION

            SELECT 
                i.PROGRAM_ID, i.INVENTORY_ID `TRANS_ID`, rcpu.PLANNING_UNIT_ID, LEFT(it.INVENTORY_DATE,7) `TRANS_DATE`, it.REGION_ID,
                null `FORECASTED_CONSUMPTION`, null `ACTUAL_CONSUMPTION`, null `SHIPMENT_QTY`, SUM(it.ADJUSTMENT_QTY*rcpu.MULTIPLIER) `ADJUSTMENT`,  SUM(it.ACTUAL_QTY*rcpu.MULTIPLIER) `STOCK`
            FROM (
                SELECT i.PROGRAM_ID, i.INVENTORY_ID, MAX(it.VERSION_ID) MAX_VERSION_ID FROM rm_inventory i LEFT JOIN rm_inventory_trans it ON i.INVENTORY_ID=it.INVENTORY_ID WHERE i.PROGRAM_ID=@programId AND it.VERSION_ID<=@versionId AND it.INVENTORY_TRANS_ID IS NOT NULL GROUP BY i.INVENTORY_ID
            ) ti
            LEFT JOIN rm_inventory i ON i.INVENTORY_ID=ti.INVENTORY_ID
            LEFT JOIN rm_inventory_trans it ON i.INVENTORY_ID=it.INVENTORY_ID AND ti.MAX_VERSION_ID=it.VERSION_ID
            LEFT JOIN rm_realm_country_planning_unit rcpu ON it.REALM_COUNTRY_PLANNING_UNIT_ID=rcpu.REALM_COUNTRY_PLANNING_UNIT_ID
            WHERE it.ACTIVE
            GROUP BY i.PROGRAM_ID, rcpu.PLANNING_UNIT_ID, it.INVENTORY_DATE, it.REGION_ID
        ) AS o GROUP BY o.PROGRAM_ID, o.PLANNING_UNIT_ID, o.TRANS_DATE, o.REGION_ID;
           
        -- Update the UseActualConsumption field = 1 
        -- IF All Regions have reported Consumption or if Sum(ActualConsumption)>Sum(ForecastedConsumption)
        -- ELSE UseActualConsumption field = 0
        UPDATE rm_nsp_region nspr LEFT JOIN (SELECT nspr.PLANNING_UNIT_ID, nspr.TRANS_DATE, SUM(IF(nspr.ACTUAL_CONSUMPTION IS NOT NULL, 1,0)) `COUNT_OF_ACTUAL_CONSUMPTION`, SUM(nspr.ACTUAL_CONSUMPTION) `TOTAL_ACTUAL_CONSUMPTION`, SUM(nspr.FORECASTED_CONSUMPTION) `TOTAL_FORECASTED_CONSUMPTION` FROM rm_nsp_region nspr WHERE nspr.PROGRAM_ID=@programId AND nspr.VERSION_ID=@versionId AND nspr.REGION_ID IS NOT NULL GROUP BY nspr.PLANNING_UNIT_ID, nspr.TRANS_DATE, nspr.REGION_ID) rcount ON nspr.PLANNING_UNIT_ID=rcount.PLANNING_UNIT_ID AND nspr.TRANS_DATE=rcount.TRANS_DATE SET nspr.USE_ACTUAL_CONSUMPTION=IF(rcount.COUNT_OF_ACTUAL_CONSUMPTION=@regionCount, 1, IF(rcount.TOTAL_ACTUAL_CONSUMPTION>rcount.TOTAL_FORECASTED_CONSUMPTION, 1, 0)) WHERE nspr.PROGRAM_ID=@programId AND nspr.VERSION_ID=@versionId AND nspr.REGION_ID IS NOT NULL;
        
        -- Update the RegionStockCount field based on the number of Regions that have reported Stock
        UPDATE rm_nsp_region nspr LEFT JOIN (SELECT nspr.PLANNING_UNIT_ID, nspr.TRANS_DATE, COUNT(nspr.STOCK) CNT FROM rm_nsp_region nspr WHERE nspr.PROGRAM_ID=@programId AND nspr.VERSION_ID=@versionId AND nspr.REGION_ID IS NOT NULL GROUP BY nspr.PLANNING_UNIT_ID, nspr.TRANS_DATE, nspr.REGION_ID) rcount ON nspr.PLANNING_UNIT_ID=rcount.PLANNING_UNIT_ID AND nspr.TRANS_DATE=rcount.TRANS_DATE SET nspr.REGION_STOCK_COUNT = rcount.CNT WHERE nspr.PROGRAM_ID=@programId AND nspr.VERSION_ID=@versionId AND nspr.REGION_ID IS NOT NULL;
        
        -- To get the range for AMC calculations
        -- SELECT MIN(sp.TRANS_DATE), ADDDATE(MAX(sp.TRANS_DATE), INTERVAL ppu.MONTHS_IN_PAST_FOR_AMC MONTH) INTO @startMonth, @stopMonth  FROM rm_supply_plan sp LEFT JOIN rm_program_planning_unit ppu ON sp.PROGRAM_ID=ppu.PROGRAM_ID AND sp.PLANNING_UNIT_ID=ppu.PLANNING_UNIT_ID WHERE sp.PROGRAM_ID=@programId and sp.VERSION_ID=@versionId;
    END IF;
    
    SELECT 
        nspr.PLANNING_UNIT_ID, nspr.TRANS_DATE, nspr.REGION_ID, nspr.FORECASTED_CONSUMPTION, nspr.ACTUAL_CONSUMPTION,
        nspr.USE_ACTUAL_CONSUMPTION, nspr.SHIPMENT, nspr.ADJUSTMENT, nspr.STOCK, nspr.REGION_STOCK_COUNT, 
        nspr.REGION_COUNT
    FROM rm_nsp_region nspr WHERE nspr.PROGRAM_ID=@programId AND nspr.VERSION_ID=@versionId;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `buildSimpleSupplyPlan` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `buildSimpleSupplyPlan`(PROGRAM_ID INT(10), VERSION_ID INT(10))
BEGIN
    SET @programId = PROGRAM_ID;
    SET @versionId = VERSION_ID;
    SET @cb = 0;
   
    DELETE spbi.* FROM rm_supply_plan_batch_info spbi WHERE spbi.PROGRAM_ID=@programId AND spbi.VERSION_ID=@versionId;
    DELETE sp.* FROM rm_supply_plan sp WHERE sp.PROGRAM_ID=@programId AND sp.VERSION_ID=@versionId;
   
    INSERT INTO rm_supply_plan (
        SUPPLY_PLAN_ID, VERSION_ID, PROGRAM_ID, PLANNING_UNIT_ID, TRANS_DATE, 
        BATCH_ID, FORECASTED_CONSUMPTION_QTY, ACTUAL_CONSUMPTION_QTY, 
        MANUAL_PLANNED_SHIPMENT_QTY, MANUAL_SUBMITTED_SHIPMENT_QTY, MANUAL_APPROVED_SHIPMENT_QTY, MANUAL_SHIPPED_SHIPMENT_QTY, MANUAL_RECEIVED_SHIPMENT_QTY, MANUAL_ONHOLD_SHIPMENT_QTY,
        ERP_PLANNED_SHIPMENT_QTY, ERP_SUBMITTED_SHIPMENT_QTY, ERP_APPROVED_SHIPMENT_QTY, ERP_SHIPPED_SHIPMENT_QTY, ERP_RECEIVED_SHIPMENT_QTY, ERP_ONHOLD_SHIPMENT_QTY,
        SHIPMENT_QTY, ADJUSTMENT_MULTIPLIED_QTY, STOCK_MULTIPLIED_QTY
    )
    SELECT 
        null, @versionId, oc.PROGRAM_ID, oc.PLANNING_UNIT_ID, oc.TRANS_DATE, 
        oc.BATCH_ID, oc.FORECASTED_CONSUMPTION, oc.ACTUAL_CONSUMPTION, 
        oc.MANUAL_PLANNED_SHIPMENT_QTY, oc.MANUAL_SUBMITTED_SHIPMENT_QTY, oc.MANUAL_APPROVED_SHIPMENT_QTY, oc.MANUAL_SHIPPED_SHIPMENT_QTY, oc.MANUAL_RECEIVED_SHIPMENT_QTY, oc.MANUAL_ONHOLD_SHIPMENT_QTY,
        oc.ERP_PLANNED_SHIPMENT_QTY, oc.ERP_SUBMITTED_SHIPMENT_QTY, oc.ERP_APPROVED_SHIPMENT_QTY, oc.ERP_SHIPPED_SHIPMENT_QTY, oc.ERP_RECEIVED_SHIPMENT_QTY, oc.ERP_ONHOLD_SHIPMENT_QTY,
        oc.SHIPMENT_QTY, oc.ADJUSTMENT_MULTIPLIED_QTY, oc.STOCK_MULTIPLIED_QTY
    FROM (
        SELECT 
            o.PROGRAM_ID, o.PLANNING_UNIT_ID, DATE(CONCAT(o.TRANS_DATE,"-01")) `TRANS_DATE`, o.BATCH_ID, SUM(IFNULL(o.FORECASTED_CONSUMPTION,0)) `FORECASTED_CONSUMPTION`, SUM(IFNULL(o.ACTUAL_CONSUMPTION,0)) `ACTUAL_CONSUMPTION`, 
            SUM(IFNULL(o.MANUAL_PLANNED_SHIPMENT_QTY,0)) `MANUAL_PLANNED_SHIPMENT_QTY`, SUM(IFNULL(o.MANUAL_SUBMITTED_SHIPMENT_QTY,0)) `MANUAL_SUBMITTED_SHIPMENT_QTY`, SUM(IFNULL(o.MANUAL_APPROVED_SHIPMENT_QTY,0)) `MANUAL_APPROVED_SHIPMENT_QTY`, SUM(IFNULL(o.MANUAL_SHIPPED_SHIPMENT_QTY,0)) `MANUAL_SHIPPED_SHIPMENT_QTY`, SUM(IFNULL(o.MANUAL_RECEIVED_SHIPMENT_QTY,0)) `MANUAL_RECEIVED_SHIPMENT_QTY`, SUM(IFNULL(o.MANUAL_ONHOLD_SHIPMENT_QTY,0)) `MANUAL_ONHOLD_SHIPMENT_QTY`, 
            SUM(IFNULL(o.ERP_PLANNED_SHIPMENT_QTY,0)) `ERP_PLANNED_SHIPMENT_QTY`, SUM(IFNULL(o.ERP_SUBMITTED_SHIPMENT_QTY,0)) `ERP_SUBMITTED_SHIPMENT_QTY`, SUM(IFNULL(o.ERP_APPROVED_SHIPMENT_QTY,0)) `ERP_APPROVED_SHIPMENT_QTY`, SUM(IFNULL(o.ERP_SHIPPED_SHIPMENT_QTY,0)) `ERP_SHIPPED_SHIPMENT_QTY`, SUM(IFNULL(o.ERP_RECEIVED_SHIPMENT_QTY,0)) `ERP_RECEIVED_SHIPMENT_QTY`, SUM(IFNULL(o.ERP_ONHOLD_SHIPMENT_QTY,0)) `ERP_ONHOLD_SHIPMENT_QTY`, 
            SUM(IFNULL(o.SHIPMENT_QTY,0)) `SHIPMENT_QTY`, SUM(IFNULL(o.ADJUSTMENT_MULTIPLIED_QTY,0)) `ADJUSTMENT_MULTIPLIED_QTY`, SUM(IFNULL(o.STOCK_MULTIPLIED_QTY,0)) `STOCK_MULTIPLIED_QTY` 
        FROM (
            SELECT 
                '2' `TRANS_TYPE`, c1.PROGRAM_ID, c1.CONSUMPTION_ID `TRANS_ID`, c1.PLANNING_UNIT_ID, LEFT(c1.CONSUMPTION_DATE, 7) `TRANS_DATE`, 
                c1.BATCH_ID, c1.EXPIRY_DATE, SUM(FORECASTED_CONSUMPTION) `FORECASTED_CONSUMPTION`, SUM(ACTUAL_CONSUMPTION) `ACTUAL_CONSUMPTION`, 
                null `MANUAL_PLANNED_SHIPMENT_QTY`, null `MANUAL_SUBMITTED_SHIPMENT_QTY`, null `MANUAL_APPROVED_SHIPMENT_QTY`, null `MANUAL_SHIPPED_SHIPMENT_QTY`, null `MANUAL_RECEIVED_SHIPMENT_QTY`, null `MANUAL_ONHOLD_SHIPMENT_QTY`, 
                null `ERP_PLANNED_SHIPMENT_QTY`, null `ERP_SUBMITTED_SHIPMENT_QTY`, null `ERP_APPROVED_SHIPMENT_QTY`, null `ERP_SHIPPED_SHIPMENT_QTY`, null `ERP_RECEIVED_SHIPMENT_QTY`, null `ERP_ONHOLD_SHIPMENT_QTY`, 
                null `SHIPMENT_QTY`, null `ADJUSTMENT_MULTIPLIED_QTY`, null  `STOCK_MULTIPLIED_QTY` 
            FROM (
                SELECT 
                    c.PROGRAM_ID, c.CONSUMPTION_ID, ct.REGION_ID, ct.PLANNING_UNIT_ID, ct.CONSUMPTION_DATE, 
                    ifnull(ctbi.BATCH_ID,0) `BATCH_ID`, ifnull(bi.EXPIRY_DATE,@defaultExpDate) `EXPIRY_DATE`, ct.ACTIVE, SUM(IF(ct.ACTUAL_FLAG=1, COALESCE(ctbi.CONSUMPTION_QTY, ct.CONSUMPTION_QTY),null)) `ACTUAL_CONSUMPTION`, 
                    SUM(IF(ct.ACTUAL_FLAG=0, COALESCE(ctbi.CONSUMPTION_QTY, ct.CONSUMPTION_QTY),null)) `FORECASTED_CONSUMPTION`
                FROM (
                    SELECT c.CONSUMPTION_ID, MAX(ct.VERSION_ID) MAX_VERSION_ID 
                    FROM rm_consumption c
                    LEFT JOIN rm_consumption_trans ct ON c.CONSUMPTION_ID=ct.CONSUMPTION_ID
                    WHERE c.PROGRAM_ID=@programId AND ct.VERSION_ID<=@versionId AND ct.CONSUMPTION_TRANS_ID IS NOT NULL
                    GROUP BY c.CONSUMPTION_ID
                ) tc
                LEFT JOIN rm_consumption c ON c.CONSUMPTION_ID=tc.CONSUMPTION_ID
                LEFT JOIN rm_consumption_trans ct ON c.CONSUMPTION_ID=ct.CONSUMPTION_ID AND tc.MAX_VERSION_ID=ct.VERSION_ID
                LEFT JOIN rm_consumption_trans_batch_info ctbi ON ct.CONSUMPTION_TRANS_ID=ctbi.CONSUMPTION_TRANS_ID
                LEFT JOIN rm_batch_info bi ON ctbi.BATCH_ID=bi.BATCH_ID
                WHERE ct.ACTIVE
                GROUP BY c.PROGRAM_ID, ct.REGION_ID, ct.PLANNING_UNIT_ID, ct.CONSUMPTION_DATE, ifnull(ctbi.BATCH_ID,0)
            ) c1 
            GROUP BY c1.PROGRAM_ID, c1.PLANNING_UNIT_ID, c1.CONSUMPTION_DATE, c1.BATCH_ID

            UNION

            SELECT 
                '1' `TRANS_TYPE`, s.PROGRAM_ID, s.SHIPMENT_ID `TRANS_ID`, st.PLANNING_UNIT_ID, LEFT(COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE),7) `TRANS_DATE`, 
                ifnull(stbi.BATCH_ID,0) `BATCH_ID`, ifnull(bi.EXPIRY_DATE, @defaultExpDate) `EXPIRY_DATE`, null `FORECASTED_CONSUMPTION`, null `ACTUAL_CONSUMPTION`, 
                SUM(IF((st.ERP_FLAG IS NULL OR st.ERP_FLAG=0) AND st.SHIPMENT_STATUS_ID = 1, COALESCE(stbi.BATCH_SHIPMENT_QTY ,st.SHIPMENT_QTY),0)) `MANUAL_PLANNED_SHIPMENT_QTY`, 
                SUM(IF((st.ERP_FLAG IS NULL OR st.ERP_FLAG=0) AND st.SHIPMENT_STATUS_ID = 3, COALESCE(stbi.BATCH_SHIPMENT_QTY ,st.SHIPMENT_QTY),0)) `MANUAL_SUBMITTED_SHIPMENT_QTY`, 
                SUM(IF((st.ERP_FLAG IS NULL OR st.ERP_FLAG=0) AND st.SHIPMENT_STATUS_ID = 4, COALESCE(stbi.BATCH_SHIPMENT_QTY ,st.SHIPMENT_QTY),0)) `MANUAL_APPROVED_SHIPMENT_QTY`, 
                SUM(IF((st.ERP_FLAG IS NULL OR st.ERP_FLAG=0) AND st.SHIPMENT_STATUS_ID IN (5,6), COALESCE(stbi.BATCH_SHIPMENT_QTY ,st.SHIPMENT_QTY),0)) `MANUAL_SHIPPED_SHIPMENT_QTY`, 
                SUM(IF((st.ERP_FLAG IS NULL OR st.ERP_FLAG=0) AND st.SHIPMENT_STATUS_ID = 7, COALESCE(stbi.BATCH_SHIPMENT_QTY ,st.SHIPMENT_QTY),0)) `MANUAL_RECEIVED_SHIPMENT_QTY`, 
                SUM(IF((st.ERP_FLAG IS NULL OR st.ERP_FLAG=0) AND st.SHIPMENT_STATUS_ID = 9, COALESCE(stbi.BATCH_SHIPMENT_QTY ,st.SHIPMENT_QTY),0)) `MANUAL_ONHOLD_SHIPMENT_QTY`, 
                SUM(IF(st.ERP_FLAG = 1 AND st.SHIPMENT_STATUS_ID = 1, COALESCE(stbi.BATCH_SHIPMENT_QTY ,st.SHIPMENT_QTY),0)) `ERP_PLANNED_SHIPMENT_QTY`, 
                SUM(IF(st.ERP_FLAG = 1 AND st.SHIPMENT_STATUS_ID = 3, COALESCE(stbi.BATCH_SHIPMENT_QTY ,st.SHIPMENT_QTY),0)) `ERP_SUBMITTED_SHIPMENT_QTY`, 
                SUM(IF(st.ERP_FLAG = 1 AND st.SHIPMENT_STATUS_ID = 4, COALESCE(stbi.BATCH_SHIPMENT_QTY ,st.SHIPMENT_QTY),0)) `ERP_APPROVED_SHIPMENT_QTY`, 
                SUM(IF(st.ERP_FLAG = 1 AND st.SHIPMENT_STATUS_ID IN (5,6), COALESCE(stbi.BATCH_SHIPMENT_QTY ,st.SHIPMENT_QTY),0)) `ERP_SHIPPED_SHIPMENT_QTY`, 
                SUM(IF(st.ERP_FLAG = 1 AND st.SHIPMENT_STATUS_ID = 7, COALESCE(stbi.BATCH_SHIPMENT_QTY ,st.SHIPMENT_QTY),0)) `ERP_RECEIVED_SHIPMENT_QTY`, 
                SUM(IF(st.ERP_FLAG = 1 AND st.SHIPMENT_STATUS_ID = 9, COALESCE(stbi.BATCH_SHIPMENT_QTY ,st.SHIPMENT_QTY),0)) `ERP_ONHOLD_SHIPMENT_QTY`, 
                SUM(COALESCE(stbi.BATCH_SHIPMENT_QTY ,st.SHIPMENT_QTY)) `SHIPMENT_QTY`, null  `ADJUSTMENT_MULTIPLIED_QTY`, null  `STOCK_MULTIPLIED_QTY`
            FROM (
                SELECT s.PROGRAM_ID, s.SHIPMENT_ID, MAX(st.VERSION_ID) MAX_VERSION_ID
                FROM rm_shipment s
                LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID
                WHERE s.PROGRAM_ID=@programId AND st.VERSION_ID<=@versionId AND st.SHIPMENT_TRANS_ID IS NOT NULL 
                GROUP BY s.SHIPMENT_ID
            ) ts
            LEFT JOIN rm_shipment s ON s.SHIPMENT_ID=ts.SHIPMENT_ID
            LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND ts.MAX_VERSION_ID=st.VERSION_ID
            LEFT JOIN rm_shipment_trans_batch_info stbi ON st.SHIPMENT_TRANS_ID=stbi.SHIPMENT_TRANS_ID
            LEFT JOIN rm_batch_info bi ON stbi.BATCH_ID=bi.BATCH_ID
            WHERE st.ACTIVE AND st.ACCOUNT_FLAG AND st.SHIPMENT_STATUS_ID!=8 
            GROUP BY s.PROGRAM_ID, st.PLANNING_UNIT_ID, COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE), ifnull(stbi.BATCH_ID,0)

            UNION

            SELECT 
                '3' `TRANS_TYPE`, i.PROGRAM_ID, i.INVENTORY_ID `TRANS_ID`, rcpu.PLANNING_UNIT_ID, LEFT(it.INVENTORY_DATE,7) `TRANS_DATE`, 
                ifnull(itbi.BATCH_ID,0) `BATCH_ID`, IFNULL(bi.EXPIRY_DATE, @defaultExpDate) `EXPIRY_DATE`, null `FORECASTED_CONSUMPTION`, null `ACTUAL_CONSUMPTION`, 
                null `MANUAL_PLANNED_SHIPMENT_QTY`, null `MANUAL_SUBMITTED_SHIPMENT_QTY`, null `MANUAL_APPROVED_SHIPMENT_QTY`, null `MANUAL_SHIPPED_SHIPMENT_QTY`, null `MANUAL_RECEIVED_SHIPMENT_QTY`, null `MANUAL_ONHOLD_SHIPMENT_QTY`, 
                null `ERP_PLANNED_SHIPMENT_QTY`, null `ERP_SUBMITTED_SHIPMENT_QTY`, null `ERP_APPROVED_SHIPMENT_QTY`, null `ERP_SHIPPED_SHIPMENT_QTY`, null `ERP_RECEIVED_SHIPMENT_QTY`, null `ERP_ONHOLD_SHIPMENT_QTY`, 
                null `SHIPMENT_QTY`, SUM(COALESCE(itbi.ADJUSTMENT_QTY, it.ADJUSTMENT_QTY)*rcpu.MULTIPLIER) `ADJUSTMENT_MULTIPLIED_QTY`,  SUM(COALESCE(itbi.ACTUAL_QTY, it.ACTUAL_QTY)*rcpu.MULTIPLIER) `STOCK_MULTIPLIED_QTY`
            FROM (
                SELECT i.PROGRAM_ID, i.INVENTORY_ID, MAX(it.VERSION_ID) MAX_VERSION_ID
                FROM rm_inventory i
                LEFT JOIN rm_inventory_trans it ON i.INVENTORY_ID=it.INVENTORY_ID
                WHERE i.PROGRAM_ID=@programId AND it.VERSION_ID<=@versionId AND it.INVENTORY_TRANS_ID IS NOT NULL 
                GROUP BY i.INVENTORY_ID
            ) ti
            LEFT JOIN rm_inventory i ON i.INVENTORY_ID=ti.INVENTORY_ID
            LEFT JOIN rm_inventory_trans it ON i.INVENTORY_ID=it.INVENTORY_ID AND ti.MAX_VERSION_ID=it.VERSION_ID
            LEFT JOIN rm_inventory_trans_batch_info itbi ON it.INVENTORY_TRANS_ID=itbi.INVENTORY_TRANS_ID
            LEFT JOIN rm_batch_info bi ON itbi.BATCH_ID=bi.BATCH_ID
            LEFT JOIN rm_realm_country_planning_unit rcpu ON it.REALM_COUNTRY_PLANNING_UNIT_ID=rcpu.REALM_COUNTRY_PLANNING_UNIT_ID
            WHERE it.ACTIVE
            GROUP BY i.PROGRAM_ID, rcpu.PLANNING_UNIT_ID, it.INVENTORY_DATE, ifnull(itbi.BATCH_ID,0)
        ) AS o GROUP BY o.PROGRAM_ID, o.PLANNING_UNIT_ID, o.TRANS_DATE, o.BATCH_ID
    ) oc;
       
    -- Get the Region count for this Program
    SELECT count(*) into @regionCount FROM rm_program_region pr WHERE pr.PROGRAM_ID=@programId;
    
    -- Update if the Consumption that is to be used for the month is Actual or Forecasted
    UPDATE rm_supply_plan sp LEFT JOIN (SELECT PLANNING_UNIT_ID, CONSUMPTION_DATE, IF(@regionCount<=SUM(IF(ACTUAL_CONSUMPTION IS NOT NULL, 1,0)), 1 , IF(IFNULL(SUM(ACTUAL_CONSUMPTION),0)>IFNULL(SUM(FORECASTED_CONSUMPTION),0), 1, 0)) `ACTUAL` FROM (SELECT ct.PLANNING_UNIT_ID, ct.CONSUMPTION_DATE, ct.REGION_ID, SUM(IF(ct.ACTUAL_FLAG, ct.CONSUMPTION_QTY, null)) ACTUAL_CONSUMPTION, SUM(IF(ct.ACTUAL_FLAG=0, ct.CONSUMPTION_QTY, null)) FORECASTED_CONSUMPTION FROM (SELECT c.CONSUMPTION_ID, MAX(ct.VERSION_ID) MAX_VERSION_ID  FROM rm_consumption c LEFT JOIN rm_consumption_trans ct ON c.CONSUMPTION_ID=ct.CONSUMPTION_ID WHERE c.PROGRAM_ID=@programId AND ct.VERSION_ID<=@versionId AND ct.CONSUMPTION_TRANS_ID IS NOT NULL GROUP BY c.CONSUMPTION_ID) tc LEFT JOIN rm_consumption c ON c.CONSUMPTION_ID=tc.CONSUMPTION_ID LEFT JOIN rm_consumption_trans ct ON c.CONSUMPTION_ID=ct.CONSUMPTION_ID AND tc.MAX_VERSION_ID=ct.VERSION_ID WHERE ct.ACTIVE GROUP BY ct.PLANNING_UNIT_ID, ct.CONSUMPTION_DATE, ct.REGION_ID) c2 GROUP BY c2.PLANNING_UNIT_ID, CONSUMPTION_DATE) spa ON sp.PLANNING_UNIT_ID=spa.PLANNING_UNIT_ID AND sp.TRANS_DATE=spa.CONSUMPTION_DATE SET sp.ACTUAL=spa.ACTUAL;
     
    SELECT MIN(sp.TRANS_DATE), ADDDATE(MAX(sp.TRANS_DATE), INTERVAL ppu.MONTHS_IN_PAST_FOR_AMC MONTH) INTO @startMonth, @stopMonth  FROM rm_supply_plan sp LEFT JOIN rm_program_planning_unit ppu ON sp.PROGRAM_ID=ppu.PROGRAM_ID AND sp.PLANNING_UNIT_ID=ppu.PLANNING_UNIT_ID WHERE sp.PROGRAM_ID=@programId and sp.VERSION_ID=@versionId;

    INSERT INTO rm_supply_plan_batch_info (
        PROGRAM_ID, VERSION_ID, PLANNING_UNIT_ID, BATCH_ID, TRANS_DATE, EXPIRY_DATE, 
        MANUAL_PLANNED_SHIPMENT_QTY, MANUAL_SUBMITTED_SHIPMENT_QTY, MANUAL_APPROVED_SHIPMENT_QTY, MANUAL_SHIPPED_SHIPMENT_QTY, MANUAL_RECEIVED_SHIPMENT_QTY, MANUAL_ONHOLD_SHIPMENT_QTY, 
        ERP_PLANNED_SHIPMENT_QTY, ERP_SUBMITTED_SHIPMENT_QTY, ERP_APPROVED_SHIPMENT_QTY, ERP_SHIPPED_SHIPMENT_QTY, ERP_RECEIVED_SHIPMENT_QTY, ERP_ONHOLD_SHIPMENT_QTY, 
        SHIPMENT_QTY, ACTUAL, ACTUAL_CONSUMPTION_QTY, FORECASTED_CONSUMPTION_QTY, ADJUSTMENT_MULTIPLIED_QTY, STOCK_MULTIPLIED_QTY)
    SELECT
        @programId `PROGRAM_ID`, @versionId `VERSION_ID`, m3.PLANNING_UNIT_Id,  m3.BATCH_ID, m3.MONTH `TRANS_DATE`, IFNULL(bi.EXPIRY_DATE, '2099-12-31') `EXPIRY_DATE`, 
        IFNULL(sp.MANUAL_PLANNED_SHIPMENT_QTY,0) `MANUAL_PLANNED_SHIPMENT_QTY`, IFNULL(sp.MANUAL_SUBMITTED_SHIPMENT_QTY,0) `MANUAL_SUBMITTED_SHIPMENT_QTY`, IFNULL(sp.MANUAL_APPROVED_SHIPMENT_QTY,0) `MANUAL_APPROVED_SHIPMENT_QTY`,IFNULL(sp.MANUAL_SHIPPED_SHIPMENT_QTY,0) `MANUAL_SHIPPED_SHIPMENT_QTY`, IFNULL(sp.MANUAL_RECEIVED_SHIPMENT_QTY,0) `MANUAL_RECEIVED_SHIPMENT_QTY`, IFNULL(sp.MANUAL_ONHOLD_SHIPMENT_QTY,0) `MANUAL_ONHOLD_SHIPMENT_QTY`, 
        IFNULL(sp.ERP_PLANNED_SHIPMENT_QTY,0) `ERP_PLANNED_SHIPMENT_QTY`, IFNULL(sp.ERP_SUBMITTED_SHIPMENT_QTY,0) `ERP_SUBMITTED_SHIPMENT_QTY`, IFNULL(sp.ERP_APPROVED_SHIPMENT_QTY,0) `ERP_APPROVED_SHIPMENT_QTY`,IFNULL(sp.ERP_SHIPPED_SHIPMENT_QTY,0) `ERP_SHIPPED_SHIPMENT_QTY`, IFNULL(sp.ERP_RECEIVED_SHIPMENT_QTY,0) `ERP_RECEIVED_SHIPMENT_QTY`, IFNULL(sp.ERP_ONHOLD_SHIPMENT_QTY,0) `ERP_ONHOLD_SHIPMENT_QTY`, 
        IFNULL(sp.SHIPMENT_QTY,0) `SHIPMENT_QTY`, sp.ACTUAL, IFNULL(sp.ACTUAL_CONSUMPTION_QTY, 0) `ACTUAL_CONSUMPTION_QTY`, IFNULL(sp.FORECASTED_CONSUMPTION_QTY,0) `FORECASTED_CONSUMPTION_QTY`, IFNULL(sp.ADJUSTMENT_MULTIPLIED_QTY,0) `ADJUSTMENT_MULTIPLIED_QTY`, IFNULL(sp.STOCK_MULTIPLIED_QTY,0) `STOCK_MULTIPLIED_QTY`
    FROM (
        SELECT
            m.PLANNING_UNIT_ID, m.BATCH_ID, mn.MONTH
        FROM (
            SELECT
                sp.PLANNING_UNIT_ID, sp.BATCH_ID
            FROM rm_supply_plan sp
            WHERE sp.PROGRAM_ID=@programId and sp.VERSION_ID=@versionId
            GROUP BY sp.PLANNING_UNIT_ID, sp.BATCH_ID
        ) m JOIN mn ON mn.MONTH BETWEEN @startMonth AND @stopMonth
    ) m3
    LEFT JOIN rm_supply_plan sp ON m3.PLANNING_UNIT_ID=sp.PLANNING_UNIT_ID AND m3.BATCH_ID=sp.BATCH_ID AND m3.MONTH=sp.TRANS_DATE
    LEFT JOIN rm_batch_info bi ON m3.BATCH_ID=bi.BATCH_ID
    ORDER BY m3.PLANNING_UNIT_ID, `TRANS_DATE`, IF(m3.BATCH_ID=0,9999999999,m3.BATCH_ID), `SHIPMENT_QTY`;

--    UPDATE rm_supply_plan_batch_info spbi LEFT JOIN rm_supply_plan sp ON spbi.PLANNING_UNIT_ID=sp.PLANNING_UNIT_ID AND spbi.TRANS_DATE=sp.TRANS_DATE SET spbi.ACTUAL=sp.ACTUAL WHERE sp.ACTUAL IS NOT NULL;       
    
    SELECT
        spbi.`SUPPLY_PLAN_BATCH_INFO_ID`, spbi.`PROGRAM_ID`, spbi.`VERSION_ID`, spbi.`PLANNING_UNIT_ID`, spbi.`BATCH_ID`, spbi.`TRANS_DATE`, spbi.`EXPIRY_DATE`, 
        spbi.`MANUAL_PLANNED_SHIPMENT_QTY`, spbi.`MANUAL_SUBMITTED_SHIPMENT_QTY`, spbi.`MANUAL_APPROVED_SHIPMENT_QTY`, spbi.`MANUAL_SHIPPED_SHIPMENT_QTY`, spbi.`MANUAL_RECEIVED_SHIPMENT_QTY`, spbi.`MANUAL_ONHOLD_SHIPMENT_QTY`, 
        spbi.`ERP_PLANNED_SHIPMENT_QTY`, spbi.`ERP_SUBMITTED_SHIPMENT_QTY`, spbi.`ERP_APPROVED_SHIPMENT_QTY`, spbi.`ERP_SHIPPED_SHIPMENT_QTY`, spbi.`ERP_RECEIVED_SHIPMENT_QTY`, spbi.`ERP_ONHOLD_SHIPMENT_QTY`, 
        spbi.`SHIPMENT_QTY`, IF (spbi.`ACTUAL`=1, spbi.`ACTUAL_CONSUMPTION_QTY`, spbi.`FORECASTED_CONSUMPTION_QTY`) `CONSUMPTION`, spbi.`ADJUSTMENT_MULTIPLIED_QTY`, spbi.`STOCK_MULTIPLIED_QTY`
    FROM rm_supply_plan_batch_info spbi
    WHERE spbi.PROGRAM_ID=@programId AND spbi.VERSION_ID=@versionId
    ORDER BY spbi.PLANNING_UNIT_ID, spbi.TRANS_DATE, spbi.EXPIRY_DATE, IF(spbi.BATCH_ID=0, 9999999999,spbi.BATCH_ID);
    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `buildStockBalances` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `buildStockBalances`(VAR_PROGRAM_ID int(10), VAR_VERSION_ID int(10))
BEGIN
	DECLARE cursor_TRANS_DATE DATE;
	DECLARE cursor_CONSUMPTION INT;
	DECLARE done INT DEFAULT FALSE;
	DECLARE cursor_i CURSOR FOR SELECT spbi.TRANS_DATE, SUM(spbi.FORECASTED_CONSUMPTION_QTY+spbi.EXPIRED_CONSUMPTION) CONSUMPTION FROM rm_supply_plan_batch_info spbi WHERE spbi.PROGRAM_ID=VAR_PROGRAM_ID AND spbi.VERSION_ID=VAR_VERSION_ID GROUP BY spbi.TRANS_DATE HAVING SUM(spbi.FORECASTED_CONSUMPTION_QTY)>0 OR SUM(spbi.EXPIRED_CONSUMPTION)>0;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
	SET @error = false;
	OPEN cursor_i;
	read_loop: LOOP
    FETCH cursor_i INTO cursor_TRANS_DATE, cursor_CONSUMPTION;
    IF done THEN
      LEAVE read_loop;
    END IF;
    -- For each loop calculate the Consumption that should have been done based on the ExpiredConsumption
    SET @unAccountedConsumption = cursor_CONSUMPTION;
    SET @transDate = cursor_TRANS_DATE;

    UPDATE (
		SELECT 
			spbi.SUPPLY_PLAN_BATCH_INFO_ID,
            spbi.BATCH_ID,
            spbi.EXPIRY_DATE,
            spbi.FINAL_CLOSING_BALANCE,
			@unAccountedConsumption `UNACCOUNTED_CONSUMPTION`,
            IF(spbi.FINAL_CLOSING_BALANCE>@unAccountedConsumption, @unAccountedConsumption, spbi.FINAL_CLOSING_BALANCE) `CALCULATED_CONSUMPTION`, 
			@unAccountedConsumption:=@unAccountedConsumption-IF(spbi.FINAL_CLOSING_BALANCE>@unAccountedConsumption, @unAccountedConsumption, spbi.FINAL_CLOSING_BALANCE)
		FROM (SELECT * FROM rm_supply_plan_batch_info WHERE PROGRAM_ID=@programId AND VERSION_ID=@versionId AND TRANS_DATE=@transDate AND CLOSING_BALANCE>0 ORDER BY EXPIRY_DATE, IF(BATCH_ID=0, 9999999999, BATCH_ID)) spbi 
	) cs 
    LEFT JOIN rm_supply_plan_batch_info spbi2 ON cs.SUPPLY_PLAN_BATCH_INFO_ID=spbi2.SUPPLY_PLAN_BATCH_INFO_ID
 	SET spbi2.CALCULATED_CONSUMPTION=cs.CALCULATED_CONSUMPTION;
	-- If unAccountedConsumption is greated that zero it means there was some consumption that it could not allocate because it ran out of stock
    -- therefore save it as unMetDemand
    UPDATE rm_supply_plan_batch_info spbi SET spbi.UNMET_DEMAND = @unAccountedConsumption WHERE spbi.TRANS_DATE=@transDate AND spbi.BATCH_ID=0 AND spbi.PROGRAM_ID=VAR_PROGRAM_ID AND spbi.VERSION_ID=VAR_VERSION_ID;
-- 	IF @unAccountedConsumption>0 THEN 
-- 		SET @error = true;
-- 		LEAVE read_loop;
-- 	END IF;
    -- Now let the new Final Opening and Closing Stock Balances percolate down
    SET @oldBatchId = -1;
	SET @oldBatchId = -1;
	UPDATE rm_supply_plan_batch_info spbi 
	LEFT JOIN (
		SELECT 
			spbi.SUPPLY_PLAN_BATCH_INFO_ID, 
			IF(@oldBatchId!=spbi.BATCH_ID, @cb:=0, @cb:=@cb) `OB`, IF(spbi.TRANS_DATE>=spbi.EXPIRY_DATE, @cb, 0) `EXPIRED_STOCK`,
			IF(spbi.TRANS_DATE>=spbi.EXPIRY_DATE,spbi.ACTUAL_CONSUMPTION_QTY,0) `EXPIRED_CONSUMPTION`, @cb:=@cb+spbi.SHIPMENT_QTY-IF(spbi.TRANS_DATE>=spbi.EXPIRY_DATE,0,spbi.ACTUAL_CONSUMPTION_QTY)+spbi.ADJUSTMENT_MULTIPLIED_QTY-IF(spbi.TRANS_DATE>=spbi.EXPIRY_DATE, @cb, 0)-IFNULL(spbi.CALCULATED_CONSUMPTION,0) `CB`, 
			@oldBatchId := spbi.BATCH_ID 
		FROM rm_supply_plan_batch_info spbi ORDER BY spbi.EXPIRY_DATE, IF(spbi.BATCH_ID=0, 9999999999,spbi.BATCH_ID), spbi.TRANS_DATE
	) spbic ON spbi.SUPPLY_PLAN_BATCH_INFO_ID=spbic.SUPPLY_PLAN_BATCH_INFO_ID
	SET 
		spbi.FINAL_OPENING_BALANCE=spbic.`OB`, 
		spbi.FINAL_CLOSING_BALANCE=spbic.`CB`,
		spbi.EXPIRED_STOCK=spbic.`EXPIRED_STOCK`;

  END LOOP;
  CLOSE cursor_i;
  IF @error = true THEN 
	SELECT @transDate, @unAccountedConsumption, @error;
  ELSE 
	SELECT null, 0, false;
  END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `buildSupplyPlan` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `buildSupplyPlan`(PROGRAM_ID INT(10), VERSION_ID INT(10))
BEGIN
	SET @programId = PROGRAM_Id;
    SET @versionId = VERSION_ID;
    SET @cb = 0;
    
    DELETE spbi.* FROM rm_supply_plan_batch_info spbi WHERE spbi.PROGRAM_ID=@programId AND spbi.VERSION_ID=@versionId;
    DELETE sp.* FROM rm_supply_plan sp WHERE sp.PROGRAM_ID=@programId AND sp.VERSION_ID=@versionId;
    
	INSERT INTO rm_supply_plan (SUPPLY_PLAN_ID, VERSION_ID, PROGRAM_ID, PLANNING_UNIT_ID, TRANS_DATE, BATCH_ID, FORECASTED_CONSUMPTION_QTY, ACTUAL_CONSUMPTION_QTY, SHIPMENT_QTY, ADJUSTMENT_MULTIPLIED_QTY, ACTUAL_MULTIPLIED_QTY, OPENING_BALANCE, CLOSING_BALANCE)
	SELECT null, 1, oc.PROGRAM_ID, oc.PLANNING_UNIT_ID, oc.TRANS_DATE, oc.BATCH_ID, oc.FORECASTED_CONSUMPTION, oc.ACTUAL_CONSUMPTION, oc.SHIPMENT_QTY, oc.ADJUSTMENT_MULTIPLIED_QTY, oc.ACTUAL_MULTIPLIED_QTY, @cb, @cb:=@cb-oc.FORECASTED_CONSUMPTION-oc.ACTUAL_CONSUMPTION+oc.SHIPMENT_QTY+oc.ADJUSTMENT_MULTIPLIED_QTY FROM (
	SELECT o.PROGRAM_ID, o.PLANNING_UNIT_ID, DATE(CONCAT(o.TRANS_DATE,"-01")) `TRANS_DATE`, o.BATCH_ID, SUM(IFNULL(o.FORECASTED_CONSUMPTION,0)) `FORECASTED_CONSUMPTION`, SUM(IFNULL(o.ACTUAL_CONSUMPTION,0)) `ACTUAL_CONSUMPTION`, SUM(IFNULL(o.SHIPMENT_QTY,0)) `SHIPMENT_QTY`, SUM(IFNULL(o.ADJUSTMENT_MULTIPLIED_QTY,0)) `ADJUSTMENT_MULTIPLIED_QTY`, SUM(IFNULL(o.ACTUAL_MULTIPLIED_QTY,0)) `ACTUAL_MULTIPLIED_QTY` FROM (
		-- Consumption
		SELECT '2' `TRANS_TYPE`, c1.PROGRAM_ID, c1.CONSUMPTION_ID `TRANS_ID`, c1.PLANNING_UNIT_ID, LEFT(c1.CONSUMPTION_DATE, 7) `TRANS_DATE`, c1.BATCH_ID, c1.EXPIRY_DATE, SUM(FORECASTED_CONSUMPTION) `FORECASTED_CONSUMPTION`, SUM(ACTUAL_CONSUMPTION) `ACTUAL_CONSUMPTION`, null `SHIPMENT_QTY`, null  `ADJUSTMENT_MULTIPLIED_QTY`, null  `ACTUAL_MULTIPLIED_QTY` FROM (
		SELECT c.PROGRAM_ID, c.CONSUMPTION_ID, ct.REGION_ID, ct.PLANNING_UNIT_ID, ct.CONSUMPTION_DATE, ca.ACTUAL, ifnull(ctbi.BATCH_ID,0) `BATCH_ID`, ifnull(bi.EXPIRY_DATE,@defaultExpDate) `EXPIRY_DATE`, ct.ACTIVE, SUM(IF(ct.ACTUAL_FLAG=1, COALESCE(ctbi.CONSUMPTION_QTY, ct.CONSUMPTION_QTY),null)) `ACTUAL_CONSUMPTION`, SUM(IF(ct.ACTUAL_FLAG=0, COALESCE(ctbi.CONSUMPTION_QTY, ct.CONSUMPTION_QTY),null)) `FORECASTED_CONSUMPTION`
			FROM (
				SELECT c.CONSUMPTION_ID, MAX(ct.VERSION_ID) MAX_VERSION_ID 
				FROM rm_consumption c 
				LEFT JOIN rm_consumption_trans ct ON c.CONSUMPTION_ID=ct.CONSUMPTION_ID 
				WHERE c.PROGRAM_ID=@programId AND ct.VERSION_ID<=@versionId AND ct.CONSUMPTION_TRANS_ID IS NOT NULL AND ct.ACTIVE GROUP BY c.CONSUMPTION_ID
			) tc 
		LEFT JOIN rm_consumption c ON c.CONSUMPTION_ID=tc.CONSUMPTION_ID
		LEFT JOIN rm_consumption_trans ct ON c.CONSUMPTION_ID=ct.CONSUMPTION_ID AND tc.MAX_VERSION_ID=ct.VERSION_ID
		LEFT JOIN (SELECT ct.PLANNING_UNIT_ID, ct.CONSUMPTION_DATE, bit_OR(ct.ACTUAL_FLAG=1 AND ct.CONSUMPTION_QTY>0) ACTUAL FROM (SELECT c.CONSUMPTION_ID, MAX(ct.VERSION_ID) MAX_VERSION_ID  FROM rm_consumption c LEFT JOIN rm_consumption_trans ct ON c.CONSUMPTION_ID=ct.CONSUMPTION_ID WHERE c.PROGRAM_ID=@programId AND ct.VERSION_ID<=@versionId AND ct.CONSUMPTION_TRANS_ID IS NOT NULL AND ct.ACTIVE GROUP BY c.CONSUMPTION_ID) tc LEFT JOIN rm_consumption c ON c.CONSUMPTION_ID=tc.CONSUMPTION_ID LEFT JOIN rm_consumption_trans ct ON c.CONSUMPTION_ID=ct.CONSUMPTION_ID AND tc.MAX_VERSION_ID=ct.VERSION_ID GROUP BY ct.PLANNING_UNIT_ID, ct.CONSUMPTION_DATE) ca ON ct.PLANNING_UNIT_ID=ca.PLANNING_UNIT_ID AND ct.CONSUMPTION_DATE=ca.CONSUMPTION_DATE and ct.ACTUAL_FLAG=ca.ACTUAL
		LEFT JOIN rm_consumption_trans_batch_info ctbi ON ct.CONSUMPTION_TRANS_ID=ctbi.CONSUMPTION_TRANS_ID
		LEFT JOIN rm_batch_info bi ON ctbi.BATCH_ID=bi.BATCH_ID
		GROUP BY c.PROGRAM_ID, ct.REGION_ID, ct.PLANNING_UNIT_ID, ct.CONSUMPTION_DATE, ifnull(ctbi.BATCH_ID,0)) c1 WHERE c1.ACTUAL IS NOT NULL GROUP BY c1.PROGRAM_ID, c1.PLANNING_UNIT_ID, c1.CONSUMPTION_DATE, c1.BATCH_ID

		UNION 
		-- Shipment
		SELECT '1' `TRANS_TYPE`, s.PROGRAM_ID, s.SHIPMENT_ID `TRANS_ID`, st.PLANNING_UNIT_ID, LEFT(COALESCE(st.DELIVERED_DATE, st.EXPECTED_DELIVERY_DATE),7) `TRANS_DATE`, ifnull(stbi.BATCH_ID,0) `BATCH_ID`, ifnull(bi.EXPIRY_DATE, @defaultExpDate) `EXPIRY_DATE`, null `FORECASTED_CONSUMPTION`, null `ACTUAL_CONSUMPTION`, SUM(COALESCE(stbi.BATCH_SHIPMENT_QTY ,st.SHIPMENT_QTY)) `SHIPMENT_QTY`, null  `ADJUSTMENT_MULTIPLIED_QTY`, null  `ACTUAL_MULTIPLIED_QTY`
			FROM (
				SELECT s.PROGRAM_ID, s.SHIPMENT_ID, MAX(st.VERSION_ID) MAX_VERSION_ID 
				FROM rm_shipment s 
				LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID 
				WHERE s.PROGRAM_ID=@programId AND st.VERSION_ID<=@versionId AND st.SHIPMENT_TRANS_ID IS NOT NULL AND st.ACTIVE AND s.ACCOUNT_FLAG GROUP BY s.SHIPMENT_ID
			) ts
		LEFT JOIN rm_shipment s ON s.SHIPMENT_ID=ts.SHIPMENT_ID
		LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND ts.MAX_VERSION_ID=st.VERSION_ID
		LEFT JOIN rm_shipment_trans_batch_info stbi ON st.SHIPMENT_TRANS_ID=stbi.SHIPMENT_TRANS_ID
		LEFT JOIN rm_batch_info bi ON stbi.BATCH_ID=bi.BATCH_ID
		GROUP BY s.PROGRAM_ID, st.PLANNING_UNIT_ID, COALESCE(st.DELIVERED_DATE, st.EXPECTED_DELIVERY_DATE), ifnull(stbi.BATCH_ID,0)

		UNION 
		-- Inventory
		SELECT '3' `TRANS_TYPE`, i.PROGRAM_ID, i.INVENTORY_ID `TRANS_ID`, rcpu.PLANNING_UNIT_ID, LEFT(it.INVENTORY_DATE,7) `TRANS_DATE`, ifnull(itbi.BATCH_ID,0) `BATCH_ID`, IFNULL(bi.EXPIRY_DATE, @defaultExpDate) `EXPIRY_DATE`, null `FORECASTED_CONSUMPTION`, null `ACTUAL_CONSUMPTION`, null `SHIPMENT_QTY`, SUM(COALESCE(itbi.ADJUSTMENT_QTY, it.ADJUSTMENT_QTY)*rcpu.MULTIPLIER) `ADJUSTMENT_MULTIPLIED_QTY`, SUM(COALESCE(itbi.ACTUAL_QTY, it.ACTUAL_QTY)*rcpu.MULTIPLIER) `ACTUAL_MULTIPLIED_QTY` 
		FROM (
				SELECT i.PROGRAM_ID, i.INVENTORY_ID, MAX(it.VERSION_ID) MAX_VERSION_ID 
				FROM rm_inventory i 
				LEFT JOIN rm_inventory_trans it ON i.INVENTORY_ID=it.INVENTORY_ID 
				WHERE i.PROGRAM_ID=@programId AND it.VERSION_ID<=@versionId AND it.INVENTORY_TRANS_ID IS NOT NULL AND it.ACTIVE GROUP BY i.INVENTORY_ID
			) ti 
		LEFT JOIN rm_inventory i ON i.INVENTORY_ID=ti.INVENTORY_ID
		LEFT JOIN rm_inventory_trans it ON i.INVENTORY_ID=it.INVENTORY_ID AND ti.MAX_VERSION_ID=it.VERSION_ID
		LEFT JOIN rm_inventory_trans_batch_info itbi ON it.INVENTORY_TRANS_ID=itbi.INVENTORY_TRANS_ID
		LEFT JOIN rm_batch_info bi ON itbi.BATCH_ID=bi.BATCH_ID
		LEFT JOIN rm_realm_country_planning_unit rcpu ON it.REALM_COUNTRY_PLANNING_UNIT_ID=rcpu.REALM_COUNTRY_PLANNING_UNIT_ID
		GROUP BY i.PROGRAM_ID, rcpu.PLANNING_UNIT_ID, it.INVENTORY_DATE, ifnull(itbi.BATCH_ID,0)
	) AS o GROUP BY o.PROGRAM_ID, o.PLANNING_UNIT_ID, o.TRANS_DATE, o.BATCH_ID 
	) oc;
    
    -- SET the Min and Max Date Range
    SELECT MIN(sp.TRANS_DATE), MAX(sp.TRANS_DATE) into @startMonth, @stopMonth FROM rm_supply_plan sp WHERE sp.PROGRAM_ID=@programId and sp.VERSION_ID=@versionId;
    
    -- Populate the supplyPlan table with a record for every batch for every month
    SET @cb = 0;
	SET @oldBatchId = -1;
-- 	INSERT INTO rm_supply_plan_batch_info (PROGRAM_ID, VERSION_ID, BATCH_ID, TRANS_DATE, EXPIRY_DATE, SHIPMENT_QTY, ACTUAL_CONSUMPTION_QTY, FORECASTED_CONSUMPTION_QTY, ADJUSTMENT_MULTIPLIED_QTY, OPENING_BALANCE, CLOSING_BALANCE, EXPIRED_STOCK, EXPIRED_CONSUMPTION, FINAL_OPENING_BALANCE, FINAL_CLOSING_BALANCE)
-- 		SELECT spc2.PROGRAM_ID, spc2.VERSION_ID, spc2.BATCH_ID, spc2.TRANS_DATE, spc2.EXPIRY_DATE, spc2.SHIPMENT_QTY, spc2.ACTUAL_CONSUMPTION_QTY, spc2.FORECASTED_CONSUMPTION_QTY, spc2.ADJUSTMENT_MULTIPLIED_QTY, spc2.OB, spc2.CB, spc2.EXPIRED_STOCK, spc2.EXPIRED_CONSUMPTION, spc2.OB, spc2.CB
-- 		FROM (SELECT spc.*, IF(@oldBatchId!=spc.BATCH_ID, @cb:=0, @cb:=@cb) `OB`, IF(spc.TRANS_DATE>=spc.EXPIRY_DATE, @cb, 0) `EXPIRED_STOCK`,IF(spc.TRANS_DATE>=spc.EXPIRY_DATE,spc.ACTUAL_CONSUMPTION_QTY,0) `EXPIRED_CONSUMPTION`, @cb:=@cb+spc.SHIPMENT_QTY-IF(spc.TRANS_DATE>=spc.EXPIRY_DATE,0,spc.ACTUAL_CONSUMPTION_QTY)+spc.ADJUSTMENT_MULTIPLIED_QTY-IF(spc.TRANS_DATE>=spc.EXPIRY_DATE, @cb, 0) `CB`, @oldBatchId := spc.BATCH_ID FROM (SELECT sp.PROGRAM_ID, sp.VERSION_ID, sp.BATCH_ID, sp.TRANS_DATE, IFNULL(bi.EXPIRY_DATE, '2099-12-31') EXPIRY_DATE, sp.SHIPMENT_QTY, sp.ACTUAL_CONSUMPTION_QTY, sp.ADJUSTMENT_MULTIPLIED_QTY, sp.FORECASTED_CONSUMPTION_QTY FROM rm_supply_plan sp LEFT JOIN rm_batch_info bi ON sp.BATCH_ID=bi.BATCH_ID ORDER BY sp.BATCH_ID, sp.TRANS_DATE, sp.SHIPMENT_QTY) spc) spc2;
	INSERT INTO rm_supply_plan_batch_info (PROGRAM_ID, VERSION_ID, BATCH_ID, TRANS_DATE, EXPIRY_DATE, SHIPMENT_QTY, ACTUAL_CONSUMPTION_QTY, FORECASTED_CONSUMPTION_QTY, ADJUSTMENT_MULTIPLIED_QTY, OPENING_BALANCE, CLOSING_BALANCE, EXPIRED_STOCK, EXPIRED_CONSUMPTION, FINAL_OPENING_BALANCE, FINAL_CLOSING_BALANCE)
	SELECT spc2.PROGRAM_ID, spc2.VERSION_ID, spc2.BATCH_ID, spc2.TRANS_DATE, spc2.EXPIRY_DATE, spc2.SHIPMENT_QTY, spc2.ACTUAL_CONSUMPTION_QTY, spc2.FORECASTED_CONSUMPTION_QTY, spc2.ADJUSTMENT_MULTIPLIED_QTY, spc2.OB, spc2.CB, spc2.EXPIRED_STOCK, spc2.EXPIRED_CONSUMPTION, spc2.OB, spc2.CB
 		FROM 
			(
			SELECT 
				spc.*, 
				IF(@oldBatchId!=spc.BATCH_ID, @cb:=0, @cb:=@cb) `OB`, IF(spc.TRANS_DATE>=spc.EXPIRY_DATE, @cb, 0) `EXPIRED_STOCK`,
				IF(spc.TRANS_DATE>=spc.EXPIRY_DATE,spc.ACTUAL_CONSUMPTION_QTY,0) `EXPIRED_CONSUMPTION`, @cb:=@cb+spc.SHIPMENT_QTY-IF(spc.TRANS_DATE>=spc.EXPIRY_DATE,0,spc.ACTUAL_CONSUMPTION_QTY)+spc.ADJUSTMENT_MULTIPLIED_QTY-IF(spc.TRANS_DATE>=spc.EXPIRY_DATE, @cb, 0) `CB`, 
				@oldBatchId := spc.BATCH_ID 
			FROM 
				(
				SELECT 
					@programId `PROGRAM_ID`, @versionId `VERSION_ID`, m3.BATCH_ID, m3.MONTH `TRANS_DATE`, IFNULL(bi.EXPIRY_DATE, '2099-12-31') EXPIRY_DATE, IFNULL(sp.SHIPMENT_QTY,0) `SHIPMENT_QTY`, 
					IFNULL(sp.ACTUAL_CONSUMPTION_QTY, 0) `ACTUAL_CONSUMPTION_QTY`, IFNULL(sp.ADJUSTMENT_MULTIPLIED_QTY,0) `ADJUSTMENT_MULTIPLIED_QTY`, IFNULL(sp.FORECASTED_CONSUMPTION_QTY,0) `FORECASTED_CONSUMPTION_QTY` 
				FROM 
					(
					SELECT 
						m.BATCH_ID, 
                        mn.MONTH 
					FROM 
						(
                        SELECT 
							sp.BATCH_ID 
						FROM rm_supply_plan sp 
                        WHERE sp.PROGRAM_ID=@programId and sp.VERSION_ID=@versionId 
                        GROUP BY sp.BATCH_ID
					) m JOIN mn ON mn.MONTH BETWEEN @startMonth AND @stopMonth
				) m3 
				LEFT JOIN rm_supply_plan sp ON m3.BATCH_ID=sp.BATCH_ID AND m3.MONTH=sp.TRANS_DATE
				LEFT JOIN rm_batch_info bi ON m3.BATCH_ID=bi.BATCH_ID 
				ORDER BY IF(m3.BATCH_ID=0,9999999999,m3.BATCH_ID), `TRANS_DATE`, `SHIPMENT_QTY`
			) spc
		) spc2;
	CALL buildStockBalances(@programId, @versionId);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `consumptionForecastedVsActual` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `consumptionForecastedVsActual`(VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_PROGRAM_ID INT(10), VAR_VERSION_ID INT, VAR_PLANNING_UNIT_ID INT(10), VAR_REPORT_VIEW INT(10))
BEGIN
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	-- Report no 2
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
    -- programId must be a single Program cannot be muti-program select or -1 for all programs
    -- versionId must be the actual version that you want to refer to for this report or -1 in which case it will automatically take the latest version (not approved or final just latest)
    -- planningUnitId must be a valid PlanningUnitId
    -- startDate and stopDate are the date range for which you want to run the report
    -- reportView = 1 - Data is reported in terms of Planning Unit
    -- reportView = 2 - Data is reported in terms of Forecasting Unit
    
    SET @startDate = VAR_START_DATE;
    SET @stopDate = VAR_STOP_DATE;
    SET @programId = VAR_PROGRAM_ID;
    SET @versionId = VAR_VERSION_ID;
    IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) INTO @versionId FROM rm_program_version pv WHERE pv.PROGRAM_ID=@programId;
	END IF;
    SET @planningUnitId = VAR_PLANNING_UNIT_ID;
    SET @reportView = VAR_REPORT_VIEW;
    
	SELECT 
		mn.MONTH, 
        IF(@reportView = 1, c.ACTUAL_CONSUMPTION, (c.ACTUAL_CONSUMPTION*c.MULTIPLIER)) `ACTUAL_CONSUMPTION`, 
        IF(@reportView = 1, c.FORECASTED_CONSUMPTION, (c.FORECASTED_CONSUMPTION*c.MULTIPLIER)) `FORECASTED_CONSUMPTION`
	FROM mn 
		LEFT JOIN 
			(
            SELECT spa.TRANS_DATE, pu.MULTIPLIER, SUM(spa.ACTUAL_CONSUMPTION_QTY) `ACTUAL_CONSUMPTION`, SUM(spa.FORECASTED_CONSUMPTION_QTY) `FORECASTED_CONSUMPTION` 
            FROM rm_supply_plan_amc spa 
            LEFT JOIN rm_planning_unit pu ON spa.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID
            WHERE spa.PROGRAM_ID=@programId and spa.VERSION_ID=@versionId and spa.PLANNING_UNIT_ID=@planningUnitId AND spa.TRANS_DATE BETWEEN @startDate AND @stopDate 
            GROUP BY spa.TRANS_DATE
		) c ON mn.MONTH=c.TRANS_DATE
	WHERE mn.MONTH BETWEEN @startDate AND @stopDate ORDER BY mn.MONTH;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `costOfInventory` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `costOfInventory`(VAR_PROGRAM_ID INT(10), VAR_VERSION_ID INT(11), VAR_DT DATE, INCLUDE_PLANNED_SHIPMENTS BOOLEAN)
BEGIN
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	-- Report no 8
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	-- ProgramId cannot be -1 (All) must be a valid ProgramId
    -- Version Id can be -1 or a Valid Version Id. If it is -1 then the Most recent committed Version is automatically taken.
    -- Dt is the date that you want to run the report for
    -- Include Planned shipments = 1 means that Shipments that are in the Draft, Planned or Submitted stage will also be considered in the calculations
    -- Include Planned shipments = 0 means that Shipments that are in the Draft, Planned or Submitted stage will not be considered in the calculations
    -- Price per unit is taken from the ProgramPlanningUnit level
    -- Cost = Closing inventory for that Planning Unit x Catalog Price
	SET @programId = VAR_PROGRAM_ID;
	SET @versionId = VAR_VERSION_ID;
	SET @startDate = VAR_DT;
    SET @includePlannedShipments = INCLUDE_PLANNED_SHIPMENTS;

	IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) INTO @versionId FROM rm_program_version pv WHERE pv.PROGRAM_ID=@programId;
	END IF;
    
	SELECT 
		ppu.PLANNING_UNIT_ID, pu.LABEL_ID, pu.LABEL_EN, pu.LABEL_FR, pu.LABEL_SP, pu.LABEL_PR, 
		ppu.CATALOG_PRICE, IFNULL(s.CB,0) STOCK, IFNULL(s.CB,0)*ppu.CATALOG_PRICE `COST`, ppu.CATALOG_PRICE
	FROM rm_program_planning_unit ppu
	LEFT JOIN (
		SELECT 
			sp.PLANNING_UNIT_ID, SUM(IF(@includePlannedShipments, sp.CLOSING_BALANCE, sp.CLOSING_BALANCE_WPS)) `CB`
		FROM rm_supply_plan_amc sp 
		WHERE sp.PROGRAM_ID=@programId AND sp.VERSION_ID=@versionId AND sp.TRANS_DATE=@startDate 
		GROUP BY sp.PLANNING_UNIT_ID
	) AS s ON ppu.PLANNING_UNIT_ID=s.PLANNING_UNIT_ID
	LEFT JOIN vw_planning_unit pu ON ppu.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID
	WHERE ppu.PROGRAM_ID=@programId;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `forecastMetricsComparision` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `forecastMetricsComparision`(VAR_REALM_ID INT(10), VAR_START_DATE DATE, VAR_REALM_COUNTRY_IDS VARCHAR(255), VAR_PROGRAM_IDS VARCHAR(255), VAR_PLANNING_UNIT_IDS VARCHAR(255), VAR_PREVIOUS_MONTHS INT(10))
BEGIN

	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	-- Report no 5
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
	-- realmId since it is a Global report need to include Realm
    -- startDate - date that the report is to be run for
    -- realmCountryIds list of countries that we need to run the report for
    -- programIds is the list of programs that we need to run the report for
    -- planningUnitIds is the list of planningUnits that we need to run the report for
    -- previousMonths is the number of months that the calculation should go in the past for (excluding the current month) calculation of WAPE formulae
    -- current month is always included in the calculation
    -- only consider those months that have both a Forecasted and Actual consumption
    -- WAPE Formulae
    -- ((Abs(actual consumption month 1-forecasted consumption month 1)+ Abs(actual consumption month 2-forecasted consumption month 2)+ Abs(actual consumption month 3-forecasted consumption month 3)+ Abs(actual consumption month 4-forecasted consumption month 4)+ Abs(actual consumption month 5-forecasted consumption month 5)+ Abs(actual consumption month 6-forecasted consumption month 6)) / (Sum of all actual consumption in the last 6 months)) 

	SET @realmId = VAR_REALM_ID;
    SET @startDate = VAR_START_DATE;
    SET @previousMonths = VAR_PREVIOUS_MONTHS;
    
    SET @sqlString = "";
    
	SET @sqlString = CONCAT(@sqlString, "SELECT ");
    SET @sqlString = CONCAT(@sqlString, "   spa.TRANS_DATE, p.PROGRAM_ID, p.PROGRAM_CODE, p.LABEL_ID `PROGRAM_LABEL_ID`, p.LABEL_EN `PROGRAM_LABEL_EN`, p.LABEL_FR `PROGRAM_LABEL_FR`, p.LABEL_SP `PROGRAM_LABEL_SP`, p.LABEL_PR `PROGRAM_LABEL_PR`, ");
    SET @sqlString = CONCAT(@sqlString, "   pu.PLANNING_UNIT_ID, pu.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pu.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pu.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pu.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pu.LABEL_PR  `PLANNING_UNIT_LABEL_PR`, ");
    SET @sqlString = CONCAT(@sqlString, "   SUM(spa.ACTUAL_CONSUMPTION_QTY) `ACTUAL_CONSUMPTION_TOTAL`, ");
    SET @sqlString = CONCAT(@sqlString, "   SUM(IF(spa.ACTUAL_CONSUMPTION_QTY IS NOT NULL, ABS(spa.ACTUAL_CONSUMPTION_QTY-spa.FORECASTED_CONSUMPTION_QTY), null)) `DIFF_CONSUMPTION_TOTAL`, ");
    SET @sqlString = CONCAT(@sqlString, "   SUM(IF(spa.ACTUAL_CONSUMPTION_QTY IS NOT NULL, ABS(spa.ACTUAL_CONSUMPTION_QTY-spa.FORECASTED_CONSUMPTION_QTY), null))/SUM(spa.ACTUAL_CONSUMPTION_QTY)*100 `FORECAST_ERROR`, ");
    SET @sqlString = CONCAT(@sqlString, "   SUM(IF(spa.ACTUAL_CONSUMPTION_QTY IS NULL, 0, 1)) `MONTH_COUNT` ");
    SET @sqlString = CONCAT(@sqlString, "FROM rm_program_planning_unit ppu ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN (SELECT spa.PROGRAM_ID, MAX(spa.VERSION_ID) MAX_VERSION FROM rm_supply_plan_amc spa LEFT JOIN rm_program_version pv ON spa.PROGRAM_ID=pv.PROGRAM_ID AND spa.VERSION_ID=pv.VERSION_ID WHERE TRUE AND pv.VERSION_TYPE_ID=2 AND pv.VERSION_STATUS_ID=2 ");
    IF LENGTH(VAR_PROGRAM_IDS)>0 THEN
		SET @sqlString = CONCAT(@sqlString, "AND spa.PROGRAM_ID IN (",VAR_PROGRAM_IDS,") ");
    END IF;
    SET @sqlString = CONCAT(@sqlString, "GROUP BY spa.PROGRAM_ID) f ON ppu.PROGRAM_ID=f.PROGRAM_ID ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_supply_plan_amc spa ON spa.PROGRAM_ID=f.PROGRAM_ID AND spa.VERSION_ID=f.MAX_VERSION AND spa.TRANS_DATE BETWEEN SUBDATE(@startDate, INTERVAL @previousMonths MONTH) AND @startDate AND spa.PLANNING_UNIT_ID=ppu.PLANNING_UNIT_ID ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_program p ON ppu.PROGRAM_ID=p.PROGRAM_ID ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_planning_unit pu ON ppu.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID ");
    SET @sqlString = CONCAT(@sqlString, "WHERE TRUE ");
    IF LENGTH(VAR_PROGRAM_IDS)>0 THEN
		SET @sqlString = CONCAT(@sqlString, "AND ppu.PROGRAM_ID IN (",VAR_PROGRAM_IDS,") ");
    END IF;
    IF LENGTH(VAR_REALM_COUNTRY_IDS)>0 THEN
		SET @sqlString = CONCAT(@sqlString, "   AND p.REALM_COUNTRY_ID IN (",VAR_REALM_COUNTRY_IDS,") ");
    END IF;
	IF LENGTH(VAR_PLANNING_UNIT_IDS)>0 THEN
		SET @sqlString = CONCAT(@sqlString, "   AND ppu.PLANNING_UNIT_ID IN (",VAR_PLANNING_UNIT_IDS,") ");
    END IF;
    SET @sqlString = CONCAT(@sqlString, "GROUP BY ppu.PROGRAM_ID, ppu.PLANNING_UNIT_ID ");
    
    PREPARE S1 FROM @sqlString;
    EXECUTE S1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `forecastMetricsMonthly` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `forecastMetricsMonthly`(VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_PROGRAM_ID INT(10), VAR_VERSION_ID INT, VAR_PLANNING_UNIT_ID INT(10), VAR_PREVIOUS_MONTHS INT(10))
BEGIN

	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	-- Report no 4
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
	-- startDate and stopDate are the range that you want to run the report for
    -- programId must be a single Program cannot be muti-program select or -1 for all programs
    -- versionId must be the actual version that you want to refer to for this report or -1 in which case it will automatically take the latest version (not approved or final just latest)
    -- planningUnitIt must be a single Planning Unit cannot be multi-select or -1 for all 
    -- previousMonths is the number of months that the calculation should go in the past for (excluding the current month) calculation of WAPE formulae
    -- current month is always included in the calculation
    -- WAPE Formulae
    -- ((Abs(actual consumption month 1-forecasted consumption month 1)+ Abs(actual consumption month 2-forecasted consumption month 2)+ Abs(actual consumption month 3-forecasted consumption month 3)+ Abs(actual consumption month 4-forecasted consumption month 4)+ Abs(actual consumption month 5-forecasted consumption month 5)+ Abs(actual consumption month 6-forecasted consumption month 6)) / (Sum of all actual consumption in the last 6 months)) 

	SET @startDate = VAR_START_DATE;
    SET @stopDate = VAR_STOP_DATE;
    SET @programId = VAR_PROGRAM_ID;
    SET @versionId = VAR_VERSION_ID;
    SET @planningUnitId = VAR_PLANNING_UNIT_ID;
    
    IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) INTO @versionId FROM rm_program_version pv WHERE pv.PROGRAM_ID=@programId;
	END IF;
    SET @previousMonths = VAR_PREVIOUS_MONTHS;
    
	SELECT 
		mn.MONTH, SUM(c1.ACTUAL_CONSUMPTION) ACTUAL_CONSUMPTION_HISTORY, SUM(ABS(c1.FORECASTED_CONSUMPTION-c1.ACTUAL_CONSUMPTION)) DIFF_CONSUMPTION_HISTORY, SUM(ABS(c1.FORECASTED_CONSUMPTION-c1.ACTUAL_CONSUMPTION))*100/SUM(c1.ACTUAL_CONSUMPTION) FORECAST_ERROR, c2.ACTUAL_CONSUMPTION, c2.FORECASTED_CONSUMPTION
	FROM mn 
	LEFT JOIN 
		(
        SELECT spa.TRANS_DATE, spa.ACTUAL_CONSUMPTION_QTY `ACTUAL_CONSUMPTION`, spa.FORECASTED_CONSUMPTION_QTY `FORECASTED_CONSUMPTION` 
        FROM rm_supply_plan_amc spa
        LEFT JOIN rm_planning_unit pu ON spa.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID
        WHERE spa.PROGRAM_ID=@programId and spa.VERSION_ID=@versionId and spa.PLANNING_UNIT_ID=@planningUnitId AND spa.TRANS_DATE BETWEEN SUBDATE(@startDate, INTERVAL 6 MONTH) AND @stopDate 
	) c1 ON c1.TRANS_DATE BETWEEN SUBDATE(mn.MONTH, INTERVAL @previousMonths MONTH) AND mn.MONTH
    LEFT JOIN 
		(
        SELECT spa.TRANS_DATE, spa.ACTUAL_CONSUMPTION_QTY `ACTUAL_CONSUMPTION`, spa.FORECASTED_CONSUMPTION_QTY `FORECASTED_CONSUMPTION` 
        FROM rm_supply_plan_amc spa
        LEFT JOIN rm_planning_unit pu ON spa.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID
        WHERE spa.PROGRAM_ID=@programId and spa.VERSION_ID=@versionId and spa.PLANNING_UNIT_ID=@planningUnitId AND spa.TRANS_DATE BETWEEN SUBDATE(@startDate, INTERVAL 5 MONTH) AND @stopDate 
        GROUP BY spa.TRANS_DATE 
	) c2 ON c2.TRANS_DATE=mn.MONTH
	WHERE mn.MONTH BETWEEN @startDate AND @stopDate
	GROUP BY mn.MONTH;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `fundingSourceShipmentReport` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `fundingSourceShipmentReport`(VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_FUNDING_SOURCE_ID INT, VAR_PROGRAM_ID INT, VAR_VERSION_ID INT, VAR_PLANNING_UNIT_IDS VARCHAR(200), VAR_INCLUDE_PLANNED_SHIPMENTS TINYINT)
BEGIN
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	-- Report no 15
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
	-- programId must be a single Program cannot be muti-program select or -1 for all programs
    -- versionId must be the actual version that you want to refer to for this report or -1 in which case it will automatically take the latest version (not approved or final just latest)
    -- fundingSourceId can be a particular fundingSource or -1 for all
    -- report will be run using startDate and stopDate based on Delivered Date or Expected Delivery Date
    -- planningUnitIds is provided as a list of planningUnitId's or empty for all
    -- includePlannedShipments = 1 means the report will include all shipments that are Active and not Cancelled
    -- includePlannedShipments = 0 means only Approve, Shipped, Arrived, Delivered statuses will be included in the report
    -- FreightCost and ProductCost are converted to USD
    -- FreightPerc is in SUM(FREIGHT_COST)/SUM(PRODUCT_COST) for that ProcurementAgent and that PlanningUnit
    
    SET @programId = VAR_PROGRAM_ID;
	SET @versionId = VAR_VERSION_ID;
    IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) INTO @versionId FROM rm_program_version pv WHERE pv.PROGRAM_ID=@programId;
	END IF;
	SET @startDate = CONCAT(VAR_START_DATE,' 00:00:00');
	SET @stopDate = CONCAT(VAR_STOP_DATE, ' 23:59:59');
	SET @fundingSourceId = VAR_FUNDING_SOURCE_ID;
	SET @includePlannedShipments = VAR_INCLUDE_PLANNED_SHIPMENTS;

	SET @sqlString = "";
    SET @sqlString = CONCAT(@sqlString,"SELECT ");
	SET @sqlString = CONCAT(@sqlString,"	fs.FUNDING_SOURCE_ID, fs.FUNDING_SOURCE_CODE, fs.LABEL_ID `FUNDING_SOURCE_LABEL_ID`, fs.LABEL_EN `FUNDING_SOURCE_LABEL_EN`, fs.LABEL_FR `FUNDING_SOURCE_LABEL_FR`, fs.LABEL_SP `FUNDING_SOURCE_LABEL_SP`, fs.LABEL_PR `FUNDING_SOURCE_LABEL_PR`, ");
	SET @sqlString = CONCAT(@sqlString,"	pu.PLANNING_UNIT_ID, pu.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pu.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pu.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pu.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pu.LABEL_PR `PLANNING_UNIT_LABEL_PR`, ");
	SET @sqlString = CONCAT(@sqlString,"	SUM(st.SHIPMENT_QTY) QTY, SUM(st.PRODUCT_COST*s.CONVERSION_RATE_TO_USD) `PRODUCT_COST`, SUM(st.FREIGHT_COST*s.CONVERSION_RATE_TO_USD) `FREIGHT_COST`, SUM(st.FREIGHT_COST*s.CONVERSION_RATE_TO_USD)/SUM(st.PRODUCT_COST*s.CONVERSION_RATE_TO_USD)*100 `FREIGHT_PERC` ");
	SET @sqlString = CONCAT(@sqlString,"FROM ");
	SET @sqlString = CONCAT(@sqlString,"	(");
	SET @sqlString = CONCAT(@sqlString,"	SELECT ");
	SET @sqlString = CONCAT(@sqlString,"		s.PROGRAM_ID, s.SHIPMENT_ID, s.CONVERSION_RATE_TO_USD, MAX(st.VERSION_ID) MAX_VERSION_ID ");
	SET @sqlString = CONCAT(@sqlString,"	FROM rm_shipment s ");
	SET @sqlString = CONCAT(@sqlString,"	LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID ");
	SET @sqlString = CONCAT(@sqlString,"	WHERE ");
	SET @sqlString = CONCAT(@sqlString,"		s.PROGRAM_ID=@programId ");
	SET @sqlString = CONCAT(@sqlString,"		AND st.VERSION_ID<=@versionId ");
	SET @sqlString = CONCAT(@sqlString,"		AND st.SHIPMENT_TRANS_ID IS NOT NULL ");
	SET @sqlString = CONCAT(@sqlString,"	GROUP BY s.SHIPMENT_ID ");
	SET @sqlString = CONCAT(@sqlString,") AS s ");
	SET @sqlString = CONCAT(@sqlString,"LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND s.MAX_VERSION_ID=st.VERSION_ID ");
	SET @sqlString = CONCAT(@sqlString,"LEFT JOIN vw_funding_source fs ON st.FUNDING_SOURCE_ID=fs.FUNDING_SOURCE_ID ");
	SET @sqlString = CONCAT(@sqlString,"LEFT JOIN vw_planning_unit pu ON st.PLANNING_UNIT_ID = pu.PLANNING_UNIT_ID ");
	SET @sqlString = CONCAT(@sqlString,"WHERE ");
	SET @sqlString = CONCAT(@sqlString,"	st.ACTIVE ");
    SET @sqlString = CONCAT(@sqlString,"	AND st.SHIPMENT_STATUS_ID != 8 ");
	SET @sqlString = CONCAT(@sqlString,"	AND ((@includePlannedShipments=0 && st.SHIPMENT_STATUS_ID in (4,5,6,7)) OR @includePlannedShipments=1) ");
	SET @sqlString = CONCAT(@sqlString,"	AND COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) BETWEEN @startDate AND @stopDate ");
    IF LENGTH(VAR_PLANNING_UNIT_IDS)>0 THEN 
		SET @sqlString = CONCAT(@sqlString,"	AND (st.PLANNING_UNIT_ID IN (",VAR_PLANNING_UNIT_IDS,")) ");
	END IF;
	SET @sqlString = CONCAT(@sqlString,"	AND (st.FUNDING_SOURCE_ID = @fundingSourceId OR @fundingSourceId = -1) ");
	SET @sqlString = CONCAT(@sqlString,"GROUP BY st.FUNDING_SOURCE_ID, st.PLANNING_UNIT_ID");
    
    PREPARE s1 FROM @sqlString;
    EXECUTE s1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `generateForgotPasswordToken` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `generateForgotPasswordToken`(`VAR_USER_ID` INT(10), `VAR_TOKEN_DATE` DATETIME)
BEGIN
	SET @userId = null;
	SELECT USER_ID INTO @userId FROM us_user WHERE USER_ID=VAR_USER_ID;
    IF @userId IS NOT NULL THEN 
		SET @rowCnt = 1;
		SET @token = '';
		WHILE (@rowCnt != 0) DO
			SET @token = '';
			SET @allowedChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
			SET @allowedCharsLen = LENGTH(@allowedChars);
			SET @tokenLen = 25;
			SET @i = 0;
			WHILE (@i < @tokenLen) DO
				SET @token = CONCAT(@token, substring(@allowedChars, FLOOR(RAND() * @allowedCharsLen + 1), 1));
				SET @i = @i + 1;
			END WHILE;
			SELECT count(*) INTO @rowCnt FROM us_forgot_password_token WHERE TOKEN=@token;
		END WHILE;
		INSERT INTO us_forgot_password_token (USER_ID, TOKEN, TOKEN_GENERATION_DATE) VALUES (@userId, @token, `VAR_TOKEN_DATE`);
        SELECT @token;
	ELSE 
		select null;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getConsumptionData` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `getConsumptionData`(PROGRAM_ID INT(10), VERSION_ID INT (10))
BEGIN
	SET @programId = PROGRAM_ID;
    SET @versionId = VERSION_ID;
    IF @versionId = -1 THEN 
		SELECT MAX(pv.VERSION_ID) into @versionId FROM rm_program_version pv where pv.PROGRAM_ID=@programId;
	END IF;

    SELECT 
		ct.*, ctbi.CONSUMPTION_TRANS_BATCH_INFO_ID, bi.PLANNING_UNIT_ID `BATCH_PLANNING_UNIT_ID`, ctbi.BATCH_ID, bi.BATCH_NO, bi.AUTO_GENERATED, bi.EXPIRY_DATE, ctbi.CONSUMPTION_QTY `BATCH_QTY`
	FROM (
		SELECT 
			cons.CONSUMPTION_ID, ct.CONSUMPTION_DATE, ct.CONSUMPTION_RCPU_QTY, ct.CONSUMPTION_QTY, ct.DAYS_OF_STOCK_OUT, ct.ACTUAL_FLAG, ct.VERSION_ID, ct.NOTES, ct.CONSUMPTION_TRANS_ID,
			p.PROGRAM_ID, p.LABEL_ID `PROGRAM_LABEL_ID`, p.LABEL_EN `PROGRAM_LABEL_EN`, p.LABEL_FR `PROGRAM_LABEL_FR`, p.LABEL_SP `PROGRAM_LABEL_SP`, p.LABEL_PR `PROGRAM_LABEL_PR`,
			r.REGION_ID, r.LABEL_ID `REGION_LABEL_ID`, r.LABEL_EN `REGION_LABEL_EN`, r.LABEL_FR `REGION_LABEL_FR`, r.LABEL_SP `REGION_LABEL_SP`, r.LABEL_PR `REGION_LABEL_PR`,
            rcpu.REALM_COUNTRY_PLANNING_UNIT_ID, rcpu.LABEL_ID `RCPU_LABEL_ID`, rcpu.LABEL_EN `RCPU_LABEL_EN`, rcpu.LABEL_FR `RCPU_LABEL_FR`, rcpu.LABEL_SP `RCPU_LABEL_SP`, rcpu.LABEL_PR `RCPU_LABEL_PR`, 
            rcpu.MULTIPLIER,
			pu.PLANNING_UNIT_ID, pu.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pu.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pu.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pu.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pu.LABEL_PR `PLANNING_UNIT_LABEL_PR`,
			fu.FORECASTING_UNIT_ID, fu.LABEL_ID `FORECASTING_UNIT_LABEL_ID`, fu.LABEL_EN `FORECASTING_UNIT_LABEL_EN`, fu.LABEL_FR `FORECASTING_UNIT_LABEL_FR`, fu.LABEL_SP `FORECASTING_UNIT_LABEL_SP`, fu.LABEL_PR `FORECASTING_UNIT_LABEL_PR`,
			pc.PRODUCT_CATEGORY_ID, pc.LABEL_ID `PRODUCT_CATEGORY_LABEL_ID`, pc.LABEL_EN `PRODUCT_CATEGORY_LABEL_EN`, pc.LABEL_FR `PRODUCT_CATEGORY_LABEL_FR`, pc.LABEL_SP `PRODUCT_CATEGORY_LABEL_SP`, pc.LABEL_PR `PRODUCT_CATEGORY_LABEL_PR`,
			ds.DATA_SOURCE_ID, ds.LABEL_ID `DATA_SOURCE_LABEL_ID`, ds.LABEL_EN `DATA_SOURCE_LABEL_EN`, ds.LABEL_FR `DATA_SOURCE_LABEL_FR`, ds.LABEL_SP `DATA_SOURCE_LABEL_SP`, ds.LABEL_PR `DATA_SOURCE_LABEL_PR`,
			cb.USER_ID `CB_USER_ID`, cb.USERNAME `CB_USERNAME`, cons.CREATED_DATE, lmb.USER_ID `LMB_USER_ID`, lmb.USERNAME `LMB_USERNAME`, ct.LAST_MODIFIED_DATE, ct.ACTIVE
		FROM (SELECT ct.CONSUMPTION_ID, MAX(ct.VERSION_ID) MAX_VERSION_ID FROM rm_consumption c LEFT JOIN rm_consumption_trans ct ON c.CONSUMPTION_ID=ct.CONSUMPTION_ID WHERE (@versionId=-1 OR ct.VERSION_ID<=@versionId) AND c.PROGRAM_ID=@programId GROUP BY ct.CONSUMPTION_ID) tc 
		LEFT JOIN rm_consumption cons ON tc.CONSUMPTION_ID=cons.CONSUMPTION_ID
		LEFT JOIN rm_consumption_trans ct ON tc.CONSUMPTION_ID=ct.CONSUMPTION_ID AND tc.MAX_VERSION_ID=ct.VERSION_ID
		LEFT JOIN vw_program p ON cons.PROGRAM_ID=p.PROGRAM_ID
		LEFT JOIN vw_region r ON ct.REGION_ID=r.REGION_ID
        LEFT JOIN vw_realm_country_planning_unit rcpu ON ct.REALM_COUNTRY_PLANNING_UNIT_ID=rcpu.REALM_COUNTRY_PLANNING_UNIT_ID
		LEFT JOIN vw_planning_unit pu ON ct.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID
		LEFT JOIN vw_forecasting_unit fu ON pu.FORECASTING_UNIT_ID=fu.FORECASTING_UNIT_ID
		LEFT JOIN vw_product_category pc ON fu.PRODUCT_CATEGORY_ID=pc.PRODUCT_CATEGORY_ID
		LEFT JOIN vw_data_source ds ON ct.DATA_SOURCE_ID=ds.DATA_SOURCE_ID
		LEFT JOIN us_user cb ON cons.CREATED_BY=cb.USER_ID
		LEFT JOIN us_user lmb ON ct.LAST_MODIFIED_BY=lmb.USER_ID
	) ct 
    LEFT JOIN rm_consumption_trans_batch_info ctbi ON ct.CONSUMPTION_TRANS_ID=ctbi.CONSUMPTION_TRANS_ID
    LEFT JOIN rm_batch_info bi ON ctbi.BATCH_ID=bi.BATCH_ID
	ORDER BY ct.PLANNING_UNIT_ID, ct.REGION_ID, ct.CONSUMPTION_DATE, ct.ACTUAL_FLAG, bi.EXPIRY_DATE, bi.BATCH_ID;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getExpiredStock` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `getExpiredStock`(VAR_PROGRAM_ID INT(10), VAR_VERSION_ID INT(10), VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_INCLUDE_PLANNED_SHIPMENTS BOOLEAN)
BEGIN
    -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	-- Report no 10
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
	-- programId cannot be -1 (All) it must be a valid ProgramId
    -- versionId can be -1 or a valid VersionId for that Program. If it is -1 then the last committed Version is automatically taken.
    -- StartDate is the date that you want to run the report for
    -- StopDate is the date that you want to run the report for
    -- Include Planned Shipments = 1 menas that Shipments that are in the Planned, Draft, Submitted stages will also be considered in the report
    -- Include Planned Shipments = 0 means that Shipments that are in the Planned, Draft, Submitted stages will not be considered in the report
    
    SET @programId = VAR_PROGRAM_ID;
	SET @versionId = VAR_VERSION_ID;
	SET @startDate = VAR_START_DATE;
    SET @stopDate = VAR_STOP_DATE;
	SET @includePlannedShipments = VAR_INCLUDE_PLANNED_SHIPMENTS;

	IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) INTO @versionId FROM rm_program_version pv WHERE pv.PROGRAM_ID=@programId;
	END IF;
    
    SELECT 
        p.PROGRAM_ID, p.PROGRAM_CODE, p.LABEL_ID `PROGRAM_LABEL_ID`, p.LABEL_EN `PROGRAM_LABEL_EN`, p.LABEL_FR `PROGRAM_LABEL_FR`, p.LABEL_SP `PROGRAM_LABEL_SP`, p.LABEL_PR `PROGRAM_LABEL_PR`,
        pu.PLANNING_UNIT_ID, pu.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pu.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pu.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pu.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pu.LABEL_PR `PLANNING_UNIT_LABEL_PR`, 
        bi.BATCH_ID, bi.BATCH_NO, bi.AUTO_GENERATED, bi.EXPIRY_DATE, bi.CREATED_DATE, IF (@includePlannedShipments=1, spbq.EXPIRED_STOCK, spbq.EXPIRED_STOCK_WPS) `EXPIRED_STOCK`
    FROM rm_supply_plan_batch_qty spbq 
    LEFT JOIN rm_batch_info bi ON spbq.BATCH_ID=bi.BATCH_ID 
    LEFT JOIN vw_program p ON spbq.PROGRAM_ID=p.PROGRAM_ID
    LEFT JOIN vw_planning_unit pu ON spbq.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID
    WHERE spbq.PROGRAM_ID=@programId AND spbq.VERSION_ID=@versionId AND spbq.TRANS_DATE BETWEEN @startDate AND @stopDate AND (@includePlannedShipments=1 AND spbq.EXPIRED_STOCK>0 OR @includePlannedShipments=0 AND spbq.EXPIRED_STOCK_WPS>0);
    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getInventoryData` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `getInventoryData`(PROGRAM_ID INT(10), VERSION_ID INT (10))
BEGIN
	SET @programId = PROGRAM_ID;
    SET @versionId = VERSION_ID;

	IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) into @versionId FROM rm_program_version pv where pv.PROGRAM_ID=@programId;
    END IF;
    
	set @oldRCPU = 0;
	set @oldAdjustment = 0;
	set @bal = 0;
	SELECT a.*, itbi.INVENTORY_TRANS_BATCH_INFO_ID, itbi.BATCH_ID, bi.PLANNING_UNIT_ID `BATCH_PLANNING_UNIT_ID`, bi.BATCH_NO, bi.AUTO_GENERATED, bi.EXPIRY_DATE, itbi.ACTUAL_QTY `BATCH_ACTUAL_QTY`, itbi.ADJUSTMENT_QTY `BATCH_ADJUSTMENT_QTY` FROM (
	SELECT 
		der.*, 
		@oldAdjustment:=IF(@oldRCPU!=der.REALM_COUNTRY_PLANNING_UNIT_ID, 0, @oldAdjustment) `oldAdjustment`,
		@bal:=IF(@oldRCPU!=der.REALM_COUNTRY_PLANNING_UNIT_ID, 0, @bal+@oldAdjustment) `EXPECTED_BAL`, 
		@oldRCPU := der.REALM_COUNTRY_PLANNING_UNIT_ID `oldRCPU`,
		@oldAdjustment:=der.ADJUSTMENT_QTY
	FROM (
		SELECT 
			it.INVENTORY_ID, it.INVENTORY_DATE, it.ACTUAL_QTY, it.ADJUSTMENT_QTY, rcpu.MULTIPLIER, it.VERSION_ID, it.NOTES, it.INVENTORY_TRANS_ID,
			p.PROGRAM_ID, pl.LABEL_ID `PROGRAM_LABEL_ID`, pl.LABEL_EN `PROGRAM_LABEL_EN`, pl.LABEL_FR `PROGRAM_LABEL_FR`, pl.LABEL_SP `PROGRAM_LABEL_SP`, pl.LABEL_PR `PROGRAM_LABEL_PR`,
			r.REGION_ID, rl.LABEL_ID `REGION_LABEL_ID`, rl.LABEL_EN `REGION_LABEL_EN`, rl.LABEL_FR `REGION_LABEL_FR`, rl.LABEL_SP `REGION_LABEL_SP`, rl.LABEL_PR `REGION_LABEL_PR`,
			rcpu.REALM_COUNTRY_PLANNING_UNIT_ID, rcpul.LABEL_ID `REALM_COUNTRY_PLANNING_UNIT_LABEL_ID`, rcpul.LABEL_EN `REALM_COUNTRY_PLANNING_UNIT_LABEL_EN`, rcpul.LABEL_FR `REALM_COUNTRY_PLANNING_UNIT_LABEL_FR`, rcpul.LABEL_SP `REALM_COUNTRY_PLANNING_UNIT_LABEL_SP`, rcpul.LABEL_PR `REALM_COUNTRY_PLANNING_UNIT_LABEL_PR`,
			pu.PLANNING_UNIT_ID, pul.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pul.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pul.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pul.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pul.LABEL_PR `PLANNING_UNIT_LABEL_PR`,
			fu.FORECASTING_UNIT_ID, ful.LABEL_ID `FORECASTING_UNIT_LABEL_ID`, ful.LABEL_EN `FORECASTING_UNIT_LABEL_EN`, ful.LABEL_FR `FORECASTING_UNIT_LABEL_FR`, ful.LABEL_SP `FORECASTING_UNIT_LABEL_SP`, ful.LABEL_PR `FORECASTING_UNIT_LABEL_PR`,
			pc.PRODUCT_CATEGORY_ID, pcl.LABEL_ID `PRODUCT_CATEGORY_LABEL_ID`, pcl.LABEL_EN `PRODUCT_CATEGORY_LABEL_EN`, pcl.LABEL_FR `PRODUCT_CATEGORY_LABEL_FR`, pcl.LABEL_SP `PRODUCT_CATEGORY_LABEL_SP`, pcl.LABEL_PR `PRODUCT_CATEGORY_LABEL_PR`,
			ds.DATA_SOURCE_ID, dsl.LABEL_ID `DATA_SOURCE_LABEL_ID`, dsl.LABEL_EN `DATA_SOURCE_LABEL_EN`, dsl.LABEL_FR `DATA_SOURCE_LABEL_FR`, dsl.LABEL_SP `DATA_SOURCE_LABEL_SP`, dsl.LABEL_PR `DATA_SOURCE_LABEL_PR`,
			u.UNIT_ID, u.UNIT_CODE, ul.LABEL_ID `UNIT_LABEL_ID`, ul.LABEL_EN `UNIT_LABEL_EN`, ul.LABEL_FR `UNIT_LABEL_FR`, ul.LABEL_SP `UNIT_LABEL_SP`, ul.LABEL_PR `UNIT_LABEL_PR`,
			cb.USER_ID `CB_USER_ID`, cb.USERNAME `CB_USERNAME`, i.CREATED_DATE, lmb.USER_ID `LMB_USER_ID`, lmb.USERNAME `LMB_USERNAME`, it.LAST_MODIFIED_DATE, it.ACTIVE
		FROM (SELECT i.INVENTORY_ID, MAX(it.VERSION_ID) MAX_VERSION_ID FROM rm_inventory i LEFT JOIN rm_inventory_trans it ON i.INVENTORY_ID=it.INVENTORY_ID WHERE i.PROGRAM_ID=@programId AND (it.VERSION_ID<=@versionId OR @versionId=-1) GROUP BY i.INVENTORY_ID) tc 
		LEFT JOIN rm_inventory i ON tc.INVENTORY_ID=i.INVENTORY_ID
		LEFT JOIN rm_inventory_trans it ON tc.INVENTORY_ID=it.INVENTORY_ID AND tc.MAX_VERSION_ID=it.VERSION_ID
		LEFT JOIN rm_program p ON i.PROGRAM_ID=p.PROGRAM_ID
		LEFT JOIN ap_label pl ON p.LABEL_ID=pl.LABEL_ID
		LEFT JOIN rm_region r ON it.REGION_ID=r.REGION_ID
		LEFT JOIN ap_label rl ON r.LABEL_ID=rl.LABEL_ID
		LEFT JOIN rm_realm_country_planning_unit rcpu ON it.REALM_COUNTRY_PLANNING_UNIT_ID=rcpu.REALM_COUNTRY_PLANNING_UNIT_ID
		LEFT JOIN ap_label rcpul ON rcpu.LABEL_ID=rcpul.LABEL_ID
		LEFT JOIN rm_planning_unit pu ON rcpu.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID
		LEFT JOIN ap_label pul ON pu.LABEL_ID=pul.LABEL_ID
		LEFT JOIN rm_forecasting_unit fu ON pu.FORECASTING_UNIT_ID=fu.FORECASTING_UNIT_ID
		LEFT JOIN ap_label ful ON fu.LABEL_ID=ful.LABEL_ID
		LEFT JOIN rm_product_category pc ON fu.PRODUCT_CATEGORY_ID=pc.PRODUCT_CATEGORY_ID
		LEFT JOIN ap_label pcl ON pc.LABEL_ID=pcl.LABEL_ID
		LEFT JOIN rm_data_source ds ON it.DATA_SOURCE_ID=ds.DATA_SOURCE_ID
		LEFT JOIN ap_label dsl ON ds.LABEL_ID=dsl.LABEL_ID
		LEFT JOIN ap_unit u ON rcpu.UNIT_ID=u.UNIT_ID
		LEFT JOIN ap_label ul ON u.LABEL_ID=ul.LABEL_ID
		LEFT JOIN us_user cb ON i.CREATED_BY=cb.USER_ID
		LEFT JOIN us_user lmb ON it.LAST_MODIFIED_BY=lmb.USER_ID
	) as der 
    ORDER BY der.PLANNING_UNIT_ID, der.REALM_COUNTRY_PLANNING_UNIT_ID, der.REGION_ID, der.INVENTORY_DATE) a 
    LEFT JOIN rm_inventory_trans_batch_info itbi ON a.INVENTORY_TRANS_ID=itbi.INVENTORY_TRANS_ID
    LEFT JOIN rm_batch_info bi ON itbi.BATCH_ID=bi.BATCH_ID
    ORDER BY a.PLANNING_UNIT_ID, a.REALM_COUNTRY_PLANNING_UNIT_ID, a.REGION_ID, a.INVENTORY_DATE, bi.EXPIRY_DATE, bi.BATCH_ID;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getShipmentData` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `getShipmentData`(PROGRAM_ID INT(10), VERSION_ID INT (10))
BEGIN
	SET @programId = PROGRAM_ID;
    SET @versionId = VERSION_ID;
	
    IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) into @versionId FROM rm_program_version pv where pv.PROGRAM_ID=@programId;
    END IF;
    
	SELECT 
		st.*, stbi.SHIPMENT_TRANS_BATCH_INFO_ID, stbi.BATCH_ID, bi.PLANNING_UNIT_ID `BATCH_PLANNING_UNIT_ID`, bi.BATCH_NO, bi.AUTO_GENERATED, bi.EXPIRY_DATE, stbi.BATCH_SHIPMENT_QTY `BATCH_SHIPMENT_QTY` 
	FROM (
        SELECT 
			s.SHIPMENT_ID, s.PARENT_SHIPMENT_ID, st.EXPECTED_DELIVERY_DATE, st.PLANNED_DATE, st.SUBMITTED_DATE, st.APPROVED_DATE, st.SHIPPED_DATE, st.ARRIVED_DATE, st.RECEIVED_DATE, st.SHIPMENT_QTY, st.RATE, st.PRODUCT_COST, st.FREIGHT_COST, st.SHIPMENT_MODE, s.SUGGESTED_QTY, st.ACCOUNT_FLAG, st.ERP_FLAG, st.ORDER_NO, st.PRIME_LINE_NO, st.VERSION_ID, st.NOTES, st.SHIPMENT_TRANS_ID, 
			p.PROGRAM_ID, pl.LABEL_ID `PROGRAM_LABEL_ID`, pl.LABEL_EN `PROGRAM_LABEL_EN`, pl.LABEL_FR `PROGRAM_LABEL_FR`, pl.LABEL_SP `PROGRAM_LABEL_SP`, pl.LABEL_PR `PROGRAM_LABEL_PR`,
			pa.PROCUREMENT_AGENT_ID, pa.PROCUREMENT_AGENT_CODE, pa.`COLOR_HTML_CODE`, pal.LABEL_ID `PROCUREMENT_AGENT_LABEL_ID`, pal.LABEL_EN `PROCUREMENT_AGENT_LABEL_EN`, pal.LABEL_FR `PROCUREMENT_AGENT_LABEL_FR`, pal.LABEL_SP `PROCUREMENT_AGENT_LABEL_SP`, pal.LABEL_PR `PROCUREMENT_AGENT_LABEL_PR`,
			pu.PLANNING_UNIT_ID, pul.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pul.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pul.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pul.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pul.LABEL_PR `PLANNING_UNIT_LABEL_PR`,
			fu.FORECASTING_UNIT_ID, ful.LABEL_ID `FORECASTING_UNIT_LABEL_ID`, ful.LABEL_EN `FORECASTING_UNIT_LABEL_EN`, ful.LABEL_FR `FORECASTING_UNIT_LABEL_FR`, ful.LABEL_SP `FORECASTING_UNIT_LABEL_SP`, ful.LABEL_PR `FORECASTING_UNIT_LABEL_PR`,
			pc.PRODUCT_CATEGORY_ID, pcl.LABEL_ID `PRODUCT_CATEGORY_LABEL_ID`, pcl.LABEL_EN `PRODUCT_CATEGORY_LABEL_EN`, pcl.LABEL_FR `PRODUCT_CATEGORY_LABEL_FR`, pcl.LABEL_SP `PRODUCT_CATEGORY_LABEL_SP`, pcl.LABEL_PR `PRODUCT_CATEGORY_LABEL_PR`,
			pru.PROCUREMENT_UNIT_ID, prul.LABEL_ID `PROCUREMENT_UNIT_LABEL_ID`, prul.LABEL_EN `PROCUREMENT_UNIT_LABEL_EN`, prul.LABEL_FR `PROCUREMENT_UNIT_LABEL_FR`, prul.LABEL_SP `PROCUREMENT_UNIT_LABEL_SP`, prul.LABEL_PR `PROCUREMENT_UNIT_LABEL_PR`,
			su.SUPPLIER_ID, sul.LABEL_ID `SUPPLIER_LABEL_ID`, sul.LABEL_EN `SUPPLIER_LABEL_EN`, sul.LABEL_FR `SUPPLIER_LABEL_FR`, sul.LABEL_SP `SUPPLIER_LABEL_SP`, sul.LABEL_PR `SUPPLIER_LABEL_PR`,
			shs.SHIPMENT_STATUS_ID, shsl.LABEL_ID `SHIPMENT_STATUS_LABEL_ID`, shsl.LABEL_EN `SHIPMENT_STATUS_LABEL_EN`, shsl.LABEL_FR `SHIPMENT_STATUS_LABEL_FR`, shsl.LABEL_SP `SHIPMENT_STATUS_LABEL_SP`, shsl.LABEL_PR `SHIPMENT_STATUS_LABEL_PR`,
			ds.DATA_SOURCE_ID, dsl.LABEL_ID `DATA_SOURCE_LABEL_ID`, dsl.LABEL_EN `DATA_SOURCE_LABEL_EN`, dsl.LABEL_FR `DATA_SOURCE_LABEL_FR`, dsl.LABEL_SP `DATA_SOURCE_LABEL_SP`, dsl.LABEL_PR `DATA_SOURCE_LABEL_PR`,
			sc.CURRENCY_ID `SHIPMENT_CURRENCY_ID`, sc.`CURRENCY_CODE` `SHIPMENT_CURRENCY_CODE`, s.CONVERSION_RATE_TO_USD `SHIPMENT_CONVERSION_RATE_TO_USD`, 
            scl.LABEL_ID `SHIPMENT_CURRENCY_LABEL_ID`, scl.LABEL_EN `SHIPMENT_CURRENCY_LABEL_EN`, scl.LABEL_FR `SHIPMENT_CURRENCY_LABEL_FR`, scl.LABEL_SP `SHIPMENT_CURRENCY_LABEL_SP`, scl.LABEL_PR `SHIPMENT_CURRENCY_LABEL_PR`,
            st.EMERGENCY_ORDER,
            cb.USER_ID `CB_USER_ID`, cb.USERNAME `CB_USERNAME`, s.CREATED_DATE, lmb.USER_ID `LMB_USER_ID`, lmb.USERNAME `LMB_USERNAME`, st.LAST_MODIFIED_DATE, st.ACTIVE,
			bc.CURRENCY_ID `BUDGET_CURRENCY_ID`, bc.CURRENCY_CODE `BUDGET_CURRENCY_CODE`, b.CONVERSION_RATE_TO_USD `BUDGET_CURRENCY_CONVERSION_RATE_TO_USD`, bcl.LABEL_ID `BUDGET_CURRENCY_LABEL_ID`, bcl.LABEL_EN `BUDGET_CURRENCY_LABEL_EN`, bcl.LABEL_FR `BUDGET_CURRENCY_LABEL_FR`, bcl.LABEL_SP `BUDGET_CURRENCY_LABEL_SP`, bcl.LABEL_PR `BUDGET_CURRENCY_LABEL_PR`, 
			b.BUDGET_ID, b.BUDGET_CODE, bl.LABEL_ID `BUDGET_LABEL_ID`, bl.LABEL_EN `BUDGET_LABEL_EN`, bl.LABEL_FR `BUDGET_LABEL_FR`, bl.LABEL_SP `BUDGET_LABEL_SP`, bl.LABEL_PR `BUDGET_LABEL_PR`,
			fs.FUNDING_SOURCE_ID, fs.FUNDING_SOURCE_CODE, fsl.LABEL_ID `FUNDING_SOURCE_LABEL_ID`, fsl.LABEL_EN `FUNDING_SOURCE_LABEL_EN`, fsl.LABEL_FR `FUNDING_SOURCE_LABEL_FR`, fsl.LABEL_SP `FUNDING_SOURCE_LABEL_SP`, fsl.LABEL_PR `FUNDING_SOURCE_LABEL_PR`
		FROM 
	(
    SELECT st.SHIPMENT_ID, MAX(st.VERSION_ID) MAX_VERSION_ID FROM rm_shipment s LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID WHERE (@versiONId=-1 OR st.VERSION_ID<=@versiONId) AND s.PROGRAM_ID=@programId GROUP BY st.SHIPMENT_ID
) ts 
LEFT JOIN rm_shipment s ON ts.SHIPMENT_ID=s.SHIPMENT_ID
LEFT JOIN rm_shipment_trans st ON ts.SHIPMENT_ID=st.SHIPMENT_ID AND ts.MAX_VERSION_ID=st.VERSION_ID
LEFT JOIN rm_program p ON s.PROGRAM_ID=p.PROGRAM_ID
LEFT JOIN ap_label pl ON p.LABEL_ID=pl.LABEL_ID
LEFT JOIN rm_procurement_agent pa on st.PROCUREMENT_AGENT_ID=pa.PROCUREMENT_AGENT_ID
LEFT JOIN ap_label pal on pa.LABEL_ID=pal.LABEL_ID
LEFT JOIN rm_planning_unit pu ON st.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID
LEFT JOIN ap_label pul ON pu.LABEL_ID=pul.LABEL_ID
LEFT JOIN rm_forecasting_unit fu ON pu.FORECASTING_UNIT_ID=fu.FORECASTING_UNIT_ID
LEFT JOIN ap_label ful ON fu.LABEL_ID=ful.LABEL_ID
LEFT JOIN rm_product_category pc ON fu.PRODUCT_CATEGORY_ID=pc.PRODUCT_CATEGORY_ID
LEFT JOIN ap_label pcl ON pc.LABEL_ID=pcl.LABEL_ID
LEFT JOIN rm_procurement_unit pru ON st.PROCUREMENT_UNIT_ID=pru.PROCUREMENT_UNIT_ID
LEFT JOIN ap_label prul ON pru.LABEL_ID=prul.LABEL_ID
LEFT JOIN rm_supplier su ON st.SUPPLIER_ID=su.SUPPLIER_ID
LEFT JOIN ap_label sul on su.LABEL_ID=sul.LABEL_ID
LEFT JOIN ap_shipment_status shs ON st.SHIPMENT_STATUS_ID=shs.SHIPMENT_STATUS_ID
LEFT JOIN ap_label shsl ON shs.LABEL_ID=shsl.LABEL_ID 
LEFT JOIN rm_data_source ds ON st.DATA_SOURCE_ID=ds.DATA_SOURCE_ID
LEFT JOIN ap_label dsl ON ds.LABEL_ID=dsl.LABEL_ID
LEFT JOIN us_user cb ON s.CREATED_BY=cb.USER_ID
LEFT JOIN us_user lmb ON st.LAST_MODIFIED_BY=lmb.USER_ID
LEFT JOIN ap_currency sc ON s.CURRENCY_ID=sc.CURRENCY_ID
LEFT JOIN ap_label scl ON sc.LABEL_ID=scl.LABEL_ID
LEFT JOIN rm_budget b ON st.BUDGET_ID=b.BUDGET_ID
LEFT JOIN ap_label bl on b.LABEL_ID=bl.LABEL_ID
LEFT JOIN ap_currency bc ON b.CURRENCY_ID=bc.CURRENCY_ID
LEFT JOIN ap_label bcl ON bc.LABEL_ID=bcl.LABEL_ID
LEFT JOIN rm_funding_source fs ON st.FUNDING_SOURCE_ID=fs.FUNDING_SOURCE_ID
LEFT JOIN ap_label fsl ON fs.LABEL_ID=fsl.LABEL_ID
) st 
    LEFT JOIN rm_shipment_trans_batch_info stbi ON st.SHIPMENT_TRANS_ID = stbi.SHIPMENT_TRANS_ID
    LEFT JOIN rm_batch_info bi ON stbi.BATCH_ID=bi.BATCH_ID
    ORDER BY st.PLANNING_UNIT_ID, COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE), bi.EXPIRY_DATE, bi.BATCH_ID;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getShipmentDataForSync` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `getShipmentDataForSync`(PROGRAM_ID INT(10), VERSION_ID INT (10), LAST_SYNC_DATE DATETIME)
BEGIN
	SET @programId = PROGRAM_ID;
    SET @versionId = VERSION_ID;
    SET @lastSyncDate = LAST_SYNC_DATE;
	
    IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) into @versionId FROM rm_program_version pv where pv.PROGRAM_ID=@programId;
    END IF;
    
	SELECT 
		st.*, stbi.SHIPMENT_TRANS_BATCH_INFO_ID, stbi.BATCH_ID, bi.PLANNING_UNIT_ID `BATCH_PLANNING_UNIT_ID`, bi.BATCH_NO, bi.AUTO_GENERATED, bi.EXPIRY_DATE, stbi.BATCH_SHIPMENT_QTY `BATCH_SHIPMENT_QTY` 
	FROM (
        SELECT 
			s.SHIPMENT_ID, s.PARENT_SHIPMENT_ID, st.EXPECTED_DELIVERY_DATE, st.PLANNED_DATE, st.SUBMITTED_DATE, st.APPROVED_DATE, st.SHIPPED_DATE, st.ARRIVED_DATE, st.RECEIVED_DATE, st.SHIPMENT_QTY, st.RATE, st.PRODUCT_COST, st.FREIGHT_COST, st.SHIPMENT_MODE, s.SUGGESTED_QTY, st.ACCOUNT_FLAG, st.ERP_FLAG, st.ORDER_NO, st.PRIME_LINE_NO, st.VERSION_ID, st.NOTES, st.SHIPMENT_TRANS_ID, 
			p.PROGRAM_ID, pl.LABEL_ID `PROGRAM_LABEL_ID`, pl.LABEL_EN `PROGRAM_LABEL_EN`, pl.LABEL_FR `PROGRAM_LABEL_FR`, pl.LABEL_SP `PROGRAM_LABEL_SP`, pl.LABEL_PR `PROGRAM_LABEL_PR`,
			pa.PROCUREMENT_AGENT_ID, pa.PROCUREMENT_AGENT_CODE, pa.`COLOR_HTML_CODE`, pal.LABEL_ID `PROCUREMENT_AGENT_LABEL_ID`, pal.LABEL_EN `PROCUREMENT_AGENT_LABEL_EN`, pal.LABEL_FR `PROCUREMENT_AGENT_LABEL_FR`, pal.LABEL_SP `PROCUREMENT_AGENT_LABEL_SP`, pal.LABEL_PR `PROCUREMENT_AGENT_LABEL_PR`,
			pu.PLANNING_UNIT_ID, pul.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pul.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pul.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pul.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pul.LABEL_PR `PLANNING_UNIT_LABEL_PR`,
			fu.FORECASTING_UNIT_ID, ful.LABEL_ID `FORECASTING_UNIT_LABEL_ID`, ful.LABEL_EN `FORECASTING_UNIT_LABEL_EN`, ful.LABEL_FR `FORECASTING_UNIT_LABEL_FR`, ful.LABEL_SP `FORECASTING_UNIT_LABEL_SP`, ful.LABEL_PR `FORECASTING_UNIT_LABEL_PR`,
			pc.PRODUCT_CATEGORY_ID, pcl.LABEL_ID `PRODUCT_CATEGORY_LABEL_ID`, pcl.LABEL_EN `PRODUCT_CATEGORY_LABEL_EN`, pcl.LABEL_FR `PRODUCT_CATEGORY_LABEL_FR`, pcl.LABEL_SP `PRODUCT_CATEGORY_LABEL_SP`, pcl.LABEL_PR `PRODUCT_CATEGORY_LABEL_PR`,
			pru.PROCUREMENT_UNIT_ID, prul.LABEL_ID `PROCUREMENT_UNIT_LABEL_ID`, prul.LABEL_EN `PROCUREMENT_UNIT_LABEL_EN`, prul.LABEL_FR `PROCUREMENT_UNIT_LABEL_FR`, prul.LABEL_SP `PROCUREMENT_UNIT_LABEL_SP`, prul.LABEL_PR `PROCUREMENT_UNIT_LABEL_PR`,
			su.SUPPLIER_ID, sul.LABEL_ID `SUPPLIER_LABEL_ID`, sul.LABEL_EN `SUPPLIER_LABEL_EN`, sul.LABEL_FR `SUPPLIER_LABEL_FR`, sul.LABEL_SP `SUPPLIER_LABEL_SP`, sul.LABEL_PR `SUPPLIER_LABEL_PR`,
			shs.SHIPMENT_STATUS_ID, shsl.LABEL_ID `SHIPMENT_STATUS_LABEL_ID`, shsl.LABEL_EN `SHIPMENT_STATUS_LABEL_EN`, shsl.LABEL_FR `SHIPMENT_STATUS_LABEL_FR`, shsl.LABEL_SP `SHIPMENT_STATUS_LABEL_SP`, shsl.LABEL_PR `SHIPMENT_STATUS_LABEL_PR`,
			ds.DATA_SOURCE_ID, dsl.LABEL_ID `DATA_SOURCE_LABEL_ID`, dsl.LABEL_EN `DATA_SOURCE_LABEL_EN`, dsl.LABEL_FR `DATA_SOURCE_LABEL_FR`, dsl.LABEL_SP `DATA_SOURCE_LABEL_SP`, dsl.LABEL_PR `DATA_SOURCE_LABEL_PR`,
			sc.CURRENCY_ID `SHIPMENT_CURRENCY_ID`, sc.`CURRENCY_CODE` `SHIPMENT_CURRENCY_CODE`, s.CONVERSION_RATE_TO_USD `SHIPMENT_CONVERSION_RATE_TO_USD`, 
            scl.LABEL_ID `SHIPMENT_CURRENCY_LABEL_ID`, scl.LABEL_EN `SHIPMENT_CURRENCY_LABEL_EN`, scl.LABEL_FR `SHIPMENT_CURRENCY_LABEL_FR`, scl.LABEL_SP `SHIPMENT_CURRENCY_LABEL_SP`, scl.LABEL_PR `SHIPMENT_CURRENCY_LABEL_PR`,
            st.EMERGENCY_ORDER,
            cb.USER_ID `CB_USER_ID`, cb.USERNAME `CB_USERNAME`, s.CREATED_DATE, lmb.USER_ID `LMB_USER_ID`, lmb.USERNAME `LMB_USERNAME`, st.LAST_MODIFIED_DATE, st.ACTIVE,
			bc.CURRENCY_ID `BUDGET_CURRENCY_ID`, bc.CURRENCY_CODE `BUDGET_CURRENCY_CODE`, b.CONVERSION_RATE_TO_USD `BUDGET_CURRENCY_CONVERSION_RATE_TO_USD`, bcl.LABEL_ID `BUDGET_CURRENCY_LABEL_ID`, bcl.LABEL_EN `BUDGET_CURRENCY_LABEL_EN`, bcl.LABEL_FR `BUDGET_CURRENCY_LABEL_FR`, bcl.LABEL_SP `BUDGET_CURRENCY_LABEL_SP`, bcl.LABEL_PR `BUDGET_CURRENCY_LABEL_PR`, 
			b.BUDGET_ID, b.BUDGET_CODE, bl.LABEL_ID `BUDGET_LABEL_ID`, bl.LABEL_EN `BUDGET_LABEL_EN`, bl.LABEL_FR `BUDGET_LABEL_FR`, bl.LABEL_SP `BUDGET_LABEL_SP`, bl.LABEL_PR `BUDGET_LABEL_PR`,
			fs.FUNDING_SOURCE_ID, fs.FUNDING_SOURCE_CODE, fsl.LABEL_ID `FUNDING_SOURCE_LABEL_ID`, fsl.LABEL_EN `FUNDING_SOURCE_LABEL_EN`, fsl.LABEL_FR `FUNDING_SOURCE_LABEL_FR`, fsl.LABEL_SP `FUNDING_SOURCE_LABEL_SP`, fsl.LABEL_PR `FUNDING_SOURCE_LABEL_PR`
		FROM 
	(
    SELECT st.SHIPMENT_ID, MAX(st.VERSION_ID) MAX_VERSION_ID FROM rm_shipment s LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID WHERE (@versiONId=-1 OR st.VERSION_ID<=@versiONId) AND s.PROGRAM_ID=@programId GROUP BY st.SHIPMENT_ID
) ts 
LEFT JOIN rm_shipment s ON ts.SHIPMENT_ID=s.SHIPMENT_ID
LEFT JOIN rm_shipment_trans st ON ts.SHIPMENT_ID=st.SHIPMENT_ID AND ts.MAX_VERSION_ID=st.VERSION_ID
LEFT JOIN rm_program p ON s.PROGRAM_ID=p.PROGRAM_ID
LEFT JOIN ap_label pl ON p.LABEL_ID=pl.LABEL_ID
LEFT JOIN rm_procurement_agent pa on st.PROCUREMENT_AGENT_ID=pa.PROCUREMENT_AGENT_ID
LEFT JOIN ap_label pal on pa.LABEL_ID=pal.LABEL_ID
LEFT JOIN rm_planning_unit pu ON st.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID
LEFT JOIN ap_label pul ON pu.LABEL_ID=pul.LABEL_ID
LEFT JOIN rm_forecasting_unit fu ON pu.FORECASTING_UNIT_ID=fu.FORECASTING_UNIT_ID
LEFT JOIN ap_label ful ON fu.LABEL_ID=ful.LABEL_ID
LEFT JOIN rm_product_category pc ON fu.PRODUCT_CATEGORY_ID=pc.PRODUCT_CATEGORY_ID
LEFT JOIN ap_label pcl ON pc.LABEL_ID=pcl.LABEL_ID
LEFT JOIN rm_procurement_unit pru ON st.PROCUREMENT_UNIT_ID=pru.PROCUREMENT_UNIT_ID
LEFT JOIN ap_label prul ON pru.LABEL_ID=prul.LABEL_ID
LEFT JOIN rm_supplier su ON st.SUPPLIER_ID=su.SUPPLIER_ID
LEFT JOIN ap_label sul on su.LABEL_ID=sul.LABEL_ID
LEFT JOIN ap_shipment_status shs ON st.SHIPMENT_STATUS_ID=shs.SHIPMENT_STATUS_ID
LEFT JOIN ap_label shsl ON shs.LABEL_ID=shsl.LABEL_ID 
LEFT JOIN rm_data_source ds ON st.DATA_SOURCE_ID=ds.DATA_SOURCE_ID
LEFT JOIN ap_label dsl ON ds.LABEL_ID=dsl.LABEL_ID
LEFT JOIN us_user cb ON s.CREATED_BY=cb.USER_ID
LEFT JOIN us_user lmb ON st.LAST_MODIFIED_BY=lmb.USER_ID
LEFT JOIN ap_currency sc ON s.CURRENCY_ID=sc.CURRENCY_ID
LEFT JOIN ap_label scl ON sc.LABEL_ID=scl.LABEL_ID
LEFT JOIN rm_budget b ON st.BUDGET_ID=b.BUDGET_ID
LEFT JOIN ap_label bl on b.LABEL_ID=bl.LABEL_ID
LEFT JOIN ap_currency bc ON b.CURRENCY_ID=bc.CURRENCY_ID
LEFT JOIN ap_label bcl ON bc.LABEL_ID=bcl.LABEL_ID
LEFT JOIN rm_funding_source fs ON st.FUNDING_SOURCE_ID=fs.FUNDING_SOURCE_ID
LEFT JOIN ap_label fsl ON fs.LABEL_ID=fsl.LABEL_ID
WHERE st.LAST_MODIFIED_DATE > @lastSyncDate
) st 
    LEFT JOIN rm_shipment_trans_batch_info stbi ON st.SHIPMENT_TRANS_ID = stbi.SHIPMENT_TRANS_ID
    LEFT JOIN rm_batch_info bi ON stbi.BATCH_ID=bi.BATCH_ID
    ORDER BY st.PLANNING_UNIT_ID, COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE), bi.EXPIRY_DATE, bi.BATCH_ID;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getShipmentListForDelinking` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `getShipmentListForDelinking`(PROGRAM_ID INT(10), PLANNING_UNIT_ID INT(10), VERSION_ID INT (10))
BEGIN
	SET @programId = PROGRAM_ID;
	SET @planningUnitId = PLANNING_UNIT_ID;
    SET @versionId = VERSION_ID;
	
    IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) into @versionId FROM rm_program_version pv where pv.PROGRAM_ID=@programId;
    END IF;
    
	SELECT 
		st.SHIPMENT_ID, st.SHIPMENT_TRANS_ID, st.SHIPMENT_QTY, st.EXPECTED_DELIVERY_DATE, st.PLANNING_UNIT_ID, st.PRODUCT_COST,
        st.PROCUREMENT_AGENT_ID, st.PROCUREMENT_AGENT_CODE, st.`COLOR_HTML_CODE`, st.`PROCUREMENT_AGENT_LABEL_ID`, st.`PROCUREMENT_AGENT_LABEL_EN`, st.`PROCUREMENT_AGENT_LABEL_FR`, st.`PROCUREMENT_AGENT_LABEL_SP`, st.`PROCUREMENT_AGENT_LABEL_PR`,
        st.FUNDING_SOURCE_ID, st.FUNDING_SOURCE_CODE, st.`FUNDING_SOURCE_LABEL_ID`, st.`FUNDING_SOURCE_LABEL_EN`, st.`FUNDING_SOURCE_LABEL_FR`, st.`FUNDING_SOURCE_LABEL_SP`, st.`FUNDING_SOURCE_LABEL_PR`,
        st.BUDGET_ID, st.BUDGET_CODE, st.`BUDGET_LABEL_ID`, st.`BUDGET_LABEL_EN`, st.`BUDGET_LABEL_FR`, st.`BUDGET_LABEL_SP`, st.`BUDGET_LABEL_PR`,
        st.SHIPMENT_STATUS_ID, st.`SHIPMENT_STATUS_LABEL_ID`, st.`SHIPMENT_STATUS_LABEL_EN`, st.`SHIPMENT_STATUS_LABEL_FR`, st.`SHIPMENT_STATUS_LABEL_SP`, st.`SHIPMENT_STATUS_LABEL_PR`
	FROM (
        SELECT 
			s.SHIPMENT_ID, st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE,st.SHIPMENT_QTY, st.RATE, st.PRODUCT_COST, st.FREIGHT_COST, st.ACCOUNT_FLAG, st.SHIPMENT_TRANS_ID, st.PLANNING_UNIT_ID,
			pa.PROCUREMENT_AGENT_ID, pa.PROCUREMENT_AGENT_CODE, pa.`COLOR_HTML_CODE`, pa.LABEL_ID `PROCUREMENT_AGENT_LABEL_ID`, pa.LABEL_EN `PROCUREMENT_AGENT_LABEL_EN`, pa.LABEL_FR `PROCUREMENT_AGENT_LABEL_FR`, pa.LABEL_SP `PROCUREMENT_AGENT_LABEL_SP`, pa.LABEL_PR `PROCUREMENT_AGENT_LABEL_PR`,
            fs.`FUNDING_SOURCE_ID`, fs.`FUNDING_SOURCE_CODE`, fs.LABEL_ID `FUNDING_SOURCE_LABEL_ID`, fs.LABEL_EN `FUNDING_SOURCE_LABEL_EN`, fs.LABEL_FR `FUNDING_SOURCE_LABEL_FR`, fs.LABEL_SP `FUNDING_SOURCE_LABEL_SP`, fs.LABEL_PR `FUNDING_SOURCE_LABEL_PR`,
			shs.SHIPMENT_STATUS_ID, shs.LABEL_ID `SHIPMENT_STATUS_LABEL_ID`, shs.LABEL_EN `SHIPMENT_STATUS_LABEL_EN`, shs.LABEL_FR `SHIPMENT_STATUS_LABEL_FR`, shs.LABEL_SP `SHIPMENT_STATUS_LABEL_SP`, shs.LABEL_PR `SHIPMENT_STATUS_LABEL_PR`,
			sc.CURRENCY_ID `SHIPMENT_CURRENCY_ID`, sc.`CURRENCY_CODE` `SHIPMENT_CURRENCY_CODE`, s.CONVERSION_RATE_TO_USD `SHIPMENT_CONVERSION_RATE_TO_USD`, 
            sc.LABEL_ID `SHIPMENT_CURRENCY_LABEL_ID`, sc.LABEL_EN `SHIPMENT_CURRENCY_LABEL_EN`, sc.LABEL_FR `SHIPMENT_CURRENCY_LABEL_FR`, sc.LABEL_SP `SHIPMENT_CURRENCY_LABEL_SP`, sc.LABEL_PR `SHIPMENT_CURRENCY_LABEL_PR`,
			st.ACTIVE, 
            b.BUDGET_ID, b.BUDGET_CODE, b.LABEL_ID `BUDGET_LABEL_ID`, b.LABEL_EN `BUDGET_LABEL_EN`, b.LABEL_FR `BUDGET_LABEL_FR`, b.LABEL_SP `BUDGET_LABEL_SP`, b.LABEL_PR `BUDGET_LABEL_PR`
		FROM (
			SELECT st.SHIPMENT_ID, MAX(st.VERSION_ID) MAX_VERSION_ID FROM rm_shipment s LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID WHERE (@versiONId=-1 OR st.VERSION_ID<=@versiONId) AND s.PROGRAM_ID=@programId GROUP BY st.SHIPMENT_ID
		) ts 
		LEFT JOIN rm_shipment s ON ts.SHIPMENT_ID=s.SHIPMENT_ID
		LEFT JOIN rm_shipment_trans st ON ts.SHIPMENT_ID=st.SHIPMENT_ID AND ts.MAX_VERSION_ID=st.VERSION_ID
		LEFT JOIN vw_procurement_agent pa on st.PROCUREMENT_AGENT_ID=pa.PROCUREMENT_AGENT_ID
        LEFT JOIN vw_funding_source fs ON st.FUNDING_SOURCE_ID=fs.FUNDING_SOURCE_ID
		LEFT JOIN vw_shipment_status shs ON st.SHIPMENT_STATUS_ID=shs.SHIPMENT_STATUS_ID
		LEFT JOIN vw_currency sc ON s.CURRENCY_ID=sc.CURRENCY_ID
		LEFT JOIN vw_budget b ON st.BUDGET_ID=b.BUDGET_ID
        LEFT JOIN rm_manual_tagging mt ON ts.SHIPMENT_ID=mt.SHIPMENT_ID
		WHERE st.PLANNING_UNIT_ID=@planningUnitId AND mt.SHIPMENT_ID IS NOT NULL
	) st 
	ORDER BY COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getShipmentListForManualLinking` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `getShipmentListForManualLinking`(PROGRAM_ID INT(10), PLANNING_UNIT_ID INT(10), VERSION_ID INT (10))
BEGIN
	SET @programId = PROGRAM_ID;
	SET @planningUnitId = PLANNING_UNIT_ID;
    SET @versionId = VERSION_ID;
	
    IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) into @versionId FROM rm_program_version pv where pv.PROGRAM_ID=@programId;
    END IF;
    
	SELECT 
		st.SHIPMENT_ID, st.SHIPMENT_TRANS_ID, st.SHIPMENT_QTY, st.EXPECTED_DELIVERY_DATE, st.PLANNING_UNIT_ID, st.PRODUCT_COST,
        st.PROCUREMENT_AGENT_ID, st.PROCUREMENT_AGENT_CODE, st.`COLOR_HTML_CODE`, st.`PROCUREMENT_AGENT_LABEL_ID`, st.`PROCUREMENT_AGENT_LABEL_EN`, st.`PROCUREMENT_AGENT_LABEL_FR`, st.`PROCUREMENT_AGENT_LABEL_SP`, st.`PROCUREMENT_AGENT_LABEL_PR`,
        st.FUNDING_SOURCE_ID, st.FUNDING_SOURCE_CODE, st.`FUNDING_SOURCE_LABEL_ID`, st.`FUNDING_SOURCE_LABEL_EN`, st.`FUNDING_SOURCE_LABEL_FR`, st.`FUNDING_SOURCE_LABEL_SP`, st.`FUNDING_SOURCE_LABEL_PR`,
        st.BUDGET_ID, st.BUDGET_CODE, st.`BUDGET_LABEL_ID`, st.`BUDGET_LABEL_EN`, st.`BUDGET_LABEL_FR`, st.`BUDGET_LABEL_SP`, st.`BUDGET_LABEL_PR`,
        st.SHIPMENT_STATUS_ID, st.`SHIPMENT_STATUS_LABEL_ID`, st.`SHIPMENT_STATUS_LABEL_EN`, st.`SHIPMENT_STATUS_LABEL_FR`, st.`SHIPMENT_STATUS_LABEL_SP`, st.`SHIPMENT_STATUS_LABEL_PR`
	FROM (
        SELECT 
			s.SHIPMENT_ID, st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE,st.SHIPMENT_QTY, st.RATE, st.PRODUCT_COST, st.FREIGHT_COST, st.ACCOUNT_FLAG, st.SHIPMENT_TRANS_ID, st.PLANNING_UNIT_ID,
			pa.`PROCUREMENT_AGENT_ID`, pa.`PROCUREMENT_AGENT_CODE`, pa.`COLOR_HTML_CODE`, pa.`LABEL_ID` `PROCUREMENT_AGENT_LABEL_ID`, pa.`LABEL_EN` `PROCUREMENT_AGENT_LABEL_EN`, pa.LABEL_FR `PROCUREMENT_AGENT_LABEL_FR`, pa.LABEL_SP `PROCUREMENT_AGENT_LABEL_SP`, pa.LABEL_PR `PROCUREMENT_AGENT_LABEL_PR`,
            fs.`FUNDING_SOURCE_ID`, fs.`FUNDING_SOURCE_CODE`, fs.LABEL_ID `FUNDING_SOURCE_LABEL_ID`, fs.LABEL_EN `FUNDING_SOURCE_LABEL_EN`, fs.LABEL_FR `FUNDING_SOURCE_LABEL_FR`, fs.LABEL_SP `FUNDING_SOURCE_LABEL_SP`, fs.LABEL_PR `FUNDING_SOURCE_LABEL_PR`,
			shs.SHIPMENT_STATUS_ID, shs.LABEL_ID `SHIPMENT_STATUS_LABEL_ID`, shs.LABEL_EN `SHIPMENT_STATUS_LABEL_EN`, shs.LABEL_FR `SHIPMENT_STATUS_LABEL_FR`, shs.LABEL_SP `SHIPMENT_STATUS_LABEL_SP`, shs.LABEL_PR `SHIPMENT_STATUS_LABEL_PR`,
			sc.CURRENCY_ID `SHIPMENT_CURRENCY_ID`, sc.`CURRENCY_CODE` `SHIPMENT_CURRENCY_CODE`, s.CONVERSION_RATE_TO_USD `SHIPMENT_CONVERSION_RATE_TO_USD`, 
            sc.LABEL_ID `SHIPMENT_CURRENCY_LABEL_ID`, sc.LABEL_EN `SHIPMENT_CURRENCY_LABEL_EN`, sc.LABEL_FR `SHIPMENT_CURRENCY_LABEL_FR`, sc.LABEL_SP `SHIPMENT_CURRENCY_LABEL_SP`, sc.LABEL_PR `SHIPMENT_CURRENCY_LABEL_PR`,
			st.ACTIVE, 
            b.BUDGET_ID, b.BUDGET_CODE, b.LABEL_ID `BUDGET_LABEL_ID`, b.LABEL_EN `BUDGET_LABEL_EN`, b.LABEL_FR `BUDGET_LABEL_FR`, b.LABEL_SP `BUDGET_LABEL_SP`, b.LABEL_PR `BUDGET_LABEL_PR`
		FROM (
			SELECT st.SHIPMENT_ID, MAX(st.VERSION_ID) MAX_VERSION_ID FROM rm_shipment s LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID WHERE (@versiONId=-1 OR st.VERSION_ID<=@versiONId) AND s.PROGRAM_ID=@programId GROUP BY st.SHIPMENT_ID
		) ts 
		LEFT JOIN rm_shipment s ON ts.SHIPMENT_ID=s.SHIPMENT_ID
		LEFT JOIN rm_shipment_trans st ON ts.SHIPMENT_ID=st.SHIPMENT_ID AND ts.MAX_VERSION_ID=st.VERSION_ID
		LEFT JOIN vw_procurement_agent pa on st.PROCUREMENT_AGENT_ID=pa.PROCUREMENT_AGENT_ID
        LEFT JOIN vw_funding_source fs ON st.FUNDING_SOURCE_ID=fs.FUNDING_SOURCE_ID
		LEFT JOIN vw_shipment_status shs ON st.SHIPMENT_STATUS_ID=shs.SHIPMENT_STATUS_ID
		LEFT JOIN vw_currency sc ON s.CURRENCY_ID=sc.CURRENCY_ID
		LEFT JOIN vw_budget b ON st.BUDGET_ID=b.BUDGET_ID
        LEFT JOIN rm_manual_tagging mt ON mt.SHIPMENT_ID=ts.SHIPMENT_ID
		WHERE st.ERP_FLAG=0 AND st.ACTIVE AND st.SHIPMENT_STATUS_ID IN (2,3,4,5,9) AND st.PLANNING_UNIT_ID=@planningUnitId AND mt.SHIPMENT_ID IS NULL
	) st 
	ORDER BY COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getStockStatusForProgram` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `getStockStatusForProgram`(VAR_PROGRAM_ID INT(10), VAR_VERSION_ID INT(10), VAR_DT DATE, VAR_INCLUDE_PLANNED_SHIPMENTS TINYINT(1))
BEGIN
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	-- Report no 28
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	-- programId must be a single Program cannot be muti-program select or -1 for all programs
    -- versionId must be the actual version that you want to refer to for this report or -1 in which case it will automatically take the latest version (not approved or final just latest)
	-- dt is the month for which you want to run the report
    -- includePlannedShipments = 1 means that you want to include the shipments that are still in the Planned stage while running this report.
    -- includePlannedShipments = 0 means that you want to exclude the shipments that are still in the Planned stage while running this report.
    -- AMC is calculated based on the MonthsInPastForAMC and MonthsInFutureForAMC from the Program setup
    -- Current month is always included in AMC
    -- if a Month does not have Consumption then it is excluded from the AMC calculations
    -- MinMonthsOfStock is Max of MinMonth of Stock taken from the Program-planning Unit and 3
    -- MaxMonthsOfStock is Min of Min of MinMonthOfStock+ReorderFrequency and 15
    
	SET @programId = VAR_PROGRAM_ID;
	SET @versionId = VAR_VERSION_ID;
	SET @dt = VAR_DT;
	SET @includePlannedShipments = VAR_INCLUDE_PLANNED_SHIPMENTS;
    
    IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) INTO @versionId FROM rm_program_version pv WHERE pv.PROGRAM_ID=@programId;
	END IF;
    
    SELECT  
        pu.PLANNING_UNIT_ID, pu.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pu.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pu.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pu.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pu.LABEL_PR `PLANNING_UNIT_LABEL_PR`,
        ppu.MIN_MONTHS_OF_STOCK, (ppu.MIN_MONTHS_OF_STOCK+ppu.REORDER_FREQUENCY_IN_MONTHS) `MAX_MONTHS_OF_STOCK`,
--        IF(ppu.MIN_MONTHS_OF_STOCK<r.MIN_MOS_MIN_GAURDRAIL,r.MIN_MOS_MIN_GAURDRAIL, ppu.MIN_MONTHS_OF_STOCK) `MIN_MONTHS_OF_STOCK`, 
--        IF(IF(ppu.MIN_MONTHS_OF_STOCK<r.MIN_MOS_MIN_GAURDRAIL,r.MIN_MOS_MIN_GAURDRAIL, ppu.MIN_MONTHS_OF_STOCK)+ppu.REORDER_FREQUENCY_IN_MONTHS<r.MIN_MOS_MAX_GAURDRAIL, r.MIN_MOS_MAX_GAURDRAIL, IF(IF(ppu.MIN_MONTHS_OF_STOCK<r.MIN_MOS_MIN_GAURDRAIL,r.MIN_MOS_MIN_GAURDRAIL, ppu.MIN_MONTHS_OF_STOCK)+ppu.REORDER_FREQUENCY_IN_MONTHS>r.MAX_MOS_MAX_GAURDRAIL, r.MAX_MOS_MAX_GAURDRAIL, IF(ppu.MIN_MONTHS_OF_STOCK<r.MIN_MOS_MIN_GAURDRAIL,r.MIN_MOS_MIN_GAURDRAIL, ppu.MIN_MONTHS_OF_STOCK)+ppu.REORDER_FREQUENCY_IN_MONTHS)) `MAX_MONTHS_OF_STOCK`,
        IF(@includePlannedShipments, IFNULL(amc.CLOSING_BALANCE,0), IFNULL(amc.CLOSING_BALANCE_WPS,0)) `STOCK`, 
        IFNULL(amc.AMC,0) `AMC`, 
        IF(@includePlannedShipments, IFNULL(amc.MOS,0), IFNULL(amc.MOS_WPS,0)) `MoS`,
        a3.LAST_STOCK_DATE `STOCK_COUNT_DATE`
    FROM rm_program_planning_unit ppu 
    LEFT JOIN rm_supply_plan_amc amc ON amc.PROGRAM_ID=@programId AND amc.VERSION_ID=@versionId AND ppu.PLANNING_UNIT_ID=amc.PLANNING_UNIT_ID AND amc.TRANS_DATE=@dt
    LEFT JOIN vw_planning_unit pu ON ppu.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID
    LEFT JOIN rm_program p ON ppu.PROGRAM_ID=p.PROGRAM_ID
    LEFT JOIN rm_realm_country rc ON p.REALM_COUNTRY_ID=rc.REALM_COUNTRY_ID
    LEFT JOIN rm_realm r ON rc.REALM_ID=r.REALM_ID
    LEFT JOIN (SELECT a2.PLANNING_UNIT_ID, MAX(a2.TRANS_DATE) LAST_STOCK_DATE FROM rm_supply_plan_amc a2 WHERE a2.PROGRAM_ID=@programId AND a2.VERSION_ID=@versionId AND a2.TRANS_DATE<=@dt AND a2.REGION_COUNT=a2.REGION_COUNT_FOR_STOCK GROUP BY a2.PLANNING_UNIT_ID) a3 ON amc.PLANNING_UNIT_ID=a3.PLANNING_UNIT_ID
    WHERE ppu.PROGRAM_ID=@programId;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getVersionId` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `getVersionId`(PROGRAM_ID INT(10), VERSION_TYPE_ID INT(10), VERSION_STATUS_ID INT(10), NOTES TEXT, CREATED_BY INT(10), CREATED_DATE DATETIME)
BEGIN
	SET @programId = PROGRAM_ID;
	SET @cbUserId = CREATED_BY;
	SET @createdDate = CREATED_DATE;
	SET @versionTypeId = VERSION_TYPE_ID;
	SET @versionStatusId = VERSION_STATUS_ID;
	SET @notes = NOTES;
	INSERT INTO rm_program_version SELECT NULL, @programId, IFNULL(MAX(pv.VERSION_ID)+1,1), @versionTypeId, @versionStatusId, @notes, @cbUserId, @createdDate, @cbUserId, @createdDate, 0 FROM rm_program_version pv WHERE pv.`PROGRAM_ID`=@programId;
	SELECT pv.VERSION_ID INTO @versionId FROM rm_program_version pv WHERE pv.`PROGRAM_VERSION_ID`= LAST_INSERT_ID();
	UPDATE rm_program p SET p.CURRENT_VERSION_ID=@versionId WHERE p.PROGRAM_ID=@programId;
	SELECT pv.VERSION_ID, pv.NOTES, 
		pv.LAST_MODIFIED_DATE, lmb.USER_ID `LMB_USER_ID`, lmb.USERNAME `LMB_USERNAME`,
		pv.CREATED_DATE, cb.USER_ID `CB_USER_ID`, cb.USERNAME `CB_USERNAME`,
		vt.VERSION_TYPE_ID, vtl.LABEL_ID `VERSION_TYPE_LABEL_ID`, vtl.LABEL_EN `VERSION_TYPE_LABEL_EN`, vtl.LABEL_FR `VERSION_TYPE_LABEL_FR`, vtl.LABEL_SP `VERSION_TYPE_LABEL_SP`, vtl.LABEL_PR `VERSION_TYPE_LABEL_PR`, 
		vs.VERSION_STATUS_ID, vsl.LABEL_ID `VERSION_STATUS_LABEL_ID`, vsl.LABEL_EN `VERSION_STATUS_LABEL_EN`, vsl.LABEL_FR `VERSION_STATUS_LABEL_FR`, vsl.LABEL_SP `VERSION_STATUS_LABEL_SP`, vsl.LABEL_PR `VERSION_STATUS_LABEL_PR` 
	FROM rm_program_version pv 
	LEFT JOIN ap_version_type vt ON pv.VERSION_TYPE_ID=vt.VERSION_TYPE_ID
	LEFT JOIN ap_label vtl ON vt.LABEL_ID=vtl.LABEL_ID 
	LEFT JOIN ap_version_status vs ON pv.VERSION_STATUS_ID=vs.VERSION_STATUS_ID
	LEFT JOIN ap_label vsl ON vs.LABEL_ID=vsl.LABEL_ID
	LEFT JOIN us_user cb ON pv.CREATED_BY=cb.USER_ID
	LEFT JOIN us_user lmb ON pv.LAST_MODIFIED_BY=lmb.USER_ID
	WHERE pv.VERSION_ID=@versionId AND pv.PROGRAM_ID=@programId;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `globalConsumption` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `globalConsumption`(VAR_REALM_ID INT(10), VAR_REALM_COUNTRY_IDS VARCHAR(255), VAR_PROGRAM_IDS VARCHAR(255), VAR_PLANNING_UNIT_IDS VARCHAR(255), VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_REPORT_VIEW INT(10))
BEGIN
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	-- Report no 3
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
	-- realmId must be a valid realm that you want to run this Global report for
    -- RealmCountryIds is the list of Countries that you want to run the report for. Empty means all Countries
    -- ProgramIds is the list of Programs that you want to run the report for. Empty means all Programs
    -- PlanningUnitIds is the list of PlanningUnits that you want to run the report for. Empty means all Planning Units
    -- startDate and stopDate are the range between which you want to run the report for`
    -- reportView = 1 shows the Consumption in PlanningUnits
    -- reportView = 2 shows the Consumption in ForecastingUnits
    
    SET @startDate = VAR_START_DATE;
	SET @stopDate = VAR_STOP_DATE;
    SET @realmId = VAR_REALM_ID;
    SET @reportView = VAR_REPORT_VIEW;
	
    SET @sqlString = "";
    
	SET @sqlString = CONCAT(@sqlString, "SELECT sma.TRANS_DATE, rc.REALM_COUNTRY_ID, c.COUNTRY_CODE, c.LABEL_ID `COUNTRY_LABEL_ID`, c.LABEL_EN `COUNTRY_LABEL_EN`, c.LABEL_FR `COUNTRY_LABEL_FR`, c.LABEL_PR `COUNTRY_LABEL_PR`, c.LABEL_SP `COUNTRY_LABEL_SP`, SUM(IF(@reportView=1, sma.FORECASTED_CONSUMPTION_QTY, sma.FORECASTED_CONSUMPTION_QTY*pu.MULTIPLIER)) `FORECASTED_CONSUMPTION`, SUM(IF(@reportView=1, sma.ACTUAL_CONSUMPTION_QTY, sma.ACTUAL_CONSUMPTION_QTY*pu.MULTIPLIER)) `ACTUAL_CONSUMPTION` ");
    SET @sqlString = CONCAT(@sqlString, "FROM rm_supply_plan_amc sma ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN ");
    SET @sqlString = CONCAT(@sqlString, "    ( ");
    SET @sqlString = CONCAT(@sqlString, "    SELECT ");
    SET @sqlString = CONCAT(@sqlString, "        sma.PROGRAM_ID, ");
    SET @sqlString = CONCAT(@sqlString, "        MAX(sma.VERSION_ID) MAX_VERSION ");
    SET @sqlString = CONCAT(@sqlString, "    FROM rm_supply_plan_amc sma ");
    SET @sqlString = CONCAT(@sqlString, "    LEFT JOIN rm_program_version pv ON sma.PROGRAM_ID=pv.PROGRAM_ID AND sma.VERSION_ID=pv.VERSION_ID ");
    SET @sqlString = CONCAT(@sqlString, "    WHERE TRUE ");
    SET @sqlString = CONCAT(@sqlString, "        AND pv.VERSION_TYPE_ID=2 ");
    SET @sqlString = CONCAT(@sqlString, "        AND pv.VERSION_STATUS_ID=2 ");
    IF LENGTH(VAR_PROGRAM_IDS)>0 THEN
        SET @sqlString = CONCAT(@sqlString, "		AND sma.PROGRAM_ID IN (",VAR_PROGRAM_IDS,") ");
	END IF;
    SET @sqlString = CONCAT(@sqlString, "    GROUP BY sma.PROGRAM_ID ");
    SET @sqlString = CONCAT(@sqlString, ") AS f ON sma.PROGRAM_ID=f.PROGRAM_ID AND sma.VERSION_ID=f.MAX_VERSION ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_program p ON sma.PROGRAM_ID=p.PROGRAM_ID ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_realm_country rc ON p.REALM_COUNTRY_ID=rc.REALM_COUNTRY_ID ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_country c ON rc.COUNTRY_ID=c.COUNTRY_ID ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_planning_unit pu ON sma.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID ");
    SET @sqlString = CONCAT(@sqlString, "WHERE ");
    SET @sqlString = CONCAT(@sqlString, "    sma.TRANS_DATE BETWEEN @startDate AND @stopDate ");
    SET @sqlString = CONCAT(@sqlString, "    AND f.PROGRAM_ID IS NOT NULL ");
    IF LENGTH(VAR_PLANNING_UNIT_IDS)>0 THEN
		SET @sqlString = CONCAT(@sqlString, "		AND sma.PLANNING_UNIT_ID in (",VAR_PLANNING_UNIT_IDS,") ");
    END IF;
    IF LENGTH(VAR_REALM_COUNTRY_IDS)>0 THEN
		SET @sqlString = CONCAT(@sqlString, "		AND rc.REALM_COUNTRY_ID in (",VAR_REALM_COUNTRY_IDS,") ");
    END IF;
    SET @sqlString = CONCAT(@sqlString, "GROUP BY sma.TRANS_DATE, rc.REALM_COUNTRY_ID ");
    PREPARE s1 FROM @sqlString;
    EXECUTE s1;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `inventoryTurns` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `inventoryTurns`(VAR_PROGRAM_ID INT(10), VAR_VERSION_ID INT(10), VAR_START_DATE DATE, VAR_INCLUDE_PLANNED_SHIPMENTS BOOLEAN)
BEGIN
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	-- Report no 9
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
	-- programId cannot be -1 (All) it must be a valid ProgramId
    -- versionId can be -1 or a valid VersionId for that Program. If it is -1 then the last committed Version is automatically taken.
    -- StartDate is the date that you want to run the report for
    -- Include Planned Shipments = 1 menas that Shipments that are in the Planned, Draft, Submitted stages will also be considered in the report
    -- Include Planned Shipments = 0 means that Shipments that are in the Planned, Draft, Submitted stages will not be considered in the report
    -- Inventory Turns = Total Consumption for the last 12 months (including current month) / Avg Stock during that period

	SET @programId = VAR_PROGRAM_ID;
	SET @versionId = VAR_VERSION_ID;
	SET @startDate = VAR_START_DATE;
	SET @includePlannedShipments = VAR_INCLUDE_PLANNED_SHIPMENTS;

	IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) INTO @versionId FROM rm_program_version pv WHERE pv.PROGRAM_ID=@programId;
	END IF;
    
	SELECT 
		ppu.PLANNING_UNIT_ID, pu.LABEL_ID, pu.LABEL_EN, pu.LABEL_FR, pu.LABEL_SP, pu.LABEL_PR, 
		SUM(s2.CONSUMPTION_QTY) `TOTAL_CONSUMPTION`, 
		AVG(s2.STOCK) `AVG_STOCK`,
		COUNT(s2.CONSUMPTION_QTY) `NO_OF_MONTHS`,
		SUM(s2.CONSUMPTION_QTY)/AVG(s2.STOCK) `INVENTORY_TURNS`
	FROM rm_program_planning_unit ppu 
	LEFT JOIN vw_planning_unit pu ON ppu.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID
    LEFT JOIN 
        (
        SELECT 
            spa.TRANS_DATE, spa.PLANNING_UNIT_ID, 
            SUM(IF(spa.ACTUAL IS NULL, NULL, IF(spa.ACTUAL=1, spa.ACTUAL_CONSUMPTION_QTY, spa.FORECASTED_CONSUMPTION_QTY))) `CONSUMPTION_QTY`,
            SUM(IF(@includePlannedShipments, spa.CLOSING_BALANCE, spa.CLOSING_BALANCE_WPS)) `STOCK`
        FROM rm_supply_plan_amc spa WHERE spa.PROGRAM_ID=@programId AND spa.VERSION_ID=@versionId AND spa.TRANS_DATE BETWEEN SUBDATE(@startDate, INTERVAL 11 MONTH) AND @startDate
        GROUP BY spa.TRANS_DATE, spa.PLANNING_UNIT_ID
        HAVING `CONSUMPTION_QTY` IS NOT NULL
    ) s2 ON ppu.PLANNING_UNIT_ID=s2.PLANNING_UNIT_ID
	WHERE ppu.PROGRAM_ID=@programId 
	GROUP BY ppu.PLANNING_UNIT_ID;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `procurementAgentShipmentReport` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `procurementAgentShipmentReport`(VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_PROCUREMENT_AGENT_ID INT, VAR_PROGRAM_ID INT, VAR_VERSION_ID INT, VAR_PLANNING_UNIT_IDS VARCHAR(200), VAR_INCLUDE_PLANNED_SHIPMENTS TINYINT)
BEGIN
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	-- Report no 13
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
	-- programId must be a single Program cannot be muti-program select or -1 for all programs
    -- versionId must be the actual version that you want to refer to for this report or -1 in which case it will automatically take the latest version (not approved or final just latest)
    -- procurementAgentId can be a particular procurementAgentId or -1 for all
    -- report will be run using startDate and stopDate based on Delivered Date or Expected Delivery Date
    -- planningUnitIds is provided as a list of planningUnitId's or empty for all
    -- includePlannedShipments = 1 means the report will include all shipments that are Active and not Cancelled
    -- includePlannedShipments = 0 means only Approve, Shipped, Arrived, Delivered statuses will be included in the report
    -- FreightCost and ProductCost are converted to USD
    -- FreightPerc is in SUM(FREIGHT_COST)/SUM(PRODUCT_COST) for that ProcurementAgent and that PlanningUnit
    
    SET @programId = VAR_PROGRAM_ID;
	SET @versionId = VAR_VERSION_ID;
    IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) INTO @versionId FROM rm_program_version pv WHERE pv.PROGRAM_ID=@programId;
	END IF;
	SET @startDate = CONCAT(VAR_START_DATE,' 00:00:00');
	SET @stopDate = CONCAT(VAR_STOP_DATE, ' 23:59:59');
	SET @procurementAgentId = VAR_PROCUREMENT_AGENT_ID;
	SET @includePlannedShipments = VAR_INCLUDE_PLANNED_SHIPMENTS;

	SET @sqlString = "";
    SET @sqlString = CONCAT(@sqlString,"SELECT ");
	SET @sqlString = CONCAT(@sqlString,"	pa.PROCUREMENT_AGENT_ID, pa.PROCUREMENT_AGENT_CODE, pa.LABEL_ID `PROCUREMENT_AGENT_LABEL_ID`, pa.LABEL_EN `PROCUREMENT_AGENT_LABEL_EN`, pa.LABEL_FR `PROCUREMENT_AGENT_LABEL_FR`, pa.LABEL_SP `PROCUREMENT_AGENT_LABEL_SP`, pa.LABEL_PR `PROCUREMENT_AGENT_LABEL_PR`, ");
	SET @sqlString = CONCAT(@sqlString,"	pu.PLANNING_UNIT_ID, pu.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pu.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pu.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pu.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pu.LABEL_PR `PLANNING_UNIT_LABEL_PR`, ");
	SET @sqlString = CONCAT(@sqlString,"	SUM(st.SHIPMENT_QTY) QTY, SUM(st.PRODUCT_COST*s.CONVERSION_RATE_TO_USD) `PRODUCT_COST`, SUM(st.FREIGHT_COST*s.CONVERSION_RATE_TO_USD) `FREIGHT_COST`, SUM(st.FREIGHT_COST*s.CONVERSION_RATE_TO_USD)/SUM(st.PRODUCT_COST*s.CONVERSION_RATE_TO_USD)*100 `FREIGHT_PERC` ");
	SET @sqlString = CONCAT(@sqlString,"FROM ");
	SET @sqlString = CONCAT(@sqlString,"	(");
	SET @sqlString = CONCAT(@sqlString,"	SELECT ");
	SET @sqlString = CONCAT(@sqlString,"		s.PROGRAM_ID, s.SHIPMENT_ID, s.CONVERSION_RATE_TO_USD, MAX(st.VERSION_ID) MAX_VERSION_ID ");
	SET @sqlString = CONCAT(@sqlString,"	FROM rm_shipment s ");
	SET @sqlString = CONCAT(@sqlString,"	LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID ");
	SET @sqlString = CONCAT(@sqlString,"	WHERE ");
	SET @sqlString = CONCAT(@sqlString,"		s.PROGRAM_ID=@programId ");
	SET @sqlString = CONCAT(@sqlString,"		AND st.VERSION_ID<=@versionId ");
	SET @sqlString = CONCAT(@sqlString,"		AND st.SHIPMENT_TRANS_ID IS NOT NULL ");
	SET @sqlString = CONCAT(@sqlString,"	GROUP BY s.SHIPMENT_ID ");
	SET @sqlString = CONCAT(@sqlString,") AS s ");
	SET @sqlString = CONCAT(@sqlString,"LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND s.MAX_VERSION_ID=st.VERSION_ID ");
	SET @sqlString = CONCAT(@sqlString,"LEFT JOIN vw_procurement_agent pa ON st.PROCUREMENT_AGENT_ID=pa.PROCUREMENT_AGENT_ID ");
	SET @sqlString = CONCAT(@sqlString,"LEFT JOIN vw_planning_unit pu ON st.PLANNING_UNIT_ID = pu.PLANNING_UNIT_ID ");
	SET @sqlString = CONCAT(@sqlString,"WHERE ");
	SET @sqlString = CONCAT(@sqlString,"	st.ACTIVE ");
    SET @sqlString = CONCAT(@sqlString,"	AND st.SHIPMENT_STATUS_ID != 8 ");
	SET @sqlString = CONCAT(@sqlString,"	AND ((@includePlannedShipments=0 && st.SHIPMENT_STATUS_ID in (4,5,6,7)) OR @includePlannedShipments=1) ");
	SET @sqlString = CONCAT(@sqlString,"	AND COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) BETWEEN @startDate AND @stopDate ");
    IF LENGTH(VAR_PLANNING_UNIT_IDS)>0 THEN 
		SET @sqlString = CONCAT(@sqlString,"	AND (st.PLANNING_UNIT_ID IN (",VAR_PLANNING_UNIT_IDS,")) ");
	END IF;
	SET @sqlString = CONCAT(@sqlString,"	AND (st.PROCUREMENT_AGENT_ID = @procurementAgentId OR @procurementAgentId = -1) ");
	SET @sqlString = CONCAT(@sqlString,"GROUP BY st.PROCUREMENT_AGENT_ID, st.PLANNING_UNIT_ID");
    
    PREPARE s1 FROM @sqlString;
    EXECUTE s1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `programLeadTimes` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `programLeadTimes`(VAR_PROGRAM_ID INT(10), VAR_PROCUREMENT_AGENT_IDS VARCHAR(255), VAR_PLANNING_UNIT_IDS VARCHAR(255))
BEGIN
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	-- Report no 14
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
    -- VAR_PROGRAM_ID is the program that you want to run the report for
    -- VAR_PROCUREMENT_AGENT_IDS is the list of Procurement Agents you want to include in the report
    -- VAR_PLANNING_UNIT_IDS is the list of Planning Units that you want to see the report for
    SET @programId = VAR_PROGRAM_ID;

	SET @sqlString = "";
    SET @sqlString = CONCAT(@sqlString, "SELECT * FROM (SELECT ");
	SET @sqlString = CONCAT(@sqlString, "	rc.REALM_COUNTRY_ID, c.COUNTRY_CODE, c.COUNTRY_CODE2, c.LABEL_ID `COUNTRY_LABEL_ID`, c.LABEL_EN `COUNTRY_LABEL_EN`, c.LABEL_FR `COUNTRY_LABEL_FR`, c.LABEL_SP `COUNTRY_LABEL_SP`, c.LABEL_PR `COUNTRY_LABEL_PR`, "); 
    SET @sqlString = CONCAT(@sqlString, "   p.PROGRAM_ID, p.PROGRAM_CODE, p.LABEL_ID `PROGRAM_LABEL_ID`, p.LABEL_EN `PROGRAM_LABEL_EN`, p.LABEL_FR `PROGRAM_LABEL_FR`, p.LABEL_SP `PROGRAM_LABEL_SP`, p.LABEL_PR `PROGRAM_LABEL_PR`, "); 
	SET @sqlString = CONCAT(@sqlString, "	pu.PLANNING_UNIT_ID, pu.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pu.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pu.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pu.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pu.LABEL_PR `PLANNING_UNIT_LABEL_PR`, "); 
	SET @sqlString = CONCAT(@sqlString, "	pa.PROCUREMENT_AGENT_ID, pa.PROCUREMENT_AGENT_CODE, pa.LABEL_ID `PROCUREMENT_AGENT_LABEL_ID`, pa.LABEL_EN `PROCUREMENT_AGENT_LABEL_EN`, pa.LABEL_FR `PROCUREMENT_AGENT_LABEL_FR`, pa.LABEL_SP `PROCUREMENT_AGENT_LABEL_SP`, pa.LABEL_PR `PROCUREMENT_AGENT_LABEL_PR`, ");
	SET @sqlString = CONCAT(@sqlString, "	p.PLANNED_TO_SUBMITTED_LEAD_TIME, p.SUBMITTED_TO_APPROVED_LEAD_TIME, p.APPROVED_TO_SHIPPED_LEAD_TIME,  ");
	SET @sqlString = CONCAT(@sqlString, "	p.SHIPPED_TO_ARRIVED_BY_AIR_LEAD_TIME, p.SHIPPED_TO_ARRIVED_BY_SEA_LEAD_TIME, p.ARRIVED_TO_DELIVERED_LEAD_TIME, ppu.LOCAL_PROCUREMENT_LEAD_TIME ");
	SET @sqlString = CONCAT(@sqlString, "FROM vw_program p ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_realm_country rc ON p.REALM_COUNTRY_ID=rc.REALM_COUNTRY_ID ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_country c ON rc.COUNTRY_ID=c.COUNTRY_ID ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_program_planning_unit ppu ON p.PROGRAM_ID=ppu.PROGRAM_ID ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_planning_unit pu ON ppu.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_procurement_agent pa ON FALSE ");
    SET @sqlString = CONCAT(@sqlString, "WHERE p.PROGRAM_ID=@programId AND ppu.ACTIVE AND pu.ACTIVE ");
    IF LENGTH(VAR_PLANNING_UNIT_IDS)>0 THEN
		SET @sqlString = CONCAT(@sqlString, "AND ppu.PLANNING_UNIT_ID IN (" , VAR_PLANNING_UNIT_IDS , ") ");
	END IF;
    SET @sqlString = CONCAT(@sqlString, "UNION  ");
	SET @sqlString = CONCAT(@sqlString, "SELECT  ");
	SET @sqlString = CONCAT(@sqlString, "	rc.REALM_COUNTRY_ID, c.COUNTRY_CODE, c.COUNTRY_CODE2, c.LABEL_ID `COUNTRY_LABEL_ID`, c.LABEL_EN `COUNTRY_LABEL_EN`, c.LABEL_FR `COUNTRY_LABEL_FR`, c.LABEL_SP `COUNTRY_LABEL_SP`, c.LABEL_PR `COUNTRY_LABEL_PR`, ");
    SET @sqlString = CONCAT(@sqlString, "	p.PROGRAM_ID, p.PROGRAM_CODE, p.LABEL_ID `PROGRAM_LABEL_ID`, p.LABEL_EN `PROGRAM_LABEL_EN`, p.LABEL_FR `PROGRAM_LABEL_FR`, p.LABEL_SP `PROGRAM_LABEL_SP`, p.LABEL_PR `PROGRAM_LABEL_PR`, ");
	SET @sqlString = CONCAT(@sqlString, "	pu.PLANNING_UNIT_ID, pu.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pu.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pu.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pu.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pu.LABEL_PR `PLANNING_UNIT_LABEL_PR`, ");
	SET @sqlString = CONCAT(@sqlString, "	pa.PROCUREMENT_AGENT_ID, pa.PROCUREMENT_AGENT_CODE, pa.LABEL_ID `PROCUREMENT_AGENT_LABEL_ID`, pa.LABEL_EN `PROCUREMENT_AGENT_LABEL_EN`, pa.LABEL_FR `PROCUREMENT_AGENT_LABEL_FR`, pa.LABEL_SP `PROCUREMENT_AGENT_LABEL_SP`, pa.LABEL_PR `PROCUREMENT_AGENT_LABEL_PR`, ");
	SET @sqlString = CONCAT(@sqlString, "	p.PLANNED_TO_SUBMITTED_LEAD_TIME, pa.SUBMITTED_TO_APPROVED_LEAD_TIME, pa.APPROVED_TO_SHIPPED_LEAD_TIME, ");
	SET @sqlString = CONCAT(@sqlString, "	p.SHIPPED_TO_ARRIVED_BY_AIR_LEAD_TIME, p.SHIPPED_TO_ARRIVED_BY_SEA_LEAD_TIME, p.ARRIVED_TO_DELIVERED_LEAD_TIME, ppu.LOCAL_PROCUREMENT_LEAD_TIME ");
	SET @sqlString = CONCAT(@sqlString, "FROM vw_program p ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_realm_country rc ON p.REALM_COUNTRY_ID=rc.REALM_COUNTRY_ID ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_country c ON rc.COUNTRY_ID=c.COUNTRY_ID ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_program_planning_unit ppu ON p.PROGRAM_ID=ppu.PROGRAM_ID ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_planning_unit pu ON ppu.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_procurement_agent pa ON pa.ACTIVE AND pa.LOCAL_PROCUREMENT_AGENT != 1 ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_procurement_agent_planning_unit papu ON pa.PROCUREMENT_AGENT_ID = papu.PROCUREMENT_AGENT_ID AND pu.PLANNING_UNIT_ID=papu.PLANNING_UNIT_ID ");
	SET @sqlString = CONCAT(@sqlString, "WHERE p.PROGRAM_ID=@programId AND ppu.ACTIVE AND pu.ACTIVE AND papu.PROCUREMENT_AGENT_PLANNING_UNIT_ID IS NOT NULL AND papu.ACTIVE ");
    IF LENGTH(VAR_PLANNING_UNIT_IDS)>0 THEN
		SET @sqlString = CONCAT(@sqlString, "AND ppu.PLANNING_UNIT_ID IN (" , VAR_PLANNING_UNIT_IDS , ") ");
	END IF;
    IF LENGTH(VAR_PROCUREMENT_AGENT_IDS)>0 THEN
		SET @sqlString = CONCAT(@sqlString, "AND pa.PROCUREMENT_AGENT_ID IN (" , VAR_PROCUREMENT_AGENT_IDS , ") ");
	END IF;
    SET @sqlString = CONCAT(@sqlString, ") p1 ORDER BY p1.PROGRAM_ID, p1.PLANNING_UNIT_ID, IFNULL(p1.PROCUREMENT_AGENT_ID,0) ");
    PREPARE S1 FROM @sqlString;
    EXECUTE S1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `programProductCatalog` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `programProductCatalog`(VAR_PROGRAM_ID INT(10), VAR_PRODUCT_CATEGORY_ID INT, VAR_TRACER_CATEGORY_ID INT)
BEGIN
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	-- Report no 1
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
	-- Program Id must be a valid Program Id, cannot be -1 (Any)
    -- Return the list of Program-Planning Units and their corresponding fields
    -- TracerCategory and ProductCategory are used as Filters for the report and can be = -1 which means Any

	SET @programId = VAR_PROGRAM_ID;
    SET @productCategoryId = VAR_PRODUCT_CATEGORY_ID;
    SET @tracerCategoryId = VAR_TRACER_CATEGORY_ID;
    SET @pcSortOrder = '';
    IF @productCategoryId != -1 THEN
        SELECT pc.SORT_ORDER INTO @pcSortOrder FROM rm_product_category pc WHERE pc.PRODUCT_CATEGORY_ID=@productCategoryId;
    END IF;
	
    SELECT 
		p.PROGRAM_ID, p.PROGRAM_CODE, p.LABEL_ID `PROGRAM_LABEL_ID`, p.LABEL_EN `PROGRAM_LABEL_EN`, p.LABEL_FR `PROGRAM_LABEL_FR`, p.LABEL_SP `PROGRAM_LABEL_SP`, p.LABEL_PR `PROGRAM_LABEL_PR`, 
		pc.PRODUCT_CATEGORY_ID, pc.LABEL_ID `PRODUCT_CATEGORY_LABEL_ID`, pc.LABEL_EN `PRODUCT_CATEGORY_LABEL_EN`, pc.LABEL_Fr `PRODUCT_CATEGORY_LABEL_FR`, pc.LABEL_SP `PRODUCT_CATEGORY_LABEL_SP`, pc.LABEL_PR `PRODUCT_CATEGORY_LABEL_PR`,
		tc.TRACER_CATEGORY_ID, tc.LABEL_ID `TRACER_CATEGORY_LABEL_ID`, tc.LABEL_EN `TRACER_CATEGORY_LABEL_EN`, tc.LABEL_FR `TRACER_CATEGORY_LABEL_FR`, tc.LABEL_SP `TRACER_CATEGORY_LABEL_SP`, tc.LABEL_PR `TRACER_CATEGORY_LABEL_PR`,
		fu.FORECASTING_UNIT_ID, fu.LABEL_ID `FORECASTING_UNIT_LABEL_ID`, fu.LABEL_EN `FORECASTING_UNIT_LABEL_EN`, fu.LABEL_FR `FORECASTING_UNIT_LABEL_FR`, fu.LABEL_SP `FORECASTING_UNIT_LABEL_SP`, fu.LABEL_PR `FORECASTING_UNIT_LABEL_PR`, 
		fu.GENERIC_LABEL_ID `GENERIC_LABEL_ID`, ful.LABEL_EN `GENERIC_LABEL_EN`, ful.LABEL_FR `GENERIC_LABEL_FR`, ful.LABEL_SP `GENERIC_LABEL_SP`, ful.LABEL_PR `GENERIC_LABEL_PR`,
		fuu.UNIT_ID `FUNIT_ID`, fuu.UNIT_CODE `FUNIT_CODE`, fuu.LABEL_ID `FUNIT_LABEL_ID`, fuu.LABEL_EN `FUNIT_LABEL_EN`, fuu.LABEL_FR `FUNIT_LABEL_FR`, fuu.LABEL_SP `FUNIT_LABEL_SP`, fuu.LABEL_PR `FUNIT_LABEL_PR`,
		pu.PLANNING_UNIT_ID, pu.MULTIPLIER `FORECASTING_TO_PLANNING_UNIT_MULTIPLIER`, pu.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pu.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pu.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pu.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pu.LABEL_PR `PLANNING_UNIT_LABEL_PR`,
		puu.UNIT_ID `PUNIT_ID`, puu.UNIT_CODE `PUNIT_CODE`, puu.LABEL_ID `PUNIT_LABEL_ID`, puu.LABEL_EN `PUNIT_LABEL_EN`, puu.LABEL_FR `PUNIT_LABEL_FR`, puu.LABEL_SP `PUNIT_LABEL_SP`, puu.LABEL_PR `PUNIT_LABEL_PR`,
		ppu.MIN_MONTHS_OF_STOCK, ppu.REORDER_FREQUENCY_IN_MONTHS, ppu.CATALOG_PRICE, ppu.SHELF_LIFE, IF(ppu.ACTIVE AND pu.ACTIVE, TRUE, FALSE) `ACTIVE`
	FROM rm_program_planning_unit ppu 
	LEFT JOIN vw_program p ON ppu.PROGRAM_ID=p.PROGRAM_ID
	LEFT JOIN vw_planning_unit pu ON ppu.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID
	LEFT JOIN vw_forecasting_unit fu ON pu.FORECASTING_UNIT_ID=fu.FORECASTING_UNIT_ID
	LEFT JOIN vw_unit fuu ON fu.UNIT_ID=fuu.UNIT_ID
	LEFT JOIN ap_label ful ON fu.GENERIC_LABEL_ID=ful.LABEL_ID
	LEFT JOIN vw_tracer_category tc ON fu.TRACER_CATEGORY_ID=tc.TRACER_CATEGORY_ID
	LEFT JOIN vw_product_category pc ON fu.PRODUCT_CATEGORY_ID=pc.PRODUCT_CATEGORY_ID
	LEFT JOIN vw_unit puu ON pu.UNIT_ID=puu.UNIT_ID
	WHERE 
		ppu.PROGRAM_ID=@programId
		AND (pc.SORT_ORDER LIKE  CONCAT(@pcSortOrder,'%'))
		AND (tc.TRACER_CATEGORY_ID = @tracerCategoryId OR @tracerCategoryId=-1);

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `shipmentDetails` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `shipmentDetails`(VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_PROGRAM_ID INT(10), VAR_VERSION_ID INT, VAR_PLANNING_UNIT_IDS VARCHAR(255))
BEGIN

	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    -- Report no 19
    -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
    -- Only Month and Year will be considered for StartDate and StopDate
    -- Only a single ProgramId can be selected
    -- VersionId can be a valid Version Id for the Program or -1 for last submitted VersionId
    -- PlanningUnitIds is the list of Planning Units you want to run the report for. 
    -- Empty PlanningUnitIds means you want to run the report for all the Planning Units in that Program

	SET @startDate = VAR_START_DATE;
	SET @stopDate = VAR_STOP_DATE;
	SET @programId = VAR_PROGRAM_ID;
	SET @versionId = VAR_VERSION_ID;
    
    IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) INTO @versionId FROM rm_program_version pv WHERE pv.PROGRAM_ID=@programId;
	END IF;
    
	SET @sqlString = "";
    SET @sqlString = CONCAT(@sqlString, "SELECT ");
	SET @sqlString = CONCAT(@sqlString, "	pu.PLANNING_UNIT_ID, pu.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pu.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pu.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pu.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pu.LABEL_PR `PLANNING_UNIT_LABEL_PR`, ");
	SET @sqlString = CONCAT(@sqlString, "	fu.FORECASTING_UNIT_ID, fu.LABEL_ID `FORECASTING_UNIT_LABEL_ID`, fu.LABEL_EN `FORECASTING_UNIT_LABEL_EN`, fu.LABEL_FR `FORECASTING_UNIT_LABEL_FR`, fu.LABEL_SP `FORECASTING_UNIT_LABEL_SP`, fu.LABEL_PR `FORECASTING_UNIT_LABEL_PR`, ");
	SET @sqlString = CONCAT(@sqlString, "	pu.MULTIPLIER, ");
	SET @sqlString = CONCAT(@sqlString, "	s.SHIPMENT_ID, ");
	SET @sqlString = CONCAT(@sqlString, "	pa.PROCUREMENT_AGENT_ID, pa.PROCUREMENT_AGENT_CODE, pa.LABEL_ID `PROCUREMENT_AGENT_LABEL_ID`, pa.LABEL_EN `PROCUREMENT_AGENT_LABEL_EN`, pa.LABEL_FR `PROCUREMENT_AGENT_LABEL_FR`, pa.LABEL_SP `PROCUREMENT_AGENT_LABEL_SP`, pa.LABEL_PR `PROCUREMENT_AGENT_LABEL_PR`, ");
	SET @sqlString = CONCAT(@sqlString, "	fs.FUNDING_SOURCE_ID, fs.FUNDING_SOURCE_CODE, fs.LABEL_ID `FUNDING_SOURCE_LABEL_ID`, fs.LABEL_EN `FUNDING_SOURCE_LABEL_EN`, fs.LABEL_FR `FUNDING_SOURCE_LABEL_FR`, fs.LABEL_SP `FUNDING_SOURCE_LABEL_SP`, fs.LABEL_PR `FUNDING_SOURCE_LABEL_PR`, ");
	SET @sqlString = CONCAT(@sqlString, "	ss.SHIPMENT_STATUS_ID, ss.LABEL_ID `SHIPMENT_STATUS_LABEL_ID`, ss.LABEL_EN `SHIPMENT_STATUS_LABEL_EN`, ss.LABEL_FR `SHIPMENT_STATUS_LABEL_FR`, ss.LABEL_SP `SHIPMENT_STATUS_LABEL_SP`, ss.LABEL_PR `SHIPMENT_STATUS_LABEL_PR`, ");
	SET @sqlString = CONCAT(@sqlString, "	st.SHIPMENT_QTY, ");
	SET @sqlString = CONCAT(@sqlString, "	COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) `EDD`, ");
	SET @sqlString = CONCAT(@sqlString, "	(IFNULL(st.PRODUCT_COST,0) * s.CONVERSION_RATE_TO_USD) `PRODUCT_COST`, ");
	SET @sqlString = CONCAT(@sqlString, "	(IFNULL(st.FREIGHT_COST,0) * s.CONVERSION_RATE_TO_USD) `FREIGHT_COST`, ");
	SET @sqlString = CONCAT(@sqlString, "	(IFNULL(st.PRODUCT_COST,0) * s.CONVERSION_RATE_TO_USD + IFNULL(st.FREIGHT_COST,0) * s.CONVERSION_RATE_TO_USD) `TOTAL_COST`, ");
	SET @sqlString = CONCAT(@sqlString, "	st.NOTES ");
	SET @sqlString = CONCAT(@sqlString, "FROM ");
	SET @sqlString = CONCAT(@sqlString, "	( ");
	SET @sqlString = CONCAT(@sqlString, "	SELECT ");
	SET @sqlString = CONCAT(@sqlString, "		s.SHIPMENT_ID, MAX(st.VERSION_ID) MAX_VERSION_ID, s.CONVERSION_RATE_TO_USD ");
	SET @sqlString = CONCAT(@sqlString, "	FROM rm_shipment s ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID ");
	SET @sqlString = CONCAT(@sqlString, "	WHERE ");
	SET @sqlString = CONCAT(@sqlString, "		s.PROGRAM_ID=@programId ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.VERSION_ID<=@versionId ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.SHIPMENT_TRANS_ID IS NOT NULL ");
	SET @sqlString = CONCAT(@sqlString, "	GROUP BY s.SHIPMENT_ID ");
	SET @sqlString = CONCAT(@sqlString, ") AS s ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND s.MAX_VERSION_ID=st.VERSION_ID ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_shipment_status ss on st.SHIPMENT_STATUS_ID=ss.SHIPMENT_STATUS_ID ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_procurement_agent pa on st.PROCUREMENT_AGENT_ID=pa.PROCUREMENT_AGENT_ID ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_funding_source fs ON st.FUNDING_SOURCE_ID=fs.FUNDING_SOURCE_ID ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_planning_unit pu ON st.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_forecasting_unit fu ON pu.FORECASTING_UNIT_ID=fu.FORECASTING_UNIT_ID ");
	SET @sqlString = CONCAT(@sqlString, "WHERE ");
	SET @sqlString = CONCAT(@sqlString, "	st.ACTIVE ");
	SET @sqlString = CONCAT(@sqlString, "	AND COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) BETWEEN @startDate AND @stopDate ");
	IF LENGTH(VAR_PLANNING_UNIT_IDS) > 0 THEN
		SET @sqlString = CONCAT(@sqlString, "	AND (st.PLANNING_UNIT_ID in (",VAR_PLANNING_UNIT_IDS,")) ");
    END IF;
-- 	SET @sqlString = CONCAT(@sqlString, "GROUP BY st.PLANNING_UNIT_ID, COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE)");
    
    PREPARE S1 FROM @sqlString;
    EXECUTE S1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `shipmentDetailsFundingSource` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `shipmentDetailsFundingSource`(VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_PROGRAM_ID INT(10), VAR_VERSION_ID INT, VAR_PLANNING_UNIT_IDS VARCHAR(255), VAR_REPORT_VIEW INT(10))
BEGIN

	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    -- Report no 19 b
    -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
    -- Only Month and Year will be considered for StartDate and StopDate
    -- Only a single ProgramId can be selected
    -- VersionId can be a valid Version Id for the Program or -1 for last submitted VersionId
    -- PlanningUnitIds is the list of Planning Units you want to run the report for. 
    -- Empty PlanningUnitIds means you want to run the report for all the Planning Units in that Program

	SET @startDate = VAR_START_DATE;
	SET @stopDate = VAR_STOP_DATE;
	SET @programId = VAR_PROGRAM_ID;
	SET @versionId = VAR_VERSION_ID;
    SET @reportView = VAR_REPORT_VIEW;
    
    IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) INTO @versionId FROM rm_program_version pv WHERE pv.PROGRAM_ID=@programId;
	END IF;
    
	SET @sqlString = "";
    SET @sqlString = CONCAT(@sqlString, "SELECT ");
	SET @sqlString = CONCAT(@sqlString, "	fs.FUNDING_SOURCE_ID, fs.FUNDING_SOURCE_CODE, fs.LABEL_ID `FUNDING_SOURCE_LABEL_ID`, fs.LABEL_EN `FUNDING_SOURCE_LABEL_EN`, fs.LABEL_FR `FUNDING_SOURCE_LABEL_FR`, fs.LABEL_SP `FUNDING_SOURCE_LABEL_SP`, fs.LABEL_PR `FUNDING_SOURCE_LABEL_PR`, ");
	SET @sqlString = CONCAT(@sqlString, "	COUNT(st.SHIPMENT_ID) `ORDER_COUNT`, ");
    SET @sqlString = CONCAT(@sqlString, "	IF(@reportView=1, SUM(st.SHIPMENT_QTY), SUM(st.SHIPMENT_QTY*pu.MULTIPLIER)) `QUANTITY`, ");
    SET @sqlString = CONCAT(@sqlString, "	SUM((IFNULL(st.PRODUCT_COST,0) + IFNULL(st.FREIGHT_COST,0)) * s.CONVERSION_RATE_TO_USD) `COST` ");
	SET @sqlString = CONCAT(@sqlString, "FROM ");
	SET @sqlString = CONCAT(@sqlString, "	( ");
	SET @sqlString = CONCAT(@sqlString, "	SELECT ");
	SET @sqlString = CONCAT(@sqlString, "		s.SHIPMENT_ID, MAX(st.VERSION_ID) MAX_VERSION_ID, s.CONVERSION_RATE_TO_USD ");
	SET @sqlString = CONCAT(@sqlString, "	FROM rm_shipment s ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID ");
	SET @sqlString = CONCAT(@sqlString, "	WHERE ");
	SET @sqlString = CONCAT(@sqlString, "		s.PROGRAM_ID=@programId ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.VERSION_ID<=@versionId ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.SHIPMENT_TRANS_ID IS NOT NULL ");
	SET @sqlString = CONCAT(@sqlString, "	GROUP BY s.SHIPMENT_ID ");
	SET @sqlString = CONCAT(@sqlString, ") AS s ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND s.MAX_VERSION_ID=st.VERSION_ID ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_shipment_status ss on st.SHIPMENT_STATUS_ID=ss.SHIPMENT_STATUS_ID ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_funding_source fs ON st.FUNDING_SOURCE_ID=fs.FUNDING_SOURCE_ID ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_planning_unit pu ON st.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID ");
	SET @sqlString = CONCAT(@sqlString, "WHERE ");
	SET @sqlString = CONCAT(@sqlString, "	st.ACTIVE ");
	SET @sqlString = CONCAT(@sqlString, "	AND st.SHIPMENT_STATUS_ID!=8 ");
	SET @sqlString = CONCAT(@sqlString, "	AND COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) BETWEEN @startDate AND @stopDate ");
	IF LENGTH(VAR_PLANNING_UNIT_IDS) > 0 THEN
		SET @sqlString = CONCAT(@sqlString, "	AND (st.PLANNING_UNIT_ID in (",VAR_PLANNING_UNIT_IDS,")) ");
    END IF;
    SET @sqlString = CONCAT(@sqlString, " GROUP BY st.FUNDING_SOURCE_ID");
    PREPARE S1 FROM @sqlString;
    EXECUTE S1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `shipmentDetailsMonth` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `shipmentDetailsMonth`(VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_PROGRAM_ID INT(10), VAR_VERSION_ID INT, VAR_PLANNING_UNIT_IDS VARCHAR(255))
BEGIN

	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    -- Report no 19 c
    -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
    -- Only Month and Year will be considered for StartDate and StopDate
    -- Only a single ProgramId can be selected
    -- VersionId can be a valid Version Id for the Program or -1 for last submitted VersionId
    -- PlanningUnitIds is the list of Planning Units you want to run the report for. 
    -- Empty PlanningUnitIds means you want to run the report for all the Planning Units in that Program

	SET @startDate = VAR_START_DATE;
	SET @stopDate = VAR_STOP_DATE;
	SET @programId = VAR_PROGRAM_ID;
	SET @versionId = VAR_VERSION_ID;
    
    IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) INTO @versionId FROM rm_program_version pv WHERE pv.PROGRAM_ID=@programId;
	END IF;
    
    SET @sqlString = "";
    SET @sqlString = CONCAT(@sqlString, "SELECT ");
    SET @sqlString = CONCAT(@sqlString, "   mn.MONTH, ");
    SET @sqlString = CONCAT(@sqlString, "   SUM(IFNULL(s1.`PLANNED_COST`,0)) `PLANNED_COST`, ");
    SET @sqlString = CONCAT(@sqlString, "   SUM(IFNULL(s1.`SUBMITTED_COST`,0)) `SUBMITTED_COST`, ");
    SET @sqlString = CONCAT(@sqlString, "   SUM(IFNULL(s1.`APPROVED_COST`,0)) `APPROVED_COST`, ");
    SET @sqlString = CONCAT(@sqlString, "   SUM(IFNULL(s1.`SHIPPED_COST`,0)) `SHIPPED_COST`, ");
    SET @sqlString = CONCAT(@sqlString, "   SUM(IFNULL(s1.`ARRIVED_COST`,0)) `ARRIVED_COST`, ");
    SET @sqlString = CONCAT(@sqlString, "   SUM(IFNULL(s1.`RECEIVED_COST`,0)) `RECEIVED_COST`, ");
    SET @sqlString = CONCAT(@sqlString, "   SUM(IFNULL(s1.`ONHOLD_COST`,0)) `ONHOLD_COST` ");
    SET @sqlString = CONCAT(@sqlString, "FROM mn ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN ");
    SET @sqlString = CONCAT(@sqlString, "   ( ");
    SET @sqlString = CONCAT(@sqlString, "   SELECT ");
    SET @sqlString = CONCAT(@sqlString, "       CONCAT(LEFT(COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE),7),'-01') `DT`, ");
    SET @sqlString = CONCAT(@sqlString, "       IF(st.SHIPMENT_STATUS_ID=1, (IFNULL(st.PRODUCT_COST,0) + IFNULL(st.FREIGHT_COST,0)) * s.CONVERSION_RATE_TO_USD, 0) `PLANNED_COST`, ");
    SET @sqlString = CONCAT(@sqlString, "       IF(st.SHIPMENT_STATUS_ID=3, (IFNULL(st.PRODUCT_COST,0) + IFNULL(st.FREIGHT_COST,0)) * s.CONVERSION_RATE_TO_USD, 0) `SUBMITTED_COST`, ");
    SET @sqlString = CONCAT(@sqlString, "       IF(st.SHIPMENT_STATUS_ID=4, (IFNULL(st.PRODUCT_COST,0) + IFNULL(st.FREIGHT_COST,0)) * s.CONVERSION_RATE_TO_USD, 0) `APPROVED_COST`, ");
    SET @sqlString = CONCAT(@sqlString, "       IF(st.SHIPMENT_STATUS_ID=5, (IFNULL(st.PRODUCT_COST,0) + IFNULL(st.FREIGHT_COST,0)) * s.CONVERSION_RATE_TO_USD, 0) `SHIPPED_COST`, ");
    SET @sqlString = CONCAT(@sqlString, "       IF(st.SHIPMENT_STATUS_ID=6, (IFNULL(st.PRODUCT_COST,0) + IFNULL(st.FREIGHT_COST,0)) * s.CONVERSION_RATE_TO_USD, 0) `ARRIVED_COST`, ");
    SET @sqlString = CONCAT(@sqlString, "       IF(st.SHIPMENT_STATUS_ID=7, (IFNULL(st.PRODUCT_COST,0) + IFNULL(st.FREIGHT_COST,0)) * s.CONVERSION_RATE_TO_USD, 0) `RECEIVED_COST`, ");
    SET @sqlString = CONCAT(@sqlString, "       IF(st.SHIPMENT_STATUS_ID=8, (IFNULL(st.PRODUCT_COST,0) + IFNULL(st.FREIGHT_COST,0)) * s.CONVERSION_RATE_TO_USD, 0) `ONHOLD_COST` ");
    SET @sqlString = CONCAT(@sqlString, "    FROM ");
    SET @sqlString = CONCAT(@sqlString, "        ( ");
    SET @sqlString = CONCAT(@sqlString, "        SELECT ");
    SET @sqlString = CONCAT(@sqlString, "            s.SHIPMENT_ID, MAX(st.VERSION_ID) MAX_VERSION_ID, s.CONVERSION_RATE_TO_USD ");
    SET @sqlString = CONCAT(@sqlString, "        FROM rm_shipment s ");
    SET @sqlString = CONCAT(@sqlString, "        LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID ");
    SET @sqlString = CONCAT(@sqlString, "        WHERE ");
    SET @sqlString = CONCAT(@sqlString, "            s.PROGRAM_ID=@programId ");
    SET @sqlString = CONCAT(@sqlString, "            AND st.VERSION_ID<=@versionId ");
    SET @sqlString = CONCAT(@sqlString, "            AND st.SHIPMENT_TRANS_ID IS NOT NULL ");
    SET @sqlString = CONCAT(@sqlString, "        GROUP BY s.SHIPMENT_ID ");
    SET @sqlString = CONCAT(@sqlString, "    ) AS s ");
    SET @sqlString = CONCAT(@sqlString, "    LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND s.MAX_VERSION_ID=st.VERSION_ID ");
    SET @sqlString = CONCAT(@sqlString, "    LEFT JOIN vw_shipment_status ss on st.SHIPMENT_STATUS_ID=ss.SHIPMENT_STATUS_ID ");
    SET @sqlString = CONCAT(@sqlString, "    LEFT JOIN vw_funding_source fs ON st.FUNDING_SOURCE_ID=fs.FUNDING_SOURCE_ID ");
    SET @sqlString = CONCAT(@sqlString, "    LEFT JOIN vw_planning_unit pu ON st.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID ");
    SET @sqlString = CONCAT(@sqlString, "    WHERE ");
    SET @sqlString = CONCAT(@sqlString, "        st.ACTIVE ");
    SET @sqlString = CONCAT(@sqlString, "        AND st.SHIPMENT_STATUS_ID!=8 ");
    IF LENGTH(VAR_PLANNING_UNIT_IDS) > 0 THEN
		SET @sqlString = CONCAT(@sqlString, "	    AND (st.PLANNING_UNIT_ID in (",VAR_PLANNING_UNIT_IDS,")) ");
    END IF;
    SET @sqlString = CONCAT(@sqlString, "        AND COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) BETWEEN @startDate AND @stopDate ");
    SET @sqlString = CONCAT(@sqlString, ") AS s1 ON mn.MONTH =s1.DT ");
    SET @sqlString = CONCAT(@sqlString, "WHERE mn.MONTH BETWEEN @startDate AND @stopDate ");
    SET @sqlString = CONCAT(@sqlString, "GROUP BY mn.MONTH");
    
    PREPARE S1 FROM @sqlString;
    EXECUTE S1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `shipmentGlobalDemand_CountryShipmentSplit` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `shipmentGlobalDemand_CountryShipmentSplit`(VAR_REALM_ID INT(10), VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_REALM_COUNTRY_IDS VARCHAR(255), VAR_REPORT_VIEW INT(10), VAR_FUNDING_SOURCE_PROCUREMENT_AGENT_IDS VARCHAR(255), VAR_PLANNING_UNIT_ID INT(10))
BEGIN
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    -- Report no 21 Part 4
    -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	SET @realmId = VAR_REALM_ID;
	SET @startDate = VAR_START_DATE;
	SET @stopDate = VAR_STOP_DATE;
	SET @reportView = VAR_REPORT_VIEW;
	SET @planningUnitId = VAR_PLANNING_UNIT_ID;
    SET @sqlStringFSPA = "";
    
	SET @sqlString = "";
    SET @sqlString = CONCAT(@sqlString, "SELECT ");
	SET @sqlString = CONCAT(@sqlString, "	rc.REALM_COUNTRY_ID, c.COUNTRY_CODE, c.LABEL_ID `COUNTRY_LABEL_ID`, c.LABEL_EN `COUNTRY_LABEL_EN`, c.LABEL_FR `COUNTRY_LABEL_FR`, c.LABEL_SP `COUNTRY_LABEL_SP`, c.LABEL_PR `COUNTRY_LABEL_PR`, ");
 	SET @sqlString = CONCAT(@sqlString, "	SUM(IF(s1.SHIPMENT_STATUS_ID IN (1,2,3,9), s1.AMOUNT, 0)) `PLANNED_SHIPMENT_AMT`, SUM(IF(s1.SHIPMENT_STATUS_ID IN (4,5,6,7), s1.AMOUNT, 0)) `ORDERED_SHIPMENT_AMT` ");
	SET @sqlString = CONCAT(@sqlString, "FROM ");
	SET @sqlString = CONCAT(@sqlString, "	( ");
	SET @sqlString = CONCAT(@sqlString, "	SELECT s.SHIPMENT_ID, rc.REALM_COUNTRY_ID, st.SHIPMENT_STATUS_ID, IF(@reportView=1, st.FUNDING_SOURCE_ID,st.PROCUREMENT_AGENT_ID) `FUNDING_SOURCE_PROCUREMENT_AGENT_ID`, (IFNULL(st.PRODUCT_COST * s.CONVERSION_RATE_TO_USD,0) + IFNULL(st.FREIGHT_COST * s.CONVERSION_RATE_TO_USD,0)) `AMOUNT` ");
	SET @sqlString = CONCAT(@sqlString, "	FROM rm_program p ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_realm_country rc ON p.REALM_COUNTRY_ID=rc.REALM_COUNTRY_ID ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_shipment s ON p.PROGRAM_ID=s.PROGRAM_ID ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND st.VERSION_ID<=p.CURRENT_VERSION_ID ");
	SET @sqlString = CONCAT(@sqlString, "	WHERE ");
	SET @sqlString = CONCAT(@sqlString, "		rc.REALM_ID=@realmId ");
	SET @sqlString = CONCAT(@sqlString, "		AND s.SHIPMENT_ID IS NOT NULL ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.ACTIVE ");
	SET @sqlString = CONCAT(@sqlString, "		AND COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) BETWEEN @startDate AND @stopDate ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.SHIPMENT_STATUS_ID != 8 ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.PLANNING_UNIT_ID = @planningUnitId ");
    IF LENGTH(VAR_REALM_COUNTRY_IDS) > 0 THEN
		SET @sqlString = CONCAT(@sqlString, "		AND rc.REALM_COUNTRY_ID IN (",VAR_REALM_COUNTRY_IDS,") ");
    END IF;
    IF LENGTH(VAR_FUNDING_SOURCE_PROCUREMENT_AGENT_IDS) > 0 THEN
		IF @reportView = 1 THEN 
			SET @sqlString = CONCAT(@sqlString, "		AND st.FUNDING_SOURCE_ID IN (",VAR_FUNDING_SOURCE_PROCUREMENT_AGENT_IDS,") ");
        ELSE
			SET @sqlString = CONCAT(@sqlString, "		AND st.PROCUREMENT_AGENT_ID IN (",VAR_FUNDING_SOURCE_PROCUREMENT_AGENT_IDS,") ");
        END IF;
    END IF;
	SET @sqlString = CONCAT(@sqlString, "	GROUP BY s.SHIPMENT_ID ");
	SET @sqlString = CONCAT(@sqlString, "	) AS s1 ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_realm_country rc ON s1.REALM_COUNTRY_ID=rc.REALM_COUNTRY_ID ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_country c ON rc.COUNTRY_ID=c.COUNTRY_ID ");
	SET @sqlString = CONCAT(@sqlString, "GROUP BY s1.REALM_COUNTRY_ID");
    
    PREPARE S1 FROM @sqlString;
    EXECUTE S1;
    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `shipmentGlobalDemand_FundingSourceCountrySplit` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `shipmentGlobalDemand_FundingSourceCountrySplit`(VAR_REALM_ID INT(10), VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_REALM_COUNTRY_IDS VARCHAR(255), VAR_REPORT_VIEW INT(10), VAR_FUNDING_SOURCE_PROCUREMENT_AGENT_IDS VARCHAR(255), VAR_PLANNING_UNIT_ID INT(10))
BEGIN
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    -- Report no 21 Part 3 for FundingSource
    -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
	DECLARE finished INTEGER DEFAULT 0;
    DECLARE fspaId INT(10) DEFAULT 0;
    DECLARE fspaCode VARCHAR(10) DEFAULT '';
    DECLARE fspa_cursor CURSOR FOR SELECT FUNDING_SOURCE_ID, FUNDING_SOURCE_CODE FROM rm_funding_source WHERE REALM_ID=VAR_REALM_ID;
    DECLARE CONTINUE HANDLER 
        FOR NOT FOUND SET finished = 1;
	
	SET @realmId = VAR_REALM_ID;
	SET @startDate = VAR_START_DATE;
	SET @stopDate = VAR_STOP_DATE;
	SET @reportView = VAR_REPORT_VIEW;
	SET @planningUnitId = VAR_PLANNING_UNIT_ID;
    SET @sqlStringFSPA = "";
    
    OPEN fspa_cursor;
    getFSPA: LOOP
		FETCH fspa_cursor into fspaId, fspaCode;
        IF finished = 1 THEN 
			LEAVE getFSPA;
		END IF;
		SET @sqlStringFSPA= CONCAT(@sqlStringFSPA, " ,SUM(IF(s1.FUNDING_SOURCE_PROCUREMENT_AGENT_ID=",fspaId,", s1.AMOUNT, 0)) `FSPA_",fspaCode,"` ");
	END LOOP getFSPA;
    
	SET @sqlString = "";
    SET @sqlString = CONCAT(@sqlString, "SELECT ");
	SET @sqlString = CONCAT(@sqlString, "	rc.REALM_COUNTRY_ID, c.COUNTRY_CODE, c.LABEL_ID `COUNTRY_LABEL_ID`, c.LABEL_EN `COUNTRY_LABEL_EN`, c.LABEL_FR `COUNTRY_LABEL_FR`, c.LABEL_SP `COUNTRY_LABEL_SP`, c.LABEL_PR `COUNTRY_LABEL_PR` ");
 	SET @sqlString = CONCAT(@sqlString, @sqlStringFSPA);
	SET @sqlString = CONCAT(@sqlString, "FROM ");
	SET @sqlString = CONCAT(@sqlString, "	( ");
	SET @sqlString = CONCAT(@sqlString, "	SELECT s.SHIPMENT_ID, rc.REALM_COUNTRY_ID, IF(@reportView=1, st.FUNDING_SOURCE_ID,st.PROCUREMENT_AGENT_ID) `FUNDING_SOURCE_PROCUREMENT_AGENT_ID`, (IFNULL(st.PRODUCT_COST * s.CONVERSION_RATE_TO_USD,0) + IFNULL(st.FREIGHT_COST * s.CONVERSION_RATE_TO_USD,0)) `AMOUNT` ");
	SET @sqlString = CONCAT(@sqlString, "	FROM rm_program p ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_realm_country rc ON p.REALM_COUNTRY_ID=rc.REALM_COUNTRY_ID ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_shipment s ON p.PROGRAM_ID=s.PROGRAM_ID ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND st.VERSION_ID<=p.CURRENT_VERSION_ID ");
	SET @sqlString = CONCAT(@sqlString, "	WHERE ");
	SET @sqlString = CONCAT(@sqlString, "		rc.REALM_ID=@realmId ");
	SET @sqlString = CONCAT(@sqlString, "		AND s.SHIPMENT_ID IS NOT NULL ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.ACTIVE ");
	SET @sqlString = CONCAT(@sqlString, "		AND COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) BETWEEN @startDate AND @stopDate ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.SHIPMENT_STATUS_ID != 8 ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.PLANNING_UNIT_ID = @planningUnitId ");
    IF LENGTH(VAR_REALM_COUNTRY_IDS) > 0 THEN
		SET @sqlString = CONCAT(@sqlString, "		AND rc.REALM_COUNTRY_ID IN (",VAR_REALM_COUNTRY_IDS,") ");
    END IF;
    IF LENGTH(VAR_FUNDING_SOURCE_PROCUREMENT_AGENT_IDS) > 0 THEN
		SET @sqlString = CONCAT(@sqlString, "		AND st.FUNDING_SOURCE_ID IN (",VAR_FUNDING_SOURCE_PROCUREMENT_AGENT_IDS,") ");
    END IF;
	SET @sqlString = CONCAT(@sqlString, "	GROUP BY s.SHIPMENT_ID ");
	SET @sqlString = CONCAT(@sqlString, "	) AS s1 ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_realm_country rc ON s1.REALM_COUNTRY_ID=rc.REALM_COUNTRY_ID ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_country c ON rc.COUNTRY_ID=c.COUNTRY_ID ");
	SET @sqlString = CONCAT(@sqlString, "GROUP BY s1.REALM_COUNTRY_ID");
    
    PREPARE S1 FROM @sqlString;
    EXECUTE S1;
    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `shipmentGlobalDemand_FundingSourceDateSplit` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `shipmentGlobalDemand_FundingSourceDateSplit`(VAR_REALM_ID INT(10), VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_REALM_COUNTRY_IDS VARCHAR(255), VAR_REPORT_VIEW INT(10), VAR_FUNDING_SOURCE_PROCUREMENT_AGENT_IDS VARCHAR(255), VAR_PLANNING_UNIT_ID INT(10))
BEGIN
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    -- Report no 21 Part 2 for FundingSource
    -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
	DECLARE finished INTEGER DEFAULT 0;
    DECLARE fspaId INT(10) DEFAULT 0;
    DECLARE fspaCode VARCHAR(10) DEFAULT '';
    DECLARE fspa_cursor CURSOR FOR SELECT FUNDING_SOURCE_ID, FUNDING_SOURCE_CODE FROM rm_funding_source WHERE REALM_ID=VAR_REALM_ID;
    DECLARE CONTINUE HANDLER 
        FOR NOT FOUND SET finished = 1;
	
	SET @realmId = VAR_REALM_ID;
	SET @startDate = VAR_START_DATE;
	SET @stopDate = VAR_STOP_DATE;
	SET @reportView = VAR_REPORT_VIEW;
	SET @planningUnitId = VAR_PLANNING_UNIT_ID;
    SET @sqlStringFSPA = "";
    
    OPEN fspa_cursor;
    getFSPA: LOOP
		FETCH fspa_cursor into fspaId, fspaCode;
        IF finished = 1 THEN 
			LEAVE getFSPA;
		END IF;
		SET @sqlStringFSPA= CONCAT(@sqlStringFSPA, " ,SUM(IF(s1.FUNDING_SOURCE_PROCUREMENT_AGENT_ID=",fspaId,", s1.AMOUNT, 0)) `FSPA_",fspaCode,"` ");
	END LOOP getFSPA;
    
	SET @sqlString = "";
    SET @sqlString = CONCAT(@sqlString, "SELECT ");
	SET @sqlString = CONCAT(@sqlString, "	CONCAT(LEFT(s1.EDD,7),'-01') `TRANS_DATE` ");
 	SET @sqlString = CONCAT(@sqlString, @sqlStringFSPA);
	SET @sqlString = CONCAT(@sqlString, "FROM ");
	SET @sqlString = CONCAT(@sqlString, "	( ");
	SET @sqlString = CONCAT(@sqlString, "	SELECT s.SHIPMENT_ID, COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) `EDD`, rc.REALM_COUNTRY_ID, IF(@reportView=1, st.FUNDING_SOURCE_ID,st.PROCUREMENT_AGENT_ID) `FUNDING_SOURCE_PROCUREMENT_AGENT_ID`, (IFNULL(st.PRODUCT_COST * s.CONVERSION_RATE_TO_USD,0) + IFNULL(st.FREIGHT_COST * s.CONVERSION_RATE_TO_USD,0)) `AMOUNT` ");
	SET @sqlString = CONCAT(@sqlString, "	FROM rm_program p ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_realm_country rc ON p.REALM_COUNTRY_ID=rc.REALM_COUNTRY_ID ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_shipment s ON p.PROGRAM_ID=s.PROGRAM_ID ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND st.VERSION_ID<=p.CURRENT_VERSION_ID ");
	SET @sqlString = CONCAT(@sqlString, "	WHERE ");
	SET @sqlString = CONCAT(@sqlString, "		rc.REALM_ID=@realmId ");
	SET @sqlString = CONCAT(@sqlString, "		AND s.SHIPMENT_ID IS NOT NULL ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.ACTIVE ");
	SET @sqlString = CONCAT(@sqlString, "		AND COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) BETWEEN @startDate AND @stopDate ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.SHIPMENT_STATUS_ID != 8 ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.PLANNING_UNIT_ID = @planningUnitId ");
    IF LENGTH(VAR_REALM_COUNTRY_IDS) > 0 THEN
		SET @sqlString = CONCAT(@sqlString, "		AND rc.REALM_COUNTRY_ID IN (",VAR_REALM_COUNTRY_IDS,") ");
    END IF;
    IF LENGTH(VAR_FUNDING_SOURCE_PROCUREMENT_AGENT_IDS) > 0 THEN
		SET @sqlString = CONCAT(@sqlString, "		AND st.FUNDING_SOURCE_ID IN (",VAR_FUNDING_SOURCE_PROCUREMENT_AGENT_IDS,") ");
    END IF;
	SET @sqlString = CONCAT(@sqlString, "	GROUP BY s.SHIPMENT_ID ");
	SET @sqlString = CONCAT(@sqlString, "	) AS s1 ");
	SET @sqlString = CONCAT(@sqlString, "GROUP BY LEFT(s1.EDD,7)");
    
    PREPARE S1 FROM @sqlString;
    EXECUTE S1;
    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `shipmentGlobalDemand_ProcurementAgentCountrySplit` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `shipmentGlobalDemand_ProcurementAgentCountrySplit`(VAR_REALM_ID INT(10), VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_REALM_COUNTRY_IDS VARCHAR(255), VAR_REPORT_VIEW INT(10), VAR_FUNDING_SOURCE_PROCUREMENT_AGENT_IDS VARCHAR(255), VAR_PLANNING_UNIT_ID INT(10))
BEGIN
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    -- Report no 21 Part 3 for ProcurementAgent
    -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
	DECLARE finished INTEGER DEFAULT 0;
    DECLARE fspaId INT(10) DEFAULT 0;
    DECLARE fspaCode VARCHAR(10) DEFAULT '';
    DECLARE fspa_cursor CURSOR FOR SELECT PROCUREMENT_AGENT_ID, PROCUREMENT_AGENT_CODE FROM rm_procurement_agent WHERE REALM_ID=VAR_REALM_ID;
    DECLARE CONTINUE HANDLER 
        FOR NOT FOUND SET finished = 1;
	
	SET @realmId = VAR_REALM_ID;
	SET @startDate = VAR_START_DATE;
	SET @stopDate = VAR_STOP_DATE;
	SET @reportView = VAR_REPORT_VIEW;
	SET @planningUnitId = VAR_PLANNING_UNIT_ID;
    SET @sqlStringFSPA = "";
    
    OPEN fspa_cursor;
    getFSPA: LOOP
		FETCH fspa_cursor into fspaId, fspaCode;
        IF finished = 1 THEN 
			LEAVE getFSPA;
		END IF;
		SET @sqlStringFSPA= CONCAT(@sqlStringFSPA, " ,SUM(IF(s1.FUNDING_SOURCE_PROCUREMENT_AGENT_ID=",fspaId,", s1.AMOUNT, 0)) `FSPA_",fspaCode,"` ");
	END LOOP getFSPA;
    
	SET @sqlString = "";
    SET @sqlString = CONCAT(@sqlString, "SELECT ");
	SET @sqlString = CONCAT(@sqlString, "	rc.REALM_COUNTRY_ID, c.COUNTRY_CODE, c.LABEL_ID `COUNTRY_LABEL_ID`, c.LABEL_EN `COUNTRY_LABEL_EN`, c.LABEL_FR `COUNTRY_LABEL_FR`, c.LABEL_SP `COUNTRY_LABEL_SP`, c.LABEL_PR `COUNTRY_LABEL_PR` ");
 	SET @sqlString = CONCAT(@sqlString, @sqlStringFSPA);
	SET @sqlString = CONCAT(@sqlString, "FROM ");
	SET @sqlString = CONCAT(@sqlString, "	( ");
	SET @sqlString = CONCAT(@sqlString, "	SELECT s.SHIPMENT_ID, rc.REALM_COUNTRY_ID, IF(@reportView=1, st.FUNDING_SOURCE_ID,st.PROCUREMENT_AGENT_ID) `FUNDING_SOURCE_PROCUREMENT_AGENT_ID`, (IFNULL(st.PRODUCT_COST * s.CONVERSION_RATE_TO_USD,0) + IFNULL(st.FREIGHT_COST * s.CONVERSION_RATE_TO_USD,0)) `AMOUNT` ");
	SET @sqlString = CONCAT(@sqlString, "	FROM rm_program p ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_realm_country rc ON p.REALM_COUNTRY_ID=rc.REALM_COUNTRY_ID ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_shipment s ON p.PROGRAM_ID=s.PROGRAM_ID ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND st.VERSION_ID<=p.CURRENT_VERSION_ID ");
	SET @sqlString = CONCAT(@sqlString, "	WHERE ");
	SET @sqlString = CONCAT(@sqlString, "		rc.REALM_ID=@realmId ");
	SET @sqlString = CONCAT(@sqlString, "		AND s.SHIPMENT_ID IS NOT NULL ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.ACTIVE ");
	SET @sqlString = CONCAT(@sqlString, "		AND COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) BETWEEN @startDate AND @stopDate ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.SHIPMENT_STATUS_ID != 8 ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.PLANNING_UNIT_ID = @planningUnitId ");
    IF LENGTH(VAR_REALM_COUNTRY_IDS) > 0 THEN
		SET @sqlString = CONCAT(@sqlString, "		AND rc.REALM_COUNTRY_ID IN (",VAR_REALM_COUNTRY_IDS,") ");
    END IF;
    IF LENGTH(VAR_FUNDING_SOURCE_PROCUREMENT_AGENT_IDS) > 0 THEN
		SET @sqlString = CONCAT(@sqlString, "		AND st.PROCUREMENT_AGENT_ID IN (",VAR_FUNDING_SOURCE_PROCUREMENT_AGENT_IDS,") ");
    END IF;
	SET @sqlString = CONCAT(@sqlString, "	GROUP BY s.SHIPMENT_ID ");
	SET @sqlString = CONCAT(@sqlString, "	) AS s1 ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_realm_country rc ON s1.REALM_COUNTRY_ID=rc.REALM_COUNTRY_ID ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_country c ON rc.COUNTRY_ID=c.COUNTRY_ID ");
	SET @sqlString = CONCAT(@sqlString, "GROUP BY s1.REALM_COUNTRY_ID");
    
    PREPARE S1 FROM @sqlString;
    EXECUTE S1;
    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `shipmentGlobalDemand_ProcurementAgentDateSplit` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `shipmentGlobalDemand_ProcurementAgentDateSplit`(VAR_REALM_ID INT(10), VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_REALM_COUNTRY_IDS VARCHAR(255), VAR_REPORT_VIEW INT(10), VAR_FUNDING_SOURCE_PROCUREMENT_AGENT_IDS VARCHAR(255), VAR_PLANNING_UNIT_ID INT(10))
BEGIN
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    -- Report no 21 Part 2 for ProcurementAgent
    -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
	DECLARE finished INTEGER DEFAULT 0;
    DECLARE fspaId INT(10) DEFAULT 0;
    DECLARE fspaCode VARCHAR(10) DEFAULT '';
    DECLARE fspa_cursor CURSOR FOR SELECT PROCUREMENT_AGENT_ID, PROCUREMENT_AGENT_CODE FROM rm_procurement_agent WHERE REALM_ID=VAR_REALM_ID;
    DECLARE CONTINUE HANDLER 
        FOR NOT FOUND SET finished = 1;
	
	SET @realmId = VAR_REALM_ID;
	SET @startDate = VAR_START_DATE;
	SET @stopDate = VAR_STOP_DATE;
	SET @reportView = VAR_REPORT_VIEW;
	SET @planningUnitId = VAR_PLANNING_UNIT_ID;
    SET @sqlStringFSPA = "";
    
    OPEN fspa_cursor;
    getFSPA: LOOP
		FETCH fspa_cursor into fspaId, fspaCode;
        IF finished = 1 THEN 
			LEAVE getFSPA;
		END IF;
		SET @sqlStringFSPA= CONCAT(@sqlStringFSPA, " ,SUM(IF(s1.FUNDING_SOURCE_PROCUREMENT_AGENT_ID=",fspaId,", s1.AMOUNT, 0)) `FSPA_",fspaCode,"` ");
	END LOOP getFSPA;
    
	SET @sqlString = "";
    SET @sqlString = CONCAT(@sqlString, "SELECT ");
	SET @sqlString = CONCAT(@sqlString, "	CONCAT(LEFT(s1.EDD,7),'-01') `TRANS_DATE` ");
 	SET @sqlString = CONCAT(@sqlString, @sqlStringFSPA);
	SET @sqlString = CONCAT(@sqlString, "FROM ");
	SET @sqlString = CONCAT(@sqlString, "	( ");
	SET @sqlString = CONCAT(@sqlString, "	SELECT s.SHIPMENT_ID, COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) `EDD`, rc.REALM_COUNTRY_ID, IF(@reportView=1, st.FUNDING_SOURCE_ID,st.PROCUREMENT_AGENT_ID) `FUNDING_SOURCE_PROCUREMENT_AGENT_ID`, (IFNULL(st.PRODUCT_COST * s.CONVERSION_RATE_TO_USD,0) + IFNULL(st.FREIGHT_COST * s.CONVERSION_RATE_TO_USD,0)) `AMOUNT` ");
	SET @sqlString = CONCAT(@sqlString, "	FROM rm_program p ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_realm_country rc ON p.REALM_COUNTRY_ID=rc.REALM_COUNTRY_ID ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_shipment s ON p.PROGRAM_ID=s.PROGRAM_ID ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND st.VERSION_ID<=p.CURRENT_VERSION_ID ");
	SET @sqlString = CONCAT(@sqlString, "	WHERE ");
	SET @sqlString = CONCAT(@sqlString, "		rc.REALM_ID=@realmId ");
	SET @sqlString = CONCAT(@sqlString, "		AND s.SHIPMENT_ID IS NOT NULL ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.ACTIVE ");
	SET @sqlString = CONCAT(@sqlString, "		AND COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) BETWEEN @startDate AND @stopDate ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.SHIPMENT_STATUS_ID != 8 ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.PLANNING_UNIT_ID = @planningUnitId ");
    IF LENGTH(VAR_REALM_COUNTRY_IDS) > 0 THEN
		SET @sqlString = CONCAT(@sqlString, "		AND rc.REALM_COUNTRY_ID IN (",VAR_REALM_COUNTRY_IDS,") ");
    END IF;
    IF LENGTH(VAR_FUNDING_SOURCE_PROCUREMENT_AGENT_IDS) > 0 THEN
		SET @sqlString = CONCAT(@sqlString, "		AND st.PROCUREMENT_AGENT_ID IN (",VAR_FUNDING_SOURCE_PROCUREMENT_AGENT_IDS,") ");
    END IF;
	SET @sqlString = CONCAT(@sqlString, "	GROUP BY s.SHIPMENT_ID ");
	SET @sqlString = CONCAT(@sqlString, "	) AS s1 ");
	SET @sqlString = CONCAT(@sqlString, "GROUP BY LEFT(s1.EDD,7)");
    
    PREPARE S1 FROM @sqlString;
    EXECUTE S1;
    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `shipmentGlobalDemand_ShipmentList` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `shipmentGlobalDemand_ShipmentList`(VAR_REALM_ID INT(10), VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_REALM_COUNTRY_IDS VARCHAR(255), VAR_REPORT_VIEW INT(10), VAR_FUNDING_SOURCE_PROCUREMENT_AGENT_IDS VARCHAR(255), VAR_PLANNING_UNIT_ID INT(10))
BEGIN
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    -- Report no 21 Part 1
    -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
	SET @realmId = VAR_REALM_ID;
	SET @startDate = VAR_START_DATE;
	SET @stopDate = VAR_STOP_DATE;
	SET @reportView = VAR_REPORT_VIEW;
	SET @planningUnitId = VAR_PLANNING_UNIT_ID;

	SET @sqlString = "";
    
	SET @sqlString = CONCAT(@sqlString, "SELECT ");
	SET @sqlString = CONCAT(@sqlString, "	CONCAT(LEFT(s1.EDD,7),'-01') `TRANS_DATE`, s1.REALM_COUNTRY_ID, c.COUNTRY_CODE, c.LABEL_ID `COUNTRY_LABEL_ID`, c.LABEL_EN `COUNTRY_LABEL_EN`, c.LABEL_FR `COUNTRY_LABEL_FR`, c.LABEL_SP `COUNTRY_LABEL_SP`, c.LABEL_PR `COUNTRY_LABEL_PR`, ");
	SET @sqlString = CONCAT(@sqlString, "	SUM(s1.AMOUNT) `AMOUNT`, ");
	SET @sqlString = CONCAT(@sqlString, "	IF(@reportView=1, fs.FUNDING_SOURCE_ID, pa.PROCUREMENT_AGENT_ID) `FUNDING_SOURCE_PROCUREMENT_AGENT_ID`, IF(@reportView=1, fs.FUNDING_SOURCE_CODE, pa.PROCUREMENT_AGENT_CODE) `FUNDING_SOURCE_PROCUREMENT_AGENT_CODE`, IF(@reportView=1, fs.LABEL_ID, pa.LABEL_ID) `FUNDING_SOURCE_PROCUREMENT_AGENT_LABEL_ID`, IF(@reportView=1, fs.LABEL_EN, pa.LABEL_EN) `FUNDING_SOURCE_PROCUREMENT_AGENT_LABEL_EN`, IF(@reportView=1, fs.LABEL_FR, pa.LABEL_FR) `FUNDING_SOURCE_PROCUREMENT_AGENT_LABEL_FR`, IF(@reportView=1, fs.LABEL_SP, pa.LABEL_SP) `FUNDING_SOURCE_PROCUREMENT_AGENT_LABEL_SP`, IF(@reportView=1, fs.LABEL_PR, pa.LABEL_PR) `FUNDING_SOURCE_PROCUREMENT_AGENT_LABEL_PR`, ");
	SET @sqlString = CONCAT(@sqlString, "	ss.SHIPMENT_STATUS_ID, ss.LABEL_ID `SHIPMENT_STATUS_LABEL_ID`, ss.LABEL_EN `SHIPMENT_STATUS_LABEL_EN`, ss.LABEL_FR `SHIPMENT_STATUS_LABEL_FR`, ss.LABEL_SP `SHIPMENT_STATUS_LABEL_SP`, ss.LABEL_PR `SHIPMENT_STATUS_LABEL_PR` ");
	SET @sqlString = CONCAT(@sqlString, "FROM ");
	SET @sqlString = CONCAT(@sqlString, "	( ");
	SET @sqlString = CONCAT(@sqlString, "	SELECT s.SHIPMENT_ID, COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) `EDD`, rc.REALM_COUNTRY_ID, IF(@reportView=1, st.FUNDING_SOURCE_ID,st.PROCUREMENT_AGENT_ID) `FUNDING_SOURCE_PROCUREMENT_AGENT_ID`, (IFNULL(st.PRODUCT_COST * s.CONVERSION_RATE_TO_USD,0) + IFNULL(st.FREIGHT_COST * s.CONVERSION_RATE_TO_USD,0)) `AMOUNT`, st.SHIPMENT_STATUS_ID ");
	SET @sqlString = CONCAT(@sqlString, "	FROM rm_program p ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_realm_country rc ON p.REALM_COUNTRY_ID=rc.REALM_COUNTRY_ID ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_shipment s ON p.PROGRAM_ID=s.PROGRAM_ID ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND st.VERSION_ID<=p.CURRENT_VERSION_ID ");
	SET @sqlString = CONCAT(@sqlString, "	WHERE ");
	SET @sqlString = CONCAT(@sqlString, "		rc.REALM_ID=@realmId ");
	SET @sqlString = CONCAT(@sqlString, "		AND s.SHIPMENT_ID IS NOT NULL ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.ACTIVE ");
	SET @sqlString = CONCAT(@sqlString, "		AND COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) BETWEEN @startDate AND @stopDate ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.SHIPMENT_STATUS_ID != 8 ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.PLANNING_UNIT_ID = @planningUnitId ");
    IF LENGTH(VAR_REALM_COUNTRY_IDS) > 0 THEN 
		SET @sqlString = CONCAT(@sqlString, "		AND rc.REALM_COUNTRY_ID IN (",VAR_REALM_COUNTRY_IDS,") ");
    END IF;
    IF LENGTH(VAR_FUNDING_SOURCE_PROCUREMENT_AGENT_IDS) > 0 THEN
		IF @reportView = 1 THEN 
			SET @sqlString = CONCAT(@sqlString, "		AND st.FUNDING_SOURCE_ID IN (",VAR_FUNDING_SOURCE_PROCUREMENT_AGENT_IDS,") ");
        ELSE
			SET @sqlString = CONCAT(@sqlString, "		AND st.PROCUREMENT_AGENT_ID IN (",VAR_FUNDING_SOURCE_PROCUREMENT_AGENT_IDS,") ");
        END IF;
    END IF;
	SET @sqlString = CONCAT(@sqlString, "	GROUP BY s.SHIPMENT_ID ");
	SET @sqlString = CONCAT(@sqlString, ") AS s1 ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_realm_country rc ON rc.REALM_COUNTRY_ID = s1.REALM_COUNTRY_ID ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_country c ON rc.COUNTRY_ID=c.COUNTRY_ID ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_funding_source fs ON s1.FUNDING_SOURCE_PROCUREMENT_AGENT_ID=fs.FUNDING_SOURCE_ID ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_procurement_agent pa ON s1.FUNDING_SOURCE_PROCUREMENT_AGENT_ID=pa.PROCUREMENT_AGENT_ID ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_shipment_status ss ON s1.SHIPMENT_STATUS_ID=ss.SHIPMENT_STATUS_ID ");
	SET @sqlString = CONCAT(@sqlString, "GROUP BY MONTH(s1.EDD)");
    
    PREPARE S1 FROM @sqlString;
    EXECUTE S1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `shipmentOverview_fundingSourceSplit` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `shipmentOverview_fundingSourceSplit`(VAR_REALM_ID INT(10), VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_FUNDING_SOURCE_IDS VARCHAR(255), VAR_PLANNING_UNIT_IDS VARCHAR(255), VAR_SHIPMENT_STATUS_IDS VARCHAR(255))
BEGIN
	
 -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
 -- Report no 20 - Part 1 Funding Source Split
 -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
 
 -- Only Month and Year will be considered for StartDate and StopDate
 -- Must be a valid RealmId that you want to see the Global Report for
 -- PlanningUnitIds is the list of Planning Units you want to run the report for. 
 -- Empty PlanningUnitIds means you want to run the report for all the Planning Units
 -- FundingSourceIds is the list of Funding Sources that you want to run the report for
 -- Empty FundingSourceIds means you want to run for all the Funding Sources
 -- ShipmentStatusIds is the list of ShipmentStatuses that you want to run the report for
 -- Empty ShipmentStatusIds means you want to run for all Shipment Statuses
 
	SET @startDate = VAR_START_DATE;
	SET @stopDate = VAR_STOP_DATE;
	SET @realmId = VAR_REALM_ID;

	SET @sqlString = "";
 
	SET @sqlString = CONCAT(@sqlString, "SELECT fs.FUNDING_SOURCE_ID, fs.FUNDING_SOURCE_CODE, fs.LABEL_ID `FUNDING_SOURCE_LABEL_ID`, fs.LABEL_EN `FUNDING_SOURCE_LABEL_EN`, fs.LABEL_FR `FUNDING_SOURCE_LABEL_FR`, fs.LABEL_SP `FUNDING_SOURCE_LABEL_SP`, fs.LABEL_PR `FUNDING_SOURCE_LABEL_PR`, SUM(s1.TOTAL_COST) `TOTAL_COST` ");
	SET @sqlString = CONCAT(@sqlString, "FROM ( ");
	SET @sqlString = CONCAT(@sqlString, "	SELECT s.SHIPMENT_ID, st.FUNDING_SOURCE_ID, (st.PRODUCT_COST * s.CONVERSION_RATE_TO_USD + st.FREIGHT_COST * s.CONVERSION_RATE_TO_USD) TOTAL_COST ");
	SET @sqlString = CONCAT(@sqlString, "	FROM rm_program p ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_realm_country rc ON p.REALM_COUNTRY_ID=rc.REALM_COUNTRY_ID ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_shipment s ON p.PROGRAM_ID=s.PROGRAM_ID ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND st.VERSION_ID<=p.CURRENT_VERSION_ID ");
	SET @sqlString = CONCAT(@sqlString, "	WHERE ");
	SET @sqlString = CONCAT(@sqlString, "		rc.REALM_ID=@realmId ");
	SET @sqlString = CONCAT(@sqlString, "		AND s.SHIPMENT_ID IS NOT NULL ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.ACTIVE ");
	SET @sqlString = CONCAT(@sqlString, "		AND COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) BETWEEN @startDate AND @stopDate ");
	IF LENGTH(VAR_SHIPMENT_STATUS_IDS)>0 THEN
		SET @sqlString = CONCAT(@sqlString, "		AND st.SHIPMENT_STATUS_ID IN (",VAR_SHIPMENT_STATUS_IDS,") ");
	END IF;
	IF LENGTH(VAR_PLANNING_UNIT_IDS)>0 THEN
		SET @sqlString = CONCAT(@sqlString, "		AND st.PLANNING_UNIT_ID IN (",VAR_PLANNING_UNIT_IDS,") ");
	END IF;
	IF LENGTH(VAR_FUNDING_SOURCE_IDS)>0 THEN
		SET @sqlString = CONCAT(@sqlString, "		AND st.FUNDING_SOURCE_ID IN (",VAR_FUNDING_SOURCE_IDS,") ");
	END IF;
	SET @sqlString = CONCAT(@sqlString, "	GROUP BY s.SHIPMENT_ID ");
	SET @sqlString = CONCAT(@sqlString, "	) s1 ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN vw_funding_source fs ON s1.FUNDING_SOURCE_ID=fs.FUNDING_SOURCE_ID ");
	SET @sqlString = CONCAT(@sqlString, "	GROUP BY fs.FUNDING_SOURCE_ID");
 
 PREPARE S1 FROM @sqlString;
 EXECUTE S1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `shipmentOverview_planningUnitSplit` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `shipmentOverview_planningUnitSplit`(VAR_REALM_ID INT(10), VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_FUNDING_SOURCE_IDS VARCHAR(255), VAR_PLANNING_UNIT_IDS VARCHAR(255), VAR_SHIPMENT_STATUS_IDS VARCHAR(255))
BEGIN
	
 -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
 -- Report no 20 - Part 2 PlanningUnit Split
 -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
 
 -- Only Month and Year will be considered for StartDate and StopDate
 -- Must be a valid RealmId that you want to see the Global Report for
 -- PlanningUnitIds is the list of Planning Units you want to run the report for. 
 -- Empty PlanningUnitIds means you want to run the report for all the Planning Units
 -- FundingSourceIds is the list of Funding Sources that you want to run the report for
 -- Empty FundingSourceIds means you want to run for all the Funding Sources
 -- ShipmentStatusIds is the list of ShipmentStatuses that you want to run the report for
 -- Empty ShipmentStatusIds means you want to run for all Shipment Statuses
 
	SET @startDate = VAR_START_DATE;
	SET @stopDate = VAR_STOP_DATE;
	SET @realmId = VAR_REALM_ID;

	SET @sqlString = "";
 
	SET @sqlString = CONCAT(@sqlString, "SELECT pu.PLANNING_UNIT_ID, pu.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pu.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pu.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pu.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pu.LABEL_PR `PLANNING_UNIT_LABEL_PR`, pu.MULTIPLIER, SUM(IF(s1.SHIPMENT_STATUS_ID IN (1,2,3,9),s1.SHIPMENT_QTY,0)) `PLANNED_SHIPMENT_QTY`, SUM(IF(s1.SHIPMENT_STATUS_ID IN (4,5,6,7),s1.SHIPMENT_QTY,0)) `ORDERED_SHIPMENT_QTY` ");
	SET @sqlString = CONCAT(@sqlString, "FROM ( ");
	SET @sqlString = CONCAT(@sqlString, "	SELECT s.SHIPMENT_ID, st.PLANNING_UNIT_ID, st.SHIPMENT_STATUS_ID, st.SHIPMENT_QTY ");
	SET @sqlString = CONCAT(@sqlString, "	FROM rm_program p ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_realm_country rc ON p.REALM_COUNTRY_ID=rc.REALM_COUNTRY_ID ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_shipment s ON p.PROGRAM_ID=s.PROGRAM_ID ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND st.VERSION_ID<=p.CURRENT_VERSION_ID ");
	SET @sqlString = CONCAT(@sqlString, "	WHERE ");
	SET @sqlString = CONCAT(@sqlString, "		rc.REALM_ID=@realmId ");
	SET @sqlString = CONCAT(@sqlString, "		AND s.SHIPMENT_ID IS NOT NULL ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.ACTIVE ");
    SET @sqlString = CONCAT(@sqlString, "		AND st.SHIPMENT_STATUS_ID != 8 ");
	SET @sqlString = CONCAT(@sqlString, "		AND COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) BETWEEN @startDate AND @stopDate ");
	IF LENGTH(VAR_SHIPMENT_STATUS_IDS)>0 THEN
		SET @sqlString = CONCAT(@sqlString, "		AND st.SHIPMENT_STATUS_ID IN (",VAR_SHIPMENT_STATUS_IDS,") ");
	END IF;
	IF LENGTH(VAR_PLANNING_UNIT_IDS)>0 THEN
		SET @sqlString = CONCAT(@sqlString, "		AND st.PLANNING_UNIT_ID IN (",VAR_PLANNING_UNIT_IDS,") ");
	END IF;
	IF LENGTH(VAR_FUNDING_SOURCE_IDS)>0 THEN
		SET @sqlString = CONCAT(@sqlString, "		AND st.FUNDING_SOURCE_ID IN (",VAR_FUNDING_SOURCE_IDS,") ");
	END IF;
	SET @sqlString = CONCAT(@sqlString, "	GROUP BY s.SHIPMENT_ID ");
	SET @sqlString = CONCAT(@sqlString, "	) s1 ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN vw_planning_unit pu ON s1.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID ");
	SET @sqlString = CONCAT(@sqlString, "	GROUP BY pu.PLANNING_UNIT_ID");
 
 PREPARE S1 FROM @sqlString;
 EXECUTE S1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `shipmentOverview_procurementAgentSplit` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `shipmentOverview_procurementAgentSplit`(VAR_REALM_ID INT(10), VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_FUNDING_SOURCE_IDS VARCHAR(255), VAR_PLANNING_UNIT_IDS VARCHAR(255), VAR_SHIPMENT_STATUS_IDS VARCHAR(255))
BEGIN
	
 -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
 -- Report no 20 - Part 3 ProcurementAgent Split
 -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
 
 -- Only Month and Year will be considered for StartDate and StopDate
 -- Must be a valid RealmId that you want to see the Global Report for
 -- PlanningUnitIds is the list of Planning Units you want to run the report for. 
 -- Empty PlanningUnitIds means you want to run the report for all the Planning Units
 -- FundingSourceIds is the list of Funding Sources that you want to run the report for
 -- Empty FundingSourceIds means you want to run for all the Funding Sources
 -- ShipmentStatusIds is the list of ShipmentStatuses that you want to run the report for
 -- Empty ShipmentStatusIds means you want to run for all Shipment Statuses
 
	DECLARE finished INTEGER DEFAULT 0;
    DECLARE procurementAgentId INT(10) DEFAULT 0;
    DECLARE procurementAgentCode VARCHAR(10) DEFAULT "";
    DECLARE procurement_cursor CURSOR FOR SELECT PROCUREMENT_AGENT_ID, PROCUREMENT_AGENT_CODE FROM rm_procurement_agent WHERE REALM_ID=VAR_REALM_ID;
    DECLARE CONTINUE HANDLER 
        FOR NOT FOUND SET finished = 1;
    
	SET @startDate = VAR_START_DATE;
	SET @stopDate = VAR_STOP_DATE;
	SET @realmId = VAR_REALM_ID;
	SET @sqlStringProcurementAgent = "";
    
	OPEN procurement_cursor;
    getProcurementAgent: LOOP
		FETCH procurement_cursor into procurementAgentId, procurementAgentCode;
        IF finished = 1 THEN 
			LEAVE getProcurementAgent;
		END IF;
		SET @sqlStringProcurementAgent = CONCAT(@sqlStringProcurementAgent, " ,SUM(IF(s1.PROCUREMENT_AGENT_ID=",procurementAgentId,", s1.SHIPMENT_QTY, 0)) `PA_",procurementAgentCode,"` ");
	END LOOP getProcurementAgent;
    
	SET @sqlString = "";
 
	SET @sqlString = CONCAT(@sqlString, "SELECT pu.PLANNING_UNIT_ID, pu.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pu.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pu.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pu.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pu.LABEL_PR `PLANNING_UNIT_LABEL_PR`, pu.MULTIPLIER, SUM(s1.SHIPMENT_QTY) `SHIPMENT_QTY` ");
	SET @sqlString = CONCAT(@sqlString, @sqlStringProcurementAgent);
	SET @sqlString = CONCAT(@sqlString, "FROM ( ");
	SET @sqlString = CONCAT(@sqlString, "	SELECT s.SHIPMENT_ID, st.PLANNING_UNIT_ID, st.PROCUREMENT_AGENT_ID, st.SHIPMENT_QTY ");
	SET @sqlString = CONCAT(@sqlString, "	FROM rm_program p ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_realm_country rc ON p.REALM_COUNTRY_ID=rc.REALM_COUNTRY_ID ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_shipment s ON p.PROGRAM_ID=s.PROGRAM_ID ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND st.VERSION_ID<=p.CURRENT_VERSION_ID ");
	SET @sqlString = CONCAT(@sqlString, "	WHERE ");
	SET @sqlString = CONCAT(@sqlString, "		rc.REALM_ID=@realmId ");
	SET @sqlString = CONCAT(@sqlString, "		AND s.SHIPMENT_ID IS NOT NULL ");
	SET @sqlString = CONCAT(@sqlString, "		AND st.ACTIVE ");
	SET @sqlString = CONCAT(@sqlString, "		AND COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) BETWEEN @startDate AND @stopDate ");
	IF LENGTH(VAR_SHIPMENT_STATUS_IDS)>0 THEN
		SET @sqlString = CONCAT(@sqlString, "		AND st.SHIPMENT_STATUS_ID IN (",VAR_SHIPMENT_STATUS_IDS,") ");
	END IF;
	IF LENGTH(VAR_PLANNING_UNIT_IDS)>0 THEN
		SET @sqlString = CONCAT(@sqlString, "		AND st.PLANNING_UNIT_ID IN (",VAR_PLANNING_UNIT_IDS,") ");
	END IF;
	IF LENGTH(VAR_FUNDING_SOURCE_IDS)>0 THEN
		SET @sqlString = CONCAT(@sqlString, "		AND st.FUNDING_SOURCE_ID IN (",VAR_FUNDING_SOURCE_IDS,") ");
	END IF;
	SET @sqlString = CONCAT(@sqlString, "	GROUP BY s.SHIPMENT_ID ");
	SET @sqlString = CONCAT(@sqlString, "	) s1 ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN vw_planning_unit pu ON s1.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID ");
	SET @sqlString = CONCAT(@sqlString, "	GROUP BY pu.PLANNING_UNIT_ID");
 
	PREPARE S1 FROM @sqlString;
	EXECUTE S1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `stockAdjustmentReport` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `stockAdjustmentReport`(VAR_PROGRAM_ID INT(10), VAR_VERSION_ID INT(10), VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_PLANNING_UNIT_IDS VARCHAR(200))
BEGIN

 -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
 -- Report no 12
 -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
 
-- VAR_PROGRAM_ID must be a valid Program cannot be All i.e. -1
-- VAR_VERSION_ID must be a valid Version for the PROGRAM_ID or can be -1 in which case it will default to the latest Version of the Program, 
-- VAR_START_DATE AND VAR_STOP_DATE are the Date range between which the Stock Adjustment will be run. Only the month and year are considered while running the report
-- VAR_PLANNING_UNIT_IDS are the Quoted, Comma separated list of the Planning Unit Ids that you want to run the report for. If you want to run it for all Planning Units in the Program leave it empty

SET @programId = VAR_PROGRAM_ID;
SET @versionId = VAR_VERSION_ID;
IF @versionID = -1 THEN
	SELECT MAX(pv.VERSION_ID) INTO @versionId FROM rm_program_version pv WHERE pv.PROGRAM_ID=@programId;
END IF;
SET @startDt = LEFT(VAR_START_DATE,7);
SET @stopDt = LEFT(VAR_STOP_DATE,7);

SET @sqlString = "";

SET @sqlString = CONCAT(@sqlString, "SELECT ");
SET @sqlString = CONCAT(@sqlString, "	p.PROGRAM_ID, p.LABEL_ID `PROGRAM_LABEL_ID`, p.LABEL_EN `PROGRAM_LABEL_EN`, p.LABEL_FR `PROGRAM_LABEL_FR`, p.LABEL_SP `PROGRAM_LABEL_SP`, p.LABEL_PR `PROGRAM_LABEL_PR`,");
SET @sqlString = CONCAT(@sqlString, "   pu.PLANNING_UNIT_ID, pu.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pu.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pu.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pu.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pu.LABEL_PR `PLANNING_UNIT_LABEL_PR`,");
SET @sqlString = CONCAT(@sqlString, "   ds.DATA_SOURCE_ID, ds.LABEL_ID `DATA_SOURCE_LABEL_ID`, ds.LABEL_EN `DATA_SOURCE_LABEL_EN`, ds.LABEL_FR `DATA_SOURCE_LABEL_FR`, ds.LABEL_SP `DATA_SOURCE_LABEL_SP`, ds.LABEL_PR `DATA_SOURCE_LABEL_PR`, ");
SET @sqlString = CONCAT(@sqlString, "	it.INVENTORY_DATE, it.ADJUSTMENT_QTY*rcpu.MULTIPLIER `STOCK_ADJUSTMENT_QTY`, lmb.USER_ID `LAST_MODIFIED_BY_USER_ID`, lmb.USERNAME `LAST_MODIFIED_BY_USERNAME`, it.LAST_MODIFIED_DATE, it.NOTES");
SET @sqlString = CONCAT(@sqlString, " FROM ");
SET @sqlString = CONCAT(@sqlString, "	( ");
SET @sqlString = CONCAT(@sqlString, "    SELECT ");
SET @sqlString = CONCAT(@sqlString, "		i.PROGRAM_ID, i.INVENTORY_ID, MAX(it.VERSION_ID) MAX_VERSION_ID ");
SET @sqlString = CONCAT(@sqlString, "	FROM rm_inventory i ");
SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN rm_inventory_trans it ON i.INVENTORY_ID=it.INVENTORY_ID ");
SET @sqlString = CONCAT(@sqlString, "	WHERE i.PROGRAM_ID=@programId AND it.VERSION_ID<=@versionId AND it.INVENTORY_TRANS_ID IS NOT NULL AND it.ACTIVE ");
SET @sqlString = CONCAT(@sqlString, "	GROUP BY i.INVENTORY_ID ");
SET @sqlString = CONCAT(@sqlString, ") ti ");
SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_inventory_trans it ON ti.INVENTORY_ID=it.INVENTORY_ID AND ti.MAX_VERSION_ID=it.VERSION_ID ");
SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_inventory i ON ti.INVENTORY_ID=i.INVENTORY_ID ");
SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_program p ON i.PROGRAM_ID=p.PROGRAM_ID ");
SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_realm_country_planning_unit rcpu ON it.REALM_COUNTRY_PLANNING_UNIT_ID=rcpu.REALM_COUNTRY_PLANNING_UNIT_ID ");
SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_planning_unit pu ON rcpu.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID ");
SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_data_source ds ON it.DATA_SOURCE_ID=ds.DATA_SOURCE_ID ");
SET @sqlString = CONCAT(@sqlString, "LEFT JOIN us_user lmb ON it.LAST_MODIFIED_BY=lmb.USER_ID ");
SET @sqlString = CONCAT(@sqlString, "WHERE it.ADJUSTMENT_QTY IS NOT NULL AND LEFT(it.INVENTORY_DATE,7) BETWEEN @startDt AND @stopDt ");
IF LENGTH(VAR_PLANNING_UNIT_IDS) >0 THEN
 	SET @sqlString = CONCAT(@sqlString, " AND pu.PLANNING_UNIT_ID IN (",VAR_PLANNING_UNIT_IDS,") ");
END IF;

PREPARE s2 FROM @sqlString;
EXECUTE s2;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `stockOverTime` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `stockOverTime`(PROGRAM_ID INT(10), PLANNING_UNIT_ID INT(10), START_DATE VARCHAR(10), STOP_DATE VARCHAR(10), MOS_PAST INT(10), MOS_FUTURE INT(10))
BEGIN
	-- Only Month and Year will be considered for StartDate and StopDate
    -- mosPast indicates the number of months that we need to go into the past to calculate AMC
    -- mosFuture indicated the number of months that we need to go into the future to calculate AMC
    -- current month is always included in AMC
    SET @programId =  PROGRAM_ID;
	SET @versionId = -1;
	SET @planningUnitId= PLANNING_UNIT_ID;
	SET @startDate = START_DATE;
	SET @stopDate = STOP_DATE;
	SET @mosPast = MOS_PAST;
	SET @mosFuture = MOS_FUTURE;
	SET @includePlannedShipments=true;
    
    IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) INTO @versionId FROM rm_program_version pv WHERE pv.PROGRAM_ID=@programId;
	END IF;
    
	SELECT 
		mn.MONTH `DT`, 
		p.PROGRAM_ID, p.LABEL_ID `PROGRAM_LABEL_ID`, p.LABEL_EN `PROGRAM_LABEL_EN`, p.LABEL_FR `PROGRAM_LABEL_FR`, p.LABEL_SP `PROGRAM_LABEL_SP`, p.LABEL_PR `PROGRAM_LABEL_PR`, 
        pu.PLANNING_UNIT_ID, pu.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pu.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pu.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pu.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pu.LABEL_PR `PLANNING_UNIT_LABEL_PR`, 
		COUNT(s2.CONSUMPTION_QTY) `AMC_MONTH_COUNT`, AVG(s2.CONSUMPTION_QTY) `AMC`, s3.CONSUMPTION_QTY, s3.STOCK, s3.STOCK/AVG(s2.CONSUMPTION_QTY) `MOS`
    FROM mn 
    LEFT JOIN vw_program p ON p.PROGRAM_ID=@programId
    LEFT JOIN vw_planning_unit pu ON pu.PLANNING_UNIT_ID=@planningUnitId
	LEFT JOIN 
		(
		SELECT 
			sp.TRANS_DATE, sp.PLANNING_UNIT_ID, 
            SUM(IF(sp.ACTUAL, sp.ACTUAL_CONSUMPTION_QTY, sp.FORECASTED_CONSUMPTION_QTY)) `CONSUMPTION_QTY`
		FROM rm_supply_plan_batch_info sp 
		WHERE sp.PROGRAM_ID=@programId AND sp.VERSION_ID=@versionId AND sp.PLANNING_UNIT_ID=@planningUnitId AND sp.TRANS_DATE BETWEEN SUBDATE(@startDate, INTERVAL @mosPast MONTH) AND ADDDATE(@stopDate, INTERVAL @mosFuture MONTH)
        GROUP BY sp.PLANNING_UNIT_ID, sp.TRANS_DATE
	) s2 ON s2.TRANS_DATE BETWEEN SUBDATE(mn.MONTH, INTERVAL @mosPast MONTH) AND ADDDATE(mn.MONTH, INTERVAL @mosFuture MONTH)
    LEFT JOIN 
		(
		SELECT 
			sp.TRANS_DATE, sp.PLANNING_UNIT_ID, 
            SUM(IF(sp.ACTUAL, sp.ACTUAL_CONSUMPTION_QTY, sp.FORECASTED_CONSUMPTION_QTY)) `CONSUMPTION_QTY`,
            SUM(IF(@includePlannedShipments, sp.FINAL_CLOSING_BALANCE, sp.FINAL_CLOSING_BALANCE_WPS)) `STOCK`
		FROM rm_supply_plan_batch_info sp 
		WHERE sp.PROGRAM_ID=@programId AND sp.VERSION_ID=@versionId AND sp.PLANNING_UNIT_ID=@planningUnitId AND sp.TRANS_DATE between @startDate AND @stopDate
        GROUP BY sp.PLANNING_UNIT_ID, sp.TRANS_DATE
	) s3 ON s3.TRANS_DATE = mn.MONTH
	WHERE mn.MONTH BETWEEN @startDate AND @stopDate
    GROUP BY mn.MONTH;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `stockStatusForProgramPlanningUnit` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `stockStatusForProgramPlanningUnit`(VAR_PROGRAM_ID INT (10), VAR_VERSION_ID INT, VAR_PLANNING_UNIT_ID INT (10), VAR_DT DATE)
BEGIN

	SET @programId = VAR_PROGRAM_ID;
    SET @versionId = VAR_VERSION_ID;
	SET @dt = VAR_DT;
    SET @planningUnitId = VAR_PLANNING_UNIT_ID;
    
	SELECT IF(@versionId=-1, MAX(pv.VERSION_ID), @versionId) INTO @versionId FROM rm_program_version pv WHERE pv.PROGRAM_ID=@programId;
    
    SELECT 
        p.PROGRAM_ID, p.PROGRAM_CODE, p.LABEL_ID `PROGRAM_LABEL_ID`, p.LABEL_EN `PROGRAM_LABEL_EN`, p.LABEL_FR `PROGRAM_LABEL_FR`, p.LABEL_SP `PROGRAM_LABEL_SP`, p.LABEL_PR `PROGRAM_LABEL_PR`,
        amc.AMC, amc.AMC_COUNT, amc.CLOSING_BALANCE, amc.MOS, ppu.MIN_MONTHS_OF_STOCK `MIN_STOCK_MOS`, (ppu.MIN_MONTHS_OF_STOCK+ppu.REORDER_FREQUENCY_IN_MONTHS) `MAX_STOCK_MOS`
--        IF(ppu.MIN_MONTHS_OF_STOCK<r.MIN_MOS_MIN_GAURDRAIL,r.MIN_MOS_MIN_GAURDRAIL, ppu.MIN_MONTHS_OF_STOCK) `MIN_MONTHS_OF_STOCK`, 
--        IF(IF(ppu.MIN_MONTHS_OF_STOCK<r.MIN_MOS_MIN_GAURDRAIL,r.MIN_MOS_MIN_GAURDRAIL, ppu.MIN_MONTHS_OF_STOCK)+ppu.REORDER_FREQUENCY_IN_MONTHS<r.MIN_MOS_MAX_GAURDRAIL, r.MIN_MOS_MAX_GAURDRAIL, IF(IF(ppu.MIN_MONTHS_OF_STOCK<r.MIN_MOS_MIN_GAURDRAIL,r.MIN_MOS_MIN_GAURDRAIL, ppu.MIN_MONTHS_OF_STOCK)+ppu.REORDER_FREQUENCY_IN_MONTHS>r.MAX_MOS_MAX_GAURDRAIL, r.MAX_MOS_MAX_GAURDRAIL, IF(ppu.MIN_MONTHS_OF_STOCK<r.MIN_MOS_MIN_GAURDRAIL,r.MIN_MOS_MIN_GAURDRAIL, ppu.MIN_MONTHS_OF_STOCK)+ppu.REORDER_FREQUENCY_IN_MONTHS)) `MAX_MONTHS_OF_STOCK`
    FROM rm_program_planning_unit ppu 
    LEFT JOIN rm_supply_plan_amc amc ON amc.PROGRAM_ID=ppu.PROGRAM_ID AND amc.TRANS_DATE=@dt AND ppu.PLANNING_UNIT_ID=amc.PLANNING_UNIT_ID
    LEFT JOIN vw_program p ON ppu.PROGRAM_ID=p.PROGRAM_ID
    LEFT JOIN rm_realm_country rc ON p.REALM_COUNTRY_ID=rc.REALM_COUNTRY_ID
    LEFT JOIN rm_realm r ON rc.REALM_ID=r.REALM_ID
    WHERE 			
        ppu.PROGRAM_ID=@programId 
        AND ppu.PLANNING_UNIT_ID=@planningUnitId;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `stockStatusMatrix` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `stockStatusMatrix`(VAR_PROGRAM_ID INT(10), VAR_VERSION_ID INT(10), VAR_PLANNING_UNIT_IDS VARCHAR(255), VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_INCLUDE_PLANNED_SHIPMENTS TINYINT(1))
BEGIN
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	-- Report no 18
	-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
 
	-- programId must be a single Program cannot be muti-program select or -1 for all programs
    -- versionId must be the actual version that you want to refer to for this report or -1 in which case it will automatically take the latest version (not approved or final just latest)
    -- planningUnitId is the list of Planning Units that you want to include in the report
    -- empty means you want to see the report for all Planning Units
	-- startDate and stopDate are the period for which you want to run the report
    -- includePlannedShipments = 1 means that you want to include the shipments that are still in the Planned stage while running this report.
    -- includePlannedShipments = 0 means that you want to exclude the shipments that are still in the Planned stage while running this report.
    -- AMC is calculated based on the MonthsInPastForAMC and MonthsInFutureForAMC from the Program setup
    -- Current month is always included in AMC

	SET @programId = VAR_PROGRAM_ID;
	SET @versionId = VAR_VERSION_ID;
	SET @startDate = VAR_START_DATE;
	SET @stopDate = VAR_STOP_DATE;
--    SET @planningUnitId = VAR_PLANNING_UNIT_ID;
	SET @includePlannedShipments = VAR_INCLUDE_PLANNED_SHIPMENTS;
    
    IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) INTO @versionId FROM rm_program_version pv WHERE pv.PROGRAM_ID=@programId;
	END IF;
    
    SET @sqlString = "";
    SET @sqlString = CONCAT(@sqlString, "SELECT ");
    SET @sqlString = CONCAT(@sqlString, "    YEAR(mn.MONTH) YR, ");
    SET @sqlString = CONCAT(@sqlString, "    pu.PLANNING_UNIT_ID, pu.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pu.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pu.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pu.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pu.LABEL_PR `PLANNING_UNIT_LABEL_PR`, ");
    SET @sqlString = CONCAT(@sqlString, "    pu.MULTIPLIER, ");
    SET @sqlString = CONCAT(@sqlString, "    u.UNIT_ID, u.UNIT_CODE, u.LABEL_ID `UNIT_LABEL_ID`, u.LABEL_EN `UNIT_LABEL_EN`, u.LABEL_FR `UNIT_LABEL_FR`, u.LABEL_SP `UNIT_LABEL_SP`, u.LABEL_PR `UNIT_LABEL_PR`, ");
    SET @sqlString = CONCAT(@sqlString, "    ppu.MIN_MONTHS_OF_STOCK, ppu.REORDER_FREQUENCY_IN_MONTHS, ");
    SET @sqlString = CONCAT(@sqlString, "    SUM(IF(MONTH(mn.MONTH)=1, IFNULL(IF(@includePlannedShipments, amc.MOS, amc.MOS_WPS),0),0)) `Jan`, ");
    SET @sqlString = CONCAT(@sqlString, "    SUM(IF(MONTH(mn.MONTH)=2, IFNULL(IF(@includePlannedShipments, amc.MOS, amc.MOS_WPS),0),0)) `Feb`, ");
    SET @sqlString = CONCAT(@sqlString, "    SUM(IF(MONTH(mn.MONTH)=3, IFNULL(IF(@includePlannedShipments, amc.MOS, amc.MOS_WPS),0),0)) `Mar`, ");
    SET @sqlString = CONCAT(@sqlString, "    SUM(IF(MONTH(mn.MONTH)=4, IFNULL(IF(@includePlannedShipments, amc.MOS, amc.MOS_WPS),0),0)) `Apr`, ");
    SET @sqlString = CONCAT(@sqlString, "    SUM(IF(MONTH(mn.MONTH)=5, IFNULL(IF(@includePlannedShipments, amc.MOS, amc.MOS_WPS),0),0)) `May`, ");
    SET @sqlString = CONCAT(@sqlString, "    SUM(IF(MONTH(mn.MONTH)=6, IFNULL(IF(@includePlannedShipments, amc.MOS, amc.MOS_WPS),0),0)) `Jun`, ");
    SET @sqlString = CONCAT(@sqlString, "    SUM(IF(MONTH(mn.MONTH)=7, IFNULL(IF(@includePlannedShipments, amc.MOS, amc.MOS_WPS),0),0)) `Jul`, ");
    SET @sqlString = CONCAT(@sqlString, "    SUM(IF(MONTH(mn.MONTH)=8, IFNULL(IF(@includePlannedShipments, amc.MOS, amc.MOS_WPS),0),0)) `Aug`, ");
    SET @sqlString = CONCAT(@sqlString, "    SUM(IF(MONTH(mn.MONTH)=9, IFNULL(IF(@includePlannedShipments, amc.MOS, amc.MOS_WPS),0),0)) `Sep`, ");
    SET @sqlString = CONCAT(@sqlString, "    SUM(IF(MONTH(mn.MONTH)=10, IFNULL(IF(@includePlannedShipments, amc.MOS, amc.MOS_WPS),0),0)) `Oct`, ");
    SET @sqlString = CONCAT(@sqlString, "    SUM(IF(MONTH(mn.MONTH)=11, IFNULL(IF(@includePlannedShipments, amc.MOS, amc.MOS_WPS),0),0)) `Nov`, ");
    SET @sqlString = CONCAT(@sqlString, "    SUM(IF(MONTH(mn.MONTH)=12, IFNULL(IF(@includePlannedShipments, amc.MOS, amc.MOS_WPS),0),0)) `Dec` ");
    SET @sqlString = CONCAT(@sqlString, "FROM mn ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_program_planning_unit ppu ON ppu.PROGRAM_ID=@programId ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_supply_plan_amc amc ON ppu.PROGRAM_ID=@programId AND mn.MONTH=amc.TRANS_DATE AND ppu.PLANNING_UNIT_ID=amc.PLANNING_UNIT_ID ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_planning_unit pu ON ppu.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID  ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_unit u ON pu.UNIT_ID=u.UNIT_ID ");
    SET @sqlString = CONCAT(@sqlString, "WHERE ");
    SET @sqlString = CONCAT(@sqlString, "    mn.MONTH BETWEEN @startDate and @stopDate ");
    IF LENGTH(VAR_PLANNING_UNIT_IDS)>0 THEN
        SET @sqlString = CONCAT(@sqlString, "    AND ppu.PLANNING_UNIT_ID IN (",VAR_PLANNING_UNIT_IDS,") ");
    END IF;
    SET @sqlString = CONCAT(@sqlString, "GROUP BY ppu.PLANNING_UNIT_ID, YEAR(mn.MONTH)");
    PREPARE S1 FROM @sqlString;
    EXECUTE S1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `stockStatusOverTime` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `stockStatusOverTime`(VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_PROGRAM_ID INT(10), VAR_VERSION_ID INT, VAR_PLANNING_UNIT_IDS VARCHAR(255), VAR_MONTHS_IN_PAST_FOR_AMC INT(10), VAR_MONTHS_IN_FUTURE_FOR_AMC INT(10))
BEGIN

	-- %%%%%%%%%%%%%%%%%%%%%
    -- Report no 17
	-- %%%%%%%%%%%%%%%%%%%%%
    -- Only Month and Year will be considered for StartDate and StopDate
    -- mosPast indicates the number of months that we need to go into the past to calculate AMC
    -- mosFuture indicated the number of months that we need to go into the future to calculate AMC
    -- current month is always included in AMC
    -- Only a single ProgramId can be selected
    -- VersionId can be a valid Version Id for the Program or -1 for last submitted VersionId
    -- PlanningUnitIds is the list of Planning Units you want to run the report for. 
    -- Empty PlanningUnitIds means you want to run the report for all the Planning Units in that Program
    
    SET @startDate = VAR_START_DATE;
    SET @stopDate = VAR_STOP_DATE;
    SET @programId = VAR_PROGRAM_ID;
    SET @versionId = VAR_VERSION_ID;
    SET @monthsPast = VAR_MONTHS_IN_PAST_FOR_AMC;
    SET @monthsFuture = VAR_MONTHS_IN_FUTURE_FOR_AMC;
    
    IF @monthsFuture > 0 THEN 
		SET @monthsFuture = @monthsFuture - 1;
	END IF;
    
    IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) INTO @versionId FROM rm_program_version pv WHERE pv.PROGRAM_ID=@programId;
	END IF;
    
	SET @sqlString = "";
    
	SET @sqlString = CONCAT(@sqlString, "SELECT ");
	SET @sqlString = CONCAT(@sqlString, "	mn.MONTH, p.PROGRAM_ID, p.PROGRAM_CODE, p.LABEL_ID `PROGRAM_LABEL_ID`, p.LABEL_EN `PROGRAM_LABEL_EN`, p.LABEL_FR `PROGRAM_LABEL_FR`, p.LABEL_SP `PROGRAM_LABEL_SP`, p.LABEL_PR `PROGRAM_LABEL_PR`, 	");
	SET @sqlString = CONCAT(@sqlString, "	pu.PLANNING_UNIT_ID, pu.LABEL_ID `PLANNING_UNIT_LABEL_ID`, pu.LABEL_EN `PLANNING_UNIT_LABEL_EN`, pu.LABEL_FR `PLANNING_UNIT_LABEL_FR`, pu.LABEL_SP `PLANNING_UNIT_LABEL_SP`, pu.LABEL_PR `PLANNING_UNIT_LABEL_PR`, ");
	SET @sqlString = CONCAT(@sqlString, "	d.`CONSUMPTION_QTY`, d.`ACTUAL`, d.`FINAL_CLOSING_BALANCE`, amc.`AMC`, (d.`FINAL_CLOSING_BALANCE`/amc.`AMC`) `MoS`, amc.`AMC_COUNT` ");
	SET @sqlString = CONCAT(@sqlString, "FROM mn ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_program p ON p.PROGRAM_ID=@programId ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_program_planning_unit ppu ON p.PROGRAM_ID=ppu.PROGRAM_ID ");
    IF LENGTH(VAR_PLANNING_UNIT_IDS)>0 THEN 
		SET @sqlString = CONCAT(@sqlString, "AND ppu.PLANNING_UNIT_ID IN (",VAR_PLANNING_UNIT_IDS,") ");
	END IF;
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_planning_unit pu ON ppu.PLANNING_UNIT_ID=pu.PLANNING_UNIT_ID ");
	SET @sqlString = CONCAT(@sqlString, "LEFT JOIN ");
	SET @sqlString = CONCAT(@sqlString, "	( ");
	SET @sqlString = CONCAT(@sqlString, "	SELECT ");
	SET @sqlString = CONCAT(@sqlString, "		spa.TRANS_DATE, spa.PROGRAM_ID, spa.PLANNING_UNIT_ID, ");
	SET @sqlString = CONCAT(@sqlString, "		SUM(IF(spa.ACTUAL, spa.ACTUAL_CONSUMPTION_QTY, spa.FORECASTED_CONSUMPTION_QTY)) `CONSUMPTION_QTY`, spa.ACTUAL, ");
	SET @sqlString = CONCAT(@sqlString, "		SUM(spa.CLOSING_BALANCE) `FINAL_CLOSING_BALANCE` ");
	SET @sqlString = CONCAT(@sqlString, "	FROM rm_supply_plan_amc spa ");
	SET @sqlString = CONCAT(@sqlString, "	WHERE ");
	SET @sqlString = CONCAT(@sqlString, "		spa.PROGRAM_ID=@programId and spa.VERSION_ID=@versionId AND spa.TRANS_DATE BETWEEN @startDate and @stopDate ");
	IF LENGTH(VAR_PLANNING_UNIT_IDS)>0 THEN 
		SET @sqlString = CONCAT(@sqlString, "		AND spa.PLANNING_UNIT_ID IN (",VAR_PLANNING_UNIT_IDS,") ");
	END IF;
	SET @sqlString = CONCAT(@sqlString, "	GROUP BY spa.PLANNING_UNIT_ID, spa.TRANS_DATE ");
	SET @sqlString = CONCAT(@sqlString, ") d ON mn.MONTH=d.TRANS_DATE AND ppu.PLANNING_UNIT_ID=d.PLANNING_UNIT_ID ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN ");
    SET @sqlString = CONCAT(@sqlString, "	( ");
    SET @sqlString = CONCAT(@sqlString, "	SELECT a.TRANS_DATE, a.PLANNING_UNIT_ID, AVG(a1.CONSUMPTION_QTY) AMC, COUNT(a1.CONSUMPTION_QTY) AMC_COUNT ");
	SET @sqlString = CONCAT(@sqlString, "	FROM ");
	SET @sqlString = CONCAT(@sqlString, "		( ");
	SET @sqlString = CONCAT(@sqlString, "		SELECT mn.MONTH `TRANS_DATE`, ppu.PLANNING_UNIT_ID ");
	SET @sqlString = CONCAT(@sqlString, "		FROM mn ");
	SET @sqlString = CONCAT(@sqlString, "		LEFT JOIN rm_program_planning_unit ppu ON ppu.PROGRAM_ID=@programId ");
	IF LENGTH(VAR_PLANNING_UNIT_IDS)>0 THEN 
		SET @sqlString = CONCAT(@sqlString, "		AND ppu.PLANNING_UNIT_ID IN (",VAR_PLANNING_UNIT_IDS,") ");
    END IF;
	SET @sqlString = CONCAT(@sqlString, "		WHERE mn.MONTH BETWEEN @startDate AND @stopDate ");
	SET @sqlString = CONCAT(@sqlString, "	) a ");
	SET @sqlString = CONCAT(@sqlString, "	LEFT JOIN ");
	SET @sqlString = CONCAT(@sqlString, "		( ");
	SET @sqlString = CONCAT(@sqlString, "		SELECT ");
	SET @sqlString = CONCAT(@sqlString, "		spa.TRANS_DATE, spa.PLANNING_UNIT_ID, SUM(IF(spa.ACTUAL, spa.ACTUAL_CONSUMPTION_QTY, spa.FORECASTED_CONSUMPTION_QTY)) `CONSUMPTION_QTY`, spa.ACTUAL ");
	SET @sqlString = CONCAT(@sqlString, "		FROM rm_supply_plan_amc spa ");
	SET @sqlString = CONCAT(@sqlString, "		WHERE spa.PROGRAM_ID=@programId and spa.VERSION_ID=@versionId AND spa.TRANS_DATE BETWEEN SUBDATE(@startDate, interval @monthsPast MONTH) and ADDDATE(@stopDate, interval @monthsFuture MONTH) AND spa.ACTUAL IS NOT NULL ");
	IF LENGTH(VAR_PLANNING_UNIT_IDS)>0 THEN 
		SET @sqlString = CONCAT(@sqlString, "			AND spa.PLANNING_UNIT_ID IN (",VAR_PLANNING_UNIT_IDS,")");
    END IF;
	SET @sqlString = CONCAT(@sqlString, "		GROUP BY spa.PLANNING_UNIT_ID, spa.TRANS_DATE ");
	SET @sqlString = CONCAT(@sqlString, "	) a1 ON a1.TRANS_DATE BETWEEN SUBDATE(a.TRANS_DATE, interval @monthsPast MONTH) AND ADDDATE(a.TRANS_DATE, interval @monthsFuture MONTH) AND a.PLANNING_UNIT_ID=a1.PLANNING_UNIT_ID ");
	SET @sqlString = CONCAT(@sqlString, "	GROUP BY a.TRANS_DATE, a.PLANNING_UNIT_ID ");
    SET @sqlString = CONCAT(@sqlString, ") amc ON mn.MONTH=amc.TRANS_DATE AND ppu.PLANNING_UNIT_ID=amc.PLANNING_UNIT_ID ");
    SET @sqlString = CONCAT(@sqlString, "WHERE mn.MONTH BETWEEN @startDate AND @stopDate ");
	SET @sqlString = CONCAT(@sqlString, "ORDER BY ppu.PLANNING_UNIT_ID, mn.MONTH ");
	
    PREPARE S1 FROM @sqlString;
    EXECUTE S1;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `stockStatusReportVertical` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `stockStatusReportVertical`(VAR_START_DATE DATE, VAR_STOP_DATE DATE, VAR_PROGRAM_ID INT(10), VAR_VERSION_ID INT, VAR_PLANNING_UNIT_ID INT(10))
BEGIN
	-- %%%%%%%%%%%%%%%%%%%%%
    -- Report no 16
	-- %%%%%%%%%%%%%%%%%%%%%
	
    SET @startDate = VAR_START_DATE;
	SET @stopDate = VAR_STOP_DATE;
	SET @programId = VAR_PROGRAM_ID;
	SET @versionId = VAR_VERSION_ID;
	SET @planningUnitId = VAR_PLANNING_UNIT_ID;

	IF @versionId = -1 THEN
		SELECT MAX(pv.VERSION_ID) INTO @versionId FROM rm_program_version pv WHERE pv.PROGRAM_ID=@programId;
	END IF;
    
	SELECT 
        mn.MONTH `TRANS_DATE`, 
        sma.OPENING_BALANCE `FINAL_OPENING_BALANCE`, 
        IF(sma.ACTUAL, sma.ACTUAL_CONSUMPTION_QTY, sma.FORECASTED_CONSUMPTION_QTY) `CONSUMPTION_QTY`, 
        sma.ACTUAL,
        sma.SHIPMENT_QTY SQTY,
        sma.ADJUSTMENT_MULTIPLIED_QTY `ADJUSTMENT`,
        sma.EXPIRED_STOCK,
        sma.CLOSING_BALANCE `FINAL_CLOSING_BALANCE`,
        sma.AMC,
        sma.MOS `MoS`,
        sma.MIN_STOCK_MOS `MIN_MONTHS_OF_STOCK`,
        sma.MAX_STOCK_MOS `MAX_MONTHS_OF_STOCK`,
        sh.SHIPMENT_ID, sh.SHIPMENT_QTY, 
        fs.FUNDING_SOURCE_ID, fs.FUNDING_SOURCE_CODE, fs.LABEL_ID `FUNDING_SOURCE_LABEL_ID`, fs.LABEL_EN `FUNDING_SOURCE_LABEL_EN`, fs.LABEL_FR `FUNDING_SOURCE_LABEL_FR`, fs.LABEL_SP `FUNDING_SOURCE_LABEL_SP`, fs.LABEL_PR `FUNDING_SOURCE_LABEL_PR`, 
        ss.SHIPMENT_STATUS_ID, ss.LABEL_ID `SHIPMENT_STATUS_LABEL_ID`, ss.LABEL_EN `SHIPMENT_STATUS_LABEL_EN`, ss.LABEL_Fr `SHIPMENT_STATUS_LABEL_FR`, ss.LABEL_SP `SHIPMENT_STATUS_LABEL_SP`, ss.LABEL_PR `SHIPMENT_STATUS_LABEL_PR`
    FROM
        mn 
        LEFT JOIN rm_supply_plan_amc sma ON 
            mn.MONTH=sma.TRANS_DATE 
            AND sma.PROGRAM_ID = @programId
            AND sma.VERSION_ID = @versionId
            AND sma.PLANNING_UNIT_ID = @planningUnitId
        LEFT JOIN 
            (
            SELECT COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) `EDD`, s.SHIPMENT_ID, st.SHIPMENT_QTY , st.FUNDING_SOURCE_ID, st.SHIPMENT_STATUS_ID
            FROM 
                (
                SELECT s.SHIPMENT_ID, MAX(st.VERSION_ID) MAX_VERSION_ID FROM rm_shipment s LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID WHERE s.PROGRAM_ID=@programId AND st.VERSION_ID<=@versionId AND st.SHIPMENT_TRANS_ID IS NOT NULL GROUP BY s.SHIPMENT_ID 
            ) AS s 
            LEFT JOIN rm_shipment_trans st ON s.SHIPMENT_ID=st.SHIPMENT_ID AND s.MAX_VERSION_ID=st.VERSION_ID 
            WHERE 
                st.ACTIVE 
                AND st.SHIPMENT_STATUS_ID != 8 
                AND st.ACCOUNT_FLAG
                AND COALESCE(st.RECEIVED_DATE, st.EXPECTED_DELIVERY_DATE) BETWEEN @startDate AND @stopDate 
                AND st.PLANNING_UNIT_ID =@planningUnitId
        ) sh ON LEFT(sma.TRANS_DATE,7)=LEFT(sh.EDD,7)
        LEFT JOIN vw_funding_source fs ON sh.FUNDING_SOURCE_ID=fs.FUNDING_SOURCE_ID
        LEFT JOIN vw_shipment_status ss ON sh.SHIPMENT_STATUS_ID=ss.SHIPMENT_STATUS_ID
    WHERE
        mn.MONTH BETWEEN @startDate AND @stopDate
    ORDER BY mn.MONTH;
    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `warehouseCapacityReport` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`faspUser`@`%` PROCEDURE `warehouseCapacityReport`(VAR_REALM_COUNTRY_ID INT(10), VAR_PROGRAM_IDS VARCHAR(255))
BEGIN
	-- %%%%%%%%%%%%%%%%%%%%%
    -- Report no 7
	-- %%%%%%%%%%%%%%%%%%%%%
    
	-- RealmCountryId cannot be -1 it must be a valid RealmCountryId
    -- ProgramIds are a list of the Programs that you want to run the report for
    -- ProgramIds blank means you want to run it for all Programs
    -- List of all the Regions for the Programs selected and their capacity
    
	SET @realmCountryId = VAR_REALM_COUNTRY_ID;

	SET @sqlString = "";
    
    SET @sqlString = CONCAT(@sqlString, "SELECT ");
    SET @sqlString = CONCAT(@sqlString, "	rc.REALM_COUNTRY_ID, c.COUNTRY_CODE, c.COUNTRY_CODE2, c.LABEL_ID `COUNTRY_LABEL_ID`, c.LABEL_EN `COUNTRY_LABEL_EN`, c.LABEL_FR `COUNTRY_LABEL_FR`, c.LABEL_SP `COUNTRY_LABEL_SP`, c.LABEL_PR `COUNTRY_LABEL_PR`, ");
    SET @sqlString = CONCAT(@sqlString, "	p.PROGRAM_ID, p.PROGRAM_CODE, p.LABEL_ID `PROGRAM_LABEL_ID`, p.LABEL_EN `PROGRAM_LABEL_EN`, p.LABEL_FR `PROGRAM_LABEL_FR`, p.LABEL_SP `PROGRAM_LABEL_SP`, p.LABEL_PR `PROGRAM_LABEL_PR`, ");
    SET @sqlString = CONCAT(@sqlString, "	r.REGION_ID, r.LABEL_ID `REGION_LABEL_ID`, r.LABEL_EN `REGION_LABEL_EN`, r.LABEL_FR `REGION_LABEL_FR`, r.LABEL_SP `REGION_LABEL_SP`, r.LABEL_PR `REGION_LABEL_PR`, ");
    SET @sqlString = CONCAT(@sqlString, "	r.GLN, r.CAPACITY_CBM ");
    SET @sqlString = CONCAT(@sqlString, "FROM rm_realm_country rc ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_country c ON rc.COUNTRY_ID=c.COUNTRY_ID ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_program p ON rc.REALM_COUNTRY_ID=p.REALM_COUNTRY_ID ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN rm_program_region pr ON p.PROGRAM_ID=pr.PROGRAM_ID ");
    SET @sqlString = CONCAT(@sqlString, "LEFT JOIN vw_region r ON pr.REGION_ID=r.REGION_ID ");
    SET @sqlString = CONCAT(@sqlString, "WHERE rc.REALM_COUNTRY_ID=@realmCountryId ");
    IF LENGTH(VAR_PROGRAM_IDS)>0 THEN 
		SET @sqlString = CONCAT(@sqlString, " AND p.PROGRAM_ID IN (" , VAR_PROGRAM_IDS , ")");
    END IF;
    SET @sqlString = CONCAT(@sqlString, "ORDER BY c.COUNTRY_CODE, r.REGION_ID");
	PREPARE S1 FROM @sqlString;
    EXECUTE S1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-09-29 16:25:06
