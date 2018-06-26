const gameData = []; //empty array of our slots
let player = "naught";

let naughtIco = '<i class="far fa-circle"></i>'
let crossIco = '<i class="fas fa-times"></i>'

let aiEnabled = true;
let aiTurn = false;

const makeGameBoard = function () { // populate array of slots in gameData and create DOM.
  for (let x = 0; x < 3; x++ ) {
    gameData.push([]);
    for (let y = 0; y < 3; y++ ) {
      let id = x + "," + y
      gameData[x].push(null);
      $('#gameboard').append( $( '<div class="slot">' ).attr( 'data-id', id ) );
    }
  }
}

const winDisplay = function ( winInfo ) {
  if ( winInfo.tie !== undefined ) {
    // it's a draw!
    $( '#gameboard' ).append( $( '<div>').addClass('winmsg').html(`Evenly matched! It's a draw!`) );
  } else {
    const slots = winInfo.slots;
    for ( let slot of slots ) {
      const slotID = slot.x + "," + slot.y;
      $( `div[data-id="${ slotID }"]` ).addClass('win');
    }

    $( '#gameboard' ).append( $( '<div>').addClass('winmsg').html(`Congratulations! ${ player } wins!`) );
  }
}

const takeSlot = function () {
  let id = $( this ).attr('data-id').split(',');
  gameData[+id[0]][+id[1]] = player;

  switch (player) {
    case 'naught':
        $( this ).append( $( naughtIco ) )
      break;
    default:
      $( this ).append( $( crossIco ) )
  }
  console.log(player);


  $( this ).off( 'click', takeSlot );

  debugger;
  let winInfo = checkForWin()
  if ( winInfo.win === true ) {
    winDisplay( winInfo );
    return;
  }

  if (player === 'naught') {
    player = 'cross';
  } else {
    player = 'naught';
  }
  console.log(player);


  if ( aiEnabled === true && aiTurn === true ) {
    aiTurn = false;
  } else if ( aiEnabled === true && aiTurn === false ) {
    aiTurn = true;
    setTimeout ( function () {
        // check to see if AI can win with this move
        // check to see if player will win next move
        if ( !unbeatableAI( 'naught' ) ) {
          if ( !unbeatableAI( 'cross' ) ) {
            pickRandomSlot();
        }
      }
    }, 1000 );
  }
}
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

const checkYforWin = function ( player ) {
 // check y straights for win
  let win = false;
  const winSlots = [];
  const aiSlots = [];
  const emptySlots = [];

  for ( let y = 0; y < 3; y++ ) {
    for ( let x = 0; x < 3; x++) {
      if ( gameData[x][y] === player ) {
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
    }
  }

  return {win: win, slots: winSlots, aiSlots: aiSlots };
}

const checkXforWin = function ( player ) {
  // check x straights for win
  let win = false;
  const winSlots = [];
  const aiSlots = [];
  const emptySlots = [];

  for ( let x = 0; x < 3; x++) {
    for ( let y = 0; y < 3; y++ ) {
      if (gameData[x][y] === player) {
        winSlots.push({ x:x, y:y });
      } else if ( gameData[x][y] === null ) {
        emptySlots.push({ x:x ,y:y })
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
    }
  }

  return {win: win, slots: winSlots, aiSlots: aiSlots};
}

const diag1ForWin = function ( player ) {
  // check corner x=0,y=0 > x=2, y=2 for win
  let win = false;
  const winSlots = [];
  const aiSlots = [];
  const emptySlots = [];

  for ( let xy = 0; xy < 3; xy++ ) {
    if (gameData[xy][xy] === player) {
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
}

const diag2ForWin = function ( player ) {
  // check corner x=2, y=0 > x=0, y=2, for win
  let win = false;
  const winSlots = [];
  const aiSlots = [];
  const emptySlots = [];
  for (let x = 0; x < 3; x++ ) {
    let y = 2 - x;
    if (gameData[x][y] === player) {
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
};

const aiClickTrigger = function ( win ) {
  slotID = win.aiSlots[0].x + ',' + win.aiSlots[0].y;
  console.log('triggering AI on slot:', slotID);
  $( `div[data-id="${ slotID }"]` ).trigger( 'click' )
};

const getRandomInt = function( max ) {
  return Math.floor(Math.random() * Math.floor(max));
};

const unbeatableAI = function ( player ) {

  let win = checkYforWin( player );
  if (win.aiSlots.length > 0) {
    aiClickTrigger( win );
    return true;
  }

  win = checkXforWin( player );
  if (win.aiSlots.length > 0) {
    aiClickTrigger( win );
    return true;
  }

  win = diag1ForWin( player );
  if (win.aiSlots.length > 0) {
    aiClickTrigger( win );
    return true;
  }

  win = diag2ForWin( player );
  if (win.aiSlots.length > 0) {
    aiClickTrigger( win );
    return true;
  }

  return false;
}

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
}

// DOCUMENT READY! EXECUTE!
$( document ).ready( function () {
  makeGameBoard();
  $( '.slot' ).on( 'click', takeSlot );

})
