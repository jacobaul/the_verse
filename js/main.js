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
        var radius = parseFloat(STARS[star]['Radius']) 
        var starGeometry = new THREE.SphereGeometry(2*radius,16,16 );
        var starMaterial = new THREE.MeshStandardMaterial(  );
        starMaterial.emissive = new THREE.Color("0xadadad");
        var starObj = new THREE.Mesh( starGeometry, starMaterial );


        STARS[star]['sceneObj'] = starObj;
        STARS[star]['sceneObj'].position.x = initPosition(star);

        STARS[star]['phi'] = 0;
        STARS[star]['theta'] = 1;
        scene.add(starObj);
    }

    STARS["Blue Sun"]['phi'] = 3;
    STARS["Burnham"]['phi'] = 3;
    STARS["Burnham"]['theta'] = 0;

    camera.position.z = 5;
    window.addEventListener( 'wheel', onMouseWheel, false );

}


function animate() {
    requestAnimationFrame( animate );
    zoom();

    for(star in STARS){
        updatePosition(star);
    }


    camera.lookAt( new THREE.Vector3(0,0,0) );

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
    if(par == "N/A"){
        var parpos = new THREE.Vector3(0,0,0);
    }else{
        var parpos = STARS[par]['sceneObj'].position;
    }

    var theta = STARS[star]['theta'];
    var phi = STARS[star]['phi'];
    var r = parseFloat(STARS[star]['Distance']);

    STARS[star]['theta'] += (1 / (10 * Math.sqrt(r))) * Math.cos(phi);
    STARS[star]['phi'] += (1 / (10 * Math.sqrt(r))) * Math.sin(phi);

    //if(STARS[star]['theta'] > 2*Math.PI){
    //    STARS[star]['theta'] = STARS[star]['theta'] - 2*Math.PI;
    //}


    //console.log(STARS[star]['theta'])

    STARS[star]['theta'] %= 2*Math.PI;
    var deltax = r * Math.cos(theta);
    var deltaz = r * Math.sin(theta);
    var deltay = r * Math.sin(phi);


    var newpos = new THREE.Vector3(deltax,deltay,deltaz);
    newpos.add(parpos);


    STARS[star]['sceneObj'].position.x = newpos.x;
    STARS[star]['sceneObj'].position.z = newpos.z;
    STARS[star]['sceneObj'].position.y = newpos.y;

}

function initPosition(star){

    if(star == "White Sun"){
        return 0;
    }

    var par = STARS[star]['obj_parent'];
    var parx = parseFloat(STARS[star]['Distance'])  + initPosition(par);

    return parx;



}

function importObjects(){

    STARS = JSON.parse(stars_info);
    PLANETS_MOONS = JSON.parse(planet_moon_info);

}

function onMouseWheel( ev ) {
    ZOOM_SPEED = ev.deltaY;

}
