import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js'

var keys = {};

document.addEventListener("keydown", (event) => {
		keys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
		keys[event.key] = false;
});

const WINDOW = {
	width: 1024,
	height: 768,
	get aspect() { return this.width / this.height; },
};

const BALL_VELOCITY = {
	x: 0.01,
	z: 0.01,
	timer: 0,
	defaultX: 0.01,
	defaultZ: 0.01,
};

const DEFAULT_Y = {
	net: 0.5,
	netTop: 0.73,
	cylinder: 0.4,
};

const SCORE = {
	playerOne: 0,
	playerTwo: 0,
};

if (WebGL.isWebGLAvailable()) {

	const renderer = new THREE.WebGLRenderer();
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(80, WINDOW.aspect, 0.1, 1000);

	setupRenderer(renderer);
	document.querySelector('#pong_canvas').appendChild(renderer.domElement);

	const ball3d = setupBall();
	const ground = setupGround();
	const light = [setupLight(-10, 10), setupLight(10, 10), setupLight(-10, -10), setupLight(10, -10)];
	let player = [setupPlayer(-4, 0xff0000), setupPlayer(4, 0xffff00)];
	const canvas = [document.createElement('canvas'), document.createElement('canvas')];
	const context = [canvas[0].getContext('2d'), canvas[1].getContext('2d')];

	context[0].font = context[1].font = '48px Arial';
	context[0].fillStyle = context[1].fillStyle = 'red';
	context[0].fillText(SCORE.playerOne, 0, 50);
	context[1].fillText(SCORE.playerTwo, 0, 50);

	const texture = [new THREE.CanvasTexture(canvas[0]), new THREE.CanvasTexture(canvas[1])];
	const spriteMaterial = [new THREE.SpriteMaterial({map: texture[0]}), new THREE.SpriteMaterial({map: texture[1]})];
	const sprite = [new THREE.Sprite(spriteMaterial[0]), new THREE.Sprite(spriteMaterial[1])];

	sprite[0].position.set(-0.1, 2, 4);
	sprite[1].position.set(0.9, 2, 4);
	scene.add(...sprite);

	scene.background = new THREE.TextureLoader().load('./assets/xique-xique.jpg');
	scene.add(ball3d, ground);
	scene.add(...light);
	scene.add(...player);

	camera.position.set(0, 10, 0);
	camera.lookAt(scene.position);
	function animate() {
		requestAnimationFrame(animate);

		ballMove(ball3d, player);
		playerMove(player);
		camera.lookAt(scene.position);
		renderer.render(scene, camera);
	}
	animate();
} else {
	const warning = WebGL.getWebGLErrorMessage();
	document.querySelector('#pong_canvas').appendChild(warning);
}

function setupRenderer(renderer) {
	renderer.setSize(WINDOW.width, WINDOW.height);
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
	ball.geometry.computeBoundingSphere();
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

function playerMove(player) {
	if (keys["ArrowDown"])
		player[1].position.z += 0.1;
	if (keys["ArrowUp"])
		player[1].position.z -= 0.1;
	if (keys["s"])
		player[0].position.z += 0.1;
	if (keys["w"])
		player[0].position.z -= 0.1;
}

function ballMove(ball3d, player) {
	ball3d.position.x += BALL_VELOCITY.x;
	ball3d.position.z += BALL_VELOCITY.z;
	if (ball3d.position.z > 3.9 || ball3d.position.z < -3.9)
		BALL_VELOCITY.z = -BALL_VELOCITY.z * (Math.abs(BALL_VELOCITY.z) < 1 ? 1.1 : 1);
	else if (BALL_VELOCITY.timer > 0) {
		BALL_VELOCITY.timer--;
		return ;
	}
	else if (playerColision(ball3d, player)) {
		BALL_VELOCITY.x = -BALL_VELOCITY.x * (Math.abs(BALL_VELOCITY.x) < 1 ? 1.1 : 1);
		BALL_VELOCITY.timer = 500;
	}
	else if (ball3d.position.x > 4 || ball3d.position.x < -4)
		BALL_VELOCITY.x = -BALL_VELOCITY.x * (Math.abs(BALL_VELOCITY.x) < 1 ? 1.1 : 1);
}

function playerColision(ball3d, player) {
	const sphere = new THREE.Sphere(ball3d.position, ball3d.geometry.boundingSphere.radius);
	const box = new THREE.Box3().setFromObject(player[0]);
	const box2 = new THREE.Box3().setFromObject(player[1]);

	return sphere.intersectsBox(box) || sphere.intersectsBox(box2);
}
