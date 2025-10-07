import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let preloadedCatModel = null;
let isModelLoading = false;

function loadCatModel() {
    return new Promise((resolve, reject) => {
        const mtlLoader = new MTLLoader();
        mtlLoader.setPath('recursos/');
        mtlLoader.load('12221_Cat_v1_l3.mtl', (materials) => {
            materials.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('recursos/');
            objLoader.load('12221_Cat_v1_l3.obj', (object) => {
                preloadedCatModel = object;
                resolve(preloadedCatModel);
            }, undefined, (error) => reject(error));
        });
    });
}

function displayModelInViewer(container) {
    container.innerHTML = '';
    container.style.backgroundColor = '#008ba3';

    const modelInstance = preloadedCatModel.clone();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    modelInstance.scale.set(0.1, 0.1, 0.1);
    modelInstance.position.y = -10;
    scene.add(modelInstance);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, -5, 0);
    controls.enablePan = false;
    controls.minDistance = 20;
    controls.maxDistance = 60;
    
    function animate() {
        requestAnimationFrame(animate);
        controls.update(); 
        renderer.render(scene, camera);
    }
    animate();
}

document.addEventListener('DOMContentLoaded', () => {
    const scrollContainer = document.getElementById('scroll-container');
    const scrollLeftBtn = document.getElementById('scroll-left');
    const scrollRightBtn = document.getElementById('scroll-right');
    
    if (scrollContainer && scrollLeftBtn && scrollRightBtn) {
        scrollLeftBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: -250, behavior: 'smooth' });
        });
        scrollRightBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: 250, behavior: 'smooth' });
        });
    }

    const viewerContainer = document.getElementById('viewer-container');
    const clickableItems = document.querySelectorAll('.scroll-item');

    clickableItems.forEach(item => {
        item.addEventListener('click', async () => {
            const title = item.dataset.title;
            const description = item.dataset.description;

            const titleElement = document.querySelector('.TextoObj h2');
            const descriptionElement = document.querySelector('.TextoObj p');

            if (title && description && titleElement && descriptionElement) {
                titleElement.textContent = title;
                descriptionElement.textContent = description;
            }

            if (!preloadedCatModel) {
                if (isModelLoading) return;
                isModelLoading = true;
                viewerContainer.innerHTML = '<p class="viewer-placeholder">Cargando modelo 3D...</p>';
                try {
                    await loadCatModel();
                    displayModelInViewer(viewerContainer);
                } catch (error) {
                    console.error("No se pudo cargar el modelo:", error);
                    viewerContainer.innerHTML = '<p class="viewer-placeholder">Error al cargar el modelo.</p>';
                } finally {
                    isModelLoading = false;
                }
            } else {
                displayModelInViewer(viewerContainer);
            }
        });
    });
});