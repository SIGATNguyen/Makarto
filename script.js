// Choix du zoom initial en fonction de la taille d'écran
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

// Lors du redimensionnement ou changement d'orientation, forcer le recalcul
window.addEventListener("resize", () => {
  map.resize();
  scroller.resize();
});

// Ajout des sources et couches pour Hiroshima et Nagasaki
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

  // Configuration des boutons toggle pour la légende fixe
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
  setupToggle('toggle-destroyed-fixed');
  setupToggle('toggle-lessdestroyed-fixed');
  setupToggle('toggle-sauve-fixed');
  setupToggle('toggle-naga-detruit-fixed');
  setupToggle('toggle-naga-feu-fixed');
  setupToggle('toggle-naga-sauve-fixed');
});

// Fonction getFlyToParams qui ajuste les paramètres selon l'appareil et l'aspect ratio
function getFlyToParams(city) {
  const aspect = window.innerWidth / window.innerHeight;
  if (window.innerWidth < 768) {
    // Téléphone
    if (city === 'hiroshima') {
      return { center: [130 - (1 - aspect) * 0.5, 35], zoom: 10, duration: 3000 };
    } else if (city === 'nagasaki') {
      return { center: [130 - (1 - aspect) * 0.5, 33], zoom: 10, duration: 3000 };
    }
  } else if (window.innerWidth < 1024) {
    // Tablette
    if (city === 'hiroshima') {
      return { center: [132 - (1 - aspect) * 0.3, 34.5], zoom: 12, duration: 4000 };
    } else if (city === 'nagasaki') {
      return { center: [130 - (1 - aspect) * 0.3, 32.5], zoom: 12, duration: 4000 };
    }
  } else {
    // PC
    if (city === 'hiroshima') {
      return { center: [132.49859, 34.38477], zoom: 12.5, duration: 5000 };
    } else if (city === 'nagasaki') {
      return { center: [129.89961, 32.75209], zoom: 12.3, duration: 5000 };
    }
  }
  return { center: map.getCenter(), zoom: map.getZoom(), duration: 4000 };
}

// Mise en place de Scrollama pour le scrollytelling
var scroller = scrollama();

function handleStepEnter(response) {
  // Masquer toutes les légendes au démarrage
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

// Throttle de la fonction de scroll (exemple : toutes les 50ms)
function throttle(func, limit) {
  let lastFunc;
