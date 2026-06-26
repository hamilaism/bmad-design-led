"use client";

import { useEffect, useRef, useState } from "react";
import { AGENTS } from "@/lib/agents";

type ImgPart = { type: "image"; source: { type: "base64"; media_type: string; data: string } };
type TextPart = { type: "text"; text: string };
type Content = string | Array<TextPart | ImgPart>;
type Msg = { role: "user" | "assistant"; content: Content };
type Attachment = { media_type: string; data: string; url: string };

const agentList = ["sally", "tessa", "john", "camille", "winston", "dara", "margaux"]
  .map((id) => AGENTS[id])
  .filter(Boolean);

export default function Page() {
  const [started, setStarted] = useState(false);
  const [agentId, setAgentId] = useState("sally");
  const [interviewer, setInterviewer] = useState("");
  const [accessCode, setAccessCode] = useState("");

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fiche, setFiche] = useState<string | null>(null);
  const [stored, setStored] = useState<boolean | null>(null);

  const streamRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const agent = AGENTS[agentId];

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

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
      setMessages(next); // retire la bulle vide
    } finally {
      setBusy(false);
    }
  }

  async function start() {
    if (!interviewer.trim()) return setError("Mets ton prénom d'abord.");
    setError(null);
    setStarted(true);
    await callChat([{ role: "user", content: "Bonjour, je suis prêt·e — on peut commencer." }]);
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

  function onFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).slice(0, 6).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        const comma = url.indexOf(",");
        const media_type = url.slice(5, url.indexOf(";"));
        setAttachments((a) => [...a, { media_type, data: url.slice(comma + 1), url }]);
      };
      reader.readAsDataURL(f);
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/fiche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, accessCode, messages, interviewer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur.");
      setFiche(data.fiche);
      setStored(data.stored);
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

  // ---------- SETUP ----------
  if (!started) {
    return (
      <main className="wrap">
        <div className="setup">
          <h1>Intervieweur de goût</h1>
          <p className="sub">
            Tu vas te faire interviewer ~15 min pour capturer ton goût de métier. Réponds franchement,
            tranché — « je sais pas » est une réponse valable. C'est une conversation, pas un QCM.
          </p>
          <div className="field">
            <label>Ton prénom</label>
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
            <input
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="(fourni par Ismaïl)"
            />
          </div>
          {error && <p className="err">{error}</p>}
          <button className="full" onClick={start}>
            Commencer l'entretien
          </button>
        </div>
      </main>
    );
  }

  // ---------- FICHE ----------
  if (fiche) {
    return (
      <main className="wrap">
        <div className="fiche-wrap">
          <h1 style={{ fontSize: 22 }}>Fiche — {agent?.name}</h1>
          {stored ? (
            <p className="stored">✓ Envoyée à Ismaïl (stockée).</p>
          ) : (
            <p className="notstored">Pas de stockage configuré — copie/télécharge et envoie-la à Ismaïl.</p>
          )}
          <div className="row">
            <button onClick={() => navigator.clipboard.writeText(fiche)}>Copier</button>
            <button className="ghost" onClick={download}>
              Télécharger .md
            </button>
          </div>
          <div className="fiche-md">{fiche}</div>
        </div>
      </main>
    );
  }

  // ---------- CHAT ----------
  return (
    <main className="wrap">
      <div className="head">
        <div>
          <div className="who">{agent?.name}</div>
          <div className="meta">{agent?.title}</div>
        </div>
        <div className="meta">{exchanges} réponses</div>
      </div>

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
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => onFiles(e.target.files)}
          />
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
            <button className="ghost" onClick={generate} disabled={busy}>
              Terminer & générer la fiche
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function renderContent(content: Content) {
  if (typeof content === "string") return content;
  return (
    <>
      {content.map((c, i) =>
        c.type === "text" ? (
          <span key={i}>{c.text}</span>
        ) : (
          <img key={i} className="thumb" src={`data:${c.source.media_type};base64,${c.source.data}`} alt="" />
        )
      )}
    </>
  );
}
