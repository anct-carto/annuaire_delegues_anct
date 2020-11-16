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
})



// chargement couches géométriques
departements = getData("geom_dep.geojson");
cercles_drom = getData("cercles_drom.geojson");


cercles_drom.then(geojson => {
  new L.GeoJSON(geojson, {
    fillColor: 'white',
    fillOpacity:0,
    color: "white",
    weight: 1.5
  }).addTo(map)
})

async function getData(file) {
  let res = await fetch("data/".concat(file));
  let data = await res.json();
  
  return data;
};

let geojson;

let geojson_style = {
  fillColor: '#5770be',
  weight: 0.5,
  color: 'white',
};

let geojson_style_no_data = {
  fillColor: '#5770be',
  weight: 0.5,
  color: 'white',
};

function disableFeatureClick(feature) {
  if (feature.properties.insee_dep === "01") {
    return false
  } else { return true}
}

function drawGeoJSON(geojson) {
  departements = new L.GeoJSON(geojson, {
    interactive:disableFeatureClick,
    style: geojson_style,
    onEachFeature: onEachFeature
  }).bindTooltip((e) => {
    return e.feature.properties.lib_dep
  }, {direction: "center", sticky:true })
  .on("click", (layer) => {
    searchField.value = '';
    clicked_lib_dep = layer.sourceTarget.feature.properties.lib_dep;
    searchField.value = clicked_lib_dep;    
    
    
    
    test = Array.from(cards).filter(card => {
      return card.firstChild.innerHTML.split(" - ")[0] === clicked_lib_dep
    });
    
    Array.from(cards).forEach(card => {
      child = card.firstChild.innerHTML;
      
      // console.log(child);
      if (child.split(" - ")[0] != clicked_lib_dep) {
        card.style.display = 'none';
      } else {
        card.style.display = 'block';
      };
    });    
  }).addTo(map);
}

function resetHighlight(e) {
  departements.resetStyle(e.target);
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


function zoomToFeature(e) {
  sidebar.open('home');
  
  let layer = e.target;
  
  // map.flyToBounds(layer.getBounds(), {
  //   padding: [100,100],
  //   duration: 0.5
  // });
  
  layer.setStyle({
    weight: 3,
    color: '#ffe800',
    fillOpacity: 1    
  });
};


function resetView() {
  map.setView([46.5, -3], zoom_level,{animation: true});
  Array.from(cards).forEach(card => card.style.display = 'block')
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
  props: ['contact', 'display'], 
  template: `<div class="card mb-3">
              <div class="card-header">{{ contact.lib_dep }} - {{ contact.insee_dep }}</div>
              <div class="card-body">
                <h5 class="card-title"> {{ contact.interlocuteur_prenom }} {{ contact.interlocuteur_nom}}</h5>
                <p class="card-text">{{ contact.fiche_lib_admin }}</p>
              </div>
            </div>`
};

let ficheInfo = {
  props: ['contact'],
  template: `<div class="card">
              <div class="card-header">{{contact.lib_dep}} - {{contact.insee_dep}}</div>
              <div class="card-body">
                <div class = "intro">
                  <h5 class="card-title"> {{ contact.interlocuteur_prenom }} {{ contact.interlocuteur_nom}} </h5>
                  <p class="card-title">{{ contact.interlocuteur_fonction }}</p>
                </div>
                <div class = "corps">
                  <p class="card-text">
                    <i class = "fas fa-map-marker"></i>
                    {{ contact.fiche_lib_admin }}
                  </p>
                  <i class = "fas fa-envelope"></i>
                  <ul>
                    <li>
                      {{ contact.interlocuteur_adresse }} 
                    </li>
                    <li>
                      {{ contact.interlocuteur_cp }} {{ contact.interlocuteur_ville }}
                    </li>
                  </ul>
                  <p class="card-text">
                    <i class = "fas fa-phone" v-if = "contact.fiche_telephone.length"></i>  {{ contact.fiche_telephone }} </p>
                  <p class="card-text">
                    <i class = "fas fa-at" v-if = "contact.fiche_mel.length"></i> <a href = "mailto:contact.fiche_mel" target = "_blank">{{contact.fiche_mel}}</a>
                  </p>
                </div>
              </div>
            </div>`
};

/* -------------------------------------------------------------------------- */
/*                                    VUE                                     */
/* -------------------------------------------------------------------------- */

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

// lecture données
d3.csv("data/data_contacts.csv").then(res => {

  res.forEach(e => {
    infos_contacts.push(e)
  });

  console.log(infos_contacts);

  // Liste des contacts ----- VueJS
  let vm = new Vue({
    el: '#app',
    data: {
      contacts: infos_contacts,
      showInfo: false,
      selectedCardId: null,
      search: '',
    },
    components: { 
      'custom-card': customCard,
      'fiche-info': ficheInfo,
    },
    computed: {
      filteredList: function() {
        return this.contacts.filter(contact => {
          return contact.lib_dep.concat(" ", contact.insee_dep).toLowerCase().includes(this.search.toLowerCase())
        })
      },
      selectedCard: function() {
        return this.contacts.filter(contact => {
          // this.selectedCardId est modifiée à chaque clic dans la fonction ci-dessous
          return contact.id === this.selectedCardId
        })
      }
    },
    methods: {
      clickedCard: function(key) {
        // showInfo passe en true pour afficher la div "fiche-info" et masquer la liste des cards
        this.showInfo = !this.showInfo;
        this.search = ''; // réinitialise la recherche
        // récupérer l'identifiant à réutiliser pour afficher la bonne fiche info
        this.selectedCardId = event.currentTarget.id;
        return this.selectedCardId
      },
      buttonAction: function() {
        this.showInfo = false;
        resetView();
      },
      getInputVal: function(evt) {
        this.$emit("change", evt);
        console.log(evt);
      }
    }
  })

  // affichage departements
  departements.then(res => {
    drawGeoJSON(res);
    // vm.search = clicked_lib_dep;
  });
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
        case 'autopan':
        sidebar.options.autopan = true;
        break;
        default:
          sidebar.options.autopan = true;
    }
});


/* -------------------------------------------------------------------------- */
/*                                VUE PARAMS                                  */
/* -------------------------------------------------------------------------- */


