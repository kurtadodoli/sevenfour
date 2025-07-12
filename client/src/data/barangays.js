// Common Philippine Barangays by City/Municipality
export const philippineBarangays = {
  // Metro Manila (NCR)
  "Quezon City": [
    "Bagong Pag-asa", "Balingasa", "Batasan Hills", "Commonwealth", "Diliman",
    "Don Manuel", "Fairview", "Kamuning", "Libis", "Loyola Heights",
    "Maharlika", "Malaya", "Mariana", "New Manila", "North Fairview",
    "Novaliches Proper", "Old Balara", "Payatas", "Project 6", "Sacred Heart",
    "San Francisco", "San Isidro Labrador", "Santo Cristo", "Santo Domingo",
    "Talayan", "Teachers Village", "Ugong Norte", "Villa Maria Clara", "White Plains"
  ],
  "Manila": [
    "Binondo", "Ermita", "Intramuros", "Malate", "Paco", "Pandacan",
    "Port Area", "Quiapo", "Sampaloc", "San Andres", "San Miguel",
    "San Nicolas", "Santa Ana", "Santa Cruz", "Santa Mesa", "Tondo"
  ],
  "Makati": [
    "Bangkal", "Bel-Air", "Cembo", "Comembo", "Dasmariñas", "Forbes Park",
    "Guadalupe Nuevo", "Guadalupe Viejo", "Kasilawan", "La Paz", "Magallanes",
    "Olympia", "Palanan", "Pembo", "Pinagkaisahan", "Pio del Pilar",
    "Poblacion", "Post Proper Northside", "Post Proper Southside", "Rizal",
    "San Antonio", "San Isidro", "San Lorenzo", "Santa Cruz", "Singkamas",
    "South Cembo", "Tejeros", "Urdaneta", "Valenzuela", "West Rembo"
  ],
  "Pasig": [
    "Bagong Ilog", "Bagong Katipunan", "Bambang", "Buting", "Caniogan",
    "Dela Paz", "Kalawaan", "Kapasigan", "Malinao", "Manggahan",
    "Maybunga", "Oranbo", "Palatiw", "Pinagbuhatan", "Pineda",
    "Rosario", "Sagad", "San Antonio", "San Joaquin", "San Jose",
    "San Miguel", "San Nicolas", "Santa Lucia", "Santa Rosa", "Santo Tomas",
    "Santolan", "Sumilang", "Ugong", "Wawa"
  ],
  "Taguig": [
    "Bagumbayan", "Bambang", "Calzada", "Central Bicutan", "Central Signal Village",
    "Fort Bonifacio", "Hagonoy", "Ibayo-Tipas", "Ligid-Tipas", "Lower Bicutan",
    "Maharlika Village", "Napindan", "New Lower Bicutan", "North Daang Hari",
    "North Signal Village", "Palingon", "Pinagsama", "San Miguel", "Santa Ana",
    "South Daang Hari", "South Signal Village", "Tanyag", "Tuktukan",
    "Upper Bicutan", "Ususan", "Wawa", "Western Bicutan"
  ],
  
  // Cebu Province
  "Cebu City": [
    "Apas", "Banilad", "Basak Pardo", "Basak San Nicolas", "Busay",
    "Camputhaw", "Capitol Site", "Carcar", "Carmen", "Cogon Pardo",
    "Cogon Ramos", "Colon", "Duljo Fatima", "Guadalupe", "Guba",
    "Hipodromo", "IT Park", "Kalubihan", "Kamagayan", "Kamputhaw",
    "Kasambagan", "Kinasang-an", "Labangon", "Lahug", "Lorega San Miguel",
    "Luz", "Mabini", "Mabolo", "Malubog", "Mambaling", "Pahina Central",
    "Pardo", "Pasil", "Punta Princesa", "Quiot", "Ramos", "San Antonio",
    "San Jose", "San Nicolas Proper", "San Roque", "Santa Cruz", "Santo Niño",
    "Sawang Calero", "Sirao", "Suba", "T. Padilla", "Tabunan", "Tagba-o",
    "Talamban", "Taptap", "Tejero", "Tinago", "Tisa", "Toledo", "Zapatera"
  ],
  
  // Davao
  "Davao City": [
    "Agdao", "Alambre", "Angalan", "Bago Aplaya", "Bago Gallera",
    "Baguio", "Bangkas Heights", "Biao Escuela", "Biao Guianga",
    "Bucana", "Buhangin", "Bunawan", "Cabantian", "Calinan",
    "Carmen", "Catalunan Grande", "Catalunan Pequeño", "Catitipan",
    "Claveria", "Communal", "Crossing Bayabas", "Dacudao", "Daliao",
    "Dumoy", "Eden", "Ganzon", "Guadalupe", "Inayawan", "Indangan",
    "Lamanan", "Langub", "Leon Garcia", "Libugan", "Lizada",
    "Ma-a", "Maa", "Magsaysay", "Mahayag", "Malabog", "Malagos",
    "Malamba", "Manambulan", "Mandug", "Matina Aplaya", "Matina Crossing",
    "Matina Pangi", "Mintal", "Mudiang", "Mulig", "New Carmen",
    "New Valencia", "Obrero", "Pampanga", "Panacan", "Paquibato",
    "Paradise Embac", "Poblacion", "Riverside", "Salizon", "Santo Tomas",
    "Sibulan", "Sirawan", "Suawan", "Subasta", "Tacunan", "Tagakpan",
    "Tagluno", "Tagurano", "Talandang", "Talomo", "Tamayong", "Tibuloy",
    "Tibungco", "Tigatto", "Toril", "Tugbok", "Tungkalan", "Ula", "Waan"
  ],
  
  // Common barangays for other areas
  "General": [
    "Poblacion", "San Antonio", "San Jose", "San Miguel", "Santa Cruz",
    "Santo Niño", "Bagong Silang", "Maligaya", "San Isidro", "Santa Maria",
    "San Juan", "San Pedro", "San Pablo", "San Nicolas", "Santa Ana",
    "Santo Domingo", "San Francisco", "San Rafael", "Santa Rosa", "San Carlos",
    "Bagong Bayan", "Malaya", "Masaya", "Magsaysay", "Rizal", "Bonifacio",
    "Del Pilar", "Mabini", "Aguinaldo", "Luna", "Burgos", "Gomez"
  ]
};

// Get all unique barangays
export const allBarangays = [
  ...new Set([
    ...Object.values(philippineBarangays).flat(),
  ])
].sort();
