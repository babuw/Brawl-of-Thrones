/*
* Benjamin Abdipour, University of Washington Tacoma
*/

const image_path = "./img/";
const sound_path = "./sound/";
const bg_list = ["background.gif", "background1.jpg", "background2.jpg"];
const bg_sound_list = ["bg_sound1.mp3", "bg_sound2.mp3", "bg_sound3.mp3", "bg_sound4.mp3", "bg_sound5.mp3"];
const player_right_sprite = "ken-right.png";
const player_left_sprite = "ken-left.png";
const ai_right_sprite = "ibuki-left.png";
const ai_left_sprite = "ibuki-right.png";
const frame_width = 150;
const frame_height = 150;
const punch_width = 130;
const kick_width = 150;
const offset = 0;
const offsetHit = 80;
const offsetPunch = 130
const offsetKick = 150;
const punchPenalty = 10;
const kickPenalty = 5;
var entities_list = [];

// var aiCharacter = [];
// aiCharacter.left_sprite = ai_left_sprite;
// aiCharacter.right_sprite = ai_right_sprite;
// aiCharacter.name = "Ryu";
// aiCharacter.anim_length = [10, 10, 12, 5, 8, 12];
// aiCharacter.right_anim_start = [2, 2, 0, 7, 4, 0];
// aiCharacter.left_offset = 0;

// var playerCharacter = [];
// playerCharacter.left_sprite = player_left_sprite;
// playerCharacter.right_sprite = player_right_sprite;
// playerCharacter.name = "Chunli";
// playerCharacter.anim_length = [7, 15, 9, 6, 10, 12];
// playerCharacter.right_anim_start = [8, 0, 6, 9, 5, 0];
// playerCharacter.left_offset = 1050;

var playerCharacter = [];
playerCharacter.left_sprite = player_right_sprite;
playerCharacter.right_sprite = player_left_sprite;
playerCharacter.name = "Ken";
playerCharacter.anim_length = [10, 10, 10, 10, 10, 10];
playerCharacter.right_anim_start = [0, 0, 0, 0, 0, 0];
playerCharacter.left_offset = 750;

var aiCharacter = [];
aiCharacter.left_sprite = ai_left_sprite;
aiCharacter.right_sprite = ai_right_sprite;
aiCharacter.name = "Ibuki";
aiCharacter.anim_length = [10, 10, 10, 10, 10, 10];
aiCharacter.right_anim_start = [0, 0, 0, 0, 0, 0];
aiCharacter.left_offset = 600;

//global var of sound
var backgroundMusic;
var isBackgroundMusicPlaying;
var isGameOver;

window.onload = function () {
	document.getElementById("gameWorld").focus();

	var bg_index = Math.floor(Math.random() * bg_list.length);
	document.getElementById("gameWorld").style.backgroundImage = "url('" + image_path + bg_list[bg_index] + "')";
};

function sleep(milliseconds) {
	var start = new Date().getTime();
	while ((start + milliseconds) > new Date().getTime()) {
	}
}

function distance(offsetCaller, offsetOpponent) {
	return (Math.abs(entities_list[0].x - entities_list[1].x) - Math.abs(offsetCaller - offsetOpponent));
}

function distance_abs() {
	// Player is to the left of AI
	if ((entities_list[0].x - entities_list[1].x) > 0) {
		return -1;
		// Player is to the right of AI
	} else if ((entities_list[0].x - entities_list[1].x) < 0) {
		return 1;
		// Players at same X coordinate or some error condition
	} else {
		return 0;
	}
}

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop) {
	this.spriteSheet = spriteSheet;
	this.startX = startX;
	this.startY = startY;
	this.frameWidth = frameWidth;
	this.frameDuration = frameDuration;
	this.frameHeight = frameHeight;
	this.frames = frames;
	this.totalTime = frameDuration * frames;
	this.elapsedTime = 0;
	this.loop = loop;
	this.reverse;// = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
	var scaleBy = scaleBy || 1;
	this.elapsedTime += tick;
	if (this.loop) {
		if (this.isDone()) {
			this.elapsedTime = 0;
		}
	} else if (this.isDone()) {
		return;
	}
	var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
	var vindex = 0;
	if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
		index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
		vindex++;
	}
	while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
		index -= Math.floor(this.spriteSheet.width / this.frameWidth);
		vindex++;
	}

	var locX = x;
	var locY = y;
	var offset = vindex === 0 ? this.startX : 0;
	ctx.drawImage(this.spriteSheet,
		index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
		this.frameWidth, this.frameHeight,
		locX, locY,
		this.frameWidth * scaleBy,
		this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
	return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
	return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
	Entity.call(this, game, 350, 400);

	// background sound initialization
	var bg_index = Math.floor(Math.random() * bg_sound_list.length);
	backgroundMusic = new Audio(sound_path + bg_sound_list[bg_index]);
	console.log("started playing background music");
	backgroundMusic.play();

	isGameOver = false;

	isBackgroundMusicPlaying = true;
	//add
	this.mute = game.muteBoolean;

	this.radius = 200;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {

}

Background.prototype.draw = function (ctx) {
	Entity.prototype.draw.call(this);
}

function FighterMaker(animationDetail) {
	var index = 0;
	animationDetail[0].animation = new Animation(ASSET_MANAGER.getAsset(image_path + animationDetail[1]), (animationDetail[2][index] * frame_width) + animationDetail[5], frame_height * index, frame_width, frame_height, 0.05, animationDetail[3][index], animationDetail[4][index++]);
	animationDetail[0].walkAnimation = new Animation(ASSET_MANAGER.getAsset(image_path + animationDetail[1]), (animationDetail[2][index] * frame_width) + animationDetail[5], frame_height * index, frame_width, frame_height, 0.05, animationDetail[3][index], animationDetail[4][index++]);
	if (animationDetail[0].jumping) {
		var tmpJumpTime = animationDetail[0].jumpAnimation.elapsedTime;
		tmpYVal = animationDetail[0].y;
		animationDetail[0].jumpAnimation = new Animation(ASSET_MANAGER.getAsset(image_path + animationDetail[1]), (animationDetail[2][index] * frame_width) + animationDetail[5], frame_height * index, frame_width, frame_height, 0.05, animationDetail[3][index], animationDetail[4][index++]);
		animationDetail[0].jumpAnimation.elapsedTime = tmpJumpTime;
		animationDetail[0].y = tmpYVal;
	} else {
		animationDetail[0].jumpAnimation = new Animation(ASSET_MANAGER.getAsset(image_path + animationDetail[1]), (animationDetail[2][index] * frame_width) + animationDetail[5], frame_height * index, frame_width, frame_height, 0.05, animationDetail[3][index], animationDetail[4][index++]);
	}
	animationDetail[0].punchAnimation = new Animation(ASSET_MANAGER.getAsset(image_path + animationDetail[1]), (animationDetail[2][index] * frame_width) + animationDetail[5], frame_height * index, frame_width, frame_height, 0.05, animationDetail[3][index], animationDetail[4][index++]);
	animationDetail[0].kickAnimation = new Animation(ASSET_MANAGER.getAsset(image_path + animationDetail[1]), (animationDetail[2][index] * frame_width) + animationDetail[5], frame_height * index, frame_width, frame_height, 0.05, animationDetail[3][index], animationDetail[4][index++]);
	animationDetail[0].fallAnimation = new Animation(ASSET_MANAGER.getAsset(image_path + animationDetail[1]), (animationDetail[2][index] * frame_width) + animationDetail[5], frame_height * index, frame_width, frame_height, 0.05, animationDetail[3][index], animationDetail[4][index++]);
}

function Player(game, character) {
	this.playerLeft = false; this.playerRight = true;
	if (this.playerLeft) {
		FighterMaker([this, playerCharacter.left_sprite, [0, 0, 0, 0, 0, 0], playerCharacter.anim_length, [true, true, false, false, false, false], 0]);
	} else if (this.aiRight) {
		FighterMaker([this, playerCharacter.right_sprite, playerCharacter.right_anim_start, playerCharacter.anim_length, [true, true, false, false, false, false], playerCharacter.left_offset]);
	}

	// sound effect variables
	this.punchingSound = new Audio("./sound/punch.wav");
	this.walkingSound = new Audio("./sound/walking2.wav");
	this.kickingSound = new Audio("./sound/kick.wav");
	this.jumpingSound = new Audio("./sound/jump.wav");
	this.dyingSound = new Audio("./sound/dying.wav");
	this.gethitSound = new Audio("./sound/gettinghit.wav");

	//add 
	this.gm = game;

	this.isTimeOut = false;
	this.idle = false;
	this.gameEngine = game;
	this.isWinner = false;

	this.walking = false;
	this.jumping = false;
	this.punching = false;
	this.kicking = false;
	this.name = playerCharacter.name;
	this.hp = 100;
	this.radius = 100;
	this.ground = 240;
	this.x = 300;
	this.y = 240;

	this.direction = 1
	Entity.call(this, game, 300, 240);
}

Player.prototype = new Entity();
Player.prototype.constructor = Player;

Player.prototype.update = function () {
	//add
	if (!isGameOver) {
		if (isBackgroundMusicPlaying && this.gm.muteBoolean === true) {
			backgroundMusic.pause();
			isBackgroundMusicPlaying = false;
		} else if (this.gm.muteBoolean === false) {

			backgroundMusic.play();
			isBackgroundMusicPlaying = true;
		}
	}

	//SOUND is off when the timer is zero or one of the players is dead.
	for (var i = 0; i < entities_list.length; i++) {
		if (entities_list[i].hp === 0 || entities_list[i].idle) {
			backgroundMusic.pause();
			isGameOver = true;
			this.isTimeOut = true;
			break;
		}
	}

	if (this.gameEngine.gameTimer === 0 || (this.hp === 0 || entities_list[0].hp === 0)) {
		this.isTimeOut = true;
	}

	if (this.isTimeOut || (this.hp > 0 && entities_list[1].hp === 0)) {
		this.idle = true;
	}

	if (this.idle) {
		if (this.hp > entities_list[1].hp) {
			this.isWinner = true;
			entities_list[1].isWinner = false;
		}

	} else {
		//player is to the left
		if (distance_abs() === 1) {
			this.offset = offset;
			this.offsetHit = offsetHit;
			this.offsetPunch = offsetPunch;
			this.offsetKick = offsetKick;
			//player is to the right
		} else if (distance_abs() === -1) {
			this.offset = (frame_width - offset);
			this.offsetHit = (frame_width - offsetHit);
			this.offsetPunch = (frame_width - offsetPunch);
			this.offsetKick = (frame_width - offsetKick);
		}

		if (distance_abs() === 1 && this.direction === 1) {
			this.direction = -1;
			FighterMaker([this, playerCharacter.right_sprite, playerCharacter.right_anim_start, playerCharacter.anim_length, [true, true, false, false, false, false], playerCharacter.left_offset]);
		} else if (distance_abs() === -1 && this.direction === -1) {
			this.direction = 1;
			FighterMaker([this, playerCharacter.left_sprite, [0, 0, 0, 0, 0, 0], playerCharacter.anim_length, [true, true, false, false, false, false], 0]);
		}

		if (this.game.walk) this.walking = true; else this.walking = false;
		if (this.game.playerLeft) { this.playerLeft = true; this.playerRight = false; } else { this.playerLeft = false; this.playerRight = true };
		if (this.game.space) {
			this.jumping = true;
			this.jumpingSound.play();
		}

		if (this.game.punch) {
			this.punching = true;
			this.punchingSound.play();
		}
		if (this.game.kick) {
			this.kicking = true;
			this.kickingSound.play();
		}

		if (this.jumping) {
			if (this.jumpAnimation.isDone()) {
				this.jumpAnimation.elapsedTime = 0;
				this.jumping = false;
			}
			var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
			var totalHeight = 150;

			if (jumpDistance > 0.5)
				jumpDistance = 1 - jumpDistance;

			var height = totalHeight * (-4 * (jumpDistance * jumpDistance - jumpDistance));
			this.y = this.ground - height;
		}

		if (this.punching) {
			if (this.punchAnimation.isDone()) {
				this.punchAnimation.elapsedTime = 0;
				this.punching = false;
				if (distance(this.offsetPunch, entities_list[1].offsetHit) <= 0) { entities_list[1].hp -= punchPenalty; };
			}
		}

		if (this.kicking) {
			if (this.kickAnimation.isDone()) {
				this.kickAnimation.elapsedTime = 0;
				this.kicking = false;
				if (distance(this.offsetKick, entities_list[1].offsetHit) <= 0) { entities_list[1].hp -= kickPenalty; };
			}
		}

		if (this.x < 1000 - 150 && this.walking && this.playerRight) {
			this.walkingSound.play();
			this.jumping ? this.x += 10 : this.x += 3;
		}

		if (this.x > 0 && this.walking && this.playerLeft) {
			this.walkingSound.play();
			this.jumping ? this.x -= 10 : this.x -= 3;
		}
	}
	Entity.prototype.update.call(this);
}

Player.prototype.draw = function (ctx) {
	if (this.idle) {
		this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	} else {
		if (this.jumping) {
			this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else if (this.punching) {
			this.punchAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else if (this.kicking) {
			this.kickAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else if (this.walking) {

			this.walkAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else {
			this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		}
	}

	Entity.prototype.draw.call(this);

	// ctx.beginPath();
	// ctx.lineWidth = "2";
	// ctx.strokeStyle = "rgba(0, 0, 255, 1)";
	// ctx.moveTo(this.x + this.offsetHit, 0);
	// ctx.lineTo(this.x + this.offsetHit, this.ground + 150);
	// ctx.moveTo(this.x + this.offsetPunch, 0);
	// ctx.lineTo(this.x + this.offsetPunch, this.ground + 150);
	// ctx.moveTo(this.x + this.offset, 0);
	// ctx.lineTo(this.x + this.offset, this.ground + 150);
	// ctx.moveTo(this.x + this.offsetKick, 0);
	// ctx.lineTo(this.x + this.offsetKick, this.ground + 150);

	// ctx.moveTo(0, this.ground + 40);
	// ctx.lineTo(this.x + this.offset, this.ground + 40);
	// ctx.stroke();
	// ctx.closePath();
	// ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
	// ctx.fillRect(45, 590, 70, 40);
}

function Ai(game, character) {
	this.aiLeft = true; this.aiRight = false;
	if (this.aiLeft) {
		FighterMaker([this, aiCharacter.left_sprite, [0, 0, 0, 0, 0, 0], aiCharacter.anim_length, [true, true, false, false, false, false], 0]);
	} else if (this.aiRight) {
		FighterMaker([this, aiCharacter.right_sprite, aiCharacter.right_anim_start, aiCharacter.anim_length, [true, true, false, false, false, false], aiCharacter.left_offset]);
	}

	this.punchingSound = new Audio("./sound/fpunch.wav");
	this.kickingSound = new Audio("./sound/fkick.wav");
	this.jumpingSound = new Audio("./sound/fjump.wav");

	this.walking = false;
	this.jumping = false;
	this.punching = false;
	this.kicking = false;
	this.name = aiCharacter.name;
	this.radius = 100;
	this.hp = 100;
	this.ground = 240;
	this.idle = false;
	this.isWinner = false;
	this.x = 500;
	this.y = 240;
	this.cooldown = 0;

	Entity.call(this, game, 500, 240);
}

Ai.prototype = new Entity();
Ai.prototype.constructor = Ai;

// These need to add up to 1 as well.
const do_nothing_0 = 0.2;
const walk_0 = 1 - do_nothing_0;

// THESE SHOULD ADD UP TO 1 OR WEIRD STUFF WILL HAPPEN
const kick_chance_1 = 0.1;
const do_nothing_1 = 0.2;
const get_closer = 1 - kick_chance_1 - do_nothing_1;

// THIS SET OF CONSTATNTS SHOULD ALSO ADD UP TO 1
const kick_chance_2 = 0.25
const punch_chance = 0.25
const do_nothing_2 = 0.35
const walk_away = 1 - kick_chance_2 - punch_chance - do_nothing_2

Ai.prototype.update = function () {
	//player is to the left
	if (distance_abs() === 1) {
		this.offset = (frame_width - offset);
		this.offsetHit = (frame_width - offsetHit);
		this.offsetPunch = (frame_width - offsetPunch);
		this.offsetKick = (frame_width - offsetKick);

		//player is to the right
	} else if (distance_abs() === -1) {
		this.offset = offset;
		this.offsetHit = offsetHit;
		this.offsetPunch = offsetPunch;
		this.offsetKick = offsetKick;
	}

	// Determines whether player/AI should switch sides of the sprite.
	if (distance_abs() === -1 && this.aiLeft) {
		this.aiLeft = false; this.aiRight = true;
		FighterMaker([this, aiCharacter.right_sprite, aiCharacter.right_anim_start, aiCharacter.anim_length, [true, true, false, false, false, false], aiCharacter.left_offset]);
	} else if (distance_abs() === 1 && this.aiRight) {
		this.aiLeft = true; this.aiRight = false;
		FighterMaker([this, aiCharacter.left_sprite, [0, 0, 0, 0, 0, 0], aiCharacter.anim_length, [true, true, false, false, false, false], 0]);
	}

	if (entities_list[0].isTimeOut) {
		this.idle = true;
	}

	if (this.idle) {
		if (this.hp > entities_list[0].hp) {
			this.isWinner = true;
			entities_list[0].isWinner = false;
			this.clearStatuses();
		}
	} else {
		if (this.cooldown === 0) {
			if (this.kickAnimation.elapsedTime > 0 || this.punchAnimation.elapsedTime > 0) {
				if (this.kickAnimation.isDone()) {
					this.kickingSound.play();
					this.kickAnimation.elapsedTime = 0;
					this.kicking = false;
					this.cooldown = 4;
					if (distance(this.offsetKick, entities_list[0].offsetHit) <= 0) { entities_list[0].hp -= kickPenalty; };
				} else if (this.punchAnimation.isDone()) {
					this.punchAnimation.elapsedTime = 0;
					this.punchingSound.play();
					this.punching = false;
					this.cooldown = 4;
					if (distance(this.offsetPunch, entities_list[0].offsetHit) <= 0) { entities_list[0].hp -= punchPenalty; };
				} else {
					this.cooldown = 7;
					this.walking = false;
				}
			} else if (distance(this.offsetKick, entities_list[0].offsetHit) > 0) {
				var rdm = Math.random();
				this.clearStatuses();
				if (rdm < walk_0) {
					this.doWalking();
				} else {
					this.cooldown = 7;
					this.walking = false;
				}
			} else if (distance(this.offsetKick, entities_list[0].offsetHit) <= 0) {
				if (this.kickAnimation.elapsedTime <= 0) {
					var rdm = Math.random();
					if (rdm < kick_chance_1) {
						this.walking = false;
						this.kicking = true;
					} else {
						this.doWalking();
					}
				} else if (this.kickAnimation.isDone()) {
					this.kickAnimation.elapsedTime = 0;
					this.kicking = false;
					this.cooldown = 4;
				} else {
					this.cooldown = 7;
					this.walking = false;
				}
			} else if (distance(this.offsetPunch, entities_list[0].offsetHit) <= 0) {
				if (this.kickAnimation.elapsedTime <= 0 && this.punchAnimation.elapsedTime <= 0) {
					var rdm = Math.random();
					if (rdm <= kick_chance_2) {
						this.walking = false;
						this.kicking = true;
					} else if (rdm > kick_chance_2 && rdm <= (kick_chance_2 + punch_chance)) {
						this.walking = false;
						this.punching = true;
					} else if (rdm > (kick_chance_2 + punch_chance) && rdm <= (kick_chance_2 + punch_chance + do_nothing_2)) {
						this.cooldown = 7;
						this.walking = false;
					} else {
						this.doWalking();
					}
				}
			}
		} else {
			this.cooldown -= 1;
		}
	}

	Entity.prototype.update.call(this);
}

Ai.prototype.doWalking = function () {
	// AI to the left, move right
	if (this.x < 1000 - 150 && distance_abs() < 0) {
		this.walking = true;
		this.x += 3;
		// AI to the right, move left
	} else if (this.x > 0 && distance_abs() > 0) {
		this.walking = true;
		this.x -= 3;
	}
}

Ai.prototype.clearStatuses = function () {
	this.walking = false;
	this.jumping = false;
	this.punching = false;
	this.kicking = false;
	this.kickAnimation.elapsedTime = 0;
	this.punchAnimation.elapsedTime = 0;
}

Ai.prototype.draw = function (ctx) {

	if (this.idle) {
		this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	} else {
		if (this.jumping) {
			this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else if (this.punching) {
			this.punchAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else if (this.kicking) {
			this.kickAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else if (this.walking) {
			this.walkAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else {
			this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		}
	}

	Entity.prototype.draw.call(this);


	// ctx.beginPath();
	// ctx.lineWidth = "2";
	// ctx.strokeStyle = "rgba(255, 0, 0, 1)";
	// ctx.moveTo(this.x + this.offsetHit, 0);
	// ctx.lineTo(this.x + this.offsetHit, this.ground + 150);
	// ctx.moveTo(this.x + this.offsetPunch, 0);
	// ctx.lineTo(this.x + this.offsetPunch, this.ground + 150);
	// ctx.moveTo(this.x + this.offset, 0);
	// ctx.lineTo(this.x + this.offset, this.ground + 150);
	// ctx.moveTo(this.x + this.offsetKick, 0);
	// ctx.lineTo(this.x + this.offsetKick, this.ground + 150);

	// ctx.moveTo(0, this.ground + 40);
	// ctx.lineTo(this.x + this.offset, this.ground + 40);
	// ctx.stroke();
	// ctx.closePath();
}

function collides(rects, x, y) {
	var isCollision = false;
	var left = rects.x, right = rects.x + rects.w;
	var top = rects.y, bottom = rects.y + rects.h;
	if (right >= x
		&& left <= x
		&& bottom >= y
		&& top <= y) {
		isCollision = rects;
	}

	return isCollision;
}

function hideControl() {
	document.getElementById('controls').style.display = "none";
}
function showControl() {
	document.getElementById('controls').style.display = "block";
}

function hideCredit() {
	document.getElementById('credits').style.display = "none";
}
function showCredit() {
	document.getElementById('credits').style.display = "block";
}

function StartGame() {
	console.log("starting up da sheild");
	var canvas = document.getElementById('gameWorld');
	var ctx = canvas.getContext('2d');
	var gameEngine = new GameEngine();
	var hide = false;
	var hidecs = true;

	document.getElementById('controls').style.display = "none";
	document.getElementById('credits').style.display = "none";

	ctx.fillStyle = 'white';
	var backImage = new Image();
	backImage.onload = function () {
		ctx.drawImage(backImage, 0, 0);
		// ctx.font='30px Eagle Lake';
		// ctx.fillText("BRAWL of", 40, 100);
		// ctx.font='60px Eagle Lake';
		// ctx.fillText("THRONES", 40, 170);
		ctx.font = '30px Eagle Lake';
		ctx.fillText("Play", 45, 335);
		ctx.fillText("Help", 45, 410);
		ctx.fillText("Credits", 45, 485);
	};
	backImage.src = './img/gameofthrone.jpg';

	var test = "Testing before the add character";
	console.log(test);
	ctx.font = "30px Eagle Lake";
	// check if context exist
	if (canvas && canvas.getContext) {
		// list of rectangles to render
		var rects = [{ x: 25, y: 300, w: 150, h: 50 },
		{ x: 25, y: 375, w: 150, h: 50 },
		{ x: 25, y: 450, w: 150, h: 50 }];
		for (var i = 0, len = rects.length; i < len; i++) {
			ctx.strokeRect(rects[i].x, rects[i].y, rects[i].w, rects[i].h);
		}


		var mousemovement = function (e) {
			// important: correct mouse position:
			var rect = this.getBoundingClientRect(),
				x = e.clientX - rect.left,
				y = e.clientY - rect.top,
				i = 0, r;

			while (r = rects[i++]) {
				// add a single rect to path:
				ctx.beginPath();
				ctx.rect(r.x, r.y, r.w, r.h);
				// check if we hover it, stroke white, if not stroke black
				ctx.strokeStyle = ctx.isPointInPath(x, y) ? "white" : "black";
				ctx.stroke();
			}
		};
		canvas.addEventListener('mousemove', mousemovement, false);

		// listener, using W3C style for example
		canvas.addEventListener('click', function (e) {
			// console.log('click: ' + e.offsetX + '/' + e.offsetY);
			var play = collides(rects[0], e.offsetX, e.offsetY);
			var help = collides(rects[1], e.offsetX, e.offsetY);
			var about = collides(rects[2], e.offsetX, e.offsetY);

			if (play) {
				canvas.removeEventListener('mousemove', mousemovement, false);
				var cs = new CharacterSelection();
				cs.init(ctx, gameEngine);
			} else if (help) {
				if (hide) {
					showControl();
					hide = false;
				} else {
					hideControl();
					hide = true;
				}
			} else if (about) {
				if (hidecs) {
					showCredit();
					hidecs = false;
				} else {
					hideCredit();
					hidecs = true;
				}
			}
		}, false);
	}
}

// the "main" code begins here
var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload(image_path + playerCharacter.left_sprite);
ASSET_MANAGER.queueDownload(image_path + playerCharacter.right_sprite);
ASSET_MANAGER.queueDownload(image_path + aiCharacter.left_sprite);
ASSET_MANAGER.queueDownload(image_path + aiCharacter.right_sprite);
ASSET_MANAGER.queueDownload(image_path + bg_list[0]);
ASSET_MANAGER.queueDownload(image_path + bg_list[1]);
ASSET_MANAGER.queueDownload(image_path + bg_list[2]);

ASSET_MANAGER.downloadAll(function () {
	StartGame();
});
