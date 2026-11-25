"use client";

import React, { useState } from "react";

type Lang = "lv" | "ru" | "en";

const CONTENT: Record<
  Lang,
  {
    back: string;
    title: string;
    updated: string;
    sections: { heading: string; paragraphs: string[] }[];
  }
> = {
  lv: {
    back: "← Atpakaļ uz AutoLatvija",
    title: "Privātuma politika (GDPR / ES & Latvijas Republikas tiesību akti)",
    updated: "Spēkā no: 2026. gada | Platforma: AutoLatvija",
    sections: [
      {
        heading: "1. Vispārīgie noteikumi un pārzinis",
        paragraphs: [
          "Šī privātuma politika nosaka, kā transportlīdzekļu sludinājumu platforma AutoLatvija vāc, apstrādā, glabā un aizsargā lietotāju personas datus saskaņā ar Eiropas Parlamenta un Padomes Regulu (ES) 2016/679 (Vispārīgā datu aizsardzības regula — GDPR) un Latvijas Republikas Fizisko personu datu apstrādes likumu.",
          "Platforma nodrošina sludinājumu publicēšanu un pircēju un pārdevēju saziņu saistībā ar vieglajiem automobiļiem, motocikliem un citiem transportlīdzekļiem Latvijas teritorijā.",
        ],
      },
      {
        heading: "2. Apstrādāto datu kategorijas",
        paragraphs: [
          "Konta un autentifikācijas dati: lietotāja e-pasta adrese, profila vārds un drošas autentifikācijas pieraksti konta izveidei, e-pasta verifikācijai un piekļuvei sludinājumu pārvaldībai.",
          "Sludinājumu un kontaktinformācijas dati: transportlīdzekļa marka, modelis, izlaiduma gads, nobraukums, cena, pilsēta, tehniskās apskates (TA) termiņš, apraksts, augšupielādētās fotogrāfijas, kā arī pārdevēja norādītais tālruņa numurs (tostarp saziņai pa tālruni vai WhatsApp).",
          "Pārlūkprogrammas lokālie dati: saglabātie iecienītākie sludinājumi (Saglabātie) un interfeisa preferences var tikt glabāti lietotāja pārlūkprogrammas lokālajā atmiņā (localStorage).",
        ],
      },
      {
        heading: "3. Datu apstrādes mērķi un tiesiskais pamats",
        paragraphs: [
          "Dati tiek apstrādāti, lai nodrošinātu platformas funkcionalitāti, publicētu lietotāja sludinājumus, nodrošinātu pircēju un pārdevēju saziņu, novērstu krāpniecību un ļaunprātīgu izmantošanu, kā arī uzlabotu pakalpojuma kvalitāti.",
          "Tiesiskais pamats ietver datu subjekta piekrišanu, pakalpojuma sniegšanas nepieciešamību un platformas leģitīmās intereses drošas un funkcionālas sludinājumu vides uzturēšanā.",
        ],
      },
      {
        heading: "4. Datu glabāšana, drošība un trešās puses",
        paragraphs: [
          "Sludinājumu ieraksti un multivides faili tiek glabāti mākoņpakalpojumu infrastruktūrā (piemēram, Supabase), bet tīmekļa lietojumprogrammas piegāde un e-pasta verifikācijas paziņojumi tiek nodrošināti ar atbilstošiem hostinga un e-pasta pakalpojumu sniedzējiem.",
          "Tiek īstenoti saprātīgi tehniski un organizatoriski drošības pasākumi, lai aizsargātu datus pret nesankcionētu piekļuvi, izpaušanu, zaudēšanu vai izmainīšanu. Informācija par publicēta sludinājuma kontaktu un transportlīdzekli ir redzama platformas apmeklētājiem sludinājuma ietvaros.",
        ],
      },
      {
        heading: "5. Glabāšanas termiņš un dzēšana",
        paragraphs: [
          "Sludinājumu dati tiek glabāti tik ilgi, kamēr sludinājums ir aktīvs vai kamēr pastāv konts un apstrādes mērķis. Lietotājs var rediģēt vai dzēst savus sludinājumus sadaļā 'Mani sludinājumi'.",
          "Lietotājam ir tiesības pieprasīt sava konta un saistīto datu dzēšanu, sazinoties ar platformas administrāciju.",
        ],
      },
      {
        heading: "6. Datu subjekta tiesības saskaņā ar GDPR",
        paragraphs: [
          "Katram lietotājam ir tiesības pieprasīt piekļuvi saviem personas datiem, to labošanu vai dzēšanu ('tiesības tikt aizmirstam'), apstrādes ierobežošanu, iebilst pret apstrādi, kā arī iesniegt sūdzību uzraudzības iestādē — Datu valsts inspekcijā (DVI, www.dvi.gov.lv).",
        ],
      },
    ],
  },
  ru: {
    back: "← Назад на AutoLatvija",
    title: "Политика конфиденциальности (GDPR / ЕС и законодательство Латвии)",
    updated: "Действует с: 2026 год | Платформа: AutoLatvija",
    sections: [
      {
        heading: "1. Общие положения",
        paragraphs: [
          "Настоящая политика конфиденциальности описывает, как платформа объявлений о транспортных средствах AutoLatvija собирает, обрабатывает, хранит и защищает персональные данные пользователей в соответствии с Регламентом (ЕС) 2016/679 (GDPR) и законом Латвии об обработке данных физических лиц.",
          "Платформа предоставляет возможность размещать объявления о продаже автомобилей, мотоциклов и другой техники на территории Латвии и связываться продавцам с покупателями.",
        ],
      },
      {
        heading: "2. Какие данные обрабатываются",
        paragraphs: [
          "Данные аккаунта: адрес электронной почты, имя профиля и учетные данные для регистрации, подтверждения e-mail и управления объявлениями.",
          "Данные объявлений и контакты: марка, модель, год выпуска, пробег, цена, город, срок техосмотра (ТО), описание, загруженные фотографии, а также указанный номер телефона (в том числе для звонков и WhatsApp).",
          "Локальные данные браузера: сохраненные объявления (Избранное) и настройки интерфейса могут храниться в локальном хранилище браузера (localStorage).",
        ],
      },
      {
        heading: "3. Цели и правовые основания обработки",
        paragraphs: [
          "Данные обрабатываются для работы сервиса, публикации объявлений, связи между покупателями и продавцами, предотвращения мошенничества и злоупотреблений, а также улучшения качества платформы.",
          "Обработка осуществляется на основании согласия пользователя, необходимости предоставления запрошенного сервиса и законных интересов по обеспечению безопасности платформы.",
        ],
      },
      {
        heading: "4. Хранение, защита и инфраструктура",
        paragraphs: [
          "Данные объявлений и изображения размещаются в облачной инфраструктуре (включая Supabase), а доставка веб-приложения и отправка писем подтверждения выполняются через соответствующие сервисы хостинга и почтовой доставки.",
          "Применяются технические и организационные меры защиты данных. Контактные данные продавца, указанные в объявлении, отображаются пользователям в карточке и на странице объявления.",
        ],
      },
      {
        heading: "5. Сроки хранения и удаление данных",
        paragraphs: [
          "Объявления хранятся, пока они актуальны или пока действует аккаунт пользователя. Пользователь может изменять и удалять свои объявления в разделе 'Мои объявления'.",
          "Пользователь вправе запросить удаление своих данных и аккаунта, обратившись к администрации платформы.",
        ],
      },
      {
        heading: "6. Права пользователя по GDPR",
        paragraphs: [
          "Вы имеете право на доступ к своим персональным данным, их исправление, удаление, ограничение обработки, возражение против обработки, а также на подачу жалобы в Государственную инспекцию данных Латвии (DVI, www.dvi.gov.lv).",
        ],
      },
    ],
  },
  en: {
    back: "← Back to AutoLatvija",
    title: "Privacy Policy (GDPR / EU & Latvian Data Protection Law)",
    updated: "Effective: 2026 | Platform: AutoLatvija",
    sections: [
      {
        heading: "1. General Provisions & Scope",
        paragraphs: [
          "This Privacy Policy explains how the vehicle classifieds platform AutoLatvija collects, processes, stores, and protects user personal data in accordance with Regulation (EU) 2016/679 (General Data Protection Regulation — GDPR) and applicable Latvian personal data protection law.",
          "The platform enables users in Latvia to publish vehicle listings and connect buyers and sellers for cars, motorcycles, and related vehicles.",
        ],
      },
      {
        heading: "2. Categories of Data Processed",
        paragraphs: [
          "Account & authentication data: email address, profile name, and authentication credentials used for registration, email verification, and listing management.",
          "Listing & contact data: vehicle brand, model, year, mileage, price, city, technical inspection (TA) validity, description, uploaded images, and seller phone number (including phone and WhatsApp contact).",
          "Browser storage data: saved favorites and UI preferences may be stored locally in the user's browser (localStorage).",
        ],
      },
      {
        heading: "3. Purposes & Legal Basis for Processing",
        paragraphs: [
          "Data is processed to operate the classifieds platform, display user listings, enable buyer-seller communication, prevent fraud or abuse, and maintain service reliability.",
          "Processing relies on user consent, service delivery requirements, and legitimate interests in keeping the platform secure and functional.",
        ],
      },
      {
        heading: "4. Storage, Security & Service Providers",
        paragraphs: [
          "Listings and uploaded media are stored on cloud infrastructure (including Supabase), while web hosting and verification emails rely on supporting infrastructure and email delivery providers.",
          "Reasonable technical and organizational safeguards are applied to protect data. Contact details provided inside a public listing are visible to visitors viewing that listing.",
        ],
      },
      {
        heading: "5. Retention & Deletion",
        paragraphs: [
          "Listings remain stored while active or while needed for account operation. Users can edit or delete their listings under 'My listings'.",
          "Users may request deletion of their account and associated personal data by contacting the platform administrator.",
        ],
      },
      {
        heading: "6. Your Rights Under GDPR",
        paragraphs: [
          "Under GDPR, you have the right to request access to, rectification of, erasure of, or restriction of processing of your personal data, to object to processing, and to lodge a complaint with the Data State Inspectorate of Latvia (DVI, www.dvi.gov.lv).",
        ],
      },
    ],
  },
};

export default function PrivacyPolicyPage() {
  const [lang, setLang] = useState<Lang>("lv");
  const doc = CONTENT[lang];

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100">
      <header className="border-b border-white/10 bg-[#0e1420]">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-4">
          <a
            href="/"
            className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-white/10"
          >
            {doc.back}
          </a>

          <div className="flex rounded-xl border border-white/15 bg-white/5 p-0.5 text-xs font-bold">
            {(["lv", "ru", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={`rounded-lg px-2.5 py-1 uppercase cursor-pointer ${
                  lang === code ? "bg-amber-400 text-slate-950" : "text-slate-300"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <article className="rounded-2xl border border-white/10 bg-[#121826] p-6 sm:p-8">
          <p className="text-xs font-semibold text-amber-400">{doc.updated}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-white">{doc.title}</h1>

          <div className="mt-6 space-y-6">
            {doc.sections.map((sec) => (
              <section key={sec.heading} className="space-y-2 border-t border-white/10 pt-5">
                <h2 className="text-sm font-extrabold text-white">{sec.heading}</h2>
                {sec.paragraphs.map((p, idx) => (
                  <p key={idx} className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </article>
                <div className="mt-6 rounded-2xl border border-amber-400/25 bg-amber-400/5 p-4 text-xs leading-relaxed text-slate-300 space-y-2">
            <p><strong className="text-amber-300">LV — Ziņojumu drošība:</strong> Platformas iekšējie ziņojumi starp pircējiem un pārdevējiem tiek saglabāti krāpšanas novēršanai, strīdu risināšanai un drošības nodrošināšanai, un nepieciešamības gadījumā tos var pārskatīt pilnvarota platformas administrācija.</p>
            <p><strong className="text-amber-300">RU — Безопасность сообщений:</strong> Внутренние сообщения между покупателями и продавцами сохраняются для предотвращения мошенничества, разрешения споров и обеспечения безопасности и при необходимости могут быть проверены уполномоченной администрацией платформы.</p>
            <p><strong className="text-amber-300">EN — Message Moderation &amp; Safety:</strong> Platform-internal messages between buyers and sellers are stored for fraud prevention, dispute resolution, and technical security, and may be reviewed by authorized platform administration when necessary.</p>
          </div>
      </main>
    </div>
  );
}