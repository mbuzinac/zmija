

window.onload = function() {
	if(document.body.clientWidth <= 1920) {
		var canvasWidth = 1800;
		if(document.body.clientWidth <= 1680) { canvasWidth = 1500; }
		if(document.body.clientWidth <= 1440) { canvasWidth = 1200; }
		if(document.body.clientWidth <= 1024) { canvasWidth = 900; }
		if(document.body.clientHeight <= 1080) {
			var canvasHeight = 900;
			if(document.body.clientHeight <= 900) { canvasHeight = 600; }
			if(document.body.clientHeight <= 320) { canvasHeight = 300; }
		}
	}
	
	var difficulty = document.location.hash === '#hardcore';
	var blockSize = 30;
	var game;
	var delay = 100;
	var snakee;
	var applee;
	var widthInBlocks = canvasWidth/blockSize;
	var heightInBlocks = canvasHeight/blockSize;
	var score;
	var timeOut;
	var k = 0;
	
	function init() {
		if(difficulty) { document.getElementById('sound').play(); }
		canvas = document.createElement('canvas');
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		canvas.style.backgroundColor = '#9bcc82';
		canvas.style.border = '1px solid #999999';
		canvas.style.margin = ' 30px auto';
		canvas.style.display = 'block';
		document.body.appendChild(canvas);
		game = canvas.getContext('2d');
		snakee = new snake([[2, 0], [1, 0], [0, 0]], 'right');
		applee = new apple([10, 10]);
		score = 0;
		update();
	}
	
	function hardcore() {
		if(((score*5) === 100 || (score*5) === 200) && (delay === 100 || delay === 50)) { delay -= 25; }
		if(k > 1) { k = 0; }
		marg = [20, 20];
		marg[k] += 1*score;
		canvas.style.margin = marg[0]+'px 0px 0px '+marg[1]+'px';
		return k++;
	}
	
	function update() {
		snakee.progress();
		if(snakee.collision()) { gameOver(); }
		else {
			if(snakee.eat(applee)) {
				score++;
				window.player['score'] = score*5;
				snakee.eatApple = true;
				do { applee.setNewPos(); }
				while(applee.onSnake(snakee))
			}
			game.clearRect(0, 0, canvas.width, canvas.height);
			snakee.draw();
			applee.draw();
			game.font = 'bold 20px Monospace';
			game.fillStyle = '#0f110f';
			game.textAlign = 'center';
			game.fillText("REZULTAT : "+score*5, canvasWidth/2, canvasHeight-20)
			game.fillText("JABUKA POJEDENO : "+score, canvasWidth/2, canvasHeight-5)
			timeOut = setTimeout(update, delay);
			if(difficulty) hardcore();
		}
	}
	
	function gameOver() {
		game.save();
		game.font = 'bold 60px Monospace';
		game.fillText("GAME OVER", canvasWidth/2, canvasHeight/2);
		game.font = 'bold 20px Monospace';
		game.fillText("PRITISNI SPACE ZA IGRATI PONOVNO", canvasWidth/2, (canvasHeight/2)+19);
		game.fillText("ILI ESCAPE ZA PROMJENITI IME", canvasWidth/2, (canvasHeight/2)+38);
		game.font = 'bold 30px Monospace';
		game.fillText("TVOJA POZICIJA : "+window.player['place'], canvasWidth/2, (canvasHeight-50));
		game.font = '15px Monospace';
		game.textAlign = 'left';
		game.fillText("> IGRICA ZMIJA", 5, 15);
		game.fillText("> BY MATIJA BUZINAC", 5, 30);
		if(difficulty) {
			game.fillText("> Music composed by ROBORG", 5, 45);
			game.fillText("  Midnight Murder (feat. NeoSlave)", 5, 60);
		}
		leaderBoard();
		game.restore();
	}
	
	function leaderBoard(i, z) {
		if(!z) { var z = 185; }
		if(!i) { var i = 0; game.fillText("--- Top 10 Igrača ---", 25, canvasHeight-205); }
		game.font = '15px Monospace';
		game.textAlign = 'left';
		game.fillText(leaderboard['player'][i], 5, canvasHeight-z);
		game.fillText(leaderboard['score'][i], 205, canvasHeight-z);
		z -= 20;
		i++;
		if(i < 10) { setTimeout(function() { leaderBoard(i, z); }, 25); }
	}
	
	function restart() {
		snakee = new snake([[2, 0], [1, 0], [0, 0]], 'right');
		applee = new apple([10, 10]);
		delay = 100;
		score = 0;
		clearTimeout(timeOut);
		update();
	}
	
	function drawBlock(game, pos) {
		var x = pos[0]*blockSize;
		var y = pos[1]*blockSize;
		game.fillRect(x, y, blockSize, blockSize);
	}
	
	function snake(body, direction) {
		this.body = body;
		this.direction = direction;
		this.eatApple = false;
		this.draw = function() {
			game.save();
			game.fillStyle = '#23cc16';
			for(var i = 0; i < this.body.length; i++) { drawBlock(game, this.body[i]); }
			game.restore();
		}
		this.progress = function() {
			var nextPos = this.body[0].slice();
			switch(this.direction) {
				case 'left': nextPos[0]--; break;
				case 'right': nextPos[0]++; break;
				case 'down': nextPos[1]--; break;
				case 'up': nextPos[1]++; break;
				default: throw('ERROR PROGRESS DIRECT');
			}
			this.body.unshift(nextPos);
			if(!this.eatApple) { this.body.pop(); }
			else { this.eatApple = false; }
		}
		this.setDirect = function(newDirect) {
			var allowDirect;
			switch(this.direction) {
				case 'left':
				case 'right': allowDirect = ['up', 'down']; break;
				case 'down':
				case 'up': allowDirect = ['left', 'right']; break;
				default: throw('ERROR SET DIRECT');
			}
			if(allowDirect.indexOf(newDirect) > -1) { this.direction = newDirect; }
		}
		this.collision = function() {
			var wallCollide = false;
			var snakeCollide = false;
			var horizonWall = this.body[0][0] < 0 || this.body[0][0] > widthInBlocks-1;
			var verticalWall = this.body[0][1] < 0 || this.body[0][1] > heightInBlocks-1;
			if(horizonWall || verticalWall) { wallCollide = true; }
			for(var i = 0; i < this.body.slice(1).length; i++) {
				if(this.body[0][0] === this.body.slice(1)[i][0] && this.body[0][1] === this.body.slice(1)[i][1]) { snakeCollide = true; } 
			} return wallCollide || snakeCollide;
		}
		this.eat = function(appleEat) {
			var head = this.body[0];
			if(head[0] === appleEat.position[0] && head[1] === appleEat.position[1]) { return true; }
			return false;
		}
	}
	
	function apple(pos) {
		this.position = pos;
		this.draw = function() {
			game.save();
			game.fillStyle = '#ab0d0c';
			game.beginPath();
			var radius = blockSize/2;
			var x = this.position[0]*blockSize+radius;
			var y = this.position[1]*blockSize+radius;
			game.arc(x, y, radius, 0, Math.PI*2, true);
			game.fill();
			game.restore();
		}
		this.setNewPos = function() {
			var newX = Math.round(Math.random()*(widthInBlocks-1));
			var newY = Math.round(Math.random()*(heightInBlocks-1));
			this.position = [newX, newY];
		}
		this.onSnake = function(checkSnake) {
			var onSnake = false;
			for(var i = 0; i < checkSnake.body.length; i++) {
				if(this.position[0] === checkSnake.body[i][0] && this.position[1] === checkSnake.body[i][1]) { onSnake = true; }
			} return onSnake;
		}
	}
	
	document.onkeydown = function handleKey(e) {
		var key = e.keyCode;
		var newDirect;
		switch(key) {
			case 27: document.location.href = './'; break;
			//case 32: restat(); break;
			case 32: document.location.href = './?player='+window.player['name']+'&score='+window.player['score']; break;
			case 37: newDirect = 'left'; break;
			case 38: newDirect = 'down'; break;
			case 39: newDirect = 'right'; break;
			case 40: newDirect = 'up'; break;
			default: return;
		}
		snakee.setDirect(newDirect);
	}
	
	init();
}

function snake(x) {
	switch(x) {
		case 0: document.location.hash = "#easy"; document.location.reload(); break;
		case 1: document.location.hash = "#hardcore"; document.location.reload(); break;
		default: console.log('snake()  --- HELP COMMAND\nsnake(0) --- EASY MOD\nsnake(1) --- HARDCORE MOD'); break;
	} return;
}


