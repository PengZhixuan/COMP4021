//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 200);     // The initial position of the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed
var GAME_TIME=100;
var GAME_INTERVAL = 25;                     // The time interval of running the game
var level = 0;


var BULLET_SIZE = new Size(10, 10); // The size of a bullet
var BULLET_SPEED = 10.0;            // The speed of a bullet

var SHOOT_INTERVAL = 200.0;         // The period when shooting is disabled
var canShoot = true;                // A flag indicating whether the player can shoot a bullet

var MONSTER_SIZE = new Size(40, 40); // The size of a monster

var goodthing_SIZE = new Size(40,40);  // The size of a goodthing
var DOOR_SIZE = new Size(40,40);    // The size of a door
//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum

var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var monShootTimeout = null;                 // The monster shoot interval
var zoom = 1.0;                             // The zoom level of the screen
var score = 0;                      // The score of the game
var cheatmode = false;
var gameclear = false;
var fl = false;                   //player direction 
var timeInterval;
var Username ="";


//
// The point and size class used in this program
//
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "N".charCodeAt(0):
            player.motion = motionType.LEFT;
            break;

        case "M".charCodeAt(0):
            player.motion = motionType.RIGHT;
            break;


        // Add your code here
        case "Z".charCodeAt(0):
            if(player.isOnPlatform()) {
                player.verticalSpeed = JUMP_SPEED;
            }
            break;

        case 32: // spacebar = shoot
            if (canShoot)
                shootBullet('player');
            break;

        case "C".charCodeAt(0):
                svgdoc.getElementById("cheat").style.setProperty("visibility", "visible", null);
                cheatmode = true;
            break;
            
        case "V".charCodeAt(0):
                svgdoc.getElementById("cheat").style.setProperty("visibility", "hidden", null);
                cheatmode = false;
            break;
    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "N".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "M".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}

//
// Helper function for checking intersection between two rectangles
//
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
        pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}

//
// This function removes all/certain nodes under a group
//
function cleanUpGroup(id, textOnly) {
    var node, next;
    var group = svgdoc.getElementById(id);
    node = group.firstChild;
    while (node != null) {
        next = node.nextSibling;
        if (!textOnly || node.nodeType == 3) // A text node
            group.removeChild(node);
        node = next;
    }
}

//
// The player class used in this program
//
function Player() {
    this.node = svgdoc.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
}



Player.prototype.isOnPlatform = function() {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
            ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
            (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y)
            {
                if (node.getAttribute('type') == 'disappearing') {
                var platformOpacity = parseFloat(node.style.getPropertyValue("opacity"));
                platformOpacity -= 0.1;
                node.style.setProperty("opacity", platformOpacity, null);
                if (platformOpacity <= 0.0) {
                    platforms.removeChild(node);
                }
            }
            return true;
        }
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) {
        return true;
    }

    return false;
}

Player.prototype.collidePlatform = function(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
    var verticalBar = svgdoc.getElementById("verticalPlatform");


    var verticalBarSpeed = parseInt(verticalBar.getAttribute("speed"));
    if(parseInt(verticalBar.getAttribute("y")) == player.position.y + PLAYER_SIZE.h
        && player.position.x + PLAYER_SIZE.w > parseInt(verticalBar.getAttribute("x"))
        && player.position.x < parseInt(verticalBar.getAttribute("x")) + parseInt(verticalBar.getAttribute("width")) ){

        player.position.y += verticalBarSpeed;
    }


    player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");


}

Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}
function createDisappearingPlatform(x, y, w, h) {
    
    var platform = svgdoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
    platform.setAttribute('type', 'disappearing');
    platform.setAttribute('x', x);
    platform.setAttribute('y', y);
    platform.setAttribute('width', w);
    platform.setAttribute('height', h);
    platform.style.setProperty('fill', 'brown', null);
    platform.style.setProperty('opacity', 1.0, null);
    svgdoc.getElementById('platforms').appendChild(platform);
}

//
//  This Function craete monster on graph
//
function createMonster() {
    //create monster at random place
    var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    var MONSTER_INIT_POS = new Point(Math.floor(Math.random()*520+40), Math.floor(Math.random()*480)+40);

    //avoid generate it near player
    while(intersect( MONSTER_INIT_POS, new Size(160,160), player.position, PLAYER_SIZE))
        MONSTER_INIT_POS = new Point(Math.floor(Math.random()*520+40), Math.floor(Math.random()*480)+40);

    monster.setAttribute("x", MONSTER_INIT_POS.x);
    monster.setAttribute("y", MONSTER_INIT_POS.y);

    if (svgdoc.getElementById("monsters").childNodes.length == 0)
    {
        monster.setAttribute("canShoot", true);
    }
    else
    {
        monster.setAttribute("canShoot", false);
    }

    var MONSTER_DEST_POS = new Point(Math.floor(Math.random()*520+40), Math.floor(Math.random()*480)+40);

    while(intersect( MONSTER_INIT_POS, new Size(160,160), player.position, PLAYER_SIZE))
        MONSTER_DEST_POS = new Point(Math.floor(Math.random()*520+50), Math.floor(Math.random()*480)+20);

    monster.setAttribute("Dx", MONSTER_DEST_POS.x);
    monster.setAttribute("Dy", MONSTER_DEST_POS.y);


    //console.log(MONSTER_DEST_POS.x);
    //console.log(MONSTER_DEST_POS.y);
    //move monster
    monster.setAttribute("turn",MONSTER_DEST_POS.x - MONSTER_INIT_POS.x >0? 1:0);
    monster.setAttribute("fl", MONSTER_DEST_POS.x - MONSTER_INIT_POS.x <0? 1:0);

    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    svgdoc.getElementById("monsters").appendChild(monster);

}


function creategoodthing(){
    var goodthing = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");

    var goodthingPos ;
    var find = false;
    var platforms = svgdoc.getElementById("platforms");

    while(!find){
        find = true;
        goodthingPos = new Point(Math.random()*560, Math.random()*520);

        //check collision with platform
        for (var i = 0; i < platforms.childNodes.length; i++) {
            var node = platforms.childNodes.item(i);
            if (node.nodeName != "rect") continue;

            var x = parseFloat(node.getAttribute("x"));
            var y = parseFloat(node.getAttribute("y"));
            var w = parseFloat(node.getAttribute("width"));
            var h = parseFloat(node.getAttribute("height"));
            var pos = new Point(x, y);
            var size = new Size(w, h);
            if (intersect(goodthingPos, new Size(40,40), pos, size)) {
                find = false
                break;
            }
        }
    }

    goodthing.setAttribute("x", goodthingPos.x);
    goodthing.setAttribute("y", goodthingPos.y);

    goodthing.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#goodthing");
    svgdoc.getElementById("goodthings").appendChild(goodthing);

}

//
// The function to load the SVG document
//
function load(evt) {
    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;
}

function zoomMode(){
    zoom = 2.0;
    startGame();
}

function normalMode(){
    zoom = 1.0;
    startGame();
}

//
// The function to get player's name
//
function Input(){
    Username = prompt("Enter your name ",Username);
    if(Username.length == 0 || Username == "null")
        Username = "Anonymous";
}





//
//The function to prepare object for a game level
//
function startGame(){
    //play background music
    bgm = new Audio("bgm.wav"); 
    bgm.volume = 0.4;;
    bgm.play();

    // Remove text nodes in the 'platforms' group
    cleanUpGroup("platforms", true);
    cleanUpGroup("monsters", false);
    cleanUpGroup("bullets", false);
    cleanUpGroup("goodthings", false);
    var gameArea = svgdoc.getElementById("game");
    gameArea.style.setProperty("visibility", "visible", null);
    //get platform group
    var platforms = svgdoc.getElementById("platforms");
    createDisappearingPlatform(390, 410, 40, 20);
    createDisappearingPlatform(0, 460, 80, 20);
    createDisappearingPlatform(0, 120, 100, 20);
    svgdoc.getElementById("door").style.setProperty("visibility", "visible", null);
     svgdoc.getElementById("bulletRemain").firstChild.data = 8;
    svgdoc.getElementById("score").firstChild.data = 0;
    svgdoc.getElementById("Level").firstChild.data = (++level);
    svgdoc.getElementById("TimeRemain").firstChild.data = GAME_TIME;
    if (level == 1 ){
        Input();
    }
    // Create the player
    player = new Player();
    
    for(var i=0; i<1 ; ++i)
        creategoodthing();
    
    for(var i=0; i< 6 + parseInt(svgdoc.getElementById("Level").firstChild.data-1) * 4; ++i)
        createMonster();

    // Start the game interval
    gameclear = false;
    svgdoc.getElementById("verticalPlatform").setAttribute("speed",2);
    svgdoc.getElementById("TimeRemain").firstChild.data = 100;
    svgdoc.getElementById("bulletRemain").firstChild.data = 8;
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
    setTimeout("setUpInterval()", 2000);
    monShootTimeout = setTimeout("shootBullet('monster')", 5000);
}


function setUpInterval() {
    // Attach keyboard events
    svgdoc.documentElement.addEventListener("keydown", keydown, false);
    svgdoc.documentElement.addEventListener("keyup", keyup, false);
    timeInterval = setTimeout("decreaseTime()", 1000);
}


function decreaseTime(){
    svgdoc.getElementById("TimeRemain").firstChild.data = parseInt(svgdoc.getElementById("TimeRemain").firstChild.data) -1;
    if(parseInt(svgdoc.getElementById("TimeRemain").firstChild.data) == 0)
    {
        gameover();
    }
    timeInterval = setTimeout("decreaseTime()",1000);
    var green_bar = svgdoc.getElementById("time_bar");
    var bar_width = parseFloat(green_bar.getAttribute("width"));
    green_bar.setAttribute("width", 140 * ( parseInt(svgdoc.getElementById("TimeRemain").firstChild.data) / GAME_TIME)) ;

}

//
// This function updates the position and motion of the player in the system
//
function gamePlay() {

    collisionDetection();
    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();

    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT){
        fl = true;
        player.node.setAttribute("transform","translate(" + PLAYER_SIZE.w + ", 0) scale(-1, 1)");
        displacement.x = -MOVE_DISPLACEMENT;
    }
    if (player.motion == motionType.RIGHT){
        fl = false;
        displacement.x = MOVE_DISPLACEMENT;
    }

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }


    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;


    player.collidePlatform(position);
    player.collideScreen(position);

  
    player.position = position;


    moveBullets();
    moveMonsters();
    updateScreen();
}

//
// The function check collision of objects
//
function collisionDetection() {

    //Check whether the player touches port 1
    if(intersect(new Point(335,0),new Size(50,10), player.position, PLAYER_SIZE))
    {
        player.position.x = 385;
        player.position.y = 440;
        player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
    }
    
    //Check whether the player touches port 2
    if(intersect(new Point(385,540),new Size(80,10), player.position, PLAYER_SIZE))
    {
        player.position.x = 335;
        player.position.y = 10;
        player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
    }
    
    // Check whether the player collides with a monster
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);

        // For each monster check if it overlaps with the player
        // if yes, stop the game
        if(intersect(new Point(monster.getAttribute("x"),monster.getAttribute("y")),MONSTER_SIZE, player.position, PLAYER_SIZE) &&!cheatmode)
        {
            gameover();
        }
    }

    // Check whether a bullet hits a monster
    var bullets = svgdoc.getElementById("bullets");
    for (var j = 0; j < bullets.childNodes.length; j++) {
        var bullet = bullets.childNodes.item(j);

        if(bullet.getAttribute("id")!="monBullet"){
            for (var i = 0; i < monsters.childNodes.length; i++) {
                var monster = monsters.childNodes.item(i);
                var mon = new Point(monster.getAttribute("x"),monster.getAttribute("y"));
                var bul = new Point(bullet.getAttribute("x"),bullet.getAttribute("y"));
                if(intersect(mon,MONSTER_SIZE, bul, BULLET_SIZE)){
                    score = parseInt(svgdoc.getElementById("score").firstChild.data);
                    score += 10 * zoom;
                    svgdoc.getElementById("score").firstChild.data = score;
                    monsters.removeChild(monster);
                    bullets.removeChild(bullet);
                    var msdead = new Audio("msdead.mp3");
                    playSound(msdead);
                }
            }
        }
        else
        {
            var bul = new Point(bullet.getAttribute("x"),bullet.getAttribute("y"));
            if(intersect(bul, BULLET_SIZE,player.position, PLAYER_SIZE) && !cheatmode){
                gameover();
            }    
            
        }
    }
    
    //Check whether a good is taken
    var goodthings = svgdoc.getElementById("goodthings");
    for (var i = 0; i < goodthings.childNodes.length; i++) {
        var goodthing = goodthings.childNodes.item(i);

        // For each good check if it overlaps with the player
        // if yes, collect teh good
        var x = parseInt(goodthing.getAttribute("x"));
        var y = parseInt(goodthing.getAttribute("y"));

        if (intersect(new Point(x,y), goodthing_SIZE, player.position, PLAYER_SIZE) ) {
            score = parseInt(svgdoc.getElementById("score").firstChild.data);
            score += 5 * zoom;
            svgdoc.getElementById("score").firstChild.data = score;
            goodthing.parentNode.removeChild(goodthing);
        }
    }
    if(goodthings.childNodes.length == 0){
        gameclear = true;
        svgdoc.getElementById("door").style.setProperty("visibility", "visible", null);
    }

    //check move to next level
    var door = svgdoc.getElementById("door");
    var x = parseInt(door.getAttribute("x"));
    var y = parseInt(door.getAttribute("y"));
    // console.log(svgdoc.getElementById("door"));
    // console.log(y);

    if (intersect(new Point(x,y), DOOR_SIZE, player.position, PLAYER_SIZE) && gameclear)
    {
        var exit = new Audio("exit.mp3");
        play(exit);
        nextLevel();
    }

}

//
// This Function moves the bullet
//
function moveBullets() {
    // Go through all bullets
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        // Update the position of the bullet
        node.setAttribute("x",parseInt(node.getAttribute("x")) + parseInt(node.getAttribute("speed")));
        // If the bullet is not inside the screen delete it from the group
        if(node.getAttribute("x") < 0 || node.getAttribute("x") > SCREEN_SIZE.w ||node.getAttribute("y") <0 || node.getAttribute("y") > SCREEN_SIZE.h){
            if(node.getAttribute("id")=="monBullet"){
                monShootTimeout = setTimeout("shootBullet('monster')", 2000);
            }
            bullets.removeChild(node);
        }
    }
}

//
// This function move the monster
//
function moveMonsters(){

    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var node = monsters.childNodes.item(i);
        node.setAttribute("turn", false);

        if( parseInt(node.getAttribute("x")) == parseInt(node.getAttribute("Dx")) && parseInt(node.getAttribute("y"))  == parseInt(node.getAttribute("Dy")) ){

            var MONSTER_DEST_POS = new Point(Math.floor(Math.random()*520+40), Math.floor(Math.random()*480)+40);
            node.setAttribute("Dx", MONSTER_DEST_POS.x);
            node.setAttribute("Dy", MONSTER_DEST_POS.y);

            var check = MONSTER_DEST_POS.x - parseInt(node.getAttribute("x")) <0? 1:0;
            if(check != parseInt(node.getAttribute("fl"))){
                node.setAttribute("turn", true);
                node.setAttribute("fl",check);
            }
        }
        else if( parseInt(node.getAttribute("x"))== parseInt(node.getAttribute("Dx")) && parseInt(node.getAttribute("y"))  != parseInt(node.getAttribute("Dy")) ){
            var y_displacement = 1;
            if(parseInt(node.getAttribute("y")) > parseInt(node.getAttribute("Dy")))
                y_displacement *= -1;
            node.setAttribute("y", parseInt(node.getAttribute("y")) + y_displacement);
        }
        else if( parseInt(node.getAttribute("x"))!= parseInt(node.getAttribute("Dx")) && parseInt(node.getAttribute("y"))  == parseInt(node.getAttribute("Dy")) ){
            var x_displacement = 1;
            if(parseInt(node.getAttribute("fl")))
                x_displacement *= -1;
            node.setAttribute("x", parseInt(node.getAttribute("x")) + x_displacement);
        }
        else{
            var y_displacement = 1;
            if(parseInt(node.getAttribute("y")) > parseInt(node.getAttribute("Dy")))
                y_displacement *= -1;
            node.setAttribute("y", parseInt(node.getAttribute("y")) + y_displacement);

            var x_displacement = 1;
            if(parseInt(node.getAttribute("fl")))
                x_displacement *= -1;
            node.setAttribute("x", parseInt(node.getAttribute("x")) + x_displacement);

        }
    }
}

//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {

    //decide speed of the vertical platform
    var verticalBar = svgdoc.getElementById("verticalPlatform");
    if(parseInt(verticalBar.getAttribute("y")) == 520 )
        verticalBar.setAttribute("speed", -2 );
    else if(parseInt(verticalBar.getAttribute("y")) == 80)
        verticalBar.setAttribute("speed", 2 );
    
    
        //Transform the platform
    verticalBar.setAttribute("y", parseInt(verticalBar.getAttribute("speed")) + parseInt(verticalBar.getAttribute("y")) );

    //flip the player
    if(fl)
        player.node.setAttribute("transform","translate(" + (player.position.x + PLAYER_SIZE.w)  + "," + player.position.y + ") scale(-1, 1)");
    //update name position with player
    svgdoc.getElementById("nameBar").firstChild.data = Username;
    svgdoc.getElementById("nameBar").setAttribute("x", player.position.x + PLAYER_SIZE.w/2);
    svgdoc.getElementById("nameBar").setAttribute("y", player.position.y);

    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < svgdoc.getElementById("monsters").childNodes.length; i++) {
        var node = monsters.childNodes.item(i);
        if(node.getAttribute("turn")){
            if(parseInt(node.getAttribute("fl"))){
                var temp_x = parseInt(node.getAttribute("x"));
                /* var temp_y = parseInt(node.getAttribute("y")); */
                node.setAttribute("transform","translate(" + (2*temp_x + MONSTER_SIZE.w)  + "," + 0 + ") scale(-1, 1)");
            }
            else
                node.setAttribute("transform","");
            node.setAttribute("turn",false);
        }
    }
    
    //update the score
    svgdoc.getElementById("score").firstChild.data = score;
    
    // Calculate the scaling and translation factors
        var scale = new Point(zoom,zoom);
        var translate = new Point();
    
        translate.x= SCREEN_SIZE.w / 2.0 - (player.position.x + PLAYER_SIZE.w / 2)*scale.x;
        if(translate.x>0)
            translate.x=0;
        else if (translate.x < SCREEN_SIZE.w - SCREEN_SIZE.w*scale.x)
            translate.x = SCREEN_SIZE.w - SCREEN_SIZE.w*scale.x;
    
        translate.y= SCREEN_SIZE.h / 2.0 - (player.position.y + PLAYER_SIZE.h / 2)*scale.y;
        if(translate.y>0)
            translate.y=0;
        else if (translate.y < SCREEN_SIZE.h - SCREEN_SIZE.h*scale.y)
            translate.y = SCREEN_SIZE.h - SCREEN_SIZE.h*scale.y;
    
        svgdoc.getElementById("gamearea").setAttribute("transform", "translate(" + translate.x + ", " + translate.y + ") scale(" + scale.x + "," + scale.y + ")");
}

//
// This Function control the bullet can be shoot or not, if can, create bullet
//
function shootBullet(source) {
    var shoot = new Audio("shoot.mp3");
    playSound(shoot);
    if(source =="player"&&(parseInt(svgdoc.getElementById("bulletRemain").firstChild.data)>0 || cheatmode))
    {
    
        // Disable shooting for a short period of time
        canShoot = false;
        setTimeout("canShoot = true", SHOOT_INTERVAL);

        // Create the bullet by creating a use node
        var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");

        // Calculate and set the position of the bullet
        bullet.setAttribute("x", player.position.x+ PLAYER_SIZE.w/2);
        bullet.setAttribute("y", player.position.y+ PLAYER_SIZE.h/2);
        bullet.setAttribute("speed",fl? -BULLET_SPEED:BULLET_SPEED);
        // Set the href of the use node to the bullet defined in the defs node
        bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");

        // Append the bullet to the bullet group
        svgdoc.getElementById("bullets").appendChild(bullet);

        if(!cheatmode){
            svgdoc.getElementById("bulletRemain").firstChild.data -= 1;
        }
    }
    else if (source == "monster") {
        var mshoot = new Audio("mshoot.wav");
        mshoot.play();
        
        var monsters = svgdoc.getElementById("monsters").childNodes.item(0);
        if (monsters != null && (monsters.getAttribute("canShoot")== "true")) 
        {

            var monBullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");

            monBullet.setAttribute("id", "monBullet");
            
            monBullet.setAttribute("x", parseInt(monsters.getAttribute("x")) + parseInt(MONSTER_SIZE.w/2));
            monBullet.setAttribute("y", parseInt(monsters.getAttribute("y")) + parseInt(MONSTER_SIZE.h / 2));
            
            monBullet.setAttribute("speed", (monsters.getAttribute("fl") == 1)? -BULLET_SPEED:BULLET_SPEED);
                    

            monBullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monBullet");
                

            svgdoc.getElementById("bullets").appendChild(monBullet);
        }
    }
}

function nextLevel(){
    score = parseInt(svgdoc.getElementById("score").firstChild.data);
    score+=level*100+svgdoc.getElementById("TimeRemain").firstChild.data*2;
    svgdoc.getElementById("score").firstChild.data = score;
    clearInterval(gameInterval);
    clearTimeout(timeInterval);
    clearTimeout(monShootTimeout);
    var table = getHighScoreTable();

    // Create the new score record
    // console.log(Username);
    var record = new ScoreRecord(Username, score);

    // Insert the new score record
    var pos = table.length;
    for (var j = 0; j < table.length; j++) {
        if (record.score > table[j].score) {
            pos = j;
            break;
        }
    }
    table.splice(pos, 0, record);

    setHighScoreTable(table);

    // Show the high score table
    showHighScoreTableN(table, pos);

}

function gameover(){
    clearInterval(gameInterval);
    clearTimeout(timeInterval);
    clearTimeout(monShootTimeout);
    var table = getHighScoreTable();

    // Create the new score record
    // console.log(Username);
    var record = new ScoreRecord(Username, score);

    // Insert the new score record
    var pos = table.length;
    for (var j = 0; j < table.length; j++) {
        if (record.score > table[j].score) {
            pos = j;
            break;
        }
    }
    table.splice(pos, 0, record);
    // Store the new high score table
    setHighScoreTable(table);

    // Show the high score table
    showHighScoreTable(table, pos);
    bgm.pause();
    var dead = new Audio("pdead.wav");
    playSound(dead);
}

function con(){
    var node = svgdoc.getElementById("highscoretable2");
    node.style.setProperty("visibility", "hidden", null);
    startGame();
}

function replay(){
    var bullets = svgdoc.getElementById("bullets");

        cleanUpGroup("goodthings", false);
    cleanUpGroup("monsters", false);
    cleanUpGroup("bullets", false);
    cleanUpGroup("highscoretext", false);
    svgdoc.getElementById("door").style.setProperty("visibility", "visible", null);
    svgdoc.getElementById("highscoretable").style.setProperty("visibility", "hidden", null);
    svgdoc.getElementById("score").firstChild.data = score;
    level=0;
    Username="";
    startGame();
}
function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}









