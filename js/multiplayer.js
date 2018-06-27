// This JS file contains functions used for multiplayer functionality. Will be required by tic-tac-toe.js

const initFirebase = function () {

  console.log('initialising firebase');
  // Initialize Firebase
  let config = {
    apiKey: "AIzaSyCFBL_M--2z9AFuBlI3NDQ3zELtDEqhHlU",
    authDomain: "wdi28-tic-tac-toe.firebaseapp.com",
    databaseURL: "https://wdi28-tic-tac-toe.firebaseio.com",
    projectId: "wdi28-tic-tac-toe",
    storageBucket: "",
    messagingSenderId: "289577692536"
  };
  firebase.initializeApp(config);

  let auth = authWithGoogle();

  return {
    user: auth,
  }
}

const authWithGoogle = function () {
  let provider = new firebase.auth.GoogleAuthProvider();
  let response = false;

  firebase.auth().signInWithPopup(provider).then(function(result) {
    response = true;
  }).catch(function(error) {
    response = error.code
  });

  return response;
}

const findGame = function () {

  var userId = firebase.auth().currentUser.uid;

  return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
    var username = (snapshot.val() && snapshot.val().username) || 'Anonymous'
  ;})
}
