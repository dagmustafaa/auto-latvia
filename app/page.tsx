"use client";

import React, { useMemo, useState } from "react";

type Lang = "lv" | "en";

interface Listing {
  id: number;
  title: string;
  city: string;
  priceEur: number;
  year: number;
  mileageKm: number;
  fuel: { lv: string; en: string };
  badge: { lv: string; en: string };
  description: { lv: string; en: string };
}

const CITIES = ["All", "Rīga", "Daugavpils", "Liepāja", "Jelgava"];

const LISTINGS: Listing[] = [
  {
    id: 1,
    title: "Volkswagen Golf VII 1.6 TDI",
    city: "Rīga",
    priceEur: 8450,
    year: 2017,
    mileageKm: 168000,
    fuel: { lv: "Dīzelis", en: "Diesel" },
    badge: { lv: "TA derīga", en: "Valid TA" },
    description: {
      lv: "Kopts auto no Rīgas, pilna servisa vēsture, jaunas ziemas riepas.",
      en: "Well-kept car from Riga, full service history, fresh winter tires.",
    },
  },
  {
    id: 2,
    title: "Toyota Corolla Hybrid 1.8",
    city: "Liepāja",
    priceEur: 14900,
    year: 2020,
    mileageKm: 92000,
    fuel: { lv: "Hibrīds", en: "Hybrid" },
    badge: { lv: "Pārbaudīts", en: "Checked" },
    description: {
      lv: "Ekonomisks hibrīds ikdienai un garākiem braucieniem pa Latviju.",
      en: "Economical hybrid for daily commuting and trips across Latvia.",
    },
  },
  {
    id: 3,
    title: "BMW 320d xDrive Touring",
    city: "Jelgava",
    priceEur: 11600,
    year: 2016,
    mileageKm: 194000,
    fuel: { lv: "Dīzelis", en: "Diesel" },
    badge: { lv: "4x4 / AWD", en: "4x4 / AWD" },
    description: {
      lv: "Pilnpiedziņa Latvijas ziemai, ietilpīgs universālis ar labu aprīkojumu.",
      en: "All-wheel drive for Latvian winter, spacious wagon with solid trim.",
    },
  },
  {
    id: 4,
    title: "Keeway RKF 125 ABS",
    city: "Daugavpils",
    priceEur: 2350,
    year: 2024,
    mileageKm: 4200,
    fuel: { lv: "Benzīns", en: "Petrol" },
    badge: { lv: "Zems nobraukums", en: "Low mileage" },
    description: {
      lv: "Veikls 125cc motocikls ar ABS un šķidruma dzesēšanu pilsētai.",
      en: "Agile 125cc motorcycle with ABS and liquid cooling for city rides.",
    },
  },
];

const UI_TEXT = {
  lv: {
    brand: "AutoLatvija",
    tagline: "Mūsdienīgs auto tirgus Latvijā — LV & EN",
    searchPlaceholder: "Meklēt marku vai modeli (piem. Golf, Toyota)...",
    allCities: "Visas pilsētas",
    resultsCount: (n: number) => `${n} sludinājumi`,
    yearLabel: "Gads",
    kmLabel: "Nobraukums",
    detailsBtn: "Skatīt detaļas",
    postAdBtn: "+ Ielikt sludinājumu (drīzumā)",
    closeBtn: "Aizvērt",
    emptyTitle: "Sludinājumi nav atrasti",
    emptyDesc: "Pamēģini mainīt pilsētu vai meklēšanas vārdu.",
  },
  en: {
    brand: "AutoLatvija",
    tagline: "Modern vehicle marketplace in Latvia — LV & EN",
    searchPlaceholder: "Search make or model (e.g. Golf, Toyota)...",
    allCities: "All cities",
    resultsCount: (n: number) => `${n} listings`,
    yearLabel: "Year",
    kmLabel: "Mileage",
    detailsBtn: "View details",
    postAdBtn: "+ Post listing (coming soon)",
    closeBtn: "Close",
    emptyTitle: "No listings found",
    emptyDesc: "Try changing the city or search keyword.",
  },
};

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("lv");
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [activeListing, setActiveListing] = useState<Listing | null>(null);

  const t = UI_TEXT[lang];

  const filtered = useMemo(() => {
    return LISTINGS.filter((item) => {
      const matchesCity = selectedCity === "All" || item.city === selectedCity;
      const matchesQuery =
        query.trim() === "" ||
        item.title.toLowerCase().includes(query.trim().toLowerCase());
      return matchesCity && matchesQuery;
    });
  }, [query, selectedCity]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 font-bold text-slate-950">
                AL
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                {t.brand}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">{t.tagline}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => alert(lang === "lv" ? "Sludinājumu pievienošana būs drīzumā!" : "Listing creation coming soon!")}
              className="rounded-lg bg-emerald-500 px-3.5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition"
            >
              {t.postAdBtn}
            </button>

            <div className="flex rounded-lg border border-slate-700 bg-slate-800 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLang("lv")}
                className={`rounded-md px-2.5 py-1.5 transition ${
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
                className={`rounded-md px-2.5 py-1.5 transition ${
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

      {/* Search & Filter */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:grid-cols-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none sm:col-span-2"
          />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city === "All" ? t.allCities : city}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white">
            {t.resultsCount(filtered.length)}
          </h1>
        </div>

        {/* Listings Grid */}
        {filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <p className="text-base font-semibold text-white">{t.emptyTitle}</p>
            <p className="mt-1 text-sm text-slate-400">{t.emptyDesc}</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
                      {item.badge[lang]}
                    </span>
                    <span className="text-xs text-slate-400">
                      {item.city} • {item.fuel[lang]}
                    </span>
                  </div>

                  <h2 className="mt-3 text-lg font-bold text-white">
                    {item.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-400">
                    {item.description[lang]}
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-800 pt-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {t.yearLabel}: <strong className="text-slate-200">{item.year}</strong>
                    </span>
                    <span>
                      {t.kmLabel}:{" "}
                      <strong className="text-slate-200">
                        {item.mileageKm.toLocaleString("en-US")} km
                      </strong>
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-extrabold text-emerald-400">
                      €{item.priceEur.toLocaleString("en-US")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveListing(item)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
                    >
                      {t.detailsBtn}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {activeListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-medium text-emerald-400">
                  {activeListing.city} • {activeListing.fuel[lang]}
                </span>
                <h3 className="mt-1 text-xl font-bold text-white">
                  {activeListing.title}
                </h3>
              </div>
              <span className="text-lg font-extrabold text-emerald-400">
                €{activeListing.priceEur.toLocaleString("en-US")}
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {activeListing.description[lang]}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-950 p-3 text-xs">
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
                className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-slate-200 transition"
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}