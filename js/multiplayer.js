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
  if (firebase.apps.length === 0) {
    initFirebase();
  }

  console.log('auth with google');
  authWithGoogle().then(
    function(result) {

      myUID = firebase.auth().currentUser.uid;
      myUID = $( '#playerID' ).val();
      setPlayerStatus( 'Online' );
      // set me offline when I go offline.
      firebase.database().ref('/players/' + myUID + '/status').onDisconnect().set("Offline");

      console.log('finding game');
      findGame(myUID).then(
        function(dbGames) {

          games = dbGames.val();
          if ( games === null || games === undefined ) {
            console.log('creating new game');
            createNewGame().then(

              waitForPlayers( _gameID )
            );
          } else {
            games = Object.keys(games)[0];
            waitForPlayers(games);
          }
        });
    }).catch(function(error) {
      console.log(error.code);
    });





}

const addMeToPlayers = function () {
  firebase.database().ref('/games/' + _gameID + "/players/" + myUID).set(true);
}

const waitForPlayers = function ( gameID ) {
  _gameID = gameID;
  addMeToPlayers();
  let gameboard = $('#gameboard').html("");
  console.log('gameid:',_gameID, 'waiting for players...');

  let waiting = $( '<div>' )
                    .addClass('waiting')
                    .append( '<div class="loader">' )
                    .append( '<span>Waiting for Players...</span>' )

  gameboard.append( waiting );

  //now we monitor the game for additional players to join...
  let players = firebase.database().ref('/games/' + _gameID + '/players');

  players.on('value', function(snapshot) {
    let onlinePlayers = snapshot.val()
    if ( onlinePlayers === null && onlinePlayers === undefined ) {
      return;
    }

    onlinePlayers = Object.keys( onlinePlayers );

    if ( onlinePlayers.includes( myUID ) && onlinePlayers.length == 2 ) {
      // start the games
      players.off(); // turns off the listener for players
      firebase.database().ref('/waitingGames/' + _gameID).remove().then(startGame());
    } else if ( !onlinePlayers.includes( myUID ) ) {
      // add my uid
      addMeToPlayers();
    }
  });
}

const removeGameFromFirebase = function () {

  const myPlayerProfile = firebase.database().ref('/players/' + myUID + '/games')

  myPlayerProfile.once('value', function( snapshot ) {

    const games = snapshot.val();
    if ( games !== null && games !== undefined ) {
      const gameIDs = Object.keys( games );
      let update = {};

      for (let i = 0; i < gameIDs.length; i++ ) {
        update["/games/" + gameIDs[i]] = null;
      }

      firebase.database().ref().update(update)
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
    players: {
        [myUID]: true
      },
    status: 0, // waiting for players
    gameData: [["empty","empty","empty"],
               ["empty","empty","empty"],
               ["empty","empty","empty"]]
  }
  updates['/waitingGames/' + newGameKey] = {
    players: [myUID],
    status: 0, // waiting for players
  }
  updates['/players/' + myUID + "/games/" + newGameKey] = true;
  updates['players/' + myUID + "/status"] = 'Online';
  _gameID = newGameKey;

  return firebase.database().ref().update(updates);
}

const setPlayerStatus = function ( status ) {
  firebase.database().ref('players/' + myUID + "/status").set(status);
}

// const joinGame = function( gameID ) {
//   console.log("joining game", gameID);
//   //return "Joining Game"
//
//   firebase.database().ref('/games/' + gameID).once('value').then(function ( data ) {
//     onlineGame = data.val();
//     _gameID = gameID;
//     onlinePlayers = Object.keys( onlineGame.players );
//     if ( onlinePlayers.includes( myUID ) ) {
//       setPlayerStatus( 'Online' );
//       console.log(onlineGame);
//       startGame( onlineGame );
//     } else {
//       onlineGame.players[ myUID ] = true;
//       firebase.database().ref('players/' + myUID + "/games/" + gameID).set(true);
//       setPlayerStatus( 'Online' );
//       console.log(onlineGame);
//       firebase.database().ref('/games/' + gameID).update(onlineGame).then( startGame( onlineGame ) );
//     }
//   });
// }

const multiIsMyTurn = function () {
  return _onlinePlayers[player] === myUID
}

const takeSlotMulti = function () { // take a slot (triggered by click)

  if ( multiIsMyTurn() ) {
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

    if ( multiIsMyTurn() ) {
      updateWinCount( true ); // TODO: is defined but does nothing;
    } else {
      updateWinCount( false );
    }

    winDisplay( winInfo, resetOnlineGame ); //ref: tic-tac-toe.js
  }

  // switch players
  switchPlayers(); // ref: tic-tac-toe.js
}

const updateWinCount = function ( win ){
  // get current player ID's win/loss stats

  // put this in callback function
  if ( win === true ) {
    // player.win ++
  } else {
    // player.loss ++
  }

  // update player stats

};

const updateMultiWinDisplay = function (){};

const receiveRemoteGameData = function ( snapshot ) {
  //if foo then finishturn,
  // else if null removeGameFromFirebase and boottomenu
  if ( snapshot === null || snapshot === undefined ) {
    removeGameFromFirebase();
    bootToMenu();
  } else if ( snapshot.lastSlotID !== undefined ) {
    _onlineGame = snapshot;
    finishTurn();
  }
}

const resetOnlineGame = function() {
  firebase.database().ref('/games/' + _gameID).off()

  updates['/games/' + _gameID] = {
    players: null,
    status: 0, // waiting for players
    gameData: [["empty","empty","empty"],
               ["empty","empty","empty"],
               ["empty","empty","empty"]]
  }

  firebase.database().ref().update(updates).then( waitForPlayers( _gameID ));
}

const updateRemoteGameData = function ( gameData, slotID ) {
  console.log('update remote game data');
  _onlineGame.gameData = gameData;
  _onlineGame.lastSlotID = slotID;

  updates = {}
  updates["/games/" + _gameID] = _onlineGame

  firebase.database().ref().update(updates);
}

const startGame = function () {

  game = firebase.database().ref('/games/' + _gameID);
  game.once('value', function(snapshot) {
    _onlineGame = snapshot.val()
    player = "Nought"
    // updateMultiWinDisplay(); // TODO: is defined but does nothing;

    resetGameBoard(); // ref: tic-tac-toe.js

    aiEnabled = false;

    const onlinePlayers = Object.keys(_onlineGame.players);
    _onlinePlayers.Nought = onlinePlayers[0];
    _onlinePlayers.Cross = onlinePlayers[1];

    // select player to track
    let trackPlayer = onlinePlayers[0];
    if (onlinePlayers[0] === myUID) {
      trackPlayer = onlinePlayers[1];
    }

    console.log('tracking player',trackPlayer);
    firebase.database().ref('/players/' + trackPlayer + '/status').on('value', function (snapshot){
      let status = snapshot.val()
      console.log('status change detected:', status);
      if (status === 'Offline') {
        setPlayerStatus('Offline');
        firebase.database().ref('/players/' + trackPlayer + '/status').off();
        removeGameFromFirebase();
        bootToMenu();
      }
    });

    addClickEvents( takeSlotMulti ); // ref: tic-tac-toe.js

    // start watching game data
    game.on('value', function(snapshot) {
      receiveRemoteGameData( snapshot.val() );
    });
  });

}

const findGame = function( userId ) {
  return firebase.database().ref('waitingGames/').once('value')

}
