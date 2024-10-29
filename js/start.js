unlocked = false;

games = [
	{ name: "Classic", score: 30, title: "Classic", dev: 126 },
	{ name: "Bombs", score: 20, title: "Bombs", dev: 38 },
	{ name: "Colorblind", score: 18, title: "Colorblind", dev: 31 },
	{ name: "20/20_Vision", score: 18, title: "20/20 Vision", dev: 35 },
	{ name: "Boxed_In", score: 25, title: "Closing In", dev: 37 },
	{ name: "Infinity", score: 30, title: "And Beyond", dev: 90 },
	{ name: "Movers", score: 17, title: "Track Star", dev: 28 },
	{ name: "Portal", score: 30, title: "Portal", dev: 47 },
	{ name: "Tick_Tock", score: 28, title: "Tick Tock", dev: 38 },
	{ name: "Flash", score: 16, title: "Light Switch", dev: 31 },
	{ name: "Phantom_Snake", score: 25, title: "Phantom Snake", dev: 44 },
	{ name: "Dodge", score: 13, title: "Dodgeball", dev: 21 },
	{ name: "Frogger", score: 12, title: "Frogger", dev: 19 },
	{ name: "Good_Luck", score: 11, title: "Good Luck", dev: 15 },
	{ name: "Shots_Fired", score: 16, title: "Shots Fired", dev: 27 },
	{ name: "No_Survivors", score: 0, title: "No Survivors", dev: 12 },
];

$(document).ready(function(){
	readDescriptions();
	createButtons();
	setFontSize();
	unlockGames();
	original();
	setColors();

	$(window).resize(function() {
		setFontSize();
	});

	$("button.game").mouseover(
		function(){
			if (text != null) $(".descriptions").html("<span class = 'name'>" + games[games.map(function(e) { return e.name; }).indexOf($(this).attr('id'))].title.toUpperCase() + "</span>: " + text[games.map(function(e) { return e.name; }).indexOf($(this).attr('id'))+1]);
			else $(".descriptions").html("<span class = 'name'> NAME</span>: This is where your description of your game would go if you could read! But you can't, haha!");

			if (getScore($(this).attr('id')) == null) setScore($(this).attr('id'), 0);
			if (getFruitScore($(this).attr('id')) == null) setFruitScore($(this).attr('id'), 0);
						
			$(".high-score").html("<p>HIGH SCORE: " + getScore($(this).attr('id')) + "<br> MOST FRUIT: " + getFruitScore($(this).attr('id')) + "</p>");

			if ($(this).attr('id') != games.at(-1).name && getFruitScore($(this).attr('id')) < scoreToContinue($(this).attr('id')))
					$(".score-to-beat").html("Collect " + scoreToContinue($(this).attr('id')) + " fruit to progress.");
			else $(".score-to-beat").html("Dev Score: " + games[games.findIndex(g => g.name === $(this).attr('id'))].dev + " fruit");
		});

		$("button.game").mouseleave(
			function(){
				$(".high-score").empty();
				original();
			}
		);

		$("button.settings").click(function() {
				$(this).prop("disabled", true);
				showSettings();
			}
		);

		$("button.unlock").click(function() {
			$(this).prop("disabled", true);
			createCheatCodeBox();
		});

		$(document).on("click", "#restart", function() {
				setGame(game.type);
			}
		);
		
		$(document).on("click", ".close", function() {
			$(".popup").remove();
			$("button:not(.game)").prop("disabled", false);
		});

		$(document).on("click", ".cheatcode", function() {
			enterCheatCode();
		});

		$(document).on("click", ".save", function() {
			fruit_color = $("#fruit").val();
			localStorage.setItem("fruit", $("#fruit").val());

			snake_color = $("#snake").val();
			localStorage.setItem("snake", $("#snake").val());

			bomb_color = $("#bomb").val();
			localStorage.setItem("bomb", $("#bomb").val());

			grid_color = $("#grid_color").val();
			localStorage.setItem("grid", $("#grid_color").val());

			gridlines_color = $("#gridlines").val();
			localStorage.setItem("gridlines", $("#gridlines").val());

			$(".popup").remove();
			$("button.settings").prop("disabled", false);			
		});

		$(document).on("click", ".reset", function() {
			fruit_color = "#ff0000";
			snake_color = "#ffa500";
			bomb_color = "#000000";
			grid_color = "#ffffff";
			gridlines_color = "#ededed";

			localStorage.removeItem("fruit");
			localStorage.removeItem("snake");
			localStorage.removeItem("bomb");
			localStorage.removeItem("grid");
			localStorage.removeItem("gridlines");

			$("#fruit").val(fruit_color);
			$("#snake").val(snake_color);
			$("#bomb").val(bomb_color);
			$("#grid_color").val(grid_color);
			$("#gridlines").val(gridlines_color);
		});

	//localStorage.clear();   //uncomment to clear highscores
});

function enterCheatCode() {
	var cheatcode = document.getElementById("cheatcode").value.toUpperCase();

	if (cheatcode == "SNAKESIXTEEN") {
		games.forEach(function(g) {
			document.getElementById(g.name).disabled = false;
			document.getElementById(g.name).innerHTML = g.title;
			unlocked = true;
		});
	} else {
		console.log("Wrong!");
	}
}

function createCheatCodeBox() {
	var unlock = document.createElement("div");
	unlock.setAttribute("class", "unlock popup");

	var close = document.createElement("button");
	close.setAttribute("class", "close");

	var input = "  <label for='cheatcode'>Enter passcode: </label><input type='text' id='cheatcode' name='cheatcode' style='text-transform: uppercase;' autofocus>" + 
					"<button class = 'cheatcode'>Unlock all levels</button>"

	unlock.innerHTML += input;

	unlock.appendChild(close);
	$("#container").append(unlock);
}

function setColors() {
	if (localStorage.getItem("gridlines") == null) gridlines_color = "#ededed";
	else gridlines_color = localStorage.getItem("gridlines");

	if (localStorage.getItem("grid") == null) grid_color = "#ffffff";
	else grid_color = localStorage.getItem("grid"); 
	
	if (localStorage.getItem("fruit") == null) fruit_color = "#ff0000";
	else fruit_color = localStorage.getItem("fruit");
	
	if (localStorage.getItem("snake") == null) snake_color = "#ffa500";
	else snake_color = localStorage.getItem("snake");

	if (localStorage.getItem("bomb") == null) bomb_color = "#000000";
	else bomb_color = localStorage.getItem("bomb");

	clone_color = "gray";
	clone_head_color = "black";
	wall_color = "#2b2b2b";	
}

function showSettings() {
	let settings = document.createElement("div");
	settings.setAttribute("class", "settings popup");

	let close = document.createElement("button");
	close.setAttribute("class", "close");

	let fruit_color_picker = "<span class = 'color-picker'><label for='fruit'>Fruit color:</label><input type='color' id='fruit' value=" + fruit_color + "></span>"
	let snake_color_picker = "<span class = 'color-picker'><label for='snake'>Snake color:</label><input type='color' id='snake' value=" + snake_color + "></span>"
	let bomb_color_picker = "<span class = 'color-picker'><label for='bomb'>Bomb color:</label><input type='color' id='bomb' value=" + bomb_color + "></span>"
	let grid_color_picker = "<span class = 'color-picker'><label for='grid_color'>Grid color:</label><input type='color' id='grid_color' value=" + grid_color + "></span>"
	let gridlines_color_picker = "<span class = 'color-picker'><label for='gridlines'>Gridlines:</label><input type='color' id='gridlines' value=" + gridlines_color + "></span>"

	let color_selector = "<div id = 'colors'>" + fruit_color_picker + bomb_color_picker + snake_color_picker + 
							grid_color_picker + gridlines_color_picker + "</div><button class = 'save'>Save</button><button class = 'reset'>Reset</button>";

	settings.appendChild(close);
	settings.innerHTML += color_selector;
	$("#container").append(settings);
}

function setFontSize() {
	var height = $("#screen").height();
	$("html").css({ fontSize: height/40 });	
}

function original() {
	if (text != null) description = text[0];
	else description = "This is SNAKE, with 15 alternate versions. Take a look! Use the arrows keys to move around the grid. Collect as many fruit as you can without hitting yourself (walls are ok). Good luck!";
	
	$(".instructions").html(description);
	$(".description").html("Want to try a different level? Place your mouse over a level to see what you're in for.");
	$(".score-to-beat").html("SNAKE by Star")
}

function createButtons() {
	games.forEach(function(g) {
		document.getElementById("games").innerHTML += "<button class = 'game' id = '" + g.name + 
		"' onclick = setGame('" + g.name + "')>" + g.title + "</button>";
	});
}

function readDescriptions() {
	text = null;
	var txtFile = new XMLHttpRequest();
	txtFile.open("GET", "../static/descriptions.txt", true);
	txtFile.onreadystatechange = function() {
  		if (txtFile.readyState === 4) {  // document is ready to parse.
    		if (txtFile.status === 200) {  // file is found
      			allText = txtFile.responseText; 
      			text = txtFile.responseText.split("\n");
    		}
  		}
	}

	txtFile.send(null);
}

function unlockGames() {
	for (i = 0; i < games.length-1; i++) {
		if (getFruitScore(games[i].name) >= games[i].score || unlocked) { 
			document.getElementById(games[i+1].name).disabled = false;
			document.getElementById(games[i+1].name).innerHTML = games[i+1].title;
		} else { 
			document.getElementById(games[i+1].name).disabled = true;
			document.getElementById(games[i+1].name).innerHTML = "LOCKED"
		}
	}
}

function scoreToContinue(gametype) {
	return games[games.map(function(e) { return e.name; }).indexOf(gametype)].score;
}

function getScore(gametype) {
	return localStorage.getItem(gametype + location.pathname);
}

function getFruitScore(gametype) {
	return localStorage.getItem(gametype + location.pathname + 'fruit');
}

function setScore(gametype, value) {
	localStorage.setItem(gametype + location.pathname, value);
}

function setFruitScore(gametype, value) {
	localStorage.setItem(gametype + location.pathname + 'fruit', value);
}
