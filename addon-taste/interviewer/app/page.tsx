"use client";

import { useEffect, useRef, useState } from "react";
import { AGENTS } from "@/lib/agents";
import { deckFor, injectionPromptFor, type Geste, type Verdict, type Injection } from "@/lib/artefacts";
import { fileToImage } from "@/lib/image";

type ImgPart = { type: "image"; source: { type: "base64"; media_type: string; data: string } };
type TextPart = { type: "text"; text: string };
type Content = string | Array<TextPart | ImgPart>;
type Msg = { role: "user" | "assistant"; content: Content };
type Attachment = { media_type: string; data: string; url: string };
type Phase = "setup" | "interview" | "classification" | "injection" | "fiche";
type Draft = { label: string; stance: "fétiche" | "bête-noire"; why: string; image?: { media_type: string; data: string; url: string } };

const agentList = ["sally", "tessa", "john", "camille", "winston", "dara", "margaux"]
  .map((id) => AGENTS[id])
  .filter(Boolean);

const GESTES: { key: Geste; label: string }[] = [
  { key: "garde", label: "Je garde" },
  { key: "jette", label: "Je jette" },
  { key: "recombine", label: "Je recombine" },
];

export default function Page() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [agentId, setAgentId] = useState("sally");
  const [interviewer, setInterviewer] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [pin, setPin] = useState("");
  const [skipInterview, setSkipInterview] = useState(false);

  // Entretien
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Classification
  const [cardIdx, setCardIdx] = useState(0);
  const [verdicts, setVerdicts] = useState<Verdict[]>([]);
  const [cardReason, setCardReason] = useState("");

  // Injection
  const [injections, setInjections] = useState<Injection[]>([]);
  const [draft, setDraft] = useState<Draft>({ label: "", stance: "fétiche", why: "" });

  // Sortie
  const [fiche, setFiche] = useState<string | null>(null);
  const [stored, setStored] = useState<boolean | null>(null);
  const [storeError, setStoreError] = useState(false);

  const streamRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const injFileRef = useRef<HTMLInputElement>(null);

  const agent = AGENTS[agentId];
  const deck = deckFor(agentId);

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  // ---------- ENTRETIEN ----------
  async function callChat(next: Msg[]) {
    setBusy(true);
    setError(null);
    setMessages([...next, { role: "assistant", content: "" }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, accessCode, messages: next }),
      });
      if (!res.ok || !res.body) throw new Error((await res.text()) || "Erreur réseau.");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages((m) => {
          const c = m.slice();
          c[c.length - 1] = { role: "assistant", content: acc };
          return c;
        });
      }
    } catch (e: any) {
      setError(e?.message || "Erreur.");
      setMessages(next);
    } finally {
      setBusy(false);
    }
  }

  async function start() {
    if (!interviewer.trim()) return setError("Mets ton prénom d'abord (il nomme ta personnalité).");
    if (!/^\d{4}$/.test(pin)) return setError("Choisis un code à 4 chiffres (il protège ta personnalité).");
    setError(null);
    // Valide accès + code de profil MAINTENANT (sinon ça n'échouerait qu'au tout dernier appel).
    setBusy(true);
    let ok = false;
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, interviewer, pin, accessCode }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data?.error || "Erreur.");
      if (data.exists && !data.ok) throw new Error("Ce profil existe déjà — le code à 4 chiffres ne correspond pas.");
      ok = true;
    } catch (e: any) {
      setError(e?.message || "Erreur.");
    } finally {
      setBusy(false);
    }
    if (!ok) return;
    if (skipInterview) {
      setPhase("classification");
    } else {
      setPhase("interview");
      callChat([{ role: "user", content: "Bonjour, je suis prêt·e — on peut commencer." }]);
    }
  }

  function sendMessage() {
    if (busy) return;
    const text = input.trim();
    if (!text && attachments.length === 0) return;
    let content: Content;
    if (attachments.length > 0) {
      content = [
        ...(text ? [{ type: "text", text } as TextPart] : []),
        ...attachments.map(
          (a) => ({ type: "image", source: { type: "base64", media_type: a.media_type, data: a.data } } as ImgPart)
        ),
      ];
    } else {
      content = text;
    }
    setInput("");
    setAttachments([]);
    callChat([...messages, { role: "user", content }]);
  }

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const picked = Array.from(files).slice(0, 6);
    try {
      const loaded = await Promise.all(picked.map(fileToImage));
      setAttachments((a) => [...a, ...loaded]);
    } catch (e: any) {
      setError(e?.message || "Image illisible.");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  // ---------- CLASSIFICATION ----------
  function recordVerdict(geste: Geste) {
    if (!deck) return;
    const card = deck.cards[cardIdx];
    setVerdicts((v) => [...v.filter((x) => x.id !== card.id), { id: card.id, label: card.label, geste, reason: cardReason.trim() }]);
    setCardReason("");
    nextCard();
  }
  function nextCard() {
    setCardReason(""); // ne pas laisser la raison fuiter sur la carte suivante (cas « Passer »)
    if (!deck) return setPhase("injection");
    if (cardIdx + 1 >= deck.cards.length) setPhase("injection");
    else setCardIdx((i) => i + 1);
  }

  // ---------- INJECTION ----------
  async function onInjFile(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    try {
      const image = await fileToImage(f);
      setDraft((d) => ({ ...d, image }));
    } catch (e: any) {
      setError(e?.message || "Image illisible.");
    }
    if (injFileRef.current) injFileRef.current.value = "";
  }
  function addInjection() {
    const label = draft.label.trim();
    if (!label) return;
    const item: Injection = {
      label,
      stance: draft.stance,
      why: draft.why.trim(),
      image: draft.image ? { media_type: draft.image.media_type, data: draft.image.data } : undefined,
    };
    setInjections((arr) => [...arr, item]);
    setDraft({ label: "", stance: "fétiche", why: "" });
  }

  // ---------- FICHE ----------
  async function generate() {
    // Flush d'un brouillon d'injection rempli mais pas encore « Ajouté » (sinon il serait perdu).
    const pending: Injection[] = draft.label.trim()
      ? [{
          label: draft.label.trim(),
          stance: draft.stance,
          why: draft.why.trim(),
          image: draft.image ? { media_type: draft.image.media_type, data: draft.image.data } : undefined,
        }]
      : [];
    const allInjections = [...injections, ...pending];
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/fiche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, accessCode, pin, messages, interviewer, classification: verdicts, injection: allInjections }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data?.error || `Échec (${res.status}) — la fiche n'a pas pu être générée.`);
      if (!data?.fiche || !String(data.fiche).trim()) throw new Error("La fiche est revenue vide — réessaie.");
      if (pending.length) {
        setInjections(allInjections);
        setDraft({ label: "", stance: "fétiche", why: "" });
      }
      setFiche(data.fiche);
      setStored(!!data.stored);
      setStoreError(!!data.storeError);
      setPhase("fiche");
    } catch (e: any) {
      setError(e?.message || "Erreur.");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!fiche) return;
    const blob = new Blob([fiche], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `jumeau-${agentId}-${interviewer || "anon"}.md`;
    a.click();
  }

  const exchanges = messages.filter((m) => m.role === "user").length;

  // ============ SETUP ============
  if (phase === "setup") {
    return (
      <main className="wrap">
        <div className="setup">
          <h1>Intervieweur de goût</h1>
          <p className="sub">
            On capture ton goût de métier en 3 temps : entretien, puis réaction à des artefacts, puis tes propres
            références. Réponds franchement, tranché — « je sais pas » est une réponse valable.
          </p>
          <div className="field">
            <label>Ton prénom (il nomme ta personnalité)</label>
            <input value={interviewer} onChange={(e) => setInterviewer(e.target.value)} placeholder="Alex" />
          </div>
          <div className="field">
            <label>Quel profil tu incarnes ?</label>
            <select value={agentId} onChange={(e) => setAgentId(e.target.value)}>
              {agentList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.title}
                  {a.modality === "image" ? " (réactions à des images)" : ""}
                </option>
              ))}
            </select>
            <div className="agent-title">
              {agent?.title}
              {agent?.modality === "image" && <span className="badge">prépare 5-10 images hors-sujet</span>}
            </div>
          </div>
          <div className="field">
            <label>Code d'accès</label>
            <input value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder="(fourni par Ismaïl)" />
          </div>
          <div className="field">
            <label>Ton code à 4 chiffres (protège ta personnalité)</label>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              placeholder="••••"
            />
          </div>
          <label className="check">
            <input type="checkbox" checked={skipInterview} onChange={(e) => setSkipInterview(e.target.checked)} />
            J'ai déjà fait l'entretien — aller directement aux artefacts
          </label>
          {error && <p className="err">{error}</p>}
          <button className="full" onClick={start} disabled={busy}>
            {busy ? "…" : skipInterview ? "Commencer la classification" : "Commencer l'entretien"}
          </button>
        </div>
      </main>
    );
  }

  // ============ FICHE ============
  if (phase === "fiche") {
    return (
      <main className="wrap">
        <div className="fiche-wrap">
          <h1 style={{ fontSize: 22 }}>
            Fiche — {agent?.name} · {interviewer || "anon"}
          </h1>
          {stored ? (
            <p className="stored">✓ Envoyée à Ismaïl (stockée).</p>
          ) : storeError ? (
            <p className="err" style={{ textAlign: "left" }}>
              ⚠️ Le stockage a échoué (la fiche n'a PAS été enregistrée) — copie/télécharge-la et envoie-la à Ismaïl.
            </p>
          ) : (
            <p className="notstored">Pas de stockage configuré — copie/télécharge et envoie-la à Ismaïl.</p>
          )}
          <div className="row">
            <button onClick={() => navigator.clipboard.writeText(fiche ?? "")}>Copier</button>
            <button className="ghost" onClick={download}>
              Télécharger .md
            </button>
          </div>
          <div className="fiche-md">{fiche}</div>
        </div>
      </main>
    );
  }

  // ============ CLASSIFICATION ============
  if (phase === "classification") {
    const card = deck?.cards[cardIdx];
    return (
      <main className="wrap">
        <PhaseHead agent={agent} step="2 · Classification" right={deck ? `${cardIdx + 1} / ${deck.cards.length}` : ""} />
        <div className="phase-body">
          {!deck ? (
            <>
              <p className="sub">Pas d'artefacts pour ce profil — passe directement à l'injection.</p>
              <div className="actions">
                <button className="ghost" onClick={() => setPhase("injection")}>
                  Passer à l'injection →
                </button>
              </div>
            </>
          ) : (
            <>
              {cardIdx === 0 && <p className="sub">{deck.intro}</p>}
              <div className="card">
                {card?.src && <img className="card-img" src={card.src} alt="" />}
                <div className="card-stim">{card?.label}</div>
                {card?.hint && <div className="card-hint">{card.hint}</div>}
              </div>
              <textarea
                className="reason"
                value={cardReason}
                onChange={(e) => setCardReason(e.target.value)}
                placeholder="Pourquoi ? (au grain — la couleur, le geste, l'intention…)"
              />
              <div className="geste-row">
                {GESTES.map((g) => (
                  <button key={g.key} className={`geste ${g.key}`} onClick={() => recordVerdict(g.key)} disabled={busy}>
                    {g.label}
                  </button>
                ))}
              </div>
              <div className="actions">
                <button className="ghost" onClick={nextCard}>
                  Passer cet artefact →
                </button>
                <button className="ghost" onClick={() => setPhase("injection")}>
                  Terminer la classification →
                </button>
              </div>
            </>
          )}
          {error && <p className="err">{error}</p>}
        </div>
      </main>
    );
  }

  // ============ INJECTION ============
  if (phase === "injection") {
    // Plancher anti-fiche-vide : assez de matière (entretien + verdicts + injections, brouillon compris).
    const signals = exchanges + verdicts.length + injections.length + (draft.label.trim() ? 1 : 0);
    const enough = signals >= 3;
    return (
      <main className="wrap">
        <PhaseHead agent={agent} step="3 · Injection" right={`${injections.length} ajouté${injections.length > 1 ? "s" : ""}`} />
        <div className="phase-body">
          <p className="sub">À toi d'apporter tes artefacts. {injectionPromptFor(agentId)}</p>

          {injections.length > 0 && (
            <div className="inj-list">
              {injections.map((it, i) => (
                <div key={i} className="inj-item">
                  <span className={`stance ${it.stance === "fétiche" ? "love" : "hate"}`}>{it.stance}</span>
                  <div className="inj-body">
                    <div className="inj-label">{it.label}</div>
                    {it.why && <div className="inj-why">{it.why}</div>}
                  </div>
                  {it.image && <span className="badge">🖼️</span>}
                  <button className="iconbtn" onClick={() => setInjections((a) => a.filter((_, j) => j !== i))} title="Retirer">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="inj-form">
            <div className="stance-toggle">
              <button
                className={draft.stance === "fétiche" ? "on" : ""}
                onClick={() => setDraft((d) => ({ ...d, stance: "fétiche" }))}
              >
                Fétiche
              </button>
              <button
                className={draft.stance === "bête-noire" ? "on" : ""}
                onClick={() => setDraft((d) => ({ ...d, stance: "bête-noire" }))}
              >
                Bête noire
              </button>
            </div>
            <input
              className="inj-input"
              value={draft.label}
              onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
              placeholder="L'artefact (ex. « l'app Linear », « la pub Cantona Nike »…)"
            />
            <textarea
              className="reason"
              value={draft.why}
              onChange={(e) => setDraft((d) => ({ ...d, why: e.target.value }))}
              placeholder="Pourquoi tu l'aimes / le détestes ?"
            />
            {draft.image && (
              <div className="attachments">
                <img src={draft.image.url} alt="" />
              </div>
            )}
            <div className="inj-actions">
              <button className="iconbtn" onClick={() => injFileRef.current?.click()} title="Joindre une image">
                ＋
              </button>
              <input ref={injFileRef} type="file" accept="image/*" hidden onChange={(e) => onInjFile(e.target.files)} />
              <button className="ghost" onClick={addInjection} disabled={!draft.label.trim()}>
                Ajouter
              </button>
            </div>
          </div>

          {error && <p className="err">{error}</p>}
          <div className="actions">
            <button onClick={generate} disabled={busy || !enough}>
              {busy ? "Génération…" : "Générer la fiche"}
            </button>
          </div>
          {!enough && <p className="notstored" style={{ textAlign: "center" }}>Encore un peu de matière (réagis à quelques artefacts ou ajoute des références) avant de générer.</p>}
        </div>
      </main>
    );
  }

  // ============ INTERVIEW (chat) ============
  return (
    <main className="wrap">
      <PhaseHead agent={agent} step="1 · Entretien" right={`${exchanges} réponses`} />

      <div className="stream" ref={streamRef}>
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <div className={`bubble ${busy && i === messages.length - 1 && m.role === "assistant" ? "cursor" : ""}`}>
              {renderContent(m.content)}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="err">{error}</p>}

      <div className="composer">
        {attachments.length > 0 && (
          <div className="attachments">
            {attachments.map((a, i) => (
              <img key={i} src={a.url} alt="" />
            ))}
          </div>
        )}
        <div className="input-row">
          <button className="iconbtn" onClick={() => fileRef.current?.click()} title="Joindre une image" disabled={busy}>
            ＋
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Réponds franchement…"
            disabled={busy}
          />
          <button onClick={sendMessage} disabled={busy || (!input.trim() && attachments.length === 0)}>
            ↑
          </button>
        </div>
        {exchanges >= 3 && (
          <div className="actions">
            <button className="ghost" onClick={() => setPhase("classification")} disabled={busy}>
              Passer à la classification →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function PhaseHead({ agent, step, right }: { agent?: { name: string; title: string }; step: string; right?: string }) {
  return (
    <div className="head">
      <div>
        <div className="who">{agent?.name}</div>
        <div className="meta">
          {agent?.title} · {step}
        </div>
      </div>
      {right ? <div className="meta">{right}</div> : null}
    </div>
  );
}

function renderContent(content: Content) {
  if (typeof content === "string") return content;
  return (
    <>
      {content.map((cn, i) =>
        cn.type === "text" ? (
          <span key={i}>{cn.text}</span>
        ) : (
          <img key={i} className="thumb" src={`data:${cn.source.media_type};base64,${cn.source.data}`} alt="" />
        )
      )}
    </>
  );
}
