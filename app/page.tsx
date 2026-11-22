"use client";

import React, { useEffect, useMemo, useState } from "react";

type Lang = "lv" | "en";
type Category = "car" | "moto";

interface Listing {
  id: number;
  category: Category;
  brand: string;
  model: string;
  city: string;
  priceEur: number;
  year: number;
  mileageKm: number;
  fuel: { lv: string; en: string };
  badge: { lv: string; en: string };
  images: string[];
  sellerName: string;
  description: { lv: string; en: string };
}

interface UserAccount {
  name: string;
  email: string;
}

const CITIES = ["All", "Rīga", "Daugavpils", "Liepāja", "Jelgava", "Ventspils"];

const MODELS_BY_BRAND: Record<Category, Record<string, string[]>> = {
  car: {
    BMW: ["320d", "330i", "520d", "530i", "X3", "X5"],
    Volkswagen: ["Golf VII", "Golf VIII", "Passat B8", "Tiguan", "Polo"],
    Toyota: ["Corolla", "Corolla Hybrid", "RAV4", "Yaris", "C-HR"],
    Audi: ["A4", "A6", "Q5", "A3", "Q7"],
    "Mercedes-Benz": ["C 220d", "E 220d", "GLC", "A 180"],
  },
  moto: {
    Keeway: ["RKF 125", "V302C", "X-Light 125"],
    Yamaha: ["MT-07", "MT-09", "Tracer 7", "NMAX 125"],
    Honda: ["CB500F", "Hornet 750", "PCX 125", "Africa Twin"],
    Kawasaki: ["Z650", "Ninja 650", "Z900"],
  },
};

const PHOTO_PRESETS = [
  {
    label: { lv: "Sedans / Hečbeks", en: "Sedan / Hatchback" },
    url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: { lv: "Hibrīds / Pilsētas", en: "Hybrid / City" },
    url: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: { lv: "Universālis / 4x4", en: "Wagon / AWD" },
    url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: { lv: "Motocikls", en: "Motorcycle" },
    url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80",
  },
];

const INITIAL_LISTINGS: Listing[] = [
  {
    id: 1,
    category: "car",
    brand: "Volkswagen",
    model: "Golf VII 1.6 TDI",
    city: "Rīga",
    priceEur: 8450,
    year: 2017,
    mileageKm: 168000,
    fuel: { lv: "Dīzelis", en: "Diesel" },
    badge: { lv: "TA derīga", en: "Valid TA" },
    images: [PHOTO_PRESETS[0].url, PHOTO_PRESETS[1].url, PHOTO_PRESETS[2].url],
    sellerName: "Māris B.",
    description: {
      lv: "Kopts auto no Rīgas, pilna servisa vēsture, jaunas ziemas riepas.",
      en: "Well-kept car from Riga, full service history, fresh winter tires.",
    },
  },
  {
    id: 2,
    category: "car",
    brand: "Toyota",
    model: "Corolla Hybrid 1.8",
    city: "Liepāja",
    priceEur: 14900,
    year: 2020,
    mileageKm: 92000,
    fuel: { lv: "Hibrīds", en: "Hybrid" },
    badge: { lv: "Pārbaudīts", en: "Checked" },
    images: [PHOTO_PRESETS[1].url, PHOTO_PRESETS[0].url],
    sellerName: "Elīna K.",
    description: {
      lv: "Ekonomisks hibrīds ikdienai un garākiem braucieniem pa Latviju.",
      en: "Economical hybrid for daily commuting and trips across Latvia.",
    },
  },
  {
    id: 3,
    category: "car",
    brand: "BMW",
    model: "320d xDrive",
    city: "Jelgava",
    priceEur: 11600,
    year: 2016,
    mileageKm: 194000,
    fuel: { lv: "Dīzelis", en: "Diesel" },
    badge: { lv: "4x4 / AWD", en: "4x4 / AWD" },
    images: [PHOTO_PRESETS[2].url, PHOTO_PRESETS[0].url, PHOTO_PRESETS[1].url],
    sellerName: "Andris V.",
    description: {
      lv: "Pilnpiedziņa Latvijas ziemai, ietilpīgs universālis ar labu aprīkojumu.",
      en: "All-wheel drive for Latvian winter, spacious wagon with solid trim.",
    },
  },
  {
    id: 4,
    category: "moto",
    brand: "Keeway",
    model: "RKF 125 ABS",
    city: "Daugavpils",
    priceEur: 2350,
    year: 2024,
    mileageKm: 4200,
    fuel: { lv: "Benzīns", en: "Petrol" },
    badge: { lv: "Šķidruma dzese", en: "Liquid cooled" },
    images: [PHOTO_PRESETS[3].url, PHOTO_PRESETS[0].url],
    sellerName: "Artūrs L.",
    description: {
      lv: "Veikls 125cc motocikls ar ABS un šķidruma dzesēšanu pilsētai.",
      en: "Agile 125cc motorcycle with ABS and liquid cooling for city rides.",
    },
  },
  {
    id: 5,
    category: "car",
    brand: "Audi",
    model: "A4 Avant",
    city: "Ventspils",
    priceEur: 10200,
    year: 2018,
    mileageKm: 151000,
    fuel: { lv: "Dīzelis", en: "Diesel" },
    badge: { lv: "Servisa grāmata", en: "Service book" },
    images: [PHOTO_PRESETS[2].url, PHOTO_PRESETS[1].url],
    sellerName: "Dace R.",
    description: {
      lv: "Komfortabls Audi universālis ar kruīzkontroli un LED optiku.",
      en: "Comfortable Audi wagon with cruise control and LED lights.",
    },
  },
  {
    id: 6,
    category: "moto",
    brand: "Yamaha",
    model: "MT-07",
    city: "Rīga",
    priceEur: 6400,
    year: 2021,
    mileageKm: 12800,
    fuel: { lv: "Benzīns", en: "Petrol" },
    badge: { lv: "Jauna ķēde", en: "Fresh chain" },
    images: [PHOTO_PRESETS[3].url, PHOTO_PRESETS[2].url],
    sellerName: "Kārlis S.",
    description: {
      lv: "Dinamisks naked motocikls pilsētai un brīvdienu izbraucieniem.",
      en: "Punchy naked bike for city streets and weekend rides.",
    },
  },
];

const UI_TEXT = {
  lv: {
    brand: "AutoLatvija",
    heroTitle: "Auto & Moto sludinājumi Latvijā",
    heroSubtitle: "Kompakti sludinājumi, vairāki foto uz kursora un ātra publicēšana.",
    postBtn: "+ Ielikt sludinājumu",
    loginBtn: "Izveidot kontu / Ieiet",
    logoutBtn: "Iziet",
    allCategories: "Visi",
    carsCategory: "Vieglie auto",
    motosCategory: "Motocikli",
    searchPlaceholder: "Meklēt marku, modeli vai pilsētu...",
    allCities: "Visas pilsētas",
    sortPriceAsc: "Cena: no zemākās",
    sortPriceDesc: "Cena: no augstākās",
    sortYearDesc: "Gads: jaunākie",
    resultsCount: (n: number) => `${n} sludinājumi`,
    backToList: "← Atpakaļ uz sludinājumiem",
    sellerLabel: "Pārdevējs",
    yearLabel: "Gads",
    kmLabel: "Nobraukums",
    fuelLabel: "Degviela",
    cityLabel: "Pilsēta",
    authTitle: "Nepieciešams konts sludinājuma ievietošanai",
    authDesc: "Izveido profilu vai pieslēdzies, lai pievienotu savu auto vai moto.",
    nameLabel: "Vārds / Lietotājvārds",
    emailLabel: "E-pasts",
    createAccountBtn: "Izveidot kontu un turpināt",
    wizardTitle: "Jauns sludinājums",
    step1Title: "1. Kategorija & Pilsēta",
    step2Title: "2. Izvēlies marku",
    step3Title: "3. Modelis & Dati",
    step4Title: "4. Bildes & Apraksts",
    chooseModel: "Modelis",
    customModelPlaceholder: "Vai ieraksti modeli (piem. 320d Touring)",
    priceLabel: "Cena (EUR)",
    yearInputLabel: "Gads",
    kmInputLabel: "Nobraukums (km)",
    fuelInputLabel: "Degviela",
    addPhotosLabel: "Pievienot bildes (vairākas no datora vai paraugi)",
    removePhoto: "Noņemt",
    descLabel: "Apraksts",
    descPlaceholder: "Apraksti stāvokli, TA, riepas...",
    backBtn: "Atpakaļ",
    nextBtn: "Tālāk",
    publishBtn: "Publicēt sludinājumu",
  },
  en: {
    brand: "AutoLatvija",
    heroTitle: "Car & Moto listings in Latvia",
    heroSubtitle: "Compact cards, multi-photo hover preview, and step-by-step posting.",
    postBtn: "+ Post listing",
    loginBtn: "Create account / Sign in",
    logoutBtn: "Sign out",
    allCategories: "All",
    carsCategory: "Cars",
    motosCategory: "Motorcycles",
    searchPlaceholder: "Search brand, model, or city...",
    allCities: "All cities",
    sortPriceAsc: "Price: low to high",
    sortPriceDesc: "Price: high to low",
    sortYearDesc: "Year: newest first",
    resultsCount: (n: number) => `${n} listings`,
    backToList: "← Back to listings",
    sellerLabel: "Seller",
    yearLabel: "Year",
    kmLabel: "Mileage",
    fuelLabel: "Fuel",
    cityLabel: "City",
    authTitle: "Account required to post a listing",
    authDesc: "Create an account or sign in before publishing your vehicle.",
    nameLabel: "Name / Username",
    emailLabel: "Email",
    createAccountBtn: "Create account & continue",
    wizardTitle: "New listing",
    step1Title: "1. Category & City",
    step2Title: "2. Choose brand",
    step3Title: "3. Model & Specs",
    step4Title: "4. Photos & Details",
    chooseModel: "Model",
    customModelPlaceholder: "Or type model (e.g. 320d Touring)",
    priceLabel: "Price (EUR)",
    yearInputLabel: "Year",
    kmInputLabel: "Mileage (km)",
    fuelInputLabel: "Fuel type",
    addPhotosLabel: "Add photos (multiple from device or presets)",
    removePhoto: "Remove",
    descLabel: "Description",
    descPlaceholder: "Describe condition, inspection (TA), tires...",
    backBtn: "Back",
    nextBtn: "Next",
    publishBtn: "Publish listing",
  },
};

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("lv");
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [user, setUser] = useState<UserAccount | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<"all" | Category>("all");
  const [selectedCity, setSelectedCity] = useState("All");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"priceAsc" | "priceDesc" | "yearDesc">("yearDesc");

  // Detail view state (synced with URL hash for direct navigation)
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailPhotoIndex, setDetailPhotoIndex] = useState(0);

  // Hover index per listing card
  const [hoverPhotoIndex, setHoverPhotoIndex] = useState<Record<number, number>>({});

  // Auth modal state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [pendingWizardAfterAuth, setPendingWizardAfterAuth] = useState(false);

  // 4-step wizard state: 1=Category/City, 2=Brand, 3=Model/Specs, 4=Photos/Desc
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [newCategory, setNewCategory] = useState<Category>("car");
  const [newCity, setNewCity] = useState("Rīga");
  const [newBrand, setNewBrand] = useState("BMW");
  const [newModel, setNewModel] = useState("320d");
  const [newPrice, setNewPrice] = useState("9500");
  const [newYear, setNewYear] = useState("2019");
  const [newKm, setNewKm] = useState("135000");
  const [newFuelEn, setNewFuelEn