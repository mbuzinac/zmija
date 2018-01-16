<!DOCTYPE html>

<html>
	<?php
		class dataBase {
			public static function disconnect() { return self::$bdd = NULL; }
			public static function connect() {
				session_start();
				try { self::$bdd = new PDO("mysql:host=".self::$host.";dbname=".self::$dbName.";charset=".self::$encoding, self::$username, self::$password, array(PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING)); }
				catch(Exception $e) { die('ERROR: '.$e->getMessage()); }
				return self::$bdd;
			}
			
			private static $bdd;
			private static $host = 'sql312.byethost7.com'; 
			private static $dbName = 'b7_21411067_snake'; 
			private static $encoding = 'utf8';
			private static $username = 'b7_21411067';
			private static $password = '26101988'; 
		}
		
		$bdd = dataBase::connect();
		$exist = 0;
		$data = $bdd->query("SELECT * FROM snake ORDER BY score DESC");
		$player = array(); $score = array();
		for($i = 0; $i < 10; $i++) { $player[$i] = "-"; $score[$i] = "undefined"; }
		
		for($i = 0; $output = $data->fetch(PDO::FETCH_NUM); $i++) { // Top 10 des meilleurs joueurs
			if($output) { $player[$i] = $output[0]; $score[$i] = $output[1]; }
			if(isset($_GET['player']) && $_GET['player'] === $output[0]) {
				$exist = 1;
				$_SESSION['score'] = $output[1];
				$_SESSION['place'] = $i + 1;
				if(isset($_GET['score']) && $_GET['score'] > $output[1]) { $bdd->query("UPDATE snake SET score={$_GET['score']} WHERE player='{$_GET['player']}'"); }
			}
		}
		
		if(isset($_GET['player']) && !$exist) { $bdd->query("INSERT INTO snake(player) VALUE ('{$_GET['player']}')"); }
		if(isset($_GET['score'])) { header("location: ./?player={$_GET['player']}"); }
		$bdd = dataBase::disconnect();
	?>
	<head>
		<meta charset="UTF-8">
		<title>Igrica Zmija</title>
		<link rel="stylesheet" type="text/css" href="css/snake.css" />
		<?php if(isset($_GET['player'])) { echo('<script language="javascript" type="text/javascript" src="js/snakeGame.js"></script>'); } ?>
	</head>
	<body>
		<audio id="sound" style="height: 0; width: 0;">
        			<source type="audio/mpeg" src="./snake.mp3" />
        		</audio>

		<?php
			if(!isset($_GET['player'])) {
				$_SESSION['score'] = 0;
				$_SESSION['place'] = 'undefined';
				echo('<div>
					<form method="GET">
						<h1><label for="player">Zmija</label><br /></h1>
						<input type="text" id="player" name="player" placeholder="Ime" required /><br />
						<input type="submit" value="Start" />
					</form>
				</div>');
			}
		?>
	</body>
	<script>
		document.getElementById('sound').volume = 0.70;
		var player = { 'name': '<?php if(isset($_GET['player'])) { echo($_GET['player']); } ?>', 'score': <?php echo($_SESSION['score']); ?>, 'place': <?php echo($_SESSION['place']); ?> };
		var leaderboard = {
			'player': new Array(<?php echo("'$player[0]', '$player[1]', '$player[2]', '$player[3]', '$player[4]', '$player[5]', '$player[6]', '$player[7]', '$player[8]', '$player[9]'"); ?>),
			'score': new Array(<?php echo("$score[0], $score[1], $score[2], $score[3], $score[4], $score[5], $score[6], $score[7], $score[8], $score[9]"); ?>)
		};
		<?php if(!isset($_GET['player'])) { echo("document.getElementById('player').select();"); } ?>
	</script>
</html>

