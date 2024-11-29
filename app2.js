// import * as THREE from 'three';

// Configuración inicial
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Añadir luz a la escena
const light = new THREE.DirectionalLight(0xffffff, 1);
// light.position.set(10, 10, 10).normalize();
camera.add(light);
scene.add(camera);

// Cargar el modelo OBJ
const loader = new THREE.OBJLoader();
let shirtMesh;
loader.load(
    './obj_0.obj', // Ruta al archivo OBJ
    (obj) => {
        // Configurar la escala, posición o rotación del modelo si es necesario
        obj.scale.set(2, 2, 2);
        obj.position.set(0, -1, 0); // Ajusta según el modelo
        shirtMesh = obj;
        // Añadir el modelo a la escena
        scene.add(shirtMesh);
    },
    (xhr) => {
        console.log(`Cargando: ${((xhr.loaded / xhr.total) * 100).toFixed(2)}% completado`);
    },
    (error) => {
        console.error('Error al cargar el modelo', error);
    }
);

// Posicionar la cámara
camera.position.z = 1;

// Configurar OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Agrega un efecto de suavizado en la rotación y zoom
controls.dampingFactor = 0.25;
controls.enableZoom = true; // Permite el zoom con la rueda del ratón
controls.enablePan = false; // Desactiva el desplazamiento en la vista


// Button elements
const enableButton = document.getElementById('enable-controls');
const disableButton = document.getElementById('disable-controls');
const imageUpload = document.getElementById('image-upload');

// Texture loader for the print
const textureLoader = new THREE.TextureLoader();
let decalMesh = null;


// Toggle controls based on button clicks
enableButton.addEventListener('click', () => {
    controls.enabled = true;
    enableButton.classList.add('active');
    disableButton.classList.remove('active');
});

disableButton.addEventListener('click', () => {
    controls.enabled = false;
    disableButton.classList.add('active');
    enableButton.classList.remove('active');
});


// Event listener for image upload
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file || !shirtMesh) return;

    const url = URL.createObjectURL(file);
    textureLoader.load(url, (texture) => {
        const decalMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
        });

        // Define decal properties
        const position = new THREE.Vector3(0, 0, 1);  // Adjust as needed
        const orientation = new THREE.Euler();        // Adjust rotation if necessary
        const size = new THREE.Vector3(1, 1, 1);      // Adjust size of the decal

        // Remove previous decal if present
        if (decalMesh) scene.remove(decalMesh);

        // Create and add DecalGeometry
        const decalGeometry = new THREE.DecalGeometry(shirtMesh, position, orientation, size);
        decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);
        scene.add(decalMesh);
    });
});


// Arrow key movement for the decal
window.addEventListener('keydown', (event) => {
    if (!decalMesh) return;

    const moveAmount = 0.1;
    switch (event.key) {
        case 'ArrowUp':
            decalMesh.position.y += moveAmount;
            break;
        case 'ArrowDown':
            decalMesh.position.y -= moveAmount;
            break;
        case 'ArrowLeft':
            decalMesh.position.x -= moveAmount;
            break;
        case 'ArrowRight':
            decalMesh.position.x += moveAmount;
            break;
    }
});

// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Adjust on window resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Reset camera on spacebar press
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        camera.position.set(0, 0, 5);
        controls.reset();
    }
});