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
type View = "setup" | "space" | "interview" | "classification" | "injection" | "fiche";
type Draft = { label: string; stance: "fétiche" | "bête-noire"; why: string; image?: { media_type: string; data: string; url: string } };
type Status = "empty" | "partial" | "done";
type ProfileSummary = { agent: string; status: Status; ficheVersion: number };

const agentList = ["sally", "tessa", "john", "camille", "winston", "dara", "margaux"].map((id) => AGENTS[id]).filter(Boolean);
const GESTES: { key: Geste; label: string }[] = [
  { key: "garde", label: "Je garde" },
  { key: "jette", label: "Je jette" },
  { key: "recombine", label: "Je recombine" },
];
const STATUS_BADGE: Record<Status, { dot: string; label: string; cls: string }> = {
  empty: { dot: "○", label: "à faire", cls: "st-empty" },
  partial: { dot: "◐", label: "en cours", cls: "st-partial" },
  done: { dot: "✅", label: "fiche faite", cls: "st-done" },
};

export default function Page() {
  const [view, setView] = useState<View>("setup");

  // Identité
  const [name, setName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [pin, setPin] = useState("");

  // Config publique (transparence)
  const [cfg, setCfg] = useState<{ operatorName: string; collected: boolean } | null>(null);

  // Espace
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [agentId, setAgentId] = useState("sally"); // profil en cours
  const [enrichMode, setEnrichMode] = useState(false);

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
  const [ficheVersion, setFicheVersion] = useState(0);
  const [stored, setStored] = useState(false);

  const streamRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const injFileRef = useRef<HTMLInputElement>(null);

  const agent = AGENTS[agentId];
  const deck = deckFor(agentId);

  useEffect(() => {
    fetch("/api/config").then((r) => r.json()).then(setCfg).catch(() => setCfg({ operatorName: "", collected: false }));
  }, []);
  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  function notice(): string {
    if (!cfg) return "";
    if (!cfg.collected) return "Ta personnalité n'est pas stockée — pense à la télécharger pour t'en servir.";
    const who = cfg.operatorName ? cfg.operatorName : "l'opérateur de cette instance";
    return `Ta personnalité est collectée par ${who} (sa clé API, son coût). Tu peux la télécharger pour t'en servir aussi.`;
  }
  function statusOf(id: string): Status {
    return (profiles.find((p) => p.agent === id)?.status as Status) || "empty";
  }

  // ---------- ENTRER DANS L'ESPACE ----------
  async function enter() {
    if (!name.trim()) return setError("Mets ton prénom.");
    if (!/^\d{4}$/.test(pin)) return setError("Choisis un code à 4 chiffres.");
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, accessCode, pin }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data?.error || "Erreur.");
      setProfiles(data.profiles || []);
      setView("space");
    } catch (e: any) {
      setError(e?.message || "Erreur.");
    } finally {
      setBusy(false);
    }
  }
  async function refreshSpace() {
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, accessCode, pin }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (res.ok) setProfiles(data.profiles || []);
    } catch {}
  }

  function openProfile(id: string) {
    setAgentId(id);
    setError(null);
    setMessages([]);
    setInput("");
    setAttachments([]);
    setCardIdx(0);
    setVerdicts([]);
    setCardReason("");
    setInjections([]);
    setDraft({ label: "", stance: "fétiche", why: "" });
    setFiche(null);
    const done = statusOf(id) === "done";
    setEnrichMode(done);
    if (done) {
      setView("classification"); // enrichir : on saute l'entretien
    } else {
      setView("interview");
      startInterview(id);
    }
  }
  async function delProfile(id: string) {
    if (!confirm(`Supprimer le profil ${AGENTS[id]?.name} ? (irréversible)`)) return;
    try {
      await fetch("/api/profile-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, accessCode, pin, agentId: id }),
      });
      refreshSpace();
    } catch {}
  }
  function backToSpace() {
    setView("space");
    refreshSpace();
  }

  // ---------- ENTRETIEN ----------
  async function callChat(next: Msg[], id = agentId) {
    setBusy(true);
    setError(null);
    setMessages([...next, { role: "assistant", content: "" }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: id, accessCode, messages: next }),
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
  function startInterview(id: string) {
    callChat([{ role: "user", content: "Bonjour, je suis prêt·e — on peut commencer." }], id);
  }
  function sendMessage() {
    if (busy) return;
    const text = input.trim();
    if (!text && attachments.length === 0) return;
    let content: Content;
    if (attachments.length > 0) {
      content = [
        ...(text ? [{ type: "text", text } as TextPart] : []),
        ...attachments.map((a) => ({ type: "image", source: { type: "base64", media_type: a.media_type, data: a.data } } as ImgPart)),
      ];
    } else content = text;
    setInput("");
    setAttachments([]);
    callChat([...messages, { role: "user", content }]);
  }
  async function onFiles(files: FileList | null) {
    if (!files) return;
    try {
      const loaded = await Promise.all(Array.from(files).slice(0, 6).map(fileToImage));
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
    nextCard();
  }
  function nextCard() {
    setCardReason("");
    if (!deck || cardIdx + 1 >= deck.cards.length) setView("injection");
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
    setInjections((arr) => [
      ...arr,
      { label, stance: draft.stance, why: draft.why.trim(), image: draft.image ? { media_type: draft.image.media_type, data: draft.image.data } : undefined },
    ]);
    setDraft({ label: "", stance: "fétiche", why: "" });
  }

  // ---------- GÉNÉRER ----------
  async function generate() {
    const pending: Injection[] = draft.label.trim()
      ? [{ label: draft.label.trim(), stance: draft.stance, why: draft.why.trim(), image: draft.image ? { media_type: draft.image.media_type, data: draft.image.data } : undefined }]
      : [];
    const allInjections = [...injections, ...pending];
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/fiche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, accessCode, name, pin, messages, classification: verdicts, injection: allInjections }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data?.error || `Échec (${res.status}).`);
      if (!data?.fiche || !String(data.fiche).trim()) throw new Error("La fiche est revenue vide — réessaie.");
      if (pending.length) {
        setInjections(allInjections);
        setDraft({ label: "", stance: "fétiche", why: "" });
      }
      setFiche(data.fiche);
      setFicheVersion(data.version || 0);
      setStored(!!data.stored);
      setView("fiche");
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
    a.download = `jumeau-${agentId}-${name || "anon"}.md`;
    a.click();
  }

  const exchanges = messages.filter((m) => m.role === "user").length;

  // ============ SETUP ============
  if (view === "setup") {
    return (
      <main className="wrap">
        <div className="setup">
          <h1>Intervieweur de goût</h1>
          <p className="sub">
            On capture ton goût de métier en 3 temps : entretien, réaction à des artefacts, puis tes propres références.
            Tu peux faire un seul profil ou plusieurs — tu choisiras dans ton espace.
          </p>
          {cfg && <p className="consent">ℹ️ {notice()}</p>}
          <div className="field">
            <label>Ton prénom (il nomme ton espace)</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" />
          </div>
          <div className="field">
            <label>Ton code à 4 chiffres (ouvre ton espace, protège tes profils)</label>
            <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="••••" />
          </div>
          <div className="field">
            <label>Code d'accès</label>
            <input value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder="(fourni par l'opérateur)" />
          </div>
          {error && <p className="err">{error}</p>}
          <button className="full" onClick={enter} disabled={busy}>
            {busy ? "…" : "Entrer dans mon espace"}
          </button>
        </div>
      </main>
    );
  }

  // ============ ESPACE ============
  if (view === "space") {
    return (
      <main className="wrap">
        <div className="head">
          <div>
            <div className="who">Espace de {name}</div>
            <div className="meta">choisis un profil — démarre, continue, ou enrichis</div>
          </div>
        </div>
        {cfg && <p className="consent">ℹ️ {notice()}</p>}
        <div className="phase-body">
          <div className="space-list">
            {agentList.map((a) => {
              const st = statusOf(a.id);
              const b = STATUS_BADGE[st];
              const action = st === "empty" ? "Démarrer" : st === "partial" ? "Continuer" : "Enrichir";
              return (
                <div key={a.id} className="space-row">
                  <div className="space-info">
                    <div className="space-name">
                      {a.name} <span className={`st ${b.cls}`}>{b.dot} {b.label}</span>
                    </div>
                    <div className="space-title">{a.title}</div>
                  </div>
                  <div className="space-actions">
                    <button onClick={() => openProfile(a.id)}>{action}</button>
                    {st !== "empty" && (
                      <button className="iconbtn" title="Supprimer ce profil" onClick={() => delProfile(a.id)}>
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  // ============ FICHE ============
  if (view === "fiche") {
    return (
      <main className="wrap">
        <div className="fiche-wrap">
          <h1 style={{ fontSize: 22 }}>
            Fiche — {agent?.name} · {name || "anon"} {ficheVersion ? `· v${ficheVersion}` : ""}
          </h1>
          {stored ? <p className="stored">✓ Enregistrée dans ton espace.</p> : <p className="notstored">Non stockée — copie/télécharge-la.</p>}
          {cfg && <p className="consent">ℹ️ {notice()}</p>}
          <div className="row">
            <button onClick={() => navigator.clipboard.writeText(fiche ?? "")}>Copier</button>
            <button className="ghost" onClick={download}>Télécharger .md</button>
            <button className="ghost" onClick={backToSpace}>← Mon espace</button>
          </div>
          <div className="fiche-md">{fiche}</div>
        </div>
      </main>
    );
  }

  // ============ CLASSIFICATION ============
  if (view === "classification") {
    const card = deck?.cards[cardIdx];
    return (
      <main className="wrap">
        <PhaseHead agent={agent} step={`2 · Classification${enrichMode ? " (enrichir)" : ""}`} right={deck ? `${cardIdx + 1} / ${deck.cards.length}` : ""} onBack={backToSpace} />
        <div className="phase-body">
          {!deck ? (
            <>
              <p className="sub">Pas d'artefacts pour ce profil — passe à l'injection.</p>
              <div className="actions"><button className="ghost" onClick={() => setView("injection")}>Passer à l'injection →</button></div>
            </>
          ) : (
            <>
              {cardIdx === 0 && <p className="sub">{enrichMode ? "Tu enrichis ce profil : réagis à de nouveaux artefacts. " : ""}{deck.intro}</p>}
              <div className="card">
                {card?.src && <img className="card-img" src={card.src} alt="" />}
                <div className="card-stim">{card?.label}</div>
              </div>
              <textarea className="reason" value={cardReason} onChange={(e) => setCardReason(e.target.value)} placeholder="Pourquoi ? (au grain — la couleur, le geste, l'intention…)" />
              <div className="geste-row">
                {GESTES.map((g) => (
                  <button key={g.key} className={`geste ${g.key}`} onClick={() => recordVerdict(g.key)} disabled={busy}>{g.label}</button>
                ))}
              </div>
              <div className="actions">
                <button className="ghost" onClick={nextCard}>Passer cet artefact →</button>
                <button className="ghost" onClick={() => setView("injection")}>Terminer la classification →</button>
              </div>
            </>
          )}
          {error && <p className="err">{error}</p>}
        </div>
      </main>
    );
  }

  // ============ INJECTION ============
  if (view === "injection") {
    const signals = exchanges + verdicts.length + injections.length + (draft.label.trim() ? 1 : 0);
    const enough = enrichMode ? signals >= 1 : signals >= 3;
    return (
      <main className="wrap">
        <PhaseHead agent={agent} step={`3 · Injection${enrichMode ? " (enrichir)" : ""}`} right={`${injections.length} ajouté${injections.length > 1 ? "s" : ""}`} onBack={backToSpace} />
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
                  <button className="iconbtn" onClick={() => setInjections((a) => a.filter((_, j) => j !== i))} title="Retirer">✕</button>
                </div>
              ))}
            </div>
          )}
          <div className="inj-form">
            <div className="stance-toggle">
              <button className={draft.stance === "fétiche" ? "on" : ""} onClick={() => setDraft((d) => ({ ...d, stance: "fétiche" }))}>Fétiche</button>
              <button className={draft.stance === "bête-noire" ? "on" : ""} onClick={() => setDraft((d) => ({ ...d, stance: "bête-noire" }))}>Bête noire</button>
            </div>
            <input className="inj-input" value={draft.label} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))} placeholder="L'artefact (ex. « l'app Linear », « la pub Cantona Nike »…)" />
            <textarea className="reason" value={draft.why} onChange={(e) => setDraft((d) => ({ ...d, why: e.target.value }))} placeholder="Pourquoi tu l'aimes / le détestes ?" />
            {draft.image && <div className="attachments"><img src={draft.image.url} alt="" /></div>}
            <div className="inj-actions">
              <button className="iconbtn" onClick={() => injFileRef.current?.click()} title="Joindre une image">＋</button>
              <input ref={injFileRef} type="file" accept="image/*" hidden onChange={(e) => onInjFile(e.target.files)} />
              <button className="ghost" onClick={addInjection} disabled={!draft.label.trim()}>Ajouter</button>
            </div>
          </div>
          {error && <p className="err">{error}</p>}
          <div className="actions">
            <button onClick={generate} disabled={busy || !enough}>{busy ? "Génération…" : enrichMode ? "Régénérer la fiche" : "Générer la fiche"}</button>
          </div>
          {!enough && <p className="notstored" style={{ textAlign: "center" }}>Encore un peu de matière avant de générer.</p>}
        </div>
      </main>
    );
  }

  // ============ ENTRETIEN ============
  return (
    <main className="wrap">
      <PhaseHead agent={agent} step="1 · Entretien" right={`${exchanges} réponses`} onBack={backToSpace} />
      <div className="stream" ref={streamRef}>
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <div className={`bubble ${busy && i === messages.length - 1 && m.role === "assistant" ? "cursor" : ""}`}>{renderContent(m.content)}</div>
          </div>
        ))}
      </div>
      {error && <p className="err">{error}</p>}
      <div className="composer">
        {attachments.length > 0 && <div className="attachments">{attachments.map((a, i) => <img key={i} src={a.url} alt="" />)}</div>}
        <div className="input-row">
          <button className="iconbtn" onClick={() => fileRef.current?.click()} title="Joindre une image" disabled={busy}>＋</button>
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
          <button onClick={sendMessage} disabled={busy || (!input.trim() && attachments.length === 0)}>↑</button>
        </div>
        {exchanges >= 3 && (
          <div className="actions">
            <button className="ghost" onClick={() => setView("classification")} disabled={busy}>Passer à la classification →</button>
          </div>
        )}
      </div>
    </main>
  );
}

function PhaseHead({ agent, step, right, onBack }: { agent?: { name: string; title: string }; step: string; right?: string; onBack?: () => void }) {
  return (
    <div className="head">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {onBack && <button className="iconbtn" title="Retour à mon espace" onClick={onBack}>←</button>}
        <div>
          <div className="who">{agent?.name}</div>
          <div className="meta">{agent?.title} · {step}</div>
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
      {content.map((cn, i) => (cn.type === "text" ? <span key={i}>{cn.text}</span> : <img key={i} className="thumb" src={`data:${cn.source.media_type};base64,${cn.source.data}`} alt="" />))}
    </>
  );
}
