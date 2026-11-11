import { Station, Corridor, Manufacturer, TrainModel, LiveryDesign, WeatherCondition, EconomicShift } from '../types';

export const INITIAL_STATIONS: Station[] = [
  // --- SOUTH ASIA ---
  {
    id: 'ndls',
    name: 'New Delhi',
    code: 'NDLS',
    country: 'India',
    region: 'South Asia',
    regionId: 'south_asia',
    lat: 28.6427,
    lng: 77.2236,
    gauge: '1,676 mm · broad gauge',
    traction: '25 kV AC electric on major trunk corridors',
    description: 'A major national rail gateway and the company\'s starter station.',
    isOwned: true,
    acquisitionCost: 0,
    dispatchSlots: [true, true, false, false, false, false, false, false, false, false],
    populationMillions: 33.0,
    economicTier: 1,
  },
  {
    id: 'bct',
    name: 'Mumbai Central',
    code: 'BCT',
    country: 'India',
    region: 'South Asia',
    regionId: 'south_asia',
    lat: 18.9696,
    lng: 72.8193,
    gauge: '1,676 mm · broad gauge',
    traction: '25 kV AC electric on Western Railway',
    description: 'Financial capital terminus connecting industrial western corridors.',
    isOwned: false,
    acquisitionCost: 3500000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 21.3,
    economicTier: 1,
  },
  {
    id: 'adi',
    name: 'Ahmedabad Junction',
    code: 'ADI',
    country: 'India',
    region: 'South Asia',
    regionId: 'south_asia',
    lat: 23.0225,
    lng: 72.5714,
    gauge: '1,676 mm · broad gauge & standard gauge HSR',
    traction: '25 kV AC electric',
    description: 'Key commercial hub and terminus of the Mumbai-Ahmedabad High-Speed Rail corridor.',
    isOwned: false,
    acquisitionCost: 1800000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 8.6,
    economicTier: 2,
  },
  {
    id: 'hwh',
    name: 'Howrah · Kolkata',
    code: 'HWH',
    country: 'India',
    region: 'South Asia',
    regionId: 'south_asia',
    lat: 22.5839,
    lng: 88.3426,
    gauge: '1,676 mm · broad gauge',
    traction: '25 kV AC electric',
    description: 'Busiest railway complex in India serving eastern intercity lines.',
    isOwned: false,
    acquisitionCost: 2800000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 15.3,
    economicTier: 1,
  },
  {
    id: 'mas',
    name: 'Chennai Central',
    code: 'MAS',
    country: 'India',
    region: 'South Asia',
    regionId: 'south_asia',
    lat: 13.0827,
    lng: 80.2707,
    gauge: '1,676 mm · broad gauge',
    traction: '25 kV AC electric',
    description: 'Southern gateway anchor for passenger express networks.',
    isOwned: false,
    acquisitionCost: 2200000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 11.5,
    economicTier: 1,
  },
  {
    id: 'sbc',
    name: 'Bengaluru City',
    code: 'SBC',
    country: 'India',
    region: 'South Asia',
    regionId: 'south_asia',
    lat: 12.9779,
    lng: 77.5670,
    gauge: '1,676 mm · broad gauge',
    traction: '25 kV AC electric',
    description: 'Silicon Valley of India with massive business travel demand.',
    isOwned: false,
    acquisitionCost: 2600000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 13.2,
    economicTier: 1,
  },
  {
    id: 'bsb',
    name: 'Varanasi Junction',
    code: 'BSB',
    country: 'India',
    region: 'South Asia',
    regionId: 'south_asia',
    lat: 25.3283,
    lng: 82.9866,
    gauge: '1,676 mm · broad gauge',
    traction: '25 kV AC electric',
    description: 'Historic cultural pilgrimage center with continuous passenger influx.',
    isOwned: false,
    acquisitionCost: 1200000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 3.8,
    economicTier: 3,
  },
  {
    id: 'lhe',
    name: 'Lahore Junction',
    code: 'LHE',
    country: 'Pakistan',
    region: 'South Asia',
    regionId: 'south_asia',
    lat: 31.5796,
    lng: 74.3400,
    gauge: '1,676 mm · broad gauge',
    traction: 'Diesel & AC mainline electrification',
    description: 'Major northwestern junction on the historic Grand Trunk corridor.',
    isOwned: false,
    acquisitionCost: 1900000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 13.9,
    economicTier: 2,
  },
  {
    id: 'dak',
    name: 'Dhaka Kamalapur',
    code: 'DAK',
    country: 'Bangladesh',
    region: 'South Asia',
    regionId: 'south_asia',
    lat: 23.7314,
    lng: 90.4267,
    gauge: 'Dual gauge (1,676 mm & 1,000 mm)',
    traction: 'Diesel-electric & Modernized EMU lines',
    description: 'High-density urban commuter gateway for the Bengal delta.',
    isOwned: false,
    acquisitionCost: 1600000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 22.4,
    economicTier: 2,
  },

  // --- CHINA ---
  {
    id: 'bjs',
    name: 'Beijing South',
    code: 'VNP',
    country: 'China',
    region: 'China',
    regionId: 'china',
    lat: 39.8650,
    lng: 116.3789,
    gauge: '1,435 mm · standard gauge',
    traction: '25 kV AC 50 Hz electric high-speed',
    description: 'Premier 24-platform high-speed terminus anchoring northern China.',
    isOwned: false,
    acquisitionCost: 4500000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 21.8,
    economicTier: 1,
  },
  {
    id: 'sha',
    name: 'Shanghai Hongqiao',
    code: 'AOH',
    country: 'China',
    region: 'China',
    regionId: 'china',
    lat: 31.1947,
    lng: 121.3204,
    gauge: '1,435 mm · standard gauge',
    traction: '25 kV AC 50 Hz electric high-speed',
    description: 'World\'s largest combined transport hub with 30 platforms.',
    isOwned: false,
    acquisitionCost: 4800000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 28.5,
    economicTier: 1,
  },
  {
    id: 'whn',
    name: 'Wuhan Station',
    code: 'WHN',
    country: 'China',
    region: 'China',
    regionId: 'china',
    lat: 30.6083,
    lng: 114.4258,
    gauge: '1,435 mm · standard gauge',
    traction: '25 kV AC 50 Hz electric high-speed',
    description: 'The central crossroads of China\'s national 8-vertical 8-horizontal HSR grid.',
    isOwned: false,
    acquisitionCost: 2600000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 12.3,
    economicTier: 2,
  },
  {
    id: 'gzs',
    name: 'Guangzhou South',
    code: 'IZQ',
    country: 'China',
    region: 'China',
    regionId: 'china',
    lat: 22.9889,
    lng: 113.2689,
    gauge: '1,435 mm · standard gauge',
    traction: '25 kV AC 50 Hz electric high-speed',
    description: 'Mega-hub of the Pearl River Delta industrial corridor.',
    isOwned: false,
    acquisitionCost: 3800000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 18.7,
    economicTier: 1,
  },
  {
    id: 'xian',
    name: 'Xi\'an North',
    code: 'EAY',
    country: 'China',
    region: 'China',
    regionId: 'china',
    lat: 34.3764,
    lng: 108.9389,
    gauge: '1,435 mm · standard gauge',
    traction: '25 kV AC 50 Hz electric high-speed',
    description: 'Ancient Silk Road capital and western high-speed pivot.',
    isOwned: false,
    acquisitionCost: 2100000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 12.9,
    economicTier: 2,
  },
  {
    id: 'cdu',
    name: 'Chengdu East',
    code: 'ICW',
    country: 'China',
    region: 'China',
    regionId: 'china',
    lat: 30.6289,
    lng: 104.1417,
    gauge: '1,435 mm · standard gauge',
    traction: '25 kV AC 50 Hz electric',
    description: 'Major southwestern metropolitan gateway and technology hub.',
    isOwned: false,
    acquisitionCost: 2500000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 20.9,
    economicTier: 1,
  },
  {
    id: 'hkg',
    name: 'Hong Kong West Kowloon',
    code: 'WEK',
    country: 'Hong Kong',
    region: 'China',
    regionId: 'china',
    lat: 22.3042,
    lng: 114.1656,
    gauge: '1,435 mm · standard gauge',
    traction: '25 kV AC 50 Hz electric',
    description: 'Underground architectural marvel linking Hong Kong to Mainland HSR.',
    isOwned: false,
    acquisitionCost: 4200000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 7.5,
    economicTier: 1,
  },

  // --- EAST ASIA ---
  {
    id: 'tyo',
    name: 'Tokyo Central',
    code: 'TYO',
    country: 'Japan',
    region: 'East Asia',
    regionId: 'east_asia',
    lat: 35.6812,
    lng: 139.7671,
    gauge: '1,435 mm Shinkansen & 1,067 mm Cape gauge',
    traction: '25 kV AC 50/60 Hz & 1.5 kV DC commuter lines',
    description: 'Historic red-brick monument and core terminus of all Shinkansen lines.',
    isOwned: false,
    acquisitionCost: 5200000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 37.4,
    economicTier: 1,
  },
  {
    id: 'osa',
    name: 'Shin-Osaka',
    code: 'NKO',
    country: 'Japan',
    region: 'East Asia',
    regionId: 'east_asia',
    lat: 34.7335,
    lng: 135.5003,
    gauge: '1,435 mm Shinkansen',
    traction: '25 kV AC 60 Hz electric',
    description: 'Tokaido and Sanyo Shinkansen transfer nexus for the Kansai region.',
    isOwned: false,
    acquisitionCost: 4000000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 19.2,
    economicTier: 1,
  },
  {
    id: 'ngo',
    name: 'Nagoya',
    code: 'NGO',
    country: 'Japan',
    region: 'East Asia',
    regionId: 'east_asia',
    lat: 35.1709,
    lng: 136.8815,
    gauge: '1,435 mm Shinkansen & 1,067 mm Cape gauge',
    traction: '25 kV AC 60 Hz electric',
    description: 'Central Japan industrial automotive heartland and JR Central headquarters.',
    isOwned: false,
    acquisitionCost: 3100000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 9.5,
    economicTier: 2,
  },
  {
    id: 'fuk',
    name: 'Hakata · Fukuoka',
    code: 'FUK',
    country: 'Japan',
    region: 'East Asia',
    regionId: 'east_asia',
    lat: 33.5902,
    lng: 130.4206,
    gauge: '1,435 mm Shinkansen',
    traction: '25 kV AC 60 Hz electric',
    description: 'Kyushu Shinkansen and Sanyo Shinkansen terminus connecting to East Asia.',
    isOwned: false,
    acquisitionCost: 2600000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 5.5,
    economicTier: 2,
  },
  {
    id: 'sel',
    name: 'Seoul Station',
    code: 'SEL',
    country: 'South Korea',
    region: 'East Asia',
    regionId: 'east_asia',
    lat: 37.5547,
    lng: 126.9708,
    gauge: '1,435 mm · standard gauge',
    traction: '25 kV AC 60 Hz KTX electric',
    description: 'The pulse of South Korea\'s KTX high-speed rail and commuter network.',
    isOwned: false,
    acquisitionCost: 4200000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 25.6,
    economicTier: 1,
  },
  {
    id: 'pus',
    name: 'Busan Station',
    code: 'PUS',
    country: 'South Korea',
    region: 'East Asia',
    regionId: 'east_asia',
    lat: 35.1152,
    lng: 129.0422,
    gauge: '1,435 mm · standard gauge',
    traction: '25 kV AC 60 Hz KTX electric',
    description: 'Port city terminus of the Gyeongbu KTX Line with brisk business travel.',
    isOwned: false,
    acquisitionCost: 2800000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 3.4,
    economicTier: 2,
  },
  {
    id: 'tpe',
    name: 'Taipei Main Station',
    code: 'TPE',
    country: 'Taiwan',
    region: 'East Asia',
    regionId: 'east_asia',
    lat: 25.0478,
    lng: 121.5170,
    gauge: '1,435 mm THSR & 1,067 mm TRA gauge',
    traction: '25 kV AC 60 Hz electric',
    description: 'Multi-level subterranean hub anchoring Taiwan\'s High Speed Rail backbone.',
    isOwned: false,
    acquisitionCost: 3200000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 7.0,
    economicTier: 1,
  },
  {
    id: 'khh',
    name: 'Zuoying · Kaohsiung',
    code: 'ZUY',
    country: 'Taiwan',
    region: 'East Asia',
    regionId: 'east_asia',
    lat: 22.6872,
    lng: 120.3082,
    gauge: '1,435 mm THSR standard gauge',
    traction: '25 kV AC 60 Hz electric',
    description: 'Southern terminus of Taiwan High Speed Rail serving the industrial port metropolis.',
    isOwned: false,
    acquisitionCost: 2400000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 2.7,
    economicTier: 2,
  },

  // --- SOUTHEAST ASIA ---
  {
    id: 'bkk',
    name: 'Bangkok Krung Thep Aphiwat',
    code: 'BUE',
    country: 'Thailand',
    region: 'Southeast Asia',
    regionId: 'southeast_asia',
    lat: 13.8033,
    lng: 100.5403,
    gauge: '1,000 mm meter gauge & 1,435 mm HSR standard',
    traction: '25 kV AC electric & Diesel mainline',
    description: 'Southeast Asia\'s largest railway station and future pan-Asian HSR hub.',
    isOwned: false,
    acquisitionCost: 2700000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 14.2,
    economicTier: 1,
  },
  {
    id: 'kls',
    name: 'Kuala Lumpur Sentral',
    code: 'XKL',
    country: 'Malaysia',
    region: 'Southeast Asia',
    regionId: 'southeast_asia',
    lat: 3.1342,
    lng: 101.6865,
    gauge: '1,000 mm meter gauge (KTM ETS)',
    traction: '25 kV AC 50 Hz electric',
    description: 'State-of-the-art multimodal transit center on the Malay Peninsula.',
    isOwned: false,
    acquisitionCost: 2900000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 8.4,
    economicTier: 1,
  },
  {
    id: 'sgp',
    name: 'Singapore Woodlands',
    code: 'SGP',
    country: 'Singapore',
    region: 'Southeast Asia',
    regionId: 'southeast_asia',
    lat: 1.4360,
    lng: 103.7865,
    gauge: '1,435 mm RTS / Standard cross-border',
    traction: '750 V DC third-rail & 25 kV AC electric',
    description: 'Ultra-efficient southern terminus linking the peninsula to the global financial port.',
    isOwned: false,
    acquisitionCost: 4900000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 5.9,
    economicTier: 1,
  },
  {
    id: 'jkt',
    name: 'Jakarta Halim · Whoosh HSR',
    code: 'JKT',
    country: 'Indonesia',
    region: 'Southeast Asia',
    regionId: 'southeast_asia',
    lat: -6.2575,
    lng: 106.8928,
    gauge: '1,435 mm · standard gauge HSR',
    traction: '25 kV AC 50 Hz electric',
    description: 'Southeast Asia\'s first 350 km/h bullet train terminus (Whoosh KCIC).',
    isOwned: false,
    acquisitionCost: 3400000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 31.0,
    economicTier: 1,
  },
  {
    id: 'bdg',
    name: 'Bandung Tegalluar',
    code: 'BDG',
    country: 'Indonesia',
    region: 'Southeast Asia',
    regionId: 'southeast_asia',
    lat: -6.9744,
    lng: 107.7289,
    gauge: '1,435 mm · standard gauge HSR',
    traction: '25 kV AC 50 Hz electric',
    description: 'Highland terminus of Whoosh high-speed rail serving West Java.',
    isOwned: false,
    acquisitionCost: 1500000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 8.8,
    economicTier: 2,
  },

  // --- GLOBAL / WORLD CORRIDORS (Unlocked via World Toggle) ---
  {
    id: 'par',
    name: 'Paris Gare de Lyon',
    code: 'PLY',
    country: 'France',
    region: 'Global Corridors',
    regionId: 'world',
    lat: 48.8443,
    lng: 2.3734,
    gauge: '1,435 mm · standard gauge',
    traction: '1.5 kV DC & 25 kV AC TGV catenary',
    description: 'Historic clock-tower terminus for France\'s premier TGV South-East corridors.',
    isOwned: false,
    acquisitionCost: 4600000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 12.2,
    economicTier: 1,
  },
  {
    id: 'lon',
    name: 'London St Pancras International',
    code: 'STP',
    country: 'United Kingdom',
    region: 'Global Corridors',
    regionId: 'world',
    lat: 51.5314,
    lng: -0.1261,
    gauge: '1,435 mm · High Speed 1',
    traction: '25 kV AC 50 Hz electric',
    description: 'Victorian gothic palace and UK gateway to Eurostar trans-continental rail.',
    isOwned: false,
    acquisitionCost: 5100000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 14.8,
    economicTier: 1,
  },
  {
    id: 'ber',
    name: 'Berlin Hauptbahnhof',
    code: 'BER',
    country: 'Germany',
    region: 'Global Corridors',
    regionId: 'world',
    lat: 52.5256,
    lng: 13.3695,
    gauge: '1,435 mm · standard gauge',
    traction: '15 kV 16.7 Hz AC electric',
    description: 'Europe\'s largest two-level crossing station with glass architecture.',
    isOwned: false,
    acquisitionCost: 4200000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 3.8,
    economicTier: 1,
  },
  {
    id: 'nyp',
    name: 'New York Penn Station',
    code: 'NYP',
    country: 'United States',
    region: 'Global Corridors',
    regionId: 'world',
    lat: 40.7505,
    lng: -73.9934,
    gauge: '1,435 mm · standard gauge',
    traction: '12 kV 25 Hz / 25 kV 60 Hz AC electric',
    description: 'Busiest transportation facility in the Western Hemisphere (Northeast Corridor).',
    isOwned: false,
    acquisitionCost: 5500000,
    dispatchSlots: [false, false, false, false, false, false, false, false, false, false],
    populationMillions: 20.1,
    economicTier: 1,
  },
];

export const INITIAL_CORRIDORS: Corridor[] = [
  // India Corridors
  {
    id: 'corr-del-bct',
    stationAId: 'ndls',
    stationBId: 'bct',
    name: 'Western Trunk (Delhi - Mumbai)',
    distanceKm: 1386,
    standardGauge: '1,676 mm',
    supportedTrackTypes: ['high_speed', 'express', 'commuter'],
    description: 'India\'s economic lifeblood connecting political and financial capitals.',
    baseDailyDemand: 52000,
    waypoints: [
      { lat: 27.4924, lng: 77.6737 }, // Mathura
      { lat: 27.2152, lng: 77.4892 }, // Bharatpur
      { lat: 25.9928, lng: 76.3533 }, // Sawai Madhopur
      { lat: 25.1825, lng: 75.8398 }, // Kota
      { lat: 23.4560, lng: 75.4180 }, // Nagda
      { lat: 23.3315, lng: 75.0367 }, // Ratlam
      { lat: 22.8360, lng: 74.2560 }, // Dahod
      { lat: 22.3072, lng: 73.1812 }, // Vadodara
      { lat: 21.7051, lng: 72.9959 }, // Bharuch
      { lat: 21.1702, lng: 72.8311 }, // Surat
      { lat: 20.6100, lng: 72.9300 }, // Valsad
      { lat: 20.3709, lng: 72.9106 }, // Vapi
      { lat: 19.9700, lng: 72.7300 }, // Dahanu
      { lat: 19.4700, lng: 72.8000 }, // Virar
      { lat: 19.2290, lng: 72.8570 }, // Borivali
    ],
  },
  {
    id: 'corr-del-adi',
    stationAId: 'ndls',
    stationBId: 'adi',
    name: 'Delhi - Jaipur - Ahmedabad Trunk',
    distanceKm: 934,
    standardGauge: '1,676 mm',
    supportedTrackTypes: ['high_speed', 'express'],
    description: 'Northern commercial spine serving manufacturing clusters.',
    baseDailyDemand: 34000,
    waypoints: [
      { lat: 28.4595, lng: 77.0266 }, // Gurgaon
      { lat: 28.1920, lng: 76.6180 }, // Rewari
      { lat: 27.5530, lng: 76.6346 }, // Alwar
      { lat: 26.9124, lng: 75.7873 }, // Jaipur
      { lat: 26.4499, lng: 74.6399 }, // Ajmer
      { lat: 25.7330, lng: 73.6000 }, // Marwar
      { lat: 24.4795, lng: 72.7820 }, // Abu Road
      { lat: 24.1725, lng: 72.4387 }, // Palanpur
      { lat: 23.5880, lng: 72.3693 }, // Mehsana
    ],
  },
  {
    id: 'corr-adi-bct',
    stationAId: 'adi',
    stationBId: 'bct',
    name: 'Mumbai - Ahmedabad Bullet Corridor',
    distanceKm: 508,
    standardGauge: '1,435 mm / 1,676 mm',
    supportedTrackTypes: ['high_speed', 'express', 'commuter'],
    description: 'Premier flagship corridor for Shinkansen E5 technology in India.',
    baseDailyDemand: 48000,
    waypoints: [
      { lat: 22.5645, lng: 72.9289 }, // Anand
      { lat: 22.3072, lng: 73.1812 }, // Vadodara
      { lat: 21.7051, lng: 72.9959 }, // Bharuch
      { lat: 21.1702, lng: 72.8311 }, // Surat
      { lat: 20.7634, lng: 72.9667 }, // Bilimora
      { lat: 20.3709, lng: 72.9106 }, // Vapi
      { lat: 19.8036, lng: 72.7562 }, // Boisar
      { lat: 19.4700, lng: 72.8000 }, // Virar
      { lat: 19.2183, lng: 72.9781 }, // Thane
    ],
  },
  {
    id: 'corr-del-bsb',
    stationAId: 'ndls',
    stationBId: 'bsb',
    name: 'Delhi - Varanasi Vande Bharat Corridor',
    distanceKm: 759,
    standardGauge: '1,676 mm',
    supportedTrackTypes: ['high_speed', 'express', 'commuter'],
    description: 'High-density Gangetic plain corridor carrying millions annually.',
    baseDailyDemand: 41000,
    waypoints: [
      { lat: 28.6692, lng: 77.4538 }, // Ghaziabad
      { lat: 27.8974, lng: 78.0880 }, // Aligarh
      { lat: 27.2084, lng: 78.2393 }, // Tundla
      { lat: 26.7769, lng: 79.0233 }, // Etawah
      { lat: 26.4547, lng: 80.3507 }, // Kanpur Central
      { lat: 25.9300, lng: 80.8100 }, // Fatehpur
      { lat: 25.4358, lng: 81.8463 }, // Prayagraj (Allahabad)
      { lat: 25.1337, lng: 82.5644 }, // Mirzapur
    ],
  },
  {
    id: 'corr-bsb-hwh',
    stationAId: 'bsb',
    stationBId: 'hwh',
    name: 'Varanasi - Patna - Kolkata Eastern Trunk',
    distanceKm: 680,
    standardGauge: '1,676 mm',
    supportedTrackTypes: ['high_speed', 'express', 'commuter'],
    description: 'Historic Howrah line with high trade and commuter flows.',
    baseDailyDemand: 39000,
    waypoints: [
      { lat: 25.2796, lng: 83.1174 }, // Pt Deen Dayal Upadhyaya
      { lat: 25.5786, lng: 83.9777 }, // Buxar
      { lat: 25.5560, lng: 84.6600 }, // Ara
      { lat: 25.6093, lng: 85.1235 }, // Patna
      { lat: 25.3967, lng: 85.9189 }, // Mokama
      { lat: 25.1764, lng: 86.0963 }, // Kiul
      { lat: 24.5140, lng: 86.6430 }, // Jasidih
      { lat: 23.6889, lng: 86.9661 }, // Asansol
      { lat: 23.5204, lng: 87.3119 }, // Durgapur
      { lat: 23.2324, lng: 87.8615 }, // Bardhaman
    ],
  },
  {
    id: 'corr-bct-sbc',
    stationAId: 'bct',
    stationBId: 'sbc',
    name: 'Mumbai - Pune - Bengaluru Deccan Corridor',
    distanceKm: 980,
    standardGauge: '1,676 mm',
    supportedTrackTypes: ['high_speed', 'express'],
    description: 'Deccan plateau tech and commerce bridge.',
    baseDailyDemand: 28000,
    waypoints: [
      { lat: 19.2437, lng: 73.1355 }, // Kalyan
      { lat: 18.7557, lng: 73.4091 }, // Khandala Bhor Ghat
      { lat: 18.5284, lng: 73.8743 }, // Pune
      { lat: 18.4600, lng: 74.5800 }, // Daund
      { lat: 17.6599, lng: 75.9064 }, // Solapur
      { lat: 17.3297, lng: 76.8343 }, // Kalaburagi
      { lat: 16.2076, lng: 77.3556 }, // Raichur
      { lat: 15.1700, lng: 77.3700 }, // Guntakal
      { lat: 14.6819, lng: 77.6006 }, // Anantapur
      { lat: 13.8280, lng: 77.4920 }, // Hindupur
    ],
  },
  {
    id: 'corr-sbc-mas',
    stationAId: 'sbc',
    stationBId: 'mas',
    name: 'Bengaluru - Chennai Expressway Rail',
    distanceKm: 362,
    standardGauge: '1,676 mm',
    supportedTrackTypes: ['high_speed', 'express', 'commuter'],
    description: 'Heavy tech commuter artery with rapid hourly demand.',
    baseDailyDemand: 46000,
    waypoints: [
      { lat: 13.0010, lng: 77.6830 }, // Krishnarajapuram
      { lat: 12.9939, lng: 78.1969 }, // Bangarapet
      { lat: 12.5694, lng: 78.5815 }, // Jolarpettai
      { lat: 12.9760, lng: 79.1360 }, // Katpadi (Vellore)
      { lat: 13.0800, lng: 79.6700 }, // Arakkonam
      { lat: 13.1070, lng: 80.2430 }, // Perambur
    ],
  },
  {
    id: 'corr-del-lhe',
    stationAId: 'ndls',
    stationBId: 'lhe',
    name: 'Delhi - Amritsar - Lahore Corridor',
    distanceKm: 480,
    standardGauge: '1,676 mm',
    supportedTrackTypes: ['express', 'commuter'],
    description: 'Punjab agricultural and historical passenger corridor.',
    baseDailyDemand: 22000,
    waypoints: [
      { lat: 29.3909, lng: 76.9635 }, // Panipat
      { lat: 29.9690, lng: 76.8780 }, // Kurukshetra
      { lat: 30.3340, lng: 76.8375 }, // Ambala Cantt
      { lat: 30.9010, lng: 75.8573 }, // Ludhiana
      { lat: 31.3260, lng: 75.5762 }, // Jalandhar
      { lat: 31.6340, lng: 74.8723 }, // Amritsar
      { lat: 31.6033, lng: 74.6067 }, // Wagah / Attari Border
    ],
  },
  {
    id: 'corr-hwh-dak',
    stationAId: 'hwh',
    stationBId: 'dak',
    name: 'Kolkata - Dhaka Maitree Corridor',
    distanceKm: 375,
    standardGauge: 'Dual gauge',
    supportedTrackTypes: ['express', 'commuter'],
    description: 'Cross-border international passenger link.',
    baseDailyDemand: 25000,
    waypoints: [
      { lat: 23.1800, lng: 88.5800 }, // Ranaghat
      { lat: 23.4100, lng: 88.6500 }, // Gede
      { lat: 23.5300, lng: 88.8100 }, // Darshana
      { lat: 24.1500, lng: 89.0600 }, // Ishwardi
      { lat: 24.4000, lng: 89.7800 }, // Jamuna Bridge
      { lat: 23.9900, lng: 90.4100 }, // Joydebpur
    ],
  },

  // China Corridors
  {
    id: 'corr-bjs-sha',
    stationAId: 'bjs',
    stationBId: 'sha',
    name: 'Beijing - Shanghai Jinghu HSR',
    distanceKm: 1318,
    standardGauge: '1,435 mm',
    supportedTrackTypes: ['high_speed', 'express'],
    description: 'The world\'s most profitable high-speed rail line operating at 350 km/h.',
    baseDailyDemand: 82000,
    waypoints: [
      { lat: 39.5200, lng: 116.7000 }, // Langfang
      { lat: 39.0575, lng: 117.0600 }, // Tianjin South
      { lat: 38.3000, lng: 116.8000 }, // Cangzhou West
      { lat: 37.4300, lng: 116.4800 }, // Dezhou East
      { lat: 36.6700, lng: 116.8900 }, // Jinan West
      { lat: 36.1900, lng: 117.0600 }, // Tai'an
      { lat: 35.5800, lng: 117.0500 }, // Qufu East
      { lat: 34.2700, lng: 117.2900 }, // Xuzhou East
      { lat: 32.9000, lng: 117.4300 }, // Bengbu South
      { lat: 32.2200, lng: 118.3000 }, // Chuzhou
      { lat: 31.9700, lng: 118.7900 }, // Nanjing South
      { lat: 32.1400, lng: 119.4500 }, // Zhenjiang South
      { lat: 31.8500, lng: 119.9700 }, // Changzhou North
      { lat: 31.5900, lng: 120.4600 }, // Wuxi East
      { lat: 31.4200, lng: 120.6400 }, // Suzhou North
    ],
  },
  {
    id: 'corr-bjs-whn',
    stationAId: 'bjs',
    stationBId: 'whn',
    name: 'Beijing - Wuhan Jingguang HSR (North)',
    distanceKm: 1225,
    standardGauge: '1,435 mm',
    supportedTrackTypes: ['high_speed', 'express'],
    description: 'Core north-south trunk artery crossing the Yellow River.',
    baseDailyDemand: 58000,
    waypoints: [
      { lat: 38.8700, lng: 115.5800 }, // Baoding East
      { lat: 38.0200, lng: 114.4800 }, // Shijiazhuang
      { lat: 37.0700, lng: 114.5800 }, // Xingtai East
      { lat: 36.6200, lng: 114.5500 }, // Handan East
      { lat: 36.1000, lng: 114.4700 }, // Anyang East
      { lat: 34.7500, lng: 113.7700 }, // Zhengzhou East
      { lat: 34.0300, lng: 113.8900 }, // Xuchang East
      { lat: 33.5800, lng: 113.9700 }, // Luohe West
      { lat: 32.9800, lng: 113.9800 }, // Zhumadian West
      { lat: 32.1400, lng: 114.1200 }, // Xinyang East
    ],
  },
  {
    id: 'corr-whn-gzs',
    stationAId: 'whn',
    stationBId: 'gzs',
    name: 'Wuhan - Guangzhou Jingguang HSR (South)',
    distanceKm: 1069,
    standardGauge: '1,435 mm',
    supportedTrackTypes: ['high_speed', 'express'],
    description: 'Historic first 350 km/h trunk connecting central China to the coast.',
    baseDailyDemand: 64000,
    waypoints: [
      { lat: 29.8600, lng: 114.3300 }, // Xianning North
      { lat: 29.3700, lng: 113.1900 }, // Yueyang East
      { lat: 28.1500, lng: 113.0600 }, // Changsha South
      { lat: 27.7900, lng: 113.0600 }, // Zhuzhou West
      { lat: 26.8900, lng: 112.7200 }, // Hengyang East
      { lat: 25.7900, lng: 113.0000 }, // Chenzhou West
      { lat: 24.7800, lng: 113.5300 }, // Shaoguan
      { lat: 23.6300, lng: 113.0800 }, // Qingyuan
    ],
  },
  {
    id: 'corr-gzs-hkg',
    stationAId: 'gzs',
    stationBId: 'hkg',
    name: 'Guangzhou - Shenzhen - Hong Kong Express Rail',
    distanceKm: 142,
    standardGauge: '1,435 mm',
    supportedTrackTypes: ['high_speed', 'commuter'],
    description: 'Sub-45-minute sprint connecting Greater Bay Area metropolitan giants.',
    baseDailyDemand: 72000,
    waypoints: [
      { lat: 22.8400, lng: 113.4800 }, // Qingsheng
      { lat: 22.8600, lng: 113.6700 }, // Humen (Dongguan)
      { lat: 22.7400, lng: 113.9200 }, // Guangmingcheng
      { lat: 22.6100, lng: 114.0300 }, // Shenzhen North
      { lat: 22.5400, lng: 114.0500 }, // Futian
    ],
  },
  {
    id: 'corr-xian-cdu',
    stationAId: 'xian',
    stationBId: 'cdu',
    name: 'Xi\'an - Chengdu Xicheng HSR',
    distanceKm: 658,
    standardGauge: '1,435 mm',
    supportedTrackTypes: ['high_speed', 'express'],
    description: 'Engineering triumph tunneling through the Qinling Mountains.',
    baseDailyDemand: 36000,
    waypoints: [
      { lat: 34.1100, lng: 108.6200 }, // Hu Xian
      { lat: 33.5200, lng: 107.9800 }, // Foping (Qinling Pass)
      { lat: 33.0600, lng: 107.0300 }, // Hanzhong
      { lat: 32.4400, lng: 105.8200 }, // Guangyuan
      { lat: 31.7700, lng: 104.7500 }, // Jiangyou
      { lat: 31.4700, lng: 104.7500 }, // Mianyang
      { lat: 31.1300, lng: 104.3900 }, // Deyang
    ],
  },

  // East Asia Corridors
  {
    id: 'corr-tyo-osa',
    stationAId: 'tyo',
    stationBId: 'osa',
    name: 'Tokaido Corridor (Tokyo - Osaka)',
    distanceKm: 515,
    standardGauge: '1,435 mm Shinkansen & 1,067 mm Mainline',
    supportedTrackTypes: ['high_speed', 'express', 'commuter'],
    description: 'The historic Shinkansen cradle: high-speed bullet tracks alongside local commuter mainline tracks.',
    baseDailyDemand: 95000,
    waypoints: [
      { lat: 35.6284, lng: 139.7387 }, // Shinagawa
      { lat: 35.5075, lng: 139.6175 }, // Shin-Yokohama
      { lat: 35.2560, lng: 139.1550 }, // Odawara
      { lat: 35.1030, lng: 139.0780 }, // Atami
      { lat: 35.1270, lng: 138.9110 }, // Mishima
      { lat: 34.9717, lng: 138.3890 }, // Shizuoka
      { lat: 34.7037, lng: 137.7340 }, // Hamamatsu
      { lat: 34.7629, lng: 137.3820 }, // Toyohashi
      { lat: 35.1709, lng: 136.8815 }, // Nagoya
      { lat: 35.3150, lng: 136.6850 }, // Gifu-Hashima
      { lat: 35.3140, lng: 136.2900 }, // Maibara
      { lat: 34.9858, lng: 135.7588 }, // Kyoto
    ],
  },
  {
    id: 'corr-tyo-ngo',
    stationAId: 'tyo',
    stationBId: 'ngo',
    name: 'Tokyo - Nagoya Chuo Corridor',
    distanceKm: 342,
    standardGauge: '1,435 mm',
    supportedTrackTypes: ['high_speed', 'express', 'commuter'],
    description: 'Ultra-dense commuter and business expressway.',
    baseDailyDemand: 68000,
    waypoints: [
      { lat: 35.6550, lng: 139.3390 }, // Hachioji
      { lat: 35.6660, lng: 138.5690 }, // Kofu
      { lat: 36.1140, lng: 137.9540 }, // Shiojiri
      { lat: 35.4920, lng: 137.5020 }, // Nakatsugawa
      { lat: 35.3350, lng: 137.1200 }, // Tajimi
    ],
  },
  {
    id: 'corr-osa-fuk',
    stationAId: 'osa',
    stationBId: 'fuk',
    name: 'Sanyo Shinkansen (Shin-Osaka - Hakata)',
    distanceKm: 622,
    standardGauge: '1,435 mm',
    supportedTrackTypes: ['high_speed', 'express'],
    description: 'Scenic high-speed route through western Honshu to Kyushu.',
    baseDailyDemand: 42000,
    waypoints: [
      { lat: 34.7050, lng: 135.1950 }, // Shin-Kobe
      { lat: 34.8270, lng: 134.6900 }, // Himeji
      { lat: 34.6660, lng: 133.9180 }, // Okayama
      { lat: 34.4890, lng: 133.3610 }, // Fukuyama
      { lat: 34.3970, lng: 132.4750 }, // Hiroshima
      { lat: 34.0930, lng: 131.3970 }, // Shin-Yamaguchi
      { lat: 33.8870, lng: 130.8820 }, // Kokura (Kanmon Tunnel)
    ],
  },
  {
    id: 'corr-sel-pus',
    stationAId: 'sel',
    stationBId: 'pus',
    name: 'Gyeongbu HSR (Seoul - Busan)',
    distanceKm: 417,
    standardGauge: '1,435 mm',
    supportedTrackTypes: ['high_speed', 'express', 'commuter'],
    description: 'The golden spine of South Korea carrying over 65% of intercity transit.',
    baseDailyDemand: 54000,
    waypoints: [
      { lat: 37.4160, lng: 126.8840 }, // Gwangmyeong
      { lat: 36.7940, lng: 127.1040 }, // Cheonan-Asan
      { lat: 36.6200, lng: 127.3270 }, // Osong
      { lat: 36.3320, lng: 127.4340 }, // Daejeon
      { lat: 36.1150, lng: 128.1800 }, // Gimcheon-Gumi
      { lat: 35.8790, lng: 128.6280 }, // Dongdaegu
      { lat: 35.7980, lng: 129.1380 }, // Singyeongju
      { lat: 35.5510, lng: 129.1380 }, // Ulsan
    ],
  },
  {
    id: 'corr-tpe-khh',
    stationAId: 'tpe',
    stationBId: 'khh',
    name: 'Taiwan West Coast HSR Corridor',
    distanceKm: 345,
    standardGauge: '1,435 mm',
    supportedTrackTypes: ['high_speed', 'commuter'],
    description: 'High-speed line linking Taipei to Taichung and Kaohsiung along the western plain.',
    baseDailyDemand: 40000,
    waypoints: [
      { lat: 25.0140, lng: 121.4630 }, // Banqiao
      { lat: 25.0130, lng: 121.2150 }, // Taoyuan
      { lat: 24.8080, lng: 121.0400 }, // Hsinchu
      { lat: 24.1120, lng: 120.6160 }, // Taichung
      { lat: 23.8740, lng: 120.5740 }, // Changhua
      { lat: 23.4590, lng: 120.3240 }, // Chiayi
      { lat: 22.9250, lng: 120.2860 }, // Tainan
    ],
  },

  // Southeast Asia Corridors
  {
    id: 'corr-bkk-kls',
    stationAId: 'bkk',
    stationBId: 'kls',
    name: 'Pan-Asian Malay Trunk (Bangkok - KL)',
    distanceKm: 1490,
    standardGauge: '1,000 mm / Planned HSR',
    supportedTrackTypes: ['high_speed', 'express'],
    description: 'Trans-peninsular spine connecting Indochina with Malaysia.',
    baseDailyDemand: 26000,
    waypoints: [
      { lat: 13.5370, lng: 99.8180 }, // Ratchaburi
      { lat: 12.5690, lng: 99.9570 }, // Hua Hin
      { lat: 10.4950, lng: 99.1790 }, // Chumphon
      { lat: 9.1060, lng: 99.2240 }, // Surat Thani
      { lat: 7.0040, lng: 100.4680 }, // Hat Yai
      { lat: 6.6620, lng: 100.3200 }, // Padang Besar Border
      { lat: 6.1200, lng: 100.3680 }, // Alor Setar
      { lat: 5.3940, lng: 100.3660 }, // Butterworth
      { lat: 4.5970, lng: 101.0740 }, // Ipoh
    ],
  },
  {
    id: 'corr-kls-sgp',
    stationAId: 'kls',
    stationBId: 'sgp',
    name: 'KL - Singapore High Speed Corridor',
    distanceKm: 350,
    standardGauge: '1,435 mm HSR & Meter Commuter',
    supportedTrackTypes: ['high_speed', 'commuter'],
    description: 'One of the world\'s busiest cross-border aviation corridors now shifting to rail.',
    baseDailyDemand: 62000,
    waypoints: [
      { lat: 2.7190, lng: 101.9390 }, // Seremban
      { lat: 2.2850, lng: 102.2800 }, // Melaka Ayer Keroh
      { lat: 2.0500, lng: 102.5700 }, // Muar
      { lat: 1.8540, lng: 102.9300 }, // Batu Pahat
      { lat: 1.4250, lng: 103.6500 }, // Iskandar Puteri
      { lat: 1.4630, lng: 103.7640 }, // Johor Bahru Sentral
    ],
  },
  {
    id: 'corr-jkt-bdg',
    stationAId: 'jkt',
    stationBId: 'bdg',
    name: 'Whoosh HSR (Jakarta - Bandung)',
    distanceKm: 142,
    standardGauge: '1,435 mm HSR',
    supportedTrackTypes: ['high_speed', 'commuter'],
    description: 'First high-speed railway in Southeast Asia cutting travel time from 3 hours to 45 mins.',
    baseDailyDemand: 44000,
    waypoints: [
      { lat: -6.3680, lng: 107.2450 }, // Karawang Station
      { lat: -6.7500, lng: 107.4100 }, // Walini Pass
      { lat: -6.8410, lng: 107.4810 }, // Padalarang Transfer Hub
    ],
  },

  // Global Corridors
  {
    id: 'corr-par-lon',
    stationAId: 'par',
    stationBId: 'lon',
    name: 'Eurostar Cross-Channel Trunk (Paris - London)',
    distanceKm: 492,
    standardGauge: '1,435 mm',
    supportedTrackTypes: ['high_speed'],
    description: 'Sub-sea Channel Tunnel high-speed connection between European capitals.',
    baseDailyDemand: 38000,
    waypoints: [
      { lat: 49.8590, lng: 2.8330 }, // TGV Haute-Picardie
      { lat: 50.6390, lng: 3.0760 }, // Lille Europe
      { lat: 50.9010, lng: 1.8120 }, // Calais-Frethun
      { lat: 51.0180, lng: 1.2720 }, // Channel Tunnel Portal
      { lat: 51.1430, lng: 0.8750 }, // Ashford International
      { lat: 51.4420, lng: 0.3200 }, // Ebbsfleet International
    ],
  },
  {
    id: 'corr-par-ber',
    stationAId: 'par',
    stationBId: 'ber',
    name: 'Trans-European TGV/ICE (Paris - Berlin)',
    distanceKm: 1050,
    standardGauge: '1,435 mm',
    supportedTrackTypes: ['high_speed', 'express'],
    description: 'Flagship Franco-German high-speed rail corridor.',
    baseDailyDemand: 31000,
    waypoints: [
      { lat: 48.9780, lng: 6.1680 }, // Lorraine TGV
      { lat: 48.5850, lng: 7.7340 }, // Strasbourg
      { lat: 49.0000, lng: 8.4000 }, // Karlsruhe
      { lat: 49.4800, lng: 8.4690 }, // Mannheim
      { lat: 50.1000, lng: 8.6870 }, // Frankfurt South
      { lat: 50.9720, lng: 11.0380 }, // Erfurt
      { lat: 51.3450, lng: 12.3810 }, // Leipzig
    ],
  },
];

export const MANUFACTURERS: Manufacturer[] = [
  {
    id: 'hitachi_kawasaki',
    name: 'Hitachi & Kawasaki Heavy Rail',
    shortName: 'Hitachi / Kawasaki',
    country: 'Japan',
    headquarters: 'Tokyo / Kobe, Japan',
    flag: '🇯🇵',
    founded: 1910,
    specialty: 'High-Speed Shinkansen Bullet Trains & Aluminum Carbody Dynamics',
    description: 'Pioneers of the 0 Series Shinkansen and the world standard for zero-fatality high-speed rail engineering.',
  },
  {
    id: 'crrc',
    name: 'CRRC Corporation',
    shortName: 'CRRC',
    country: 'China',
    headquarters: 'Beijing, China',
    flag: '🇨🇳',
    founded: 2015,
    specialty: 'Fuxing Hao 350 km/h Bullet Fleets & Mass Passenger High-Capacity EMUs',
    description: 'The world\'s largest rolling stock manufacturer by volume, operating over 40,000 km of high-speed network.',
  },
  {
    id: 'alstom',
    name: 'Alstom Transport',
    shortName: 'Alstom',
    country: 'France',
    headquarters: 'Saint-Ouen, France',
    flag: '🇫🇷',
    founded: 1928,
    specialty: 'TGV Duplex Double-Decker & Avelia High-Speed Articulated Trainsets',
    description: 'Holders of the world rail speed record (574.8 km/h) and master builders of high-speed articulated trains.',
  },
  {
    id: 'siemens',
    name: 'Siemens Mobility',
    shortName: 'Siemens',
    country: 'Germany',
    headquarters: 'Munich, Germany',
    flag: '🇩🇪',
    founded: 1847,
    specialty: 'Velaro ICE High-Speed Platforms & Mireo Energy-Efficient Regional EMUs',
    description: 'Precision German heavy engineering renowned for distributed traction and multi-system electrification.',
  },
  {
    id: 'hyundai_rotem',
    name: 'Hyundai Rotem',
    shortName: 'Hyundai Rotem',
    country: 'South Korea',
    headquarters: 'Uiwang, South Korea',
    flag: '🇰🇷',
    founded: 1977,
    specialty: 'KTX-Eum Distributed Traction & Aerodynamic High-Acceleration EMUs',
    description: 'South Korea\'s premier rolling stock builder, delivering cutting-edge high-speed and metropolitan systems.',
  },
  {
    id: 'icf_indian_rail',
    name: 'Integral Coach Factory (ICF)',
    shortName: 'ICF / Indian Railways',
    country: 'India',
    headquarters: 'Chennai, India',
    flag: '🇮🇳',
    founded: 1955,
    specialty: 'Vande Bharat Semi-High Speed EMUs & Heavy Broad-Gauge Passenger Coaches',
    description: 'World\'s highest single-facility coach builder, creator of the transformative Vande Bharat trainsets.',
  },
  {
    id: 'stadler',
    name: 'Stadler Rail',
    shortName: 'Stadler',
    country: 'Switzerland',
    headquarters: 'Bussnang, Switzerland',
    flag: '🇨🇭',
    founded: 1942,
    specialty: 'FLIRT & KISS Double-Decker Modular High-Frequency Commuter Fleets',
    description: 'Swiss precision masters of fast passenger turnover, ultra-smooth ride quality, and modular flexibility.',
  },
];

export const TRAIN_CATALOG: TrainModel[] = [
  // --- HITACHI / KAWASAKI (JAPAN) ---
  {
    id: 'shinkansen-n700s',
    manufacturerId: 'hitachi_kawasaki',
    name: 'Shinkansen N700S Supreme',
    seriesCode: 'N700S',
    category: 'High-Speed Bullet',
    trackType: 'high_speed',
    maxSpeedKmH: 330,
    passengerCapacity: 1323,
    purchasePrice: 42000000,
    dailyMaintenance: 4800,
    reliabilityScore: 99,
    comfortScore: 97,
    acceleration: 'Very High',
    powerType: 'Electric EMU',
    description: 'The pinnacle of Tokaido Shinkansen engineering: SiC semiconductors and active suspension.',
    defaultLivery: {
      baseColor: '#ffffff',
      stripeColor: '#0284c7',
      accentColor: '#38bdf8',
      roofColor: '#64748b',
    },
  },
  {
    id: 'shinkansen-e5',
    manufacturerId: 'hitachi_kawasaki',
    name: 'Shinkansen E5 Series "Hayabusa"',
    seriesCode: 'E5',
    category: 'High-Speed Bullet',
    trackType: 'high_speed',
    maxSpeedKmH: 320,
    passengerCapacity: 731,
    purchasePrice: 38000000,
    dailyMaintenance: 4400,
    reliabilityScore: 98,
    comfortScore: 96,
    acceleration: 'High',
    powerType: 'Electric EMU',
    description: 'Iconic 15-meter aero-double-wing nose cone reducing micro-pressure tunnel sonic booms.',
    defaultLivery: {
      baseColor: '#0d9488',
      stripeColor: '#ec4899',
      accentColor: '#f8fafc',
      roofColor: '#475569',
    },
  },
  {
    id: 'e235-series',
    manufacturerId: 'hitachi_kawasaki',
    name: 'Series E235 Yamanote Commuter',
    seriesCode: 'E235',
    category: 'Intercity Commuter',
    trackType: 'commuter',
    maxSpeedKmH: 120,
    passengerCapacity: 1650,
    purchasePrice: 16000000,
    dailyMaintenance: 1900,
    reliabilityScore: 99,
    comfortScore: 84,
    acceleration: 'Very High',
    powerType: 'Electric EMU',
    description: 'High-frequency Tokyo suburban workhorse with wide automated passenger doors.',
    defaultLivery: {
      baseColor: '#e2e8f0',
      stripeColor: '#84cc16',
      accentColor: '#22c55e',
      roofColor: '#94a3b8',
    },
  },

  // --- CRRC (CHINA) ---
  {
    id: 'cr400af-fuxing',
    manufacturerId: 'crrc',
    name: 'CR400AF Fuxing Hao "Red Falcon"',
    seriesCode: 'CR400AF',
    category: 'High-Speed Bullet',
    trackType: 'high_speed',
    maxSpeedKmH: 350,
    passengerCapacity: 1193,
    purchasePrice: 36000000,
    dailyMaintenance: 4200,
    reliabilityScore: 96,
    comfortScore: 94,
    acceleration: 'High',
    powerType: 'Electric EMU',
    description: 'China\'s premier high-speed train running at standard 350 km/h commercial revenue speed.',
    defaultLivery: {
      baseColor: '#cbd5e1',
      stripeColor: '#dc2626',
      accentColor: '#eab308',
      roofColor: '#475569',
    },
  },
  {
    id: 'crh380a-harmony',
    manufacturerId: 'crrc',
    name: 'CRH380A Harmony "Hexie"',
    seriesCode: 'CRH380A',
    category: 'High-Speed Bullet',
    trackType: 'high_speed',
    maxSpeedKmH: 380,
    passengerCapacity: 1028,
    purchasePrice: 32000000,
    dailyMaintenance: 3900,
    reliabilityScore: 94,
    comfortScore: 91,
    acceleration: 'Very High',
    powerType: 'Electric EMU',
    description: 'Low aerodynamic drag fish-head profile engineered for ultra-fast intercity sprints.',
    defaultLivery: {
      baseColor: '#ffffff',
      stripeColor: '#2563eb',
      accentColor: '#93c5fd',
      roofColor: '#64748b',
    },
  },
  {
    id: 'crrc-cinova',
    manufacturerId: 'crrc',
    name: 'Cinova Regional Intercity EMU',
    seriesCode: 'Cinova',
    category: 'Regional Express',
    trackType: 'express',
    maxSpeedKmH: 200,
    passengerCapacity: 920,
    purchasePrice: 19000000,
    dailyMaintenance: 2300,
    reliabilityScore: 93,
    comfortScore: 86,
    acceleration: 'High',
    powerType: 'Electric EMU',
    description: 'High-capacity intercity express platform connecting dense economic urban clusters.',
    defaultLivery: {
      baseColor: '#f1f5f9',
      stripeColor: '#0284c7',
      accentColor: '#f59e0b',
      roofColor: '#334155',
    },
  },

  // --- ALSTOM (FRANCE) ---
  {
    id: 'alstom-avelia-horizon',
    manufacturerId: 'alstom',
    name: 'Avelia Horizon TGV Duplex',
    seriesCode: 'TGV-M',
    category: 'High-Speed Bullet',
    trackType: 'high_speed',
    maxSpeedKmH: 350,
    passengerCapacity: 740,
    purchasePrice: 44000000,
    dailyMaintenance: 4900,
    reliabilityScore: 97,
    comfortScore: 98,
    acceleration: 'Medium',
    powerType: 'Electric EMU',
    description: 'Double-decker articulated high-speed flagship with panoramic upper-deck vistas.',
    defaultLivery: {
      baseColor: '#f8fafc',
      stripeColor: '#be123c',
      accentColor: '#1e293b',
      roofColor: '#334155',
    },
  },
  {
    id: 'alstom-coradia-liner',
    manufacturerId: 'alstom',
    name: 'Coradia Polyvalent Intercity',
    seriesCode: 'Coradia',
    category: 'Regional Express',
    trackType: 'express',
    maxSpeedKmH: 200,
    passengerCapacity: 580,
    purchasePrice: 22000000,
    dailyMaintenance: 2600,
    reliabilityScore: 95,
    comfortScore: 90,
    acceleration: 'High',
    powerType: 'Dual-Mode Electric',
    description: 'Versatile low-floor articulated train capable of running under catenary and diesel routes.',
    defaultLivery: {
      baseColor: '#e2e8f0',
      stripeColor: '#7c3aed',
      accentColor: '#06b6d4',
      roofColor: '#475569',
    },
  },

  // --- SIEMENS MOBILITY (GERMANY) ---
  {
    id: 'siemens-velaro-ms',
    manufacturerId: 'siemens',
    name: 'Siemens Velaro "ICE 3neo"',
    seriesCode: 'Velaro',
    category: 'High-Speed Bullet',
    trackType: 'high_speed',
    maxSpeedKmH: 320,
    passengerCapacity: 888,
    purchasePrice: 41000000,
    dailyMaintenance: 4600,
    reliabilityScore: 97,
    comfortScore: 96,
    acceleration: 'High',
    powerType: 'Electric EMU',
    description: 'Distributed traction underneath passenger floors with multi-voltage European compatibility.',
    defaultLivery: {
      baseColor: '#ffffff',
      stripeColor: '#dc2626',
      accentColor: '#475569',
      roofColor: '#94a3b8',
    },
  },
  {
    id: 'siemens-mireo',
    manufacturerId: 'siemens',
    name: 'Siemens Mireo Smart Commuter',
    seriesCode: 'Mireo',
    category: 'Intercity Commuter',
    trackType: 'commuter',
    maxSpeedKmH: 160,
    passengerCapacity: 640,
    purchasePrice: 18000000,
    dailyMaintenance: 2100,
    reliabilityScore: 96,
    comfortScore: 88,
    acceleration: 'High',
    powerType: 'Electric EMU',
    description: 'Lightweight welded aluminum structure consuming 25% less traction energy.',
    defaultLivery: {
      baseColor: '#f8fafc',
      stripeColor: '#059669',
      accentColor: '#0284c7',
      roofColor: '#334155',
    },
  },

  // --- HYUNDAI ROTEM (SOUTH KOREA) ---
  {
    id: 'ktx-eum-emu260',
    manufacturerId: 'hyundai_rotem',
    name: 'KTX-Eum (EMU-260)',
    seriesCode: 'KTX-Eum',
    category: 'Semi-High Speed',
    trackType: 'express',
    maxSpeedKmH: 260,
    passengerCapacity: 581,
    purchasePrice: 28000000,
    dailyMaintenance: 3300,
    reliabilityScore: 95,
    comfortScore: 93,
    acceleration: 'Very High',
    powerType: 'Electric EMU',
    description: 'Individual wireless phone chargers, window blinds, and rapid acceleration between Korean stops.',
    defaultLivery: {
      baseColor: '#0f172a',
      stripeColor: '#06b6d4',
      accentColor: '#3b82f6',
      roofColor: '#1e293b',
    },
  },

  // --- INTEGRAL COACH FACTORY / INDIAN RAILWAYS ---
  {
    id: 'vande-bharat-vb2',
    manufacturerId: 'icf_indian_rail',
    name: 'Vande Bharat 2.0 (Train 18)',
    seriesCode: 'VB-18',
    category: 'Semi-High Speed',
    trackType: 'express',
    maxSpeedKmH: 180,
    passengerCapacity: 1128,
    purchasePrice: 21000000,
    dailyMaintenance: 2400,
    reliabilityScore: 94,
    comfortScore: 92,
    acceleration: 'Very High',
    powerType: 'Electric EMU',
    description: 'Indigenous semi-high-speed electric trainset with 180-degree rotating seats and KAVACH collision avoidance.',
    defaultLivery: {
      baseColor: '#ffffff',
      stripeColor: '#1d4ed8',
      accentColor: '#f97316',
      roofColor: '#64748b',
    },
  },
  {
    id: 'amrit-bharat-express',
    manufacturerId: 'icf_indian_rail',
    name: 'Amrit Bharat Push-Pull Express',
    seriesCode: 'AB-PP',
    category: 'Intercity Commuter',
    trackType: 'commuter',
    maxSpeedKmH: 130,
    passengerCapacity: 1834,
    purchasePrice: 14000000,
    dailyMaintenance: 1700,
    reliabilityScore: 93,
    comfortScore: 82,
    acceleration: 'High',
    powerType: 'Electric EMU',
    description: 'High-density non-AC passenger express with aerodynamic dual WAP-5 locos at both ends.',
    defaultLivery: {
      baseColor: '#ea580c',
      stripeColor: '#7c2d12',
      accentColor: '#facc15',
      roofColor: '#431407',
    },
  },

  // --- STADLER RAIL (SWITZERLAND) ---
  {
    id: 'stadler-kiss',
    manufacturerId: 'stadler',
    name: 'Stadler KISS Double-Decker',
    seriesCode: 'KISS',
    category: 'Regional Express',
    trackType: 'express',
    maxSpeedKmH: 200,
    passengerCapacity: 980,
    purchasePrice: 27000000,
    dailyMaintenance: 3100,
    reliabilityScore: 98,
    comfortScore: 94,
    acceleration: 'High',
    powerType: 'Electric EMU',
    description: 'Comfortably seats hundreds in bi-level air-suspended coaches with generous luggage bays.',
    defaultLivery: {
      baseColor: '#f8fafc',
      stripeColor: '#e11d48',
      accentColor: '#0284c7',
      roofColor: '#334155',
    },
  },
  {
    id: 'stadler-flirt',
    manufacturerId: 'stadler',
    name: 'Stadler FLIRT Fast Commuter',
    seriesCode: 'FLIRT',
    category: 'Intercity Commuter',
    trackType: 'commuter',
    maxSpeedKmH: 160,
    passengerCapacity: 710,
    purchasePrice: 17000000,
    dailyMaintenance: 1950,
    reliabilityScore: 97,
    comfortScore: 89,
    acceleration: 'Very High',
    powerType: 'Electric EMU',
    description: 'Fast Light Intercity and Regional Train with rapid step-free platform access.',
    defaultLivery: {
      baseColor: '#ffffff',
      stripeColor: '#0284c7',
      accentColor: '#10b981',
      roofColor: '#475569',
    },
  },
];

export const PRESET_LIVERIES: LiveryDesign[] = [
  {
    id: 'preset-shinkansen-classic',
    name: 'Shinkansen Classic Pearl & Royal Blue',
    baseColor: '#ffffff',
    primaryStripe: '#0369a1',
    secondaryStripe: '#38bdf8',
    roofColor: '#64748b',
    skirtColor: '#1e293b',
    noseConeColor: '#0284c7',
    windowTint: '#1e293b',
    pattern: 'speed_stripe',
    companyBrandText: 'SHINKANSEN EXPRESS',
    emblemShape: 'wings',
    isDefault: true,
  },
  {
    id: 'preset-fuxing-phoenix',
    name: 'Fuxing Crimson & Imperial Gold',
    baseColor: '#cbd5e1',
    primaryStripe: '#b91c1c',
    secondaryStripe: '#eab308',
    roofColor: '#334155',
    skirtColor: '#0f172a',
    noseConeColor: '#dc2626',
    windowTint: '#0f172a',
    pattern: 'aerowave',
    companyBrandText: 'CHINA RAILWAY',
    emblemShape: 'arrow',
  },
  {
    id: 'preset-vande-bharat',
    name: 'Vande Bharat Sapphire & Saffron',
    baseColor: '#ffffff',
    primaryStripe: '#1e40af',
    secondaryStripe: '#f97316',
    roofColor: '#475569',
    skirtColor: '#172554',
    noseConeColor: '#1d4ed8',
    windowTint: '#0f172a',
    pattern: 'dual_chevron',
    companyBrandText: 'VANDE BHARAT',
    emblemShape: 'circle',
  },
  {
    id: 'preset-ice-german',
    name: 'ICE Pure White & Traffic Red',
    baseColor: '#f8fafc',
    primaryStripe: '#dc2626',
    secondaryStripe: '#475569',
    roofColor: '#94a3b8',
    skirtColor: '#334155',
    noseConeColor: '#dc2626',
    windowTint: '#1e293b',
    pattern: 'minimalist',
    companyBrandText: 'INTERCITY EXPRESS',
    emblemShape: 'wings',
  },
  {
    id: 'preset-stealth-carbon',
    name: 'Stealth Carbon & Cyber Green',
    baseColor: '#0f172a',
    primaryStripe: '#d4f04c',
    secondaryStripe: '#06b6d4',
    roofColor: '#1e293b',
    skirtColor: '#020617',
    noseConeColor: '#d4f04c',
    windowTint: '#020617',
    pattern: 'aerowave',
    companyBrandText: 'TRACKLINE VIP',
    emblemShape: 'diamond',
  },
];

export const INITIAL_WEATHER_CONDITIONS: WeatherCondition[] = [
  {
    type: 'clear',
    title: 'Optimal Clear Skies',
    affectedRegion: 'all',
    severity: 0.1,
    speedImpactPercent: 0,
    delayRiskPercent: 2,
    demandShiftPercent: 5,
    description: 'High visibility and dry rails. Network operating at full rated speeds.',
    activeForDays: 3,
  },
  {
    type: 'monsoon',
    title: 'Southwest Monsoon Torrent',
    affectedRegion: 'south_asia',
    severity: 0.7,
    speedImpactPercent: 20,
    delayRiskPercent: 18,
    demandShiftPercent: -8,
    description: 'Intense rain over the Ganges basin and Konkan corridor. Cautionary speeds in effect.',
    activeForDays: 4,
  },
  {
    type: 'typhoon',
    title: 'Super Typhoon Hagibis',
    affectedRegion: 'east_asia',
    severity: 0.85,
    speedImpactPercent: 35,
    delayRiskPercent: 30,
    demandShiftPercent: -22,
    description: 'Severe coastal gale winds exceeding 120 km/h. Coastal Shinkansen lines slowed.',
    activeForDays: 2,
  },
  {
    type: 'blizzard',
    title: 'Hokkaido Arctic Blizzard',
    affectedRegion: 'east_asia',
    severity: 0.65,
    speedImpactPercent: 25,
    delayRiskPercent: 22,
    demandShiftPercent: -12,
    description: 'Sub-zero temperatures and snow accumulation. Rotary snow blowers deployed.',
    activeForDays: 3,
  },
  {
    type: 'heatwave',
    title: 'Central Plains Heatwave',
    affectedRegion: 'china',
    severity: 0.5,
    speedImpactPercent: 10,
    delayRiskPercent: 8,
    demandShiftPercent: 4,
    description: 'Track steel expansion monitors active across Wuhan-Guangzhou corridor.',
    activeForDays: 3,
  },
];

export const ECONOMIC_EVENTS_CATALOG: EconomicShift[] = [
  {
    id: 'event-tech-expo',
    headline: 'Global Robotics & AI Summit in Tokyo',
    region: 'east_asia',
    demandMultiplier: 1.35,
    maintenanceMultiplier: 1.0,
    daysRemaining: 6,
    description: 'Hundreds of thousands of business delegates flock to Tokyo, boosting Tokaido high-speed demand.',
    positive: true,
  },
  {
    id: 'event-festive-rush',
    headline: 'Great Festive Travel Rush Across South Asia',
    region: 'south_asia',
    demandMultiplier: 1.45,
    maintenanceMultiplier: 1.1,
    daysRemaining: 7,
    description: 'Massive holiday pilgrimage and family migration across Delhi, Howrah, and Varanasi trunks.',
    positive: true,
  },
  {
    id: 'event-green-subsidy',
    headline: 'Clean Rail Green Energy Subsidy',
    region: 'all',
    demandMultiplier: 1.05,
    maintenanceMultiplier: 0.82,
    daysRemaining: 10,
    description: 'Government electric power rebates lower daily track and train operational costs by 18%.',
    positive: true,
  },
  {
    id: 'event-steel-inflation',
    headline: 'Global Rail Steel & Supply Chain Spike',
    region: 'all',
    demandMultiplier: 0.95,
    maintenanceMultiplier: 1.25,
    daysRemaining: 5,
    description: 'Temporary surge in replacement wheelset and catenary copper costs.',
    positive: false,
  },
];
