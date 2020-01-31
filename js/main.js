var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();

var white_sun_geometry = new THREE.SphereGeometry(1,32,32 );
var white_sun_material = new THREE.MeshStandardMaterial(  );
var white_sun = new THREE.Mesh( white_sun_geometry, white_sun_material );

var MAX_ZOOM_LEVEL = 1000;
var MIN_ZOOM_LEVEL = 2;
var ZOOM_DEFAULT_DAMPING = 0.1;
var ZOOM_QUICK_DAMPING = 0.9;

var zoom_damping = 0.1;
var zoom_level = 10.0;
var zoom_speed = 0.0;

init();
animate();


function init() {
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    scene.add( white_sun );
    camera.position.z = 5;
    white_sun_material.emissive = new THREE.Color("0xadadad");

    window.addEventListener( 'wheel', onMouseWheel, false );

}


function animate() {
    requestAnimationFrame( animate );
    white_sun.rotation.x += 0.01;
    white_sun.rotation.y += 0.01;
    zoom();
    camera.lookAt( white_sun.position );

	  renderer.render( scene, camera );
}

function zoom() {
    if(zoom_level > MAX_ZOOM_LEVEL || zoom_level < MIN_ZOOM_LEVEL){
        zoom_damping = ZOOM_QUICK_DAMPING;
    }else{
        zoom_damping = ZOOM_DEFAULT_DAMPING;
    }

    zoom_level += zoom_speed;

    if(zoom_level < MIN_ZOOM_LEVEL){
        zoom_level = MIN_ZOOM_LEVEL;
    }

    zoom_speed  = zoom_speed*(1-zoom_damping);

    camera.position.x = Math.sin( .5 * Math.PI * ( .5 ) ) * zoom_level;
		camera.position.y = Math.sin( .25 * Math.PI * (  .5 ) ) * zoom_level;
		camera.position.z = Math.cos( .5 * Math.PI * (  .5 ) ) * zoom_level;


}

function onMouseWheel( ev ) {
    zoom_speed = ev.deltaY;

}
