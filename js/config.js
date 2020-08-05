var verseConfig = {

 maxRadius : 1000,
 minRadius : 2,
 zoomSlowDamping : 0.1,
 zoomQuickDamping : 0.9,

 zoomDamping : 0.1,
 cameraDistance : 50.0,
 zoomSpeed : 0.0,

 rotating : false,
 mouseXY: {},
 rotationMouseOrigin : {x:0, y:0},

 simSpeed : 0.01,

 celObjs: {},

 newTheta : 0,
 newPhi : 0,
 theta :  .5 * Math.PI * ( .5 ),
 phi : .25 * Math.PI * ( .5 ),

 rayCaster : new THREE.Raycaster(),

 centre : new THREE.Vector3(0,0,0)

}
