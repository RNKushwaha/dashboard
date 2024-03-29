<?php

/** Log all queries to SQL file (manual queries through SQL command are not logged)
* @link https://www.adminer.org/plugins/#use
* @author Jakub Vrana, https://www.vrana.cz/
* @license https://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0
* @license https://www.gnu.org/licenses/gpl-2.0.html GNU General Public License, version 2 (one or other)
*/
class AdminerSqlLog {
	/** @access protected */
	var $dir;
	var $filename;
	
	/**
	* @param string defaults to "$database.sql"
	*/
	function __construct($dir = "") {
		$this->dir = $dir;
	}
	
	function messageQuery($query, $time) {
		$this->_log($query);
	}

	function sqlCommandQuery($query) {
		$this->_log($query);
	}

	function _log($query) {
		$adminer = adminer();
		$this->filename = $this->dir.$adminer->database() . ".sql"; // no database goes to ".sql" to avoid collisions
		$fp = fopen($this->filename, "a");
		flock($fp, LOCK_EX);
		fwrite($fp, $query);
		fwrite($fp, "\n\n");
		flock($fp, LOCK_UN);
		fclose($fp);
	}
	
}
