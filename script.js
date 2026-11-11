/* ============================================================
   K10.cinema — interactions
   Parallax · Particles · Reveal · Angle toggle · Stepper · Checklist
   ============================================================ */

(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------
     1. SCROLL PARALLAX
     Hero layers move at different speeds; content drifts up
     and fades; deep sections get a subtle depth drift.
  ------------------------------------------------------------ */
  const layers = [...document.querySelectorAll(".hero-bg .layer")];
  const heroContent = document.getElementById("heroContent");
  const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
  const nav = document.getElementById("nav");

  let scrollY = window.scrollY;
  let ticking = false;

  function applyScroll() {
    scrollY = window.scrollY;
    const h = window.innerHeight;

    if (!prefersReduced) {
      layers.forEach((layer) => {
        const speed = parseFloat(layer.dataset.speed || 0);
        layer.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
      });

      if (heroContent && scrollY < h) {
        heroContent.style.transform = `translate3d(0, ${scrollY * 0.22}px, 0)`;
        heroContent.style.opacity = String(Math.max(0, 1 - scrollY / (h * 0.75)));
      }

      parallaxEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -80 || rect.top > h + 80) return;
        const speed = parseFloat(el.dataset.parallax || 0);
        const offset = (rect.top + rect.height / 2 - h / 2) * -speed;
        el.style.translate = `0 ${offset.toFixed(1)}px`;
      });
    }

    nav.classList.toggle("is-scrolled", scrollY > 40);
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(applyScroll);
      }
    },
    { passive: true }
  );
  applyScroll();

  /* ------------------------------------------------------------
     2. MOUSE PARALLAX (hero depth)
  ------------------------------------------------------------ */
  const hero = document.getElementById("hero");
  if (hero && !prefersReduced) {
    let mx = 0, my = 0, cmx = 0, cmy = 0, rafMouse = null;

    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      mx = (e.clientX / r.width - 0.5) * 2;
      my = (e.clientY / r.height - 0.5) * 2;
      if (!rafMouse) rafMouse = requestAnimationFrame(updateMouse);
    });

    function updateMouse() {
      cmx += (mx - cmx) * 0.06;
      cmy += (my - cmy) * 0.06;
      layers.forEach((layer, i) => {
        const depth = (i + 1) * 6;
        layer.style.translate = `${(-cmx * depth).toFixed(2)}px ${(-cmy * depth).toFixed(2)}px`;
      });
      if (Math.abs(cmx - mx) > 0.001 || Math.abs(cmy - my) > 0.001) {
        rafMouse = requestAnimationFrame(updateMouse);
      } else {
        rafMouse = null;
      }
    }
  }

  /* ------------------------------------------------------------
     3. PARTICLES (floating dust / bokeh)
  ------------------------------------------------------------ */
  const canvas = document.getElementById("particles");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let w = 0, h = 0, raf = null;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(70, Math.floor(w / 14));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2.2 + 0.6,
        vy: -(Math.random() * 0.35 + 0.08),
        vx: (Math.random() - 0.5) * 0.18,
        a: Math.random() * 0.5 + 0.15,
        tw: Math.random() * Math.PI * 2,
        tws: Math.random() * 0.02 + 0.006,
        cyan: Math.random() > 0.75,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.y += p.vy;
        p.x += p.vx;
        p.tw += p.tws;
        if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w; }
        if (p.x < -6) p.x = w + 6;
        if (p.x > w + 6) p.x = -6;
        const alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.cyan
          ? `rgba(72, 202, 228, ${alpha})`
          : `rgba(232, 241, 248, ${alpha * 0.7})`;
        ctx.shadowBlur = p.cyan ? 8 : 0;
        ctx.shadowColor = "rgba(72, 202, 228, 0.8)";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    draw();

    // pause when hero is off-screen
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !raf) draw();
      else if (!entry.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
    }).observe(hero);
  }

  /* ------------------------------------------------------------
     4. REVEAL ON SCROLL
  ------------------------------------------------------------ */
  const revealEls = document.querySelectorAll("[data-reveal]");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 90}ms`;
    revealObserver.observe(el);
  });

  /* ------------------------------------------------------------
     5. HERO ANGLE TOGGLE (Low Angle vs Eye Level)
  ------------------------------------------------------------ */
  const angleNotes = {
    low: {
      note: "<strong>Low Angle:</strong> kamera di bawah garis mata — subjek tampak dominan, berkuasa, dan berskala besar.",
      caption:
        "<strong>Low Angle:</strong> di bawah titik pandang penerima (mis. siswa yang duduk), lensa mengarah ke atas ke wajah, dada &amp; bahu — subjek menempati bidang atas frame.",
      mode: "",
    },
    eye: {
      note: "<strong>Eye Level:</strong> kamera sejajar garis mata — relasi setara, netral, tanpa hierarki visual.",
      caption:
        "<strong>Eye Level:</strong> kamera sejajar mata penerima. Relasi terlihat <em>setara dan netral</em> — bandingkan dengan versi Low Angle: hilangnya kenaikan sudut menghapus kesan dominasi.",
      mode: "mode-eye",
    },
  };

  const diagram = document.getElementById("diagram");
  const angleNote = document.getElementById("angleNote");
  const diagramCaption = document.getElementById("diagramCaption");
  const angleBtns = document.querySelectorAll("#angleToggle .toggle-btn");

  angleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      angleBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const data = angleNotes[btn.dataset.angle];
      if (!data) return;
      angleNote.innerHTML = data.note;
      diagramCaption.innerHTML = data.caption;
      diagram.classList.toggle("mode-eye", data.mode === "mode-eye");
    });
  });

  /* ------------------------------------------------------------
     6. PANNING STEP SLIDER
  ------------------------------------------------------------ */
  const steps = [
    {
      title: "Tripod Setup",
      desc: "Pasang kamera pada <strong>tripod kokoh berkepala fluid head</strong> agar resistansi seragam dan nol guncangan selama gerakan horizontal.",
      tips: [
        "Gunakan fluid head — damping cairan meredam getaran tangan.",
        "Pastikan ketiga kaki tripod terkunci dan permukaan stabil.",
        "Seimbangkan beban kamera sebelum mulai merekam.",
      ],
    },
    {
      title: "Axis Lock — Penguncian Sumbu",
      desc: "Kunci tuas tilt vertikal dengan aman sehingga gerakan <strong>terbatas murni pada bidang horizontal</strong> — mencegah drift vertikal yang merusak framing.",
      tips: [
        "Tilt lock ✕ — vertikal mati total.",
        "Hanya sumbu pan yang hidup dan bisa digerakkan.",
        "Cek ulang level head sebelum take dimulai.",
      ],
    },
    {
      title: "Pivot Execution — Eksekusi Putaran",
      desc: "Putar kepala tripod pada <strong>kecepatan stabil dan terkendali</strong>, mengikuti alur dialog pembicara untuk transisi antar tokoh yang mulus dan mulus tanpa jeda.",
      tips: [
        "Poros tetap: tripod tidak bergeser, hanya lensa yang mengarah ulang.",
        "Tempel pembicara aktif, pan tepat saat gantian dialog.",
        "Akiri dengan ease-out lembut di titik berhenti.",
      ],
    },
  ];

  const stepDots = [...document.querySelectorAll(".step-dot")];
  const stepProgress = document.getElementById("stepProgress");
  const stepCount = document.getElementById("stepCount");
  const stepTitle = document.getElementById("stepTitle");
  const stepDesc = document.getElementById("stepDesc");
  const stepTips = document.getElementById("stepTips");
  const stepSvg = document.querySelector(".step-svg");
  const btnPrev = document.getElementById("stepPrev");
  const btnNext = document.getElementById("stepNext");
  let currentStep = 0;

  function renderStep(i) {
    currentStep = (i + steps.length) % steps.length;
    const s = steps[currentStep];

    stepDots.forEach((d, di) => d.classList.toggle("is-active", di === currentStep));
    stepProgress.style.setProperty("--p", String(currentStep / (steps.length - 1)));
    stepCount.textContent = `Langkah ${currentStep + 1} / ${steps.length}`;
    stepTitle.textContent = s.title;
    stepDesc.innerHTML = s.desc;
    stepTips.innerHTML = s.tips.map((t) => `<li>${t}</li>`).join("");
    if (stepSvg) stepSvg.dataset.step = String(currentStep);

    // re-trigger fade
    [stepTitle, stepDesc, stepTips].forEach((el) => {
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "stepFade 0.45s ease both";
    });
  }
  if (!document.getElementById("stepFade")) {
    const kf = document.createElement("style");
    kf.id = "stepFade";
    kf.textContent = "@keyframes stepFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}";
    document.head.appendChild(kf);
  }

  btnPrev?.addEventListener("click", () => renderStep(currentStep - 1));
  btnNext?.addEventListener("click", () => renderStep(currentStep + 1));
  stepDots.forEach((d) =>
    d.addEventListener("click", () => renderStep(parseInt(d.dataset.step, 10)))
  );
  renderStep(0);

  /* auto-advance only while stepper is visible */
  let autoTimer = null;
  const stepperEl = document.querySelector(".stepper");
  if (stepperEl && !prefersReduced) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        autoTimer = setInterval(() => {
          if (currentStep === steps.length - 1) { clearInterval(autoTimer); autoTimer = null; return; }
          renderStep(currentStep + 1);
        }, 5000);
      } else if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }, { threshold: 0.35 }).observe(stepperEl);
  }

  /* ------------------------------------------------------------
     7. TECHNICAL CHECKLIST
  ------------------------------------------------------------ */
  const checks = [...document.querySelectorAll("#checkItems input")];
  const checkBar = document.getElementById("checkBar");
  const checkStatus = document.getElementById("checkStatus");
  const checkDone = document.getElementById("checkDone");

  function updateChecklist() {
    const done = checks.filter((c) => c.checked).length;
    const pct = (done / checks.length) * 100;
    checkBar.style.width = `${pct}%`;
    if (done === checks.length) {
      checkStatus.textContent = `${done} / ${checks.length} — SEMUA SISTEM TERKUNCI`;
      checkStatus.style.color = "var(--gold)";
      checkDone.classList.add("is-visible");
    } else {
      checkStatus.textContent = `${done} / ${checks.length} — sistem belum siap`;
      checkStatus.style.color = "";
      checkDone.classList.remove("is-visible");
    }
  }
  checks.forEach((c) => c.addEventListener("change", updateChecklist));
  updateChecklist();
})();
