// Choix du zoom initial en fonction de la taille de l'écran
var initialZoom = window.innerWidth < 768 ? 3 : 6;

// Initialisation de MapLibre
var map = new maplibregl.Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
  center: [137, 20],
  zoom: initialZoom,
  pitch: 0,
  bearing: 0
});

// Lors du redimensionnement (changement de taille ou orientation), forcer le rafraîchissement
window.addEventListener("resize", () => {
  map.resize();
  scroller.resize();
});

// Ajout des sources et des calques pour Hiroshima et Nagasaki
map.on('load', () => {
  // --- Hiroshima ---
  map.addSource('hiroshima_detruit', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/SIGATNguyen/Web_carto/refs/heads/main/Hiroshima/hiro_total_detruit.geojson'
  });
  map.addLayer({
    id: 'hiroshima_detruit_layer',
    type: 'fill',
    source: 'hiroshima_detruit',
    paint: { 'fill-color': '#E40428', 'fill-opacity': 0.8 }
  });

  map.addSource('hiroshima_moinsdetruit', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/SIGATNguyen/Web_carto/refs/heads/main/Hiroshima/hiro_part_detruit_v2.geojson'
  });
  map.addLayer({
    id: 'hiroshima_moinsdetruit_layer',
    type: 'fill',
    source: 'hiroshima_moinsdetruit',
    paint: { 'fill-color': '#EECF68', 'fill-opacity': 0.8 }
  });
  
  map.addSource('hiroshima_sauve', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/SIGATNguyen/Web_carto/refs/heads/main/Hiroshima/sauve.geojson'
  });
  map.addLayer({
    id: 'hiroshima_sauve_layer',
    type: 'fill',
    source: 'hiroshima_sauve',
    paint: { 'fill-color': '#000000', 'fill-opacity': 0.8 }
  });

  // --- Nagasaki ---
  map.addSource('nagasaki_detruit', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/SIGATNguyen/Web_carto/refs/heads/main/Nagasaki/naga_detruit_bombe.geojson'
  });
  map.addLayer({
    id: 'nagasaki_detruit_layer',
    type: 'fill',
    source: 'nagasaki_detruit',
    paint: { 'fill-color': '#E40428', 'fill-opacity': 0.8 }
  });
  
  map.addSource('nagasaki_feu', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/SIGATNguyen/Web_carto/refs/heads/main/Nagasaki/naga_feu.geojson'
  });
  map.addLayer({
    id: 'nagasaki_feu_layer',
    type: 'fill',
    source: 'nagasaki_feu',
    paint: { 'fill-color': '#FF8C00', 'fill-opacity': 0.8 }
  });
  
  map.addSource('nagasaki_sauve', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/SIGATNguyen/Web_carto/refs/heads/main/Nagasaki/naga_sauve.geojson'
  });
  map.addLayer({
    id: 'nagasaki_sauve_layer',
    type: 'fill',
    source: 'nagasaki_sauve',
    paint: { 'fill-color': '#000000', 'fill-opacity': 0.8 }
  });

  // Configuration des boutons toggle de la légende fixe
  function setupToggle(btnId) {
    var btn = document.getElementById(btnId);
    btn.addEventListener('click', function () {
      var layer = btn.getAttribute('data-layer');
      if (btn.classList.contains('active')) {
        map.setLayoutProperty(layer, 'visibility', 'none');
        btn.classList.remove('active');
        btn.classList.add('inactive');
        btn.style.opacity = "0.5";
      } else {
        map.setLayoutProperty(layer, 'visibility', 'visible');
        btn.classList.remove('inactive');
        btn.classList.add('active');
        btn.style.opacity = "1";
      }
    });
  }
  // Appliquer aux différents boutons
  setupToggle('toggle-destroyed-fixed');
  setupToggle('toggle-lessdestroyed-fixed');
  setupToggle('toggle-sauve-fixed');
  setupToggle('toggle-naga-detruit-fixed');
  setupToggle('toggle-naga-feu-fixed');
  setupToggle('toggle-naga-sauve-fixed');
});

// Renvoie des paramètres de flyTo adaptés en fonction du support et de la section
function getFlyToParams(city) {
  // Sur téléphone (max-width <768px)
  if (window.innerWidth < 768) {
    if (city === 'hiroshima') {
      return { center: [130, 35], zoom: 10, duration: 5000 };
    } else if (city === 'nagasaki') {
      return { center: [130, 33], zoom: 10, duration: 5000 };
    }
  }
  // Sur tablette (entre 768px et 1024px)
  else if (window.innerWidth < 1024) {
    if (city === 'hiroshima') {
      return { center: [132, 34.5], zoom: 12, duration: 5000 };
    } else if (city === 'nagasaki') {
      return { center: [130, 32.5], zoom: 12, duration: 5000 };
    }
  }
  // Sur PC (largueur >= 1024px)
  else {
    if (city === 'hiroshima') {
      return { center: [132.49859, 34.38477], zoom: 12.5, duration: 5000 };
    } else if (city === 'nagasaki') {
      return { center: [129.89961, 32.75209], zoom: 12.3, duration: 5000 };
    }
  }
  return { center: map.getCenter(), zoom: map.getZoom(), duration: 5000 };
}

// Configuration de Scrollama pour la navigation par scrollytelling
var scroller = scrollama();

function handleStepEnter(response) {
  // Masquer les légendes par défaut
  document.getElementById("legend-hiroshima").style.display = "none";
  document.getElementById("legend-nagasaki").style.display = "none";
  
  var params;
  if (response.element.id === "hiroshima") {
    params = getFlyToParams('hiroshima');
  } else if (response.element.id === "nagasaki") {
    params = getFlyToParams('nagasaki');
  }
  if (params) {
    map.flyTo(params);
  }
}

function handleStepExit(response) {
  // Optionnel : animations ou ajustements à la sortie d'une étape
}

scroller.setup({
  container: "#scroll-container",
  step: ".step",
  offset: 0.5,
  debug: false
})
  .onStepEnter(handleStepEnter)
  .onStepExit(handleStepExit);

window.addEventListener("resize", scroller.resize);

// Barre de progression et interactions diverses
var scrollContainer = document.getElementById("scroll-container");
scrollContainer.addEventListener("scroll", function () {
  var scrolled = scrollContainer.scrollTop;
  var maxHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
  var progress = (scrolled / maxHeight) * 100;
  document.getElementById("progress-bar").style.width = progress + "%";
});

// Curseur personnalisé (les styles masquent ce dernier sur mobile)
document.addEventListener("mousemove", function (e) {
  var cursor = document.querySelector(".custom-cursor");
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
});

// Gestion du défilement avec la roulette de la souris
scrollContainer.addEventListener("wheel", function (e) {
  e.preventDefault();
  scrollContainer.scrollTop += e.deltaY * 0.28;
}, { passive: false });
