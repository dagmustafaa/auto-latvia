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

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailPhotoIndex, setDetailPhotoIndex] = useState(0);
  const [hoverPhotoIndex, setHoverPhotoIndex] = useState<Record<number, number>>({});

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [pendingWizardAfterAuth, setPendingWizardAfterAuth] = useState(false);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [newCategory, setNewCategory] = useState<Category>("car");
  const [newCity, setNewCity] = useState("Rīga");
  const [newBrand, setNewBrand] = useState("BMW");
  const [newModel, setNewModel] = useState("320d");
  const [newPrice, setNewPrice] = useState("9500");
  const [newYear, setNewYear] = useState("2019");
  const [newKm, setNewKm] = useState("135000");
  const [newFuelEn, setNewFuelEn] = useState("Diesel");
  const [newPhotos, setNewPhotos] = useState<string[]>([PHOTO_PRESETS[0].url]);
  const [newDesc, setNewDesc] = useState("");

  const t = UI_TEXT[lang];

  useEffect(() => {
    function syncFromHash() {
      const h = window.location.hash;
      if (h.startsWith("#listing-")) {
        const parsed = Number(h.replace("#listing-", ""));
        if (!Number.isNaN(parsed)) {
          setSelectedId(parsed);
          setDetailPhotoIndex(0);
          return;
        }
      }
      setSelectedId(null);
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  function openListingDetail(id: number) {
    setSelectedId(id);
    setDetailPhotoIndex(0);
    window.location.hash = `listing-${id}`;
  }

  function closeListingDetail() {
    setSelectedId(null);
    if (window.location.hash.startsWith("#listing-")) {
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  }

  const activeListing = useMemo(
    () => listings.find((item) => item.id === selectedId) ?? null,
    [listings, selectedId]
  );

  const availableBrands = useMemo(
    () => Object.keys(MODELS_BY_BRAND[newCategory]),
    [newCategory]
  );

  const availableModels = useMemo(
    () => MODELS_BY_BRAND[newCategory][newBrand] ?? [],
    [newCategory, newBrand]
  );

  const fuelMap: Record<string, { lv: string; en: string }> = {
    Diesel: { lv: "Dīzelis", en: "Diesel" },
    Petrol: { lv: "Benzīns", en: "Petrol" },
    Hybrid: { lv: "Hibrīds", en: "Hybrid" },
    Electric: { lv: "Elektro", en: "Electric" },
  };

  const filtered = useMemo(() => {
    const base = listings.filter((item) => {
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;
      const matchesCity = selectedCity === "All" || item.city === selectedCity;
      const fullName = `${item.brand} ${item.model}`.toLowerCase();
      const matchesQuery =
        query.trim() === "" ||
        fullName.includes(query.trim().toLowerCase()) ||
        item.city.toLowerCase().includes(query.trim().toLowerCase());
      return matchesCategory && matchesCity && matchesQuery;
    });

    return [...base].sort((a, b) => {
      if (sortBy === "priceAsc") return a.priceEur - b.priceEur;
      if (sortBy === "priceDesc") return b.priceEur - a.priceEur;
      return b.year - a.year;
    });
  }, [listings, categoryFilter, selectedCity, query, sortBy]);

  function startWizard() {
    const defaultBrand = Object.keys(MODELS_BY_BRAND[newCategory])[0];
    const defaultModel = MODELS_BY_BRAND[newCategory][defaultBrand]?.[0] ?? "";
    setStep(1);
    setNewBrand(defaultBrand);
    setNewModel(defaultModel);
    setNewDesc("");
    setNewPhotos([
      newCategory === "moto" ? PHOTO_PRESETS[3].url : PHOTO_PRESETS[0].url,
    ]);
    setIsWizardOpen(true);
  }

  function handlePostButtonClick() {
    if (!user) {
      setPendingWizardAfterAuth(true);
      setIsAuthOpen(true);
      return;
    }
    startWizard();
  }

  function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = authName.trim() || "AutoPircējs";
    const cleanEmail = authEmail.trim() || "user@autolatvija.lv";
    setUser({ name: cleanName, email: cleanEmail });
    setIsAuthOpen(false);
    if (pendingWizardAfterAuth) {
      setPendingWizardAfterAuth(false);
      startWizard();
    }
  }

  function handleMultipleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setNewPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function handleCardMouseMove(
    e: React.MouseEvent<HTMLDivElement>,
    listingId: number,
    photoCount: number
  ) {
    if (photoCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 0.999);
    const idx = Math.floor(ratio * photoCount);
    setHoverPhotoIndex((prev) => ({ ...prev, [listingId]: idx }));
  }

  function handleCardMouseLeave(listingId: number) {
    setHoverPhotoIndex((prev) => ({ ...prev, [listingId]: 0 }));
  }

  function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setIsWizardOpen(false);
      setPendingWizardAfterAuth(true);
      setIsAuthOpen(true);
      return;
    }

    const finalModel = newModel.trim() || "Model";
    const fuelObj = fuelMap[newFuelEn] || { lv: newFuelEn, en: newFuelEn };
    const safePhotos =
      newPhotos.length > 0
        ? newPhotos
        : [newCategory === "moto" ? PHOTO_PRESETS[3].url : PHOTO_PRESETS[0].url];

    const created: Listing = {
      id: Date.now(),
      category: newCategory,
      brand: newBrand,
      model: finalModel,
      city: newCity,
      priceEur: Number(newPrice) || 6500,
      year: Number(newYear) || 2020,
      mileageKm: Number(newKm) || 110000,
      fuel: fuelObj,
      badge:
        newCategory === "moto"
          ? { lv: "Moto sludinājums", en: "Moto listing" }
          : { lv: "Jauns sludinājums", en: "New listing" },
      images: safePhotos,
      sellerName: user.name,
      description: {
        lv: newDesc.trim() || "Papildu informācija pēc pieprasījuma.",
        en: newDesc.trim() || "Additional details available upon request.",
      },
    };

    setListings((prev) => [created, ...prev]);
    setIsWizardOpen(false);
    setStep(1);
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0f17]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={closeListingDetail}
            className="flex items-center gap-2.5 text-left cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-sm font-black text-slate-950">
              LV
            </div>
            <span className="text-base font-extrabold tracking-tight text-white">
              {t.brand}
            </span>
          </button>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
                <span className="font-semibold text-amber-300">{user.name}</span>
                <button
                  type="button"
                  onClick={() => setUser(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  {t.logoutBtn}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setPendingWizardAfterAuth(false);
                  setIsAuthOpen(true);
                }}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 transition cursor-pointer"
              >
                {t.loginBtn}
              </button>
            )}

            <button
              type="button"
              onClick={handlePostButtonClick}
              className="rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-300 transition cursor-pointer"
            >
              {t.postBtn}
            </button>

            <div className="flex rounded-xl border border-white/15 bg-white/5 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLang("lv")}
                className={`rounded-lg px-2 py-1 cursor-pointer ${
                  lang === "lv" ? "bg-white text-slate-950" : "text-slate-300"
                }`}
              >
                LV
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`rounded-lg px-2 py-1 cursor-pointer ${
                  lang === "en" ? "bg-white text-slate-950" : "text-slate-300"
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>

      {activeListing ? (
        <main className="mx-auto max-w-5xl px-4 py-6">
          <button
            type="button"
            onClick={closeListingDetail}
            className="mb-4 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 cursor-pointer"
          >
            {t.backToList}
          </button>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121826]">
            <div className="relative h-72 w-full bg-slate-950 sm:h-96">
              <img
                src={activeListing.images[detailPhotoIndex] ?? activeListing.images[0]}
                alt={`${activeListing.brand} ${activeListing.model}`}
                className="h-full w-full object-cover"
              />
              <span className="absolute left-4 top-4 rounded-lg bg-slate-950/85 px-3 py-1 text-xs font-semibold text-amber-300">
                {activeListing.badge[lang]}
              </span>
            </div>

            {activeListing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto border-b border-white/10 bg-[#0b0f17] p-3">
                {activeListing.images.map((imgUrl, idx) => (
                  <button
                    key={`${imgUrl}-${idx}`}
                    type="button"
                    onClick={() => setDetailPhotoIndex(idx)}
                    className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition cursor-pointer ${
                      detailPhotoIndex === idx
                        ? "border-amber-400"
                        : "border-white/10 opacity-65 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumb ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
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
                    {activeListing.brand} {activeListing.model}
                  </h1>
                </div>
                <div className="text-2xl font-black text-amber-400">
                  €{activeListing.priceEur.toLocaleString("en-US")}
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                {activeListing.description[lang]}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-[#0b0f17] p-4 text-xs sm:grid-cols-4">
                <div>
                  <span className="block text-slate-400">{t.yearLabel}</span>
                  <strong className="mt-0.5 block text-sm text-white">
                    {activeListing.year}
                  </strong>
                </div>
                <div>
                  <span className="block text-slate-400">{t.kmLabel}</span>
                  <strong className="mt-0.5 block text-sm text-white">
                    {activeListing.mileageKm.toLocaleString("en-US")} km
                  </strong>
                </div>
                <div>
                  <span className="block text-slate-400">{t.fuelLabel}</span>
                  <strong className="mt-0.5 block text-sm text-white">
                    {activeListing.fuel[lang]}
                  </strong>
                </div>
                <div>
                  <span className="block text-slate-400">{t.sellerLabel}</span>
                  <strong className="mt-0.5 block text-sm text-amber-300">
                    {activeListing.sellerName}
                  </strong>
                </div>
              </div>
            </div>
          </div>
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
                  <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                    {t.heroSubtitle}
                  </p>
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
                      onClick={() => setCategoryFilter(cat.key)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
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

              <div className="mt-4 grid gap-2.5 rounded-xl border border-white/10 bg-[#121826] p-2.5 sm:grid-cols-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="rounded-lg border border-white/10 bg-[#0b0f17] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none sm:col-span-2"
                />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="rounded-lg border border-white/10 bg-[#0b0f17] px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city === "All" ? t.allCities : city}
                    </option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as "priceAsc" | "priceDesc" | "yearDesc"
                    )
                  }
                  className="rounded-lg border border-white/10 bg-[#0b0f17] px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="yearDesc">{t.sortYearDesc}</option>
                  <option value="priceAsc">{t.sortPriceAsc}</option>
                  <option value="priceDesc">{t.sortPriceDesc}</option>
                </select>
              </div>
            </div>
          </section>

          <main className="mx-auto max-w-7xl px-4 py-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t.resultsCount(filtered.length)}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((item) => {
                const activeIdx = hoverPhotoIndex[item.id] ?? 0;
                const currentSrc = item.images[activeIdx] ?? item.images[0];

                return (
                  <article
                    key={item.id}
                    onClick={() => openListingDetail(item.id)}
                    className="group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#121826] transition hover:border-amber-400/50"
                  >
                    <div
                      onMouseMove={(e) =>
                        handleCardMouseMove(e, item.id, item.images.length)
                      }
                      onMouseLeave={() => handleCardMouseLeave(item.id)}
                      className="relative h-36 w-full overflow-hidden bg-slate-950"
                    >
                      <img
                        src={currentSrc}
                        alt={`${item.brand} ${item.model}`}
                        className="h-full w-full object-cover transition duration-200"
                      />
                      <span className="absolute left-2 top-2 rounded bg-slate-950/85 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                        {item.badge[lang]}
                      </span>
                      <span className="absolute right-2 top-2 rounded bg-slate-950/85 px-2 py-0.5 text-[11px] text-slate-200">
                        {item.city}
                      </span>

                      {item.images.length > 1 && (
                        <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/60 px-2 py-0.5">
                          {item.images.map((_, i) => (
                            <span
                              key={i}
                              className={`h-1 w-3 rounded-full transition ${
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
                            {item.brand}
                          </div>
                          <h2 className="truncate text-sm font-bold text-white group-hover:text-amber-300 transition">
                            {item.model}
                          </h2>
                        </div>
                        <span className="shrink-0 text-base font-black text-amber-400">
                          €{item.priceEur.toLocaleString("en-US")}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px] text-slate-400">
                        <span>{item.year}</span>
                        <span>{item.mileageKm.toLocaleString("en-US")} km</span>
                        <span>{item.fuel[lang]}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
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
                <h3 className="text-base font-extrabold text-white">
                  {t.authTitle}
                </h3>
                <p className="mt-1 text-xs text-slate-400">{t.authDesc}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthOpen(false)}
                className="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="Mustafa"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="mustafa@example.lv"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-300 cursor-pointer"
              >
                {t.createAccountBtn}
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
                <h3 className="text-base font-extrabold text-white">
                  {t.wizardTitle}
                </h3>
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
                className="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-3.5 grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full ${
                    step >= s ? "bg-amber-400" : "bg-white/10"
                  }`}
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
                      setNewPhotos([PHOTO_PRESETS[0].url]);
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
                      setNewPhotos([PHOTO_PRESETS[3].url]);
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
                  <label className="block text-xs font-bold text-slate-300">
                    {t.cityLabel}
                  </label>
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
              <div className="mt-5">
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {availableBrands.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => {
                        setNewBrand(brand);
                        setNewModel(MODELS_BY_BRAND[newCategory][brand]?.[0] ?? "");
                      }}
                      className={`rounded-xl border px-3.5 py-3 text-left text-sm font-bold transition cursor-pointer ${
                        newBrand === brand
                          ? "border-amber-400 bg-amber-400/15 text-amber-300"
                          : "border-white/10 bg-[#0b0f17] text-slate-200 hover:border-white/25"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    {newBrand} — {t.chooseModel}
                  </label>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {availableModels.map((mdl) => (
                      <button
                        key={mdl}
                        type="button"
                        onClick={() => setNewModel(mdl)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-bold cursor-pointer ${
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
                    className="mt-2 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300">
                      {t.priceLabel}
                    </label>
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
                      {t.fuelInputLabel}
                    </label>
                    <select
                      value={newFuelEn}
                      onChange={(e) => setNewFuelEn(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3 py-2 text-xs text-white"
                    >
                      <option value="Diesel">Diesel / Dīzelis</option>
                      <option value="Petrol">Petrol / Benzīns</option>
                      <option value="Hybrid">Hybrid / Hibrīds</option>
                      <option value="Electric">Electric / Elektro</option>
                    </select>
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
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    {t.addPhotosLabel}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMultipleFiles}
                    className="mt-1.5 block w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 py-1.5 file:font-semibold file:text-white hover:file:bg-white/20"
                  />

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {PHOTO_PRESETS.map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => setNewPhotos((prev) => [...prev, p.url])}
                        className="rounded-lg border border-white/15 bg-[#0b0f17] px-2.5 py-1 text-[11px] text-slate-200 hover:border-amber-400 cursor-pointer"
                      >
                        + {p.label[lang]}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {newPhotos.map((src, idx) => (
                      <div key={`${idx}`} className="relative h-20 w-28 shrink-0">
                        <img
                          src={src}
                          alt={`Selected ${idx + 1}`}
                          className="h-full w-full rounded-lg object-cover border border-white/10"
                        />
                        {newPhotos.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setNewPhotos((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            className="absolute right-1 top-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-rose-300 cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    {t.descLabel}
                  </label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder={t.descPlaceholder}
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
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
                  className="rounded-xl bg-amber-400 px-5 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-300 cursor-pointer"
                >
                  {t.publishBtn}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}