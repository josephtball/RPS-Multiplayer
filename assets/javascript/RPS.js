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


// enter new player
$nameSubmit.on("click", function() {
	event.preventDefault();

	database.ref("players").once("value", function(snapshot) {
		var numOfPlayers = snapshot.numChildren();

		if (numOfPlayers < 2) {
			playerName = $nameInput.val().trim();
			
			if (snapshot.child("1").exists()) {
				database.ref("players/2").set({
					name: playerName,
					wins: 0,
					losses: 0,
				});
				playerNum = 2;
			} else {
				database.ref("players/1").set({
					name: playerName,
					wins: 0,
					losses: 0,
				});
				playerNum = 1;
			}

			$nameSection.empty();
			var pTag = $("<p>").text("Hi "+playerName+"! You are Player "+playerNum+".");
			$nameSection.append(pTag);
		} else {
			alert("Game is full. Please wait for a player to leave.");
			$nameInput.val("");
		}
	});
});

// display current players
database.ref("players").on("child_added", function() {
	database.ref().on("value", function(snapshot) {
		if (snapshot.val().players["1"] !== undefined) {
			$player1Div.empty();

			var h3Tag = $("<h3>").text(snapshot.val().players["1"].name);
			var divTag = $("<div>").attr("id", "selection");
			var pTag =$("<p>").html("Wins: <span id='wins'>"+snapshot.val().players["1"].wins+"</span> Losses: <span id='losses'>"+snapshot.val().players["1"].losses+"</span>");
			$player1Div.append(h3Tag).append(divTag).append(pTag);
		}
		if(snapshot.val().players["2"] !== undefined) {
			$player2Div.empty();

			var h3Tag = $("<h3>").text(snapshot.val().players["2"].name);
			var divTag = $("<div>").attr("id", "selection");
			var pTag =$("<p>").html("Wins: <span id='wins'>"+snapshot.val().players["2"].wins+"</span> Losses: <span id='losses'>"+snapshot.val().players["2"].losses+"</span>");
			$player2Div.append(h3Tag).append(divTag).append(pTag);
		}
		var numOfPlayers = snapshot.val().players;
		numOfPlayers = Object.keys(numOfPlayers);
		numOfPlayers = numOfPlayers.length;
		console.log(numOfPlayers);
		if (numOfPlayers === 2) {
			$centerDiv.empty();
			$centerDiv.html("<h3>Game Starts</h3>");
		}
	});
});

// remove disconnected players
database.ref("players").on("child_removed", function(snapshot) {
	console.log(snapshot.val());
	
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