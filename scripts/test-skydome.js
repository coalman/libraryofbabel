
var container;
var skycube;
var camera, scene, renderer;
var mesh, lightMesh;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var lookAt, lookAtX, lookAtZ;
var stop = false;
var moveNext = false;
var turnInc = 1;
var turning = true;
var side = 1;
var currentRoom = {
	id:-1
}
var crowd = new Howl({
	urls: ['crowd-talking.mp3']
});
var volume = 0.7;
var oldVol 
var newVol
var textMesh
var path = "";
var pathTitles = [];
var turns = []
var prevId, prevTitle
var playerName, playerId, playerRoomRef, nameRef

document.addEventListener( 'mousemove', onDocumentMouseMove, false );

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );
	

	// initalize user in firebase
    var usersRef = new Firebase('https://libraryofbabel.firebaseio.com/players/');
    playerName = Math.random().toString(36).substring(7);
    $('input').val(playerName);
	t = usersRef.push({'name' : playerName});
	playerId = t.name();
    playerRoomRef = new Firebase('https://libraryofbabel.firebaseio.com/players/'+playerId+'/room/');

    nameRef = new Firebase('https://libraryofbabel.firebaseio.com/players/'+playerId+'/name/');
    // listen to all other users in player list

	initRoom();
 
 	usersRef.on('child_added', function(childSnapshot, prevChildName) {
		//console.log(childSnapshot.ref());
		pli = $('<li class="pli"></li>');
		$(pli).data({'name':childSnapshot.val().name, 'room':childSnapshot.val().room})
		childSnapshot.ref().on('value', function(cs, ps){
			//console.log('value changed');
			//console.log(cs.val());
			$(pli).data({'name':cs.val().name, 'room':cs.val().room})
			if (cs.val().room == currentRoom.title){
				pli.html( cs.val().name )
				pli.prependTo($('#myroom'))
			}
			else{
				pli.html( '<div id="pname"> '+cs.val().name + ' : </div>  <div id="proom"> ' + cs.val().room +'</div>' )
				pli.prependTo($('#notmyroom'))
			}
		});
	});

	// create camera
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 100000 );
	camera.position.y = 0;// -400;
	camera.position.z = -35;//400;
	camera.position.x = 0;
	camera.up = new THREE.Vector3(0,0,1);
	lookAtX = 0;//52.2;//0;
	lookAtY = 100;//90;//0;
	lookAtZ = -20;//0;
	lookAt = new THREE.Vector3 (lookAtX,lookAtY,lookAtZ);
	camera.lookAt(lookAt);

	// create scene
	scene = new THREE.Scene();

	// add fog and light
	scene.fog = new THREE.Fog( 0xffffff, 1000, 10000 );
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.475 );
	directionalLight.position.set( 100, 100, -100 );
	scene.add( directionalLight );
	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1.25 );
	hemiLight.color.setHSL( 0.58, 0.2, 0.9 );
	hemiLight.groundColor.setHSL( 9, 1, 0.9 );
	hemiLight.position.x = 500;
	scene.add( hemiLight );

	// add gradient skydome
	var vertexShader = document.getElementById( 'vertexShader' ).textContent;
	var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
	var uniforms = {
		topColor: 	 { type: "c", value: new THREE.Color( 0xff7ff ) },
		bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
		offset:		 { type: "f", value: 00 },
		exponent:	 { type: "f", value: 0.99 }
	}
	uniforms.topColor.value.copy( hemiLight.color );
	scene.fog.color.copy( uniforms.bottomColor.value );
	var skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
	var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );
	var sky = new THREE.Mesh( skyGeo, skyMat );
	sky.rotation.y = 0.4;
	// scene.add( sky );



	// create hexgon
	hexagon =  Hexagon(120, 50, 0,0, 0xdadadF);
	
	// create and add hexagon/text group
	group = new THREE.Object3D();//create an empty container
	group.add( hexagon );//add a mesh with geometry to it
	//group.add( textMesh );//add a mesh with geometry to it
	group.rotation.z = 0.523598776;
	scene.add(group);

	// skycube = new Skycube();
	// var geometry = new THREE.SphereGeometry( 100, 32, 16 );
	// load images for Skybox

	renderer = new THREE.WebGLRenderer({alpha:true});
	renderer.setClearColor( 0x000000, 0 ); // the default

	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.autoClear = false;
	windowHalfX = window.innerWidth / 2,
	windowHalfY = window.innerHeight / 2,
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	// skycube.cameraCube.aspect = window.innerWidth / window.innerHeight;
	// skycube.cameraCube.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( scene.fog.color, 1 );

	container.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );
	render();
	// crowd.play();
}

function onWindowResize() {
	windowHalfX = window.innerWidth / 2,
	windowHalfY = window.innerHeight / 2,
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	// skycube.cameraCube.aspect = window.innerWidth / window.innerHeight;
	// skycube.cameraCube.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove(event) {
	mouseX = ( event.clientX - windowHalfX ) * 10;
	mouseY = ( event.clientY - windowHalfY ) * 10;
}

function animate() {
	requestAnimationFrame( animate );
	render();
}

function render() {

	var timer = 0.0001 * Date.now();
	renderer.render( scene, camera );
	    // crowd.play();
    // crowd.volume(volume);

	// camera.position.x += ( mouseX - camera.position.x ) * .05;
	// camera.position.y += ( - mouseY - camera.position.y ) * .05;
	// camera.lookAt( scene.position );
	// skycube.cameraCube.rotation.copy( camera.rotation );

	// // Do some optional calculations. This is only if you need to get the
	// // width of the generated text
	// textGeom.computeBoundingBox();
	// textGeom.textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;

	// renderer.render( skycube.sceneCube, skycube.cameraCube );
}

var material2 = new THREE.MeshBasicMaterial({
	color:0xfa1a1F
})

// keyboard control for moving forward, next, back
$(document).keydown(function(evt) {
    
    // on space move next
    if (evt.keyCode == 32) {
      space = true;
      moveNext= true;
    }
    if (evt.keyCode == 37) {
		turns.push(1);
	}
	if (evt.keyCode == 39){
	    turns.push(2);
	}

});

// camera.position.y += 0.01;
animateTurn = function(time){
	if (turns[0] == 1)
		mult = -1;
	if (turns[0] == 2)
		mult = 1;
	if ( inc < 1.04719755   ){
		var axis = new THREE.Vector3( 0, 0, 1 );
		var angle = -0.05;
		var matrix = new THREE.Matrix4().makeRotationAxis( axis, angle );
		inc += 0.25;
		group.rotation.z += mult*0.25;		
	}
	camera.lookAt(lookAt);
	// camera.rotation.x = ( Math.PI / 90)

	if ( inc >= 1.0){
		// var axis = new THREE.Vector3( 0, 0, 1 );
		// var angle = -0.05;
		// var matrix = new THREE.Matrix4().makeRotationAxis( axis, angle );
		inc +=0.04719755;
		// lookAt.applyMatrix4( matrix );
		group.rotation.z =  mult* 1.04719755*side + Math.PI/180*90 ;

		if (turns[0] == 1){
			side = (side-1)
			if (side==-1) side=5
		} else if (turns[0]==2)
			side = (side+1)%6;
		
		inc = 0;
		lastTime = time;  
		turning = false;
		turns.pop();
		if (currentRoom['walls'][side] == undefined)
			$('#side-title').html('')
		else 
		$('#side-title').html(currentRoom['walls'][side].title)

		// group.rotation.z +=0.05719755;		
	}


	lastTime = time;  

}



  // revolutions per second
var angularSpeed = 0.2; 
var lastTime = 0;
var inc = 0;
// this function is executed on each animation frame
function animate(){
  	render();
    var time = (new Date()).getTime();
    var timeDiff = time - lastTime;
    var angleChange = angularSpeed * timeDiff * 2 * Math.PI / 1000;
    

    // if (timeDiff >= 700 && turning==true){
    // 	lastTime = time;
    // 	hexagon.rotation.z = turnInc * 1.04;
    // 	turnInc = (turnInc+1)%7;
    // }

    if (moveNext == true){
    	turning = false;

    	moveToNextRoom();
    }

	// if (timeDiff >= 350 && moveNext==false)
	// 	turning = true;

	if (turns.length!=0 ){
		if (turns[0] == 1 || 2)
		    animateTurn(time);

	}


    // request new frame
    requestAnimationFrame(function(){
        animate();
    });
}



init();
animate();

$('#players-btn').on('click', function(){
	if ($('#roomlists').is(':visible')){
		$('#roomlists').fadeOut(150);
	} else {
		$('#userinput').fadeOut(100);
		$('#roomlists').fadeIn(150);
	}
})

$('#user-btn').on('click', function(){
	if ($('#userinput').is(':visible')){
		$('#userinput').fadeOut(150);
	} else {
		$('#roomlists').fadeOut(100);
		$('#userinput').fadeIn(150);
	}
})


$('#path-btn').on('click', function(){
	if ($('#path').is(':visible')){
		$('#path').fadeOut(300);
	} else {
		$('#path').fadeIn(300);
		$('#extract').fadeOut(100);
	}
})

$( "input[type='text']" ).change(function() {
  // Check inp ut( $( this ).val() ) for validity here
  nameRef.set( $( this ).val() );
});