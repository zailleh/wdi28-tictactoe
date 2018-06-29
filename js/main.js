// DOCUMENT READY! EXECUTE!
let menu;

const bootToMenu = function() {
  $( '#gameboard' ).html(menu); //reset gameboard
  $( '.score' ).remove();
  $( '#statusDisplay' ).html("");
  $('.winmsg').remove();
  addMenuListeners();
}

const addMenuListeners = function() {
  $( '.menubutton.local' ).on( 'click', function() {
    players = $( this ).val();
    makeGameBoard( players );
  });

  $( '.menubutton.remote' ).on( 'click', startMulti );
}

$( document ).ready( function () {
  $( '.homebutton' ).on( 'click', bootToMenu );
  addMenuListeners();
  menu = $( '#gameboard' ).html() //take backup of menu to come back to

})
