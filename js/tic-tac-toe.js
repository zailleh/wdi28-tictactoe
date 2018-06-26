const gameData = []; //empty array of our slots
let player = "Naught";

let NaughtIco = '<i class="far fa-circle"></i>'
let CrossIco = '<i class="fas fa-times"></i>'
let playAgain = '<button class="menubutton" value="0">Play Again!</button>'
let aiEnabled = true;
let aiTurn = false;

const makeGameBoard = function ( players ) { // populate array of slots in gameData and create DOM.
  // reset gamedata and gameboard
  gameData.length = 0;
  $('#gameboard').html("");

  // populate gamedata and gameboard
  for (let x = 0; x < 3; x++ ) {
    gameData.push([]);
    for (let y = 0; y < 3; y++ ) {
      let id = x + "," + y
      gameData[x].push(null);
      $('#gameboard').append( $( '<div class="slot">' ).attr( 'data-id', id ) );
    }
  }

  $( '.slot' ).on( 'click', takeSlot );

  // set global players value
  if ( +players === 2 ) {
    aiEnabled = false;
  } else {
    aiEnabled = true;
  }
}

const winDisplay = function ( winInfo ) { // display the win diaglog
  const replayBtn = $( playAgain );


  if ( winInfo.tie !== undefined ) {
    // it's a draw!
    $( '#gameboard' ).append( $( '<div>').addClass('winmsg').html(`It's a draw!`).append( replayBtn ) );
    replayBtn.on( 'click', makeGameBoard)
  } else {
    const slots = winInfo.slots;
    for ( let slot of slots ) {
      const slotID = slot.x + "," + slot.y;
      $( `div[data-id="${ slotID }"]` ).addClass('win');
    }

    $( '#gameboard' ).append( $( '<div>').addClass('winmsg').html(`${ player } wins!`).append( replayBtn ) );
    replayBtn.on( 'click', makeGameBoard)
  }
}

const takeSlot = function () {
  let id = $( this ).attr('data-id').split(',');
  gameData[+id[0]][+id[1]] = player;

  switch (player) {
    case 'Naught':
        $( this ).append( $( NaughtIco ) )
      break;
    default:
      $( this ).append( $( CrossIco ) )
  }

  // remove click event from this slot so it can't be clicked again
  $( this ).off( 'click', takeSlot );

  // Check for win;
  let winInfo = checkForWin()
  if ( winInfo.win === true ) {
    winDisplay( winInfo );
    return;
  }

  // switch players (global variable)
  switchPlayers();

  // call AI
  callAI();
}// take a slot (triggered by click)

const switchPlayers = function () {
  if (player === 'Naught') {
    player = 'Cross';
  } else {
    player = 'Naught';
  }
} // switch between players

const callAI = function () {
  if ( aiEnabled === true && aiTurn === true ) {
    aiTurn = false;
  } else if ( aiEnabled === true && aiTurn === false ) {
    aiTurn = true;
    setTimeout ( function () {
        // check to see if AI can win with this move
        // check to see if player will win next move
        if ( !unbeatableAI( 'Cross' ) ) {
          if ( !unbeatableAI( 'Naught' ) ) {
            pickRandomSlot();
        }
      }
    }, 1000 );
  }
};// call AI move

const pickRandomSlot = function () {
  let freeSlot = false;
  const win = {};
  do {
    win.aiSlots = [{
      x: getRandomInt(3),
      y: getRandomInt(3)
    }];

    if ( gameData[win.aiSlots[0].x][win.aiSlots[0].y] === null ) {
      aiClickTrigger( win );
      freeSlot = true;
      break;
    }
  } while (!freeSlot)
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
      } else if ( gameData[x][y] === null ) {
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
      } else if ( gameData[x][y] === null ) {
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
    } else if ( gameData[xy][xy] === null ) {
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
    } else if ( gameData[x][y] === null ) {
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

const aiClickTrigger = function ( win ) {
  slotID = win.aiSlots[0].x + ',' + win.aiSlots[0].y;
  $( `div[data-id="${ slotID }"]` ).trigger( 'click' )
}; // trigger click event for AI move

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
      if ( gameData[x][y] === null ) {
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