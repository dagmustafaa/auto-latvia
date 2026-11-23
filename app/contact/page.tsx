"use client";

import React, { useState } from "react";

type Lang = "lv" | "ru" | "en";

const CONTACT_EMAIL = "autolatvia.lv@gmail.com";

const TEXT: Record<
  Lang,
  {
    back: string;
    title: string;
    subtitle: string;
    emailLabel: string;
    copyBtn: string;
    copiedBtn: string;
    topicLabel: string;
    topics: string[];
    nameLabel: string;
    namePh: string;
    senderEmailLabel: string;
    senderEmailPh: string;
    msgLabel: string;
    msgPh: string;
    sendBtn: string;
    sentHint: string;
  }
> = {
  lv: {
    back: "← Atpakaļ uz AutoLatvija",
    title: "Sazināties ar AutoLatvija",
    subtitle: "Jautājumi par sludinājumiem, kontu, datu dzēšanu (GDPR) vai sadarbību.",
    emailLabel: "E-pasts saziņai",
    copyBtn: "Kopēt",
    copiedBtn: "Nokopēts ✓",
    topicLabel: "Temats",
    topics: [
      "Sludinājumu atbalsts",
      "Konta un datu dzēšana (GDPR)",
      "Kļūdas ziņojums",
      "Sadarbība / Reklāma",
    ],
    nameLabel: "Jūsu vārds",
    namePh: "Ievadiet vārdu",
    senderEmailLabel: "Jūsu e-pasts",
    senderEmailPh: "name@example.lv",
    msgLabel: "Ziņojums",
    msgPh: "Uzrakstiet savu jautājumu vai pieprasījumu...",
    sendBtn: "Atvērt e-pasta ziņojumu",
    sentHint: "Nospiežot pogu, atvērsies jūsu e-pasta programma ar sagatavotu ziņojumu.",
  },
  ru: {
    back: "← Назад на AutoLatvija",
    title: "Связаться с AutoLatvija",
    subtitle: "Вопросы по объявлениям, аккаунту, удалению данных (GDPR) или сотрудничеству.",
    emailLabel: "Контактный e-mail",
    copyBtn: "Копировать",
    copiedBtn: "Скопировано ✓",
    topicLabel: "Тема",
    topics: [
      "Поддержка по объявлениям",
      "Удаление аккаунта и данных (GDPR)",
      "Сообщить об ошибке",
      "Сотрудничество / Реклама",
    ],
    nameLabel: "Ваше имя",
    namePh: "Введите имя",
    senderEmailLabel: "Ваш e-mail",
    senderEmailPh: "name@example.com",
    msgLabel: "Сообщение",
    msgPh: "Опишите ваш вопрос или запрос...",
    sendBtn: "Открыть письмо в почте",
    sentHint: "Откроется ваш почтовый клиент с готовым текстом обращения.",
  },
  en: {
    back: "← Back to AutoLatvija",
    title: "Contact AutoLatvija",
    subtitle: "Questions about listings, accounts, GDPR data deletion, or collaboration.",
    emailLabel: "Contact email",
    copyBtn: "Copy",
    copiedBtn: "Copied ✓",
    topicLabel: "Topic",
    topics: [
      "Listing support",
      "Account & data deletion (GDPR)",
      "Report an issue",
      "Partnership / Advertising",
    ],
    nameLabel: "Your name",
    namePh: "Enter your name",
    senderEmailLabel: "Your email",
    senderEmailPh: "name@example.com",
    msgLabel: "Message",
    msgPh: "Write your question or request...",
    sendBtn: "Compose email",
    sentHint: "Clicking opens your mail client pre-filled with your message.",
  },
};

export default function ContactPage() {
  const [lang, setLang] = useState<Lang>("lv");
  const t = TEXT[lang];

  const [topic, setTopic] = useState(t.topics[0]);
  const [name, setName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  function switchLang(next: Lang) {
    setLang(next);
    setTopic(TEXT[next].topics[0]);
  }

  function handleCopyEmail() {
    navigator.clipboard?.writeText(CONTACT_EMAIL).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`[AutoLatvija] ${topic}`);
    const body = encodeURIComponent(
      `Name: ${name || "-"}\nEmail: ${senderEmail || "-"}\nTopic: ${topic}\n\n${message}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100">
      <header className="border-b border-white/10 bg-[#0e1420]">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
          <a
            href="/"
            className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-white/10"
          >
            {t.back}
          </a>

          <div className="flex rounded-xl border border-white/15 bg-white/5 p-0.5 text-xs font-bold">
            {(["lv", "ru", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => switchLang(code)}
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

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-2xl border border-white/10 bg-[#121826] p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold text-white">{t.title}</h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">{t.subtitle}</p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0b0f17] px-4 py-3 text-xs">
            <div>
              <span className="text-slate-400">{t.emailLabel}: </span>
              <strong className="font-mono text-amber-400">{CONTACT_EMAIL}</strong>
            </div>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 font-bold text-slate-200 hover:bg-white/10 cursor-pointer"
            >
              {copied ? t.copiedBtn : t.copyBtn}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300">{t.topicLabel}</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2.5 text-xs text-white"
              >
                {t.topics.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-300">{t.nameLabel}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePh}
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">{t.senderEmailLabel}</label>
                <input
                  type="email"
                  required
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder={t.senderEmailPh}
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300">{t.msgLabel}</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.msgPh}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#0b0f17] px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-400">{t.sentHint}</span>
              <button
                type="submit"
                className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-300 cursor-pointer"
              >
                {t.sendBtn}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}