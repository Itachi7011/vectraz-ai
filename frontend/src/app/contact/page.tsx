"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    Swal.fire({
      icon: "success",
      title: "Thanks for reaching out",
      text: "This form is a placeholder for now — wire it to a real endpoint whenever you're ready.",
      confirmButtonColor: "#2456ff",
    });
    setEmail("");
    setMessage("");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 lg:px-8">
      <h1 className="font-display" style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
        Contact us
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>
        Spotted a bad source, an inaccurate article, or want to suggest a new feed? Let us know.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", marginBottom: 12 }}
        />
        <textarea
          required
          placeholder="Your message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", marginBottom: 16, resize: "vertical" }}
        />
        <button
          type="submit"
          style={{ padding: "11px 24px", borderRadius: 10, background: "var(--accent)", color: "var(--accent-contrast)", border: "none", fontWeight: 700, cursor: "pointer" }}
        >
          Send message
        </button>
      </form>
    </div>
  );
}
