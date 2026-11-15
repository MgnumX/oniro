const $input = document.getElementById("input");
const $send = document.getElementById("send");
const $status = document.getElementById("status");
const $list = document.getElementById("list");
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const SP = { type: "spring", bounce: 0, duration: 0.4 };
const { rubberband, shouldCommit } = window.oniroPhysics;

let statusTimer;

function setStatus(msg, isError) {
  clearTimeout(statusTimer);
  $status.textContent = msg || "";
  $status.classList.toggle("error", !!isError);
  $status.classList.remove("done");
}

function announce(msg) {
  setStatus(msg);
  $status.classList.add("done");
  statusTimer = setTimeout(() => setStatus(""), 3000);
}

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function mdToHtml(md) {
  let html = esc(md)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*\s([^*]+)/g, "<p>• $1</p>");
  return html
    .split(/\n{2,}/)
    .map((block) => (block.startsWith("<p>") ? block : `<p>${block}</p>`))
    .join("");
}

function formatDate(iso) {
  return new Date(iso.replace(" ", "T") + "Z").toLocaleString("es", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function render() {
  fetch("/api/dreams")
    .then((r) => r.json())
    .then((dreams) => {
      if (!dreams.length) {
        $list.innerHTML = `<div class="empty">Aún no hay sueños guardados.<br>Cuéntame el primero.</div>`;
        return;
      }
      $list.innerHTML = dreams
        .map((d) => `
          <article class="dream" data-id="${d.id}">
            <div class="swipe-bg">Borrar</div>
            <div class="dream-card">
              <div class="meta">
                <span class="date">${formatDate(d.created_at)}</span>
                <span>#${d.id}</span>
              </div>
              <div class="text">${esc(d.text)}</div>
              ${
                d.interpretation
                  ? `<div class="interpret">${mdToHtml(d.interpretation)}</div>`
                  : `<p class="pending-hint">Sin interpretación aún</p>`
              }
              <div class="actions">
                <button data-act="reint">Interpretar de nuevo</button>
                <button data-act="del" class="danger">Borrar</button>
              </div>
            </div>
          </article>`)
        .join("");
      const cards = [...$list.querySelectorAll(".dream-card")];
      if (!REDUCED) {
        cards.forEach((el, i) =>
          Motion.animate(
            el,
            { scale: [0.96, 1], y: [8, 0], opacity: [0, 1] },
            { ...SP, delay: i * 40 }
          ));
        cards.forEach(swipeCard);
      }
    })
    .catch(() => setStatus("No se pudieron cargar los sueños.", true));
}

function swipeCard(card) {
  const dream = card.closest(".dream");
  const width = dream.offsetWidth;
  const T = width * 0.35;
  let startX = null;
  let startY = 0;
  let sx = 0;
  let active = false;
  let last = null;
  let anim = null;

  const stop = () => {
    if (anim) { anim.stop(); anim = null; }
  };

  card.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    startX = e.clientX;
    startY = e.clientY;
    sx = 0;
    active = false;
    last = null;
    card.setPointerCapture(e.pointerId);
  });

  card.addEventListener("pointermove", (e) => {
    if (startX == null) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!active) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      if (Math.abs(dy) > Math.abs(dx)) { startX = null; return; }
      active = true;
    }
    e.preventDefault();
    stop();
    sx = dx;
    const t = dx > T ? T + rubberband(dx - T, width)
      : dx < -T ? -T - rubberband(-dx - T, width) : dx;
    anim = Motion.animate(
      card,
      { x: t, rotate: Math.max(-2, Math.min(2, (dx / width) * 2)) },
      SP
    );
    const now = performance.now();
    last = last
      ? { x: t, t: now, v: (t - last.x) / Math.max(1, now - last.t) }
      : { x: t, t: now, v: 0 };
  });

  card.addEventListener("pointerup", () => {
    if (startX == null) return;
    const dx = sx;
    const vel = last ? last.v * 1000 : 0;
    startX = null;
    if (!active) return;
    active = false;
    stop();
    if (shouldCommit(dx, vel, width)) {
      if (navigator.vibrate) navigator.vibrate(10);
      anim = Motion.animate(
        card,
        {
          x: dx > 0 ? width + 120 : -(width + 120),
          rotate: dx > 0 ? 2 : -2,
        },
        {
          ...SP,
          bounce: 0.2,
          velocity: vel,
          onComplete: () => {
            fetch(`/api/dreams/${dream.dataset.id}`, { method: "DELETE" })
              .then(() => {
                announce("Sueño borrado.");
                render();
              })
              .catch(() => setStatus("No se pudo borrar el sueño.", true));
          },
        }
      );
    } else {
      anim = Motion.animate(card, { x: 0, rotate: 0 }, { ...SP, velocity: vel });
    }
  });

  card.addEventListener("pointercancel", () => {
    if (startX == null) return;
    startX = null;
    if (active) {
      active = false;
      stop();
      anim = Motion.animate(card, { x: 0, rotate: 0 }, SP);
    }
  });
}

function sendDream() {
  const text = $input.value.trim();
  if (!text) return;
  $input.value = "";
  $send.disabled = true;
  setStatus("Interpretando tu sueño… 🌠");
  fetch("/api/dreams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })
    .then((r) => {
      if (!r.ok) throw new Error("fallo");
      return r.json();
    })
    .then(() => {
      if (navigator.vibrate) navigator.vibrate(10);
      announce("Sueño guardado.");
      render();
    })
    .catch(() => setStatus("No se pudo interpretar el sueño. ¿Está Ollama corriendo?", true))
    .finally(() => {
      $send.disabled = !$input.value.trim();
    });
}

$send.addEventListener("click", sendDream);
$input.addEventListener("input", () => {
  $send.disabled = !$input.value.trim();
});
$input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendDream();
});

$list.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const id = btn.closest(".dream").dataset.id;
  const act = btn.dataset.act;
  if (act === "del") {
    if (!btn.classList.contains("confirm")) {
      btn.classList.add("confirm");
      btn.textContent = "¿Seguro?";
      btn._activatedAt = Date.now();
      btn._t = setTimeout(() => {
        btn.classList.remove("confirm");
        btn.textContent = "Borrar";
      }, 3000);
      return;
    }
    if (Date.now() - btn._activatedAt < 400) return;
  }
  btn.disabled = true;
  const arg =
    act === "del"
      ? fetch(`/api/dreams/${id}`, { method: "DELETE" })
      : fetch(`/api/dreams/${id}/interpret`, { method: "POST" });
  arg
    .then(() => {
      announce(act === "del" ? "Sueño borrado." : "Sueño reinterpretado.");
      render();
    })
    .catch(() => setStatus(act === "del" ? "No se pudo borrar el sueño." : "No se pudo reinterpretar.", true))
    .finally(() => (btn.disabled = false));
});

render();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}
