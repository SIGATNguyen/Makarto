// Initialisation de MapLibre
var map = new maplibregl.Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
  center: [137, 20],
  zoom: 6,
  pitch: 0,
  bearing: 0
});

// Ajout des sources et calques pour Hiroshima et Nagasaki
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
    paint: {
      'fill-color': '#E40428',
      'fill-opacity': 0.8
    }
  });

  map.addSource('hiroshima_moinsdetruit', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/SIGATNguyen/Web_carto/refs/heads/main/Hiroshima/hiro_part_detruit_v2.geojson'
  });
  map.addLayer({
    id: 'hiroshima_moinsdetruit_layer',
    type: 'fill',
    source: 'hiroshima_moinsdetruit',
    paint: {
      'fill-color': '#EECF68',
      'fill-opacity': 0.8
    }
  });
  
  map.addSource('hiroshima_sauve', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/SIGATNguyen/Web_carto/refs/heads/main/Hiroshima/sauve.geojson'
  });
  map.addLayer({
    id: 'hiroshima_sauve_layer',
    type: 'fill',
    source: 'hiroshima_sauve',
    paint: {
      'fill-color': '#000000',
      'fill-opacity': 0.8
    }
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
    paint: {
      'fill-color': '#E40428',
      'fill-opacity': 0.8
    }
  });
  
  map.addSource('nagasaki_feu', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/SIGATNguyen/Web_carto/refs/heads/main/Nagasaki/naga_feu.geojson'
  });
  map.addLayer({
    id: 'nagasaki_feu_layer',
    type: 'fill',
    source: 'nagasaki_feu',
    paint: {
      'fill-color': '#FF8C00',
      'fill-opacity': 0.8
    }
  });
  
  map.addSource('nagasaki_sauve', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/SIGATNguyen/Web_carto/refs/heads/main/Nagasaki/naga_sauve.geojson'
  });
  map.addLayer({
    id: 'nagasaki_sauve_layer',
    type: 'fill',
    source: 'nagasaki_sauve',
    paint: {
      'fill-color': '#000000',
      'fill-opacity': 0.8
    }
  });

  // Gestion des boutons toggle (légende fixe)
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
  // Toggle légende Hiroshima
  setupToggle('toggle-destroyed-fixed');
  setupToggle('toggle-lessdestroyed-fixed');
  setupToggle('toggle-sauve-fixed');
  // Toggle légende Nagasaki
  setupToggle('toggle-naga-detruit-fixed');
  setupToggle('toggle-naga-feu-fixed');
  setupToggle('toggle-naga-sauve-fixed');
});

// Configuration de Scrollama pour la navigation (flyTo)
var scroller = scrollama();

function handleStepEnter(response) {
  var id = response.element.id;
  // Masquer toutes les légendes
  document.getElementById("legend-hiroshima").style.display = "none";
  document.getElementById("legend-nagasaki").style.display = "none";
  
  if (id === "hiroshima") {
    map.flyTo({ center: [132.49859, 34.38477], zoom: 12.5, duration: 5000 });
  } else if (id === "nagasaki") {
    map.flyTo({ center: [129.89961, 32.75209], zoom: 12.3, duration: 5000 });
  }
}

function handleStepExit(response) {}

// Configuration de Scrollama
scroller.setup({
  container: "#scroll-container",
  step: ".step",
  offset: 0.5,
  debug: false
})
  .onStepEnter(handleStepEnter)
  .onStepExit(handleStepExit);

// Mise à jour sur redimensionnement
window.addEventListener("resize", scroller.resize);

// --- Optimisation des événements de scroll et mousemove --- //

// Fonction _throttle_ basée sur requestAnimationFrame
function throttleRAF(callback) {
  let ticking = false;
  return function(...args) {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        callback.apply(this, args);
        ticking = false;
      });
      ticking = true;
    }
  };
}

// Gestion de l'affichage des légendes (throttled)
function checkLegends() {
  var offset = 50;
  var introRect = document.getElementById("intro").getBoundingClientRect();
  var hiroRect = document.getElementById("hiroshima").getBoundingClientRect();
  var nagaRect = document.getElementById("nagasaki").getBoundingClientRect();

  // Légende Hiroshima
  if (introRect.bottom <= -offset && hiroRect.bottom > offset) {
    document.getElementById("legend-hiroshima").style.display = "block";
  } else {
    document.getElementById("legend-hiroshima").style.display = "none";
  }

  // Légende Nagasaki
  if (hiroRect.bottom <= -offset && nagaRect.bottom > offset) {
    document.getElementById("legend-nagasaki").style.display = "block";
  } else {
    document.getElementById("legend-nagasaki").style.display = "none";
  }
}

var scrollContainer = document.getElementById("scroll-container");
// Utilisation de throttle pour limiter la fréquence d'appel
scrollContainer.addEventListener("scroll", throttleRAF(() => {
  var scrolled = scrollContainer.scrollTop;
  var maxHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
  var progress = (scrolled / maxHeight) * 100;
  document.getElementById("progress-bar").style.width = progress + "%";
  checkLegends();
}));

// Curseur personnalisé optimisé avec requestAnimationFrame
var cursor = document.querySelector(".custom-cursor");
document.addEventListener("mousemove", throttleRAF(function (e) {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
}));

// Gestion du scroll avec la roulette de la souris
scrollContainer.addEventListener("wheel", function (e) {
  e.preventDefault();
  scrollContainer.scrollTop += e.deltaY * 0.28;
}, { passive: false });