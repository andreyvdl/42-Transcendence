import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js'

const DEFAULT_Y = {
	net: 0.5,
	netTop: 0.73,
	cylinder: 0.4,
}

if (WebGL.isWebGLAvailable()) {

	const renderer = new THREE.WebGLRenderer();
	const scene = new THREE.Scene();
	// acho que 4:3 fica melhor que 16:9
	const camera = new THREE.PerspectiveCamera(60, 1152 / 864, 0.1, 1000);

	setupRenderer(renderer);
	document.querySelector('#pong_canvas').appendChild(renderer.domElement);
	const ball = setupBall();
	const ground = setupGround();
	const light = [setupLight(-10, 10), setupLight(10, 10), setupLight(-10, -10), setupLight(10, -10)];
	const player = [setupPlayer(-4, 0xff0000), setupPlayer(4, 0xffff00)];
	const net = setupNet();
	const cylinder = [setupCylinder(3.9), setupCylinder(-3.9)]
	const netTop = setupNetTop();

	scene.background = new THREE.TextureLoader().load('./assets/xique-xique.jpg');
	scene.add(ball, ground, net, netTop);
	scene.add(...light);
	scene.add(...player);
	scene.add(...cylinder);

	camera.position.set(0, 2.5, 5);
	var dir = 0.05;
	function animate() {
		requestAnimationFrame(animate);

		ball.rotation.x += 0.03;
		ball.rotation.y -= 0.03;

		const dist = Math.abs(ball.position.x);

		if (dist > 4.0)
			dir = -dir;
		ball.position.x += dir;
		camera.position.x = -ball.position.x;;
		// fazer a rede descer ao invés de subir
		cylinder[0].position.y = DEFAULT_Y.cylinder / (dist / 4);
		cylinder[1].position.y = DEFAULT_Y.cylinder / (dist / 4);
		netTop.position.y = DEFAULT_Y.netTop / (dist / 4);
		net.position.y = DEFAULT_Y.net / (dist / 4);
		camera.lookAt(scene.position);
		// camera.lookAt(ball.position);
		renderer.render(scene, camera);
	}
	animate();
} else {
	const warning = WebGL.getWebGLErrorMessage();
	document.querySelector('#pong_canvas').appendChild(warning);
}

function setupRenderer(renderer) {
	renderer.setSize(1152, 864);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

function setupBall() {
	const ballTexture = new THREE.TextureLoader().load('./assets/compcube.png');
	const materialBall = new THREE.MeshStandardMaterial({map: ballTexture});
	const ballGeometry = new THREE.SphereGeometry(0.3);
	const ball = new THREE.Mesh(ballGeometry, materialBall);

	ball.position.y = 0.3;
	ball.castShadow = true;
	ball.receiveShadow = true;
	return ball;
}

function setupGround() {
	const groundTexture = new THREE.TextureLoader().load('./assets/table.png');
	const materialGround = new THREE.MeshStandardMaterial({map: groundTexture});
	const groundGeo = new THREE.PlaneGeometry(10, 10);
	const ground = new THREE.Mesh(groundGeo, materialGround);

	ground.receiveShadow = true;
	ground.position.y = 0;
	ground.rotation.x = -Math.PI / 2;
	return ground;
}

function setupLight(x, z, color = 0xffffff) {
	const light = new THREE.DirectionalLight(color, 1.0);

	light.position.set(x, 10, z);
	light.castShadow = true;
	return light;
}

function setupPlayer(x, color = 0x00ffff) {
	const player = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 1.2), new THREE.MeshStandardMaterial({color: color}));

	player.position.set(x, 0.1, 0);
	player.castShadow = true;
	player.receiveShadow = true;
	return player;
}

function setupNet() {
	const gridHelper = new THREE.GridHelper(1, 9, 0x00aa00, 0x00aa00);

	gridHelper.castShadow = true;
	gridHelper.rotateZ(-Math.PI / 2);
	gridHelper.scale.set(0.5, 0, 7.9);
	gridHelper.position.y = 0.5;
	return gridHelper;
}

function setupCylinder(z) {
	const cyGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.8);
	const cyMat = new THREE.MeshStandardMaterial({color: 0x0000ff});
	const cylinder = new THREE.Mesh(cyGeo, cyMat);

	cylinder.position.set(0, 0.4, z);
	cylinder.castShadow = true;
	cylinder.receiveShadow = true;
	return cylinder;
}

function setupNetTop() {
	const netTopGeo = new THREE.BoxGeometry(0.1, 0.1, 7.6);
	const netTopMat = new THREE.MeshStandardMaterial({color: 0xffffff});
	const netTop = new THREE.Mesh(netTopGeo, netTopMat);

	netTop.position.set(0, 0.73, 0);
	netTop.castShadow = true;
	netTop.receiveShadow = true;
	return netTop;
}
