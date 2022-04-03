var gamecounter = 0, snakespeed = 5;
// grid items
const EMPTY = 0, SNAKE = 1, CLONE = 2, FRUIT = 3, BOMB = 4, WALL = 5, MISSILE = 6, MARKED = 7, HEAD = 8, CLONEHEAD = 9;
const START_LENGTH = 4;
// game properties
const BOMBS = 0, MOVEFRUIT = 1, MOVEBOMBS = 2, HASMISSILES = 3, FLASH = 4, GRADE = 5, REDBOMBS = 6, TICK = 7, FROG = 8, HAS_CLONE = 9, WALLS = 10, INFINITE = 11, PORTAL = 12;
const left  = 0, up = 1, right = 2, down  = 3;
const larrow = 37, uarrow = 38, rarrow = 39, darrow = 40;
var th, tw;

grid = {
	init: function(d, c, r) {
		this.width = c;
		this.height = r;
		this.position = [];

		for (var x = 0; x < c; x++) {
			this.position.push([]);
			for (var y = 0; y < r; y++) {
				this.position[x].push(d);
			}
		}
	},

	set: function(val, x, y) {
		this.position[x][y] = val;
	},

	get: function(x, y) {
		return this.position[x][y];
	},
};

class Snake {
	constructor(body, direction, x, y) {
		this.direction = direction;
		this.body = [];

		for (let i = 0; i < START_LENGTH; i++) {
			this.insert(x, y);
		}
	}

	atend(x, y) {
		this.body.push({x:x, y:y});
		this.head = this.body[0];
		this.tail = this.body.at(-1);
	}

	insert(x, y) {
		this.body.unshift({x:x, y:y});
		this.head = this.body[0];
		this.tail = this.body.at(-1);
	}

	remove() {
		return this.body.pop();
	}
};


class Item {
	constructor(direction, x, y) {
		this.direction = direction;
		this.x = x;
		this.y = y;
		this.age = 0;
	}
}

class Score {
	constructor(fruit, value, points) {
		this.points = points;
		this.fruit = fruit;
		this.value = value;
	}
}


class Game {
	constructor(game_name) {
		this.type = game_name;
		this.properties = [];
		this.reset = false;
		this.animating = true;
		this.frames = 0;
		this.numfruit = 1;
		this.cols = this.rows = 26;
		
		this.score = new Score(0, 250, 0);
		
		this.objects = [];

		this.objects[FRUIT] = [];
		this.objects[BOMB] = [];
		this.objects[MISSILE] = [];
		this.objects[EMPTY] = [];

		this.objects[SNAKE] = new Snake(SNAKE, right, 0, Math.round(Math.random()*this.cols-1));
		this.objects[CLONE] = new Snake(CLONE, right, 0, Math.round(Math.random()*this.cols-1));
	}

	has(property) {
		return this.properties.includes(property);
	}

	addProperty(property, right_game) {
		if (right_game) this.properties.push(property);
	}

	increment() {
		this.frames++;
		if (this.score.value > 50) this.score.value -= .5;
	}

	updateScore() {		
		this.score = new Score(this.score.fruit + 1, 250, this.score.points += Math.floor(this.score.value));
	}

	addItem(item, direction, x, y) {
		this.objects[item].push(new Item(direction, x, y));
	}

	get(item) {
		return this.objects[item];
	}
};

function setGame(game_name){
	if (gamecounter > 0) gameReset();

	game = new Game(game_name);

	let game_button = document.getElementById(game.type);

	game_button.style.filter = "var(--hover-color)";
	game_button.style.fontWeight = "bold";
	game_button.innerHTML = "* " + games[games.findIndex(e => e.name == game.type)].title + " *";
	
	main();
}

function main() {
	if (gamecounter > 0) {
		if (document.getElementsByClassName("game-over popup")[0] != null) document.getElementsByClassName("game-over popup")[0].remove();
		window.cancelAnimationFrame(globalID);
		globalID = undefined;
	}

	canvas = document.getElementById("grid");
	canvas.width = game.cols*20;
	canvas.height = game.rows*20;
	ctx = canvas.getContext("2d");

	keystate = {};
	document.addEventListener("keydown", function(evt) { keystate[evt.keyCode] = true; });
	document.addEventListener("keyup", function(evt) { keystate[evt.keyCode] = false; });

	document.querySelectorAll("button.game").forEach(function(e) {
		e.addEventListener("mouseover", function() {
			let index = games.findIndex(cell => cell.name === e.id);
			if (text != null) document.getElementsByClassName("description")[0].innerHTML = "<span class = 'name'>" + games[index].title.toUpperCase() + "</span>: " + text[index+1];
			// else document.getElementsByClassName("description")[0].innerHTML = "This would be new text!";
		});

		e.addEventListener("mouseout", function() {
			let index = games.findIndex(cell => cell.name === game.type);
			if (text != null) document.getElementsByClassName("description")[0].innerHTML = "<span class = 'name'>" + games[index].title.toUpperCase() + "</span>: " + text[index+1];
			// else document.getElementsByClassName("description")[0].innerHTML = "Back to the original!";
		  });
	  });

	init();

	loop();
}

function loop() {
	update();
	game.animating ? (draw(), globalID = window.requestAnimationFrame(loop, canvas)) : null;
}

function init() {
	teleport_now = reset_game = false;
	gamecounter++;

	for (let i = larrow; i <= darrow; i++) keystate[i] = false;
	grid.init(EMPTY, game.cols, game.rows);

	for (let i = 0; i < game.cols; i++) {
		for (let j = 0; j < game.rows; j++) {
			game.get(EMPTY).push({direction:null, x:i, y:j});
		}
	}

	tw = canvas.width/grid.width;
	th = canvas.height/grid.height;

	setProperties();

	set(game.numfruit, FRUIT);
}

function update() {
	game.increment();

	if (game.has(MOVEFRUIT) && timeToMove(FRUIT)) move(FRUIT);
	if (game.has(MOVEBOMBS) && timeToMove(BOMB)) move(BOMB);
	if (game.has(HASMISSILES) && timeToMove(MISSILE)) move(MISSILE);
	if (reset_game) {
		gameReset();
		gameOverScreen();
		return;
	}

	for (i = 0; i <= game.has(HAS_CLONE); i++) {
		var snake = game.get(SNAKE+i);

		if ((timeToMove(SNAKE) && i == 0) || (timeToMove(CLONE) && i == 1)) {

			move(SNAKE+i);
			if (gameOver(snake.head.x, snake.head.y) && i == 0) {
				ctx.fillStyle = "pink";
				ctx.fillRect(snake.head.x*tw+1, snake.head.y*th+1, tw-2, th-2);
				
				gameReset();
				gameOverScreen();
				return;
			}
			
			if (at(FRUIT, snake.head.x, snake.head.y)) collectedFruit(snake.head.x, snake.head.y, i);
			
			if (!game.has(INFINITE)) { 
				let tail = snake.remove();
				if (!at(WALL, tail.x, tail.y)) set(1, EMPTY, tail.x, tail.y);
			}
			set(1, SNAKE+i, snake.head.x, snake.head.y);
		}
	}


	if (game.has(TICK) && game.frames%50 == 0 && game.score.value < 175) set(1, BOMB);
	if (game.has(HASMISSILES) && game.frames%20 == 0) set(1, MISSILE, 0, Math.round(Math.random()*game.cols-1));
	if (game.has(FLASH)) game.get(BOMB).forEach(function(b) { b.age++ });
	
	updateScoreboard();
}

function updateScoreboard() {
	document.getElementsByClassName('current-score')[0].innerHTML = "<p><span class = 'name'>CURRENT SCORE</span>: <span class = 'amt'>" + game.score.points + "</span><br> <span class = 'name'>FRUIT TAKEN</span>: <span class = 'amt'>" + game.score.fruit + "</span><br> <span class = 'name'>FRUIT VALUE</span>: " 
												+ Math.floor(game.score.value) + "<br><span class = 'name'>SNAKE LENGTH</span>: " + game.get(SNAKE).body.length + " pieces";
	document.getElementsByClassName('high-score')[0].innerHTML = "<p>HIGH SCORE: " + getScore(game.type) + "<br>MOST FRUIT: " + getFruitScore(game.type) + "</p>";

	if (game.type != games.at(-1).name && getFruitScore(game.type) < scoreToContinue(game.type))
		document.getElementsByClassName('score-to-beat')[0].innerHTML = "Collect " + (scoreToContinue(game.type) - game.score.fruit) + " fruit to progress.";
	else document.getElementsByClassName('score-to-beat')[0].innerHTML = "Dev Score: " + games[games.findIndex(g => g.name === game.type)].dev + " fruit";
}

function draw() {
	resetBoard();

	ctx.fillStyle = gridlines_color;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	for (var x = 0; x < grid.width; x++) {
		for (var y = 0; y < grid.height; y++) {
            
            if (at(WALL, x, y)) ctx.fillStyle = wall_color;
            if (at(EMPTY, x, y)) ctx.fillStyle = grid_color;
			if (at(FRUIT, x, y)) ctx.fillStyle = getGrade(x, y);
            if (at(BOMB, x, y)) ctx.fillStyle = (game.has(FLASH) && flashTime(x, y)) ? (grid_color) : ((game.has(REDBOMBS)) ? (fruit_color) : (bomb_color));
            if (at(SNAKE, x, y)) ctx.fillStyle = (at(HEAD, x, y)) ? (fruit_color) : (snake_color); 
            if (at(MISSILE, x, y)) ctx.fillStyle = snake_color;
            if (at(CLONE, x, y)) ctx.fillStyle = (at(CLONEHEAD, x, y)) ? (clone_head_color) : (clone_color);
            
			if (at(WALL, x, y)) ctx.fillRect(x*tw, y*th, tw, th);
			else if ((!at(SNAKE, x, y) && !at(CLONE, x, y)) || at(HEAD, x, y) || at(CLONEHEAD, x, y)) ctx.fillRect(x*tw+1, y*th+1, tw-2, th-2);
			else if (at(SNAKE, x, y) || at(CLONE, x, y)) drawSnakes(x , y, game.get(SNAKE+at(CLONE, x, y))); //if at(clone) return true, itll draw a clone, otherwise a snake            
		}
	}
}

function drawSnakes(x, y, snake) {
	let index = snake.body.findIndex(cell => cell.x === x && cell.y === y);
	if (index == -1) {
		debugger;
	}
	let sx = snake.body[index].x, sy = snake.body[index].y;
	let nx = snake.body[index-1].x, ny = snake.body[index-1].y;

	if (sx == nx) {
		if ((sy - ny == 1) || (ny - sy > 1)) ctx.fillRect(x*tw+1, y*th-1, tw-2, th);
		else if ((ny - sy == 1) || (sy - ny > 1)) ctx.fillRect(x*tw+1, y*th+1, tw-2, th);
	} else if (sy == ny) {
		if ((sx - nx == 1) || (nx - sx > 1)) ctx.fillRect(x*tw-1, y*th+1, tw, th-2);
		else if ((nx - sx == 1) || (sx - nx > 1)) ctx.fillRect(x*tw+1, y*th+1, tw, th-2);
	} else ctx.fillRect(x*tw+1, y*th+1, tw-2, th-2);
} 

function getGrade(x, y) {
	if (!game.has(GRADE)) return fruit_color;
	if (game.score.value < 200) return grid_color;

	ctx.fillStyle = grid_color;
	ctx.fillRect(x*tw+1, y*th+1, tw-2, th-2);

	let toRGB = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fruit_color);

	let rgb = [parseInt(toRGB[1], 16), parseInt(toRGB[2], 16), parseInt(toRGB[3], 16)];
	let fruit_age = 250 - game.score.value;

	let new_color = "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ", " + Math.max(0, parseFloat((50-fruit_age)/50)) + ")";

	return new_color;
}

function set(amount, object, a, b, dont_add) {
	for (let count = 0; count < amount; count++) {
		if ((a == null || b == null) || amount > 1) {

			do { var randpos = Math.round(Math.random()*(game.get(EMPTY).length-1));
			} while (cantPlace(game.get(EMPTY)[randpos].x, game.get(EMPTY)[randpos].y, object));

			a = game.get(EMPTY)[randpos].x;
			b = game.get(EMPTY)[randpos].y;
		}
		
		if (object == FRUIT || object == BOMB || object == MISSILE || object == EMPTY)
			if (!at(object, a, b) && dont_add != true) game.addItem(object, getDirection(object), a, b);

		if (object != EMPTY && at(EMPTY, a, b)) game.get(EMPTY).splice(game.get(EMPTY).findIndex(cell => cell.x === a && cell.y === b), 1);

		grid.set(object, a, b);
	}
}

function cantPlace(x, y, value) {
	if (game.score.fruit == 0) return false;

	if (game.get(EMPTY).length <= game.rows) return false;
	if (value == FRUIT && game.has(BOMBS)) {
		let bombs = game.get(BOMB);
		var options = getsToSnake(left, x, y, bombs) + getsToSnake(right, x, y, bombs) 
					+ getsToSnake(up, x, y, bombs) + getsToSnake(down, x, y, bombs);  
	 } //dont place fruit inside bombs
	if (options < 2) return true;

	if (value == FRUIT && game.has(PORTAL) && game.get(FRUIT).length >= 1 && (game.get(FRUIT).some(e => e.x === x || e.y === y))) return true;      //dont place portals on same line

	return (x == game.get(SNAKE).head.x || y == game.get(SNAKE).head.y) //dont place bomb right in front of you
	|| (game.has(WALLS) && (x == wall(left) || x == wall(right) || y == wall(up) || y == wall(down)));  //dont place game.fruit on edge during walls
}

function getsToSnake(dir, x, y, bombs) {
	(dir == left) ? (x--) : ((dir == right) ? (x++) : ((dir == up) ? (y--) : (y++)));
	(x > wall(right)) ? (x = wall(left)) : ((x < wall(left)) ? (x = wall(right)) : ((y > wall(down)) ? (y = wall(up)) : ((y < wall(up)) ? (y = wall(down)) : (null))));

	if (at(SNAKE, x, y)) {
		resetBoard();
		return true;
	}

	if (bombs.some(e => e.x === x && e.y === y) || at(MARKED, x, y)) return false;
	grid.set(MARKED, x, y);

	return getsToSnake(left, x, y, bombs) || getsToSnake(right, x, y, bombs) || getsToSnake(up, x, y, bombs) || getsToSnake(down, x, y, bombs);
}

function move(object) {
	var objects = game.get(object);

	if (object == SNAKE) teleport_now ? teleportSnake(objects, game.get(FRUIT)) : moveSnake(objects);
	else if (object == CLONE) moveClone(game.get(CLONE), game.get(FRUIT)[0]);

	else {
		objects.forEach(function(item, i, objArray) {
			if (at(SNAKE, item.x, item.y) && object == MISSILE) collision(object, objArray, i);
			else { 
				set(1, EMPTY, item.x, item.y);
				objArray[i] = newPosition(object, item.direction, item.x, item.y);

				if (objArray[i] == null) objArray.splice(i, 1);
				else {
					set(1, object, objArray[i].x, objArray[i].y, true);  //true means the object shouldnt be pushed again
					if (at(HEAD, objArray[i].x, objArray[i].y)) collision(object, objArray, i);
				}
			}
		});
	}
}

function moveClone(clone, fruit) {
	var headdir = clone.direction;
	if (game.frames < 50) clone.direction = right;

	else if (fruit.y < clone.head.y) {
		if (Math.abs(fruit.y - clone.head.y) < game.rows/2) clone.direction = up;
		else clone.direction = down;
	} else if (fruit.y > clone.head.y) {
		if (Math.abs(fruit.y - clone.head.y) < game.rows/2) clone.direction = down;
		else clone.direction = up;
	} else if (fruit.x < clone.head.x) {
		if (Math.abs(fruit.x - clone.head.x) < game.cols/2) clone.direction = left;
		else clone.direction = right;
	} else if (fruit.x > clone.head.x) { 
		if (Math.abs(fruit.x - clone.head.x) < game.cols/2) clone.direction = right;
		else clone.direction = left
	} 

	if (clone.direction == oppositeDirection(headdir)) clone.direction = (clone.direction+1)%4;  //cant turn 180º

	new_pos = newPosition(CLONE, clone.direction, clone.head.x, clone.head.y);
	clone.insert(new_pos.x, new_pos.y);
};

function newPosition(value, dir, x, y) {
	(dir == left) ? (x--) : ((dir == right) ? (x++) : ((dir == up) ? (y--) : (y++)));

	if (x > wall(right) && value == MISSILE) return null;  //missiles dont wrap around

	(x > wall(right)) ? (x = wall(left)) : ((x < wall(left)) ? (x = wall(right)) : ((y > wall(down)) ? (y = wall(up)) : ((y < wall(up)) ? (y = wall(down)) : (null))));
	return {direction:dir, x:x, y:y};
}


function timeToMove(object) {
	if (object == SNAKE) return game.frames%snakespeed == 0;
	else if (object == CLONE) return game.frames%(snakespeed+8) == 0;
	else if (object == MISSILE) return game.frames%5 == 0;
	else if (object == BOMB) return (game.has(FROG)) ? ((game.frames+2)%5 == 0 && game.frames%100 > 30 && game.frames%100 < 60) : ((game.frames+2)%20 == 0);
	else if (object == FRUIT) return (game.has(FROG)) ? (game.frames%4 == 0 && game.frames%100 > 30 && game.frames%100 < 60) : (game.frames%4 == 0);
}

function collectedFruit(x, y, is_clone) {
	game.get(FRUIT).splice(game.get(FRUIT).findIndex(item => item.x === x && item.y === y), 1);
	playSound();
	if (is_clone != true) { 
		game.updateScore();
		if (!game.has(INFINITE)) lengthenSnake({x:game.get(SNAKE).tail.x, y:game.get(SNAKE).tail.y}, 2);
	}

	if (game.has(WALLS) && game.score.fruit%4 == 0) shrinkBoard();
	if (game.has(PORTAL)) teleport_now = true;
	if (game.has(BOMBS) || is_clone) set(1, BOMB, x, y);

	checkHighScores();
	set(game.numfruit, FRUIT);
}

function collision(value, array, i) {
	if (value == MISSILE) {
		playSound();
		lengthenSnake({x:game.get(SNAKE).tail.x, y:game.get(SNAKE).tail.y}, 2);
		array.splice(i, 1);
	} else if (value == FRUIT) { 
		collectedFruit(game.get(SNAKE).head.x, game.get(SNAKE).head.y);
		set(1, SNAKE, game.get(SNAKE).head.x, game.get(SNAKE).head.y);
	} else if (value == BOMB) {
		reset_game = true;
	}
}

function resetBoard() {
	game.get(EMPTY).forEach(function(e) { set(1, EMPTY, e.x, e.y, true) });
	game.get(MISSILE).forEach(function(m) { if (!at(HEAD, m.x, m.y) && !at(FRUIT, m.x, m.y)) set(1, MISSILE, m.x, m.y, true) });
	game.get(SNAKE).body.forEach(function(s) { if (!at(FRUIT, s.x, s.y) && !at(WALL, s.x, s.y)) set(1, SNAKE, s.x, s.y, true) });
	game.get(FRUIT).forEach(function(f) { if (!at(BOMB, f.x, f.y)) set(1, FRUIT, f.x, f.y, true) });
	game.get(BOMB).forEach(function(b) { if (!at(SNAKE, b.x, b.y) || game.has(MOVEBOMBS)) set(1, BOMB, b.x, b.y, true) });	
	if (game.has(HAS_CLONE)) game.get(CLONE).body.forEach(function(c) { set(1, CLONE, c.x, c.y, true) });
}

function setProperties() {
	game.addProperty(BOMBS, isGame(["Movers", "Dodge", "Bombs", "Colorblind", "Flash", "Good_Luck", "No_Survivors", "Frogger", "20/20_Vision"], game.type));
	game.addProperty(MOVEFRUIT, isGame(["Movers", "Frogger", "Good_Luck", "No_Survivors"], game.type));
	game.addProperty(MOVEBOMBS, isGame(["Dodge", "Good_Luck", "No_Survivors", "Frogger"], game.type));
	game.addProperty(HASMISSILES, isGame(["Shots_Fired", "No_Survivors"], game.type));
	game.addProperty(FLASH, isGame("Flash", game.type));
	game.addProperty(GRADE, isGame("20/20_Vision", game.type));
	game.addProperty(REDBOMBS, isGame(["Colorblind", "Good_Luck", "No_Survivors"], game.type));
	game.addProperty(TICK, isGame("Tick_Tock", game.type));
	game.addProperty(FROG, isGame("Frogger", game.type));
	game.addProperty(HAS_CLONE, isGame("Phantom_Snake", game.type));
	game.addProperty(WALLS, isGame("Boxed_In", game.type));
	game.addProperty(INFINITE, isGame("Infinity", game.type));
	game.addProperty(PORTAL, isGame("Portal", game.type));

	if (game.has(INFINITE)) game.numfruit = 3;
	if (game.has(PORTAL)) game.numfruit = 2;
}

function gameReset() {
	unlockGames(); 

	document.getElementById(game.type).style.fontWeight = "normal";
	document.getElementById(game.type).style.filter = "none";
	if (game.type == "Classic") document.getElementById(game.type).innerHTML = game.type;
}

function gameOverScreen() {
	window.cancelAnimationFrame(globalID);
	globalID = undefined;
	game.animating = false;

	let death_screen = document.createElement("div");
	death_screen.setAttribute("class", "game-over popup");
	
	let message = document.createElement("div");
	let restart = document.createElement("button");
	let choose_another = document.createElement("button");
	
	message.setAttribute("id", "message");
	message.innerHTML = "Sorry! You died.<br>Fruit taken: " + game.score.fruit + "<br>Total score: " + game.score.points;
	
	restart.setAttribute("id", "restart");
	restart.innerHTML = "Try again!";

	choose_another.setAttribute("class", "close");
	
	death_screen.appendChild(message);
	death_screen.appendChild(restart);
	death_screen.appendChild(choose_another);
	
	document.getElementById("container").appendChild(death_screen);
}

function gameOver(x, y) {
	return at(SNAKE, x, y) || at(BOMB, x, y) || (game.get(SNAKE).body.some(e => e.x === x && e.y === y) && (x != game.get(SNAKE).head.x || y != game.get(SNAKE).head.y));
}

function at(value, x, y) {
	if (value == HEAD) return (x == game.get(SNAKE).head.x && y == game.get(SNAKE).head.y);
	if (value == CLONEHEAD) return !game.has(HAS_CLONE) ? false : (x == game.get(CLONE).head.x && y == game.get(CLONE).head.y);
	
	return grid.get(x, y) == value;
}

function isGame(gamelist, current_game) {
	return gamelist.includes(current_game);
}

function getDirection(value) {
	return value == MISSILE ? right : (value == FRUIT ? Math.round(Math.random()*3) : (value == BOMB ? oppositeDirection(game.get(SNAKE).direction) : null));
}

function lengthenSnake(tail, growth_rate) {
	for (let i = 0; i < growth_rate; i++){			
		if (at(EMPTY, tail.x, tail.y)) set(1, SNAKE, tail.x, tail.y);
		game.get(SNAKE).atend(tail.x, tail.y);
	}
}

function checkHighScores() {
	if (game.score.points > getScore(game.type)) setScore(game.type, game.score.points);
	if (game.score.fruit > getFruitScore(game.type)) setFruitScore(game.type, game.score.fruit);
}

function playSound() {
	document.getElementById("fruitsound").pause();
	document.getElementById("fruitsound").currentTime = 0;
	document.getElementById("fruitsound").play();
}

function oppositeDirection(direction) {
	return (direction + 2) % 4;
}

function teleportSnake(snake, fruit) {
	set(1, EMPTY, fruit[0].x, fruit[0].y);   //remove this and youll get game.get(FRUIT) forever
	snake.insert(fruit[0].x, fruit[0].y);
	fruit.splice(0, 1);
	teleport_now = false;
}

function shrinkBoard() {
	for (let i = wall(up); i <= wall(down); i++) {
		set(1, WALL, i, wall(up));
		set(1, WALL, i, wall(down));
		set(1, WALL, wall(left), i);
		set(1, WALL, wall(right), i);
	}
	
	game.rows = game.cols -= 2;
}

function wall(side) {
	return (side == left) ? ((grid.width-game.cols)/2) : ((side == right) ? (game.cols-1+(grid.width-game.cols)/2) : ((side == up) ? ((grid.height-game.rows)/2) : (game.rows-1+(grid.height-game.rows)/2)));
}

function flashTime(x, y) {
	let index = game.get(BOMB).findIndex(b => b.x === x && b.y === y)
    return game.get(BOMB)[index].age%100 > 50 && game.get(BOMB)[index].age%100 < 99;
}