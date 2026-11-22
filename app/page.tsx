"use client";

import React, { useMemo, useState } from "react";

type Lang = "lv" | "en";
type Category = "car" | "moto";

interface Listing {
  id: number;
  category: Category;
  title: string;
  city: string;
  priceEur: number;
  year: number;
  mileageKm: number;
  fuel: { lv: string; en: string };
  badge: { lv: string; en: string };
  imageUrl: string;
  description: { lv: string; en: string };
}

const CITIES = ["All", "Rīga", "Daugavpils", "Liepāja", "Jelgava", "Ventspils"];

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
    title: "Volkswagen Golf VII 1.6 TDI",
    city: "Rīga",
    priceEur: 8450,
    year: 2017,
    mileageKm: 168000,
    fuel: { lv: "Dīzelis", en: "Diesel" },
    badge: { lv: "TA derīga", en: "Valid TA" },
    imageUrl: PHOTO_PRESETS[0].url,
    description: {
      lv: "Kopts auto no Rīgas, pilna servisa vēsture, jaunas ziemas riepas.",
      en: "Well-kept car from Riga, full service history, fresh winter tires.",
    },
  },
  {
    id: 2,
    category: "car",
    title: "Toyota Corolla Hybrid 1.8",
    city: "Liepāja",
    priceEur: 14900,
    year: 2020,
    mileageKm: 92000,
    fuel: { lv: "Hibrīds", en: "Hybrid" },
    badge: { lv: "Pārbaudīts", en: "Checked" },
    imageUrl: PHOTO_PRESETS[1].url,
    description: {
      lv: "Ekonomisks hibrīds ikdienai un garākiem braucieniem pa Latviju.",
      en: "Economical hybrid for daily commuting and trips across Latvia.",
    },
  },
  {
    id: 3,
    category: "car",
    title: "BMW 320d xDrive Touring",
    city: "Jelgava",
    priceEur: 11600,
    year: 2016,
    mileageKm: 194000,
    fuel: { lv: "Dīzelis", en: "Diesel" },
    badge: { lv: "4x4 / AWD", en: "4x4 / AWD" },
    imageUrl: PHOTO_PRESETS[2].url,
    description: {
      lv: "Pilnpiedziņa Latvijas ziemai, ietilpīgs universālis ar labu aprīkojumu.",
      en: "All-wheel drive for Latvian winter, spacious wagon with solid trim.",
    },
  },
  {
    id: 4,
    category: "moto",
    title: "Keeway RKF 125 ABS",
    city: "Daugavpils",
    priceEur: 2350,
    year: 2024,
    mileageKm: 4200,
    fuel: { lv: "Benzīns", en: "Petrol" },
    badge: { lv: "Šķidruma dzese", en: "Liquid cooled" },
    imageUrl: PHOTO_PRESETS[3].url,
    description: {
      lv: "Veikls 125cc motocikls ar ABS un šķidruma dzesēšanu pilsētai.",
      en: "Agile 125cc motorcycle with ABS and liquid cooling for city rides.",
    },
  },
];

const UI_TEXT = {
  lv: {
    brand: "AutoLatvija",
    heroTitle: "Atrodi savu nākamo transportu Latvijā",
    heroSubtitle: "Vieglie auto un motocikli Rīgā, Liepājā, Jelgavā, Daugavpilī un citur.",
    postBtn: "+ Ielikt sludinājumu",
    allCategories: "Visi",
    carsCategory: "Vieglie auto",
    motosCategory: "Motocikli",
    searchPlaceholder: "Meklēt marku vai modeli (piem. Golf, Toyota, Keeway)...",
    allCities: "Visas pilsētas",
    sortPriceAsc: "Cena: no zemākās",
    sortPriceDesc: "Cena: no augstākās",
    sortYearDesc: "Gads: jaunākie",
    resultsCount: (n: number) => `${n} aktīvi sludinājumi`,
    yearLabel: "Gads",
    kmLabel: "Nobraukums",
    detailsBtn: "Apskatīt",
    closeBtn: "Aizvērt",
    emptyTitle: "Sludinājumi nav atrasti",
    emptyDesc: "Pamēģini mainīt kategoriju, pilsētu vai meklēšanas vārdu.",
    wizardTitle: "Jauns sludinājums",
    step1Label: "1. Kategorija & Pilsēta",
    step2Label: "2. Tehniskie dati",
    step3Label: "3. Foto & Apraksts",
    chooseCategory: "Izvēlies kategoriju",
    chooseCity: "Pilsēta",
    titleLabel: "Transporta nosaukums",
    titlePlaceholder: "piem. Audi A4 2.0 TDI",
    priceLabel: "Cena (EUR)",
    yearInputLabel: "Izlaiduma gads",
    kmInputLabel: "Nobraukums (km)",
    fuelLabel: "Degviela",
    photoLabel: "Pievienot foto (no datora vai izvēlēties paraugu)",
    descLabel: "Apraksts",
    descPlaceholder: "Apraksti stāvokli, apskati (TA), komplektāciju...",
    backBtn: "Atpakaļ",
    nextBtn: "Tālāk",
    publishBtn: "Publicēt sludinājumu",
  },
  en: {
    brand: "AutoLatvija",
    heroTitle: "Find your next vehicle in Latvia",
    heroSubtitle: "Cars and motorcycles across Riga, Liepaja, Jelgava, Daugavpils and beyond.",
    postBtn: "+ Post listing",
    allCategories: "All",
    carsCategory: "Cars",
    motosCategory: "Motorcycles",
    searchPlaceholder: "Search make or model (e.g. Golf, Toyota, Keeway)...",
    allCities: "All cities",
    sortPriceAsc: "Price: low to high",
    sortPriceDesc: "Price: high to low",
    sortYearDesc: "Year: newest first",
    resultsCount: (n: number) => `${n} active listings`,
    yearLabel: "Year",
    kmLabel: "Mileage",
    detailsBtn: "Details",
    closeBtn: "Close",
    emptyTitle: "No listings found",
    emptyDesc: "Try changing the category, city, or search keyword.",
    wizardTitle: "Create new listing",
    step1Label: "1. Category & City",
    step2Label: "2. Vehicle specs",
    step3Label: "3. Photo & Details",
    chooseCategory: "Choose category",
    chooseCity: "City",
    titleLabel: "Vehicle title",
    titlePlaceholder: "e.g. Audi A4 2.0 TDI",
    priceLabel: "Price (EUR)",
    yearInputLabel: "Year",
    kmInputLabel: "Mileage (km)",
    fuelLabel: "Fuel type",
    photoLabel: "Add photo (upload from device or pick preset)",
    descLabel: "Description",
    descPlaceholder: "Describe condition, inspection (TA), features...",
    backBtn: "Back",
    nextBtn: "Next",
    publishBtn: "Publish listing",
  },
};

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("lv");
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [categoryFilter, setCategoryFilter] = useState<"all" | Category>("all");
  const [selectedCity, setSelectedCity] = useState("All");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"priceAsc" | "priceDesc" | "yearDesc">("yearDesc");
  const [activeListing, setActiveListing] = useState<Listing | null>(null);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [newCategory, setNewCategory] = useState<Category>("car");
  const [newCity, setNewCity] = useState("Rīga");
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("7500");
  const [newYear, setNewYear] = useState("2018");
  const [newKm, setNewKm] = useState("140000");
  const [newFuelEn, setNewFuelEn] = useState("Diesel");
  const [newPhotoUrl, setNewPhotoUrl] = useState(PHOTO_PRESETS[0].url);
  const [newDesc, setNewDesc] = useState("");

  const t = UI_TEXT[lang];

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
      const matchesQuery =
        query.trim() === "" ||
        item.title.toLowerCase().includes(query.trim().toLowerCase()) ||
        item.city.toLowerCase().includes(query.trim().toLowerCase());
      return matchesCategory && matchesCity && matchesQuery;
    });

    return [...base].sort((a, b) => {
      if (sortBy === "priceAsc") return a.priceEur - b.priceEur;
      if (sortBy === "priceDesc") return b.priceEur - a.priceEur;
      return b.year - a.year;
    });
  }, [listings, categoryFilter, selectedCity, query, sortBy]);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setNewPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function openWizard() {
    setStep(1);
    setNewTitle("");
    setNewDesc("");
    setNewPhotoUrl(
      newCategory === "moto" ? PHOTO_PRESETS[3].url : PHOTO_PRESETS[0].url
    );
    setIsWizardOpen(true);
  }

  function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const fuelObj = fuelMap[newFuelEn] || { lv: newFuelEn, en: newFuelEn };
    const created: Listing = {
      id: Date.now(),
      category: newCategory,
      title: newTitle.trim(),
      city: newCity,
      priceEur: Number(newPrice) || 5000,
      year: Number(newYear) || 2020,
      mileageKm: Number(newKm) || 100000,
      fuel: fuelObj,
      badge:
        newCategory === "moto"
          ? { lv: "Moto sludinājums", en: "Moto listing" }
          : { lv: "Jauns sludinājums", en: "New listing" },
      imageUrl: newPhotoUrl,
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
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 font-black text-slate-950">
              LV
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white">
              {t.brand}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={openWizard}
              className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 shadow-sm hover:bg-amber-300 transition cursor-pointer"
            >
              {t.postBtn}
            </button>

            <div className="flex rounded-xl border border-white/15 bg-white/5 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLang("lv")}
                className={`rounded-lg px-2.5 py-1.5 transition cursor-pointer ${
                  lang === "lv"
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                LV
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`rounded-lg px-2.5 py-1.5 transition cursor-pointer ${
                  lang === "en"
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="border-b border-white/10 bg-gradient-to-b from-amber-400/10 via-transparent to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t.heroTitle}
          </h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            {t.heroSubtitle}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
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
                className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  categoryFilter === cat.key
                    ? "bg-amber-400 text-slate-950"
                    : "border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-[#121826] p-3.5 sm:grid-cols-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="rounded-xl border border-white/10 bg-[#0b0f17] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none sm:col-span-2"
            />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#0b0f17] px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
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
                setSortBy(e.target.value as "priceAsc" | "priceDesc" | "yearDesc")
              }
              className="rounded-xl border border-white/10 bg-[#0b0f17] px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="yearDesc">{t.sortYearDesc}</option>
              <option value="priceAsc">{t.sortPriceAsc}</option>
              <option value="priceDesc">{t.sortPriceDesc}</option>
            </select>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            {t.resultsCount(filtered.length)}
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#121826] p-12 text-center">
            <p className="text-base font-bold text-white">{t.emptyTitle}</p>
            <p className="mt-1 text-sm text-slate-400">{t.emptyDesc}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#121826] transition hover:border-amber-400/40"
              >
                <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-lg bg-slate-950/85 px-2.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-sm">
                    {item.badge[lang]}
                  </span>
                  <span className="absolute right-3 top-3 rounded-lg bg-slate-950/85 px-2.5 py-1 text-xs font-medium text-slate-200 backdrop-blur-sm">
                    {item.city}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <span className="shrink-0 text-xl font-black text-amber-400">
                      €{item.priceEur.toLocaleString("en-US")}
                    </span>
                  </div>

                  <p className="mt-1.5 line-clamp-2 text-sm text-slate-400">
                    {item.description[lang]}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-xs text-slate-300">
                    <div className="flex items-center gap-4">
                      <span>
                        {t.yearLabel}: <strong>{item.year}</strong>
                      </span>
                      <span>
                        {t.kmLabel}:{" "}
                        <strong>{item.mileageKm.toLocaleString("en-US")} km</strong>
                      </span>
                      <span className="text-slate-400">{item.fuel[lang]}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveListing(item)}
                      className="rounded-lg bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition cursor-pointer"
                    >
                      {t.detailsBtn}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {activeListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-[#121826]">
            <img
              src={activeListing.imageUrl}
              alt={activeListing.title}
              className="h-56 w-full object-cover"
            />
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-amber-400">
                    {activeListing.city} • {activeListing.fuel[lang]}
                  </span>
                  <h3 className="mt-1 text-xl font-extrabold text-white">
                    {activeListing.title}
                  </h3>
                </div>
                <span className="text-xl font-black text-amber-400">
                  €{activeListing.priceEur.toLocaleString("en-US")}
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {activeListing.description[lang]}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#0b0f17] p-3.5 text-xs">
                <div>
                  <span className="text-slate-400">{t.yearLabel}:</span>{" "}
                  <strong className="text-white">{activeListing.year}</strong>
                </div>
                <div>
                  <span className="text-slate-400">{t.kmLabel}:</span>{" "}
                  <strong className="text-white">
                    {activeListing.mileageKm.toLocaleString("en-US")} km
                  </strong>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveListing(null)}
                  className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300 transition cursor-pointer"
                >
                  {t.closeBtn}
                </button>
              </div>
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
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  {t.wizardTitle}
                </h3>
                <p className="text-xs text-amber-400">
                  {step === 1 && t.step1Label}
                  {step === 2 && t.step2Label}
                  {step === 3 && t.step3Label}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsWizardOpen(false)}
                className="rounded-lg px-2.5 py-1 text-xs font-bold text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[1, 2, 3].map((s) => (
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
                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    {t.chooseCategory}
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setNewCategory("car");
                        setNewPhotoUrl(PHOTO_PRESETS[0].url);
                      }}
                      className={`rounded-xl border p-4 text-left transition cursor-pointer ${
                        newCategory === "car"
                          ? "border-amber-400 bg-amber-400/10 text-white"
                          : "border-white/10 bg-[#0b0f17] text-slate-400"
                      }`}
                    >
                      <div className="text-sm font-bold">{t.carsCategory}</div>
                      <div className="mt-0.5 text-xs opacity-75">
                        Sedan, Hatchback, SUV, Wagon
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNewCategory("moto");
                        setNewPhotoUrl(PHOTO_PRESETS[3].url);
                      }}
                      className={`rounded-xl border p-4 text-left transition cursor-pointer ${
                        newCategory === "moto"
                          ? "border-amber-400 bg-amber-400/10 text-white"
                          : "border-white/10 bg-[#0b0f17] text-slate-400"
                      }`}
                    >
                      <div className="text-sm font-bold">{t.motosCategory}</div>
                      <div className="mt-0.5 text-xs opacity-75">
                        Naked, Sport, Touring, Scooter
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    {t.chooseCity}
                  </label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2.5 text-sm text-white"
                  >
                    {CITIES.filter((c) => c !== "All").map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300">
                    {t.titleLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={t.titlePlaceholder}
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    {t.priceLabel}
                  </label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    {t.fuelLabel}
                  </label>
                  <select
                    value={newFuelEn}
                    onChange={(e) => setNewFuelEn(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2.5 text-sm text-white"
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
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2.5 text-sm text-white"
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
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    {t.photoLabel}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="mt-2 block w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:font-semibold file:text-white hover:file:bg-white/20"
                  />

                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {PHOTO_PRESETS.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setNewPhotoUrl(preset.url)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-medium cursor-pointer ${
                          newPhotoUrl === preset.url
                            ? "border-amber-400 bg-amber-400/15 text-amber-300"
                            : "border-white/10 bg-[#0b0f17] text-slate-400"
                        }`}
                      >
                        {preset.label[lang]}
                      </button>
                    ))}
                  </div>

                  <img
                    src={newPhotoUrl}
                    alt="Preview"
                    className="mt-3 h-36 w-full rounded-xl object-cover border border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    {t.descLabel}
                  </label>
                  <textarea
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder={t.descPlaceholder}
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2 text-sm text-white"
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
                  className="rounded-xl border border-white/15 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 cursor-pointer"
                >
                  {t.backBtn}
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 2 && !newTitle.trim()) {
                      setNewTitle(lang === "lv" ? "Jauns auto" : "New vehicle");
                    }
                    setStep((s) => (s === 1 ? 2 : 3));
                  }}
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