// This JS file contains functions used for multiplayer functionality. Will be required by tic-tac-toe.js
const _onlinePlayers = {
  Nought: null,
  Cross: null
};

let _onlineGame;
let _gameID;
let myUID;

const startMulti = function() {
  // TODO: loading screen
  initFirebase();
  authWithGoogle().then(
    function(result) {

      myUID = firebase.auth().currentUser.uid
      myUID = $( '#playerID' ).val()

      findGame(myUID).then(
        function(dbGames) {

          games = dbGames.val();
          if ( games === null || games === undefined ) {
            createNewGame().then(
              waitForPlayers( _gameID )
            );
          } else {
            games = Object.keys(games)[0];
            joinGame(games);
          }
        });
    }).catch(function(error) {
      return error.code
    });
}

const waitForPlayers = function ( gameID ) {
  let gameboard = $('#gameboard').html("");
  console.log('gameid:',gameID, 'waiting for players...');

  let waiting = $( '<div>' )
                    .addClass('waiting')
                    .append( '<div class="loader">' )
                    .append( '<span>Waiting for Players...</span>' )

  gameboard.append( waiting );

  //now we monitor the game for additional players to join...

  let players = firebase.database().ref('/games/' + gameID + '/players');

  players.on('value', function(snapshot) {
    const playersJoined = snapshot.val()
    if ( playersJoined.length === 2 ) {
      players.off();
      firebase.database().ref('/waitingGames/' + gameID).remove().then(joinGame( gameID ));
    }
  });
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
  let newGameKey = firebase.database().ref().child('games').push().key;

  let updates = {};
  updates['/games/' + newGameKey] = {
    players: [myUID],
    status: 0, // waiting for players
    gameData: [["empty","empty","empty"],
               ["empty","empty","empty"],
               ["empty","empty","empty"]]
  }
  updates['/waitingGames/' + newGameKey] = {
    players: [myUID],
    status: 0, // waiting for players
  }
  updates['/players/' + myUID + "/" + newGameKey] = true;

  _gameID = newGameKey;

  return firebase.database().ref().update(updates);
}

const joinGame = function( gameID ) {
  console.log("joining game", gameID);
  //return "Joining Game"

  firebase.database().ref('/games/' + gameID).once('value').then(function ( data ) {
    onlineGame = data.val();
    _gameID = gameID;
    if ( onlineGame.players.includes( myUID ) ) {
      startGame( onlineGame );
    } else {
      onlineGame.players.push( myUID );
      firebase.database().ref('/games/' + gameID).update(onlineGame).then( startGame( onlineGame ) );
    }
  });
}

const takeSlotMulti = function () { // take a slot (triggered by click)

  if ( _onlinePlayers[player] === myUID ) {
    console.log('take slot - your turn');
    let id = $( this ).attr('data-id').split(',');

    gameData[+id[0]][+id[1]] = player;

    updateRemoteGameData( gameData, id.join(",") )
  } else {
    console.log('take slot - NOT your turn');

  }
}

const finishTurn = function () {
  console.log('finish turn');
  // Update local game data
  gameData = _onlineGame.gameData;
  const lastSlotID = _onlineGame.lastSlotID;

  const slotElement = $( `div[data-id="${ lastSlotID }"]` )
  // remove click event from this slot so it can't be clicked again
  slotElement.off('click')

  updateGameBoard( slotElement, player ); // ref: tic-tac-toe.js

  // Check for win;
  let winInfo = checkForWin() //ref: tic-tac-toe.js
  if ( winInfo.win === true ) {
    winDisplay( winInfo ); //ref: tic-tac-toe.js
  }

  // switch players
  switchPlayers(); // ref: tic-tac-toe.js
}

const updateRemoteGameData = function ( gameData, slotID ) {
  console.log('update remote game data');
  _onlineGame.gameData = gameData;
  _onlineGame.lastSlotID = slotID;

  updates = {}
  updates["/games/" + _gameID] = _onlineGame

  firebase.database().ref().update(updates);
}

const startGame = function ( onlineGame ) {
    _onlineGame = onlineGame
    // TODO: get / set scores in game for player ID

    //updateScoreDisplay(score); //enable when scores are retrieved from db

    resetGameBoard() // ref: tic-tac-toe.js

    aiEnabled = false;

    _onlinePlayers.Nought = _onlineGame.players[0];
    _onlinePlayers.Cross = _onlineGame.players[1];

    addClickEvents( takeSlotMulti ); // ref: tic-tac-toe.js

    // start watching game data

    let game = firebase.database().ref('/games/' + _gameID);
    game.on('value', function(snapshot) {
      _onlineGame = snapshot.val();
      console.log(_onlineGame);
      if (_onlineGame.lastSlotID !== undefined) {
        console.log( 'watch game data for change triggered');
        finishTurn();
      }
    });
}

const findGame = function( userId ) {
  let games;
  let promiseComplete = false;
  let timeout = 2000; //milliseconds

  return firebase.database().ref('games/').once('value')

}
