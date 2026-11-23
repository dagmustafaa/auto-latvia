"use client";

import React, { useState } from "react";
import { supabase } from "../../lib/supabase";

type Lang = "lv" | "ru" | "en";

const TEXT: Record<
  Lang,
  {
    back: string;
    title: string;
    subtitle: string;
    topicLabel: string;
    topics: string[];
    nameLabel: string;
    namePh: string;
    senderEmailLabel: string;
    senderEmailPh: string;
    msgLabel: string;
    msgPh: string;
    sendBtn: string;
    sendingBtn: string;
    successMsg: string;
    errorMsg: string;
  }
> = {
  lv: {
    back: "← Atpakaļ uz AutoLatvija",
    title: "Sazināties ar AutoLatvija",
    subtitle: "Aizpildiet formu — jūsu ziņojums tiks droši nosūtīts platformas administrācijai.",
    topicLabel: "Temats",
    topics: [
      "Sludinājumu atbalsts",
      "Konta un datu dzēšana (GDPR)",
      "Kļūdas ziņojums",
      "Sadarbība / Reklāma",
    ],
    nameLabel: "Jūsu vārds",
    namePh: "Ievadiet vārdu",
    senderEmailLabel: "Jūsu e-pasts atbildei",
    senderEmailPh: "name@example.lv",
    msgLabel: "Ziņojums",
    msgPh: "Uzrakstiet savu jautājumu vai pieprasījumu...",
    sendBtn: "Nosūtīt ziņojumu",
    sendingBtn: "Nosūta...",
    successMsg: "Paldies! Jūsu ziņojums ir saņemts. Atbildēsim uz norādīto e-pastu.",
    errorMsg: "Neizdevās nosūtīt ziņojumu. Lūdzu, mēģiniet vēlreiz.",
  },
  ru: {
    back: "← Назад на AutoLatvija",
    title: "Связаться с AutoLatvija",
    subtitle: "Заполните форму — ваше обращение будет напрямую передано администрации платформы.",
    topicLabel: "Тема",
    topics: [
      "Поддержка по объявлениям",
      "Удаление аккаунта и данных (GDPR)",
      "Сообщить об ошибке",
      "Сотрудничество / Реклама",
    ],
    nameLabel: "Ваше имя",
    namePh: "Введите имя",
    senderEmailLabel: "Ваш e-mail для ответа",
    senderEmailPh: "name@example.com",
    msgLabel: "Сообщение",
    msgPh: "Опишите ваш вопрос или запрос...",
    sendBtn: "Отправить сообщение",
    sendingBtn: "Отправка...",
    successMsg: "Спасибо! Ваше сообщение отправлено. Мы ответим на указанный e-mail.",
    errorMsg: "Не удалось отправить сообщение. Попробуйте еще раз.",
  },
  en: {
    back: "← Back to AutoLatvija",
    title: "Contact AutoLatvija",
    subtitle: "Fill out the form below — your message will be delivered directly to the platform team.",
    topicLabel: "Topic",
    topics: [
      "Listing support",
      "Account & data deletion (GDPR)",
      "Report an issue",
      "Partnership / Advertising",
    ],
    nameLabel: "Your name",
    namePh: "Enter your name",
    senderEmailLabel: "Your email for reply",
    senderEmailPh: "name@example.com",
    msgLabel: "Message",
    msgPh: "Write your question or request...",
    sendBtn: "Send message",
    sendingBtn: "Sending...",
    successMsg: "Thank you! Your message has been received. We will reply to your email.",
    errorMsg: "Failed to send message. Please try again.",
  },
};

export default function ContactPage() {
  const [lang, setLang] = useState<Lang>("lv");
  const t = TEXT[lang];

  const [topic, setTopic] = useState(t.topics[0]);
  const [name, setName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  function switchLang(next: Lang) {
    setLang(next);
    setTopic(TEXT[next].topics[0]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setStatus("idle");

    try {
      const { error } = await supabase.from("contact_messages").insert({
        topic,
        sender_name: name.trim(),
        sender_email: senderEmail.trim(),
        message: message.trim(),
      });

      if (error) {
        setStatus("error");
        return;
      }

      setStatus("success");
      setName("");
      setSenderEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    } finally {
      setSending(false);
    }
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

          {status === "success" && (
            <div className="mt-5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300">
              {t.successMsg}
            </div>
          )}

          {status === "error" && (
            <div className="mt-5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300">
              {t.errorMsg}
            </div>
          )}

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

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={sending}
                className="rounded-xl bg-amber-400 px-6 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-300 disabled:opacity-60 cursor-pointer"
              >
                {sending ? t.sendingBtn : t.sendBtn}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}