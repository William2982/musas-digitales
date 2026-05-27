import { useState, useRef, useEffect } from "react";
import "./App.css";

const PERSONAS = [
  {
    id: "muse",
    name: "La Musa",
    emoji: "🎭",
    color: "#FF6B6B",
    accent: "#FFE66D",
    description: "Inspiración artística y poética",
    systemPrompt:
      "Eres La Musa, una entidad creativa apasionada y poética. Respondes con metáforas vívidas, inspiras al usuario con ideas artísticas, y tu lenguaje es lírico y evocador. Usas poesía, imágenes mentales y referencias artísticas. Hablas en español con un estilo florido y apasionado. Eres cálida, entusiasta y ves belleza en todo.",
  },
  {
    id: "sage",
    name: "El Sabio",
    emoji: "🔮",
    color: "#4ECDC4",
    accent: "#A8E6CF",
    description: "Reflexiones profundas y filosofía",
    systemPrompt:
      "Eres El Sabio, una entidad filosófica y contemplativa. Respondes con profundidad, haces preguntas que invitan a la reflexión, y conectas ideas de distintas disciplinas. Tu lenguaje es sereno, preciso y lleno de sabiduría. Hablas en español con un estilo claro pero profundo. Citas pensadores cuando es relevante y siempre invitas a explorar más.",
  },
  {
    id: "spark",
    name: "La Chispa",
    emoji: "⚡",
    color: "#FFD93D",
    accent: "#FF6B6B",
    description: "Ideas locas y pensamiento lateral",
    systemPrompt:
      "Eres La Chispa, una entidad explosiva de creatividad caótica. Das ideas inesperadas, haces conexiones absurdas pero brillantes, y tu energía es contagiosa. Tu lenguaje es rápido, entusiasta, lleno de signos de exclamación y emojis. Hablas en español de forma muy expresiva. Propones cosas raras, divertidas y sorprendentes. Piensas de forma completamente lateral.",
  },
];

/* ─── TypingIndicator ─────────────────────────────────────── */
const TypingIndicator = ({ color }) => (
  <div className="typing-dots">
    {[0, 1, 2].map((i) => (
      <div key={i} className="typing-dot" style={{ background: color }} />
    ))}
  </div>
);

/* ─── Message ─────────────────────────────────────────────── */
const Message = ({ msg, personaColor, personaEmoji }) => {
  const isUser = msg.role === "user";
  return (
    <div className={`message-row ${isUser ? "user" : "assistant"}`}>
      {!isUser && (
        <div
          className="message-avatar"
          style={{
            background: personaColor + "30",
            border: `2px solid ${personaColor}`,
          }}
        >
          {personaEmoji}
        </div>
      )}
      <div
        className={`message-bubble ${isUser ? "user" : "assistant"}`}
        style={
          !isUser
            ? {
              background: `linear-gradient(135deg, ${personaColor}18, ${personaColor}08)`,
              border: `1px solid ${personaColor}40`,
            }
            : {}
        }
      >
        {msg.content}
      </div>
    </div>
  );
};

/* ─── Main component ──────────────────────────────────────── */
export default function CreativeAIChat() {
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const pts = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 4,
      delay: Math.random() * 5,
    }));
    setParticles(pts);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const selectPersona = (persona) => {
    setSelectedPersona(persona);
    setMessages([]);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !selectedPersona) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openrouter/auto",
          messages: [
            { role: "system", content: selectedPersona.systemPrompt },
            ...newMessages
          ],
        })
      })
      const data = await response.json()
      const reply = data.choices?.[0]?.message?.content || "Sin respuesta"
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      const msg = err?.status === 429
        ? "Demasiadas solicitudes, espera un momento e intenta de nuevo."
        : "Algo salió mal. Intenta de nuevo."
      setMessages([...newMessages, { role: "assistant", content: msg }])
    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activePersona = selectedPersona || PERSONAS[0];

  return (
    <div className="app-wrapper">
      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="bg-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: activePersona.color,
            "--duration": `${p.duration}s`,
            "--delay": `${p.delay}s`,
          }}
        />
      ))}

      {/* Gradient background blob */}
      <div
        className="bg-blob"
        style={{
          background: `radial-gradient(circle, ${activePersona.color}10 0%, transparent 70%)`,
        }}
      />

      {/* ── Header ── */}
      <header className="app-header">
        <div>
          <h1 className="app-title">✦ Musas Digitales</h1>
          <p className="app-subtitle">Conversaciones con entidades creativas</p>
        </div>

        <div className="persona-switcher">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              className={`persona-tab ${selectedPersona?.id === p.id ? "active" : ""}`}
              onClick={() => selectPersona(p)}
              style={{
                background:
                  selectedPersona?.id === p.id
                    ? `linear-gradient(135deg, ${p.color}30, ${p.color}10)`
                    : "transparent",
                border: `1px solid ${selectedPersona?.id === p.id ? p.color : "#2a2a2a"}`,
                color: selectedPersona?.id === p.id ? p.color : "#555",
              }}
            >
              <span>{p.emoji}</span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </header>

      {/* ── Landing ── */}
      {!selectedPersona ? (
        <div className="landing">
          <h2 className="landing-heading">
            ¿Con quién quieres<br />conversar hoy?
          </h2>
          <p className="landing-sub">
            Elige una entidad y comienza tu exploración creativa
          </p>

          <div className="persona-grid">
            {PERSONAS.map((p) => (
              <div
                key={p.id}
                className="persona-card"
                onClick={() => selectPersona(p)}
                style={{
                  background: `linear-gradient(135deg, ${p.color}12, #111)`,
                  border: `1px solid ${p.color}35`,
                }}
              >
                <div className="persona-card-emoji">{p.emoji}</div>
                <h3 className="persona-card-name" style={{ color: p.color }}>
                  {p.name}
                </h3>
                <p className="persona-card-desc">{p.description}</p>
                <div
                  className="persona-card-cta"
                  style={{ border: `1px solid ${p.color}50`, color: p.color }}
                >
                  INVOCAR →
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Chat ── */
        <div className="chat-container">
          {/* Active persona header */}
          <div
            className="chat-header"
            style={{ borderBottom: `1px solid ${selectedPersona.color}20` }}
          >
            <div
              className="chat-header-avatar"
              style={{
                background: `linear-gradient(135deg, ${selectedPersona.color}30, ${selectedPersona.color}10)`,
                border: `2px solid ${selectedPersona.color}`,
              }}
            >
              {selectedPersona.emoji}
            </div>
            <div>
              <div className="chat-header-name" style={{ color: selectedPersona.color }}>
                {selectedPersona.name}
              </div>
              <div className="chat-header-desc">{selectedPersona.description}</div>
            </div>
            {messages.length > 0 && (
              <button className="chat-reset-btn" onClick={() => setMessages([])}>
                Nueva sesión
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="messages-list">
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-emoji">{selectedPersona.emoji}</div>
                <p className="empty-state-text">
                  "{selectedPersona.name} te escucha.<br />¿Qué traes hoy?"
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <Message
                key={i}
                msg={msg}
                personaColor={selectedPersona.color}
                personaEmoji={selectedPersona.emoji}
              />
            ))}

            {isLoading && (
              <div className="typing-row">
                <div
                  className="message-avatar"
                  style={{
                    background: selectedPersona.color + "20",
                    border: `2px solid ${selectedPersona.color}`,
                  }}
                >
                  {selectedPersona.emoji}
                </div>
                <div
                  className="typing-bubble"
                  style={{
                    background: `${selectedPersona.color}10`,
                    border: `1px solid ${selectedPersona.color}30`,
                  }}
                >
                  <TypingIndicator color={selectedPersona.color} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="input-area"
            style={{ borderTop: `1px solid ${selectedPersona.color}15` }}
          >
            <div
              className="input-box"
              style={{ border: `1px solid ${selectedPersona.color}30` }}
            >
              <textarea
                ref={inputRef}
                className="input-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={`Escribe algo a ${selectedPersona.name}...`}
                rows={1}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 120) + "px";
                }}
              />
              <button
                className="send-btn"
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                style={{
                  background:
                    input.trim() && !isLoading
                      ? `linear-gradient(135deg, ${selectedPersona.color}, ${selectedPersona.accent})`
                      : "#1a1a1a",
                  color: input.trim() && !isLoading ? "#000" : "#333",
                }}
              >
                ↑
              </button>
            </div>
            <p className="input-hint">
              Enter para enviar · Shift+Enter para nueva línea
            </p>
          </div>
        </div>
      )}
    </div>
  );
}