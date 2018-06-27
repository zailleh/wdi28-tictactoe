// This JS file contains functions used for multiplayer functionality. Will be required by tic-tac-toe.js

const startMulti = function() {
  // TODO: loading screen
  initFirebase();
  authWithGoogle().then(
    function(result) {

      findGame(firebase.auth().currentUser.uid).then(
        function(dbGames) {

          games = dbGames.val();

          if ( games === null ) {
            createNewGame().then(
              function( game ){

                waitForPlayers( game ).then(
                  function(result) {

                    joinGame();
                  })
                });
          } else {
            joinGame(games);
          }
        });
    }).catch(function(error) {
      return error.code
    });
}

const waitForPlayers = function () {
  let gameboard = $('#gameboard').html("");
  console.log('waiting for players...');

  let waiting = $( '<div>' )
                    .addClass('waiting')
                    .append( '<div class="loader">' )
                    .append( '<span>Waiting for Players...</span>' )



  gameboard.append( waiting );

}

const initFirebase = function() {

  console.log('initialising firebase');
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCFBL_M--2z9AFuBlI3NDQ3zELtDEqhHlU",
    authDomain: "wdi28-tic-tac-toe.firebaseapp.com",
    databaseURL: "https://wdi28-tic-tac-toe.firebaseio.com",
    projectId: "wdi28-tic-tac-toe",
    storageBucket: "wdi28-tic-tac-toe.appspot.com",
    messagingSenderId: "289577692536"
  };

  firebase.initializeApp(config);
}

const authWithGoogle = function() {
  let provider = new firebase.auth.GoogleAuthProvider();
  let response = false;

  return firebase.auth().signInWithPopup(provider);
}

const createNewGame = function() {
  console.log("creating new game");
  let userId = firebase.auth().currentUser.uid;
  let newGameKey = firebase.database().ref().child('games').push().key;

  let updates = {};
  updates['/games/' + newGameKey] = {
    players: [userId],
    status: 0, // waiting for players
  }
  updates['/waitingGames/' + newGameKey] = {
    players: [userId],
    status: 0, // waiting for players
  }
  updates['/players/' + userId + "/" + newGameKey] = true;

  return firebase.database().ref().update(updates);
}

const joinGame = function() {
  console.log("joining game");
  //return "Joining Game"
}

const findGame = function(userId) {
  let games;
  let promiseComplete = false;
  let timeout = 2000; //milliseconds

  return firebase.database().ref('games/').once('value')
}
