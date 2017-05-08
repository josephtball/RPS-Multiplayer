// Initialize Firebase
var config = {
	apiKey: "AIzaSyAjwWk7F7h19MPvFcoOA7GziEryVH8J5Ko",
	authDomain: "rock-paper-scissors-81b75.firebaseapp.com",
	databaseURL: "https://rock-paper-scissors-81b75.firebaseio.com",
	projectId: "rock-paper-scissors-81b75",
	storageBucket: "rock-paper-scissors-81b75.appspot.com",
	messagingSenderId: "4168196691"
};
firebase.initializeApp(config);
// set database to a variable
var database = firebase.database();

// set DOM elements to variables
$nameSection = $("#name-section");
$nameInput = $("#name-input");
$nameSubmit = $("#name-submit");

$player1Div = $("#player1");
$centerDiv = $("#center");
$player2Div = $("#player2");

$chatBox = $("#chat-box");
$chatInput = $("#chat-input");
$chatSubmit = $("#chat-submit");

// other variables
var turn = 0;

var playerName = "";
var playerNum = 0;
var playerChoice = "";
var playerWins = 0;
var playerLosses = 0;

var OPName = "";
var OPNum = 0;
var OPChoice = "";
var OPWins = 0;
var OPLosses = 0;


// enter new player
$nameSubmit.on("click", function() {
	event.preventDefault();
	console.log("new player ran");

	database.ref("players").once("value", function(snapshot) {
		var numOfPlayers = snapshot.numChildren();
		// if 2 players have started yet
		if (numOfPlayers < 2) {
			playerName = $nameInput.val().trim();
			// store new player as player 1 or 2
			if (snapshot.child("1").exists()) {
				database.ref("players/2").set({
					name: playerName,
					choice: "",
					wins: 0,
					losses: 0,
				});
				playerNum = 2;
				OPNum = 1;
			} else {
				database.ref("players/1").set({
					name: playerName,
					choice: "",
					wins: 0,
					losses: 0,
				});
				playerNum = 1;
				OPNum = 2;
			}

			$nameSection.empty();
			var h4Tag = $("<h4>").text("Hi "+playerName+"! You are Player "+playerNum+".");
			$nameSection.append(h4Tag);
		} else { // message for when 2 players are already playing a game
			alert("Game is full. Please wait for a player to leave.");
			$nameInput.val("");
		}
	});
});
	

// display current players
database.ref("players").on("child_added", currentPlayers);

function currentPlayers() {
	console.log("currentPlayers ran");
	database.ref().once("value", function(snapshot) {
		if (snapshot.val().players["1"] !== undefined) {
			$player1Div.empty();

			var h3Tag = $("<h3>").text(snapshot.val().players["1"].name);
			var divTag = $("<div>").addClass("selection").attr("id", "selection1");
			var pTag =$("<p>").html("Wins: <span id='p1Wins'>"+snapshot.val().players["1"].wins+"</span> Losses: <span id='p1Losses'>"+snapshot.val().players["1"].losses+"</span>");
			$player1Div.append(h3Tag).append(divTag).append(pTag);
		}
		if(snapshot.val().players["2"] !== undefined) {
			$player2Div.empty();

			var h3Tag = $("<h3>").text(snapshot.val().players["2"].name);
			var divTag = $("<div>").addClass("selection").attr("id", "selection2");
			var pTag =$("<p>").html("Wins: <span id='p2Wins'>"+snapshot.val().players["2"].wins+"</span> Losses: <span id='p2Losses'>"+snapshot.val().players["2"].losses+"</span>");
			$player2Div.append(h3Tag).append(divTag).append(pTag);
		}
		var numOfPlayers = snapshot.val().players;
		numOfPlayers = Object.keys(numOfPlayers);
		numOfPlayers = numOfPlayers.length;
		if (numOfPlayers === 2) {
			OPName = snapshot.val().players[OPNum].name;
			turn = 1;
			database.ref("turns").update({
				turn: turn,
			});
			//database.ref("players").off("child_added", currentPlayers);
			player1Turn();
		}
	});
}
/*
// remove disconnected players
database.ref("players").on("child_removed", function(snapshot) {
	
	if (playerNum === 2) {
		$player1Div.empty();

		var h3Tag = $("<h3>").text("Waiting for Player 1");
		$player1Div.append(h3Tag)
	}
	if(playerNum === 1) {
		$player2Div.empty();

		var h3Tag = $("<h3>").text("Waiting for Player 2");
		$player2Div.append(h3Tag)
	}
});
database.ref("players/"+playerNum).onDisconnect().remove();
*/
// start game
function player1Turn() {
	console.log("player1Turn ran");
	$("#selection1").empty();
	$("#selection2").empty()

	var dbTurn;
	database.ref("turns").once("value", function(snapshot) {
		dbTurn = snapshot.val().turn;
	}).then(function() {
		turn = dbTurn;
		// if player 1
		if (turn === playerNum) {
			$("#selection1").empty();
			$centerDiv.empty();

			var rock = $("<h4>").text("Rock").addClass("choice").attr("id", "Rock");
			var paper = $("<h4>").text("Paper").addClass("choice").attr("id", "Paper");
			var scissors = $("<h4>").text("Scissors").addClass("choice").attr("id", "Scissors");

			$("#selection1").append(rock).append(paper).append(scissors);

			$centerDiv.append("<h3>It's Your Turn</h3>");

			$(".choice").on("click", function() {
				playerChoice = $(this).attr("id");

				$("#selection1").empty();
				$("#selection1").append("<h2>"+playerChoice+"</h2>");

				database.ref("players/1").update({
					choice: playerChoice
				});
				turn = 2;
				database.ref("turns").update({
					turn: turn
				});
			});
			database.ref("turns").on("child_changed", player2Turn);
		// if player 2
		} else {
			$centerDiv.empty();

			$centerDiv.append("<h3>Waiting for "+OPName+" to choose.</h3>");
			database.ref("turns").on("child_changed", player2Turn);
		}
	});
}


function player2Turn() {
	console.log("player2Turn ran");
	database.ref("turns").off("child_changed", player2Turn);

	var dbTurn;
	database.ref("turns").once("value", function(snapshot) {
		dbTurn = snapshot.val().turn;
	}).then(function() {
		turn = dbTurn;
		// if player 2
		if (turn === playerNum) {
			$("#selection2").empty();
			$centerDiv.empty();

			var rock = $("<h4>").text("Rock").addClass("choice").attr("id", "Rock");
			var paper = $("<h4>").text("Paper").addClass("choice").attr("id", "Paper");
			var scissors = $("<h4>").text("Scissors").addClass("choice").attr("id", "Scissors");

			$("#selection2").append(rock).append(paper).append(scissors);

			$centerDiv.append("<h3>It's Your Turn</h3>");

			$(".choice").on("click", function() {
				playerChoice = $(this).attr("id");

				$("#selection2").empty();
				$("#selection2").append("<h2>"+playerChoice+"</h2>");

				database.ref("players/2").update({
					choice: playerChoice
				});
				turn = 3;
				database.ref("turns").update({
					turn: turn
				});
			});
			database.ref("turns").on("child_changed", decideWinner);
		// if player 1
		} else {
			$centerDiv.empty();

			$centerDiv.append("<h3>Waiting for "+OPName+" to choose.</h3>");
			database.ref("turns").on("child_changed", decideWinner);
		}
	});
}

function decideWinner() {
	console.log("decideWinner ran");
	database.ref("turns").off("child_changed", decideWinner);

	database.ref("players/"+OPNum).once("value", function(snapshot) {
		OPChoice = snapshot.val().choice;

		$("#selection"+OPNum).append("<h2>"+OPChoice+"</h2>")
		$centerDiv.empty();

		switch(playerChoice) {
			case "Rock":
				switch(OPChoice) {
					case "Rock":
						$centerDiv.append("<h3>It's a Tie!</h3>");
						break;
					case "Paper":
						$centerDiv.append("<h3>"+OPName+" Wins!</h3>");
						playerLosses++;
						break;
					case "Scissors":
						$centerDiv.append("<h3>You Win!</h3>");
						playerWins++;
						break;
					default:
				}
				break;
			case "Paper":
				switch(OPChoice) {
					case "Rock":
						$centerDiv.append("<h3>You Win!</h3>");
						playerWins++;
						break;
					case "Paper":
						$centerDiv.append("<h3>It's a Tie!</h3>");
						break;
					case "Scissors":
						$centerDiv.append("<h3>"+OPName+" Wins!</h3>");
						playerLosses++;
						break;
					default:
				}
				break;
			case "Scissors":
				switch(OPChoice) {
					case "Rock":
						$centerDiv.append("<h3>"+OPName+" Wins!</h3>");
						playerLosses++;
						break;
					case "Paper":
						$centerDiv.append("<h3>You Win!</h3>");
						playerWins++;
						break;
					case "Scissors":
						$centerDiv.append("<h3>It's a Tie!</h3>");
						break;
					default:
				}
				break;
		}

	}).then(function() {
		database.ref("players/"+playerNum).update({
			wins: playerWins,
			losses: playerLosses
		});
		console.log("update complete")
	}).then(updateStats);
}

function updateStats() {
	console.log("updateStats ran");
	turn = 1;
	database.ref("turns").update({
		turn: turn
	});
	database.ref("players/"+OPNum).on("value", function(snapshot) {
		console.log(snapshot.val());
		OPWins = snapshot.val().wins;
		OPLosses = snapshot.val().losses;
		console.log("OPWins: "+OPWins);
		console.log("OPLosses: "+OPLosses);

		$("#p"+playerNum+"Wins").text(playerWins);
		$("#p"+playerNum+"Losses").text(playerLosses);
		$("#p"+OPNum+"Wins").text(OPWins);
		$("#p"+OPNum+"Losses").text(OPLosses);

	});

	setTimeout(player1Turn, 2000);
}








// get chat message function
$chatSubmit.on("click", function() {
	event.preventDefault();
	// set message to a variable
	var message = $chatInput.val().trim();
	// store message in database
	database.ref("messages").set({
		chat: {
			playerName: playerName,
			message: message
		}
	});
	// clear input field
	$chatInput.val("");
});

// write new message function
database.ref("messages").on("child_changed", function(snapshot){
	// store new message from database as a variable
	var newMessage = $("<p>").addClass("message").text(snapshot.val().playerName+": "+snapshot.val().message);
	// display message in chat box
	$chatBox.append(newMessage);
});