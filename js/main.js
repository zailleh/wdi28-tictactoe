// DOCUMENT READY! EXECUTE!
$( document ).ready( function () {

  $( '.menubutton.local' ).on( 'click', function() {
    players = $( this ).val();
    makeGameBoard( players );
  });

  $( '.menubutton.remote' ).on( 'click', startMulti );

})
