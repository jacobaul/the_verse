
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    var renderer = new THREE.WebGLRenderer();

    init();
    animate();


    function init() {
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

        importObjects();

        var light = new THREE.AmbientLight( 0x404040 ); // soft white light
        scene.add( light );


        for (star in verseConfig.celObjs){
            var radius = parseFloat(verseConfig.celObjs[star]['diameter']);
            var starGeometry = new THREE.SphereGeometry(2*radius,16,16 );
            var starMaterial = new THREE.MeshStandardMaterial( );

            if(verseConfig.celObjs[star]['class'] == 'L'){

                var temp = verseConfig.celObjs[star]["temperature"];

                if(temp != null){
                    var rgb = temperature_to_rgb(temp);
                    starMaterial.emissive = new THREE.Color(rgb.r, rgb.g, rgb.b);
                }else{

                    starMaterial.emissive = new THREE.Color(0xffffff);

                }
            }else{
                starMaterial.color = new THREE.Color(0xffff00);
            }
            var starObj = new THREE.Mesh( starGeometry, starMaterial );

            var spriteMap = new THREE.TextureLoader().load( "res/img/marker_sprite_w.png" );
            var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );

            var sprite = new THREE.Sprite( spriteMaterial );

            sprite.scale = new THREE.Vector3(10,10,10);

            verseConfig.celObjs[star]['sceneObj'] = starObj;
            verseConfig.celObjs[star]['sceneObj'].position.x = initPosition(star);

            verseConfig.celObjs[star]['sprite'] = sprite;

            verseConfig.celObjs[star]['phi'] = 0;
            verseConfig.celObjs[star]['theta'] = 1;

            scene.add(starObj);
            scene.add( sprite );
        }

        for (star in verseConfig.celObjs){
            if (star != "White Sun"){
                var parent = verseConfig.celObjs[star]["parent"];
                var testrad = verseConfig.celObjs[star]["orbit_distance"];
                var geometry = new THREE.TorusGeometry( testrad, 0.0005, 2, 64 );
                var wireframe = new THREE.WireframeGeometry( geometry );
                var line = new THREE.LineSegments( wireframe );


                if(verseConfig.celObjs[star]['class'] == 'L'){
                    var material = new THREE.LineBasicMaterial( {
	                      color: 0xFF0000,
	                      linewidth: 0.5,
                    } );
                }else{
                    var material = new THREE.LineBasicMaterial( {
	                      color: 0x000088,
	                      linewidth: 0.5,
                    } );

                }
                line.material = material;

                line.position.x = verseConfig.celObjs[parent]["sceneObj"].position.x;
                line.position.y = verseConfig.celObjs[parent]["sceneObj"].position.y;
                line.position.z = verseConfig.celObjs[parent]["sceneObj"].position.z;

                line.rotateX(Math.PI / 2);
                verseConfig.celObjs[star]["orbit_torus"] = line;
                scene.add(line);

            }
        }
        verseConfig.celObjs["Blue Sun"]['phi'] = 3;
        verseConfig.celObjs["Burnham"]['phi'] = 3;
        verseConfig.celObjs["Burnham"]['theta'] = 0;


        verseConfig.celObjs["Blue Sun"]["sceneObj"].material.emissive = new THREE.Color(177,204,255);
        verseConfig.celObjs["White Sun"]["sceneObj"].material.emissive = new THREE.Color(230,240,255);
        verseConfig.celObjs["Red Sun"]["sceneObj"].material.emissive = new THREE.Color(255,246,233);

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

        for(star in verseConfig.celObjs){
            updatePosition(star);
        }
        updateCamera();

        camera.lookAt( verseConfig.centre);

	      renderer.render( scene, camera );
    }

    function zoom() {
        if(verseConfig.cameraDistance > verseConfig.maxRadius || verseConfig.cameraDistance < verseConfig.minRadius){
            zoomDamping = verseConfig.zoomQuickDamping;
        }else{
            zoomDamping = verseConfig.zoomSlowDamping;
        }

        verseConfig.cameraDistance += verseConfig.zoomSpeed;

        if(verseConfig.cameraDistance < verseConfig.minRadius){
            verseConfig.cameraDistance = verseConfig.minRadius;
        }

        verseConfig.zoomSpeed  = verseConfig.zoomSpeed*(1-zoomDamping);



    }

    function updatePosition(star){

        var par = verseConfig.celObjs[star]['parent'];
        if(par == "N/A"){
            var parpos = new THREE.Vector3(0,0,0);
        }else{
            var parpos = verseConfig.celObjs[par]['sceneObj'].position;
        }

        var theta = verseConfig.celObjs[star]['theta'];
        var phi = verseConfig.celObjs[star]['phi'];
        var r = parseFloat(verseConfig.celObjs[star]['orbit_distance']);

        verseConfig.celObjs[star]['theta'] += (verseConfig.simSpeed / ( Math.sqrt(r))) * Math.cos(phi);
        verseConfig.celObjs[star]['phi'] += (verseConfig.simSpeed / ( Math.sqrt(r))) * Math.sin(phi);

        if(star != "White Sun"){
            verseConfig.celObjs[star]["orbit_torus"].position.x = parpos.x;
            verseConfig.celObjs[star]["orbit_torus"].position.y = parpos.y;
            verseConfig.celObjs[star]["orbit_torus"].position.z = parpos.z;
        }


        verseConfig.celObjs[star]['theta'] %= 2*Math.PI;
        var deltax = r * Math.cos(theta);
        var deltaz = r * Math.sin(theta);
        var deltay = r * Math.sin(phi);


        var newpos = new THREE.Vector3(deltax,deltay,deltaz);
        newpos.add(parpos);


        verseConfig.celObjs[star]['sceneObj'].position.x = newpos.x;
        verseConfig.celObjs[star]['sceneObj'].position.z = newpos.z;
        verseConfig.celObjs[star]['sceneObj'].position.y = newpos.y;

        // verseConfig.celObjs[star]['sprite'].position = newpos;

    }

    function initPosition(star){

        if(star == "White Sun"){
            return 0;
        }

        var par = verseConfig.celObjs[star]['parent'];
        var parx = parseFloat(verseConfig.celObjs[star]['orbit_distance'])  + initPosition(par);

        return parx;



    }

    function importObjects(){

        verseConfig.celObjs = JSON.parse(verseObjects);


    }

    function onMouseWheel( ev ) {
        verseConfig.zoomSpeed = ev.deltaY;

    }

    function onMouseDown( ev ) {
        verseConfig.rotating = true;
        verseConfig.rotationMouseOrigin.x = verseConfig.mouseXY.x;
        verseConfig.rotationMouseOrigin.y = verseConfig.mouseXY.y;

    }
    function onMouseMove( ev ) {
        verseConfig.mouseXY = {x:ev.clientX , y:ev.clientY};
    }
    function onMouseUp( ev ) {
        verseConfig.rotating = false;
        verseConfig.theta += verseConfig.newTheta;
        verseConfig.phi += verseConfig.newPhi;
        verseConfig.theta %= 2*Math.PI;
        verseConfig.phi %= 2*Math.PI;
        verseConfig.newTheta = 0;
        verseConfig.newPhi= 0;
    }
    function rotate(){
        if(verseConfig.rotating){

            verseConfig.newTheta = ( verseConfig.mouseXY.x - verseConfig.rotationMouseOrigin.x) / window.innerWidth * Math.PI * 2 * 2;
            verseConfig.newPhi = -( verseConfig.mouseXY.y - verseConfig.rotationMouseOrigin.y) / window.innerHeight * Math.PI * 2 * 2;
        };
    }

    function onClick(){
        var mouse = new THREE.Vector2();
        mouse.x = (verseConfig.mouseXY.x / window.innerWidth ) * 2 - 1;
        mouse.y = -(verseConfig.mouseXY.y / window.innerHeight ) * 2 + 1;

        verseConfig.rayCaster.setFromCamera( mouse, camera );

	      // calculate objects intersecting the picking ray
	      var intersects = verseConfig.rayCaster.intersectObjects(scene.children );

        if (intersects.length > 0){
            verseConfig.centre = intersects[ 0 ].object.position;
        }
    }


    function updateCamera(){

        var phi_rot = (verseConfig.phi + verseConfig.newPhi)
        var theta_rot = (verseConfig.theta + verseConfig.newTheta)

        //Clamp vertical rotation to 180 deg.
        phi_rot = Math.max(Math.min(phi_rot, Math.PI), 0.001);


        //Spherical coordinate to XYZ.
        camera.position.x = Math.sin(phi_rot) * Math.cos(theta_rot) * verseConfig.cameraDistance + verseConfig.centre.x;
        camera.position.y = Math.cos(phi_rot) * verseConfig.cameraDistance + verseConfig.centre.y;
		    camera.position.z = Math.sin(phi_rot) * Math.sin(theta_rot) * verseConfig.cameraDistance + verseConfig.centre.z;



    }
