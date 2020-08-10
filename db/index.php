<?php
function adminer_object() {
    // required to run any plugin
    include_once "./plugins/plugin.php";

    // autoloader
    foreach (glob("plugins/*.php") as $filename) {
        include_once "./$filename";
    }

    $plugins = array(
        // specify enabled plugins here
        new AdminerDumpXml,
        new AdminerDumpBz2,
        new AdminerDumpDate,
        new AdminerEditCalendar,
        new AdminerStructComments,
        new AdminerTablesFilter,
        new AdminerSqlLog('./plugins/logs/'),
        // new AdminerTinymce,
        new AdminerFileUpload("data/"),
        new AdminerSlugify,
        new AdminerForeignSystem,
        new AdminerTableHeaderScroll,
    );

    // It is possible to combine customization and plugins:
    class AdminerSoftware extends Adminer {
        function login($login, $password) {
            global $jush;
            if ($jush == "sqlite")
                return ($login === 'root') && ($password === 'admin');
            return true;
        }
        function databases($flush = true) {
            if (isset($_GET['sqlite']))
                return ["/database.db"];
            return get_databases($flush);
        }
    }
    // enable it for sqlite database
    // return new AdminerSoftware;

    return new AdminerPlugin($plugins);
}

// include original Adminer or Adminer Editor
include "plugins/adminer.php";
?>