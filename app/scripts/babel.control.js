var Babel = Babel || {};

Babel.setControl = function(){

	$('#players-btn').on('click', function(){
	if ($('#roomlists').is(':visible')){
		$('#roomlists').fadeOut(150);
	} else {
		$('#userinput').fadeOut(100);
		$('#roomlists').fadeIn(150);
		$('#journey').fadeOut(100);
		$('#path').fadeOut(100);
	}
	});

	$('#user-btn').on('click', function(){
		if ($('#userinput').is(':visible')){
			$('#userinput').fadeOut(150);
		} else {
			$('#roomlists').fadeOut(100);
			$('#userinput').fadeIn(150);
			$('#journey').fadeOut(100);
			$('#path').fadeOut(100);
		}
	});

	$('#journey-btn').on('click', function(){
		if ($('#journey').is(':visible')){
			$('#journey').fadeOut(300);
		} else {
			$('#journey').fadeIn(300);
			$('#userinput').fadeOut(100);
			$('#roomlists').fadeOut(100);
			$('#path').fadeOut(100);
		}
	});

	$('#path-btn').on('click', function(){
		if ($('#path').is(':visible')){
			$('#path').fadeOut(300);
		} else {
			$('#path').fadeIn(300);
			$('#userinput').fadeOut(100);
			$('#roomlists').fadeOut(100);
			$('#journey').fadeOut(100);
		}
	});

		// Listen to key clicks
	$(document).keydown(function(evt) {
	    // on space or arrow up move next 
	    if (evt.keyCode === 32 || evt.keyCode === 38) {
	      space = true;
	      moveNext= true;
	    }
	    if (evt.keyCode == 37) {
			turns.push(1);
		}
		if (evt.keyCode == 39){
		    turns.push(2);
		}
		if (evt.keyCode == 40 && pathStack.length>1 ){
		    moveBack = true;
		    console.log('moving back');
			pathStack.pop();
		    getPrevRoom();
		}
	});

	$(document).mouseup(function (e){
	    var container = $("#path");

	    if (!container.is(e.target) // if the target of the click isn't the container...
	        && container.has(e.target).length === 0) // ... nor a descendant of the container
	    {
	        container.fadeOut(100);
	    }
	});

	$( "input[type='text']" ).change(function() {
		nameRef.set( $( this ).val() );
	});
}

// (function(){
	Babel.setControl();
// }());
