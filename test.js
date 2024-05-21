import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js'

var keys = {};

var BALLPAUSE = false;

document.addEventListener("keydown", (event) => {
		keys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
		keys[event.key] = false;
});

const WINDOW = {
	width: window.innerWidth,
	height: window.innerHeight,
	get aspect() { return this.width / this.height; },
};

const BALL_VELOCITY = {
	defaultX: 0.05,
	defaultZ: 0.06,
	x: 0.05,
	z: 0.06,
	timer: 0,
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
	const light = [setupLight(20, 20), setupLight(-20, -20), setupLight(-20, 20), setupLight(20, -20)];
	const player = [setupPlayer(-8, 0xff0000), setupPlayer(8, 0xffff00)];
	const canvas = [document.createElement('canvas'), document.createElement('canvas')];

	canvas[0].width = canvas[1].width = 512;
	canvas[0].height = canvas[1].height = 512;

	const context = [canvas[0].getContext('2d'), canvas[1].getContext('2d')];

	context[0].font = context[1].font = '72px Arial';
	context[0].fillStyle = context[1].fillStyle = 'red';
	context[0].fillText(SCORE.playerOne, 0, 256);
	context[1].fillText(SCORE.playerTwo, 0, 256);

	const texture = [new THREE.CanvasTexture(canvas[0]), new THREE.CanvasTexture(canvas[1])];
	const spriteMaterial = [new THREE.SpriteMaterial({map: texture[0]}), new THREE.SpriteMaterial({map: texture[1]})];
	const sprites = [new THREE.Sprite(spriteMaterial[0]), new THREE.Sprite(spriteMaterial[1])];

	sprites[0].position.set(0, 5, 4);
	sprites[1].position.set(1, 5, 4);
	scene.background = new THREE.TextureLoader().load('./assets/xique-xique.jpg');
	scene.add(ball3d, ground, ...light);
	scene.add(...player);
	scene.add(...sprites);

	window.onresize = () => {
		WINDOW.width = window.innerWidth;
		WINDOW.height = window.innerHeight;
		renderer.setSize(WINDOW.width, WINDOW.height);
		camera.aspect = WINDOW.aspect;
		camera.updateProjectionMatrix();
	}
	BALL_VELOCITY.x = (Math.floor(Math.random() * (2 - 1 + 1) + 1) % 2 ? BALL_VELOCITY.defaultX : -BALL_VELOCITY.defaultX);
	BALL_VELOCITY.z = (Math.floor(Math.random() * (2 - 1 + 1) + 1) % 2 ? BALL_VELOCITY.defaultZ : -BALL_VELOCITY.defaultZ);
	sprites[0].scale

	camera.position.set(0, 10, 0);
	camera.lookAt(scene.position);
	ball3d.position.z = Math.random() * 10 - 5;
	function animate() {
		requestAnimationFrame(animate);

		scoreUpdate(canvas, sprites);
		playerMove(player);
		if (!BALLPAUSE) {
			ballMove(ball3d, player);
			ball3d.rotation.x += BALL_VELOCITY.x;
			ball3d.rotation.z += -BALL_VELOCITY.z;
		}
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
	const ballGeometry = new THREE.SphereGeometry(0.4);
	const ball = new THREE.Mesh(ballGeometry, materialBall);

	ball.position.y = 0.4;
	ball.castShadow = true;
	ball.receiveShadow = true;
	ball.geometry.computeBoundingSphere();
	return ball;
}

function setupGround() {
	const groundTexture = new THREE.TextureLoader().load('./assets/table.png');
	const materialGround = new THREE.MeshStandardMaterial({map: groundTexture});
	const groundGeo = new THREE.PlaneGeometry(20, 20);
	const ground = new THREE.Mesh(groundGeo, materialGround);

	ground.receiveShadow = true;
	ground.position.y = 0;
	ground.rotation.x = -Math.PI / 2;
	return ground;
}

function setupLight(x, z, color = 0xffffff) {
	const light = new THREE.DirectionalLight(color, 2.0);

	light.position.set(x, 10, z);
	light.castShadow = true;
	light.shadow.camera.left = -20;
	light.shadow.camera.right = 20;
	light.shadow.camera.top = 20;
	light.shadow.camera.bottom = -20;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 2000;
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
	if (Math.abs(ball3d.position.z) > 7.5)
		BALL_VELOCITY.z = -BALL_VELOCITY.z * (Math.random() * (1.1 - 1.01) + 1.01);
	else if (Math.abs(ball3d.position.x) > 10) {
		if (ball3d.position.x < 0)
			SCORE.playerTwo++;
		else
			SCORE.playerOne++;
		BALL_VELOCITY.x = (Math.random() < 0.5 ? BALL_VELOCITY.defaultX : -BALL_VELOCITY.defaultX);
		BALL_VELOCITY.z = (Math.random() < 0.5 ? BALL_VELOCITY.defaultZ : -BALL_VELOCITY.defaultZ);
		ball3d.position.x = 0;
		ball3d.position.z = Math.random() * 8 - 4;
		BALLPAUSE = true;
		setTimeout(() => { BALLPAUSE = false }, 500);
	}
	else if (BALL_VELOCITY.timer > 0) {
		BALL_VELOCITY.timer--;
		return ;
	}
	else if (playerColision(ball3d, player)) {
		BALL_VELOCITY.x = -BALL_VELOCITY.x * (Math.random() * (1.1 - 1.01) + 1.01);
		BALL_VELOCITY.timer = 5 / Math.abs(BALL_VELOCITY.x);
	}
}

function playerColision(ball3d, player) {
	const sphere = new THREE.Sphere(ball3d.position, ball3d.geometry.boundingSphere.radius);
	const box = new THREE.Box3().setFromObject(player[0]);
	const box2 = new THREE.Box3().setFromObject(player[1]);

	return sphere.intersectsBox(box) || sphere.intersectsBox(box2);
}

function scoreUpdate(canvas, sprites) {
	const context = [canvas[0].getContext('2d'), canvas[1].getContext('2d')];

	context[0].clearRect(0, 0, canvas[0].width, canvas[0].height);
	context[1].clearRect(0, 0, canvas[1].width, canvas[1].height);
	context[0].fillText(SCORE.playerOne, 0, 256);
	context[1].fillText(SCORE.playerTwo, 0, 256);
	sprites[0].material.map.needsUpdate = true;
	sprites[1].material.map.needsUpdate = true;
}

