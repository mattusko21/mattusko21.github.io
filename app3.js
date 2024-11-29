// import * as THREE from 'three';
const container = document.getElementById('threejs-container');
let selectedColor = "0xFAFAFA";
let scene, camera, renderer, objModel, canvasTexture, context;
let currentWidth = 3000;
let currentHeight = 3000;

let imgWidth;
let imgHeight;
// Configuración inicial
scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);
camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);
let imagePosX = 0, imagePosY = 0; // Initial position of the image
let image_index=0;
const canvas = document.createElement('canvas');

let garment = {
    code: "12345A",
    user: "mattusko21",
    type: "shirt",
    color: selectedColor,
    canvas_size: [currentWidth,currentHeight],
    images: []
};




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
        const canvasTexture = createCanvasTexture();

        // Create a material using the CanvasTexture
        const material = new THREE.MeshStandardMaterial({
            map: canvasTexture,   // Apply the printed texture
            // alphaMap: 0xffffff,
            // color: 0xff0000,
            transparent: false,
            roughness: 0.9,
            metalness: 0.05,
            depthWrite: true,  // Important for proper blending with underlying material
            // blending: THREE.AdditiveBlending
        });
        // applyPrintToModel(shirtMesh);
        shirtMesh.traverse(function (child) {

        
            if (child.isMesh) {
                const originalMaterial = child.material;



                // child.material = originalMaterial;
                child.material = material;
                // child.material = [originalMaterial, material];

                child.geometry.groupsNeedUpdate = true;
            }
        });
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

let images = [];
// Button elements
const enableButton = document.getElementById('enable-controls');
const disableButton = document.getElementById('disable-controls');

document.getElementById('uploadImages').addEventListener('change', handleImageUpload);

// Manejar la carga de imágenes
function handleImageUpload(event) {
    const files = event.target.files;
    for (let file of files) {
        const reader = new FileReader();
        reader.onload = function (e) {
            let im_w, im_h;
            const image = new Image();
            image.src = e.target.result;
            image.onload = function () {
                if (image.width > image.height) {
                    // factor= image.width/image.height;
                    im_w=500;
                    im_h=Math.trunc(im_w*image.height/image.width);
                } 
                else  {
                    // factor= image.height/500;
                    im_h=500;
                    im_w=Math.trunc(im_h*image.width/image.height);
                }
                images.push([image, 600, 1880, im_w, im_h]);
                updateImageSelector(); // Actualiza el selector de imágenes
            };
        };
        reader.readAsDataURL(file);
    }
    updateCanvasTexture()
}

// Actualizar el selector de imágenes
function updateImageSelector() {
    const selector = document.getElementById('imageSelector');
    selector.innerHTML = ""; // Limpia las opciones anteriores
    images.forEach((image, index) => {
        const option = document.createElement('option');

        option.value = index;
        option.textContent = `Imagen ${index + 1}`;
        selector.appendChild(option);
        
    });
    // console.log(selector.value)

    selector.addEventListener('change', () => image_index=Number(selector.value));
    selector.addEventListener('change', () => updateCanvasTexture()); // Actualiza el canvas al cambiar
    
    
}




document.getElementById('saveButton').addEventListener('click', () => {
    
    garment.images=images;
    // Convert the object to a JSON string
    const jsonData = JSON.stringify(garment, null, 2);

    // Create a Blob from the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Create a link to download the Blob
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'garment.json';

    // Trigger the download
    link.click();
  });

function exportCanvasAsImage() {
      // Convert canvas to data URL (Base64)
      const imageDataURL = canvas.toDataURL('image/png');

      // Display the image
    //   document.getElementById('exportedImage').src = imageDataURL;

      // Optional: Trigger download
      const link = document.createElement('a');
      link.download = 'canvas-image.png';  // Set filename
      link.href = imageDataURL;
      link.click();  // Trigger download
    }
    document.getElementById('exportBtn').addEventListener('click', exportCanvasAsImage);

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




// Render loop
function animate() {

    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('keydown', (event) => {
    const step = 10; // Pixels to move per key press
    if (images.length > 0) {

        if (event.key === "A" || event.key === "a" && images[image_index][1] > 260) {
            images[image_index][1] -= step;
        } else if (event.key === "D" || event.key === "d"&& images[image_index][1] < 3000-images[image_index][3]) {

            images[image_index][1] += step;
        } else if (event.key === "W" || event.key === "w" && images[image_index][2] > 1500) {
            images[image_index][2] -= step;
        } else if (event.key === "S" || event.key === "s" && images[image_index][2] < 2850-images[image_index][4]) {
            images[image_index][2] += step;
        }
        console.log(images[image_index][1], images[image_index][2], images[image_index][3], images[image_index][4]);
    }

    // Update the canvas texture
    updateCanvasTexture();
});
animate();
// Create a transparent canvas and apply the image to it`

function createCanvasTexture() {
    // Create a transparent canvas
    
    canvas.width = currentWidth;
    canvas.height = currentHeight;
    // showText(canvas.width, canvas.height);
    context = canvas.getContext('2d');
    
    // Create a texture from the canvas
    canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.needsUpdate = true;
    updateCanvasTexture()
    return canvasTexture;
}


function updateCanvasTexture() {
    // Clear the canvas
    
    
    selectedColor = localStorage.getItem('selectedColor');


    if (selectedColor) {
        garment.color=selectedColor;
        // console.log("Using the selected color:", selectedColor);
        // Draw the image on the canvas at the current position
        context.fillStyle = selectedColor;
        context.fillRect(0, 0, currentWidth, currentHeight);
        // const image = new Image();
        if (images.length > 0) {
            for (const image of images) {
                // console.log(image);

                // context.clearRect(0, 0, currentWidth, currentHeight);
                // console.log('Width:', imgWidth, ' Height:', imgHeight);
                
    
                context.drawImage(image[0], image[1], image[2], image[3], image[4]);
                canvasTexture.needsUpdate = true; // Update the texture once the image is loaded
          
            }
        }
        canvasTexture.needsUpdate = true;       

    }

    // console.log(imagePosX, imagePosY);
}


function updateCanvasSize(scaleUp) {
    
    
    // console.log(currentWidth, currentWidth);
    if (images.length > 0) {
        if (scaleUp) {
            images[image_index][3] *= 1.01;
            images[image_index][4] *= 1.01;
        } else {
            images[image_index][3] /= 1.01;
            images[image_index][4] /= 1.01;
        }
        console.log(images[image_index][3], images[image_index][4]);
    }
    updateCanvasTexture()
}

document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (key === '+') {
        // Increase canvas size by 10%
        updateCanvasSize(true);
    } else if (key === '-') {
        // Decrease canvas size by 10%
        updateCanvasSize(false);
    }
});

function showText(x, y) {
    // Set the text inside the div with id="displayText"
    document.getElementById('displayText').innerText = 'X: ' + x + ', Y: ' + y;

}

// Adjust on window resize
window.addEventListener('resize', () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
});
// Reset camera on spacebar press
window.addEventListener('keydown', (event) => {
    if (event.code === 'ControlLeft') {
        camera.position.set(0, 0, 5);
        controls.reset();
    }
});