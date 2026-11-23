"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Lang = "lv" | "ru" | "en";
type Category = "car" | "moto";

interface Listing {
  id: string;
  user_id?: string | null;
  seller_name: string;
  seller_phone: string;
  category: Category;
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
    Volkswagen: ["Golf", "Passat", "Tiguan", "Polo", "Touran", "Sharan", "Arteon", "T-Roc"],
    BMW: ["1 Series", "3 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X6"],
    Audi: ["A3", "A4", "A5", "A6", "A8", "Q2", "Q3", "Q5", "Q7"],
    Toyota: ["Corolla", "Auris", "RAV4", "Yaris", "Avensis", "C-HR", "Camry", "Land Cruiser"],
    "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "CLA", "GLA", "GLC", "GLE", "Vito"],
    Volvo: ["S60", "S90", "V40", "V60", "V70", "V90", "XC40", "XC60", "XC90"],
    "Škoda": ["Fabia", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq", "Rapid"],
    Opel: ["Astra", "Corsa", "Insignia", "Mokka", "Zafira", "Grandland"],
    Nissan: ["Qashqai", "Juke", "X-Trail", "Micra", "Leaf", "Navara"],
    Mazda: ["Mazda3", "Mazda6", "CX-3", "CX-5", "CX-30"],
    Ford: ["Fiesta", "Focus", "Mondeo", "Kuga", "Puma", "Transit"],
    Peugeot: ["208", "308", "508", "2008", "3008", "5008"],
    Honda: ["Civic", "Accord", "CR-V", "HR-V", "Jazz"],
    Lexus: ["IS", "ES", "GS", "NX", "RX", "UX"],
  },
  moto: {
    Keeway: ["RKF 125", "V302C", "X-Light 125", "K-Light 125", "TX 125"],
    Yamaha: ["MT-03", "MT-07", "MT-09", "Tracer 7", "Tracer 9", "XSR700", "Tenere 700", "NMAX 125", "XMAX 300"],
    Honda: ["CB125F", "CB500F", "CBR500R", "Hornet 750", "Transalp 750", "Africa Twin", "PCX 125", "Forza 350"],
    Kawasaki: ["Z125", "Z400", "Z650", "Z900", "Ninja 400", "Ninja 650", "Versys 650"],
    Suzuki: ["SV650", "GSX-S750", "V-Strom 650", "V-Strom 800", "Address 110"],
    Ducati: ["Scrambler", "Monster", "Multistrada V2", "Hypermotard"],
    "BMW Motorrad": ["G 310 R", "G 310 GS", "F 750 GS", "F 850 GS", "R 1250 GS", "S 1000 RR"],
    Aprilia: ["RS 125", "SX 125", "Tuono 660", "RS 660"],
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
    id: "demo-1",
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
    id: "demo-2",
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
    id: "demo-3",
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
    id: "demo-4",
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
    csddCheckBtn: "Pārbaudīt e.CSDD ↗",
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
    updatePriceBtn: "Mainīt cenu",
    cityLabel: "Pilsēta",
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
    csddCheckBtn: "Проверить в e.CSDD ↗",
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
    updatePriceBtn: "Изменить цену",
    cityLabel: "Город",
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
    csddCheckBtn: "Check on e.CSDD ↗",
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
    updatePriceBtn: "Edit price",
    cityLabel: "City",
  },
};

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.256.59 4.46 1.71 6.404L3.09 28.8l6.566-1.722a12.74 12.74 0 0 0 6.348 1.694h.006c7.058 0 12.798-5.74 12.798-12.8 0-3.42-1.332-6.636-3.75-9.052A12.716 12.716 0 0 0 16.004 3.2zm0 23.41h-.004a10.6 10.6 0 0 1-5.404-1.48l-.388-.23-3.896 1.022 1.04-3.798-.252-.402a10.575 10.575 0 0 1-1.622-5.642c0-5.854 4.764-10.618 10.624-10.618 2.836 0 5.502 1.106 7.506 3.112a10.548 10.548 0 0 1 3.11 7.51c0 5.856-4.764 10.626-10.614 10.626zm5.826-7.954c-.32-.16-1.89-.932-2.182-1.038-.292-.106-.506-.16-.718.16-.214.318-.826 1.038-1.012 1.252-.186.212-.372.24-.692.08-.32-.16-1.35-.498-2.572-1.588-.95-.848-1.592-1.896-1.778-2.214-.186-.32-.02-.492.14-.652.144-.142.32-.372.48-.558.16-.186.212-.32.32-.532.106-.214.052-.4-.028-.558-.08-.16-.718-1.732-.984-2.37-.26-.622-.524-.538-.718-.548l-.612-.01c-.214 0-.56.08-.852.4-.292.318-1.118 1.092-1.118 2.662s1.144 3.088 1.304 3.3c.16.214 2.252 3.438 5.456 4.822.762.33 1.358.526 1.822.674.766.244 1.462.21 2.012.128.614-.092 1.89-.772 2.156-1.518.266-.746.266-1.384.186-1.518-.08-.132-.292-.212-.612-.372z" />
    </svg>
  );
}

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("lv");
  const [dbListings, setDbListings] = useState<Listing[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  // Favorites state
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [onlySaved, setOnlySaved] = useState(false);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<"all" | Category>("all");
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
  const [sortBy, setSortBy] = useState<"priceAsc" | "priceDesc" | "yearDesc" | "kmAsc">("yearDesc");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailPhotoIndex, setDetailPhotoIndex] = useState(0);
  const [hoverPhotoIndex, setHoverPhotoIndex] = useState<Record<string, number>>({});

  // Auth modal
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [isMyListingsOpen, setIsMyListingsOpen] = useState(false);

  // Wizard
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

  const t = UI_TEXT[lang];

  async function loadListings() {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDbListings(data as Listing[]);
    }
  }

  useEffect(() => {
    loadListings();

    try {
      const rawSaved = localStorage.getItem("autolatvija_saved_ids");
      if (rawSaved) setSavedIds(JSON.parse(rawSaved));
    } catch {
      // ignore storage error
    }

    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) {
        setUserId(u.id);
        setUserEmail(u.email ?? "");
        setUserName((u.user_metadata?.name as string) || (u.email?.split("@")[0] ?? "User"));
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      if (u) {
        setUserId(u.id);
        setUserEmail(u.email ?? "");
        setUserName((u.user_metadata?.name as string) || (u.email?.split("@")[0] ?? "User"));
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
    function syncFromHash() {
      const h = window.location.hash;
      if (h.startsWith("#listing-")) {
        setSelectedId(h.replace("#listing-", ""));
        setDetailPhotoIndex(0);
        return;
      }
      setSelectedId(null);
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  function toggleSave(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("autolatvija_saved_ids", JSON.stringify(next));
      } catch {
        // ignore
      }
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
    setOnlySaved(false);
  }

  const allListings = useMemo(() => [...dbListings, ...DEMO_LISTINGS], [dbListings]);

  const myListings = useMemo(() => {
    if (!userId) return [];
    return dbListings.filter((item) => item.user_id === userId);
  }, [dbListings, userId]);

  const activeListing = useMemo(
    () => allListings.find((item) => item.id === selectedId) ?? null,
    [allListings, selectedId]
  );

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

  const availableBrands = useMemo(
    () => Object.keys(MODELS_BY_BRAND[newCategory]),
    [newCategory]
  );

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

      const searchBlob = `${item.brand} ${item.model} ${item.engine_volume} ${item.city} ${item.plate_number ?? ""}`.toLowerCase();
      if (query.trim() !== "" && !searchBlob.includes(query.trim().toLowerCase())) return false;
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

  function openListingDetail(id: string) {
    const url = `${window.location.origin}${window.location.pathname}#listing-${id}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function closeListingDetail() {
    setSelectedId(null);
    if (window.location.hash.startsWith("#listing-")) {
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  }

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
        const signUpReq = supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            emailRedirectTo: "https://auto-latvia.vercel.app",
            data: { name: authName.trim() || authEmail.split("@")[0] },
          },
        });
        const timeoutReq = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("SMTP timeout (10s). Check Supabase SMTP settings.")), 10000)
        );
        const { error } = await Promise.race([signUpReq, timeoutReq]);
        if (error) {
          setAuthError(error.message);
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

  async function handleQuickPriceUpdate(id: string, currentPrice: number) {
    const nextStr = window.prompt("Jaunā cena (EUR) / New price (EUR):", String(currentPrice));
    if (!nextStr) return;
    const parsed = Number(nextStr);
    if (Number.isNaN(parsed) || parsed <= 0) return;
    await supabase.from("listings").update({ price_eur: parsed }).eq("id", id);
    await loadListings();
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
    <div className="min-h-screen bg-[#0b0f17] text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0f17]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => {
              closeListingDetail();
              setOnlySaved(false);
            }}
            className="flex items-center gap-2.5 text-left cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-sm font-black text-slate-950">
              LV
            </div>
            <span className="text-base font-extrabold tracking-tight text-white">
              {t.brand}
            </span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                closeListingDetail();
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
                  onClick={() => setIsMyListingsOpen(true)}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-white/10 cursor-pointer"
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

      {activeListing ? (
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
                    {activeListing.engine_volume} ({LABELS.fuel[activeListing.fuel]?.[lang] ?? activeListing.fuel})
                  </strong>
                </div>
                <div>
                  <span className="block text-slate-400">{t.transLabel}</span>
                  <strong className="mt-0.5 block text-sm text-white">
                    {LABELS.transmission[activeListing.transmission]?.[lang] ?? activeListing.transmission}
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
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0b0f17] px-4 py-3 text-xs">
                  <div className="flex flex-wrap gap-5">
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
                  <a
                    href="https://e.csdd.lv/tlizmainas/"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-amber-400 hover:underline"
                  >
                    {t.csddCheckBtn}
                  </a>
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
            </div>
          </div>

          {similarListings.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-slate-300">
                {t.similarTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {similarListings.map((sim) => (
                  <article
                    key={sim.id}
                    onClick={() => openListingDetail(sim.id)}
                    className="cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#121826] transition hover:border-amber-400/50"
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
                        <span className="text-slate-400">{sim.mileage_km.toLocaleString("en-US")} km</span>
                        <span className="font-black text-amber-400">
                          €{sim.price_eur.toLocaleString("en-US")}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </main>
      ) : (
        <>
          <section className="border-b border-white/10 bg-[#0e1420]">
            <div className="mx-auto max-w-7xl px-4 py-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                    {t.heroTitle}
                  </h1>
                  <p className="mt-1 text-xs text-slate-400 sm:text-sm">{t.heroSubtitle}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { key: "all", label: t.allCategories },
                      { key: "car", label: t.carsCategory },
                      { key: "moto", label: t.motosCategory },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => {
                        setCategoryFilter(cat.key);
                        setFilterBrand("All");
                        setFilterModel("All");
                      }}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-bold cursor-pointer ${
                        categoryFilter === cat.key
                          ? "bg-amber-400 text-slate-950"
                          : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 1: Brand, Model, City, Fuel, Gearbox, Search */}
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

              {/* Row 2: Price Min/Max, Year Min/Max, Max KM, Sort & Reset */}
              <div className="grid gap-2 rounded-b-xl border border-white/10 bg-[#121826] p-2.5 sm:grid-cols-2 lg:grid-cols-7">
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
                    <article
                      key={item.id}
                      onClick={() => openListingDetail(item.id)}
                      className="group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#121826] transition hover:border-amber-400/50"
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
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </>
      )}

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
                    placeholder="Mustafa"
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
                          €{item.price_eur.toLocaleString("en-US")} • {item.city}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickPriceUpdate(item.id, item.price_eur)}
                        className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/10 cursor-pointer"
                      >
                        {t.updatePriceBtn}
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
                    <label className="block text-xs font-bold text-slate-300">{t.engineLabel}</label>
                    <input
                      type="text"
                      required
                      value={newEngine}
                      onChange={(e) => setNewEngine(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">{t.yearInputLabel}</label>
                    <input
                      type="number"
                      required
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">{t.kmInputLabel}</label>
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
                    <label className="block text-xs font-bold text-slate-300">{t.taInputLabel}</label>
                    <input
                      type="text"
                      value={newTa}
                      onChange={(e) => setNewTa(e.target.value)}
                      placeholder="10.2027"
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">{t.plateInputLabel}</label>
                    <input
                      type="text"
                      value={newPlate}
                      onChange={(e) => setNewPlate(e.target.value)}
                      placeholder="AB-1234"
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs uppercase text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">{t.vinInputLabel}</label>
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
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">{t.addPhotosLabel}</label>

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