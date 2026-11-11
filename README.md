# Kelompok 10 — Cinematography Masterclass

Website presentasi untuk **Studi Kasus 10** dan **Teknis Sinematografi** — Departemen Sinematografi.

**Live:** https://vallon-doang.github.io/tugaswebsite/

## Konten

1. **Hero** — judul dengan parallax berlapis (glow, filmstrip, partikel) + toggle pratinjau sudut kamera (Low Angle vs Eye Level)
2. **Studi Kasus 10: Low Angle Camera** — diagram interaktif posisi kamera, dampak psikologis (Power Asymmetry, Atmospheric Tension, Implicit Narrative), dan strip framing (Height Placement, Lens Orientation, Compositional Framing)
3. **Teknik Panning dalam Adegan Dialog** — slider langkah-demi-langkah (Tripod Setup → Axis Lock → Pivot Execution) dengan diagram visual per langkah, plus prinsip Poros Tetap
4. **Smoothness & Motion Control** — demo animasi Fluid Head Damping, Velocity Control (jello vs konstan), dan Ease In/Out
5. **Technical Checklist** — checklist interaktif dengan progress bar (Fluid head, Vertical axis, Speed controlled, Ease in/out)

## Teknologi

HTML + CSS + vanilla JS — tanpa framework, tanpa build step.

- Parallax scroll berbasis `requestAnimationFrame` + mouse parallax di hero
- Partikel canvas (dust/bokeh) yang otomatis pause saat di luar layar
- Reveal-on-scroll via `IntersectionObserver`
- Menghormati `prefers-reduced-motion`

## Palet

| Warna | Hex |
| --- | --- |
| Dark Navy | `#0B132B` |
| Charcoal | `#1C2541` |
| Accent Cyan | `#48CAE4` |
| Gold | `#FFD60A` |

## Menjalankan lokal

Buka `index.html` langsung di browser, atau:

```bash
python3 -m http.server 8000
# http://localhost:8000
```
