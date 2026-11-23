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
    title: "Lietošanas noteikumi un pakalpojuma līgums",
    updated: "Spēkā no: 2026. gada | Platforma: AutoLatvija",
    sections: [
      {
        heading: "1. Noteikumu piemērošana",
        paragraphs: [
          "Šie lietošanas noteikumi regulē piekļuvi AutoLatvija transportlīdzekļu sludinājumu platformai un tās izmantošanu. Uzsākot platformas lietošanu, konta reģistrāciju vai sludinājuma publicēšanu, lietotājs apliecina, ka iepazinies ar šiem noteikumiem.",
        ],
      },
      {
        heading: "2. Pakalpojuma būtība un platformas loma",
        paragraphs: [
          "AutoLatvija ir tiešsaistes sludinājumu vide transportlīdzekļu iegādei un pārdošanai Latvijā. Platforma pati nepārdod un nepērk transportlīdzekļus, nepārbauda katra transportlīdzekļa faktisko tehnisko stāvokli klātienē un nav darījuma puse starp pircēju un pārdevēju.",
          "Visus darījumus, norēķinus, īpašumtiesību pārbaudi un reģistrāciju (tostarp CSDD formalitātes) pircējs un pārdevējs veic savā starpā patstāvīgi.",
        ],
      },
      {
        heading: "3. Lietotāja konts un sludinājumu publicēšana",
        paragraphs: [
          "Lai pārvaldītu savus sludinājumus, lietotājs reģistrē kontu ar derīgu e-pasta adresi un apstiprina to. Lietotājs ir atbildīgs par savu pieslēgšanās datu drošību.",
          "Publicējot sludinājumu, lietotājs apliecina, ka sniegtā informācija (cena, izlaiduma gads, nobraukums, degvielas tips, ātrumkārba, pilsēta, TA derīgums, apraksts un kontaktinformācija) ir patiesa, precīza un nemaldinoša.",
          "Pārdevējs apliecina, ka tam ir tiesības rīkoties ar piedāvāto transportlīdzekli un izmantot pievienotās fotogrāfijas, nepārkāpjot trešo personu autortiesības vai citas tiesības.",
        ],
      },
      {
        heading: "4. Aizliegtās darbības un saturs",
        paragraphs: [
          "Platformā aizliegts ievietot fiktīvus vai krāpnieciskus sludinājumus, nepatiesu cenu vai nobraukumu, maldinošus attēlus, surogātpastu, kā arī jebkādu saturu, kas pārkāpj Latvijas Republikas vai Eiropas Savienības normatīvos aktus.",
          "Aizliegts veikt darbības, kas traucē platformas darbību, drošību, datu integritāti vai citu lietotāju piekļuvi.",
        ],
      },
      {
        heading: "5. Atbildības ierobežojums un moderācija",
        paragraphs: [
          "Platforma neatbild par sludinājumu saturā iekļauto ziņu pareizību, transportlīdzekļu kvalitāti, slēptiem defektiem, darījumu izpildi vai zaudējumiem, kas radušies pircēja, pārdevēja vai trešo personu rīcības rezultātā.",
          "AutoLatvija patur tiesības bez iepriekšēja brīdinājuma rediģēt vai dzēst noteikumiem neatbilstošus sludinājumus, kā arī ierobežot piekļuvi, ja tiek konstatēti pārkāpumi.",
        ],
      },
      {
        heading: "6. Noteikumu grozījumi un piemērojamās tiesības",
        paragraphs: [
          "Platformai ir tiesības periodiski aktualizēt šos lietošanas noteikumus, publicējot aktuālo redakciju platformā.",
          "Šiem noteikumiem piemērojamas Latvijas Republikas tiesību normas, un strīdi, kurus neizdodas atrisināt pārrunu ceļā, izskatāmi Latvijas Republikas tiesās normatīvajos aktos noteiktajā kārtībā.",
        ],
      },
    ],
  },
  ru: {
    back: "← Назад на AutoLatvija",
    title: "Пользовательское соглашение и правила использования",
    updated: "Действует с: 2026 год | Платформа: AutoLatvija",
    sections: [
      {
        heading: "1. Общие условия",
        paragraphs: [
          "Настоящие правила регулируют порядок доступа и использования платформы автомобильных объявлений AutoLatvija. Используя сайт, регистрируя аккаунт или размещая объявление, пользователь подтверждает согласие с данными условиями.",
        ],
      },
      {
        heading: "2. Назначение сервиса и роль платформы",
        paragraphs: [
          "AutoLatvija представляет собой онлайн-площадку для публикации объявлений о продаже и покупке транспортных средств в Латвии. Платформа не является продавцом или покупателем, не проводит физическую экспертизу каждого автомобиля и не участвует в расчетах между сторонами.",
          "Проверка документов, технического состояния, расчеты и оформление сделки (включая процедуры CSDD) осуществляются покупателем и продавцом самостоятельно.",
        ],
      },
      {
        heading: "3. Аккаунт и требования к объявлениям",
        paragraphs: [
          "Для управления объявлениями пользователь создает аккаунт с актуальным e-mail и подтверждает его. Пользователь несет ответственность за сохранность данных доступа к своему аккаунту.",
          "Размещая объявление, автор гарантирует достоверность и актуальность указанных сведений (цена, год, пробег, тип топлива, КПП, город, срок ТО, описание и контакты).",
          "Продавец гарантирует наличие прав на предложение транспортного средства и использование загруженных фотографий без нарушения прав третьих лиц.",
        ],
      },
      {
        heading: "4. Запрещенные действия и материалы",
        paragraphs: [
          "На платформе запрещены заведомо ложные или мошеннические объявления, вводящая в заблуждение информация, спам, нарушение авторских прав и публикация материалов, противоречащих законам Латвии и ЕС.",
          "Запрещены попытки нарушения работы сайта, безопасности инфраструктуры или сбора данных в обход установленных правил.",
        ],
      },
      {
        heading: "5. Ограничение ответственности и модерация",
        paragraphs: [
          "Платформа не несет ответственности за достоверность сведений в объявлениях, состояние транспортных средств, исполнение договоренностей между пользователями и возможные косвенные убытки.",
          "Администрация вправе удалять объявления, нарушающие правила, и ограничивать доступ аккаунтов при выявлении нарушений или злоупотреблений.",
        ],
      },
      {
        heading: "6. Изменение правил и применимое право",
        paragraphs: [
          "Правила могут обновляться путем публикации новой версии на платформе.",
          "К отношениям сторон применяется законодательство Латвийской Республики, а споры подлежат рассмотрению в компетентных судах Латвийской Республики.",
        ],
      },
    ],
  },
  en: {
    back: "← Back to AutoLatvija",
    title: "Terms of Use & Platform Agreement",
    updated: "Effective: 2026 | Platform: AutoLatvija",
    sections: [
      {
        heading: "1. Scope & Acceptance",
        paragraphs: [
          "These Terms of Use govern access to and use of the AutoLatvija vehicle classifieds platform. By using the website, creating an account, or posting a listing, you agree to be bound by these terms.",
        ],
      },
      {
        heading: "2. Nature of Service & Platform Role",
        paragraphs: [
          "AutoLatvija is an online classifieds platform for vehicle listings in Latvia. The platform does not buy or sell vehicles directly, does not physically inspect listed vehicles on behalf of buyers, and is not a party to transactions between users.",
          "Buyers and sellers are independently responsible for verifying vehicle condition, legal status, payment terms, and registration formalities (including CSDD procedures).",
        ],
      },
      {
        heading: "3. Accounts & Listing Requirements",
        paragraphs: [
          "To manage listings, users register an account using a valid email address and complete verification. Users are responsible for keeping their account credentials secure.",
          "By publishing a listing, the user represents that all provided details (price, year, mileage, fuel, transmission, city, TA status, description, and contact information) are accurate and not misleading.",
          "Sellers confirm they have the right to offer the vehicle and use uploaded photos without infringing third-party copyrights or other rights.",
        ],
      },
      {
        heading: "4. Prohibited Conduct & Content",
        paragraphs: [
          "Fraudulent or deceptive listings, inaccurate pricing or mileage, spam, copyright infringement, and any content violating Latvian or European Union law are strictly prohibited.",
          "Users must not interfere with platform availability, security, or data integrity.",
        ],
      },
      {
        heading: "5. Limitation of Liability & Moderation",
        paragraphs: [
          "AutoLatvija is not liable for the accuracy of user-submitted listings, vehicle condition or defects, completion of transactions, or damages arising from user conduct.",
          "The platform reserves the right to remove listings that violate these rules and restrict accounts engaged in abuse or rule violations.",
        ],
      },
      {
        heading: "6. Amendments & Governing Law",
        paragraphs: [
          "These terms may be updated from time to time by publishing a revised version on the platform.",
          "These terms are governed by the laws of the Republic of Latvia, and disputes not resolved amicably shall be subject to the jurisdiction of the courts of the Republic of Latvia.",
        ],
      },
    ],
  },
};

export default function AgreementPage() {
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
      </main>
    </div>
  );
}