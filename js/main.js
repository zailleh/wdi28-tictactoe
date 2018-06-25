const gameData = []; //empty array of our slots
let player = "naught";

let naughtIco = '<i class="far fa-circle"></i>'
let crossIco = '<i class="fas fa-times"></i>'

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
  const slots = winInfo.slots;
  console.log(slots);
  for ( let slot of slots ) {
    const slotID = slot.x + "," + slot.y
    console.log(slotID);
    $( `div[data-id="${ slotID }"]` ).addClass('win');
  }

  $( '#gameboard' ).append( $( '<div>').addClass('winmsg').html(`Congratulations! ${ player } wins!`) )
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


  $( this ).off( 'click', takeSlot );

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
}

const checkYforWin = function () {
// check y straights for win
  let win = false;
  const winSlots = [];
  for ( let y = 0; y < 3; y++ ) {
    for ( let x = 0; x < 3; x++) {
      if ( gameData[x][y] === player ) {
        win = true;
        winSlots.push({x:x,y:y})
      } else {
        win = false;
        winSlots.length = 0;
        break;
      }
    }

    if(win) {
      break;
    }
  }

  return {win: win, slots: winSlots};
}

const checkXforWin = function () {
  // check x straights for win
  let win = false;
  const winSlots = [];

  for ( let x = 0; x < 3; x++) {
    for ( let y = 0; y < 3; y++ ) {
      if (gameData[x][y] === player) {
        win = true;
        winSlots.push({x:x,y:y})
      } else {
        win = false;
        winSlots.length = 0;
        break;
      }
    }

    if (win) {
      break;
    }
  }

  return {win: win, slots: winSlots};
}

const diag1ForWin = function () {
  // check corner x=0,y=0 > x=2, y=2 for win
  let win = false;
  const winSlots = [];

  for ( let xy = 0; xy < 3; xy++ ) {
    if (gameData[xy][xy] === player) {
      win = true;
      winSlots.push({x:xy,y:xy})
    } else {
      win = false;
      winSlots.length = 0;
      break;
    }
  }

  return {win: win, slots: winSlots};
}

const diag2ForWin = function () {
  // check corner x=2, y=0 > x=0, y=2, for win
  let win = false;
  const winSlots = [];

  for (let x = 0; x < 3; x++ ) {
    let y = 2 - x;
    if (gameData[x][y] === player) {
      win = true;
      winSlots.push({x:x,y:y})
    } else {
      win = false;
      winSlots.length = 0;
      break;
    }
  }

  return {win: win, slots: winSlots};
}

const checkForWin = function () {
  // debugger;

  let win = checkYforWin();
  if (win.win === true) {
    return win;
  }

  win = checkXforWin();
  if (win.win === true) {
    return win;
  }

  win = diag1ForWin();
  if (win.win === true ) {
    return win;
  }

  win = diag2ForWin();
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
