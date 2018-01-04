browser chrome

1.All text starts http
all text which starts with http://or https:// will be hyperlink
eg. http://l but not http:// itself

2. normal http
for the normal common link http://
using the following code by
uncomment line 106	in message.php
comment line 104	in message.php

var link = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#//=]{2,256}[a-z]{0,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
