// Archivo: color-picker.js

// Selecciona el input de color
const colorPicker = document.getElementById('colorPicker');

// Event listener para detectar cambios en el color seleccionado
colorPicker.addEventListener('input', function() {
    var selectedColor = colorPicker.value; // Captura el color seleccionado
    localStorage.setItem('selectedColor', selectedColor); // Guarda el color en localStorage
    // console.log("Selected color saved:", selectedColor); // Mostrar en consola
});