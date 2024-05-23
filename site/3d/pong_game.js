import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js'

var RESOLUTIONS = [
	{ w: 6400, h: 4800 },
	{ w: 4096, h: 3072 },
	{ w: 3200, h: 2400 },
	{ w: 2048, h: 1536 },
	{ w: 1152, h: 864 },
	{ w: 1024, h: 768 },
	{ w: 800, h: 600 },
	{ w: 640, h: 480 },
	{ w: 320, h: 240 },
	{ w: 160, h: 120 },
]

var KEYS = {};

var BALLPAUSE = false;

document.addEventListener("keydown", (event) => {
	KEYS[event.key] = true;
});

document.addEventListener("keyup", (event) => {
	KEYS[event.key] = false;
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

function calculateWindow() {
	const resolution = RESOLUTIONS.find((resolution) => resolution.w <= window.innerWidth && resolution.h <= window.innerHeight);

	console.log(resolution);
	if (resolution) {
		WINDOW.width = resolution.w;
		WINDOW.height = resolution.h;
	}
	else {
		WINDOW.width = window.innerWidth;
		WINDOW.height = window.innerHeight;
	}
}

if (WebGL.isWebGLAvailable()) {
	calculateWindow();
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
	// const listener = new THREE.AudioListener();

	// camera.add(listener);

	// const sound = new THREE.Audio(listener);
	// const audioLoader = new THREE.AudioLoader();

	// audioLoader.load('./assets/hino-flamengo.mp3', (buffer) => {
	// 	sound.setBuffer(buffer);
	// 	sound.setLoop(true);
	// 	sound.setVolume(0.5);
	// 	sound.play();
	// });

	// document.addEventListener('click', function () {
	// 	if (listener.context.state === 'suspended') {
	// 		listener.context.resume();
	// 	}

	// 	sound.play();
	// });
	sprites[0].position.set(-4.2, 0, -6.2);
	sprites[1].position.set(13.5, 0, -6.2);
	scene.background = new THREE.TextureLoader().load('./assets/xique-xique.jpg');
	scene.add(ball3d, ground);
	scene.add(...light);
	// scene.add(new THREE.AmbientLight(0xffffff, 1));
	scene.add(...player);
	scene.add(...sprites);

	window.onresize = () => {
		calculateWindow();
		renderer.setSize(WINDOW.width, WINDOW.height);
		camera.aspect = WINDOW.aspect;
		camera.updateProjectionMatrix();
	}

	sprites[0].scale.set(10, 10, 10);
	sprites[1].scale.set(10, 10, 10);
	camera.position.set(0, 10, 0);
	camera.lookAt(scene.position);
	ball3d.position.z = THREE.MathUtils.randFloat(-7, 7);
	BALL_VELOCITY.z = (ball3d.position.z > 0 ? BALL_VELOCITY.defaultZ : -BALL_VELOCITY.defaultZ);
	BALL_VELOCITY.x = (THREE.MathUtils.randInt(1, 2) == 2 ? BALL_VELOCITY.defaultX : -BALL_VELOCITY.defaultX);
	BALLPAUSE = true;
	setTimeout(() => { BALLPAUSE = false }, 1000);

	function animate() {
		// light.forEach((light) => { light.target = ball3d; });
		playerMove(player);
		if (!BALLPAUSE) {
			scoreUpdate(canvas, sprites);
			ballMove(ball3d, player, scene);
			ball3d.rotateX(BALL_VELOCITY.z);
			ball3d.rotateZ(-BALL_VELOCITY.x);
		}
		requestAnimationFrame(animate);
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
	ground.rotation.x = -1.57079632679;
	return ground;
}

function setupLight(x, z, color = 0xffffff) {
	const light = new THREE.DirectionalLight(color, 1.0);

	light.position.set(x, 50, z);
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
	if (KEYS["ArrowDown"] && player[1].position.z + 0.2 < 6)
	player[1].position.z += 0.2;
	if (KEYS["ArrowUp"] && player[1].position.z - 0.2 > -6)
	player[1].position.z -= 0.2;
	if (KEYS["s"] && player[0].position.z + 0.2 < 6)
	player[0].position.z += 0.2;
	if (KEYS["w"] && player[0].position.z - 0.2 > -6)
	player[0].position.z -= 0.2;
}

function ballMove(ball3d, player, scene) {
	ball3d.position.x += BALL_VELOCITY.x;
	ball3d.position.z += BALL_VELOCITY.z;
	if (Math.abs(ball3d.position.z) > 7.5)
		BALL_VELOCITY.z = -BALL_VELOCITY.z * (BALL_VELOCITY.z < 1 ? THREE.MathUtils.randFloat(1.1, 1.2) : 1);
	else if (Math.abs(ball3d.position.x) > 10) {
		if (ball3d.position.x < 0) {
			if (SCORE.playerTwo == 1) {
				alert('Player Two Wins!');
				SCORE.playerOne = 0;
				SCORE.playerTwo = -1;
			}
			SCORE.playerTwo++;
		}
		else {
			if (SCORE.playerOne == 1) {
				alert('Player One Wins!');
				SCORE.playerOne = -1;
				SCORE.playerTwo = 0;
			}
			SCORE.playerOne++;
		}
		ball3d.position.z = THREE.MathUtils.randFloat(-7, 7);
		ball3d.position.x = 0;
		BALL_VELOCITY.z = (ball3d.position.z > 0 ? BALL_VELOCITY.defaultZ : -BALL_VELOCITY.defaultZ);
		BALL_VELOCITY.x = (THREE.MathUtils.randInt(1, 2) == 2 ? BALL_VELOCITY.defaultX : -BALL_VELOCITY.defaultX);
		BALLPAUSE = true;
		setTimeout(() => { BALLPAUSE = false }, 500);
	}
	else if (BALL_VELOCITY.timer > 0) {
		BALL_VELOCITY.timer--;
		return ;
	}
	else if (playerColision(ball3d, player)) {
		let vector;

		BALL_VELOCITY.x = -BALL_VELOCITY.x * (BALL_VELOCITY.x < 1 ? THREE.MathUtils.randFloat(1.1, 1.2) : 1);
		BALL_VELOCITY.timer = 5 / Math.abs(BALL_VELOCITY.x);
		if (ball3d.position.x > 0)
			vector = player[1].position;
		else
			vector = player[0].position;
		BALL_VELOCITY.z = (ball3d.position.z - vector.z) / 10;
	}
}

function playerColision(ball3d, player) {
	const sphere = new THREE.Sphere(ball3d.position, ball3d.geometry.boundingSphere.radius);
	const box = new THREE.Box3().setFromObject(player[0]);
	const box2 = new THREE.Box3().setFromObject(player[1]);

	if (ball3d.position.x + 0.15 > player[1].position.x)
		return false;
	else if (ball3d.position.x - 0.15 < player[0].position.x)
		return false;
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
