var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();

var MAX_ZOOM_LEVEL = 1000;
var MIN_ZOOM_LEVEL = 2;
var ZOOM_DEFAULT_DAMPING = 0.1;
var ZOOM_QUICK_DAMPING = 0.9;

var ZOOM_DAMPING = 0.1;
var ZOOM_LEVEL = 50.0;
var ZOOM_SPEED = 0.0;

var STARS;
var PLANETS_MOONS;

init();
animate();


function init() {
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    importObjects();


    for (star in STARS){
        var starGeometry = new THREE.SphereGeometry(1,32,32 );
        var starMaterial = new THREE.MeshStandardMaterial(  );
        starMaterial.emissive = new THREE.Color("0xadadad");
        var starObj = new THREE.Mesh( starGeometry, starMaterial );


       // starObj.position.x = STARS[star]['Distance'];
        STARS[star]['sceneObj'] = starObj;

        STARS[star]['theta'] = 1;
        scene.add(starObj);
    }


    //STARS['Himinbjorg']['sceneObj'].translateX(4);
    camera.position.z = 5;
    //white_sun_material.emissive = new THREE.Color("0xadadad");

    window.addEventListener( 'wheel', onMouseWheel, false );

}


function animate() {
    requestAnimationFrame( animate );
    //STARS['Penglai']['sceneObj'].position.add(rotateRelative(8.1, 0.1,0));
    //white_sun.rotation.x += 0.01;
    //white_sun.rotation.y += 0.01;
    zoom();

    updatePosition('Himinbjorg');
    //STARS['Himinbjorg']['sceneObj'].translateX(0.001);

    camera.lookAt( STARS['White Sun']['sceneObj'].position );

	  renderer.render( scene, camera );
}

function zoom() {
    if(ZOOM_LEVEL > MAX_ZOOM_LEVEL || ZOOM_LEVEL < MIN_ZOOM_LEVEL){
        ZOOM_DAMPING = ZOOM_QUICK_DAMPING;
    }else{
        ZOOM_DAMPING = ZOOM_DEFAULT_DAMPING;
    }

    ZOOM_LEVEL += ZOOM_SPEED;

    if(ZOOM_LEVEL < MIN_ZOOM_LEVEL){
        ZOOM_LEVEL = MIN_ZOOM_LEVEL;
    }

    ZOOM_SPEED  = ZOOM_SPEED*(1-ZOOM_DAMPING);

    camera.position.x = Math.sin( .5 * Math.PI * ( .5 ) ) * ZOOM_LEVEL;
		camera.position.y = Math.sin( .25 * Math.PI * (  .5 ) ) * ZOOM_LEVEL;
		camera.position.z = Math.cos( .5 * Math.PI * (  .5 ) ) * ZOOM_LEVEL;


}

function updatePosition(star){

    var par = STARS[star]['obj_parent'];
    var parpos = STARS[par]['sceneObj'].position;

    var pos = STARS[star]['sceneObj'].position;


    var delt = pos - par;

    console.log(delt)

    var theta = STARS[star]['theta'];
    var r = STARS[star]['Distance'];

    STARS[star]['theta'] += 1 / (10* theta);

    var deltax = r * Math.cos(theta);
    var deltaz = r * Math.sin(theta);

    //STARS[star]['sceneObj'].position = delt.add(new THREE.Vector3(deltax,deltaz,0))

}

function importObjects(){

    STARS = JSON.parse(stars_info);
    PLANETS_MOONS = JSON.parse(planet_moon_info);

}

function onMouseWheel( ev ) {
    ZOOM_SPEED = ev.deltaY;

}
