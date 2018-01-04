<?php 

require_once('xmlHandler.php');

if (!isset($_COOKIE["name"])) {
    header("Location: error.html");
    exit;
}




// create the chatroom xml file handler
$xmlh = new xmlHandler("chatroom.xml");
if (!$xmlh->fileExist()) {
    header("Location: error.html");
    exit;
}
//clear
$xmlh->openFile();
$users_element = $xmlh->getElement("users");
$messages_element = $xmlh->getElement("messages");
while ($xmlh->getElement("user")){
$xmlh->removeElement($users_element, $xmlh->getElement("user"));
}
while ($xmlh->getElement("message")){
$xmlh->removeElement($messages_element, $xmlh->getElement("message"));
}
// save the XML file
$xmlh->saveFile();

// ??unfinished
$name="";
setcookie("name","");
echo "<script>
	window.parent.frames['message'].document.getElementById('username').setAttribute('value','');
	window.parent.location.reload();
	</script>";
	


?>
