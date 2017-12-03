/*
* Benjamin Abdipour, University of Washington Tacoma
*/

// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (/* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function GameEngine() {
    this.entities = [];
    this.showOutlines = false;
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    //addd
    this.muteBoolean = false;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;

    //initializing the game timer
    this.gameTimer = 90;
    //add
    this.rect = {
        x: 45,
        y: 590,
        width: 70,
        height: 40
        	// ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
			// ctx.fillRect(45, 590, 70, 40); 
    };
    //add

//     var ctx = canvas.getContext("2d");  
// ctx.fillStyle = "Black"; ctx.strokeStyle = "Black"; 
//    ctx.fillRect(100, 110, 100, 100); 
   
// ctx.beginPath(); ctx.arc(5,5,2,0,2*Math.PI); ctx.fill(); ctx.stroke(); 
//   ctx.beginPath(); ctx.moveTo(1,1); ctx.lineTo(2,1); ctx.stroke();


    this.startInput();
    this.timer = new Timer();
    console.log('game initialized');
}

//add
function getMousePos(ctx, event) {
    rect = ctx.canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}
//add
//Function to check whether a point is inside a rectangle
function isInside(pos, rect) {
    return pos.x > rect.x && pos.x < rect.x + rect.width && pos.y < rect.y + rect.height && pos.y > rect.y
}

///////////////////////////

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();

    //START OF TIMER
    //updating game timer
    function startTimer() {
        setInterval(function () {
            if (that.gameTimer > 0) {
                that.gameTimer -= 1;
            }
        }, 1000)
    };
    startTimer();
    //END OF TIMER
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');
    var that = this;


    this.ctx.canvas.addEventListener('click', function (evt) {
        var mousePos = getMousePos(that.ctx, evt);

        if (isInside(mousePos, that.rect)) {
            if (that.muteBoolean == true) {
                that.muteBoolean = false;
            } else {
                that.muteBoolean = true;
            }
        }
    }, false);

    this.ctx.canvas.addEventListener("keydown", function (e) {
        if (String.fromCharCode(e.which) === ' ') that.space = true;
        else if (String.fromCharCode(e.which) === 'D') that.punch = true;
        else if (String.fromCharCode(e.which) === 'S') that.kick = true;
        else if (String.fromCharCode(e.which) === "'") { that.playerLeft = false; that.playerRight = true; that.walk = true; }
        else if (String.fromCharCode(e.which) === "%") { that.playerLeft = true; that.playerRight = false; that.walk = true; }
        e.preventDefault();
        // console.log(String.fromCharCode(e.which));
    }, false);

    this.ctx.canvas.addEventListener("keyup", function (e) {
        if (String.fromCharCode(e.which) === "'" || String.fromCharCode(e.which) === "%") that.walk = false;
        e.preventDefault();
        // console.log("up" + String.fromCharCode(e.which));
    }, false);

    console.log('Input started');
}

GameEngine.prototype.addEntity = function (entity) {
    console.log('added entity');
    this.entities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.space = null;
    this.punch = null;
    this.kick = null;
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {

    //START OF drawing frame on rectangles for Health Bar 
    this.game.ctx.fillStyle = "#FF0000";
    this.game.ctx.fillRect(840, 0, 1 * 140, 25);
    this.game.ctx.fillRect(20, 0, 1 * 140, 25);

    if (this.game.entities[1].hp > 0) {
        this.game.ctx.fillStyle = "#00FF00";
        //Health bar Player two on the right
        this.game.ctx.fillRect(20, 0, (this.game.entities[1].hp / 100) * 140, 25);
    }
    if (this.game.entities[0].hp > 0) {
        //Health bar Player one on the left
        this.game.ctx.fillRect(840, 0, (this.game.entities[0].hp / 100) * 140, 25);
    }

    this.game.ctx.lineWidth = "5";
    this.game.ctx.strokeStyle = "white";
    this.game.ctx.strokeRect(20, 0, 1 * 140, 25);

    this.game.ctx.lineWidth = "5";
    this.game.ctx.strokeStyle = "white";
    this.game.ctx.strokeRect(840, 0, 1 * 140, 25);
    //END of Rectangles of Health Bar

    //START text of characters' names with frames 
    this.game.ctx.font = '400 38px Eagle Lake';
    this.game.ctx.strokeStyle = "#FF0000";
    this.game.ctx.strokeText(this.game.entities[1].name, 18, 70);
    this.game.ctx.fillStyle = "#FFFFFF";
    this.game.ctx.fillText(this.game.entities[1].name, 18, 70);
    this.game.ctx.strokeStyle = "#FF0000";
    this.game.ctx.strokeText(this.game.entities[0].name, 840, 70);
    this.game.ctx.fillText(this.game.entities[0].name, 840, 70);
    //END of creating names of characters

    //Drawing the timer in the center of canvas
    this.game.ctx.font = '900 90px Eagle Lake';
    this.game.ctx.fillStyle = "#FFFF00";
    this.game.ctx.strokeText(this.game.gameTimer, this.game.surfaceWidth / 2 - 30, 80);
    this.game.ctx.fillText(this.game.gameTimer, this.game.surfaceWidth / 2 - 30, 80);
    //End of drawing timer



    this.game.ctx.font = '900 100px Eagle Lake';

    if ((this.game.entities[0].hp == this.game.entities[1].hp) && this.game.gameTimer == 0) {
        this.game.ctx.strokeText("Tied", this.game.surfaceWidth / 2 - 230, 350);
        this.game.ctx.fillText("Tied", this.game.surfaceWidth / 2 - 230, 350);
    } else {
        if (this.game.gameTimer == 0) {
            if (this.game.entities[0].hp > this.game.entities[1].hp) {
                this.game.ctx.strokeText(this.game.entities[0].name + " wins", this.game.surfaceWidth / 2 - 30 - 230, 350);
                this.game.ctx.fillText(this.game.entities[0].name + " wins", this.game.surfaceWidth / 2 - 30 - 230, 350);
            } else {
                this.game.ctx.strokeText(this.game.entities[1].name + " wins", this.game.surfaceWidth / 2 - 30 - 230, 350);
                this.game.ctx.fillText(this.game.entities[1].name + " wins", this.game.surfaceWidth / 2 - 30 - 230, 350);
            }

        } else {
            if (this.game.entities[1].isTimeOut) {
                this.game.gameTimer = 0;
            }

        }
    }

    //drawing button
    this.game.ctx.strokeStyle = "#FF0000";
    this.game.ctx.font = '900 20px Eagle Lake';
    this.game.ctx.fillStyle = "#FFFF00";
    this.game.ctx.strokeText("Mute", this.game.rect.x + 5, this.game.rect.y + 30);
    this.game.ctx.fillText("Mute", this.game.rect.x + 5, this.game.rect.y + 30);
    //end of drawing button

    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    return offscreenCanvas;
}
