"use client";

import { useEffect, useRef, useState } from "react";
import { AGENTS, agentTitle } from "@/lib/agents";
import { deckFor, injectionPromptFor, type Geste, type Verdict, type Injection } from "@/lib/artefacts";
import { hasVisualPool } from "@/lib/pools";
import { fileToImage } from "@/lib/image";
import { tr, detectLang, type Lang } from "@/lib/i18n";

type ImgPart = { type: "image"; source: { type: "base64"; media_type: string; data: string } };
type TextPart = { type: "text"; text: string };
type Content = string | Array<TextPart | ImgPart>;
type Msg = { role: "user" | "assistant"; content: Content };
type Attachment = { media_type: string; data: string; url: string };
type View = "setup" | "space" | "interview" | "classification" | "injection" | "fiche";
type Draft = { label: string; stance: "fétiche" | "bête-noire"; why: string; image?: { media_type: string; data: string; url: string } };
type Status = "empty" | "partial" | "done";
type ProfileSummary = { agent: string; status: Status; ficheVersion: number };
type Theme = "dark" | "light";

const agentList = ["sally", "tessa", "john", "camille", "margaux", "nora", "winston", "dara"].map((id) => AGENTS[id]).filter(Boolean);
const GESTE_KEYS: Geste[] = ["garde", "jette", "recombine"];
const STATUS_META: Record<Status, { dot: string; cls: string; key: "stEmpty" | "stPartial" | "stDone" }> = {
  empty: { dot: "○", cls: "st-empty", key: "stEmpty" },
  partial: { dot: "◐", cls: "st-partial", key: "stPartial" },
  done: { dot: "✅", cls: "st-done", key: "stDone" },
};

export default function Page() {
  const [view, setView] = useState<View>("setup");

  // Préférences (thème + langue)
  const [theme, setThemeState] = useState<Theme>("dark");
  const [lang, setLangState] = useState<Lang>("fr");
  const T = tr(lang);

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

  // Classification visuelle adaptative (pools d'écrans réels)
  type VArtefact = { id: string; app: string; imageUrl: string; mobbinUrl: string; framing: string; essence: string };
  const [vArtefact, setVArtefact] = useState<VArtefact | null>(null);
  const [vShown, setVShown] = useState<string[]>([]);
  const [vInterp, setVInterp] = useState("");
  const [vBusy, setVBusy] = useState(false);

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
  const deck = deckFor(agentId, lang);

  // Au montage : récupère thème + langue (posés tôt par le script inline du layout, sinon détecte).
  useEffect(() => {
    try {
      const t = (localStorage.getItem("theme") as Theme) || (document.documentElement.dataset.theme as Theme) || "dark";
      applyTheme(t);
      const l = (localStorage.getItem("lang") as Lang) || detectLang();
      applyLang(l);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    fetch("/api/config").then((r) => r.json()).then(setCfg).catch(() => setCfg({ operatorName: "", collected: false }));
  }, []);
  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  function applyTheme(t: Theme) {
    setThemeState(t);
    try {
      localStorage.setItem("theme", t);
      document.documentElement.dataset.theme = t;
    } catch {}
  }
  function applyLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
      document.documentElement.lang = l;
    } catch {}
  }

  function notice(): string {
    if (!cfg) return "";
    if (!cfg.collected) return T.noticeNotStored;
    const who = cfg.operatorName ? cfg.operatorName : T.operatorFallback;
    return T.noticeCollected(who);
  }
  function statusOf(id: string): Status {
    return (profiles.find((p) => p.agent === id)?.status as Status) || "empty";
  }

  // ---------- ENTRER DANS L'ESPACE ----------
  async function enter() {
    if (!name.trim()) return setError(T.errName);
    if (!/^\d{4}$/.test(pin)) return setError(T.errPin);
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, accessCode, pin }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data?.error || T.errGeneric);
      setProfiles(data.profiles || []);
      setView("space");
    } catch (e: any) {
      setError(e?.message || T.errGeneric);
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
    setVArtefact(null);
    setVShown([]);
    setVInterp("");
    setInjections([]);
    setDraft({ label: "", stance: "fétiche", why: "" });
    setFiche(null);
    const done = statusOf(id) === "done";
    setEnrichMode(done);
    if (done) {
      setView("classification"); // enrichir : on saute l'entretien
      if (hasVisualPool(id)) fetchNextArtefact(id, [], []);
    } else {
      setView("interview");
      startInterview(id);
    }
  }
  async function delProfile(id: string) {
    if (!confirm(T.delConfirm(AGENTS[id]?.name || id))) return;
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
        body: JSON.stringify({ agentId: id, accessCode, messages: next, lang }),
      });
      if (!res.ok || !res.body) throw new Error((await res.text()) || T.errNetwork);
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
      setError(e?.message || T.errGeneric);
      setMessages(next);
    } finally {
      setBusy(false);
    }
  }
  function startInterview(id: string) {
    callChat([{ role: "user", content: T.openingMsg }], id);
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
      setError(e?.message || T.errImage);
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

  // ---------- CLASSIFICATION VISUELLE ADAPTATIVE ----------
  async function fetchNextArtefact(id: string, hist: Verdict[], shown: string[]) {
    setVBusy(true);
    setVArtefact(null);
    setError(null);
    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: id,
          accessCode,
          lang,
          shownIds: shown,
          history: hist.map((v) => ({ id: v.id, geste: v.geste, reason: v.reason, essence: v.label })),
        }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data?.error || T.errGeneric);
      if (data.done) {
        setVArtefact(null);
        setView("injection");
        return;
      }
      setVArtefact(data.artefact);
      setVInterp(data.interpretation || "");
    } catch (e: any) {
      setError(e?.message || T.errGeneric);
    } finally {
      setVBusy(false);
    }
  }
  function recordVisualVerdict(geste: Geste) {
    if (!vArtefact || vBusy) return;
    const verdict: Verdict = { id: vArtefact.id, label: vArtefact.essence, geste, reason: cardReason.trim() };
    const nextVerdicts = [...verdicts.filter((x) => x.id !== verdict.id), verdict];
    const nextShown = vShown.includes(vArtefact.id) ? vShown : [...vShown, vArtefact.id];
    setVerdicts(nextVerdicts);
    setVShown(nextShown);
    setCardReason("");
    fetchNextArtefact(agentId, nextVerdicts, nextShown);
  }
  function skipVisual() {
    if (!vArtefact || vBusy) return;
    const nextShown = vShown.includes(vArtefact.id) ? vShown : [...vShown, vArtefact.id];
    setVShown(nextShown);
    setCardReason("");
    fetchNextArtefact(agentId, verdicts, nextShown);
  }

  // ---------- INJECTION ----------
  async function onInjFile(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    try {
      const image = await fileToImage(f);
      setDraft((d) => ({ ...d, image }));
    } catch (e: any) {
      setError(e?.message || T.errImage);
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
        body: JSON.stringify({ agentId, accessCode, name, pin, messages, classification: verdicts, injection: allInjections, lang }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data?.error || `${T.errGeneric} (${res.status}).`);
      if (!data?.fiche || !String(data.fiche).trim()) throw new Error(T.errGeneric);
      if (pending.length) {
        setInjections(allInjections);
        setDraft({ label: "", stance: "fétiche", why: "" });
      }
      setFiche(data.fiche);
      setFicheVersion(data.version || 0);
      setStored(!!data.stored);
      setView("fiche");
    } catch (e: any) {
      setError(e?.message || T.errGeneric);
    } finally {
      setBusy(false);
    }
  }
  function download() {
    if (!fiche) return;
    const blob = new Blob([fiche], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `twin-${agentId}-${name || "anon"}.md`;
    a.click();
  }

  const exchanges = messages.filter((m) => m.role === "user").length;
  // La langue se choisit avant/entre les profils, jamais en plein parcours (sinon
  // l'entretien, les verdicts et la fiche seraient à cheval sur deux langues).
  const langLocked = view !== "setup" && view !== "space";
  const toggles = (
    <Toggles
      lang={lang}
      theme={theme}
      langLocked={langLocked}
      lockMsg={T.langLocked}
      onLang={applyLang}
      onTheme={() => applyTheme(theme === "dark" ? "light" : "dark")}
    />
  );

  // ============ rendu par vue ============
  function renderView() {
    // SETUP
    if (view === "setup") {
      return (
        <div className="setup">
          <h1>{T.appTitle}</h1>
          <p className="sub">{T.setupSub}</p>
          {cfg && <p className="consent">ℹ️ {notice()}</p>}
          <div className="field">
            <label>{T.nameLabel}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={T.namePlaceholder} />
          </div>
          <div className="field">
            <label>{T.pinLabel}</label>
            <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="••••" />
          </div>
          <div className="field">
            <label>{T.accessLabel}</label>
            <input value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder={T.accessPlaceholder} />
          </div>
          {error && <p className="err">{error}</p>}
          <button className="full" onClick={enter} disabled={busy}>
            {busy ? T.busy : T.enter}
          </button>
        </div>
      );
    }

    // ESPACE
    if (view === "space") {
      return (
        <>
          <div className="head">
            <div>
              <div className="who">{T.spaceOf(name)}</div>
              <div className="meta">{T.spaceHint}</div>
            </div>
          </div>
          {cfg && <p className="consent">ℹ️ {notice()}</p>}
          <div className="phase-body">
            <div className="space-list">
              {agentList.map((a) => {
                const st = statusOf(a.id);
                const b = STATUS_META[st];
                const action = st === "empty" ? T.actStart : st === "partial" ? T.actContinue : T.actEnrich;
                return (
                  <div key={a.id} className="space-row">
                    <div className="space-info">
                      <div className="space-name">
                        {a.name} <span className={`st ${b.cls}`}>{b.dot} {T[b.key]}</span>
                      </div>
                      <div className="space-title">{agentTitle(a, lang)}</div>
                    </div>
                    <div className="space-actions">
                      <button onClick={() => openProfile(a.id)}>{action}</button>
                      {st !== "empty" && (
                        <button className="iconbtn" title={T.delTitle} onClick={() => delProfile(a.id)}>
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      );
    }

    // FICHE
    if (view === "fiche") {
      return (
        <div className="fiche-wrap">
          <h1 style={{ fontSize: 22 }}>{T.ficheHeading(agent?.name || "", name || "anon", ficheVersion)}</h1>
          {stored ? <p className="stored">{T.savedYes}</p> : <p className="notstored">{T.savedNo}</p>}
          {cfg && <p className="consent">ℹ️ {notice()}</p>}
          <div className="row">
            <button onClick={() => navigator.clipboard.writeText(fiche ?? "")}>{T.copy}</button>
            <button className="ghost" onClick={download}>{T.downloadMd}</button>
            <button className="ghost" onClick={backToSpace}>{T.backSpace}</button>
          </div>
          <div className="fiche-md">{fiche}</div>
        </div>
      );
    }

    // CLASSIFICATION
    if (view === "classification") {
      // Branche VISUELLE adaptative (pools d'écrans réels) — sinon deck texte
      if (hasVisualPool(agentId)) {
        return (
          <>
            <PhaseHead name={agent?.name} title={agentTitle(agent, lang)} step={`${T.stepClassif}${enrichMode ? T.enrichSuffix : ""}`} right={`${verdicts.length} ✓`} onBack={backToSpace} backTitle={T.backTitle} />
            <div className="phase-body">
              {verdicts.length === 0 && <p className="sub">{enrichMode ? T.enrichIntro : ""}{T.visualIntro}</p>}
              {vInterp && <p className="interp">✦ {T.tasteSoFar} — {vInterp}</p>}
              {!vArtefact ? (
                <div className="card"><p className="card-hint" style={{ textAlign: "center", margin: "30px 0" }}>{T.loadingNext}</p></div>
              ) : (
                <>
                  <div className="card">
                    <img className="card-img" src={vArtefact.imageUrl} alt="" />
                    <div className="card-credit"><a href={vArtefact.mobbinUrl} target="_blank" rel="noopener noreferrer">{T.seenIn(vArtefact.app)} ↗</a></div>
                    <div className="card-stim">{vArtefact.framing}</div>
                  </div>
                  <textarea className="reason" value={cardReason} onChange={(e) => setCardReason(e.target.value)} placeholder={T.reasonPlaceholder} />
                  <div className="geste-row">
                    {GESTE_KEYS.map((k) => (
                      <button key={k} className={`geste ${k}`} onClick={() => recordVisualVerdict(k)} disabled={vBusy}>
                        <span className="geste-label">{T[k]}</span>
                        <span className="geste-hint">{k === "garde" ? T.gardeHint : k === "jette" ? T.jetteHint : T.recombineHint}</span>
                      </button>
                    ))}
                  </div>
                  <div className="actions">
                    <button className="ghost" onClick={skipVisual} disabled={vBusy}>{T.skipArtefact}</button>
                    {verdicts.length >= 3 && <button className="ghost" onClick={() => setView("injection")} disabled={vBusy}>{T.endClassif}</button>}
                  </div>
                </>
              )}
              {error && <p className="err">{error}</p>}
            </div>
          </>
        );
      }
      const card = deck?.cards[cardIdx];
      return (
        <>
          <PhaseHead name={agent?.name} title={agentTitle(agent, lang)} step={`${T.stepClassif}${enrichMode ? T.enrichSuffix : ""}`} right={deck ? `${cardIdx + 1} / ${deck.cards.length}` : ""} onBack={backToSpace} backTitle={T.backTitle} />
          <div className="phase-body">
            {!deck ? (
              <>
                <p className="sub">{T.noDeck}</p>
                <div className="actions"><button className="ghost" onClick={() => setView("injection")}>{T.toInjection}</button></div>
              </>
            ) : (
              <>
                {cardIdx === 0 && <p className="sub">{enrichMode ? T.enrichIntro : ""}{deck.intro}</p>}
                <div className="card">
                  {card?.src && <img className="card-img" src={card.src} alt="" />}
                  <div className="card-stim">{card?.label}</div>
                </div>
                <textarea className="reason" value={cardReason} onChange={(e) => setCardReason(e.target.value)} placeholder={T.reasonPlaceholder} />
                <div className="geste-row">
                  {GESTE_KEYS.map((k) => (
                    <button key={k} className={`geste ${k}`} onClick={() => recordVerdict(k)} disabled={busy}>{T[k]}</button>
                  ))}
                </div>
                <div className="actions">
                  <button className="ghost" onClick={nextCard}>{T.skipArtefact}</button>
                  <button className="ghost" onClick={() => setView("injection")}>{T.endClassif}</button>
                </div>
              </>
            )}
            {error && <p className="err">{error}</p>}
          </div>
        </>
      );
    }

    // INJECTION
    if (view === "injection") {
      const signals = exchanges + verdicts.length + injections.length + (draft.label.trim() ? 1 : 0);
      const enough = enrichMode ? signals >= 1 : signals >= 3;
      return (
        <>
          <PhaseHead name={agent?.name} title={agentTitle(agent, lang)} step={`${T.stepInjection}${enrichMode ? T.enrichSuffix : ""}`} right={T.added(injections.length)} onBack={backToSpace} backTitle={T.backTitle} />
          <div className="phase-body">
            <p className="sub">{T.injectLead}{injectionPromptFor(agentId, lang)}</p>
            {injections.length > 0 && (
              <div className="inj-list">
                {injections.map((it, i) => (
                  <div key={i} className="inj-item">
                    <span className={`stance ${it.stance === "fétiche" ? "love" : "hate"}`}>{it.stance === "fétiche" ? T.stanceFetiche : T.stanceBeteNoire}</span>
                    <div className="inj-body">
                      <div className="inj-label">{it.label}</div>
                      {it.why && <div className="inj-why">{it.why}</div>}
                    </div>
                    {it.image && <span className="badge">🖼️</span>}
                    <button className="iconbtn" onClick={() => setInjections((a) => a.filter((_, j) => j !== i))} title={T.removeTitle}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <div className="inj-form">
              <div className="stance-toggle">
                <button className={draft.stance === "fétiche" ? "on" : ""} onClick={() => setDraft((d) => ({ ...d, stance: "fétiche" }))}>{T.stanceFetiche}</button>
                <button className={draft.stance === "bête-noire" ? "on" : ""} onClick={() => setDraft((d) => ({ ...d, stance: "bête-noire" }))}>{T.stanceBeteNoire}</button>
              </div>
              <input className="inj-input" value={draft.label} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))} placeholder={T.labelPlaceholder} />
              <textarea className="reason" value={draft.why} onChange={(e) => setDraft((d) => ({ ...d, why: e.target.value }))} placeholder={T.whyPlaceholder} />
              {draft.image && <div className="attachments"><img src={draft.image.url} alt="" /></div>}
              <div className="inj-actions">
                <button className="iconbtn" onClick={() => injFileRef.current?.click()} title={T.attachTitle}>＋</button>
                <input ref={injFileRef} type="file" accept="image/*" hidden onChange={(e) => onInjFile(e.target.files)} />
                <button className="ghost" onClick={addInjection} disabled={!draft.label.trim()}>{T.add}</button>
              </div>
            </div>
            {error && <p className="err">{error}</p>}
            <div className="recap">
              <div className="recap-title">{T.recapTitle}</div>
              <div className="recap-row">{T.sigInterview(exchanges)} · {T.sigReactions(verdicts.length)} · {T.sigRefs(injections.length + (draft.label.trim() ? 1 : 0))}</div>
            </div>
            <div className="actions">
              <button onClick={generate} disabled={busy || !enough}>{busy ? T.genBusy : enrichMode ? T.genRegen : T.genNew}</button>
            </div>
            {!enough && <p className="notstored" style={{ textAlign: "center" }}>{T.notEnough}</p>}
          </div>
        </>
      );
    }

    // ENTRETIEN (défaut)
    return (
      <>
        <PhaseHead name={agent?.name} title={agentTitle(agent, lang)} step={T.stepInterview} right={T.answers(exchanges)} onBack={backToSpace} backTitle={T.backTitle} />
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
            <button className="iconbtn" onClick={() => fileRef.current?.click()} title={T.attachTitle} disabled={busy}>＋</button>
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
              placeholder={T.composerPlaceholder}
              disabled={busy}
            />
            <button onClick={sendMessage} disabled={busy || (!input.trim() && attachments.length === 0)}>↑</button>
          </div>
          {exchanges >= 3 && (
            <div className="actions">
              <button className="ghost" onClick={() => { setView("classification"); if (hasVisualPool(agentId)) fetchNextArtefact(agentId, verdicts, vShown); }} disabled={busy}>{T.toClassification}</button>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <main className="wrap">
      {toggles}
      {renderView()}
    </main>
  );
}

function Toggles({ lang, theme, langLocked, lockMsg, onLang, onTheme }: { lang: Lang; theme: Theme; langLocked?: boolean; lockMsg?: string; onLang: (l: Lang) => void; onTheme: () => void }) {
  return (
    <div className="toolbar">
      <button className="toolbtn" onClick={onTheme} title={theme === "dark" ? "Light" : "Dark"} aria-label="theme">
        {theme === "dark" ? "☀️" : "🌙"}
      </button>
      <div className={`langseg${langLocked ? " locked" : ""}`} title={langLocked ? lockMsg : undefined}>
        <button className={lang === "fr" ? "on" : ""} disabled={langLocked} onClick={() => onLang("fr")}>FR</button>
        <button className={lang === "en" ? "on" : ""} disabled={langLocked} onClick={() => onLang("en")}>EN</button>
      </div>
    </div>
  );
}

function PhaseHead({ name, title, step, right, onBack, backTitle }: { name?: string; title?: string; step: string; right?: string; onBack?: () => void; backTitle?: string }) {
  return (
    <div className="head">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {onBack && <button className="iconbtn" title={backTitle} onClick={onBack}>←</button>}
        <div>
          <div className="who">{name}</div>
          <div className="meta">{title} · {step}</div>
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
