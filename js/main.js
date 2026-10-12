(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const root = document.documentElement;
  const NBSP = " ";

  const storage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* storage unavailable (private mode) */
      }
    },
  };

  /* ---------- Theme ---------- */
  const savedTheme = storage.get("theme");
  if (savedTheme) root.dataset.theme = savedTheme;

  $("#theme").addEventListener("click", () => {
    const isDark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = isDark ? "light" : "dark";
    storage.set("theme", root.dataset.theme);
  });

  $("#year").textContent = new Date().getFullYear();

  /* ---------- WhatsApp links ---------- */
  const whatsappUrl = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
  const greeting = "Bonjour Mohamed, je viens de votre site. ";

  $$(".js-wa").forEach((link) => {
    link.href = whatsappUrl(greeting);
    link.target = "_blank";
    link.rel = "noopener";
  });

  /* ---------- Availability badge (Casablanca time) ---------- */
  try {
    const now = new Date();
    const tz = "Africa/Casablanca";
    const hour = Number(
      new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: tz }).format(now),
    );
    const isSunday =
      new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: tz }).format(now) === "Sun";
    const { start, end } = CONFIG.hours;

    let label = "Disponible · réponse dès demain matin";
    if (!isSunday && hour >= start && hour < end) label = "En ligne · je réponds aujourd'hui";
    else if (!isSunday && hour < start) label = "Disponible · réponse dans la matinée";
    $("#live").textContent = label;
  } catch {
    /* keep default label */
  }

  /* ---------- Sticky nav & mobile action bar ---------- */
  const nav = $("#nav");
  const mobileBar = $("#mbar");
  const hero = $(".hero");
  const contact = $("#contact");

  const contactInView = () => {
    const r = contact.getBoundingClientRect();
    return r.top < innerHeight && r.bottom > 0;
  };

  addEventListener(
    "scroll",
    () => {
      nav.classList.toggle("scrolled", scrollY > 10);
      mobileBar.classList.toggle("on", scrollY > hero.offsetHeight * 0.7 && !contactInView());
    },
    { passive: true },
  );

  /* ---------- Reveal on scroll ---------- */
  const revealer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        revealer.unobserve(entry.target);
      }),
    { threshold: 0.1 },
  );
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 70}ms`;
    revealer.observe(el);
  });

  /* ---------- Hero fibre animation ---------- */
  const canvas = $("#fiber");
  const ctx = canvas.getContext("2d");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0;
  let height = 0;
  let lines = [];

  const lineColor = () => getComputedStyle(root).getPropertyValue("--gold").trim() || "#5ed3f3";

  const bezier = (p, t) => {
    const u = 1 - t;
    return [0, 1].map(
      (k) => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k],
    );
  };

  function layout() {
    const ratio = devicePixelRatio || 1;
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const narrow = width < 700;
    const count = narrow ? 8 : 15;
    const hx = width * (narrow ? 0.86 : 0.8);
    const hy = height * (narrow ? 0.16 : 0.42);

    lines = Array.from({ length: count }, (_, i) => {
      const y = (height * (i + 0.5)) / count;
      return {
        points: [
          [-20, y],
          [width * 0.35, y],
          [width * 0.58, hy + (y - hy) * 0.3],
          [hx, hy],
        ],
        t: Math.random(),
        speed: 0.0015 + Math.random() * 0.003,
      };
    });
  }

  function draw() {
    const color = lineColor();
    ctx.clearRect(0, 0, width, height);

    for (const line of lines) {
      const [p0, p1, p2, p3] = line.points;
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(1, color);
      ctx.strokeStyle = gradient;
      ctx.globalAlpha = 0.14;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(...p0);
      ctx.bezierCurveTo(...p1, ...p2, ...p3);
      ctx.stroke();

      line.t = (line.t + line.speed) % 1;
      ctx.fillStyle = color;
      for (let k = 0; k < 14; k++) {
        const t = line.t - k * 0.006;
        if (t < 0) continue;
        const [x, y] = bezier(line.points, t);
        ctx.globalAlpha = (1 - k / 14) * 0.85;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.4, 1.8 - k * 0.1), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const [hx, hy] = lines[0].points[3];
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(hx, hy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.arc(hx, hy, 14 + Math.sin(Date.now() / 500) * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (!reduceMotion) requestAnimationFrame(draw);
  }

  layout();
  draw();
  addEventListener("resize", () => {
    layout();
    if (reduceMotion) draw();
  });

  /* ---------- Contact form ---------- */
  const form = $("#form");
  const status = $("#msg");
  const submitBtn = form.querySelector('button[type="submit"]');
  const submitLabel = submitBtn.querySelector(".lbl");
  const defaultSubmitLabel = submitLabel.textContent;

  const showError = (text) => {
    status.textContent = text;
    status.className = "msg err";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "msg";
    status.textContent = "";

    if (!form.checkValidity()) {
      showError("Merci d'indiquer votre nom, un e-mail valide et votre message.");
      form.querySelector(":invalid").focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    const subject = `[${data.besoin}] Demande de devis de ${data.nom}`;

    // No form endpoint configured: open the visitor's mail client with the request pre-filled.
    if (!CONFIG.web3formsKey) {
      const body = [
        `Besoin${NBSP}: ${data.besoin}`,
        `Nom${NBSP}: ${data.nom}`,
        `E-mail${NBSP}: ${data.email}`,
        data.telephone ? `Téléphone${NBSP}: ${data.telephone}` : "",
        "",
        data.message,
      ]
        .filter((line, i) => line || i === 4)
        .join("\n");
      location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      return;
    }

    Object.assign(data, {
      access_key: CONFIG.web3formsKey,
      subject,
      from_name: location.hostname || "Site web",
      replyto: data.email,
    });

    submitBtn.disabled = true;
    submitLabel.textContent = "Envoi en cours…";

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      form.hidden = true;
      $("#sent").classList.add("on");
    } catch {
      showError("L'envoi a échoué. Réessayez ou écrivez-moi sur WhatsApp.");
    } finally {
      submitBtn.disabled = false;
      submitLabel.textContent = defaultSubmitLabel;
    }
  });
})();
