<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of VoterToolsServices
 *
 * @author jam
 */
include_once 'conf/Connection.php';
include_once 'Database.php';
include_once 'Table.php';

class ContactManagerServices extends Connection {
    //put your code here
    private $params;
    public $request;
    function __construct() {
        parent::__construct();
    }
    public function invokeMethod($params) {
        // return $sth->fetchAll(PDO::FETCH_OBJ);        
        ob_start('ob_gzhandler');
        $this->params = $params;
        if (isset($this->params['method'])) {
            if (isset($this->params['params'])) {
                $this->request = json_decode($this->params['params']);
                error_log("REQUEST: ".var_export($this->request,true));
            } else {
                error_log("NO PARAMETERS");
            }
            header('Content-type: application/json');
            switch($this->params["method"]) {
                case "someMethod":
                    echo json_encode((object) array('status' => $this->showDatabases()));
                    break;
                case "showDatabases":
                    echo json_encode((object) array('databases' => $this->showDatabases()));
                    break;
                case "getDatabaseTables":
                    echo json_encode((object) array('tables' => $this->getDatabaseTables($this->request->databaseName)));
                    break;
                case "getColumnsFromTable":
                    echo json_encode((object) array('columns' => $this->getColumnsFromTable($this->request->databaseName,$this->request->tableName)));
                    break;
                case "getSearchOptions":
                    echo json_encode((object) array(
                        'counties' => $this->getRows("FloridaVoterCodes","County Codes",$this->request->conditions=array())->fetchAll(PDO::FETCH_OBJ),
                        'genders' => $this->getRows("FloridaVoterCodes","Gender Codes",$this->request->conditions=array())->fetchAll(PDO::FETCH_OBJ),
                        'races' => $this->getRows("FloridaVoterCodes","Race Codes",$this->request->conditions=array())->fetchAll(PDO::FETCH_OBJ),
                        'parties' => $this->getRows("FloridaVoterCodes","Party Codes",$this->request->conditions=array())->fetchAll(PDO::FETCH_OBJ),
                        'statuses' => $this->getRows("FloridaVoterCodes","Voter Status Codes",$this->request->conditions=array())->fetchAll(PDO::FETCH_OBJ),
                        'voterColumns' => $this->getColumnsFromTable("FloridaVoterData","Voters")
                    ));                    
                    break;
                case "getRows":
                    ini_set('memory_limit', '4000M');
                    echo json_encode((object) array('rows' => $this->getRows($this->request->databaseName,$this->request->tableName,$this->request->conditions=array())->fetchAll(PDO::FETCH_OBJ)));
//                    $row = $this->getRows($this->request->databaseName,$this->request->tableName,$this->request->conditions=array())->fetch(PDO::FETCH_OBJ, PDO::FETCH_ORI_NEXT);
//                    echo json_encode((object) array('rows' => $this->getRows($this->request->databaseName,$this->request->tableName,$this->request->conditions=array())));                    
//                    
//                    echo json_encode((object) array('rows' => $this->getRows($this->request->databaseName,$this->request->tableName,$this->request->conditions=array())));                    
                    break;
                case "getSearchRows":
                    ini_set('memory_limit', '4000M');
                    // error_log("REQUEST: ".var_export($this->request));
                    echo json_encode((object) array('rows' => $this->getSearchRows("FloridaVoterData","Voters",$this->request)->fetchAll(PDO::FETCH_OBJ)));                    
                    break;
                case "getContactTypes":
                    echo json_encode((object) array('types' => $this->getRows("FloridaVoterData","Contact Types",$this->request)->fetchAll(PDO::FETCH_OBJ)));                    
                    break;
                case "getContacts":
                    // error_log($this->request->contactType);
                    // error_log(var_export($this->request,true));
                    echo json_encode((object) array('contacts' => $this->getContacts($this->request->contactType)->fetchAll(PDO::FETCH_OBJ)));                    
                    break;
            }
            exit;
        }
    }
    private function getContacts($contactType="") {
        $SQL="SELECT * FROM `FloridaVoterData`.`Contacts`";
        if($contactType != "") {
             $SQL = $SQL." WHERE `Contact ID` IN(SELECT `Contact ID` FROM `FloridaVoterData`.`Contact Type Members` WHERE `Contact Type`=:contactType)";
        }
        $sth = $this->dbh->prepare($SQL,array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
        ($contactType == "")?$sth->execute():$sth->execute(array(":contactType" => $contactType));
        return $sth;        
    }
    private function showDatabases() {
        $databases = array();
        $sth = $this->dbh->prepare("SHOW DATABASES");
        $sth->execute();
        foreach($sth->fetchAll(PDO::FETCH_OBJ) as $database) {
            if(!in_array($database->Database, array("mysql","information_schema","performance_schema"))) {
                $databases[] = (object) array(
                    "name"=>$database->Database,
                    "tables"=>$this->getDatabaseTables($database->Database)
                );
            }
        }        
        return $databases;
    }
    private function getDatabaseTables($databaseName) {
        $tables = array();
        $sth = $this->dbh->prepare("SHOW TABLES FROM ".$databaseName);
        $sth->execute();
        foreach($sth->fetchAll(PDO::FETCH_OBJ) as $table) {
            $tables[] = (object) array(
                "name" => $table->{"Tables_in_".$databaseName},
                "columns" => $this->getColumnsFromTable(
                    $databaseName, 
                    $table->{"Tables_in_".$databaseName}
                )
            );
        }
        return $tables;
    }
    private function getColumnsFromTable($databaseName,$tableName) {
        $sth = $this->dbh->prepare("SHOW COLUMNS FROM `".$databaseName."`.`".$tableName."`");
        $sth->execute();
        return $sth->fetchAll(PDO::FETCH_OBJ);
    }
    private function getRows($databaseName,$tableName,$conditions=array()) {
        ini_set('max_execution_time', 1500); //300 seconds = 5 minutes
        $SQL="SELECT * FROM `".$databaseName."`.`".$tableName."`";
        $sth = $this->dbh->prepare($SQL,array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
        $sth->execute();
        // ini_set('memory_limit', '2000M');
        // return $sth->fetchAll(PDO::FETCH_OBJ);
        return $sth;
    }
    private function getSearchRows($databaseName,$tableName,$conditions=array()) {
        ini_set('max_execution_time', 1500); //300 seconds = 5 minutes
        $SQL="SELECT * FROM `".$databaseName."`.`".$tableName."`";
        if(in_array("Voter ID",$conditions)) {
            $SQL = $SQL." WHERE `Voter ID`=:voterId";
            $sth = $this->dbh->prepare($SQL,array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
            $sth->execute(array(':voterId' => $conditions["Voter ID"]));
            return $sth;
        } else {
            $prevalues=array();
            $sqlwhere=array();
            foreach($conditions as $key => $value) {
                switch($key) {
                    case "first":
                        $prevalues = array_merge($prevalues,array(":".$key => "%".$value."%"));
                        $sqlwhere[] = "(`Name First` LIKE :first)";
                        break;
                    case "middle":
                        $prevalues = array_merge($prevalues,array(":".$key => "%".$value."%"));
                        $sqlwhere[] = "(`Name Middle` LIKE :middle)";
                        break;
                    case "last":
                        $prevalues = array_merge($prevalues,array(":".$key => "%".$value."%"));
                        $sqlwhere[] = "(`Name Last` LIKE :last)";
                        break;
                    case "gender":
                        $prevalues = array_merge($prevalues,array(":".$key => $value));
                        $sqlwhere[] = "(`Gender` = :gender)";
                        break;
                    case "race":
                        $prevalues = array_merge($prevalues,array(":".$key => $value));
                        $sqlwhere[] = "(`Race` = :race)";
                        break;
                    case "county":
                        $prevalues = array_merge($prevalues,array(":".$key => $value));
                        $sqlwhere[] = "(`County Code` = :county)";
                        break;
                    case "address":
                        $prevalues = array_merge($prevalues,array(":".$key => "%".$value."%"));
                        $sqlwhere[] = "(`Residence Address Line 1` LIKE :address OR `Residence Address Line 2` LIKE :address OR `Mailing Address Line 1` LIKE :address OR `Mailing Address Line 2` LIKE :address OR `Mailing Address Line 3` LIKE :address)";
                        break;
                    case "city":
                        $prevalues = array_merge($prevalues,array(":".$key => "%".$value."%"));
                        $sqlwhere[] = "(`Residence City USPS` LIKE :city OR `Mailing City` LIKE :city)";
                        break;
                    case "zip":
                        $prevalues = array_merge($prevalues,array(":".$key => "%".$value."%"));
                        $sqlwhere[] = "(`Residence Zipcode` LIKE :zip OR `Mailing Zipcode` LIKE :zip)";
                        break;
                    case "party":
                        $prevalues = array_merge($prevalues,array(":".$key => $value));
                        $sqlwhere[] = "(`Party Affiliation` = :party)";
                        break;
                    case "status":
                        $prevalues = array_merge($prevalues,array(":".$key => $value));
                        $sqlwhere[] = "(`Voter Status` = :status)";
                        break;
                    case "congressionalDistrict":
                        $prevalues = array_merge($prevalues,array(":".$key => "%".$value."%"));
                        $sqlwhere[] = "(`Congressional District` LIKE :congressionalDistrict)";
                        break;
                    case "houseDistrict":
                        $prevalues = array_merge($prevalues,array(":".$key => "%".$value."%"));
                        $sqlwhere[] = "(`House District` LIKE :houseDistrict)";
                        break;
                    case "senateDistrict":
                        $prevalues = array_merge($prevalues,array(":".$key => "%".$value."%"));
                        $sqlwhere[] = "(`Senate District` LIKE :senateDistrict)";
                        break;
                    case "countyCommissionDistrict":
                        $prevalues = array_merge($prevalues,array(":".$key => "%".$value."%"));
                        $sqlwhere[] = "(`County Commission District` LIKE :countyCommissionDistrict)";
                        break;
                    case "schoolBoardDistrict":
                        $prevalues = array_merge($prevalues,array(":".$key => "%".$value."%"));
                        $sqlwhere[] = "(`School Board District` LIKE :schoolBoardDistrict)";
                        break;
                    case "precinct":
                        $prevalues = array_merge($prevalues,array(":".$key => "%".$value."%"));
                        $sqlwhere[] = "(`Precinct` LIKE :precinct)";
                        break;
                    case "precinctGroup":
                        $prevalues = array_merge($prevalues,array(":".$key => "%".$value."%"));
                        $sqlwhere[] = "(`Precinct Group` LIKE :precinctGroup)";
                        break;
                    case "precinctSplit":
                        $prevalues = array_merge($prevalues,array(":".$key => "%".$value."%"));
                        $sqlwhere[] = "(`Precinct Split` LIKE :precinctSplit)";
                        break;
                    case "precinctSuffix":
                        $prevalues = array_merge($prevalues,array(":".$key => "%".$value."%"));
                        $sqlwhere[] = "(`Precinct Suffix` LIKE :precinctSuffix)";
                        break;                    
                }
            }
            error_log($SQL." WHERE ".implode(" AND ",$sqlwhere));
            $sth = $this->dbh->prepare($SQL." WHERE ".implode(" AND ",$sqlwhere),array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
            $sth->execute($prevalues);
            // ini_set('memory_limit', '2000M');
            // return $sth->fetchAll(PDO::FETCH_OBJ);
            return $sth;            
        }
    }
}

?>
