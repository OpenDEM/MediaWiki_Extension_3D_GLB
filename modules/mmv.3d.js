/*
 * This file is part of the MediaWiki extension 3D.
 *
 * The 3D extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * The 3D extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with The 3D extension. If not, see <http://www.gnu.org/licenses/>.
 */

window.THREE = require('./lib/three/three.js');

let singleton = false;

function ThreeD(viewer) {
	THREE.Cache.enabled = true;

	this.viewer = viewer;
	this.progressBar = viewer.ui.panel.progressBar;
	this.$container = viewer.ui.canvas.$imageDiv;
}

const TD = ThreeD.prototype;

TD.init = function () {
	const dimensions = this.getDimensions();

	this.renderer = new THREE.WebGLRenderer({ antialias: true });
	this.renderer.setClearColor(0x222222);
	this.renderer.setPixelRatio(window.devicePixelRatio);
	this.renderer.setSize(dimensions.width, dimensions.height);
	this.renderer.shadowMap.enabled = true;

	this.$container.html(this.renderer.domElement);

	this.manager = new THREE.LoadingManager();

	this.camera = new THREE.PerspectiveCamera(60, dimensions.ratio);

	this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
	this.controls.rotateSpeed = 2;
	this.controls.zoomSpeed = 2;
	this.controls.panSpeed = 0.5;
	this.controls.addEventListener('change', this.render.bind(this));
	this.controls.addEventListener('start', this.controlsStart.bind(this));
	this.controls.addEventListener('end', this.controlsEnd.bind(this));
	// Scene and RoomEnvironment
	const environment = new THREE.RoomEnvironment(this.renderer);
	const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
	this.scene = new THREE.Scene();
	this.scene.environment = pmremGenerator.fromScene(environment).texture;
	environment.dispose();

	$(window).on('resize.3d', mw.util.debounce(this.onWindowResize.bind(this), 100));

	this.render();
};

TD.geometryToObject = function (geometry) {
	/*
	const material = new THREE.MeshPhongMaterial(
		{ color: 0xf0ebe8, shininess: 5, flatShading: true, side: THREE.DoubleSide }
	);
	*/
	const vertexColors = geometry.hasAttribute('color');
	const material = new THREE.MeshStandardMaterial(
		{ color: 0xf0ebe8, flatShading: true, side: THREE.DoubleSide, vertexColors }
	);


	return new THREE.Mesh(geometry, material);
};

TD.render = function () {
	this.renderer.render(this.scene, this.camera);
};

TD.animate = function () {
	requestAnimationFrame(this.animate.bind(this));
	this.controls.update();
};

TD.onWindowResize = function () {
	const dimensions = this.getDimensions();

	this.camera.aspect = dimensions.width / dimensions.height;
	this.camera.updateProjectionMatrix();

	this.renderer.setSize(dimensions.width, dimensions.height);

	this.controls.handleResize();

	this.render(this.renderer, this.scene, this.camera);
};

TD.unload = function () {
	// 3D files are wrapped inside a new parent class, where the '3D' badge
	// is also attached to
	// we don't want to keep that wrapper class around (could cause unexpected
	// results), and definitely want that '3D' badge gone...
	const $threedParent = this.$container.parent('.mw-3d-wrapper');
	$threedParent.replaceWith(this.$container);
};

TD.load = function (extension, url) {
	// Abort any loading that might still be happening
	if (this.promise) {
		this.promise.reject();
	}

	this.promise = this.loadFile(extension, url);

	this.progressBar.jumpTo(0);
	this.progressBar.animateTo(5);

	this.promise.then((object) => {
		delete this.promise;

		this.progressBar.hide();
		const content = extension === 'glb' ? object.scene : object;

		// STL contains a single mesh, GLB may contain more. Traverse
		// to handle both cases.
		content.traverse(function (node) {
			if (node.isMesh) {
				node.castShadow = true;
				node.receiveShadow = true;
			}
		});

		object = content;
		object.updateMatrixWorld();

		// Compute axis-aligned bounding box (AABB) and center (x, y, z) in
		// world space. Size, defined here as a cheap approximation of
		// model's maximum span in any direction, is computed from the AABB.
		const box = new THREE.Box3().setFromObject(object);
		const center = box.getCenter(new THREE.Vector3());
		const size = box.getSize(new THREE.Vector3()).length();

		// Center content at the origin, (0, 0, 0).
		object.position.x -= center.x;
		object.position.y -= center.y;
		object.position.z -= center.z;

		// In glTF, +Y=Up is required. In STL it's unclear, but for backward-
		// compatibility we keep +Z=Up. Because some three.js features assume
		// +Y=Up, apply a +Z to +Y conversion for STL.
		if (this.modeltype === 'stl') {
			const parent = new THREE.Object3D();
			parent.rotation.set(- Math.PI / 2, 0, 0);
			parent.add(object);
			object = parent;
		}

		// Prevent controls from dollying out farther than 10x size.
		this.controls.maxDistance = size * 10;

		// Constrain camera near and far planes to factors of size. Planes
		// should fit the content tightly enough that depth buffer
		// precision is utilized well, but not so tight that the model
		// clips the near/far planes easily while interacting with controls.
		this.camera.near = size / 100;
		this.camera.far = size * 100;
		this.camera.updateProjectionMatrix();

		// Default viewing angle is arbitrary and subjective, some models
		// may benefit from a more top-down or front-facing perspective. To
		// split the difference somewhat, we use a diagonal. Comparisons:
		// sketchfab.com: ( 0, -distance, 0 )
		// viewstl.com: ( 0, 0 distance )
		// openjscad.org: ( 0, -distance, distance )
		// thingiverse.com: ( -distance, -distance, distance )
		this.camera.position.x += size * 0.75;
		this.camera.position.y += size * 0.5;
		this.camera.position.z += size * 0.75;

		// Rotate the camera to look at the object's center, (0, 0, 0).
		this.camera.lookAt(object.position);

		// Add content to scene.
		this.scene.add(object);

		mw.threed.base.wrap(this.$container);
	}).progress((progress) => {
		this.progressBar.animateTo(progress);
	}).fail(( /* error */) => {
		this.progressBar.hide();
		delete this.promise;
	});
};

TD.glb = function (data) {
	return data
}

TD.loadFile = function (extension, url) {
	const deferred = $.Deferred();

	let loader;


	if (extension === 'stl') {
		loader = new THREE.STLLoader(this.manager);
	}

	if (extension === 'glb') {

		const ktx2Loader = new THREE.KTX2Loader()
			.setTranscoderPath('lib/three/')
			.detectSupport(this.renderer);
		loader = new THREE.GLTFLoader(this.manager);

		loader.setKTX2Loader(ktx2Loader);
		loader.setMeshoptDecoder(THREE.MeshoptDecoder);

	}

	const request = loader.load(url, (data) => {
		let object = data;

		if (extension === 'stl') {
			object = this.geometryToObject(data);
		}
		if (extension === 'glb') {
			object = this.glb(data);
		}

		deferred.resolve(object);
	}, (progress) => {
		deferred.notify((progress.loaded / progress.total) * 100);
	}, (error) => {
		deferred.reject(error);
	});

	deferred.fail(() => {
		if (request && request.readyState !== 4) {
			request.abort();
		}
	});

	return deferred.promise();
};

TD.controlsStart = function () {
	$(this.renderer.domElement).addClass('mw-mmv-canvas-mousedown');
};

TD.controlsEnd = function () {
	$(this.renderer.domElement).removeClass('mw-mmv-canvas-mousedown');
};

TD.getDimensions = function () {
	const width = $(window).width(),
		height = this.viewer.ui.canvas.$imageWrapper.height();

	return { width: width, height: height, ratio: width / height };
};

$(document).on('mmv-metadata.3d', (e) => {
	const extension = e.image.filePageTitle.getExtension();

	// Ignore events from formats that we don't care about


	if (extension !== 'stl' && extension !== 'glb') {
		return;
	}


	if (!singleton) {
		singleton = new ThreeD(e.viewer);
	}

	singleton.init();
	singleton.animate();
	singleton.load(extension, e.imageInfo.url);
});

// unload when switching images or cleaning up MMV altogether
$(document).on('mmv-hash mmv-cleanup-overlay', () => {
	if (singleton) {
		singleton.unload();
	}
});

mw.mmv.ThreeD = ThreeD;
