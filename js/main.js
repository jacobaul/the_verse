(function() {
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

    var ROTATING = false;
    var MOUSE_XY;
    var ROTATION_MOUSE_ORIGIN = {x:0, y:0};

    var SIMSPEED = 0.01;

    var CELOBJS;

    var NEWTHETA = 0;
    var NEWPHI = 0;
    var THETA =  .5 * Math.PI * ( .5 ) ;
    var PHI = .25 * Math.PI * ( .5 ) ;

    var RAYCASTER = new THREE.Raycaster();

    var CENTRE = new THREE.Vector3(0,0,0);

    init();
    animate();


    function init() {
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

        importObjects();

        var light = new THREE.AmbientLight( 0x404040 ); // soft white light
        //scene.add( light );


        for (star in CELOBJS){
            var radius = parseFloat(CELOBJS[star]['diameter']);
            var starGeometry = new THREE.SphereGeometry(2*radius,16,16 );
            var starMaterial = new THREE.MeshStandardMaterial( );

            if(CELOBJS[star]['class'] == 'L'){

                var temp = CELOBJS[star]["temperature"];

                if(temp != null){
                    var rgb = temperature_to_rgb(temp);
                    starMaterial.emissive = new THREE.Color(rgb.r, rgb.g, rgb.b);
                }else{

                    starMaterial.emissive = new THREE.Color(0xffffff);

                }
            }
            var starObj = new THREE.Mesh( starGeometry, starMaterial );

            var spriteMap = new THREE.TextureLoader().load( "res/img/marker_sprite_w.png" );
            var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );

            var sprite = new THREE.Sprite( spriteMaterial );

            sprite.scale = new THREE.Vector3(10,10,10);

            CELOBJS[star]['sceneObj'] = starObj;
            CELOBJS[star]['sceneObj'].position.x = initPosition(star);

            CELOBJS[star]['sprite'] = sprite;

            CELOBJS[star]['phi'] = 0;
            CELOBJS[star]['theta'] = 1;

            scene.add(starObj);
            scene.add( sprite );

        }

        CELOBJS["Blue Sun"]['phi'] = 3;
        CELOBJS["Burnham"]['phi'] = 3;
        CELOBJS["Burnham"]['theta'] = 0;


        CELOBJS["Blue Sun"]["sceneObj"].material.emissive = new THREE.Color(177,204,255);
        CELOBJS["White Sun"]["sceneObj"].material.emissive = new THREE.Color(230,240,255);
        CELOBJS["Red Sun"]["sceneObj"].material.emissive = new THREE.Color(255,246,233);

        camera.position.z = 5;

        window.addEventListener( 'wheel', onMouseWheel, false );
        window.addEventListener( 'mousedown', onMouseDown, false );
        window.addEventListener( 'mousemove', onMouseMove, false );
        window.addEventListener( 'mouseup', onMouseUp, false );
        window.addEventListener( 'click', onClick, false );
    }


    function animate() {
        requestAnimationFrame( animate );
        zoom();

        rotate();

        for(star in CELOBJS){
            updatePosition(star);
        }

        updateCamera();

        camera.lookAt( CENTRE);

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



    }

    function updatePosition(star){

        var par = CELOBJS[star]['parent'];
        if(par == "N/A"){
            var parpos = new THREE.Vector3(0,0,0);
        }else{
            var parpos = CELOBJS[par]['sceneObj'].position;
        }

        var theta = CELOBJS[star]['theta'];
        var phi = CELOBJS[star]['phi'];
        var r = parseFloat(CELOBJS[star]['orbit_distance']);

        CELOBJS[star]['theta'] += (SIMSPEED / ( Math.sqrt(r))) * Math.cos(phi);
        CELOBJS[star]['phi'] += (SIMSPEED / ( Math.sqrt(r))) * Math.sin(phi);



        //console.log(CELOBJS[star]['theta'])

        CELOBJS[star]['theta'] %= 2*Math.PI;
        var deltax = r * Math.cos(theta);
        var deltaz = r * Math.sin(theta);
        var deltay = r * Math.sin(phi);


        var newpos = new THREE.Vector3(deltax,deltay,deltaz);
        newpos.add(parpos);


        CELOBJS[star]['sceneObj'].position.x = newpos.x;
        CELOBJS[star]['sceneObj'].position.z = newpos.z;
        CELOBJS[star]['sceneObj'].position.y = newpos.y;

        // CELOBJS[star]['sprite'].position = newpos;

    }

    function initPosition(star){

        if(star == "White Sun"){
            return 0;
        }

        var par = CELOBJS[star]['parent'];
        var parx = parseFloat(CELOBJS[star]['orbit_distance'])  + initPosition(par);

        return parx;



    }

    function importObjects(){

        CELOBJS = JSON.parse(verseObjects);

    }

    function onMouseWheel( ev ) {
        ZOOM_SPEED = ev.deltaY;

    }

    function onMouseDown( ev ) {
        ROTATING = true;
        ROTATION_MOUSE_ORIGIN.x = MOUSE_XY.x;
        ROTATION_MOUSE_ORIGIN.y = MOUSE_XY.y;

    }
    function onMouseMove( ev ) {
        MOUSE_XY = {x:ev.clientX , y:ev.clientY};
    }
    function onMouseUp( ev ) {
        ROTATING = false;
        THETA += NEWTHETA;
        PHI += NEWPHI;
        NEWTHETA = 0;
        NEWPHI= 0;
    }
    function rotate(){
        if(ROTATING){

            NEWTHETA = ( MOUSE_XY.x - ROTATION_MOUSE_ORIGIN.x) / 500;
            NEWPHI = ( MOUSE_XY.y - ROTATION_MOUSE_ORIGIN.y) / 500;
        };
    }

    function onClick(){
        var mouse = new THREE.Vector2();
        mouse.x = (MOUSE_XY.x / window.innerWidth ) * 2 - 1;
        mouse.y = -(MOUSE_XY.y / window.innerHeight ) * 2 + 1;

        RAYCASTER.setFromCamera( mouse, camera );

	      // calculate objects intersecting the picking ray
	      var intersects = RAYCASTER.intersectObjects(scene.children );

		    CENTRE = intersects[ 0 ].object.position;

    }


    function updateCamera(){

        camera.position.x = Math.sin(THETA + NEWTHETA) * ZOOM_LEVEL + CENTRE.x;
		    camera.position.y = Math.sin(PHI + NEWPHI) * ZOOM_LEVEL + CENTRE.y;
		    camera.position.z = Math.cos(THETA + NEWTHETA) * ZOOM_LEVEL + CENTRE.z;

    }

})();
