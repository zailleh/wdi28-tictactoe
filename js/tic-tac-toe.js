let gameData = []; //empty array of our slots
let player = "Nought";
let score = {
  nought: 0,
  cross: 0
}

let NoughtIco = '<i class="far fa-circle"></i>'
let CrossIco = '<i class="fas fa-times"></i>'
let crossScore = $( '<span id="crossScore">' ).html(`${NoughtIco}: ${score.Nought}`).addClass("score");
let NoughtsScore = $( '<span id="NoughtsScore">' ).html(`${CrossIco}: ${score.cross}`).addClass("score");
let playAgain = '<button class="menubutton" value="0">Play Again!</button>'
let aiEnabled = true;
let aiTurn = false;
let multiPlayer = false;

const displayMyPlayer = function( player ) {
  // display you are X
  $( '#yourPlayer' ).remove();
  const $playerInfo = $( '<span>' ).text("You are playing as " + player).attr('id',"yourPlayer")
  $( '#statusDisplay' ).append( $playerInfo )
}

const displayTurn = function( turn ) {
  $( '#turnStatus' ).remove();
  const $turnInfo = $( '<span>' ).text(turn +"'s turn.").attr('id',"turnStatus")
  $( '#statusDisplay' ).append( $turnInfo )
}

// const animFadeFromBlue = function ( element, duration ) {
//
//   $( element ).
//   setInterval( function() {
//
//
//   }, 10 )
//
// }

const getScoreFromCookies = function () {
  let allCookies = document.cookie;
  allCookies = allCookies.split(';');

  let scoreCookies = {
    nought: 0,
    cross: 0
  };

  for( let i = 0; i < allCookies.length; i++ ){
    let thisCookie = allCookies[i].split('=')
    switch (thisCookie[0].trim()) {
      case 'nought':
        scoreCookies.nought = isNaN(+thisCookie[1]) ? 0 : +thisCookie[1];
        break;
      case 'cross':
        scoreCookies.cross = isNaN(+thisCookie[1]) ? 0 : +thisCookie[1];
        break;
    }
  }

  return scoreCookies;
}

const updateScoreDisplay = function ( data ) {
  $( '.score' ).remove();
  console.log(data);
  crossScore = $( '<span id="crossScore">' ).html(`${NoughtIco}: ${data.nought}`).addClass("score");
  NoughtsScore = $( '<span id="NoughtsScore">' ).html(`${CrossIco}: ${data.cross}`).addClass("score");

  $( '#title' ).append( crossScore ).prepend( NoughtsScore );
}

const setScoreInCookies = function ( score ) {
  document.cookie = `nought=${ score.nought }`
  document.cookie = `cross=${ score.cross }`
}

const updateGameBoard = function ( element, player ) {

  switch (player) {
    case 'Nought':
        $( element ).append( $( NoughtIco ) )
      break;
    default:
      $( element ).append( $( CrossIco ) )
  }
}

const resetGameBoard = function () {
  // reset gamedata and gameboard
  gameData.length = 0;
  $('#gameboard').html("");
  player = "Nought"

  // populate gamedata and gameboard
  for (let x = 0; x < 3; x++ ) {
    gameData.push([]);
    for (let y = 0; y < 3; y++ ) {
      let id = x + "," + y
      gameData[x].push("empty");
      $('#gameboard').append( $( '<div class="slot">' ).attr( 'data-id', id ) );
    }
  }
}

const addClickEvents = function ( clickFunction ) {
  $( '.slot' ).on( 'click', clickFunction );
}

const makeGameBoard = function ( players ) { // populate array of slots in gameData and create DOM.
  // reset gamedata and gameboard
  resetGameBoard()

  // load scores from cookies;
  score = getScoreFromCookies();

  updateScoreDisplay(score);
  displayTurn( player );


  addClickEvents( takeSlot );

  // set global players value
  if ( +players === 2 ) {
    aiEnabled = false;
  } else if ( +players === 3 ) {
    aiEnabled = false;
    // console.log( initFirebase() );
    // findGame();
  } else if ( +players === 1 ) {
    aiEnabled = true;
    displayMyPlayer( player )
  } else {
    // do nothing, keep default / current values (for replay)
  }
}

const winDisplay = function ( winInfo, replayFn ) { // display the win diaglog
  const replayBtn = $( playAgain );

  if ( winInfo.tie !== undefined ) {
    // it's a draw!
    $( '#gameboard' ).append( $( '<div>').addClass('winmsg').html(`It's a draw!`).append( replayBtn ) );
    replayBtn.on( 'click', replayFn)
  } else {
    // update scores & save to cookies
    score[ player.toLowerCase() ]++;
    setScoreInCookies( score );
    updateScoreDisplay( score );
    const slots = winInfo.slots;
    for ( let slot of slots ) {
      const slotID = slot.x + "," + slot.y;
      $( `div[data-id="${ slotID }"]` ).addClass('win');
    }

    $( '#gameboard' ).append( $( '<div>').addClass('winmsg').html(`${ player } wins!`).append( replayBtn ) );
    replayBtn.on( 'click', replayFn)
  }
}

const takeSlot = function () {
  if (aiEnabled === true && aiTurn === true) {
    return //its not your turn!!
  }

  let id = $( this ).attr('data-id').split(',');
  updateGameData( id, player )

  updateGameBoard( this, player );

  // remove click event from this slot so it can't be clicked again
  removeClickEvent( this );

  // Check for win;
  let winInfo = checkForWin()
  if ( winInfo.win === true ) {
    winDisplay( winInfo, makeGameBoard );
    return;
  }

  // switch players (global variable)
  switchPlayers();

  // call AI
  callAI();
}// take a slot (triggered by click)

const aiClickTrigger = function ( win ) { // trigger click event for AI move
  const slotID = win.aiSlots[0].x + ',' + win.aiSlots[0].y;
  const slot = $( `div[data-id="${ slotID }"]` );

  removeClickEvent( slot );
  updateGameData( slotID.split(','), player )
  updateGameBoard( slot, player );
  aiTurn = false;

  let winInfo = checkForWin()
  if ( winInfo.win === true ) {
    winDisplay( winInfo, makeGameBoard );
    return;
  }

  switchPlayers();


};

const removeClickEvent = function ( ele ) {
  $( ele ).off( 'click', takeSlot );
}

const switchPlayers = function () {
  if (player === 'Nought') {
    player = 'Cross';
  } else {
    player = 'Nought';
  }

  displayTurn( player );
} // switch between players

const callAI = function () {
  if ( aiEnabled === true && aiTurn === false ) {
    aiTurn = true;
    setTimeout ( function () {
        // check to see if AI can win with this move
        // check to see if player will win next move
        if ( !unbeatableAI( 'Cross' ) ) {
          if ( !unbeatableAI( 'Nought' ) ) {
            pickRandomSlot();
        }
      }
    }, 1000 );
  }
};// call AI move

const pickRandomSlot = function () {
  let freeSlot = false;
  const win = {};
  getRandomInt(9)

  // get empty slots
  const emptySlots = [];

  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      if (gameData[x][y] === "empty") {
        emptySlots.push({
          x: x,
          y: y
        })
      }
    }
  }

  const rand = getRandomInt( emptySlots.length )

  win.aiSlots = [ emptySlots[rand] ]

  aiClickTrigger( win );
}

const checkYforWin = function ( plyr ) {
 // check y straights for win
  let win = false;
  const winSlots = [];
  const aiSlots = [];
  const emptySlots = [];

  for ( let y = 0; y < 3; y++ ) {
    for ( let x = 0; x < 3; x++) {
      if ( gameData[x][y] === plyr ) {
        winSlots.push({ x:x, y:y })
      } else if ( gameData[x][y] === "empty" ) {
        emptySlots.push({ x:x, y:y })
      }
    }

    if (aiEnabled === true && winSlots.length === 2) {
      Array.prototype.push.apply(aiSlots, emptySlots);
    }

    if(winSlots.length === 3) {
      win = true;
      break;
    } else {
      winSlots.length = 0;
      emptySlots.length = 0;
    }
  }

  return {win: win, slots: winSlots, aiSlots: aiSlots };
} // check horizontal rows for wins

const checkXforWin = function ( plyr ) {
  // check x straights for win
  let win = false;
  const winSlots = [];
  const aiSlots = [];
  const emptySlots = [];
  // debugger ;
  for ( let x = 0; x < 3; x++) {
    for ( let y = 0; y < 3; y++ ) {
      if (gameData[x][y] === plyr) {
        winSlots.push({ x:x, y:y });
      } else if ( gameData[x][y] === "empty" ) {
        emptySlots.push({ x:x ,y:y });
      }
    }

    if (aiEnabled === true && winSlots.length === 2) {
      Array.prototype.push.apply(aiSlots, emptySlots);
    }

    if(winSlots.length === 3) {
      win = true;
      break;
    } else {
      winSlots.length = 0;
      emptySlots.length = 0;
    }
  }

  return {win: win, slots: winSlots, aiSlots: aiSlots};
} // check vertical rows for wins

const diag1ForWin = function ( plyr ) {
  // check corner x=0,y=0 > x=2, y=2 for win
  let win = false;
  const winSlots = [];
  const aiSlots = [];
  const emptySlots = [];

  for ( let xy = 0; xy < 3; xy++ ) {
    if (gameData[xy][xy] === plyr) {
      winSlots.push({x:xy,y:xy})
    } else if ( gameData[xy][xy] === "empty" ) {
      emptySlots.push({x:xy,y:xy})
    }
  }

  if (aiEnabled === true && winSlots.length === 2) {
    Array.prototype.push.apply(aiSlots, emptySlots);
  }

  if(winSlots.length === 3) {
    win = true;
  }

  return {win: win, slots: winSlots, aiSlots: aiSlots };
} // check diagonal for win

const diag2ForWin = function ( plyr ) {
  // check corner x=2, y=0 > x=0, y=2, for win
  let win = false;
  const winSlots = [];
  const aiSlots = [];
  const emptySlots = [];

  for (let x = 0; x < 3; x++ ) {
    let y = 2 - x;
    if (gameData[x][y] === plyr) {
      winSlots.push({x:x,y:y})
    } else if ( gameData[x][y] === "empty" ) {
      emptySlots.push({x:x,y:y})
    }
  }
  if (aiEnabled === true && winSlots.length === 2) {
      Array.prototype.push.apply(aiSlots, emptySlots);
  }
  if(winSlots.length === 3) {
    win = true;
  }

  return {win: win, slots: winSlots, aiSlots: aiSlots};
}; // check other diagonal for win

const updateGameData = function ( id, player ) {
  gameData[+id[0]][+id[1]] = player;
}

const getRandomInt = function( max ) {
  return Math.floor(Math.random() * Math.floor(max));
};

const unbeatableAI = function ( plyr ) {

  let win = checkYforWin( plyr );
  if (win.aiSlots.length > 0) {
    aiClickTrigger( win );
    return true;
  }

  win = checkXforWin( plyr );
  if (win.aiSlots.length > 0) {
    aiClickTrigger( win );
    return true;
  }

  win = diag1ForWin( plyr );
  if (win.aiSlots.length > 0) {
    aiClickTrigger( win );
    return true;
  }

  win = diag2ForWin( plyr );
  if (win.aiSlots.length > 0) {
    aiClickTrigger( win );
    return true;
  }

  return false;
} // main guts of AI function

const checkForWin = function () {
  // debugger;

  let anyFreeSlots = false;
  // check if  all slots taken
  for (let x = 0; x < 3; x++) {
    for ( let y = 0; y < 3; y++ ) {
      if ( gameData[x][y] === "empty" ) {
        anyFreeSlots = true;
        break; // stop loop if there's at least one empty slot
      }
    }
  }

  if ( anyFreeSlots === false ) {
    return { win: true, tie: true, slots: [], aiSlots: [] };
  }

  let win = checkYforWin( player );
  if (win.win === true) {
    return win;
  }

  win = checkXforWin( player );
  if (win.win === true) {
    return win;
  }

  win = diag1ForWin( player );
  if (win.win === true ) {
    return win;
  }

  win = diag2ForWin( player );
  if (win.win === true ) {
    return win;
  }

  return win;
} // check for game win or draw
