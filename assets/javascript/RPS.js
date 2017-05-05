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
