(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const root = document.documentElement;
  const NBSP = " ";

  const safeStorage = (store) => ({
    get(key) {
      try {
        return store.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        store.setItem(key, value);
      } catch {
        /* storage unavailable (private mode) */
      }
    },
  });
  const local = safeStorage(window.localStorage);
  const session = safeStorage(window.sessionStorage);

  let estimate = "";
  let formSent = false;

  /* ---------- Theme ---------- */
  const savedTheme = local.get("theme");
  if (savedTheme) root.dataset.theme = savedTheme;

  $("#theme").addEventListener("click", () => {
    const isDark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = isDark ? "light" : "dark";
    local.set("theme", root.dataset.theme);
  });

  $("#year").textContent = new Date().getFullYear();

  /* ---------- WhatsApp & booking links ---------- */
  const whatsappUrl = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

  const defaultWhatsappText = () =>
    `Bonjour Mohamed, je viens de votre site.${estimate ? ` Mon besoin${NBSP}: ${estimate}.` : ""} `;

  $$(".js-wa").forEach((link) => {
    link.target = "_blank";
    link.rel = "noopener";
    link.href = whatsappUrl(defaultWhatsappText());
    link.addEventListener("click", () => {
      link.href = whatsappUrl(defaultWhatsappText());
    });
  });

  if (CONFIG.calendly) {
    const cal = $("#cal-link");
    cal.href = CONFIG.calendly;
    cal.target = "_blank";
    cal.rel = "noopener";
    cal.hidden = false;
  }

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

  /* ---------- Project estimator ---------- */
  const state = { need: null, size: null, when: null };
  const answered = () => Object.values(state).filter(Boolean).length;

  const money = (n) => `${(Math.round(n / 500) * 500).toLocaleString("fr-FR")}${NBSP}${CONFIG.currency}`;

  function select(key, value) {
    state[key] = value;
    $$(`.opts[data-key="${key}"] .opt`).forEach((btn) =>
      btn.setAttribute("aria-pressed", String(btn.dataset.v === value)),
    );
    const count = answered();
    $("#progbar").style.width = `${(count / 3) * 100}%`;
    $("#progtxt").textContent = `${count} / 3`;
    renderEstimate();
  }

  $$(".opts").forEach((group) =>
    group.addEventListener("click", (e) => {
      const btn = e.target.closest(".opt");
      if (btn) select(group.dataset.key, btn.dataset.v);
    }),
  );

  $$(".pain[data-need]").forEach((card) =>
    card.addEventListener("click", () => {
      select("need", card.dataset.need);
      $("#estimer").scrollIntoView({ behavior: "smooth" });
    }),
  );

  function renderEstimate() {
    if (!state.need) return;

    const need = NEEDS[state.need];
    const size = SIZES[state.size || "m"];
    const custom = !need.price;
    const showPrice = CONFIG.showPrices && !custom;

    const low = custom ? 0 : need.price[0] * size.k;
    const high = custom ? 0 : need.price[1] * size.k;
    const w0 = custom ? 0 : Math.max(1, Math.round(need.weeks[0] * size.k));
    const w1 = custom ? 0 : Math.max(w0, Math.round(need.weeks[1] * size.k));
    const delay = w1 <= 1 ? `environ 1${NBSP}semaine` : `${w0} à ${w1}${NBSP}semaines`;

    const remaining = 3 - answered();
    const done = remaining === 0;
    const ctaLabel = done
      ? "Recevoir mon devis gratuit"
      : remaining === 1
        ? "Plus qu'une question"
        : `Encore ${remaining}${NBSP}questions`;

    const headline = showPrice ? `${money(low)} <em>–</em> ${money(high)}` : "Sur <em>devis</em>";

    const items = [
      custom ? "" : `Délai estimé${NBSP}: ${delay}`,
      ...need.gets,
      state.when === "urgent" ? "Démarrage prioritaire possible, à confirmer ensemble" : "",
    ].filter(Boolean);

    $("#result").innerHTML = `
      <div class="k">${need.label}${state.size ? ` · ${size.label}` : ""}</div>
      <div class="big">${headline}</div>
      <ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>
      <button class="btn primary" id="toForm" type="button" ${done ? "" : "disabled"}>
        ${ctaLabel} <svg class="i arr" aria-hidden="true"><use href="#i-arrow"/></svg>
      </button>
      <p class="note">Devis fixe et détaillé, gratuit et sans engagement, établi après un premier échange.</p>`;

    estimate = [need.label, state.size ? size.label : "", state.when ? `délai ${WHEN[state.when]}` : ""]
      .filter(Boolean)
      .join(", ");
    if (showPrice) estimate += ` (estimation ${money(low)} – ${money(high)})`;

    $("#toForm").addEventListener("click", () => {
      $("#recap-txt").textContent = `Simulation jointe${NBSP}: ${estimate}`;
      $("#recap").classList.add("on");
      contact.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => $('[name="nom"]').focus({ preventScroll: true }), 700);
    });
  }

  $("#recap-x").addEventListener("click", () => $("#recap").classList.remove("on"));

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

  /* ---------- Exit-intent modal (desktop, once per session) ---------- */
  const modal = $("#modal");
  const openedAt = Date.now();

  const openModal = () => {
    if (formSent || session.get("exit") || Date.now() - openedAt < 20000) return;
    session.set("exit", "1");
    modal.classList.add("on");
    $("#mclose").focus();
  };
  const closeModal = () => modal.classList.remove("on");

  if (matchMedia("(pointer: fine)").matches) {
    document.addEventListener("mouseout", (e) => {
      if (!e.relatedTarget && e.clientY <= 0) openModal();
    });
  }
  $("#mclose").addEventListener("click", closeModal);
  $("#mest").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest(".js-wa")) closeModal();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
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
      showError("Merci d'indiquer votre nom, un e-mail valide et votre besoin.");
      form.querySelector(":invalid").focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    data.simulation = $("#recap").classList.contains("on") ? estimate : "Aucune";

    // No form endpoint configured: open the visitor's mail client with the request pre-filled.
    if (!CONFIG.web3formsKey) {
      const lines = [
        `Nom${NBSP}: ${data.nom}`,
        `E-mail${NBSP}: ${data.email}`,
        data.telephone ? `Téléphone${NBSP}: ${data.telephone}` : "",
        data.simulation !== "Aucune" ? `Simulation${NBSP}: ${data.simulation}` : "",
        "",
        data.message,
      ].filter((line, i) => line || i === 4);
      const subject = `[${data.type}] Demande de ${data.nom}`;
      location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
      return;
    }

    Object.assign(data, {
      access_key: CONFIG.web3formsKey,
      subject: `[${data.type}] Nouvelle demande de ${data.nom}`,
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

      formSent = true;
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
