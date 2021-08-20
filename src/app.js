/*

	@ File : app.js
	@ Author : HC, service cartographie de l'ANCT
	@ Created : 11/2020

	@ Project : Carte interactive des contacts des délégués territoriaux
	@ Main file : index.html

	@ Description : script de fonctionnement principal

*/

const searchField = document.getElementById('searchField')
const ficheContact = document.getElementById('fiche-contact');
const cards = document.getElementsByClassName("card mb-3");
let backButton = document.querySelector('#back-button');

/* -------------------------------------------------------------------------- */
/*                                INIT MAP                                    */
/* -------------------------------------------------------------------------- */

let zoom_level;

// vérifier si la carte est dans un iframe pour régler le niveau de zoom
function iniFrame() { 
  if ( window.location !== window.parent.location ) 
  { 
    
      // The page is in an iFrames 
      console.log("The page is in an iFrame"); 
      zoom_level = 5
  }  
  else { 
        
      // The page is not in an iFrame 
      console.log("The page is not in an iFrame"); 
      zoom_level = 6
  } 
} 

// Calling iniFrame function 
iniFrame(); 

// initialisation de la carte
let map = L.map('mapid', {
  zoomSnap: 0.25,
  zoomControl: false,
  renderer: L.canvas(),
}).setView([46.5, 2.55], zoom_level,{animation: true});

// attribution
map.attributionControl
   .addAttribution("| <a href = 'https://cartotheque.anct.gouv.fr/' target = '_blank'>ANCT</a>");

// échelle
L.control.scale({ position: 'bottomright' }).addTo(map);

// position du conteneur
map.addControl(new L.Control.ZoomMin({position:'topright'}));

let zoomMin = document.querySelectorAll('.leaflet-control-zoom-min');

zoomMin[0].addEventListener('click', () => {
  resetView();
});




/* -------------------------------------------------------------------------- */
/*                                SIDEBAR                                     */
/* -------------------------------------------------------------------------- */


let sidebar = L.control.sidebar({
  autopan: false,       
  closeButton: true,    
  container: 'sidebar', 
  position: 'left',
}).addTo(map);

window.addEventListener('DOMContentLoaded', () => {
setTimeout(() => {
  sidebar.open('home');
}, 150);
})

// be notified when a panel is opened
sidebar.on('content', function (ev) {
  switch (ev.id) {
      case 'home':
      sidebar.options.autopan = true;
      break;
      default:
        sidebar.options.autopan = true;
  }
});


/* -------------------------------------------------------------------------- */
/*                                  DATA                                      */
/* -------------------------------------------------------------------------- */



// chargement couches géométriques
dep_data = getData("geom_dep.geojson");
cercles_drom = getData("cercles_drom.geojson");


let geojson_style_no_data = {
  fillColor: '#5770be',
  weight: 0.5,
  color: 'white',
};


async function getData(file) {
  let res = await fetch("data/".concat(file));
  let data = await res.json();
  return data;
};

function drawGeoJSON(geojson) {
  return new L.GeoJSON(geojson, {
    interactive:disableFeatureClick,
    style: geojsonStyle,
    onEachFeature: onEachFeature
  }).bindTooltip((e) => {
    return e.feature.properties.lib_dep + ' - ' + e.feature.properties.insee_dep 
  }, {direction: "center", sticky:true })
};


function geojsonStyle(feature) {
  return {
    fillColor: '#5770be',
    weight: 0.5,
    color: 'white',
  };
};


function groupBy(df, keyGetter) {
  const map = new Map();
  df.forEach((item) => {
       const key = keyGetter(item);
       const collection = map.get(key);
       if (!collection) {
           map.set(key, [item]);
       } else {
           collection.push(item);
       }
  });
  return map;
}

let clicked_lib_dep;

function disableFeatureClick(feature) {
  if (feature.properties.insee_dep === "01") {
    return false
  } else { return true}
}


function highlightGeomOnListHover(geojson) {
  Array.from(cards).forEach(card => {
    card.addEventListener("mouseover", () => {
      child = card.firstChild.innerHTML;
      card_insee_dep = child.split(" - ")[1]
      console.log(card_insee_dep);      
      for (let i in geojson) {
        if (geojson[i].feature.properties.insee_dep === card_insee_dep) {
          console.log(geojson[i]);
          console.log("même id");
        }
      };
    })
  });
}

function highlightFeature(e) {
  let layer = e.target;
  
  layer.setStyle({
    weight: 2,
    color: '#ffe800',
    fillOpacity: 0.7
  });
  
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
};

let selected_feature = null;

function resetHighlight(e) {
  let layer = e.target;
  if (selected_feature == null || selected_feature._leaflet_id !== layer._leaflet_id) {
    dep_layer.resetStyle(layer);
  }
};


function zoomToFeature(e) {
  // ouvrir side panel
  sidebar.open('home');
  
  // style element clické
  let layer = e.target;

  if (selected_feature !== null) {
    var previous_feature = selected_feature;
  }
  // crée nouvelle sélection 
  selected_feature = layer;
  // zoom sur l'entité
  // map.flyToBounds(layer.getBounds(), {
  //   padding: [100,100],
  //   duration: 0.5
  // });

  // s'il y a une précédente selection
  if (previous_feature) {
    dep_layer.resetStyle(previous_feature) // désactive la
  }
};


function resetView() {
  map.flyTo([46.5, -3], zoom_level,{animation: true});
};


function onEachFeature(feature, layer) {
  layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature        
  });
};




/* -------------------------------------------------------------------------- */
/*                             TEMPLATES VUE                                  */
/* -------------------------------------------------------------------------- */


// chargement données contacts sur panneau latéral
let infos_contacts = [];

let customCard = {
  data: function() {
    return {
      showInfo:false,
    }
  },
  props: ['contact'],
  template: `<div class="card mb-3">
              <div class="card-header" v-on:click="showInfo = !showInfo">
                <div class = "card-nom-dep">
                  <p>
                  {{ contact.lib_dep }} - {{ contact.insee_dep }}
                  </p>
                </div>
                <div class="card-text">
                  <h5>{{ contact.fiche_lib_admin }}</h5>
                </div>
              </div>
              <div class="card-body" v-show="showInfo">
                <div class = "intro">
                  <h5 class="card-title"> {{ contact.interlocuteur_prenom }} {{ contact.interlocuteur_nom}} </h5>
                  <p class="card-title">{{ contact.interlocuteur_fonction }}</p>
                </div>
                <div class = "corps">
                  <span>
                    <i class = "fas fa-envelope"></i>
                    <ul>
                      <li>
                        {{ contact.interlocuteur_adresse }} 
                      </li>
                      <li v-if = "contact.interlocuteur_comp_adresse.length">
                        {{ contact.interlocuteur_comp_adresse }} 
                      </li>
                      <li>
                        {{ contact.interlocuteur_cp }} {{ contact.interlocuteur_ville }}
                      </li>
                    </ul>
                  </span><br>
                  <span>
                    <i class = "fas fa-phone" v-if = "contact.fiche_telephone.length"></i>
                    <ul>
                      <li>{{ contact.fiche_telephone }}</li>
                    </ul>
                  </span><br>
                  <span>
                    <i class = "fas fa-at card-icon" v-if = "contact.fiche_mel.length"></i>
                    <ul>
                      <li><a v-bind:href = "'mailto:' + contact.fiche_mel" target = "_blank">{{contact.fiche_mel}}</a></li>
                    </ul>
                  </span><br>
                  <span>
                    <i class = "fas fa-external-link card-icon" v-if = "contact.site_web.length"></i>
                    <ul>
                      <li><a v-bind:href = "contact.site_web" target = "_blank">{{contact.site_web}}</a></li>
                    </ul>
                  </span>
                </div>
              </div>
            </div>`
};

/* -------------------------------------------------------------------------- */
/*                                    VUE                                     */
/* -------------------------------------------------------------------------- */

let data_url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSHXY9QA7QkHrDHQUAx32hIaBAVcIwzWLH4udws0wPRsB7ckfP7m-9xgA5aLRpAQwMeW4NJeSNWrTGH/pub?output=csv"

function init() {
  Papa.parse(data_url, {
    download: true,
    header: true,
    complete: (results) => fetchSpreadsheetData(results.data)
  });
  // Tabletop.init({
  //   key: data_url,
  //   callback: fetchSpreadsheetData,
  //   simpleSheet: true
  // })
};

function fetchSpreadsheetData(res) {
  res.forEach(e => {
    infos_contacts.push(e)
  })
  console.log("Data : loaded");
}

window.addEventListener('DOMContentLoaded', init);


// Liste des contacts ----- VueJS
let vm = new Vue({
  el: '#app',
  data: {
    contacts: infos_contacts,
    noData:false,
    search: '',
  },
  components: { 
    'custom-card': customCard,
  },
  computed: {
    filteredList: function() {
      return this.contacts.filter(contact => {
        return contact.lib_dep.concat(" ", contact.insee_dep).toLowerCase().includes(this.search.toLowerCase())
      })
    },
  },
  methods: {
    toggleDiv: function() {
      this.showInfo = !this.showInfo; // showInfo passe en true pour afficher le reste des infos
      if (this.search = '') {
        this.showInfo = false;
      }
    },
    resetMap: function() {
      this.search = '';
      map.resetView();
    }
  }
});


// affichage departements
let dep_layer;

dep_data.then(geojson => {
  dep_layer = drawGeoJSON(geojson).addTo(map);
  highlightGeomOnListHover(geojson);
  // recherche 
  dep_layer.on("click", layer => {
    // recupere le code et libellé dep du polygone sélectionné
    let insee_dep = layer.sourceTarget.feature.properties.insee_dep; 
    let lib_dep = layer.sourceTarget.feature.properties.lib_dep; 
    let clicked_dep = lib_dep.concat(' ', insee_dep);
    
    vm.search = clicked_dep; // rempli la propriété 'search' de vue avec le code dep
    
    document.querySelector("#reset-app").addEventListener('click', () => {
      resetView();
      dep_layer.resetStyle()
    });
    
  })
});

cercles_drom.then(geojson => {
  new L.GeoJSON(geojson, {
    style: {
      fillColor: 'white',
      fillOpacity:0,
      color: "white",
      weight: 1.5
    },
    interactive:false,
  }).addTo(map)
});


/* -------------------------------------------------------------------------- */
/*                                    END                                     */
/* -------------------------------------------------------------------------- */


