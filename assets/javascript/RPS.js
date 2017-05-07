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
$nameInput = $("#name-input");
$nameSubmit = $("#name-submit");
$chatBox = $("#chat-box");
$chatInput = $("#chat-input");
$chatSubmit = $("#chat-submit");

// other variables
var playerName = "";
var otherPlayer = "";

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
database.ref("disconnect").update({
	onlineState: true
});
database.ref("disconnect").onDisconnect().update({
	onlineState: false
});