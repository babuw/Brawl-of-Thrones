/*
* Benjamin Abdipour, University of Washington Tacoma
*/

function CharacterSelection() {
  this.ctx = null;
}

CharacterSelection.prototype.init = function (ctx, gameEngine) {

  this.ctx = ctx;
  this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

  //this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

  //Loading of the home test image - img1
  var img1 = new Image();
  var img2 = new Image();
  var img3 = new Image();
  var img4 = new Image();

  //drawing of the test image - img1
  img1.onload = function () {
      //draw background image
      ctx.drawImage(img1, 110, 0);
  };
  img1.src = './img/ibukics.jpg';

  //drawing of the test image - img1
  img2.onload = function () {
      //draw background image
      ctx.drawImage(img2, 305, 0);
  };
  img2.src = './img/chunlics.jpg';

  //drawing of the test image - img1
  img3.onload = function () {
      //draw background image
      ctx.drawImage(img3, 500, 0);
  };
  img3.src = './img/ryucs.jpg';

  //drawing of the test image - img1
  img4.onload = function () {
      //draw background image
      ctx.drawImage(img4, 695, 0);
  };
  img4.src = './img/kencs.jpg';

  var rects = [{x: 110, y: 0, w: 195, h: 390},    // Ibuki
               {x: 305, y: 0, w: 195, h: 390},    // Chunli
               {x: 500, y: 0, w: 195, h: 390},    // Ryu
               {x: 695, y: 0, w: 195, h: 390},    // Ken
               {x: 190, y: 400, w: 230, h: 50},   // Player 1 Select
               {x: 680, y: 400, w: 210, h: 50},   // AI Select
               {x: 695, y: 585, w: 150, h: 50}];  // Start


   this.ctx.beginPath();
   //this.ctx.stroke();

   var time = 60;
   var p1 = false;
   var ai = false;
   var lastClick = "Ryu"; //default
   var playerOne = "Ryu";
   var playerAi = "Ken";
   if (ctx) {
       for (var i = 0, len = rects.length; i < len; i++) {
         ctx.fillStyle = 'white';
         ctx.fillRect(rects[i].x, rects[i].y, rects[i].w, rects[i].h);
         ctx.strokeRect(rects[i].x, rects[i].y, rects[i].w, rects[i].h);

       }
   }

   ctx.fillStyle = 'black';
   ctx.fillText("Player Select", 200, 435);
   ctx.fillText("AI Select", 710, 435);
   ctx.fillText("Start", 725, 620);
   this.ctx.closePath();

   var mousemovement = function(e) {
     // important: correct mouse position:
     var rect = this.getBoundingClientRect(),
         x = e.clientX - rect.left,
         y = e.clientY - rect.top,
         i = 0, r;

     while(r = rects[i++]) {
       // add a single rect to path:
       ctx.beginPath();
       ctx.rect(r.x, r.y, r.w, r.h);
       // check if we hover it, stroke white, if not stroke black
       ctx.strokeStyle = ctx.isPointInPath(x, y) ? "white" : "black";
       ctx.stroke();
       //ctx.closePath();
     }
   };
   ctx.canvas.addEventListener('mousemove', mousemovement, false);

   // listener, using W3C style for example
   ctx.canvas.addEventListener('click', function(e) {
       //console.log('click: ' + e.offsetX + '/' + e.offsetY);
       var ibuki = collides(rects[0], e.offsetX, e.offsetY);
       var chunli = collides(rects[1], e.offsetX, e.offsetY);
       var ryu = collides(rects[2], e.offsetX, e.offsetY);
       var ken = collides(rects[3], e.offsetX, e.offsetY);
       var plSelect = collides(rects[4], e.offsetX, e.offsetY);
       var aiSelect = collides(rects[5], e.offsetX, e.offsetY);
       var startGameEngine = collides(rects[6], e.offsetX, e.offsetY);

       // Checks to see what the user clicks
       if (ibuki) {
          lastClick = "Ibuki";
           console.log("Ibuki");
       } else if(chunli) {
           lastClick = "Chunli";
           console.log("Chunli");
       } else if(ryu) {
           lastClick = "Ryu";
           console.log("Ryu");
       } else if(ken) {
           lastClick = "Ken";
           console.log("Ken");
       } else if(plSelect) {
            playerOne = lastClick;
            //p1 = true;
            console.log(playerOne);
       } else if(aiSelect) {
            playerAi = lastClick;
            //ai = true;
       } else if(startGameEngine) {
         //console.log(" " + p1 + " " + ai + " ");
         //if(p1 && ai) {
           ctx.canvas.removeEventListener('mousemove', mousemovement, false);         var bg = new Background(gameEngine);

           var player = new Player(gameEngine, playerCharacter);
           var ai = new Ai(gameEngine, aiCharacter);
           gameEngine.addEntity(ai);
           gameEngine.addEntity(player);
           entities_list.push(player);
           entities_list.push(ai);

           // Starts the game
           gameEngine.init(ctx);
           gameEngine.start();
         //}
       }
   }, false);



}
