<?php 

if(isset($_POST) && !empty($_POST['content'])){
    $fp = fopen("prog.php", "w") or die("Unable to open file!");
    fwrite($fp, $_POST['content']);
    fclose($fp);
}

