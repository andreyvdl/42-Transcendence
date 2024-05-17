import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js'

if (WebGL.isWebGLAvailable()) {

	const renderer = new THREE.WebGLRenderer();
	const scene = new THREE.Scene();
	// acho que 4:3 fica melhor que 16:9
	const camera = new THREE.PerspectiveCamera(75, 1152 / 864, 0.1, 1000);

	setupRenderer(renderer);
	document.querySelector('#pong_canvas').appendChild(renderer.domElement);
	const ball = setupBall();
	const ground = setupGround();
	const light = [setupLight(-10, 10), setupLight(10, 10), setupLight(-10, -10), setupLight(10, -10)];

	scene.add(ball, ground, light[0], light[1], light[2], light[3]);
	camera.position.z = 5;
	camera.position.y = 5;
	
	var cubDiretion = { x: 0.01, z: 0.01 };
	
	function animate() {
		requestAnimationFrame(animate);
		ball.rotation.x -= 0.01;
		ball.rotation.y += 0.01;
		if (ball.position.z > 3 && cubDiretion.z > 0)
			cubDiretion.z = -cubDiretion.z;
		else if (ball.position.z < -3 && cubDiretion.z < 0)
			cubDiretion.z = -cubDiretion.z;
		if (ball.position.x > 2 && cubDiretion.x > 0)
			cubDiretion.x = -cubDiretion.x;
		else if (ball.position.x < -2 && cubDiretion.x < 0)
			cubDiretion.x = -cubDiretion.x;
		ball.position.x += cubDiretion.x;
		ball.position.z += cubDiretion.z;
		camera.lookAt(ball.position);
		renderer.render(scene, camera);
	}
	animate();
} else {
	const warning = WebGl.getWebGLErrorMessage();
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
	const groundTexture = new THREE.TextureLoader().load('./assets/tennis.png');
	const materialGround = new THREE.MeshStandardMaterial({map: groundTexture});
	const groundGeo = new THREE.PlaneGeometry(10, 10);
	const ground = new THREE.Mesh(groundGeo, materialGround);

	ground.receiveShadow = true;
	ground.position.y = -1;
	ground.rotation.x = -Math.PI / 2;
	return ground;
}

function setupLight(x, z, color = 0xffffff) {
	const light = new THREE.DirectionalLight(color, 1);

	light.position.set(x, 10, z);
	light.castShadow = true;
	return light;
}
