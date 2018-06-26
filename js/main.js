
const startGame = function () {
  players = $( this ).val();
  makeGameBoard( players ); // function is in tic-tac-toe.js
}




// DOCUMENT READY! EXECUTE!
$( document ).ready( function () {
  $( '.menubutton' ).on( 'click', startGame );
})
