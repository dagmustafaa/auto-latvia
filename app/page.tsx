"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type Lang = "lv" | "ru" | "en";
type Category = "car" | "moto";
type ListingType = "sale" | "rent";

type DashboardTab =
  | "overview"
  | "listings"
  | "fav_listings"
  | "fav_searches"
  | "messages"
  | "notifications"
  | "settings";

interface ChatMessage {
  id: string;
  created_at: string;
  listing_id: string;
  listing_title: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  body: string;
  is_read: boolean;
}

interface UserNotification {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  body: string;
  is_read: boolean;
}

interface SavedSearch {
  id: string;
  label: string;
  category: "all" | Category;
  listingType: "all" | ListingType;
  brand: string;
  model: string;
  city: string;
}

interface Listing {
  id: string;
  user_id?: string | null;
  seller_name: string;
  seller_phone: string;
  category: Category;
  listing_type?: ListingType;
  brand: string;
  model: string;
  city: string;
  price_eur: number;
  year: number;
  mileage_km: number;
  fuel: string;
  transmission: string;
  body_type: string;
  engine_volume: string;
  ta_valid_until: string;
  plate_number?: string;
  vin?: string;
  badge: string;
  images: string[];
  description_lv: string;
  description_en: string;
}

const CITIES = ["All", "Rīga", "Daugavpils", "Liepāja", "Jelgava", "Ventspils", "Valmiera", "Jūrmala"];

const MODELS_BY_BRAND: Record<Category, Record<string, string[]>> = {
  car: {
    "Alfa Romeo": ["147", "156", "159", "Giulia", "Giulietta", "GT", "MiTo", "Stelvio", "Tonale"],
    Audi: ["80", "100", "A1", "A2", "A3", "A4", "A4 Allroad", "A5", "A6", "A6 Allroad", "A7", "A8", "e-tron", "e-tron GT", "Q2", "Q3", "Q4 e-tron", "Q5", "Q7", "Q8", "R8", "RS3", "RS4", "RS5", "RS6", "RS7", "S3", "S4", "S5", "S6", "S8", "TT"],
    BMW: ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series", "i3", "i4", "i5", "i7", "i8", "iX", "iX1", "iX3", "M2", "M3", "M4", "M5", "M6", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z3", "Z4"],
    Chevrolet: ["Aveo", "Camaro", "Captiva", "Corvette", "Cruze", "Epica", "Equinox", "Malibu", "Orlando", "Spark", "Tahoe", "Trax"],
    Chrysler: ["300C", "300M", "Grand Voyager", "Pacifica", "PT Cruiser", "Sebring", "Town & Country", "Voyager"],
    "Citroën": ["Berlingo", "C1", "C2", "C3", "C3 Aircross", "C4", "C4 Cactus", "C4 Picasso", "C5", "C5 Aircross", "C6", "C8", "DS3", "DS4", "DS5", "Jumper", "Jumpy", "Xsara Picasso"],
    Cupra: ["Ateca", "Born", "Formentor", "Leon", "Tavascan"],
    Dacia: ["Dokker", "Duster", "Jogger", "Lodgy", "Logan", "Sandero", "Spring"],
    Dodge: ["Caliber", "Challenger", "Charger", "Durango", "Journey", "Nitro", "RAM"],
    Fiat: ["500", "500L", "500X", "Bravo", "Doblo", "Ducato", "Freemont", "Grande Punto", "Panda", "Punto", "Scudo", "Tipo"],
    Ford: ["B-Max", "C-Max", "EcoSport", "Edge", "Escape", "Explorer", "F-150", "Fiesta", "Focus", "Fusion", "Galaxy", "Ka", "Kuga", "Mondeo", "Mustang", "Mustang Mach-E", "Puma", "Ranger", "S-Max", "Tourneo", "Transit"],
    Honda: ["Accord", "Civic", "CR-V", "CR-Z", "FR-V", "HR-V", "Insight", "Jazz", "Legend", "Pilot", "Prelude"],
    Hyundai: ["Accent", "Bayon", "Elantra", "Getz", "i10", "i20", "i30", "i40", "Ioniq", "Ioniq 5", "Ioniq 6", "ix20", "ix35", "ix55", "Kona", "Matrix", "Santa Fe", "Sonata", "Terracan", "Tucson", "Veloster"],
    Infiniti: ["EX", "FX", "G", "M", "Q30", "Q50", "Q60", "Q70", "QX50", "QX70"],
    Jaguar: ["E-Pace", "F-Pace", "F-Type", "I-Pace", "S-Type", "X-Type", "XE", "XF", "XJ"],
    Jeep: ["Cherokee", "Commander", "Compass", "Grand Cherokee", "Patriot", "Renegade", "Wrangler"],
    Kia: ["Carens", "Carnival", "Ceed", "Cerato", "EV6", "Niro", "Optima", "Picanto", "ProCeed", "Rio", "Sorento", "Soul", "Sportage", "Stinger", "Stonic", "Venga", "XCeed"],
    "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Freelander", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar"],
    Lexus: ["CT", "ES", "GS", "GX", "IS", "LC", "LS", "LX", "NX", "RC", "RX", "RZ", "UX"],
    Mazda: ["CX-3", "CX-30", "CX-5", "CX-60", "CX-7", "CX-9", "Mazda2", "Mazda3", "Mazda5", "Mazda6", "MX-5", "MX-30", "RX-8"],
    "Mercedes-Benz": ["A-Class", "B-Class", "C-Class", "CL-Class", "CLA", "CLK", "CLS", "E-Class", "EQA", "EQB", "EQC", "EQE", "EQS", "G-Class", "GL-Class", "GLA", "GLB", "GLC", "GLE", "GLK", "GLS", "M-Class", "R-Class", "S-Class", "SL", "SLK", "Sprinter", "V-Class", "Viano", "Vito"],
    Mini: ["Clubman", "Convertible", "Countryman", "Coupe", "One / Cooper", "Paceman"],
    Mitsubishi: ["ASX", "Carisma", "Colt", "Eclipse Cross", "Galant", "Grandis", "L200", "Lancer", "Outlander", "Pajero", "Pajero Sport", "Space Star"],
    Nissan: ["350Z", "370Z", "Almera", "Ariya", "GT-R", "Juke", "Leaf", "Maxima", "Micra", "Murano", "Navara", "Note", "Pathfinder", "Patrol", "Primera", "Pulsar", "Qashqai", "Qashqai+2", "Terrano", "Tiida", "X-Trail"],
    Opel: ["Adam", "Agila", "Ampera", "Antara", "Astra", "Combo", "Corsa", "Crossland", "Frontera", "Grandland", "Insignia", "Meriva", "Mokka", "Movano", "Omega", "Signum", "Tigra", "Vectra", "Vivaro", "Zafira"],
    Peugeot: ["107", "108", "2008", "206", "207", "208", "3008", "306", "307", "308", "4007", "406", "407", "5008", "508", "607", "807", "Boxer", "Expert", "Partner", "RCZ", "Rifter", "Traveller"],
    Porsche: ["718 Boxster", "718 Cayman", "911", "Boxster", "Cayenne", "Cayman", "Macan", "Panamera", "Taycan"],
    Renault: ["Arkana", "Austral", "Captur", "Clio", "Espace", "Fluence", "Grand Scenic", "Kadjar", "Kangoo", "Koleos", "Laguna", "Master", "Megane", "Modus", "Scenic", "Talisman", "Trafic", "Twingo", "Zoe"],
    Saab: ["9-3", "9-5", "900", "9000"],
    Seat: ["Alhambra", "Altea", "Arona", "Ateca", "Cordoba", "Exeo", "Ibiza", "Leon", "Mii", "Tarraco", "Toledo"],
    "Škoda": ["Citigo", "Enyaq", "Fabia", "Kamiq", "Karoq", "Kodiaq", "Octavia", "Rapid", "Roomster", "Scala", "Superb", "Yeti"],
    Smart: ["Forfour", "Fortwo", "Roadster"],
    Subaru: ["BRZ", "Crosstrek", "Forester", "Impreza", "Justy", "Legacy", "Levorg", "Outback", "Solterra", "Tribeca", "WRX", "XV"],
    Suzuki: ["Across", "Alto", "Baleno", "Grand Vitara", "Ignis", "Jimny", "Kizashi", "Liana", "S-Cross", "Splash", "Swace", "Swift", "SX4", "Vitara"],
    Tesla: ["Cybertruck", "Model 3", "Model S", "Model X", "Model Y"],
    Toyota: ["4Runner", "Auris", "Avensis", "Aygo", "bZ4X", "C-HR", "Camry", "Celica", "Corolla", "Corolla Cross", "Corolla Verso", "FJ Cruiser", "GT86", "Highlander", "Hilux", "Land Cruiser", "Prius", "Proace", "RAV4", "Sequoia", "Sienna", "Supra", "Tacoma", "Tundra", "Urban Cruiser", "Verso", "Yaris", "Yaris Cross"],
    Volkswagen: ["Amarok", "Arteon", "Beetle", "Bora", "Caddy", "Caravelle", "CC", "Crafter", "Eos", "Fox", "Golf", "Golf Plus", "Golf Sportsvan", "ID.3", "ID.4", "ID.5", "ID.7", "ID.Buzz", "Jetta", "Lupo", "Multivan", "Passat", "Passat CC", "Phaeton", "Polo", "Scirocco", "Sharan", "T-Cross", "T-Roc", "Taigo", "Tiguan", "Touareg", "Touran", "Transporter", "Up!"],
    Volvo: ["240", "740", "850", "940", "C30", "C40", "C70", "EX30", "EX90", "S40", "S60", "S70", "S80", "S90", "V40", "V50", "V60", "V70", "V90", "XC40", "XC60", "XC70", "XC90"],
  },
  moto: {
    Aprilia: ["Atlantic", "Caponord", "Dorsoduro", "Mana", "Pegaso", "RS 125", "RS 660", "RSV4", "Shiver", "SR 50", "SR GT 125", "SX 125", "Tuareg 660", "Tuono 125", "Tuono 660", "Tuono V4"],
    Benelli: ["502C", "752S", "BN 125", "Imperiale 400", "Leoncino 500", "TRK 502", "TRK 702"],
    "BMW Motorrad": ["C 400 GT", "C 400 X", "C 650 GT", "F 650 GS", "F 700 GS", "F 750 GS", "F 800 GS", "F 800 R", "F 850 GS", "F 900 R", "F 900 XR", "G 310 GS", "G 310 R", "K 1200", "K 1300", "K 1600", "R 1150", "R 1200 GS", "R 1200 R", "R 1200 RT", "R 1250 GS", "R 1250 R", "R 1250 RS", "R 1250 RT", "R 1300 GS", "R nineT", "S 1000 R", "S 1000 RR", "S 1000 XR"],
    CFMoto: ["300NK", "450MT", "450NK", "450SR", "650MT", "650NK", "700CL-X", "800MT"],
    Ducati: ["DesertX", "Diavel", "Hypermotard", "Monster", "Multistrada", "Panigale", "Scrambler", "Streetfighter", "SuperSport"],
    "Harley-Davidson": ["Dyna", "Fat Boy", "Iron 883", "LiveWire", "Nightster", "Pan America", "Road Glide", "Road King", "Softail", "Sportster", "Street 750", "Street Glide", "V-Rod"],
    Honda: ["Africa Twin", "CB1000R", "CB125F", "CB125R", "CB300R", "CB500F", "CB500X", "CB600F Hornet", "CB650R", "CB750 Hornet", "CBF600", "CBR1000RR", "CBR125R", "CBR500R", "CBR600RR", "CBR650R", "CL500", "CMX500 Rebel", "CRF250L", "CRF300L", "Deauville", "Forza 125", "Forza 350", "Gold Wing", "MSX125 Grom", "NC700X", "NC750X", "NT1100", "PCX 125", "SH125", "SH350", "Shadow", "Transalp", "VFR800", "X-ADV"],
    Husqvarna: ["701 Enduro", "701 Supermoto", "FE 350", "FE 450", "Norden 901", "Svartpilen 125", "Svartpilen 401", "TE 300", "Vitpilen 401"],
    Indian: ["Chief", "Chieftain", "FTR", "Scout", "Springfield"],
    Kawasaki: ["ER-6f", "ER-6n", "KLX230", "KLR650", "Ninja 1000SX", "Ninja 125", "Ninja 300", "Ninja 400", "Ninja 650", "Ninja H2", "Ninja ZX-10R", "Ninja ZX-6R", "Versys 1000", "Versys 650", "Versys-X 300", "Vulcan S", "Z1000", "Z125", "Z300", "Z400", "Z650", "Z750", "Z800", "Z900", "Z900RS"],
    Keeway: ["K-Light 125", "RKF 125", "RKV 125", "Superlight 125", "TX 125", "V302C", "Vieste 125", "X-Light 125"],
    KTM: ["125 Duke", "1290 Super Adventure", "1290 Super Duke", "250 EXC", "300 EXC", "390 Adventure", "390 Duke", "450 EXC", "690 Enduro R", "690 SMC R", "790 Adventure", "790 Duke", "890 Adventure", "890 Duke", "RC 125", "RC 390"],
    Kymco: ["Agility 125", "AK 550", "Downtown 350", "Like 125", "People S 125", "Xciting 400"],
    "Moto Guzzi": ["California", "Stelvio", "V100 Mandello", "V7", "V85 TT", "V9"],
    Piaggio: ["Beverly 300", "Beverly 400", "Liberty 125", "Medley 125", "MP3 300", "MP3 500"],
    "Royal Enfield": ["Classic 350", "Continental GT 650", "Himalayan", "Hunter 350", "Interceptor 650", "Meteor 350", "Super Meteor 650"],
    Suzuki: ["Address 110", "Bandit 650", "Bandit 1250", "Boulevard", "Burgman 125", "Burgman 400", "Burgman 650", "DR-Z400", "GSR 600", "GSR 750", "GSX-8S", "GSX-R1000", "GSX-R600", "GSX-R750", "GSX-S1000", "GSX-S750", "Hayabusa", "Intruder", "Katana", "SV650", "V-Strom 1050", "V-Strom 650", "V-Strom 800"],
    Triumph: ["Bonneville", "Daytona 660", "Rocket 3", "Scrambler 900", "Scrambler 1200", "Speed Triple", "Speed Twin", "Street Triple", "Tiger 660", "Tiger 800", "Tiger 900", "Tiger 1200", "Trident 660"],
    Vespa: ["Elettrica", "GTS 125", "GTS 300", "Primavera 50", "Primavera 125", "Sprint 125"],
    Yamaha: ["Aerox 50", "Fazer 600", "FJ-09", "FJR1300", "FZ1", "FZ6", "FZ8", "MT-03", "MT-07", "MT-09", "MT-10", "MT-125", "NMAX 125", "R1", "R3", "R6", "R7", "R125", "Tenere 700", "Tracer 7", "Tracer 9", "WR250F", "WR450F", "X-Max 125", "X-Max 300", "X-Max 400", "XJ6", "XSR125", "XSR700", "XSR900", "XT660", "XV Virago", "XVS DragStar", "YZ250F", "YZ450F"],
  },
};

const PHOTO_PRESETS = [
  {
    label: { lv: "Sedans / Hečbeks", ru: "Седан / Хэтчбек", en: "Sedan / Hatchback" },
    url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: { lv: "Hibrīds / Pilsētas", ru: "Гибрид / Город", en: "Hybrid / City" },
    url: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: { lv: "Universālis / 4x4", ru: "Универсал / 4x4", en: "Wagon / AWD" },
    url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: { lv: "Motocikls", ru: "Мотоцикл", en: "Motorcycle" },
    url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80",
  },
];

const DEMO_LISTINGS: Listing[] = [
  {
    id: "lv-1",
    seller_name: "Māris B.",
    seller_phone: "+37120001122",
    category: "car",
    brand: "Volkswagen",
    model: "Golf",
    city: "Rīga",
    price_eur: 8450,
    year: 2017,
    mileage_km: 168000,
    fuel: "Diesel",
    transmission: "Manual",
    body_type: "Hatchback",
    engine_volume: "1.6 TDI",
    ta_valid_until: "09.2027",
    plate_number: "LV-4821",
    vin: "WVWZZZAUZHP123456",
    badge: "TA 09.2027",
    images: [PHOTO_PRESETS[0].url, PHOTO_PRESETS[1].url, PHOTO_PRESETS[2].url],
    description_lv: "Kopts auto no Rīgas, pilna servisa vēsture, jaunas ziemas riepas.",
    description_en: "Well-kept car from Riga, full service history, fresh winter tires.",
  },
  {
    id: "lv-2",
    listing_type: "rent",
    seller_name: "Elīna K.",
    seller_phone: "+37120003344",
    category: "car",
    brand: "Toyota",
    model: "Corolla",
    city: "Liepāja",
    price_eur: 14900,
    year: 2020,
    mileage_km: 92000,
    fuel: "Hybrid",
    transmission: "Automatic",
    body_type: "Sedan",
    engine_volume: "1.8 Hybrid",
    ta_valid_until: "11.2027",
    plate_number: "MN-9032",
    vin: "SB1K93BE50E098765",
    badge: "TA 11.2027",
    images: [PHOTO_PRESETS[1].url, PHOTO_PRESETS[0].url],
    description_lv: "Ekonomisks hibrīds ikdienai un garākiem braucieniem pa Latviju.",
    description_en: "Economical hybrid for daily commuting and trips across Latvia.",
  },
  {
    id: "lv-3",
    seller_name: "Andris V.",
    seller_phone: "+37120005566",
    category: "car",
    brand: "BMW",
    model: "3 Series",
    city: "Jelgava",
    price_eur: 11600,
    year: 2016,
    mileage_km: 194000,
    fuel: "Diesel",
    transmission: "Automatic",
    body_type: "Wagon",
    engine_volume: "2.0d xDrive",
    ta_valid_until: "06.2027",
    plate_number: "KJ-7714",
    vin: "WBA8H910X0K543210",
    badge: "4x4 • TA 06.2027",
    images: [PHOTO_PRESETS[2].url, PHOTO_PRESETS[0].url, PHOTO_PRESETS[1].url],
    description_lv: "Pilnpiedziņa Latvijas ziemai, ietilpīgs universālis.",
    description_en: "All-wheel drive for Latvian winter, spacious wagon.",
  },
  {
    id: "lv-4",
    seller_name: "Artūrs L.",
    seller_phone: "+37120007788",
    category: "moto",
    brand: "Keeway",
    model: "RKF 125",
    city: "Daugavpils",
    price_eur: 2350,
    year: 2024,
    mileage_km: 4200,
    fuel: "Petrol",
    transmission: "Manual",
    body_type: "Naked",
    engine_volume: "125cc ABS",
    ta_valid_until: "05.2028",
    plate_number: "TH-125",
    vin: "TSYTA01A5R0004321",
    badge: "ABS • Šķidruma dzese",
    images: [PHOTO_PRESETS[3].url, PHOTO_PRESETS[0].url],
    description_lv: "Veikls 125cc motocikls ar ABS un šķidruma dzesēšanu pilsētai.",
    description_en: "Agile 125cc motorcycle with ABS and liquid cooling for city rides.",
  },
];

const LABELS = {
  fuel: {
    Diesel: { lv: "Dīzelis", ru: "Дизель", en: "Diesel" },
    Petrol: { lv: "Benzīns", ru: "Бензин", en: "Petrol" },
    Hybrid: { lv: "Hibrīds", ru: "Гибрид", en: "Hybrid" },
    Electric: { lv: "Elektro", ru: "Электро", en: "Electric" },
  } as Record<string, { lv: string; ru: string; en: string }>,
  transmission: {
    Automatic: { lv: "Automāts", ru: "Автомат", en: "Automatic" },
    Manual: { lv: "Manuālā", ru: "Механика", en: "Manual" },
  } as Record<string, { lv: string; ru: string; en: string }>,
  body: {
    Sedan: { lv: "Sedans", ru: "Седан", en: "Sedan" },
    Hatchback: { lv: "Hečbeks", ru: "Хэтчбек", en: "Hatchback" },
    Wagon: { lv: "Universālis", ru: "Универсал", en: "Wagon" },
    SUV: { lv: "Apvidus (SUV)", ru: "Внедорожник (SUV)", en: "SUV / 4x4" },
    Coupe: { lv: "Kupeja", ru: "Купе", en: "Coupe" },
    Naked: { lv: "Naked / Street", ru: "Naked / Стрит", en: "Naked / Street" },
    Sport: { lv: "Sporta", ru: "Спорт", en: "Sport" },
    Touring: { lv: "Tūrisma / Enduro", ru: "Туризм / Эндуро", en: "Touring / Enduro" },
    Scooter: { lv: "Motorolleris", ru: "Скутер", en: "Scooter" },
  } as Record<string, { lv: string; ru: string; en: string }>,
};

const UI_TEXT = {
  lv: {
    brand: "AutoLatvija",
    heroTitle: "Auto & Moto tirgus Latvijā",
    heroSubtitle: "Filtrē pēc markas, modeļa, cenas, gada, nobraukuma, TA un pilsētas.",
    postBtn: "+ Ielikt sludinājumu",
    myListingsBtn: "Mani sludinājumi",
    savedBtn: "Saglabātie",
    loginBtn: "Ieiet / Reģistrēties",
    logoutBtn: "Iziet",
    accountBtn: "Mans konts",
    dashOverview: "Kopsavilkums",
    dashListingMgmt: "Sludinājumu pārvaldība",
    dashMyListings: "Mani sludinājumi",
    dashFavorites: "Mani favorīti",
    dashFavListings: "Saglabātie sludinājumi",
    dashFavSearches: "Saglabātie meklējumi",
    dashMessaging: "Ziņojumi",
    dashMessages: "Vēstules",
    dashNotifications: "Paziņojumi",
    dashSettings: "Konts un iestatījumi",
    saveSearchBtn: "Saglabāt meklēšanu",
    sendSellerMsgBtn: "Rakstīt pārdevējam",
    msgModerationNotice:
      "Drošības nolūkos ziņojumi tiek saglabāti sistēmā un sūdzību vai pārkāpumu gadījumā tos var pārskatīt platformas administrācija.",
    msgPlaceholder: "Jūsu jautājums par transportlīdzekli...",
    sendBtnShort: "Nosūtīt",
    msgSentNotice: "Ziņa nosūtīta pārdevējam!",
    allCategories: "Visi",
    carsCategory: "Vieglie auto",
    motosCategory: "Motocikli",
    searchPlaceholder: "Meklēt (piem. Golf, 2.0 TDI, Rīga)...",
    allBrands: "Visas markas",
    allModels: "Visi modeļi",
    allCities: "Visas pilsētas",
    allFuels: "Visa degviela",
    allTrans: "Visa kārba",
    minPricePh: "Cena no €",
    maxPricePh: "Cena līdz €",
    minYearPh: "Gads no",
    maxYearPh: "Gads līdz",
    maxKmPh: "Nobraukums līdz (km)",
    resetFilters: "Notīrīt filtrus",
    sortPriceAsc: "Cena: no zemākās",
    sortPriceDesc: "Cena: no augstākās",
    sortYearDesc: "Gads: jaunākie",
    sortKmAsc: "Nobraukums: mazākais",
    resultsCount: (n: number) => `${n} sludinājumi`,
    backToList: "← Atpakaļ uz sludinājumiem",
    sellerLabel: "Pārdevējs",
    yearLabel: "Izlaiduma gads",
    kmLabel: "Nobraukums",
    fuelLabel: "Dzinējs / Degviela",
    transLabel: "Ātrumkārba",
    bodyLabel: "Virsbūves tips",
    taLabel: "Tehniskā apskate (TA)",
    plateLabel: "Valsts numurs",
    vinLabel: "VIN kods",
    similarTitle: "Līdzīgi sludinājumi",
    saveAction: "Saglabāt",
    savedAction: "Saglabāts",
    callSeller: "Zvanīt pārdevējam",
    whatsappSeller: "Rakstīt WhatsApp",
    authSignInTab: "Ieiet kontā",
    authSignUpTab: "Reģistrēties",
    authTitle: "Konts sludinājumu pārvaldībai",
    authDesc: "Reģistrējies ar e-pastu un apstiprini AutoLatvija saiti savā pastkastē.",
    nameLabel: "Vārds",
    emailLabel: "E-pasts",
    phoneAuthLabel: "Tālruņa numurs (+371...)",
    passwordLabel: "Parole (min. 6 simboli)",
    signInSubmit: "Pieslēgties",
    signUpSubmit: "Izveidot kontu",
    verifyNotice: "AutoLatvija apstiprinājuma saite nosūtīta uz e-pastu! Pēc apstiprināšanas spied 'Ieiet kontā'.",
    wizardTitle: "Jauns sludinājums",
    step1Title: "1. Kategorija & Pilsēta",
    step2Title: "2. Izvēlies marku",
    step3Title: "3. Modelis & Tehniskie dati (TA / CSDD)",
    step4Title: "4. Bildes, Kontakti & Apraksts",
    chooseModel: "Izvēlies modeli",
    customModelPlaceholder: "Vai ieraksti citu modeli",
    priceLabel: "Cena (EUR)",
    yearInputLabel: "Gads",
    kmInputLabel: "Nobraukums (km)",
    engineLabel: "Motors (piem. 2.0 TDI / 125cc)",
    taInputLabel: "TA derīga līdz (piem. 10.2027)",
    plateInputLabel: "Valsts numurs (neobligāti)",
    vinInputLabel: "VIN numurs (neobligāti)",
    phoneLabel: "Tālrunis (WhatsApp)",
    addPhotosLabel: "Sludinājuma bildes",
    uploadBoxTitle: "Spied šeit, lai izvēlētos bildes no datora vai telefona",
    uploadBoxSub: "Var izvēlēties vairākas bildes vienlaicīgi (JPG, PNG, WEBP)",
    descLabel: "Apraksts",
    descPlaceholder: "Apraksti stāvokli, apkopi, riepas...",
    backBtn: "Atpakaļ",
    nextBtn: "Tālāk",
    publishBtn: "Publicēt sludinājumu",
    publishingBtn: "Publicē...",
    myPanelTitle: "Mani aktīvie sludinājumi",
    noMyListings: "Tev vēl nav publicētu sludinājumu.",
    noSavedListings: "Nav saglabātu sludinājumu. Spied ♥ uz kartītes, lai saglabātu.",
    deleteBtn: "Dzēst",
    editBtn: "Rediģēt",
    editModalTitle: "Rediģēt sludinājumu",
    saveChangesBtn: "Saglabāt izmaiņas",
    savingChangesBtn: "Saglabā...",
    cancelBtn: "Atcelt",
    privacyBtn: "Privātuma politika",
    termsBtn: "Lietošanas noteikumi",
    contactBtn: "Sazināties",
    cityLabel: "Pilsēta",
    topBtn: "Augšup",
    copyrightText: "© 2026 AutoLatvija — visas tiesības aizsargātas",
    col1Title: "Sludinājumi",
    col1Link1: "Vieglie auto",
    col1Link2: "Motocikli",
    col1Link3: "Saglabātie",
    col2Title: "Informācija",
    col2Link1: "Ielikt sludinājumu",
    col2Link2: "Mani sludinājumi",
    col2Link3: "Mans konts",
    col3Title: "Reģioni",
    col3Link1: "Rīga",
    col3Link2: "Liepāja & Jelgava",
    col3Link3: "Daugavpils & Ventspils",
  },
  ru: {
    brand: "AutoLatvija",
    heroTitle: "Авто и мото рынок Латвии",
    heroSubtitle: "Фильтр по марке, модели, цене, году, пробегу, ТО и городу.",
    postBtn: "+ Подать объявление",
    myListingsBtn: "Мои объявления",
    savedBtn: "Избранное",
    loginBtn: "Войти / Регистрация",
    logoutBtn: "Выйти",
    accountBtn: "Мой кабинет",
    dashOverview: "Обзор",
    dashListingMgmt: "Управление объявлениями",
    dashMyListings: "Мои объявления",
    dashFavorites: "Избранное",
    dashFavListings: "Избранные объявления",
    dashFavSearches: "Избранные поиски",
    dashMessaging: "Сообщения",
    dashMessages: "Сообщения",
    dashNotifications: "Уведомления",
    dashSettings: "Аккаунт и настройки",
    saveSearchBtn: "Сохранить поиск",
    sendSellerMsgBtn: "Написать продавцу",
    msgModerationNotice:
      "В целях безопасности переписка сохраняется и при жалобах или нарушениях может быть проверена администрацией платформы.",
    msgPlaceholder: "Ваш вопрос по автомобилю...",
    sendBtnShort: "Отправить",
    msgSentNotice: "Сообщение отправлено продавцу!",
    allCategories: "Все",
    carsCategory: "Легковые авто",
    motosCategory: "Мотоциклы",
    searchPlaceholder: "Поиск (напр. Golf, 2.0 TDI, Rīga)...",
    allBrands: "Все марки",
    allModels: "Все модели",
    allCities: "Все города",
    allFuels: "Любое топливо",
    allTrans: "Любая КПП",
    minPricePh: "Цена от €",
    maxPricePh: "Цена до €",
    minYearPh: "Год от",
    maxYearPh: "Год до",
    maxKmPh: "Пробег до (км)",
    resetFilters: "Сбросить фильтры",
    sortPriceAsc: "Цена: по возрастанию",
    sortPriceDesc: "Цена: по убыванию",
    sortYearDesc: "Год: сначала новые",
    sortKmAsc: "Пробег: наименьший",
    resultsCount: (n: number) => `${n} объявлений`,
    backToList: "← Назад к объявлениям",
    sellerLabel: "Продавец",
    yearLabel: "Год выпуска",
    kmLabel: "Пробег",
    fuelLabel: "Двигатель / Топливо",
    transLabel: "Коробка передач",
    bodyLabel: "Тип кузова",
    taLabel: "Техосмотр (ТО)",
    plateLabel: "Госномер",
    vinLabel: "VIN код",
    similarTitle: "Похожие объявления",
    saveAction: "В избранное",
    savedAction: "Сохранено",
    callSeller: "Позвонить",
    whatsappSeller: "Написать в WhatsApp",
    authSignInTab: "Вход",
    authSignUpTab: "Регистрация",
    authTitle: "Аккаунт для управления объявлениями",
    authDesc: "Зарегистрируйтесь по e-mail и подтвердите ссылку AutoLatvija в почте.",
    nameLabel: "Имя",
    emailLabel: "E-mail",
    phoneAuthLabel: "Номер телефона (+371...)",
    passwordLabel: "Пароль (мин. 6 символов)",
    signInSubmit: "Войти",
    signUpSubmit: "Создать аккаунт",
    verifyNotice: "Письмо AutoLatvija отправлено! Перейдите по ссылке в почте, затем нажмите 'Вход'.",
    wizardTitle: "Новое объявление",
    step1Title: "1. Категория и город",
    step2Title: "2. Выберите марку",
    step3Title: "3. Модель и характеристики (ТО / CSDD)",
    step4Title: "4. Фото, контакты и описание",
    chooseModel: "Выберите модель",
    customModelPlaceholder: "Или введите другую модель",
    priceLabel: "Цена (EUR)",
    yearInputLabel: "Год",
    kmInputLabel: "Пробег (км)",
    engineLabel: "Двигатель (напр. 2.0 TDI / 125cc)",
    taInputLabel: "ТО годен до (напр. 10.2027)",
    plateInputLabel: "Госномер (необязательно)",
    vinInputLabel: "VIN номер (необязательно)",
    phoneLabel: "Телефон (WhatsApp)",
    addPhotosLabel: "Фотографии",
    uploadBoxTitle: "Нажмите сюда, чтобы выбрать фото с компьютера или телефона",
    uploadBoxSub: "Можно выбрать несколько фото сразу (JPG, PNG, WEBP)",
    descLabel: "Описание",
    descPlaceholder: "Опишите состояние, обслуживание, резину...",
    backBtn: "Назад",
    nextBtn: "Далее",
    publishBtn: "Опубликовать",
    publishingBtn: "Публикация...",
    myPanelTitle: "Мои активные объявления",
    noMyListings: "У вас пока нет опубликованных объявлений.",
    noSavedListings: "Нет сохраненных объявлений. Нажмите ♥ на карточке.",
    deleteBtn: "Удалить",
    editBtn: "Редактировать",
    editModalTitle: "Редактировать объявление",
    saveChangesBtn: "Сохранить",
    savingChangesBtn: "Сохранение...",
    cancelBtn: "Отмена",
    privacyBtn: "Политика конфиденциальности",
    termsBtn: "Условия использования",
    contactBtn: "Связаться",
    cityLabel: "Город",
    topBtn: "Наверх",
    copyrightText: "© 2026 AutoLatvija — все права защищены",
    col1Title: "Объявления",
    col1Link1: "Легковые авто",
    col1Link2: "Мотоциклы",
    col1Link3: "Избранное",
    col2Title: "Разделы",
    col2Link1: "Подать объявление",
    col2Link2: "Мои объявления",
    col2Link3: "Мой кабинет",
    col3Title: "Города",
    col3Link1: "Rīga",
    col3Link2: "Liepāja & Jelgava",
    col3Link3: "Daugavpils & Ventspils",
  },
  en: {
    brand: "AutoLatvija",
    heroTitle: "Car & Moto marketplace in Latvia",
    heroSubtitle: "Filter by brand, model, price, year, mileage, TA inspection, and city.",
    postBtn: "+ Post listing",
    myListingsBtn: "My listings",
    savedBtn: "Saved",
    loginBtn: "Sign in / Register",
    logoutBtn: "Sign out",
    accountBtn: "My Account",
    dashOverview: "Overview",
    dashListingMgmt: "Listing Management",
    dashMyListings: "My Listings",
    dashFavorites: "Favorites",
    dashFavListings: "Favorite Listings",
    dashFavSearches: "Saved Searches",
    dashMessaging: "Messaging",
    dashMessages: "Messages",
    dashNotifications: "Notifications",
    dashSettings: "Account & Settings",
    saveSearchBtn: "Save search",
    sendSellerMsgBtn: "Message Seller",
    msgModerationNotice:
      "For safety and fraud prevention, messages are stored and may be reviewed by platform moderation in case of reports or violations.",
    msgPlaceholder: "Ask the seller a question...",
    sendBtnShort: "Send",
    msgSentNotice: "Message sent to the seller!",
    allCategories: "All",
    carsCategory: "Cars",
    motosCategory: "Motorcycles",
    searchPlaceholder: "Search (e.g. Golf, 2.0 TDI, Riga)...",
    allBrands: "All brands",
    allModels: "All models",
    allCities: "All cities",
    allFuels: "All fuels",
    allTrans: "All gearboxes",
    minPricePh: "Min price €",
    maxPricePh: "Max price €",
    minYearPh: "Min year",
    maxYearPh: "Max year",
    maxKmPh: "Max mileage (km)",
    resetFilters: "Reset filters",
    sortPriceAsc: "Price: low to high",
    sortPriceDesc: "Price: high to low",
    sortYearDesc: "Year: newest first",
    sortKmAsc: "Mileage: lowest first",
    resultsCount: (n: number) => `${n} listings`,
    backToList: "← Back to listings",
    sellerLabel: "Seller",
    yearLabel: "Year",
    kmLabel: "Mileage",
    fuelLabel: "Engine / Fuel",
    transLabel: "Transmission",
    bodyLabel: "Body type",
    taLabel: "Inspection (TA)",
    plateLabel: "License plate",
    vinLabel: "VIN code",
    similarTitle: "Similar listings",
    saveAction: "Save",
    savedAction: "Saved",
    callSeller: "Call seller",
    whatsappSeller: "Message on WhatsApp",
    authSignInTab: "Sign in",
    authSignUpTab: "Register",
    authTitle: "Account for posting & managing ads",
    authDesc: "Register with your email and confirm the AutoLatvija verification link in your inbox.",
    nameLabel: "Name",
    emailLabel: "Email",
    phoneAuthLabel: "Phone number (+371...)",
    passwordLabel: "Password (min. 6 chars)",
    signInSubmit: "Sign in",
    signUpSubmit: "Create account",
    verifyNotice: "AutoLatvija verification email sent! Click the link in your inbox, then sign in.",
    wizardTitle: "New listing",
    step1Title: "1. Category & City",
    step2Title: "2. Choose brand",
    step3Title: "3. Model & Technical specs (TA / CSDD)",
    step4Title: "4. Photos, Contact & Description",
    chooseModel: "Choose model",
    customModelPlaceholder: "Or type another model",
    priceLabel: "Price (EUR)",
    yearInputLabel: "Year",
    kmInputLabel: "Mileage (km)",
    engineLabel: "Engine (e.g. 2.0 TDI / 125cc)",
    taInputLabel: "TA valid until (e.g. 10.2027)",
    plateInputLabel: "License plate (optional)",
    vinInputLabel: "VIN number (optional)",
    phoneLabel: "Phone (WhatsApp)",
    addPhotosLabel: "Listing photos",
    uploadBoxTitle: "Click here to select photos from your computer or phone",
    uploadBoxSub: "You can select multiple photos at once (JPG, PNG, WEBP)",
    descLabel: "Description",
    descPlaceholder: "Describe condition, service, tires...",
    backBtn: "Back",
    nextBtn: "Next",
    publishBtn: "Publish listing",
    publishingBtn: "Publishing...",
    myPanelTitle: "My active listings",
    noMyListings: "You have not published any listings yet.",
    noSavedListings: "No saved listings yet. Click ♥ on any card to save it.",
    deleteBtn: "Delete",
    editBtn: "Edit",
    editModalTitle: "Edit listing",
    saveChangesBtn: "Save changes",
    savingChangesBtn: "Saving...",
    cancelBtn: "Cancel",
    privacyBtn: "Privacy Policy",
    termsBtn: "Terms of Use",
    contactBtn: "Contact",
    cityLabel: "City",
    topBtn: "Top",
    copyrightText: "© 2026 AutoLatvija — all rights reserved",
    col1Title: "Listings",
    col1Link1: "Cars",
    col1Link2: "Motorcycles",
    col1Link3: "Saved",
    col2Title: "Actions",
    col2Link1: "Post listing",
    col2Link2: "My listings",
    col2Link3: "My Account",
    col3Title: "Cities",
    col3Link1: "Rīga",
    col3Link2: "Liepāja & Jelgava",
    col3Link3: "Daugavpils & Ventspils",
  },
};

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.256.59 4.46 1.71 6.404L3.09 28.8l6.566-1.722a12.74 12.74 0 0 0 6.348 1.694h.006c7.058 0 12.798-5.74 12.798-12.8 0-3.42-1.332-6.636-3.75-9.052A12.716 12.716 0 0 0 16.004 3.2zm0 23.41h-.004a10.6 10.6 0 0 1-5.404-1.48l-.388-.23-3.896 1.022 1.04-3.798-.252-.402a10.575 10.575 0 0 1-1.622-5.642c0-5.854 4.764-10.618 10.624-10.618 2.836 0 5.502 1.106 7.506 3.112a10.548 10.548 0 0 1 3.11 7.51c0 5.856-4.764 10.626-10.614 10.626zm5.826-7.954c-.32-.16-1.89-.932-2.182-1.038-.292-.106-.506-.16-.718.16-.214.318-.826 1.038-1.012 1.252-.186.212-.372.24-.692.08-.32-.16-1.35-.498-2.572-1.588-.95-.848-1.592-1.896-1.778-2.214-.186-.32-.02-.492.14-.652.144-.142.32-.372.48-.558.16-.186.212-.32.32-.532.106-.214.052-.4-.028-.558-.08-.16-.718-1.732-.984-2.37-.26-.622-.524-.538-.718-.548l-.612-.01c-.214 0-.56.08-.852.4-.292.318-1.118 1.092-1.118 2.662s1.144 3.088 1.304 3.3c.16.214 2.252 3.438 5.456 4.822.762.33 1.358.526 1.822.674.766.244 1.462.21 2.012.128.614-.092 1.89-.772 2.156-1.518.266-.746.266-1.384.186-1.518-.08-.132-.292-.212-.612-.372z" />
    </svg>
  );
}

function getListingNumber(id: string): number {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const positive = Math.abs(hash);
  return 10000000 + (positive % 80000000);
}

function getAdHref(item: Listing) {
  const slug = (item.brand + "-" + item.model + "-" + item.year)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return "#ad=" + slug + "--" + encodeURIComponent(item.id);
}

function parseAdHash(rawHash: string): string | null {
  const h = rawHash || "";
  if (h.startsWith("#ad=")) {
    const parts = h.slice(4).split("--");
    const last = decodeURIComponent(parts[parts.length - 1] || "").trim();
    return last || null;
  }
  if (h.startsWith("#listing-")) {
    const val = decodeURIComponent(h.replace("#listing-", "")).trim();
    return val || null;
  }
  return null;
}

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("lv");
  const [dbListings, setDbListings] = useState<Listing[]>([]);

  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const [authPhone, setAuthPhone] = useState("+371");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [isMyListingsOpen, setIsMyListingsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<DashboardTab>("overview");

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [newCategory, setNewCategory] = useState<Category>("car");
  const [newCity, setNewCity] = useState("Rīga");
  const [newBrand, setNewBrand] = useState("BMW");
  const [newModel, setNewModel] = useState("3 Series");
  const [newPrice, setNewPrice] = useState("9500");
  const [newYear, setNewYear] = useState("2019");
  const [newKm, setNewKm] = useState("135000");
  const [newFuel, setNewFuel] = useState("Diesel");
  const [newTrans, setNewTrans] = useState("Automatic");
  const [newBody, setNewBody] = useState("Wagon");
  const [newEngine, setNewEngine] = useState("2.0 TDI");
  const [newTa, setNewTa] = useState("10.2027");
  const [newPlate, setNewPlate] = useState("");
  const [newVin, setNewVin] = useState("");
  const [newPhone, setNewPhone] = useState("+3712");
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([PHOTO_PRESETS[0].url]);
  const [newDesc, setNewDesc] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [onlySaved, setOnlySaved] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState<"all" | Category>("all");
  const [vehicleTreeSubcat, setVehicleTreeSubcat] = useState<string>("all");
  const [showAllVehicleSubcats, setShowAllVehicleSubcats] = useState<boolean>(false);
  const [filterBrand, setFilterBrand] = useState("All");
  const [filterModel, setFilterModel] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [filterFuel, setFilterFuel] = useState("All");
  const [filterTrans, setFilterTrans] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [maxKm, setMaxKm] = useState("");
  const [query, setQuery] = useState("");
  const [adNumberQuery, setAdNumberQuery] = useState("");
  const [sortBy, setSortBy] = useState<"priceAsc" | "priceDesc" | "yearDesc" | "kmAsc">("yearDesc");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailPhotoIndex, setDetailPhotoIndex] = useState(0);
  const [hoverPhotoIndex, setHoverPhotoIndex] = useState<Record<string, number>>({});

  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editKm, setEditKm] = useState("");
  const [editCity, setEditCity] = useState("Rīga");
  const [editTa, setEditTa] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [messagesList, setMessagesList] = useState<ChatMessage[]>([]);
  const [notificationsList, setNotificationsList] = useState<UserNotification[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const [chatSentFeedback, setChatSentFeedback] = useState("");
  const [chatReplyText, setChatReplyText] = useState<Record<string, string>>({});
  const [profileNameInput, setProfileNameInput] = useState("");
  const [profilePhoneInput, setProfilePhoneInput] = useState("");
  const [profileSaveStatus, setProfileSaveStatus] = useState("");
  const [settingsSection, setSettingsSection] = useState<"personal" | "notifications" | "security">("personal");
  const [displayNameMode, setDisplayNameMode] = useState<"short" | "full">("short");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [recoveryEmailInput, setRecoveryEmailInput] = useState("");
  const [accountVerified, setAccountVerified] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<Record<string, { email: boolean; push: boolean }>>({
    pendingApproval: { email: false, push: false },
    dateUpdated: { email: true, push: true },
    published: { email: true, push: true },
    rejected: { email: true, push: true },
    expiring3Days: { email: true, push: true },
    expired: { email: true, push: true },
    unpublished: { email: false, push: true },
    dopingApplied: { email: true, push: true },
    dopingExpired: { email: true, push: true },
    after7DaysExpired: { email: true, push: true },
    newMessage: { email: true, push: true },
    draftReminder: { email: true, push: false },
  });

  const t = UI_TEXT[lang];

  const unreadNotificationsCount = useMemo(
    () => notificationsList.filter((n) => !n.is_read).length,
    [notificationsList]
  );

  async function loadListings() {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDbListings(data as Listing[]);
    }
  }

  async function loadAccountData(uid: string) {
    if (!uid) return;
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
      .order("created_at", { ascending: false });
    if (msgs) setMessagesList(msgs as ChatMessage[]);

    const { data: notifs } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (notifs) setNotificationsList(notifs as UserNotification[]);
  }

  useEffect(() => {
    loadListings();

    try {
      const rawSaved = localStorage.getItem("autolatvija_saved_ids");
      if (rawSaved) setSavedIds(JSON.parse(rawSaved));
    } catch {}

    try {
      const rawSearches = localStorage.getItem("autolatvija_saved_searches");
      if (rawSearches) setSavedSearches(JSON.parse(rawSearches));
    } catch {}

    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      if (u) {
        setUserId(u.id);
        setUserEmail(u.email ?? "");
        setUserName((u.user_metadata?.name as string) || (u.email?.split("@")[0] ?? "user"));
      } else {
        setUserId(null);
        setUserEmail("");
        setUserName("");
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        setUserId(u.id);
        setUserEmail(u.email ?? "");
        setUserName((u.user_metadata?.name as string) || (u.email?.split("@")[0] ?? "user"));
      } else {
        setUserId(null);
        setUserEmail("");
        setUserName("");
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setMessagesList([]);
      setNotificationsList([]);
      return;
    }
    setProfileNameInput((user.user_metadata?.name as string) || "");
    setProfilePhoneInput((user.user_metadata?.phone as string) || "");
    setAvatarUrl((user.user_metadata?.avatar_url as string) || "");
    setRecoveryEmailInput((user.user_metadata?.recovery_email as string) || "");
    setAccountVerified(Boolean(user.user_metadata?.verified));
    if (user.user_metadata?.display_name_mode === "full") setDisplayNameMode("full");
    loadAccountData(user.id);
  }, [user]);

  useEffect(() => {
    function syncFromHash() {
      const parsedId = parseAdHash(window.location.hash);
      setSelectedId(parsedId);
      setDetailPhotoIndex(0);
      setChatSentFeedback("");
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  function closeListingDetail() {
    setSelectedId(null);
    setChatSentFeedback("");
    if (window.location.hash) {
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  }

  function toggleSave(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("autolatvija_saved_ids", JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function resetAllFilters() {
    setCategoryFilter("all");
    setFilterBrand("All");
    setFilterModel("All");
    setSelectedCity("All");
    setFilterFuel("All");
    setFilterTrans("All");
    setMinPrice("");
    setMaxPrice("");
    setMinYear("");
    setMaxYear("");
    setMaxKm("");
    setQuery("");
    setAdNumberQuery("");
    setOnlySaved(false);
  }

  function handleSaveCurrentSearch() {
    const parts = [
      categoryFilter !== "all" ? categoryFilter.toUpperCase() : null,
      filterBrand !== "All" ? filterBrand : null,
      filterModel !== "All" ? filterModel : null,
      selectedCity !== "All" ? selectedCity : null,
    ].filter(Boolean);

    const entry: SavedSearch = {
      id: String(Date.now()),
      label: parts.length > 0 ? parts.join(" • ") : "All Vehicles",
      category: categoryFilter,
      listingType: "all",
      brand: filterBrand,
      model: filterModel,
      city: selectedCity,
    };

    const next = [entry, ...savedSearches].slice(0, 15);
    setSavedSearches(next);
    try {
      localStorage.setItem("autolatvija_saved_searches", JSON.stringify(next));
    } catch {}

    if (userId) {
      setAccountTab("fav_searches");
      setIsAccountOpen(true);
    } else {
      setIsAuthOpen(true);
    }
  }

  function handleDeleteSavedSearch(id: string) {
    const next = savedSearches.filter((s) => s.id !== id);
    setSavedSearches(next);
    try {
      localStorage.setItem("autolatvija_saved_searches", JSON.stringify(next));
    } catch {}
  }

  async function handleSendMessageToSeller(
    listing: Listing,
    customBody?: string,
    customReceiverId?: string
  ) {
    setChatSentFeedback("");
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    const textBody = (customBody ?? chatDraft).trim();
    const targetReceiver = customReceiverId || listing.user_id;
    if (!textBody || !targetReceiver) return;

    const senderDisplay = (user.user_metadata?.name as string) || user.email?.split("@")[0] || "User";
    const titleStr = `${listing.brand} ${listing.model} (${listing.year})`;

    const { error } = await supabase.from("messages").insert({
      listing_id: listing.id,
      listing_title: titleStr,
      sender_id: user.id,
      sender_name: senderDisplay,
      receiver_id: targetReceiver,
      body: textBody,
    });

    if (!error) {
      await supabase.from("notifications").insert({
        user_id: targetReceiver,
        title: `Jauna ziņa / New message: ${titleStr}`,
        body: `${senderDisplay}: ${textBody.slice(0, 80)}`,
      });
      if (!customBody) {
        setChatDraft("");
        setChatSentFeedback(t.msgSentNotice);
      }
      await loadAccountData(user.id);
    }
  }

  async function handleMarkNotificationsRead() {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);
    setNotificationsList((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setProfileSaveStatus("");
    const { error } = await supabase.auth.updateUser({
      data: {
        name: profileNameInput.trim(),
        phone: profilePhoneInput.trim(),
      },
    });
    if (error) {
      setProfileSaveStatus(error.message);
    } else {
      setProfileSaveStatus("✓ Saved / Saglabāts");
    }
  }

  const allListings = useMemo(() => [...dbListings, ...DEMO_LISTINGS], [dbListings]);

  const myListings = useMemo(() => {
    if (!userId) return [];
    return dbListings.filter((item) => item.user_id === userId);
  }, [dbListings, userId]);

  const savedListings = useMemo(() => {
    return allListings.filter((item) => savedIds.includes(item.id));
  }, [allListings, savedIds]);

  const activeListing = useMemo(() => {
    if (!selectedId) return null;
    return allListings.find((item) => item.id === selectedId) ?? null;
  }, [allListings, selectedId]);

  useEffect(() => {
    if (activeListing) {
      document.title = `${activeListing.brand} ${activeListing.model} (${activeListing.year}) — AutoLatvija`;
    } else {
      document.title = "AutoLatvija — Auto & Moto tirgus Latvijā";
    }
  }, [activeListing]);

  const similarListings = useMemo(() => {
    if (!activeListing) return [];
    return allListings
      .filter((item) => item.id !== activeListing.id && item.category === activeListing.category)
      .slice(0, 4);
  }, [allListings, activeListing]);

  const filterBrandOptions = useMemo(() => {
    if (categoryFilter === "car") return Object.keys(MODELS_BY_BRAND.car);
    if (categoryFilter === "moto") return Object.keys(MODELS_BY_BRAND.moto);
    return Array.from(
      new Set([...Object.keys(MODELS_BY_BRAND.car), ...Object.keys(MODELS_BY_BRAND.moto)])
    );
  }, [categoryFilter]);

  const filterModelOptions = useMemo(() => {
    if (filterBrand === "All") return [];
    return Array.from(
      new Set([
        ...(MODELS_BY_BRAND.car[filterBrand] ?? []),
        ...(MODELS_BY_BRAND.moto[filterBrand] ?? []),
      ])
    );
  }, [filterBrand]);

  const availableBrands = useMemo(() => Object.keys(MODELS_BY_BRAND[newCategory]), [newCategory]);

  const availableModels = useMemo(
    () => MODELS_BY_BRAND[newCategory][newBrand] ?? [],
    [newCategory, newBrand]
  );

  const filtered = useMemo(() => {
    const minP = minPrice ? Number(minPrice) : null;
    const maxP = maxPrice ? Number(maxPrice) : null;
    const minY = minYear ? Number(minYear) : null;
    const maxY = maxYear ? Number(maxYear) : null;
    const maxK = maxKm ? Number(maxKm) : null;

    const base = allListings.filter((item) => {
      if (onlySaved && !savedIds.includes(item.id)) return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (filterBrand !== "All" && item.brand !== filterBrand) return false;
      if (filterModel !== "All" && item.model !== filterModel) return false;
      if (selectedCity !== "All" && item.city !== selectedCity) return false;
      if (filterFuel !== "All" && item.fuel !== filterFuel) return false;
      if (filterTrans !== "All" && item.transmission !== filterTrans) return false;
      if (minP !== null && !Number.isNaN(minP) && item.price_eur < minP) return false;
      if (maxP !== null && !Number.isNaN(maxP) && item.price_eur > maxP) return false;
      if (minY !== null && !Number.isNaN(minY) && item.year < minY) return false;
      if (maxY !== null && !Number.isNaN(maxY) && item.year > maxY) return false;
      if (maxK !== null && !Number.isNaN(maxK) && item.mileage_km > maxK) return false;

      const searchBlob = `${item.brand} ${item.model} ${item.engine_volume} ${item.city} ${
        item.plate_number ?? ""
      }`.toLowerCase();
      if (query.trim() !== "" && !searchBlob.includes(query.trim().toLowerCase())) return false;
      if (adNumberQuery.trim() !== "") {
        const cleanAdQuery = adNumberQuery.replace(/^#/, "").trim();
        const adNoStr = String(getListingNumber(item.id));
        if (!adNoStr.includes(cleanAdQuery)) return false;
      }
      return true;
    });

    return [...base].sort((a, b) => {
      if (sortBy === "priceAsc") return a.price_eur - b.price_eur;
      if (sortBy === "priceDesc") return b.price_eur - a.price_eur;
      if (sortBy === "kmAsc") return a.mileage_km - b.mileage_km;
      return b.year - a.year;
    });
  }, [
    allListings,
    onlySaved,
    savedIds,
    categoryFilter,
    filterBrand,
    filterModel,
    selectedCity,
    filterFuel,
    filterTrans,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    maxKm,
    query,
    sortBy,
  ]);

  function handlePostClick() {
    if (!userId) {
      setAuthError("");
      setAuthMessage("");
      setIsAuthOpen(true);
      return;
    }
    const defaultBrand = Object.keys(MODELS_BY_BRAND[newCategory])[0];
    setStep(1);
    setNewBrand(defaultBrand);
    setNewModel(MODELS_BY_BRAND[newCategory][defaultBrand]?.[0] ?? "");
    setNewFiles([]);
    setNewPreviewUrls([newCategory === "moto" ? PHOTO_PRESETS[3].url : PHOTO_PRESETS[0].url]);
    setNewPlate("");
    setNewVin("");
    setNewDesc("");
    setIsWizardOpen(true);
  }

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthMessage("");
    setAuthLoading(true);

    try {
      if (authMode === "signup") {
        const cleanPhone = authPhone.trim();
        const digits = cleanPhone.replace(/[^0-9]/g, "");
        if (digits.length < 8) {
          setAuthError("Ievadiet derīgu tālruņa numuru / Enter a valid phone number.");
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            emailRedirectTo: "https://auto-latvia.vercel.app",
            data: {
              name: authName.trim() || authEmail.split("@")[0],
              phone: cleanPhone,
            },
          },
        });
        if (error) {
          setAuthError(error.message);
          return;
        }
        if (data.session) {
          setIsAuthOpen(false);
          return;
        }
        setAuthMessage(t.verifyNotice);
        setAuthMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });
        if (error) {
          setAuthError(error.message);
          return;
        }
        setIsAuthOpen(false);
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Connection error.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setIsMyListingsOpen(false);
    setIsAccountOpen(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    setNewFiles((prev) => [...prev, ...selected]);
    const localUrls = selected.map((f) => URL.createObjectURL(f));
    setNewPreviewUrls((prev) => [...prev, ...localUrls]);
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setIsPublishing(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of newFiles) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("listing-photos")
          .upload(path, file);

        if (!uploadErr) {
          const { data: pub } = supabase.storage.from("listing-photos").getPublicUrl(path);
          if (pub?.publicUrl) uploadedUrls.push(pub.publicUrl);
        }
      }

      const presetUrls = newPreviewUrls.filter((u) => u.startsWith("https://"));
      const finalImages =
        uploadedUrls.length > 0 || presetUrls.length > 0
          ? [...uploadedUrls, ...presetUrls]
          : [newCategory === "moto" ? PHOTO_PRESETS[3].url : PHOTO_PRESETS[0].url];

      const { error: insertErr } = await supabase.from("listings").insert({
        user_id: userId,
        seller_name: userName || userEmail.split("@")[0],
        seller_phone: newPhone.trim() || "+37120000000",
        category: newCategory,
        brand: newBrand,
        model: newModel.trim() || "Model",
        city: newCity,
        price_eur: Number(newPrice) || 5000,
        year: Number(newYear) || 2020,
        mileage_km: Number(newKm) || 100000,
        fuel: newFuel,
        transmission: newTrans,
        body_type: newBody,
        engine_volume: newEngine.trim() || "2.0",
        ta_valid_until: newTa.trim() || "TA derīga",
        plate_number: newPlate.trim().toUpperCase(),
        vin: newVin.trim().toUpperCase(),
        badge: newTa.trim() ? `TA ${newTa.trim()}` : "TA derīga",
        images: finalImages,
        description_lv: newDesc.trim() || "Papildu informācija pa tālruni vai WhatsApp.",
        description_en: newDesc.trim() || "Additional details by phone or WhatsApp.",
      });

      if (!insertErr) {
        await loadListings();
        setIsWizardOpen(false);
        setStep(1);
      }
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleDeleteListing(id: string) {
    await supabase.from("listings").delete().eq("id", id);
    await loadListings();
  }

  function openEditModal(item: Listing) {
    setEditingListing(item);
    setEditPrice(String(item.price_eur));
    setEditYear(String(item.year));
    setEditKm(String(item.mileage_km));
    setEditCity(item.city);
    setEditTa(item.ta_valid_until);
    setEditDesc(item.description_lv || item.description_en || "");
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingListing) return;
    setIsSavingEdit(true);

    try {
      const nextPrice = Number(editPrice) || editingListing.price_eur;
      const nextYear = Number(editYear) || editingListing.year;
      const nextKm = Number(editKm) || editingListing.mileage_km;
      const nextTa = editTa.trim() || editingListing.ta_valid_until;
      const nextDesc = editDesc.trim();

      await supabase
        .from("listings")
        .update({
          price_eur: nextPrice,
          year: nextYear,
          mileage_km: nextKm,
          city: editCity,
          ta_valid_until: nextTa,
          badge: nextTa ? `TA ${nextTa}` : editingListing.badge,
          description_lv: nextDesc,
          description_en: nextDesc,
        })
        .eq("id", editingListing.id);

      await loadListings();
      setEditingListing(null);
    } finally {
      setIsSavingEdit(false);
    }
  }

  function handleCardMouseMove(
    e: React.MouseEvent<HTMLDivElement>,
    listingId: string,
    photoCount: number
  ) {
    if (photoCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 0.999);
    setHoverPhotoIndex((prev) => ({ ...prev, [listingId]: Math.floor(ratio * photoCount) }));
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0f17] text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0f17]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => {
              closeListingDetail();
              setOnlySaved(false);
              setIsAccountOpen(false);
            }}
            className="flex items-center gap-2.5 text-left cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-sm font-black text-slate-950">
              LV
            </div>
            <span className="text-base font-extrabold tracking-tight text-white">{t.brand}</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                closeListingDetail();
                setIsAccountOpen(false);
                setOnlySaved((prev) => !prev);
              }}
              className={`rounded-xl border px-3 py-2 text-xs font-bold cursor-pointer ${
                onlySaved
                  ? "border-rose-400 bg-rose-500/20 text-rose-200"
                  : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
              }`}
            >
              ♥ {t.savedBtn} ({savedIds.length})
            </button>

            {userId ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    closeListingDetail();
                    setAccountTab("overview");
                    setIsAccountOpen(true);
                  }}
                  className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-400/20 cursor-pointer"
                >
                  {t.accountBtn} ({messagesList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setIsMyListingsOpen(true)}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 cursor-pointer"
                >
                  {t.myListingsBtn} ({myListings.length})
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-xl border border-white/10 px-2.5 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  {t.logoutBtn}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthError("");
                  setAuthMessage("");
                  setIsAuthOpen(true);
                }}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 cursor-pointer"
              >
                {t.loginBtn}
              </button>
            )}

            <button
              type="button"
              onClick={handlePostClick}
              className="rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-300 cursor-pointer"
            >
              {t.postBtn}
            </button>

            <div className="flex rounded-xl border border-white/15 bg-white/5 p-0.5 text-xs font-bold">
              {(["lv", "ru", "en"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={`rounded-lg px-2 py-1 uppercase cursor-pointer ${
                    lang === code ? "bg-white text-slate-950" : "text-slate-300"
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        {user && (
          <aside className="w-full shrink-0 border-b border-white/10 bg-[#0b0f17] lg:w-64 lg:border-b-0 lg:border-r">
            <div className="p-4">
              <div className="mb-3 rounded-2xl border border-white/10 bg-[#121826] p-3">
                <div className="truncate text-sm font-extrabold text-white">
                  {(user.user_metadata?.name as string) || user.email}
                </div>
                <div className="truncate text-[11px] text-slate-400">{user.email}</div>
              </div>

              <nav className="space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    closeListingDetail();
                    setAccountTab("overview");
                    setIsAccountOpen(true);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 font-bold cursor-pointer ${
                    isAccountOpen && accountTab === "overview"
                      ? "bg-amber-400 text-slate-950"
                      : "text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <span>{t.dashOverview}</span>
                </button>

                <div className="pt-3 pb-1 px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  {t.dashListingMgmt}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeListingDetail();
                    setAccountTab("listings");
                    setIsAccountOpen(true);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 font-semibold cursor-pointer ${
                    isAccountOpen && accountTab === "listings"
                      ? "bg-amber-400 text-slate-950 font-bold"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span>{t.dashMyListings}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                    {myListings.length}
                  </span>
                </button>

                <div className="pt-3 pb-1 px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  {t.dashFavorites}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeListingDetail();
                    setAccountTab("fav_listings");
                    setIsAccountOpen(true);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 font-semibold cursor-pointer ${
                    isAccountOpen && accountTab === "fav_listings"
                      ? "bg-amber-400 text-slate-950 font-bold"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span>{t.dashFavListings}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                    {savedListings.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeListingDetail();
                    setAccountTab("fav_searches");
                    setIsAccountOpen(true);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 font-semibold cursor-pointer ${
                    isAccountOpen && accountTab === "fav_searches"
                      ? "bg-amber-400 text-slate-950 font-bold"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span>{t.dashFavSearches}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                    {savedSearches.length}
                  </span>
                </button>

                <div className="pt-3 pb-1 px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  {t.dashMessaging}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeListingDetail();
                    setAccountTab("messages");
                    setIsAccountOpen(true);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 font-semibold cursor-pointer ${
                    isAccountOpen && accountTab === "messages"
                      ? "bg-amber-400 text-slate-950 font-bold"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span>{t.dashMessages}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                    {messagesList.length}
                  </span>
                </button>

                <div className="pt-3 pb-1 px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  {t.dashNotifications}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeListingDetail();
                    setAccountTab("notifications");
                    setIsAccountOpen(true);
                    handleMarkNotificationsRead();
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 font-semibold cursor-pointer ${
                    isAccountOpen && accountTab === "notifications"
                      ? "bg-amber-400 text-slate-950 font-bold"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span>{t.dashNotifications}</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] text-white">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                <div className="pt-3 pb-1 px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  {t.dashSettings}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeListingDetail();
                    setAccountTab("settings");
                    setIsAccountOpen(true);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 font-semibold cursor-pointer ${
                    isAccountOpen && accountTab === "settings"
                      ? "bg-amber-400 text-slate-950 font-bold"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span>{t.dashSettings}</span>
                </button>

                {isAccountOpen && (
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => setIsAccountOpen(false)}
                      className="flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-bold text-amber-300 hover:bg-white/10 cursor-pointer"
                    >
                      {t.backToList.replace("← ", "")}
                    </button>
                  </div>
                )}
              </nav>
            </div>
          </aside>
        )}

        <div className="min-w-0 flex-1">
          {isAccountOpen && user ? (
            <section className="mx-auto max-w-5xl px-4 py-6">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-lg font-extrabold text-white">{t.accountBtn}</h2>
                <button
                  type="button"
                  onClick={() => setIsAccountOpen(false)}
                  className="rounded-xl border border-white/15 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10 cursor-pointer"
                >
                  {t.backToList}
                </button>
              </div>

              {accountTab === "overview" && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div
                    onClick={() => setAccountTab("listings")}
                    className="cursor-pointer rounded-2xl border border-white/10 bg-[#121826] p-4 hover:border-amber-400/50"
                  >
                    <div className="text-xs text-slate-400">{t.dashMyListings}</div>
                    <div className="mt-1 text-2xl font-black text-amber-400">{myListings.length}</div>
                  </div>
                  <div
                    onClick={() => setAccountTab("fav_listings")}
                    className="cursor-pointer rounded-2xl border border-white/10 bg-[#121826] p-4 hover:border-amber-400/50"
                  >
                    <div className="text-xs text-slate-400">{t.dashFavListings}</div>
                    <div className="mt-1 text-2xl font-black text-white">{savedListings.length}</div>
                  </div>
                  <div
                    onClick={() => setAccountTab("messages")}
                    className="cursor-pointer rounded-2xl border border-white/10 bg-[#121826] p-4 hover:border-amber-400/50"
                  >
                    <div className="text-xs text-slate-400">{t.dashMessages}</div>
                    <div className="mt-1 text-2xl font-black text-emerald-400">
                      {messagesList.length}
                    </div>
                  </div>
                  <div
                    onClick={() => setAccountTab("notifications")}
                    className="cursor-pointer rounded-2xl border border-white/10 bg-[#121826] p-4 hover:border-amber-400/50"
                  >
                    <div className="text-xs text-slate-400">{t.dashNotifications}</div>
                    <div className="mt-1 text-2xl font-black text-rose-400">
                      {notificationsList.length}
                    </div>
                  </div>
                </div>
              )}

              {accountTab === "listings" && (
                <div className="space-y-3">
                  {myListings.length === 0 ? (
                    <p className="text-xs text-slate-400">{t.noMyListings}</p>
                  ) : (
                    myListings.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#121826] p-3"
                      >
                        <div>
                          <div className="text-sm font-bold text-white">
                            {item.brand} {item.model} ({item.year})
                          </div>
                          <div className="text-xs text-amber-400">
                            €{item.price_eur.toLocaleString("en-US")} • {item.city}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="rounded-xl border border-white/15 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10 cursor-pointer"
                        >
                          {t.editBtn}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {accountTab === "fav_listings" && (
                <div className="space-y-3">
                  {savedListings.length === 0 ? (
                    <p className="text-xs text-slate-400">{t.noSavedListings}</p>
                  ) : (
                    savedListings.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#121826] p-3"
                      >
                        <div>
                          <div className="text-sm font-bold text-white">
                            {item.brand} {item.model} ({item.year})
                          </div>
                          <div className="text-xs text-amber-400">
                            €{item.price_eur.toLocaleString("en-US")} • {item.city}
                          </div>
                        </div>
                        <a
                          href={getAdHref(item)}
                          onClick={() => setIsAccountOpen(false)}
                          className="rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-slate-950 cursor-pointer"
                        >
                          View
                        </a>
                      </div>
                    ))
                  )}
                </div>
              )}

              {accountTab === "fav_searches" && (
                <div className="space-y-3">
                  {savedSearches.length === 0 ? (
                    <p className="text-xs text-slate-400">No saved searches yet.</p>
                  ) : (
                    savedSearches.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#121826] p-3"
                      >
                        <div className="text-xs font-bold text-white">{s.label}</div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCategoryFilter(s.category);
                              setFilterBrand(s.brand);
                              setFilterModel(s.model);
                              setSelectedCity(s.city);
                              setIsAccountOpen(false);
                            }}
                            className="rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-slate-950 cursor-pointer"
                          >
                            Apply
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSavedSearch(s.id)}
                            className="rounded-xl border border-rose-500/40 px-2.5 py-1.5 text-xs font-bold text-rose-300 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {accountTab === "messages" && (
                <div className="space-y-3">
                  {messagesList.length === 0 ? (
                    <p className="text-xs text-slate-400">No messages yet.</p>
                  ) : (
                    messagesList.map((m) => {
                      const otherUserId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
                      const relatedListing = allListings.find((l) => l.id === m.listing_id);
                      return (
                        <div
                          key={m.id}
                          className="rounded-2xl border border-white/10 bg-[#121826] p-3.5"
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="font-bold text-amber-400">{m.listing_title}</span>
                            <span>
                              {m.sender_name} • {new Date(m.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs text-white">{m.body}</p>
                          {relatedListing && (
                            <div className="mt-2.5 flex gap-2">
                              <input
                                type="text"
                                value={chatReplyText[m.id] || ""}
                                onChange={(e) =>
                                  setChatReplyText((prev) => ({ ...prev, [m.id]: e.target.value }))
                                }
                                placeholder={t.msgPlaceholder}
                                className="flex-1 rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-1.5 text-xs text-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const txt = chatReplyText[m.id] || "";
                                  if (!txt.trim()) return;
                                  handleSendMessageToSeller(relatedListing, txt, otherUserId);
                                  setChatReplyText((prev) => ({ ...prev, [m.id]: "" }));
                                }}
                                className="rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-slate-950 cursor-pointer"
                              >
                                {t.sendBtnShort}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {accountTab === "notifications" && (
                <div className="space-y-2.5">
                  {notificationsList.length === 0 ? (
                    <p className="text-xs text-slate-400">No notifications yet.</p>
                  ) : (
                    notificationsList.map((n) => (
                      <div
                        key={n.id}
                        className="rounded-2xl border border-white/10 bg-[#121826] p-3.5"
                      >
                        <div className="text-xs font-bold text-amber-400">{n.title}</div>
                        <div className="mt-1 text-xs text-slate-300">{n.body}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {accountTab === "settings" && (
                <form onSubmit={handleUpdateProfile} className="max-w-md space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300">{t.nameLabel}</label>
                    <input
                      type="text"
                      value={profileNameInput}
                      onChange={(e) => setProfileNameInput(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">
                      {t.phoneAuthLabel}
                    </label>
                    <input
                      type="tel"
                      value={profilePhoneInput}
                      onChange={(e) => setProfilePhoneInput(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2 text-xs text-white"
                    />
                  </div>
                  {profileSaveStatus && (
                    <div className="text-xs font-bold text-emerald-400">{profileSaveStatus}</div>
                  )}
                  <button
                    type="submit"
                    className="rounded-xl bg-amber-400 px-5 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-300 cursor-pointer"
                  >
                    {t.saveChangesBtn}
                  </button>
                </form>
              )}
            </section>
          ) : activeListing ? (
            <main className="mx-auto max-w-5xl px-4 py-6">
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={closeListingDetail}
                  className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 cursor-pointer"
                >
                  {t.backToList}
                </button>

                <button
                  type="button"
                  onClick={(e) => toggleSave(e, activeListing.id)}
                  className={`rounded-xl border px-3.5 py-2 text-xs font-bold cursor-pointer ${
                    savedIds.includes(activeListing.id)
                      ? "border-rose-400 bg-rose-500/20 text-rose-200"
                      : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  {savedIds.includes(activeListing.id) ? `♥ ${t.savedAction}` : `♡ ${t.saveAction}`}
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121826]">
                <div className="relative h-72 w-full bg-slate-950 sm:h-96">
                  <img
                    src={activeListing.images[detailPhotoIndex] ?? activeListing.images[0]}
                    alt={`${activeListing.brand} ${activeListing.model}`}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-4 top-4 rounded-lg bg-slate-950/85 px-3 py-1 text-xs font-semibold text-emerald-300">
                    {activeListing.badge}
                  </span>
                </div>

                {activeListing.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto border-b border-white/10 bg-[#0b0f17] p-3">
                    {activeListing.images.map((imgUrl, idx) => (
                      <button
                        key={`${imgUrl}-${idx}`}
                        type="button"
                        onClick={() => setDetailPhotoIndex(idx)}
                        className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border cursor-pointer ${
                          detailPhotoIndex === idx ? "border-amber-400" : "border-white/10 opacity-65"
                        }`}
                      >
                        <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        {activeListing.brand} • {activeListing.city}
                      </span>
                      <h1 className="mt-1 text-2xl font-extrabold text-white">
                        {activeListing.brand} {activeListing.model} ({activeListing.engine_volume})
                      </h1>
                    </div>
                    <div className="text-2xl font-black text-amber-400">
                      €{activeListing.price_eur.toLocaleString("en-US")}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-[#0b0f17] p-4 text-xs sm:grid-cols-3 lg:grid-cols-6">
                    <div>
                      <span className="block text-slate-400">{t.yearLabel}</span>
                      <strong className="mt-0.5 block text-sm text-white">{activeListing.year}</strong>
                    </div>
                    <div>
                      <span className="block text-slate-400">{t.kmLabel}</span>
                      <strong className="mt-0.5 block text-sm text-white">
                        {activeListing.mileage_km.toLocaleString("en-US")} km
                      </strong>
                    </div>
                    <div>
                      <span className="block text-slate-400">{t.fuelLabel}</span>
                      <strong className="mt-0.5 block text-sm text-white">
                        {activeListing.engine_volume} (
                        {LABELS.fuel[activeListing.fuel]?.[lang] ?? activeListing.fuel})
                      </strong>
                    </div>
                    <div>
                      <span className="block text-slate-400">{t.transLabel}</span>
                      <strong className="mt-0.5 block text-sm text-white">
                        {LABELS.transmission[activeListing.transmission]?.[lang] ??
                          activeListing.transmission}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-slate-400">{t.bodyLabel}</span>
                      <strong className="mt-0.5 block text-sm text-white">
                        {LABELS.body[activeListing.body_type]?.[lang] ?? activeListing.body_type}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-slate-400">{t.taLabel}</span>
                      <strong className="mt-0.5 block text-sm text-emerald-400">
                        {activeListing.ta_valid_until}
                      </strong>
                    </div>
                  </div>

                  {(activeListing.plate_number || activeListing.vin) && (
                    <div className="mt-3 flex flex-wrap gap-5 rounded-xl border border-white/10 bg-[#0b0f17] px-4 py-3 text-xs">
                      <div>
                      <span className="text-slate-400">
                        {lang === "lv"
                          ? "Sludinājuma Nr.: "
                          : lang === "ru"
                          ? "№ объявления: "
                          : "Ad No.: "}
                      </span>
                      <strong className="rounded bg-amber-400/15 px-2 py-0.5 font-mono font-extrabold text-amber-300">
                        {getListingNumber(activeListing.id)}
                      </strong>
                    </div>
                    {activeListing.plate_number && (
                        <div>
                          <span className="text-slate-400">{t.plateLabel}: </span>
                          <strong className="rounded bg-white/10 px-2 py-0.5 font-mono text-white">
                            {activeListing.plate_number}
                          </strong>
                        </div>
                      )}
                      {activeListing.vin && (
                        <div>
                          <span className="text-slate-400">{t.vinLabel}: </span>
                          <strong className="font-mono text-slate-200">{activeListing.vin}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="mt-5 text-sm leading-relaxed text-slate-300">
                    {lang === "en" ? activeListing.description_en : activeListing.description_lv}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                    <div className="text-xs">
                      <span className="text-slate-400">{t.sellerLabel}: </span>
                      <strong className="text-sm text-white">{activeListing.seller_name}</strong>
                      <span className="ml-2 text-slate-400">({activeListing.seller_phone})</span>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      <a
                        href={`tel:${activeListing.seller_phone}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition cursor-pointer"
                      >
                        <span>📞</span>
                        <span>{t.callSeller}</span>
                      </a>
                      <a
                        href={`https://wa.me/${activeListing.seller_phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-md shadow-[#25D366]/20 hover:bg-[#20bd5a] transition cursor-pointer"
                      >
                        <WhatsAppIcon className="h-4 w-4 text-slate-950" />
                        <span>{t.whatsappSeller}</span>
                      </a>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-[#0b0f17] p-4">
                    <div className="text-xs font-extrabold text-amber-400">
                      {t.sendSellerMsgBtn}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">{t.msgModerationNotice}</p>

                    {activeListing.user_id ? (
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={chatDraft}
                          onChange={(e) => setChatDraft(e.target.value)}
                          placeholder={t.msgPlaceholder}
                          className="flex-1 rounded-xl border border-white/15 bg-[#121826] px-3.5 py-2 text-xs text-white placeholder-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendMessageToSeller(activeListing)}
                          className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-300 cursor-pointer"
                        >
                          {t.sendBtnShort}
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2.5 text-[11px] text-slate-400">
                        Demo listing — use Phone or WhatsApp above to contact the seller directly.
                      </div>
                    )}

                    {chatSentFeedback && (
                      <div className="mt-2 text-xs font-bold text-emerald-400">
                        {chatSentFeedback}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {/* Görsel 1 tarzı Güvenlik İpuçları kutusu */}
                <div className="rounded-xl border border-white/15 bg-[#121826] p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500/20 text-xs text-sky-400">
                      🛡️
                    </span>
                    <span>
                      {lang === "lv"
                        ? "Drošības padomi"
                        : lang === "ru"
                        ? "Советы по безопасности"
                        : "Security Tips"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    {lang === "lv"
                      ? "Nepārskaitiet avansu vai naudu, pirms neesat klātienē apskatījis transportlīdzekli."
                      : lang === "ru"
                      ? "Не переводите предоплату или деньги, не осмотрев транспортное средство лично."
                      : "Do not pay a deposit or send money before inspecting the vehicle in person."}
                  </p>
                  <div className="mt-1.5 text-xs text-slate-400">
                    <span>
                      {lang === "lv"
                        ? "Plašākai informācijai "
                        : lang === "ru"
                        ? "Подробнее "
                        : "For more details "}
                    </span>
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-sky-400 hover:underline"
                    >
                      {lang === "lv"
                        ? "spiediet šeit."
                        : lang === "ru"
                        ? "нажмите здесь."
                        : "click here."}
                    </a>
                  </div>
                </div>

                {/* Görsel 2 tarzı kullanıcı içeriği sorumluluk ve yasal uyarı kutusu */}
                <div className="rounded-xl border border-dashed border-white/20 bg-[#0e1420] px-4 py-3 text-[11px] leading-relaxed text-slate-400">
                  {lang === "lv"
                    ? `Visas ${t.brand} vietnē lietotāju ievietotās informācijas, viedokļu un datu pareizība, pilnīgums un atbilstība normatīvajiem aktiem ir paša lietotāja atbildība. ${t.brand} neuzņemas atbildību par satura neprecizitātēm vai pārkāpumiem. Jautājumu gadījumā sazinieties ar sludinājuma autoru.`
                    : lang === "ru"
                    ? `Вся ответственность за достоверность, полноту и законность информации, мнений и сведений, размещённых пользователями на ${t.brand}, лежит на авторе объявления. ${t.brand} не несёт ответственности за неточности или нарушения. По всем вопросам обращайтесь к продавцу.`
                    : `All responsibility for the accuracy, completeness, and legal compliance of content, opinions, and details posted by users on ${t.brand} belongs to the listing author. ${t.brand} accepts no liability for inaccuracies or violations. For questions, contact the seller.`}
                </div>
              </div>

              {similarListings.length > 0 && (
                <section className="mt-8">
                  <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-slate-300">
                    {t.similarTitle}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {similarListings.map((sim) => (
                      <a
                        key={sim.id}
                        href={getAdHref(sim)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#121826] transition hover:border-amber-400/50"
                      >
                        <img
                          src={sim.images[0]}
                          alt={`${sim.brand} ${sim.model}`}
                          className="h-32 w-full object-cover"
                        />
                        <div className="p-3">
                          <div className="text-[11px] font-bold text-amber-400">
                            {sim.brand} • {sim.year}
                          </div>
                          <div className="truncate text-sm font-bold text-white">{sim.model}</div>
                          <div className="mt-1 flex items-center justify-between text-xs">
                            <span className="text-slate-400">
                              {sim.mileage_km.toLocaleString("en-US")} km
                            </span>
                            <span className="font-black text-amber-400">
                              €{sim.price_eur.toLocaleString("en-US")}
                            </span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </main>
          ) : (
            <>
              <section className="border-b border-white/10 bg-[#0e1420]">
                <div className="mx-auto max-w-7xl px-4 py-5">
                  <div className="text-center">
                    <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                      {t.heroTitle}
                    </h1>
                    <p className="mt-1 text-xs text-slate-400 sm:text-sm">{t.heroSubtitle}</p>
                  </div>
                  {/* AUTOLATVIJA_HERO_BANNER */}
                  <div className="mx-auto mb-5 max-w-5xl overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-r from-[#0f172a] via-[#172554] to-[#0f172a] p-5 shadow-2xl sm:p-7">
                    <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                      <div className="space-y-3">
                        <div className="inline-flex items-center gap-2.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-1.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-xs font-black text-slate-950">
                            LV
                          </span>
                          <span className="text-sm font-black tracking-tight text-white">
                            AutoLatvija
                          </span>
                          <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                            {lang === "lv"
                              ? "100% BEZ MAKSAS"
                              : lang === "ru"
                              ? "100% БЕСПЛАТНО"
                              : "100% FREE"}
                          </span>
                        </div>

                        <h2 className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
                          {lang === "lv"
                            ? "Ievieto savu auto vai moto sludinājumu PILNĪBĀ BEZ MAKSAS visā Latvijā!"
                            : lang === "ru"
                            ? "Разместите объявление об авто или мото ПОЛНОСТЬЮ БЕСПЛАТНО по всей Латвии!"
                            : "Post your car or moto ad COMPLETELY FREE across Latvia!"}
                        </h2>

                        <p className="max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
                          {lang === "lv"
                            ? "Pārdod savu automašīnu vai motociklu visā Latvijā bez maksas par sludinājuma ievietošanu, bez slēptām komisijām un ar tiešu saziņu WhatsApp vai ziņojumos."
                            : lang === "ru"
                            ? "Продавайте авто или мотоцикл по всей Латвии без платы за публикацию, без скрытых комиссий и с прямой связью в WhatsApp или чате."
                            : "Sell your car or motorcycle across Latvia with zero listing fees, no hidden commissions, and instant buyer contact via WhatsApp or in-app chat."}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-bold">
                          <span className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-amber-300">
                            ✓ {lang === "lv" ? "0.00 € par sludinājumu" : lang === "ru" ? "0.00 € за объявление" : "€0.00 listing fee"}
                          </span>
                          <span className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-emerald-300">
                            ✓ {lang === "lv" ? "Bezmaksas rediģēšana" : lang === "ru" ? "Бесплатное редактирование" : "Free editing anytime"}
                          </span>
                          <span className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sky-300">
                            ✓ {lang === "lv" ? "Tiešs kontakts ar pircēju" : lang === "ru" ? "Прямой контакт с покупателем" : "Direct buyer contact"}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                        <button
                          type="button"
                          onClick={handlePostClick}
                          className="rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-400/20 transition hover:bg-amber-300 cursor-pointer"
                        >
                          {t.postBtn} →
                        </button>
                        <span className="text-center text-[11px] font-semibold text-slate-400">
                          {lang === "lv"
                            ? "Publicē 1 minūtē • Bez kartes"
                            : lang === "ru"
                            ? "Публикация за 1 мин • Без карты"
                            : "Publish in 1 min • No card needed"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mx-auto mt-4 max-w-4xl rounded-2xl border border-white/10 bg-[#121826] p-4 shadow-lg">
                    {/* Üst Başlık ve Adım Yolu (Kategori > Marka > Model) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-[11px] font-black text-white">
                          ◎
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryFilter("all");
                            setVehicleTreeSubcat("all");
                            setFilterBrand("All");
                            setFilterModel("All");
                          }}
                          className="font-extrabold text-sky-400 hover:underline cursor-pointer"
                        >
                          {lang === "lv" ? "Transports" : lang === "ru" ? "Транспорт" : "Vehicles"}
                        </button>

                        {vehicleTreeSubcat !== "all" && (
                          <>
                            <span className="text-slate-500">›</span>
                            <button
                              type="button"
                              onClick={() => {
                                setFilterBrand("All");
                                setFilterModel("All");
                              }}
                              className="font-bold text-sky-400 hover:underline cursor-pointer"
                            >
                              {vehicleTreeSubcat}
                            </button>
                          </>
                        )}

                        {filterBrand !== "All" && (
                          <>
                            <span className="text-slate-500">›</span>
                            <button
                              type="button"
                              onClick={() => setFilterModel("All")}
                              className="font-bold text-sky-400 hover:underline cursor-pointer"
                            >
                              {filterBrand}
                            </button>
                          </>
                        )}

                        {filterModel !== "All" && (
                          <>
                            <span className="text-slate-500">›</span>
                            <span className="font-extrabold text-amber-400">{filterModel}</span>
                          </>
                        )}
                      </div>

                      {(vehicleTreeSubcat !== "all" || filterBrand !== "All" || filterModel !== "All") && (
                        <button
                          type="button"
                          onClick={() => {
                            if (filterModel !== "All") {
                              setFilterModel("All");
                            } else if (filterBrand !== "All") {
                              setFilterBrand("All");
                            } else {
                              setCategoryFilter("all");
                              setVehicleTreeSubcat("all");
                            }
                          }}
                          className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:bg-white/10 cursor-pointer"
                        >
                          {t.backBtn}
                        </button>
                      )}
                    </div>

                    {/* ADIM 1: Baltık & Letonya Taşıt Kategorileri (sayısız) */}
                    {vehicleTreeSubcat === "all" && filterBrand === "All" && (
                      <div className="mt-3">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3 md:grid-cols-4">
                          {(
                            [
                              { key: "car", cat: "car" as const, label: { lv: "Vieglie auto", ru: "Легковые авто", en: "Cars" } },
                              { key: "suv", cat: "car" as const, label: { lv: "Apvidus, SUV & Pickup", ru: "Внедорожники, SUV & Пикапы", en: "Off-road, SUV & Pickup" } },
                              { key: "electric", cat: "car" as const, leaf: true, label: { lv: "Elektroauto", ru: "Электромобили", en: "Electric Vehicles" } },
                              { key: "moto", cat: "moto" as const, label: { lv: "Motocikli", ru: "Мотоциклы", en: "Motorcycles" } },
                              { key: "minivan", cat: "car" as const, label: { lv: "Miniveni & Furgoni", ru: "Минивэны и фургоны", en: "Minivan & Panel Van" } },
                              { key: "commercial", cat: "car" as const, label: { lv: "Komerctransports", ru: "Коммерческий транспорт", en: "Commercial Vehicles" } },
                              { key: "rent", cat: "all" as const, label: { lv: "Nomas auto", ru: "Аренда авто", en: "Rental Vehicles" } },
                              { key: "marine", cat: "all" as const, label: { lv: "Ūdens transports", ru: "Водный транспорт", en: "Marine Vehicles" } },
                              { key: "damaged", cat: "all" as const, label: { lv: "Bojāti auto", ru: "Битые авто", en: "Damaged Vehicles" } },
                              { key: "caravan", cat: "all" as const, label: { lv: "Kemperi", ru: "Кемперы", en: "Caravans & Campers" } },
                              { key: "classic", cat: "all" as const, label: { lv: "Klasiskie auto", ru: "Ретро авто", en: "Classic Cars" } },
                              { key: "atv", cat: "moto" as const, label: { lv: "ATV & UTV", ru: "ATV & UTV", en: "ATV & UTV" } },
                            ] as const
                          )
                            .slice(0, showAllVehicleSubcats ? 12 : 8)
                            .map((node) => (
                              <button
                                key={node.key}
                                type="button"
                                onClick={() => {
                                  setCategoryFilter(node.cat);
                                  setVehicleTreeSubcat(node.label[lang]);
                                  setFilterBrand("All");
                                  setFilterModel("All");
                                }}
                                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-left font-semibold text-sky-400 hover:bg-white/5 hover:text-amber-300 cursor-pointer"
                              >
                                <span>{node.label[lang]}</span>
                                {"leaf" in node && node.leaf && <span>🌿</span>}
                              </button>
                            ))}
                        </div>

                        <div className="mt-2.5 flex justify-center border-t border-white/10 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAllVehicleSubcats((prev) => !prev)}
                            className="text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
                          >
                            {showAllVehicleSubcats
                              ? lang === "lv"
                                ? "Aizvērt ▲"
                                : lang === "ru"
                                ? "Свернуть ▲"
                                : "Close ▲"
                              : lang === "lv"
                              ? "Visi ▼"
                              : lang === "ru"
                              ? "Все ▼"
                              : "Show all ▼"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ADIM 2: Marka Seçimi (Baltık pazarı) */}
                    {vehicleTreeSubcat !== "all" && filterBrand === "All" && (
                      <div className="mt-3">
                        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {t.allBrands}
                        </div>
                        <div className="grid max-h-48 grid-cols-2 gap-1.5 overflow-y-auto text-xs sm:grid-cols-4 md:grid-cols-5">
                          {filterBrandOptions.map((brandName) => (
                            <button
                              key={brandName}
                              type="button"
                              onClick={() => {
                                setFilterBrand(brandName);
                                setFilterModel("All");
                              }}
                              className="rounded-lg px-2 py-1.5 text-left font-semibold text-sky-400 hover:bg-white/5 hover:text-amber-300 cursor-pointer"
                            >
                              {brandName}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ADIM 3: Model Seçimi (Modele kadar yeterli) */}
                    {filterBrand !== "All" && (
                      <div className="mt-3">
                        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {filterBrand} — {t.allModels}
                        </div>
                        <div className="grid max-h-48 grid-cols-2 gap-1.5 overflow-y-auto text-xs sm:grid-cols-4 md:grid-cols-5">
                          {filterModelOptions.map((modelName) => (
                            <button
                              key={modelName}
                              type="button"
                              onClick={() => setFilterModel(modelName)}
                              className={`rounded-lg px-2 py-1.5 text-left font-semibold cursor-pointer ${
                                filterModel === modelName
                                  ? "bg-amber-400 font-extrabold text-slate-950"
                                  : "text-sky-400 hover:bg-white/5 hover:text-amber-300"
                              }`}
                            >
                              {modelName}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  

                  <div className="mt-4 grid gap-2 rounded-t-xl border border-b-0 border-white/10 bg-[#121826] p-2.5 sm:grid-cols-2 lg:grid-cols-6">
                    <select
                      value={filterBrand}
                      onChange={(e) => {
                        setFilterBrand(e.target.value);
                        setFilterModel("All");
                      }}
                      className="rounded-lg border border-white/10 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                    >
                      <option value="All">{t.allBrands}</option>
                      {filterBrandOptions.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filterModel}
                      disabled={filterBrand === "All"}
                      onChange={(e) => setFilterModel(e.target.value)}
                      className="rounded-lg border border-white/10 bg-[#0b0f17] px-3 py-2 text-xs text-white disabled:opacity-50"
                    >
                      <option value="All">{t.allModels}</option>
                      {filterModelOptions.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="rounded-lg border border-white/10 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                    >
                      {CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city === "All" ? t.allCities : city}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filterFuel}
                      onChange={(e) => setFilterFuel(e.target.value)}
                      className="rounded-lg border border-white/10 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                    >
                      <option value="All">{t.allFuels}</option>
                      {Object.keys(LABELS.fuel).map((f) => (
                        <option key={f} value={f}>
                          {LABELS.fuel[f][lang]}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filterTrans}
                      onChange={(e) => setFilterTrans(e.target.value)}
                      className="rounded-lg border border-white/10 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                    >
                      <option value="All">{t.allTrans}</option>
                      {Object.keys(LABELS.transmission).map((tr) => (
                        <option key={tr} value={tr}>
                          {LABELS.transmission[tr][lang]}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="rounded-lg border border-white/10 bg-[#0b0f17] px-3 py-2 text-xs text-white placeholder-slate-500"
                    />
                  </div>

                  <div className="grid gap-2 rounded-b-xl border border-white/10 bg-[#121826] p-2.5 sm:grid-cols-2 lg:grid-cols-8">
                    <input
                      type="number"
                      min={0}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder={t.minPricePh}
                      className="rounded-lg border border-white/10 bg-[#0b0f17] px-3 py-2 text-xs text-white placeholder-slate-500"
                    />
                    <input
                      type="number"
                      min={0}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder={t.maxPricePh}
                      className="rounded-lg border border-white/10 bg-[#0b0f17] px-3 py-2 text-xs text-white placeholder-slate-500"
                    />
                    <input
                      type="number"
                      min={1970}
                      max={2027}
                      value={minYear}
                      onChange={(e) => setMinYear(e.target.value)}
                      placeholder={t.minYearPh}
                      className="rounded-lg border border-white/10 bg-[#0b0f17] px-3 py-2 text-xs text-white placeholder-slate-500"
                    />
                    <input
                      type="number"
                      min={1970}
                      max={2027}
                      value={maxYear}
                      onChange={(e) => setMaxYear(e.target.value)}
                      placeholder={t.maxYearPh}
                      className="rounded-lg border border-white/10 bg-[#0b0f17] px-3 py-2 text-xs text-white placeholder-slate-500"
                    />
                    <input
                      type="number"
                      min={0}
                      step={5000}
                      value={maxKm}
                      onChange={(e) => setMaxKm(e.target.value)}
                      placeholder={t.maxKmPh}
                      className="rounded-lg border border-white/10 bg-[#0b0f17] px-3 py-2 text-xs text-white placeholder-slate-500"
                    />
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as "priceAsc" | "priceDesc" | "yearDesc" | "kmAsc")
                      }
                      className="rounded-lg border border-white/10 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                    >
                      <option value="yearDesc">{t.sortYearDesc}</option>
                      <option value="priceAsc">{t.sortPriceAsc}</option>
                      <option value="priceDesc">{t.sortPriceDesc}</option>
                      <option value="kmAsc">{t.sortKmAsc}</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleSaveCurrentSearch}
                      className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-400/20 cursor-pointer"
                    >
                      ★ {t.saveSearchBtn}
                    </button>
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 cursor-pointer"
                    >
                      {t.resetFilters}
                    </button>
                  </div>
                </div>
              </section>

              <main className="mx-auto max-w-7xl px-4 py-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t.resultsCount(filtered.length)}
                  </span>
                </div>

                {filtered.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-[#121826] py-12 text-center text-xs text-slate-400">
                    {onlySaved ? t.noSavedListings : "0"}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((item) => {
                      const activeIdx = hoverPhotoIndex[item.id] ?? 0;
                      const currentSrc = item.images[activeIdx] ?? item.images[0];
                      const isSaved = savedIds.includes(item.id);

                      return (
                        <a
                          key={item.id}
                          href={getAdHref(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#121826] transition hover:border-amber-400/50"
                        >
                          <div
                            onMouseMove={(e) => handleCardMouseMove(e, item.id, item.images.length)}
                            onMouseLeave={() =>
                              setHoverPhotoIndex((prev) => ({ ...prev, [item.id]: 0 }))
                            }
                            className="relative h-36 w-full overflow-hidden bg-slate-950"
                          >
                            <img
                              src={currentSrc}
                              alt={`${item.brand} ${item.model}`}
                              className="h-full w-full object-cover"
                            />
                            <span className="absolute left-2 top-2 rounded bg-slate-950/85 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                              {item.badge}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => toggleSave(e, item.id)}
                              aria-label="Save listing"
                              className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/85 text-xs transition cursor-pointer ${
                                isSaved ? "text-rose-400" : "text-slate-300 hover:text-white"
                              }`}
                            >
                              {isSaved ? "♥" : "♡"}
                            </button>

                            {item.images.length > 1 && (
                              <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/60 px-2 py-0.5">
                                {item.images.map((_, i) => (
                                  <span
                                    key={i}
                                    className={`h-1 w-3 rounded-full ${
                                      activeIdx === i ? "bg-amber-400" : "bg-white/35"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="p-3.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-[11px] font-bold text-amber-400/90">
                                  {item.brand} • {item.engine_volume}
                                </div>
                                <h2 className="truncate text-sm font-bold text-white group-hover:text-amber-300">
                                  {item.model}
                                </h2>
                              </div>
                              <span className="shrink-0 text-base font-black text-amber-400">
                                €{item.price_eur.toLocaleString("en-US")}
                              </span>
                            </div>

                            <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px] text-slate-400">
                              <span>{item.year}</span>
                              <span>{item.mileage_km.toLocaleString("en-US")} km</span>
                              <span>{item.city}</span>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </main>
            </>
          )}
        </div>
      </div>

      <footer className="relative mt-10 border-t border-white/10 bg-[#090d14] text-xs text-slate-400">
        {/* FOOTER_LEGAL_DISCLAIMER */}
        <div className="mx-auto max-w-7xl px-4 pt-6">
          <div className="rounded-xl border border-dashed border-white/20 bg-[#0e1420] px-4 py-3 text-[11px] leading-relaxed text-slate-400">
            {lang === "lv"
              ? `Visas ${t.brand} vietnē lietotāju ievietotās informācijas, viedokļu un datu pareizība, pilnīgums un atbilstība normatīvajiem aktiem ir paša lietotāja atbildība. ${t.brand} neuzņemas atbildību par satura neprecizitātēm vai pārkāpumiem. Jautājumu gadījumā sazinieties ar sludinājuma autoru.`
              : lang === "ru"
              ? `Вся ответственность за достоверность, полноту и законность информации, мнений и сведений, размещённых пользователями на ${t.brand}, лежит на авторе объявления. ${t.brand} не несёт ответственности за неточности или нарушения. По всем вопросам обращайтесь к продавцу.`
              : `All responsibility for the accuracy, completeness, and legal compliance of content, opinions, and details posted by users on ${t.brand} belongs to the listing author. ${t.brand} accepts no liability for inaccuracies or violations. For questions, contact the seller.`}
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-4 py-8 sm:flex-row">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-amber-400 text-[11px] font-black text-slate-950">
                LV
              </span>
              <span className="font-extrabold">{t.brand}</span>
            </div>
            <p className="text-[11px] text-slate-500">{t.copyrightText}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="space-y-1.5">
              <div className="font-bold text-slate-200">{t.col1Title}</div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    closeListingDetail();
                    setIsAccountOpen(false);
                    setOnlySaved(false);
                    setCategoryFilter("car");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-amber-400 cursor-pointer"
                >
                  {t.col1Link1}
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    closeListingDetail();
                    setIsAccountOpen(false);
                    setOnlySaved(false);
                    setCategoryFilter("moto");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-amber-400 cursor-pointer"
                >
                  {t.col1Link2}
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    closeListingDetail();
                    setIsAccountOpen(false);
                    setOnlySaved(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-amber-400 cursor-pointer"
                >
                  {t.col1Link3}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="font-bold text-slate-200">{t.col2Title}</div>
              <div>
                <button
                  type="button"
                  onClick={handlePostClick}
                  className="hover:text-amber-400 cursor-pointer"
                >
                  {t.col2Link1}
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => (userId ? setIsMyListingsOpen(true) : setIsAuthOpen(true))}
                  className="hover:text-amber-400 cursor-pointer"
                >
                  {t.col2Link2}
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (userId) {
                      closeListingDetail();
                      setAccountTab("overview");
                      setIsAccountOpen(true);
                    } else {
                      setIsAuthOpen(true);
                    }
                  }}
                  className="hover:text-amber-400 cursor-pointer"
                >
                  {t.col2Link3}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="font-bold text-slate-200">{t.col3Title}</div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    closeListingDetail();
                    setIsAccountOpen(false);
                    setSelectedCity("Rīga");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-amber-400 cursor-pointer"
                >
                  {t.col3Link1}
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    closeListingDetail();
                    setIsAccountOpen(false);
                    setSelectedCity("Liepāja");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-amber-400 cursor-pointer"
                >
                  {t.col3Link2}
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    closeListingDetail();
                    setIsAccountOpen(false);
                    setSelectedCity("Daugavpils");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-amber-400 cursor-pointer"
                >
                  {t.col3Link3}
                </button>
              </div>
              <div className="pt-1.5 border-t border-white/10 space-y-1">
                <div>
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-400 cursor-pointer"
                  >
                    {t.privacyBtn}
                  </a>
                </div>
                <div>
                  <a
                    href="/agreement"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-400 cursor-pointer"
                  >
                    {t.termsBtn}
                  </a>
                </div>
                <div>
                  <a
                    href="/contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-400 cursor-pointer"
                  >
                    {t.contactBtn}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
          className="fixed bottom-5 right-5 z-30 flex flex-col items-center justify-center rounded-xl border border-white/15 bg-[#121826]/95 px-3 py-2 text-[11px] font-bold text-white shadow-lg hover:border-amber-400 hover:text-amber-300 cursor-pointer"
        >
          <span>↑</span>
          <span>{t.topBtn}</span>
        </button>
      </footer>

      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleAuthSubmit}
            className="w-full max-w-md rounded-2xl border border-white/15 bg-[#121826] p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white">{t.authTitle}</h3>
                <p className="mt-1 text-xs text-slate-400">{t.authDesc}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthOpen(false)}
                className="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-xl bg-[#0b0f17] p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthMode("signin")}
                className={`rounded-lg py-1.5 cursor-pointer ${
                  authMode === "signin" ? "bg-amber-400 text-slate-950" : "text-slate-300"
                }`}
              >
                {t.authSignInTab}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className={`rounded-lg py-1.5 cursor-pointer ${
                  authMode === "signup" ? "bg-amber-400 text-slate-950" : "text-slate-300"
                }`}
              >
                {t.authSignUpTab}
              </button>
            </div>

            {authMessage && (
              <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                {authMessage}
              </div>
            )}
            {authError && (
              <div className="mt-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
                {authError}
              </div>
            )}

            <div className="mt-4 space-y-3">
              {authMode === "signup" && (
                <div>
                  <label className="block text-xs font-bold text-slate-300">{t.nameLabel}</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2 text-sm text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300">{t.emailLabel}</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@example.lv"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2 text-sm text-white"
                />
              </div>

              {authMode === "signup" && (
                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    {t.phoneAuthLabel}
                  </label>
                  <input
                    type="tel"
                    required
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    placeholder="+37120000000"
                    className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2 text-sm text-white"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-300">{t.passwordLabel}</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2 text-sm text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="mt-5 w-full rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-300 disabled:opacity-60 cursor-pointer"
            >
              {authMode === "signup" ? t.signUpSubmit : t.signInSubmit}
            </button>
          </form>
        </div>
      )}

      {isMyListingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-[#121826] p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div>
                <h3 className="text-base font-extrabold text-white">{t.myPanelTitle}</h3>
                <p className="text-xs text-slate-400">{userEmail}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMyListingsOpen(false)}
                className="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">
              {myListings.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">{t.noMyListings}</p>
              ) : (
                myListings.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0b0f17] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.images[0]}
                        alt=""
                        className="h-14 w-20 rounded-lg object-cover"
                      />
                      <div>
                        <div className="text-sm font-bold text-white">
                          {item.brand} {item.model} ({item.year})
                        </div>
                        <div className="text-xs text-amber-400">
                          €{item.price_eur.toLocaleString("en-US")} •{" "}
                          {item.mileage_km.toLocaleString("en-US")} km • {item.city}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/10 cursor-pointer"
                      >
                        {t.editBtn}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteListing(item.id)}
                        className="rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/30 cursor-pointer"
                      >
                        {t.deleteBtn}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {editingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#121826] p-6"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">{t.editModalTitle}</h3>
                <p className="text-xs text-amber-400">
                  {editingListing.brand} {editingListing.model}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingListing(null)}
                className="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-300">{t.priceLabel}</label>
                <input
                  type="number"
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">{t.cityLabel}</label>
                <select
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                >
                  {CITIES.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">
                  {t.yearInputLabel}
                </label>
                <input
                  type="number"
                  required
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">{t.kmInputLabel}</label>
                <input
                  type="number"
                  required
                  value={editKm}
                  onChange={(e) => setEditKm(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300">{t.taInputLabel}</label>
                <input
                  type="text"
                  value={editTa}
                  onChange={(e) => setEditTa(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300">{t.descLabel}</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setEditingListing(null)}
                className="rounded-xl border border-white/15 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="submit"
                disabled={isSavingEdit}
                className="rounded-xl bg-amber-400 px-5 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-300 disabled:opacity-60 cursor-pointer"
              >
                {isSavingEdit ? t.savingChangesBtn : t.saveChangesBtn}
              </button>
            </div>
          </form>
        </div>
      )}

      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <form
            onSubmit={handlePublish}
            className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#121826] p-6"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div>
                <h3 className="text-base font-extrabold text-white">{t.wizardTitle}</h3>
                <p className="text-xs font-semibold text-amber-400">
                  {step === 1 && t.step1Title}
                  {step === 2 && t.step2Title}
                  {step === 3 && t.step3Title}
                  {step === 4 && t.step4Title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsWizardOpen(false)}
                className="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-3.5 grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full ${step >= s ? "bg-amber-400" : "bg-white/10"}`}
                />
              ))}
            </div>

            {step === 1 && (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setNewCategory("car");
                      const b = Object.keys(MODELS_BY_BRAND.car)[0];
                      setNewBrand(b);
                      setNewModel(MODELS_BY_BRAND.car[b][0]);
                      setNewBody("Wagon");
                      setNewPreviewUrls([PHOTO_PRESETS[0].url]);
                    }}
                    className={`rounded-xl border p-3.5 text-left cursor-pointer ${
                      newCategory === "car"
                        ? "border-amber-400 bg-amber-400/10 text-white"
                        : "border-white/10 bg-[#0b0f17] text-slate-400"
                    }`}
                  >
                    <div className="text-sm font-bold">{t.carsCategory}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewCategory("moto");
                      const b = Object.keys(MODELS_BY_BRAND.moto)[0];
                      setNewBrand(b);
                      setNewModel(MODELS_BY_BRAND.moto[b][0]);
                      setNewBody("Naked");
                      setNewPreviewUrls([PHOTO_PRESETS[3].url]);
                    }}
                    className={`rounded-xl border p-3.5 text-left cursor-pointer ${
                      newCategory === "moto"
                        ? "border-amber-400 bg-amber-400/10 text-white"
                        : "border-white/10 bg-[#0b0f17] text-slate-400"
                    }`}
                  >
                    <div className="text-sm font-bold">{t.motosCategory}</div>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">{t.cityLabel}</label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2.5 text-sm text-white"
                  >
                    {CITIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mt-5 max-h-64 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {availableBrands.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => {
                        setNewBrand(brand);
                        setNewModel(MODELS_BY_BRAND[newCategory][brand]?.[0] ?? "");
                      }}
                      className={`rounded-xl border px-3 py-2.5 text-left text-xs font-bold cursor-pointer ${
                        newBrand === brand
                          ? "border-amber-400 bg-amber-400/15 text-amber-300"
                          : "border-white/10 bg-[#0b0f17] text-slate-200"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    {newBrand} — {t.chooseModel}
                  </label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {availableModels.map((mdl) => (
                      <button
                        key={mdl}
                        type="button"
                        onClick={() => setNewModel(mdl)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-bold cursor-pointer ${
                          newModel === mdl
                            ? "border-amber-400 bg-amber-400 text-slate-950"
                            : "border-white/10 bg-[#0b0f17] text-slate-300"
                        }`}
                      >
                        {mdl}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder={t.customModelPlaceholder}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300">{t.priceLabel}</label>
                    <input
                      type="number"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">
                      {t.engineLabel}
                    </label>
                    <input
                      type="text"
                      required
                      value={newEngine}
                      onChange={(e) => setNewEngine(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">
                      {t.yearInputLabel}
                    </label>
                    <input
                      type="number"
                      required
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">
                      {t.kmInputLabel}
                    </label>
                    <input
                      type="number"
                      required
                      value={newKm}
                      onChange={(e) => setNewKm(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">{t.fuelLabel}</label>
                    <select
                      value={newFuel}
                      onChange={(e) => setNewFuel(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                    >
                      <option value="Diesel">Dīzelis / Diesel</option>
                      <option value="Petrol">Benzīns / Petrol</option>
                      <option value="Hybrid">Hibrīds / Hybrid</option>
                      <option value="Electric">Elektro / Electric</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">{t.transLabel}</label>
                    <select
                      value={newTrans}
                      onChange={(e) => setNewTrans(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                    >
                      <option value="Automatic">Automāts / Automatic</option>
                      <option value="Manual">Manuālā / Manual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">{t.bodyLabel}</label>
                    <select
                      value={newBody}
                      onChange={(e) => setNewBody(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                    >
                      {newCategory === "car" ? (
                        <>
                          <option value="Wagon">Universālis / Wagon</option>
                          <option value="Sedan">Sedans / Sedan</option>
                          <option value="Hatchback">Hečbeks / Hatchback</option>
                          <option value="SUV">Apvidus / SUV</option>
                          <option value="Coupe">Kupeja / Coupe</option>
                        </>
                      ) : (
                        <>
                          <option value="Naked">Naked / Street</option>
                          <option value="Sport">Sporta / Sport</option>
                          <option value="Touring">Tūrisma / Enduro</option>
                          <option value="Scooter">Motorolleris / Scooter</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">
                      {t.taInputLabel}
                    </label>
                    <input
                      type="text"
                      value={newTa}
                      onChange={(e) => setNewTa(e.target.value)}
                      placeholder="10.2027"
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">
                      {t.plateInputLabel}
                    </label>
                    <input
                      type="text"
                      value={newPlate}
                      onChange={(e) => setNewPlate(e.target.value)}
                      placeholder="AB-1234"
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs uppercase text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">
                      {t.vinInputLabel}
                    </label>
                    <input
                      type="text"
                      value={newVin}
                      onChange={(e) => setNewVin(e.target.value)}
                      placeholder="WVWZZZ..."
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs uppercase text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t.addPhotosLabel}
                  </label>

                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-400/60 bg-amber-400/5 px-4 py-4 text-center transition hover:border-amber-400 hover:bg-amber-400/10 cursor-pointer">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300">
                      <span className="text-base">📷</span>
                      <span>{t.uploadBoxTitle}</span>
                    </div>
                    <span className="mt-1 text-[11px] text-slate-400">{t.uploadBoxSub}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {PHOTO_PRESETS.map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => setNewPreviewUrls((prev) => [...prev, p.url])}
                        className="rounded-lg border border-white/15 bg-[#0b0f17] px-2.5 py-1 text-[11px] text-slate-200 hover:border-amber-400 cursor-pointer"
                      >
                        + {p.label[lang]}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
                    {newPreviewUrls.map((src, idx) => (
                      <div key={idx} className="relative h-16 w-24 shrink-0">
                        <img
                          src={src}
                          alt=""
                          className="h-full w-full rounded-lg border border-white/10 object-cover"
                        />
                        {newPreviewUrls.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setNewPreviewUrls((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="absolute right-1 top-1 rounded bg-black/75 px-1 text-[10px] font-bold text-rose-300 cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">{t.phoneLabel}</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+37120000000"
                    className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">{t.descLabel}</label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder={t.descPlaceholder}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : 1))}
                  className="rounded-xl border border-white/15 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 cursor-pointer"
                >
                  {t.backBtn}
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : 4))}
                  className="rounded-xl bg-amber-400 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300 cursor-pointer"
                >
                  {t.nextBtn}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="rounded-xl bg-amber-400 px-5 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-300 disabled:opacity-60 cursor-pointer"
                >
                  {isPublishing ? t.publishingBtn : t.publishBtn}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}