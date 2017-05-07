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
var playerName = "";
var playerNum = 0;
var otherPlayerName = "";
var otherPlayerNum = 0;


// enter new player
$nameSubmit.on("click", function() {
	event.preventDefault();

	database.ref("players").once("value", newPlayer);
});
// new player function
function newPlayer(snapshot) {
		var numOfPlayers = snapshot.numChildren();
		// if 2 players have started yet
		if (numOfPlayers < 2) {
			playerName = $nameInput.val().trim();
			// store new player as player 1 or 2
			if (snapshot.child("1").exists()) {
				database.ref("players/2").set({
					name: playerName,
					wins: 0,
					losses: 0,
				});
				playerNum = 2;
				otherPlayerNum = 1;
			} else {
				database.ref("players/1").set({
					name: playerName,
					wins: 0,
					losses: 0,
				});
				playerNum = 1;
				otherPlayerNum = 2;
			}

			$nameSection.empty();
			var pTag = $("<p>").text("Hi "+playerName+"! You are Player "+playerNum+".");
			$nameSection.append(pTag);
		} else { // message for when 2 players are already playing a game
			alert("Game is full. Please wait for a player to leave.");
			$nameInput.val("");
		}
}
	

// display current players
database.ref("players").on("child_added", currentPlayers);

function currentPlayers() {
	database.ref().on("value", function(snapshot) {
		if (snapshot.val().players["1"] !== undefined) {
			$player1Div.empty();

			var h3Tag = $("<h3>").text(snapshot.val().players["1"].name);
			var divTag = $("<div>").addClass("selection").attr("id", "selection1");
			var pTag =$("<p>").html("Wins: <span id='wins'>"+snapshot.val().players["1"].wins+"</span> Losses: <span id='losses'>"+snapshot.val().players["1"].losses+"</span>");
			$player1Div.append(h3Tag).append(divTag).append(pTag);
		}
		if(snapshot.val().players["2"] !== undefined) {
			$player2Div.empty();

			var h3Tag = $("<h3>").text(snapshot.val().players["2"].name);
			var divTag = $("<div>").addClass("selection").attr("id", "selection2");
			var pTag =$("<p>").html("Wins: <span id='wins'>"+snapshot.val().players["2"].wins+"</span> Losses: <span id='losses'>"+snapshot.val().players["2"].losses+"</span>");
			$player2Div.append(h3Tag).append(divTag).append(pTag);
		}
		var numOfPlayers = snapshot.val().players;
		numOfPlayers = Object.keys(numOfPlayers);
		numOfPlayers = numOfPlayers.length;
		if (numOfPlayers === 2) {
			otherPlayerName = snapshot.val().players[otherPlayerNum].name;
			database.ref().update({
				turn: 1
			});
			database.ref("players").off("child_added", currentPlayers);
			start();
		}
	});
}

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

// start game
function start() {
database.ref("turn").on("value", function(snapshot) {
	var turn = snapshot.val();
	console.log("turn: "+turn);
	console.log("playerNum: "+playerNum);
	// player 1's turn
	if (turn === 1) {
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
				var choice = $(this).attr("id");

				database.ref("players/1").update({
					choice: choice
				});
				database.ref().update({
					turn: 2
				});

			});
		// if player 2
		} else {
			$centerDiv.empty();

			$centerDiv.append("<h3>Waiting for Other Player</h3>");
		}
	// player 2's turn
	} else if (turn === 2) {
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
				var choice = $(this).attr("id");

				database.ref("players/2").update({
					choice: choice
				});
				database.ref().update({
					turn: 3
				});

			});
		// if player 1
		} else {
			$centerDiv.empty();

			$centerDiv.append("<h3>Waiting for Other Player</h3>");
		}
	}
});
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

// write player disconnected message function
database.ref("disconnect").on("child_changed", function(snapshot){
	if (!snapshot.val()) {
		// store disconnect message as a variable
		var disconnectMessage = $("<p>").addClass("message").text(otherPlayer+" has disconnected");
		// display message in chat box
		$chatBox.append(disconnectMessage);
	}
});

// change connection status on load and unload
database.ref("players/"+playerNum).onDisconnect().remove();