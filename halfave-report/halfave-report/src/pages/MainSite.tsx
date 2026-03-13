import React, { useEffect } from 'react';

const css = `/* root visible */
    /* ── MOBILE RESPONSIVE ── */
    @media (max-width: 768px) {
      /* Stack "Designed for Operations" feature cards */
      .feature-trio {
        grid-template-columns: 1fr !important;
      }

      /* Hero: protect buildings graphic from squishing */
      .hero {
        min-height: 100svh;
        padding: 120px 5% 90px;
      }

      /* BIN section */
      .bin-input-wrap { max-width: 100%; }
      .bin-viol-row { grid-template-columns: 2.5rem 1fr; }
      .bin-viol-meta { grid-column: 2; text-align: left; }

      /* Prevent comparison table squish */
      .comparison-wrap { overflow-x: auto; }

      /* Footer: full single column */
      .site-footer-inner {
        grid-template-columns: 1fr !important;
      }

      /* Hero heading scale */
      .hero h1 { font-size: clamp(2.3rem, 9vw, 3.4rem) !important; }
      .hero-inner { max-width: 100%; }
      .hero p { font-size: clamp(0.95rem, 3.2vw, 1.1rem) !important; max-width: 90% !important; }

      /* Hide line break in description on mobile */
      .hero p br { display: none; }

      /* Stack hero actions vertically on mobile */
      .hero-actions {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }
      .hero-text-link { padding: 0 0.25rem; }
    }


    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      /* ── Brand palette extracted from HalfSpace app ── */
      --navy:        #111e30;   /* primary — sidebar, buttons */
      --navy-hover:  #182840;
      --navy-mid:    #1e2e45;   /* heading text */
      --navy-light:  #253852;
      --white:       #ffffff;
      --off-white:   #f5f5f5;   /* page background */
      --gray-100:    #f0f0f0;
      --gray-200:    #e5e7eb;
      --gray-300:    #d1d5db;
      --gray-400:    #9ca3af;
      --gray-500:    #6b7280;
      --gray-700:    #374151;
      --green:       #22c55e;   /* success states */
      --green-mid:   #10b981;
      --green-bg:    #f0fdf4;
      --red:         #c4533a;   /* error */
      /* ── Fonts ── */
      --serif:       'Lora', Georgia, serif;
      --sans:        'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: var(--sans);
      background: var(--white);
      color: var(--navy-mid);
      line-height: 1.6;
      overflow-x: hidden;
    }

    /* ────────── NAV ────────── */
    nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 5%;
      height: 68px;
      background: transparent;
      border-radius: 0 0 28px 28px;
      box-shadow: none;
      transition: background 0.35s ease, box-shadow 0.35s ease, border-radius 0.35s ease;
    }
    nav.scrolled {
      background: var(--navy);
      box-shadow: 0 4px 32px rgba(7,16,30,0.18);
    }

    .nav-logo {
      font-family: var(--serif);
      font-size: 1.3rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--white);
      text-decoration: none;
    }
    .nav-logo span { color: rgba(255,255,255,0.3); font-weight: 400; }

    .nav-links { display: flex; gap: 2.5rem; list-style: none; align-items: center; }

    .nav-links a {
      color: rgba(255,255,255,0.5);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--white); }

    .nav-cta {
      background: rgba(255,255,255,0.12) !important;
      color: var(--white) !important;
      padding: 0.5rem 1.25rem;
      border-radius: 50px;
      border: 1px solid rgba(255,255,255,0.2) !important;
      font-weight: 600 !important;
      font-size: 0.85rem !important;
      transition: background 0.2s !important;
    }
    .nav-cta:hover { background: rgba(255,255,255,0.2) !important; }

    /* ────────── HERO ────────── */
    .hero {
      min-height: 94.05vh;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      text-align: left;
      padding: 100px 5% 60px;
      align-items: stretch;
      background: var(--navy);
      position: relative;
      overflow: clip;
    }

    /* Video background */
    .hero::before { display: none; }
    .hero-video {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      pointer-events: none;
      z-index: 0;
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(5,14,30,0.72) 0%,
        rgba(5,14,30,0.52) 40%,
        rgba(5,14,30,0.75) 100%
      );
      z-index: 1;
    }

    .hero-inner {
      max-width: 1000px;
      width: 100%;
      margin: 0 auto;
      position: relative;
      z-index: 6;
    }
    .hero-inner::before {
      content: '';
      position: absolute;
      top: 50%;
      left: -5%;
      transform: translate(0%, -50%);
      width: 680px;
      height: 520px;
      background: radial-gradient(ellipse at center, rgba(5,14,30,0.72) 0%, rgba(5,14,30,0.45) 45%, transparent 75%);
      z-index: -1;
      pointer-events: none;
    }
    .hero-badges {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    .hero-trust-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      color: rgba(255,255,255,0.55);
      font-size: 0.72rem;
      font-weight: 500;
      padding: 0.32rem 0.85rem;
      border-radius: 100px;
    }
    .hero-trust-badge .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #4ade80;
      flex-shrink: 0;
    }
    
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.13);
      color: rgba(255,255,255,0.6);
      font-size: 0.73rem;
      font-weight: 600;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      padding: 0.35rem 0.95rem;
      border-radius: 100px;
      margin-bottom: 2rem;
      position: relative;
    }

    .hero h1 {
      font-family: var(--serif);
      font-size: clamp(1.7rem, 3.6vw, 3.2rem);
      font-weight: 400;
      line-height: 1.1;
      letter-spacing: -0.02em;
      max-width: 800px;
      margin-bottom: 1rem;
      color: var(--white);
      position: relative;
      text-shadow: 0 2px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.7);
    }
    .hero h1 em { font-style: italic; color: #ffffff; }

    .hero p {
      font-size: clamp(0.8rem, 1.2vw, 0.92rem);
      color: rgba(255,255,255,0.75);
      max-width: 430px;
      margin: 0 0 1.8rem 0;
      line-height: 1.7;
      position: relative;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: flex-start;
      position: relative;
      margin-bottom: 1.8rem;
    }

    .btn-primary {
      background: var(--white);
      color: var(--navy);
      padding: 0.7rem 1.6rem;
      border-radius: 50px;
      font-weight: 700;
      font-size: 0.72rem;
      text-decoration: none;
      transition: opacity 0.2s, transform 0.15s;
      display: inline-block;
    }
    .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }

    .btn-secondary {
      background: transparent;
      color: rgba(255,255,255,0.7);
      padding: 0.7rem 1.6rem;
      border-radius: 50px;
      font-weight: 500;
      font-size: 0.72rem;
      text-decoration: none;
      border: 1.5px solid rgba(255,255,255,0.18);
      transition: all 0.2s;
      display: inline-block;
    }
    .btn-secondary:hover { border-color: rgba(255,255,255,0.45); color: var(--white); transform: translateY(-1px); }

    .hero-text-link {
      display: inline-flex;
      align-items: center;
      color: rgba(255,255,255,0.6);
      font-size: 0.82rem;
      font-weight: 500;
      text-decoration: none;
      transition: color 0.2s;
      padding: 0.7rem 0.5rem;
    }
    .hero-text-link:hover { color: var(--white); }

    .hero-sub {
      margin-top: 3rem;
      font-size: 0.76rem;
      color: rgba(255,255,255,0.25);
      letter-spacing: 0.05em;
      position: relative;
    }

    /* ────────── TICKER ────────── */
    .ticker {
      overflow: hidden;
      background: var(--off-white);
      border-top: 1px solid var(--gray-200);
      border-bottom: 1px solid var(--gray-200);
      padding: 0.8rem 0;
    }

    .ticker-inner {
      display: flex;
      gap: 2.5rem;
      animation: ticker 32s linear infinite;
      width: max-content;
    }

    .ticker-item {
      white-space: nowrap;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--gray-500);
      letter-spacing: 0.09em;
      text-transform: uppercase;
    }
    .ticker-dot { color: var(--gray-300); }

    @keyframes ticker {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }

    /* ────────── SHARED ────────── */
    .section { padding: 100px 5%; max-width: 1000px; margin: 0 auto; overflow: visible; }

    .section-label {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.11em;
      text-transform: uppercase;
      color: var(--gray-400);
      margin-bottom: 1rem;
    }

    .section-title {
      font-family: var(--serif);
      font-size: clamp(1.52rem, 2.8vw, 2.2rem);
      font-weight: 400;
      letter-spacing: -0.02em;
      line-height: 1.15;
      max-width: 540px;
      margin-bottom: 1rem;
      color: var(--navy);
    }

    .section-sub {
      color: var(--gray-500);
      max-width: 540px;
      font-size: clamp(0.7rem, 1.26vw, 0.805rem);
      line-height: 1.78;
      margin-bottom: 3.5rem;
    }

    /* ────────── LAPTOP SECTION ────────── */
    .laptop-section {
      background: #ffffff;
      overflow: visible;
      padding: 100px 5%;
      max-width: none;
    }
    .laptop-section .section-label {
      display: block;
      text-align: left;
    }
    .laptop-section .section-title {
      text-align: left;
      font-family: var(--serif);
      font-size: clamp(1.52rem, 2.8vw, 2.2rem);
      font-weight: 400;
      margin-bottom: 0.6rem;
      max-width: 600px;
    }
    .laptop-section .section-sub {
      text-align: left;
      max-width: 560px;
      margin-left: 0;
      margin-right: 0;
      margin-bottom: 3.5rem;
    }

    /* Outer frame — wide enough for laptop + side cards */
    .lp-outer {
      position: relative;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 5%;
      overflow: visible;
    }

    /* The laptop itself sits in a centered inner box */
    /* ────────── NYC SECTION ────────── */
    .nyc-section { padding: 100px 5% 80px; background: #FDFBF7; }
    .nyc-inner-wrap { max-width: 1000px; margin: 0 auto; }
    .qa-feature-section { padding: 100px 5%; }

    /* ── FEATURE TRIO ── */
    .feature-trio {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }
    .ftcard {
      background: #fff;
      border: 1px solid rgba(0,0,0,0.07);
      border-radius: 20px;
      padding: 2rem 1.8rem 2.2rem;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .ftcard:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(17,30,48,0.1); }
    .ftcard::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 3px;
      background: var(--accent, rgba(17,30,48,0.12));
      border-radius: 0 0 20px 20px;
    }
    .ftcard-1 { --accent: #4ade80; }
    .ftcard-2 { --accent: #60a5fa; }
    .ftcard-3 { --accent: #f59e0b; }
    .ftcard-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1.3rem;
      background: var(--icon-bg, rgba(17,30,48,0.05));
      color: var(--icon-color, var(--navy));
    }
    .ftcard-1 .ftcard-icon { --icon-bg: rgba(74,222,128,0.1); --icon-color: #16a34a; }
    .ftcard-2 .ftcard-icon { --icon-bg: rgba(96,165,250,0.1); --icon-color: #2563eb; }
    .ftcard-3 .ftcard-icon { --icon-bg: rgba(245,158,11,0.1); --icon-color: #d97706; }
    .ftcard-eyebrow {
      font-size: 0.65rem; font-weight: 700;
      letter-spacing: 0.12em; text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    .ftcard-1 .ftcard-eyebrow { color: #16a34a; }
    .ftcard-2 .ftcard-eyebrow { color: #2563eb; }
    .ftcard-3 .ftcard-eyebrow { color: #d97706; }
    .ftcard-title {
      font-family: var(--serif);
      font-size: 1.15rem; font-weight: 600;
      color: var(--navy); margin-bottom: 0.75rem; line-height: 1.3;
    }
    .ftcard-desc {
      font-size: 0.85rem; color: var(--gray-500);
      line-height: 1.7; margin-bottom: 1.4rem;
    }
    .ftcard-bullets { list-style: none; display: flex; flex-direction: column; gap: 0.55rem; }
    .ftcard-bullets li {
      font-size: 0.8rem; color: rgba(17,30,48,0.65);
      padding-left: 1.2rem; position: relative; line-height: 1.5;
    }
    .ftcard-bullets li::before {
      content: ''; position: absolute; left: 0; top: 0.45em;
      width: 5px; height: 5px; border-radius: 50%;
      background: var(--accent, rgba(17,30,48,0.25));
    }

    /* ── COMPARISON TABLE ── */
    .comparison-wrap {
      background: #fff;
      border: 1px solid rgba(0,0,0,0.07);
      border-radius: 20px;
      overflow: hidden;
    }
    .comparison-header {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      border-bottom: 1px solid rgba(0,0,0,0.07);
    }
    .ch-feature-col {
      padding: 1.4rem 1.8rem;
      font-size: 0.7rem; font-weight: 700;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: var(--gray-400);
      border-right: 1px solid rgba(0,0,0,0.05);
    }
    .ch-legacy-col {
      padding: 1.4rem 1.8rem; text-align: center;
      border-right: 1px solid rgba(0,0,0,0.05);
    }
    .ch-halfave-col { padding: 1.4rem 1.8rem; text-align: center; background: rgba(17,30,48,0.02); }
    .ch-legacy-label { font-size: 0.78rem; font-weight: 600; color: var(--gray-400); }
    .ch-halfave-label { font-size: 0.78rem; font-weight: 700; color: var(--navy); }
    .ch-halfave-badge {
      display: inline-block; font-size: 0.6rem; font-weight: 700;
      letter-spacing: 0.08em; text-transform: uppercase;
      background: var(--navy); color: #fff;
      padding: 0.18rem 0.55rem; border-radius: 100px;
      margin-left: 0.4rem; vertical-align: middle;
    }
    .comparison-row {
      display: grid; grid-template-columns: 1fr 1fr 1fr;
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }
    .comparison-row:last-child { border-bottom: none; }
    .comparison-row:nth-child(even) { background: rgba(0,0,0,0.012); }
    .cr-feature {
      padding: 1.05rem 1.8rem; font-size: 0.84rem; font-weight: 500;
      color: var(--navy-mid); border-right: 1px solid rgba(0,0,0,0.05);
      display: flex; align-items: center;
    }
    .cr-legacy {
      padding: 1.05rem 1.8rem; display: flex; align-items: center;
      justify-content: center; border-right: 1px solid rgba(0,0,0,0.05);
      gap: 0.5rem; font-size: 0.8rem; color: var(--gray-400);
    }
    .cr-halfave {
      padding: 1.05rem 1.8rem; display: flex; align-items: center;
      justify-content: center; gap: 0.5rem;
      font-size: 0.8rem; color: #15803d; font-weight: 500;
      background: rgba(17,30,48,0.012);
    }
    .icon-x {
      width: 18px; height: 18px; border-radius: 50%;
      background: rgba(239,68,68,0.1);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .icon-x svg { color: #ef4444; }
    .icon-check {
      width: 18px; height: 18px; border-radius: 50%;
      background: rgba(74,222,128,0.15);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .icon-check svg { color: #16a34a; }
    .icon-partial {
      width: 18px; height: 18px; border-radius: 50%;
      background: rgba(245,158,11,0.1);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .icon-partial svg { color: #d97706; }
    .comparison-section-divider { background: rgba(17,30,48,0.03); border-bottom: 1px solid rgba(0,0,0,0.05); }
    .csd-label {
      padding: 0.55rem 1.8rem; font-size: 0.62rem; font-weight: 700;
      letter-spacing: 0.12em; text-transform: uppercase; color: rgba(17,30,48,0.35);
    }

    .nyc-section .section-label { color: var(--gray-400); }
    .nyc-section .section-title { color: var(--navy); }
    .nyc-section .section-sub { color: var(--gray-500); }

    .nyc-card {
      background: rgba(255,255,255,0.7);
      border: 1px solid rgba(0,0,0,0.07);
      border-radius: 12px;
      padding: 1.1rem 1.4rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: background 0.18s;
    }
    .nyc-card:hover { background: rgba(255,255,255,0.95); }
    .nyc-card.highlight { border-color: rgba(34,197,94,0.4); background: rgba(34,197,94,0.06); }
    .nyc-card-icon { font-size: 1.2rem; flex-shrink: 0; }
    .nyc-card-text strong { display: block; font-size: 0.875rem; font-weight: 600; color: var(--navy); }
    .nyc-card-text span { font-size: 0.78rem; color: var(--gray-400); }

    /* ────────── PRICING ────────── */
    .pricing-section {
      padding: 110px 5%;
      background: var(--navy);
      position: relative;
      overflow: clip;
    }

    .pricing-section::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 60% 55% at 75% 50%, rgba(255,255,255,0.04) 0%, transparent 70%),
        radial-gradient(ellipse 40% 40% at 20% 60%, rgba(255,255,255,0.025) 0%, transparent 65%);
      pointer-events: none;
    }

    .pricing-inner {
      max-width: 1000px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5rem;
      align-items: start;
    }

    .pricing-left .section-label { color: rgba(255,255,255,0.45); }

    .pricing-left .section-title {
      color: var(--white);
      margin-top: 0.6rem;
    }

    .pricing-message {
      font-size: 1.05rem;
      color: rgba(255,255,255,0.62);
      line-height: 1.8;
      margin-top: 1.4rem;
      max-width: 420px;
    }

    .pricing-card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 2.25rem 2rem;
      backdrop-filter: blur(4px);
    }

    .pricing-card-label {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.13em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.35);
      margin-bottom: 1.5rem;
    }

    .pricing-perks {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .pricing-perks li {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      font-size: 0.84rem;
      color: rgba(255,255,255,0.75);
      line-height: 1.5;
    }

    .pricing-perks li::before {
      content: '';
      width: 16px;
      height: 16px;
      min-width: 16px;
      margin-top: 1px;
      border-radius: 50%;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='rgba(255,255,255,0.7)' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='2,6 5,9 10,3'/%3E%3C/svg%3E");
      background-size: 10px;
      background-repeat: no-repeat;
      background-position: center;
    }

    .pricing-cta-note {
      font-size: 0.72rem;
      color: rgba(255,255,255,0.3);
      line-height: 1.6;
      margin-top: 1.25rem;
      text-align: center;
    }

    @media (max-width: 768px) {
      .pricing-inner { grid-template-columns: 1fr; gap: 3rem; }
      .pricing-message { max-width: 100%; }
    }

    /* ────────── FEATURE GRID ────────── */
    .fg-cell {
      background: #ffffff;
      padding: 1.35rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      transition: background 0.2s;
    }
    .fg-cell:hover { background: #f7f7f6; }
    .fg-cell.fg-ha { background: #f0faf4; }
    .fg-cell.fg-ha:hover { background: #e6f7ed; }
    .fg-icon { opacity: 0.4; margin-bottom: 0.2rem; color: var(--navy); }
    .fg-cell.fg-ha .fg-icon { opacity: 1; color: #16a34a; }
    .fg-name { font-size: 0.8rem; font-weight: 600; color: var(--navy); line-height: 1.3; }
    .fg-cell.fg-ha .fg-name { color: var(--navy); }
    .fg-desc { font-size: 0.7rem; color: var(--gray-500); line-height: 1.58; }

    /* ────────── CTA ────────── */
    .cta-section {
      padding: 100px 5%;
      background: var(--off-white);
      border-top: 1px solid var(--gray-200);
      text-align: center;
    }
    .cta-inner { max-width: 580px; margin: 0 auto; }

    .cta-section h2 {
      font-family: var(--serif);
      font-size: clamp(1.52rem, 2.8vw, 2.2rem);
      font-weight: 400;
      letter-spacing: -0.02em;
      line-height: 1.12;
      color: var(--navy);
      margin-bottom: 1rem;
    }
    .cta-section h2 em { font-style: italic; color: var(--gray-400); }
    .cta-section p { color: var(--gray-500); font-size: 1rem; margin-bottom: 2.5rem; }

    .cta-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
      justify-content: center;
      flex-wrap: wrap;
    }

    .cta-btn {
      background: var(--navy);
      color: var(--white);
      padding: 0.9rem 2rem;
      border-radius: 50px;
      font-weight: 700;
      font-size: 0.9rem;
      text-decoration: none;
      white-space: nowrap;
      transition: background 0.2s, transform 0.15s;
      display: inline-block;
      cursor: pointer;
      border: none;
    }
    .cta-btn:hover { background: var(--navy-hover); transform: translateY(-1px); }

    .cta-email {
      font-size: 0.9rem;
      color: var(--gray-500);
      text-decoration: none;
      border-bottom: 1px solid var(--gray-300);
      padding-bottom: 1px;
      transition: color 0.2s, border-color 0.2s;
    }
    .cta-email:hover { color: var(--navy); border-color: var(--navy); }

    /* ────────── FOOTER ────────── */
    .btn-cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: #fff;
      color: var(--navy);
      font-family: var(--font);
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      padding: 0.9rem 2rem;
      border-radius: 100px;
      border: none;
      cursor: pointer;
      transition: background 0.18s, transform 0.18s, box-shadow 0.18s;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    }
    .btn-cta:hover {
      background: #f0f0f0;
      transform: translateY(-2px);
      box-shadow: 0 6px 28px rgba(0,0,0,0.32);
    }

    .footer-divider {
      border: none;
      border-top: 1px solid rgba(255,255,255,0.08);
      margin: 0;
    }

    .site-footer {
      background: var(--navy);
      padding: 64px 5% 0;
    }

    .site-footer-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.8fr 1fr 1fr 1fr;
      gap: 3rem;
      padding-bottom: 48px;
    }

    .footer-brand .footer-logo { margin-bottom: 1.1rem; }

    .footer-tagline {
      font-size: 0.875rem;
      color: rgba(255,255,255,0.4);
      margin-bottom: 0.6rem;
      line-height: 1.6;
    }

    .footer-email {
      font-size: 0.78rem;
      color: rgba(255,255,255,0.45);
      margin-bottom: 1.25rem;
      display: block;
    }

    .footer-social {
      display: flex;
      gap: 1.25rem;
      align-items: center;
      margin-top: 0.5rem;
    }

    .footer-social a {
      color: rgba(255,255,255,0.4);
      transition: color 0.2s;
      display: flex;
      align-items: center;
    }
    .footer-social a:hover { color: rgba(255,255,255,0.9); }
    .footer-brand .footer-social { margin-bottom: 1.5rem; }

    .footer-col-title {
      font-family: var(--serif);
      font-size: 1rem;
      font-weight: 500;
      color: rgba(255,255,255,0.9);
      margin-bottom: 1.25rem;
      letter-spacing: -0.01em;
    }

    .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 0.7rem; }

    .footer-col ul li a {
      font-size: 0.875rem;
      color: rgba(255,255,255,0.4);
      text-decoration: none;
      transition: color 0.2s;
    }
    .footer-col ul li a:hover { color: rgba(255,255,255,0.85); }

    .footer-bottom {
      max-width: 1200px;
      margin: 0 auto;
      border-top: 1px solid rgba(255,255,255,0.08);
      padding: 1.25rem 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .footer-bottom span {
      font-size: 0.78rem;
      color: rgba(255,255,255,0.25);
    }

    @media (max-width: 768px) {
      .site-footer-inner {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }
      .footer-brand { grid-column: 1 / -1; }
    }

    /* ────────── RESPONSIVE ────────── */
    /* ────────── BIN LOOKUP ────────── */
    .bin-section {
      padding: 90px 5%;
      background: #ffffff;
      border-top: 1px solid var(--gray-200);
      border-bottom: 1px solid var(--gray-200);
      font-size: 0.9em;
    }

    .bin-inner { max-width: 1000px; margin: 0 auto; }

    .bin-header { margin-bottom: 2.5rem; }
    .bin-header .section-title { max-width: 540px; }
    .bin-header .section-sub { max-width: 540px; }

    .bin-input-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--gray-500);
      margin-bottom: 0.6rem;
    }

    .bin-input-wrap { max-width: 540px; }

    .bin-input-group {
      display: flex;
      gap: 0.75rem;
    }

    .bin-input {
      flex: 1;
      background: var(--white);
      border: 1.5px solid var(--gray-200);
      border-radius: 10px;
      padding: 0.9rem 1.25rem;
      font-size: 1.1rem;
      font-family: var(--sans);
      font-weight: 600;
      color: var(--navy);
      letter-spacing: 0.05em;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .bin-input::placeholder { color: var(--gray-300); font-weight: 400; letter-spacing: 0; }
    .bin-input:focus { border-color: var(--navy); box-shadow: 0 0 0 3px rgba(7,16,30,0.07); }

    .bin-btn {
      background: var(--navy);
      color: var(--white);
      border: none;
      border-radius: 10px;
      padding: 0.9rem 1.75rem;
      font-size: 0.9rem;
      font-weight: 700;
      font-family: var(--sans);
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.2s, transform 0.15s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .bin-btn:hover { background: var(--navy-hover); transform: translateY(-1px); }
    .bin-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .spin { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .bin-hint {
      font-size: 0.78rem;
      color: var(--gray-400);
      margin-top: 0.6rem;
    }
    .bin-hint a { color: var(--gray-500); text-decoration: underline; }
    .bin-hint a:hover { color: var(--navy); }

    .bin-examples {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-top: 1.25rem;
      flex-wrap: wrap;
    }

    .bin-examples-label {
      font-size: 0.75rem;
      color: var(--gray-400);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .bin-example-chip {
      background: var(--white);
      border: 1.5px solid var(--gray-200);
      border-radius: 50px;
      padding: 0.3rem 0.85rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--gray-700);
      font-family: var(--sans);
      cursor: pointer;
      transition: all 0.15s;
      letter-spacing: 0.04em;
    }
    .bin-example-chip:hover { border-color: var(--navy); color: var(--navy); background: var(--white); }

    /* Results */
    .bin-results { margin-top: 2rem; animation: fadeUp 0.4s ease; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Expandable sections */
    .bin-expand {
      background: var(--white);
      border: 1px solid var(--gray-200);
      border-radius: 14px;
      margin-bottom: 0.75rem;
      overflow: hidden;
    }
    .bin-expand-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.1rem 1.5rem;
      cursor: pointer;
      user-select: none;
      gap: 1rem;
    }
    .bin-expand-header:hover { background: #fafafa; }
    .bin-expand-left {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .bin-expand-icon {
      width: 36px;
      height: 36px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .bin-expand-icon.red   { background: #fef2f2; color: #c4533a; }
    .bin-expand-icon.amber { background: #fffbeb; color: #b45309; }
    .bin-expand-icon.blue  { background: #eff6ff; color: #2563eb; }
    .bin-expand-icon.green { background: #f0fdf4; color: #16a34a; }
    .bin-expand-icon.gray  { background: #f9fafb; color: #6b7280; }
    .bin-expand-title {
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--navy);
    }
    .bin-expand-subtitle {
      font-size: 0.78rem;
      color: var(--gray-400);
      margin-top: 0.1rem;
    }
    .bin-expand-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.65rem;
      border-radius: 50px;
      white-space: nowrap;
    }
    .bin-expand-badge.red   { background: #fef2f2; color: #c4533a; }
    .bin-expand-badge.amber { background: #fffbeb; color: #b45309; }
    .bin-expand-badge.blue  { background: #eff6ff; color: #2563eb; }
    .bin-expand-badge.green { background: #f0fdf4; color: #16a34a; }
    .bin-expand-badge.gray  { background: #f9fafb; color: #6b7280; }
    .bin-expand-chevron {
      color: var(--gray-400);
      transition: transform 0.2s;
      flex-shrink: 0;
    }
    .bin-expand.open .bin-expand-chevron { transform: rotate(180deg); }
    .bin-expand-body {
      display: none;
      border-top: 1px solid var(--gray-200);
      padding: 1.25rem 1.5rem;
    }
    .bin-expand.open .bin-expand-body { display: block; }

    /* Violation rows */
    .bin-viol-row {
      display: grid;
      grid-template-columns: 3rem 1fr auto;
      gap: 0.75rem;
      align-items: start;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .bin-viol-row:last-child { border-bottom: none; padding-bottom: 0; }
    .bin-viol-class {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      padding: 0.2rem 0.5rem;
      border-radius: 5px;
      text-align: center;
      align-self: start;
      margin-top: 0.1rem;
    }
    .bin-viol-class.C { background: #fef2f2; color: #c4533a; }
    .bin-viol-class.B { background: #fffbeb; color: #b45309; }
    .bin-viol-class.A { background: #f0fdf4; color: #16a34a; }
    .bin-viol-desc { font-size: 0.82rem; color: #374151; line-height: 1.5; }
    .bin-viol-meta { font-size: 0.73rem; color: var(--gray-400); text-align: right; white-space: nowrap; }
    .bin-viol-apt  { font-size: 0.73rem; color: var(--gray-400); margin-top: 0.2rem; }

    /* Device rows (elevators / boilers) */
    .bin-device-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.65rem 0;
      border-bottom: 1px solid #f3f4f6;
      gap: 1rem;
    }
    .bin-device-row:last-child { border-bottom: none; }
    .bin-device-id   { font-size: 0.85rem; font-weight: 600; color: var(--navy); font-family: monospace; }
    .bin-device-status {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.18rem 0.6rem;
      border-radius: 50px;
    }
    .bin-device-status.active { background: #f0fdf4; color: #16a34a; }
    .bin-device-status.inactive { background: #f9fafb; color: #6b7280; }

    .bin-empty {
      font-size: 0.85rem;
      color: var(--gray-400);
      padding: 0.5rem 0;
    }

    .bin-property-header {
      background: var(--white);
      border: 1px solid var(--gray-200);
      border-radius: 14px;
      padding: 1.75rem 2rem;
      margin-bottom: 1rem;
      color: var(--navy);
    }

    .bin-prop-address {
      font-family: var(--serif);
      font-size: 1.5rem;
      font-weight: 500;
      letter-spacing: -0.02em;
      margin-bottom: 0.35rem;
    }

    .bin-prop-meta {
      font-size: 0.82rem;
      color: var(--gray-400);
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .bin-prop-meta span { display: flex; align-items: center; gap: 0.35rem; }

    .bin-cards-grid {
      margin-bottom: 1rem;
    }

    .bin-detail-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      background: var(--white);
      border: 1px solid var(--gray-200);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 6px rgba(0,0,0,0.06);
    }
    .bin-detail-row {
      border-bottom: 1px solid #f3f4f6;
    }
    .bin-detail-row:last-child { border-bottom: none; }
    .bin-detail-label {
      padding: 0.7rem 1.25rem;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--gray-500);
      width: 38%;
      white-space: nowrap;
    }
    .bin-detail-value {
      padding: 0.7rem 1.25rem;
      font-size: 0.88rem;
      color: var(--navy);
      font-weight: 500;
    }
    .bin-detail-link {
      font-size: 0.78rem;
      color: #2563eb;
      text-decoration: none;
      margin-left: 0.75rem;
    }
    .bin-detail-link:hover { text-decoration: underline; }
    .bin-detail-tag {
      font-size: 0.74rem;
      font-weight: 600;
      margin-left: 0.75rem;
    }
    .bin-detail-tag.amber { color: #b45309; }
    .ll-pill {
      display: inline-block;
      font-size: 0.68rem;
      font-weight: 500;
      color: #9ca3af;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 50px;
      padding: 1px 7px;
      margin-left: 5px;
      letter-spacing: 0.01em;
      vertical-align: middle;
    }

    .bin-card {
      background: var(--white);
      border: 1px solid var(--gray-200);
      border-radius: 12px;
      padding: 1.25rem 1.4rem;
    }

    .bin-card-label {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--gray-400);
      margin-bottom: 0.4rem;
    }

    .bin-card-value {
      font-family: var(--serif);
      font-size: 1.4rem;
      font-weight: 500;
      color: var(--navy);
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .bin-card-sub {
      font-size: 0.75rem;
      color: var(--gray-400);
      margin-top: 0.2rem;
    }

    .bin-card.flag { border-color: #fca5a5; background: #fff5f5; }
    .bin-card.flag .bin-card-value { color: var(--red); }
    .bin-card.good { border-color: #86efac; background: #f0fdf4; }
    .bin-card.good .bin-card-value { color: #15803d; }

    /* AI Insights block */
    .bin-insights {
      background: var(--white);
      border: 1px solid var(--gray-200);
      border-radius: 14px;
      padding: 1.75rem 2rem;
    }

    .bin-insights-header {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 1.25rem;
    }

    .bin-insights-badge {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      background: var(--navy);
      color: var(--white);
      padding: 0.25rem 0.65rem;
      border-radius: 50px;
    }

    .bin-insights-title {
      font-family: var(--serif);
      font-size: 1rem;
      font-weight: 500;
      color: var(--navy);
    }

    .bin-insight-item {
      display: flex;
      gap: 0.85rem;
      padding: 0.85rem 0;
      border-bottom: 1px solid var(--gray-100);
      align-items: flex-start;
    }
    .bin-insight-item:last-child { border-bottom: none; padding-bottom: 0; }

    .bin-insight-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--navy);
      flex-shrink: 0;
      margin-top: 6px;
    }
    .bin-insight-dot.warn { background: #f59e0b; }
    .bin-insight-dot.alert { background: var(--red); }
    .bin-insight-dot.ok { background: var(--green-mid); }

    .bin-insight-text {
      font-size: 0.9rem;
      color: var(--gray-700);
      line-height: 1.65;
    }

    .bin-insight-text strong { color: var(--navy); font-weight: 600; }

    .bin-error {
      margin-top: 1.25rem;
      background: #fff5f5;
      border: 1px solid #fca5a5;
      border-radius: 10px;
      padding: 1rem 1.25rem;
      font-size: 0.875rem;
      color: var(--red);
    }

    .bin-cta-nudge {
      margin-top: 1.25rem;
      padding: 1.25rem 1.5rem;
      background: var(--off-white);
      border: 1px solid var(--gray-200);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .bin-cta-nudge p {
      font-size: 0.875rem;
      color: var(--gray-500);
      margin: 0;
    }

    .bin-cta-nudge strong { color: var(--navy); }

    .bin-cta-nudge a {
      background: var(--navy);
      color: var(--white);
      padding: 0.6rem 1.25rem;
      border-radius: 50px;
      font-size: 0.82rem;
      font-weight: 700;
      text-decoration: none;
      white-space: nowrap;
      transition: background 0.2s;
      flex-shrink: 0;
    }
    .bin-cta-nudge a:hover { background: var(--navy-hover); }

    /* ────────── RESPONSIVE ────────── */
    @media (max-width: 768px) {
      .nav-links li:not(:last-child) { display: none; }
      .nyc-inner { grid-template-columns: 1fr; gap: 2.5rem; }
      .cta-actions { flex-direction: column; gap: 1rem; }
      .footer-inner { flex-direction: column; text-align: center; }
      .footer-links { justify-content: center; }
      .bin-input-group { flex-direction: column; }
      .bin-cards-grid { grid-template-columns: repeat(2, 1fr); }
    }

    /* ── QA Feature Sections ── */

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:       #111e30;
    --navy-mid:   #1e2e45;
    --navy-light: #253852;
    --white:      #ffffff;
    --off-white:  #f5f7fa;
    --accent:     #e8f0fe;
    --gray-200:   #e5e7eb;
    --gray-400:   #9ca3af;
    --gray-500:   #6b7280;
    --serif:      'Lora', Georgia, serif;
    --sans:       'DM Sans', system-ui, sans-serif;
  }

  html { scroll-behavior: smooth; }
  body {
    font-family: var(--sans);
    background: var(--white);
    color: var(--navy);
  }

  /* ── SECTION WRAPPER ── */
  .qa-section {
    position: relative;
    padding: 60px 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
    max-width: 780px;
    margin: 0 auto;
  }

  /* Alternate: odd = text left, even = text right */
  .qa-section.reverse { direction: rtl; }
  .qa-section.reverse > * { direction: ltr; }

  /* ── BLOB BACKGROUND ── */
  .blob {
    position: absolute;
    border-radius: 60% 40% 55% 45% / 45% 55% 40% 60%;
    z-index: 0;
    pointer-events: none;
  }
  .blob-1 {
    width: 340px; height: 360px;
    background: #e8f2ff;
    top: 30%; right: 2%;
    transform: translateY(-50%);
    opacity: 0.75;
    border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%;
  }
  .blob-2 {
    width: 340px; height: 360px;
    background: #e8f2ff;
    top: 70%; left: 2%;
    transform: translateY(-50%);
    opacity: 0.75;
    border-radius: 45% 55% 38% 62% / 52% 44% 56% 48%;
  }
  .blob-3 {
    width: 340px; height: 360px;
    background: #e8f2ff;
    top: 30%; right: 2%;
    transform: translateY(-50%);
    opacity: 0.7;
    border-radius: 55% 45% 62% 38% / 42% 58% 44% 56%;
  }

  /* ── TEXT COLUMN ── */
  .qa-text {
    position: relative; z-index: 2;
  }

  .qa-label {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.7rem; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--gray-500);
    margin-bottom: 20px;
  }
  .qa-label-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--navy); opacity: 0.3;
  }

  .qa-heading {
    font-family: var(--serif);
    font-size: clamp(1.1rem, 2vw, 1.5rem);
    font-weight: 500;
    line-height: 1.18;
    letter-spacing: -0.02em;
    color: var(--navy);
    margin-bottom: 20px;
  }
  .qa-heading em {
    font-style: italic;
    color: var(--navy-mid);
    opacity: 0.7;
  }

  .qa-body {
    font-size: 0.9rem;
    color: var(--gray-500);
    line-height: 1.8;
    max-width: 380px;
    margin-bottom: 28px;
  }

  .qa-cta {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.8rem; font-weight: 600;
    color: var(--navy);
    text-decoration: none;
    border-bottom: 1.5px solid var(--navy);
    padding-bottom: 1px;
    opacity: 0.8;
    transition: opacity 0.2s, gap 0.2s;
  }
  .qa-cta:hover { opacity: 1; gap: 10px; }
  .qa-cta-arrow { font-size: 1rem; }

  /* ── CARD COLUMN ── */
  .qa-card-wrap {
    position: relative; z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* The Q&A insight card — styled like a real app UI card */
  .insight-card {
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: 18px;
    box-shadow:
      0 2px 4px rgba(17,30,48,0.04),
      0 12px 40px rgba(17,30,48,0.10),
      0 40px 80px rgba(17,30,48,0.08);
    width: 100%;
    max-width: 360px;
    overflow: hidden;
    transform: rotate(-1deg);
    transition: transform 0.3s ease;
  }
  .insight-card:hover { transform: rotate(0deg) scale(1.01); }

  /* Second card — slightly rotated other way, peeking behind */
  .card-stack {
    position: relative;
    width: 100%;
    max-width: 380px;
  }
  .card-shadow {
    position: absolute;
    top: 14px; left: 14px;
    width: calc(100% - 28px);
    max-width: 360px;
    height: 100%;
    background: #dce8f7;
    border-radius: 18px;
    z-index: 0;
    transform: rotate(1.5deg);
  }

  /* Card header bar */
  .ic-header {
    padding: 16px 20px 14px;
    background: var(--navy);
    display: flex; align-items: center; gap: 10px;
  }
  .ic-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 20px;
    padding: 4px 10px;
    font-size: 0.65rem; font-weight: 600;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: rgba(255,255,255,0.7);
  }
  @keyframes dot-flash {
    0%, 100% { opacity: 1; box-shadow: 0 0 6px #4ade80; }
    50%       { opacity: 0.25; box-shadow: none; }
  }
  .ic-badge-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 6px #4ade80;
    animation: dot-flash 2.4s ease-in-out infinite;
  }

  /* Question */
  .ic-question {
    padding: 18px 20px 14px;
    font-family: var(--serif);
    font-size: 0.95rem;
    font-style: italic;
    font-weight: 500;
    line-height: 1.45;
    color: var(--navy);
    border-bottom: 1px solid var(--gray-200);
    background: #fafbfc;
  }

  /* Answers */
  .ic-answers {
    padding: 14px 20px 18px;
    display: flex; flex-direction: column; gap: 10px;
    background: var(--white);
  }
  .ic-answer {
    display: flex; align-items: flex-start; gap: 10px;
    font-size: 0.82rem; color: #374151; line-height: 1.5;
  }
  .ic-answer-num {
    flex-shrink: 0;
    width: 18px; height: 18px;
    border-radius: 50%;
    background: var(--off-white);
    border: 1px solid var(--gray-200);
    font-size: 0.6rem; font-weight: 700;
    color: var(--gray-500);
    display: flex; align-items: center; justify-content: center;
    margin-top: 1px;
  }

  /* Metric pill at bottom of card */
  .ic-metric {
    margin: 0 20px 18px;
    padding: 10px 14px;
    background: var(--off-white);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .ic-metric-label { font-size: 0.72rem; color: var(--gray-500); font-weight: 500; }
  .ic-metric-value { font-size: 0.85rem; font-weight: 700; color: var(--navy); }
  .ic-metric-change {
    font-size: 0.7rem; font-weight: 600; padding: 2px 7px;
    border-radius: 20px;
  }
  .ic-metric-change.up   { background: #dcfce7; color: #166534; }
  .ic-metric-change.down { background: #fee2e2; color: #991b1b; }
  .ic-metric-change.warn { background: #fef3c7; color: #92400e; }



  /* ── SECTION HEADER ── */
  .section-intro {
    text-align: left;
    padding: 0 0 60px;
    max-width: 1000px;
    margin: 0 auto;
  }
  .section-intro .overline {
    display: inline-block;
    font-size: 0.7rem; font-weight: 700; letter-spacing: 0.11em;
    text-transform: uppercase; color: var(--gray-400); margin-bottom: 1rem;
  }
  .section-intro h2 {
    font-family: var(--serif);
    font-size: clamp(1.52rem, 2.8vw, 2.2rem);
    font-weight: 400; line-height: 1.15;
    letter-spacing: -0.02em; color: var(--navy);
    max-width: 780px; margin-bottom: 1rem;
  }
  .section-intro p {
    font-size: clamp(0.7rem, 1.26vw, 0.805rem);
    color: var(--gray-500); line-height: 1.78;
    max-width: 540px;
  }

  /* ── SCROLL FADE IN ── */
  .fade-in {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .fade-in.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .fade-in.delay-1 { transition-delay: 0.15s; }
  .fade-in.delay-2 { transition-delay: 0.3s; }

  
  /* ── MOBILE: Stack Q&A sections ── */
  @media (max-width: 768px) {
    .qa-section {
      grid-template-columns: 1fr !important;
      gap: 32px;
      padding: 40px 0;
    }
    .qa-section.reverse {
      direction: ltr !important;
    }
    .qa-section.reverse > * {
      direction: ltr !important;
    }
    .card-stack,
    .insight-card {
      max-width: 100% !important;
      width: 100% !important;
    }
    .qa-body { max-width: 100%; }
    .section-intro h2 { font-size: clamp(1.3rem, 5vw, 2.2rem); }
  }

`;

const bodyHTML = `<!-- NAV -->
  <nav>
    <a href="/" class="nav-logo">
      <img src="data:image/png;base64,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D9lsFgsWLADQPDmvdGJu2zZ+/OMfo7GxUb8nVbFI65gp457nabvStBWvvPJKAC3Ppul0MAs0mLo/5rP7wx/+UB8fQCTtqKvTt29fHHvssbotmZHiSinkcjlUVVXh6quvjly77vDdSNeFIx8hHYht25g6dWrEyDDFumzbxsMPP4zly5droTszEqaS4+fzedx9990RfRY5PlCqMO/7PlzXhed5mDp1Kqqrq0uO211WKwghhHQOMhlRSkXSZwFgzJgx+u9isagn+V999RUWLlxoceLcNXBdF77v46ijjlLV1dW60hCASFRSoVDAiy++aLUn2kUWmiQC6oYbboDv+xVHzOTzeTiOgxEjRmCjjTbSlZbKVdohpUip9nhql7kIOGfOHOvjjz/Wz62p22SK7YptKhFQ8vyOHTsWQ4cOjWj3dJeqRscff7zq16+f/p6mXpVt28hkMvB9HzNnzrSkzUn7pbgu+a7Q8UJIB1JXV4ejjz5aryZIyKe8tm0bd911V2Sf9njTxfC9+eabS/aXnGjzPc/z9P9PJpM4+uijdQk9gHnThBBCKieRSOiJi0RGAMDIkSMj28jE7oknnohEL5DOQ5wuSilMmDABuVyubPUg3/fx7rvvYunSpe2qWGNG7iaTSTz22GPWl19+GbFNWiOdTsP3fViWhTFjxiigxRnEdKPKMJ9NKfecz+e1I7ShoQELFizQ11UcLL7vaw0guVemE0bS02pra7H//vsrx3F0e+ouTtXTTjsNQLScOhAVb77uuut0SXWgJf2O4rrku7JeZlmmcFM8VE08pL31R66DTMylA+AEuHsQjwxxXVdHqiQSCZx00knKvJemdot08vfcc48WODOdJpWkG8kxnn76aevLL79c4+emxkv8/M877zwVj5KJb0cIId8VGd8A6FVrE+kzzZXS7lgdo7ch0SziWJGqeZtssgmGDx8OABHdMgC49957AXDi3BUQTZ5+/fph/Pjx2tEhmMKsV111VSQSwnym14TYR6lUCoVCAbZt44477oDneRXZuJ7n6cn8z372M30+iUSCGkEVItcpCIKSSCHpY//85z9bppMNaOmLzQioeDSL3MOzzjoLQRBE2k5XmsPI95TfVVVVGDJkCA455BCdWuU4jr5WZjTLddddV5LGbx6L9HzMBYU1vScaVKaO55ro8CdDHAwNDQ26PF0ymYyEdPXm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qv+zuO4MH83KLvj1lvzxxuY7uVxOLr744qbjWuM8Zqj5bbP5rP+wz85xP4BaKpXcHNf/N1YE1wxUS8vel3+8+mOyfV2v1/vdn4vsjq2ISHLi5x/YEydOlL/8y79U67Jhv7zVJ6nN3rC9Cfv+Cy+8oDfffLOedtppatk2jReIYrEohUIhcQKPhBOw8T02DsJnn322PvbYY/12uG3jVvlBm97eXvfztm/frrfeeqt7CuJHno3/JLZZa9u9aahsgXQ63bSP+gc/+EG5/PLL9ZVXXnHbpXGC0oo4jhMn4Le//W3df//9+70/+912fO4rhWP9iYV91p/97Gf9tmez7dbq+LBjxw739auvvqrf+9739IwzznA33ram2n8PI624WmMmj8lkMtLR0SGnn366G2MHKsz1TtlExi4Q/oTUvzA1G3ca96VdqJrx971/7jTLkPHHLfvccRzrBz/4wb2xm951fn0kOwb8a4AFOmzcmDZtmvzoRz9y54R/4W4W2BrqPPP3kX29ePFivfzyy902bjau+uOXn1k4krJN0aexRpLdCG3ZsiVxPpurrrqqtZaXaJmfMebPvSZMmCAXXHCBPv744+58biWT3M77xtfaGP/888/rySefrJlMJvFAc6BMt5GqWRDDtvNpp52W2DZ+589Wr61+wMXGT7uOLViwQM877zxXKy2XyyXGUgsUWEDbv+6PlppljZmdIskH67Nnz256bNv9SxRFrluNf974D16xd1m2uhWy9e/Rba5j3zvggAPkpz/9ab8gR7NjoJVztLE250BzoTAMm/6+ge6xmz3wUu1fjNv/OYPFRGq1mq5YscLVLQza29ult7dXurq65KKLLtKuri6J41g+8pGPyLRp0+QDH/iAG0ys5kgcx1KtVhM3EwOJoihxkjSuSxfZvda/XC679X+///3vpVgsyv/+7//Kiy++6Oof/O53v5Nly5YFqVRqRK1T/eY3v6mqKrVaTU444QQ54IAD5NhjjxWR3WvZyuVyYps2rl8bim1H///T6bRUKhV3o1qr1WTt2rWydetW6e7ulhUrVkihUJBarSYvvPCCLFq0KMhms5LP56Wnp+dd+vRvn639tPWeHR0dUi6XZezYsXL22Wfr1KlT3bE4Z84cmTp1qkybNi3Rz11kd62DWq0muVyu6XE4kFqtlggGbtmyRZ599ll54okn3M9Op9Py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" alt="Half/Ave" style="height: 34px; width: auto; display: block;" />
    </a>
    <ul class="nav-links">
      <li><a href="/risk.html" style="color:rgba(255,255,255,0.5);text-decoration:none;font-size:0.875rem;font-weight:500;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Risk Index</a></li>
      <li><a class="nav-cta" data-cal-link="susan-wu-l9yx2k/demo" data-cal-namespace="demo" data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}' style="cursor:pointer;">Get Early Access</a></li>
    </ul>
  </nav>

  <!-- HERO -->
  <section class="hero">
    <video class="hero-video" id="hero-video" src="https://pub-8148357eae8a439fa3a35df4c60df703.r2.dev/building/trio/4826f645-ef7e-4ff9-8591-f690bdd457e6.mp4" autoplay muted playsinline></video>
    <div class="hero-overlay"></div>
    <div class="hero-inner">
      <h1>The NYC Rental<br/><em>Operating System</em></h1>
      <p>NYC buildings produce a constant stream of operational data.<br>Half Ave turns that data into intelligence so you know exactly <strong>what matters and what to do next</strong>.</p>
      <div class="hero-actions">
        <a class="btn-primary" data-cal-link="susan-wu-l9yx2k/demo" data-cal-namespace="demo" data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}' style="cursor:pointer;">Get Early Access</a>
        <a href="/risk.html" class="hero-text-link">NYC Risk Index →</a>
      </div>
    </div>

    <!-- TICKER inside hero so it's visible above the fold -->
    <div class="ticker" aria-hidden="true" style="position:absolute;bottom:0;left:0;right:0;z-index:10;">
      <div class="ticker-inner">
        <span class="ticker-item">LL84 Benchmarking</span><span class="ticker-dot">  </span>
        <span class="ticker-item">DHCR Annual Rent Reporting</span><span class="ticker-dot">  </span>
        <span class="ticker-item">RS Lease Renewals</span><span class="ticker-dot">  </span>
        <span class="ticker-item">HPD Violations</span><span class="ticker-dot">  </span>
        <span class="ticker-item">DOB / ECB Violations</span><span class="ticker-dot">  </span>
        <span class="ticker-item">OATH Hearings</span><span class="ticker-dot">  </span>
        <span class="ticker-item">Sanitation (DSNY)</span><span class="ticker-dot">  </span>
        <span class="ticker-item">DOHMH Inspections</span><span class="ticker-dot">  </span>
        <span class="ticker-item">NYPD Violations</span><span class="ticker-dot">  </span>
        <span class="ticker-item">Prevailing Wage</span><span class="ticker-dot">  </span>
        <span class="ticker-item">Good Cause Eviction</span><span class="ticker-dot">  </span>
        <span class="ticker-item">LL84 Benchmarking</span><span class="ticker-dot">  </span>
        <span class="ticker-item">DHCR Annual Rent Reporting</span><span class="ticker-dot">  </span>
        <span class="ticker-item">RS Lease Renewals</span><span class="ticker-dot">  </span>
        <span class="ticker-item">HPD Violations</span><span class="ticker-dot">  </span>
        <span class="ticker-item">DOB / ECB Violations</span><span class="ticker-dot">  </span>
        <span class="ticker-item">OATH Hearings</span><span class="ticker-dot">  </span>
        <span class="ticker-item">Sanitation (DSNY)</span><span class="ticker-dot">  </span>
        <span class="ticker-item">DOHMH Inspections</span><span class="ticker-dot">  </span>
        <span class="ticker-item">NYPD Violations</span><span class="ticker-dot">  </span>
        <span class="ticker-item">Prevailing Wage</span><span class="ticker-dot">  </span>
        <span class="ticker-item">Good Cause Eviction</span><span class="ticker-dot">  </span>
      </div>
    </div>
  </section>

  <!-- BIN LOOKUP -->
  <section class="bin-section">
    <div class="bin-inner">
      <div class="bin-header">
        <span class="section-label">Designed for NYC</span>
        <h2 class="section-title">Property management starts with understanding the property.</h2>
        <p class="section-sub">Experience the difference when your property management software understands the world your property operates in. Enter any BIN and watch Half Ave pull public records, flag compliance obligations, and surface the operational context you need to run your building.</p>
      </div>

      <div class="bin-tool">
        <div class="bin-examples" style="margin-bottom:0.75rem;">
          <span class="bin-examples-label">Try an example:</span>
          <button class="bin-example-chip" data-bin="1089723">1089723</button>
          <button class="bin-example-chip" data-bin="3397861">3397861</button>
        </div>

        <div class="bin-input-wrap">
          <div class="bin-input-group">
            <input type="text" id="bin-input" class="bin-input" placeholder="e.g. 1001831" maxlength="10" inputmode="numeric"/>
            <button class="bin-btn" id="bin-submit">
              <span class="bin-btn-text">See Your Building</span>
              <span class="bin-btn-loading" style="display:none;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                Loading…
              </span>
            </button>
          </div>
          <p class="bin-hint" style="margin:0.5rem 0 0">Find your BIN on <a href="https://a810-bisweb.nyc.gov/bisweb/bispi00.jsp" target="_blank" rel="noopener">NYC Buildings BIS</a>, the <a href="https://zola.planning.nyc.gov/" target="_blank" rel="noopener">NYC Zoning Map</a>, or <a href="https://hpdonline.nyc.gov/hpdonline/" target="_blank" rel="noopener">HPD Online</a></p>
        </div>

        <div class="bin-error" id="bin-error" style="display:none;"></div>

        <!-- Results panel -->
        <div id="bin-results" style="display:none; margin-top:2rem; animation: fadeUp 0.35s ease;">

          <!-- Address banner -->
          <div class="bin-property-header" id="bin-property-header" style="display:none"></div>

          <!-- Stat cards row -->
          <div class="bin-cards-grid" id="bin-cards-grid"></div>

          <!-- Expandable sections -->
          <div id="bin-sections"></div>

        </div>
      </div>
    </div>
  </section>
  <!-- FEATURES -->
  <section class="nyc-section" id="nyc">
    <div class="nyc-inner-wrap">

      <span class="section-label">Designed for Operations</span>
      <h2 class="section-title">High performance comes from disciplined workflows.</h2>
      <p class="section-sub" style="margin-bottom:3.5rem;">The best operators don't succeed because they have more options — they succeed because they run tighter operations. Rather than accommodate every possible way of working, Half Ave is designed around how strong property operations actually work.</p>

      <!-- Three Feature Cards -->
      <div class="feature-trio">

        <!-- Operations Hub -->
        <div class="ftcard ftcard-1">
          <div class="ftcard-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          </div>
          <div class="ftcard-eyebrow">Command Center</div>
          <div class="ftcard-title">One place to run operations and measure performance.</div>
          <ul class="ftcard-bullets">
            <li>View current performance metrics alongside KPI goals</li>
            <li>Flag overdue maintenance tickets or vacant units beyond standard lease-up time</li>
            <li>Show expiration of 5D/14D legal notice periods</li>
            <li>Suggest renewal pricing and instant lease delivery upon acceptance</li>
          </ul>
        </div>

        <!-- Compliance Engine -->
        <div class="ftcard ftcard-2">
          <div class="ftcard-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
          <div class="ftcard-eyebrow">Compliance Engine</div>
          <div class="ftcard-title">NYC compliance on autopilot — before deadlines hit.</div>
          <ul class="ftcard-bullets">
            <li>LL11, Safety Mailings, MDR, DHCR Annual Rent Reporting</li>
            <li>AI agents that prepare and submit required reports</li>
            <li>Native support for rent stabilization and CityFHEPS payments</li>
            <li>Clear guidance on required filings &amp; submission process</li>
          </ul>
        </div>

        <!-- AI Concierge -->
        <div class="ftcard ftcard-3">
          <div class="ftcard-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z"/></svg>
          </div>
          <div class="ftcard-eyebrow">AI Concierge</div>
          <div class="ftcard-title">Consistent service across every interaction.</div>
          <ul class="ftcard-bullets">
            <li>Instant answers trained on 10,000+ real conversations</li>
            <li>Maintenance requests logged and routed automatically</li>
            <li>Smart escalation when attention is required</li>
            <li>Multilingual support for residents</li>
          </ul>
        </div>

      </div><!-- /feature-trio -->

    </div>
  </section>
  <section class="qa-feature-section" id="features">
<div style="max-width:1000px;margin:0 auto;">
<!-- Section intro -->
<div class="section-intro fade-in">
  <div class="overline">Designed for Operations</div>
  <h2>Good managers know their buildings.<br>The data should back them up.</h2>
  <p>Behind every lease, complaint, and work order is a signal about how the property is operating. Traditional property management software hides those signals inside reports. Half Ave knows the data is already there and surfaces what matters automatically.</p>
</div>

<!-- ─────────────────────────────────────────── -->
<!-- SECTION 1: Leasing (text left, card right) -->
<!-- ─────────────────────────────────────────── -->
<div class="qa-section fade-in">
  <div class="blob blob-1"></div>

  <div class="qa-text">
    <div class="qa-label"><span class="qa-label-dot"></span>Leasing</div>
    <h3 class="qa-heading">Pattern Detection</h3>
    <p class="qa-body">Half Ave analyzes leasing, maintenance, financial, and tenant data to detect patterns, anomalies, and trends that reveal changes in building performance.</p>
  </div>

  <div class="qa-card-wrap">
    <div class="card-stack">
      <div class="card-shadow"></div>
      <div class="insight-card">
        <div class="ic-header">
          <span class="ic-badge"><span class="ic-badge-dot"></span>AI Insights</span>
        </div>
        <div class="ic-question">Why is vacancy at 7% this quarter?</div>
        <div class="ic-answers">
          <div class="ic-answer">
            <span class="ic-answer-num">1</span>
            64% of current vacancies are 2-bedroom units
          </div>
          <div class="ic-answer">
            <span class="ic-answer-num">2</span>
            Renewal rates for 2BDs are 48% vs. 72% for 1BDs.
          </div>
          <div class="ic-answer">
            <span class="ic-answer-num">3</span>
            Forwarding addresses show many residents moving out of state.
          </div>
        </div>
        <div class="ic-metric">
          <span class="ic-metric-label">Portfolio vacancy rate</span>
          <span class="ic-metric-value">7.2%</span>
          <span class="ic-metric-change warn">Target: 3%</span>
        </div>
      </div>
    </div>
  </div>
</div>


<!-- ─────────────────────────────────────────── -->
<!-- SECTION 2: Financials (card left, text right) -->
<!-- ─────────────────────────────────────────── -->
<div class="qa-section reverse fade-in delay-1">
  <div class="blob blob-2"></div>

  <div class="qa-text">
    <div class="qa-label"><span class="qa-label-dot"></span>Financials</div>
    <h3 class="qa-heading">Cross-System Context</h3>
    <p class="qa-body">Half Ave establishes operational baselines, detects changes, and connects signals across your buildings. Rather than static metrics, owners see clear explanations of what’s happening and why.</p>
  </div>

  <div class="qa-card-wrap">
    <div class="card-stack">
      <div class="card-shadow"></div>
      <div class="insight-card">
        <div class="ic-header">
          <span class="ic-badge"><span class="ic-badge-dot"></span>AI Insights</span>
        </div>
        <div class="ic-question">Why is net income down this month?</div>
        <div class="ic-answers">
          <div class="ic-answer">
            <span class="ic-answer-num">1</span>
            A large group of leases ending this month were structured with last-month-free concessions.
          </div>
          <div class="ic-answer">
            <span class="ic-answer-num">2</span>
            Electricity costs were higher than the building’s typical baseline.
          </div>
          <div class="ic-answer">
            <span class="ic-answer-num">3</span>
            Net income is trending 4% below projected levels for the period
          </div>
        </div>
        <div class="ic-metric">
          <span class="ic-metric-label">Net income</span>
          <span class="ic-metric-value">-$40,200</span>
          <span class="ic-metric-change down">−4.3% vs last mo</span>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- SECTION 3: Maintenance (text left, card right) -->
<!-- ─────────────────────────────────────────── -->
<div class="qa-section fade-in delay-2">
  <div class="blob blob-3"></div>

  <div class="qa-text">
    <div class="qa-label"><span class="qa-label-dot"></span>Maintenance</div>
    <h3 class="qa-heading">Operational Intelligence</h3>
    <p class="qa-body">Half Ave applies domain-specific context to operational data across your buildings. Leasing patterns, tenant behavior, expenses, and historical performance are analyzed using models informed by real property operations.</p>
  </div>

  <div class="qa-card-wrap">
    <div class="card-stack">
      <div class="card-shadow"></div>
      <div class="insight-card">
        <div class="ic-header">
          <span class="ic-badge"><span class="ic-badge-dot"></span>AI Insights</span>
        </div>
        <div class="ic-question">Why are maintenance issues increasing?</div>
        <div class="ic-answers">
          <div class="ic-answer">
            <span class="ic-answer-num">1</span>
            Several hot water outage tickets were submitted this week.
          </div>
          <div class="ic-answer">
            <span class="ic-answer-num">2</span>
            Maintenance notes confirm the fix involved bleeding the boiler.
          </div>
          <div class="ic-answer">
            <span class="ic-answer-num">3</span>
            A twice-yearly boiler bleed would likely reduce recurrence. No recurring preventative maintenance exists for this system.
          </div>
        </div>
        <div class="ic-metric">
          <span class="ic-metric-label">Open tickets this month</span>
          <span class="ic-metric-value">14</span>
          <span class="ic-metric-change down">+6 vs last mo</span>
        </div>
      </div>
    </div>
  </div>
</div>


<!-- ─────────────────────────────────────────── -->
  </div>
  </section>


  <!-- PRICING -->
  <section class="pricing-section">
    <div class="pricing-inner">
      <div class="pricing-left">
        <span class="section-label">Designed for scale</span>
        <h2 class="section-title">Built with our<br>first partners.</h2>
        <p class="pricing-message">We're working with a small group of NYC owners as we launch. Early partners receive preferred pricing and direct input into product development.</p>
      </div>
      <div class="pricing-card">
        <div class="pricing-card-label">Early Partner Benefits</div>
        <ul class="pricing-perks">
          <li>Preferred pricing locked in for life</li>
          <li>Direct line to the product team</li>
          <li>Shape the roadmap with your feedback</li>
          <li>Priority onboarding &amp; white-glove setup</li>
          <li>Access to every feature as it ships</li>
        </ul>
        <button
          class="btn-cta"
          data-cal-link="susan-wu-l9yx2k/demo"
          data-cal-namespace="demo"
          data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
          style="width:100%;justify-content:center;">
          Request an early access spot
        </button>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <!-- Cal element-click embed code begins -->
  
  <!-- Cal element-click embed code ends -->


  <!-- FOOTER -->
  <footer class="site-footer" style="border-top: 1px solid rgba(255,255,255,0.08);">
    <div class="site-footer-inner">
      <div class="footer-col footer-brand">
        <a href="/" class="footer-logo">
          <img src="data:image/png;base64,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D9lsFgsWLADQPDmvdGJu2zZ+/OMfo7GxUb8nVbFI65gp457nabvStBWvvPJKAC3Ppul0MAs0mLo/5rP7wx/+UB8fQCTtqKvTt29fHHvssbotmZHiSinkcjlUVVXh6quvjly77vDdSNeFIx8hHYht25g6dWrEyDDFumzbxsMPP4zly5droTszEqaS4+fzedx9990RfRY5PlCqMO/7PlzXhed5mDp1Kqqrq0uO211WKwghhHQOMhlRSkXSZwFgzJgx+u9isagn+V999RUWLlxoceLcNXBdF77v46ijjlLV1dW60hCASFRSoVDAiy++aLUn2kUWmiQC6oYbboDv+xVHzOTzeTiOgxEjRmCjjTbSlZbKVdohpUip9nhql7kIOGfOHOvjjz/Wz62p22SK7YptKhFQ8vyOHTsWQ4cOjWj3dJeqRscff7zq16+f/p6mXpVt28hkMvB9HzNnzrSkzUn7pbgu+a7Q8UJIB1JXV4ejjz5aryZIyKe8tm0bd911V2Sf9njTxfC9+eabS/aXnGjzPc/z9P9PJpM4+uijdQk9gHnThBBCKieRSOiJi0RGAMDIkSMj28jE7oknnohEL5DOQ5wuSilMmDABuVyubPUg3/fx7rvvYunSpe2qWGNG7iaTSTz22GPWl19+GbFNWiOdTsP3fViWhTFjxiigxRnEdKPKMJ9NKfecz+e1I7ShoQELFizQ11UcLL7vaw0guVemE0bS02pra7H//vsrx3F0e+ouTtXTTjsNQLScOhAVb77uuut0SXWgJf2O4rrku7JeZlmmcFM8VE08pL31R66DTMylA+AEuHsQjwxxXVdHqiQSCZx00knKvJemdot08vfcc48WODOdJpWkG8kxnn76aevLL79c4+emxkv8/M877zwVj5KJb0cIId8VGd8A6FVrE+kzzZXS7lgdo7ch0SziWJGqeZtssgmGDx8OABHdMgC49957AXDi3BUQTZ5+/fph/Pjx2tEhmMKsV111VSQSwnym14TYR6lUCoVCAbZt44477oDneRXZuJ7n6cn8z372M30+iUSCGkEVItcpCIKSSCHpY//85z9bppMNaOmLzQioeDSL3MOzzjoLQRBE2k5XmsPI95TfVVVVGDJkCA455BCdWuU4jr5WZjTLddddV5LGbx6L9HzMBYU1vScaVKaO55ro8CdDHAwNDQ26PF0ymYyEdPXm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qv+zuO4MH83KLvj1lvzxxuY7uVxOLr744qbjWuM8Zqj5bbP5rP+wz85xP4BaKpXcHNf/N1YE1wxUS8vel3+8+mOyfV2v1/vdn4vsjq2ISHLi5x/YEydOlL/8y79U67Jhv7zVJ6nN3rC9Cfv+Cy+8oDfffLOedtppatk2jReIYrEohUIhcQKPhBOw8T02DsJnn322PvbYY/12uG3jVvlBm97eXvfztm/frrfeeqt7CuJHno3/JLZZa9u9aahsgXQ63bSP+gc/+EG5/PLL9ZVXXnHbpXGC0oo4jhMn4Le//W3df//9+70/+912fO4rhWP9iYV91p/97Gf9tmez7dbq+LBjxw739auvvqrf+9739IwzznA33ram2n8PI624WmMmj8lkMtLR0SGnn366G2MHKsz1TtlExi4Q/oTUvzA1G3ca96VdqJrx971/7jTLkPHHLfvccRzrBz/4wb2xm951fn0kOwb8a4AFOmzcmDZtmvzoRz9y54R/4W4W2BrqPPP3kX29ePFivfzyy902bjau+uOXn1k4krJN0aexRpLdCG3ZsiVxPpurrrqqtZaXaJmfMebPvSZMmCAXXHCBPv744+58biWT3M77xtfaGP/888/rySefrJlMJvFAc6BMt5GqWRDDtvNpp52W2DZ+589Wr61+wMXGT7uOLViwQM877zxXKy2XyyXGUgsUWEDbv+6PlppljZmdIskH67Nnz256bNv9SxRFrluNf974D16xd1m2uhWy9e/Rba5j3zvggAPkpz/9ab8gR7NjoJVztLE250BzoTAMm/6+ge6xmz3wUu1fjNv/OYPFRGq1mq5YscLVLQza29ult7dXurq65KKLLtKuri6J41g+8pGPyLRp0+QDH/iAG0ys5kgcx1KtVhM3EwOJoihxkjSuSxfZvda/XC679X+///3vpVgsyv/+7//Kiy++6Oof/O53v5Nly5YFqVRqRK1T/eY3v6mqKrVaTU444QQ54IAD5NhjjxWR3WvZyuVyYps2rl8bim1H///T6bRUKhV3o1qr1WTt2rWydetW6e7ulhUrVkihUJBarSYvvPCCLFq0KMhms5LP56Wnp+dd+vRvn639tPWeHR0dUi6XZezYsXL22Wfr1KlT3bE4Z84cmTp1qkybNi3Rz11kd62DWq0muVyu6XE4kFqtlggGbtmyRZ599ll54okn3M9Op9Py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" alt="Half/Ave" style="height: 28px; width: auto; display: block;" />
        </a>
        <p class="footer-tagline">The NYC rental operating system.</p>
        <span class="footer-email"><a href="/cdn-cgi/l/email-protection#640c0108080b240c0508020512014a070b" style="color:#ffffff;text-decoration:none;display:inline-flex;align-items:center;gap:0.4rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg><span style="color:#ffffff;"><span class="__cf_email__" data-cfemail="7018151c1c1f3018111c161106155e131f">[email&#160;protected]</span></span></a></span>
        <div class="footer-social">
          <!-- X / Twitter -->
          <a href="#" aria-label="X">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <!-- Instagram -->
          <a href="#" aria-label="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/></svg>
          </a>
          <!-- LinkedIn -->
          <a href="#" aria-label="LinkedIn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
        </div>
      </div>

      <div class="footer-col">
        <div class="footer-col-title">Company</div>
        <ul>
          <li><a href="#">About Us</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Press</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <div class="footer-col-title">Services</div>
        <ul>
          <li><a href="#">Residential Management</a></li>
          <li><a href="#">Tenant Screening</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <div class="footer-col-title">Legal</div>
        <ul>
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms of Service</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <span>© 2026 Half Ave Company LLC. All rights reserved.</span>
      <span>Designed with Claude.ai</span>
    </div>
  </footer>

  





  


  
 


`;

const inlineScripts = ["\n  (function () {\n    const input   = document.getElementById('bin-input');\n    const btn     = document.getElementById('bin-submit');\n    const errorEl = document.getElementById('bin-error');\n    const results = document.getElementById('bin-results');\n    const propHdr = document.getElementById('bin-property-header');\n    const cardsEl = document.getElementById('bin-cards-grid');\n    const sectionsEl = document.getElementById('bin-sections');\n\n    document.querySelectorAll('.bin-example-chip').forEach(chip => {\n      chip.addEventListener('click', () => { input.value = chip.dataset.bin; doLookup(); });\n    });\n    btn.addEventListener('click', doLookup);\n    input.addEventListener('keydown', e => { if (e.key === 'Enter') doLookup(); });\n\n    function setLoading(on) {\n      btn.disabled = on;\n      btn.querySelector('.bin-btn-text').style.display    = on ? 'none' : 'inline';\n      btn.querySelector('.bin-btn-loading').style.display = on ? 'flex' : 'none';\n    }\n\n    function showError(msg) {\n      results.style.display = 'none';\n      errorEl.style.display = 'block';\n      errorEl.textContent   = msg;\n    }\n\n    async function doLookup() {\n      const bin = input.value.trim().replace(/\\D/g, '');\n      if (!bin || bin.length < 7) { showError('Please enter a valid BIN (7 digits).'); return; }\n      errorEl.style.display = 'none';\n      results.style.display = 'none';\n      setLoading(true);\n\n      const NYC_APP_TOKEN = 'hfh9po4tOCXZP5lkaDao0FLd1';\n      const NYC_HEADERS = { 'X-App-Token': NYC_APP_TOKEN };\n\n      try {\n        const [dobRes, hpdRes, ecbRes, dobViolRes, boilerRes, hpdBldgRes, hpdRegRes, dobBisRes,\n               oathRes] = await Promise.all([\n          fetch(`https://data.cityofnewyork.us/resource/w9ak-ipjd.json?bin=${bin}&$limit=1`, {headers: NYC_HEADERS}),\n          fetch(`https://data.cityofnewyork.us/resource/wvxf-dwi5.json?bin=${bin}&$limit=500`, {headers: NYC_HEADERS}),\n          // DOB violations (civil penalties, BIS \u2014 3h2n-5cm9); violation_category \"V\"=open \"V*\"=closed\n          fetch(`https://data.cityofnewyork.us/resource/3h2n-5cm9.json?bin=${bin}&$limit=200`, {headers: NYC_HEADERS}),\n          // ECB violations (OATH-adjudicated summonses \u2014 6bgk-3dad); violation_status \"RESOLVE\"=closed\n          fetch(`https://data.cityofnewyork.us/resource/6bgk-3dad.json?bin=${bin}&$limit=200`, {headers: NYC_HEADERS}).catch(() => ({json:()=>[]})),\n          fetch(`https://data.cityofnewyork.us/resource/52dp-yji6.json?$where=bin_number='${bin}'&$limit=100`, {headers: NYC_HEADERS}),\n          fetch(`https://data.cityofnewyork.us/resource/kj4p-ruqc.json?bin=${bin}&$limit=1`, {headers: NYC_HEADERS}),\n          fetch(`https://data.cityofnewyork.us/resource/tesw-yqqr.json?bin=${bin}&$limit=1`, {headers: NYC_HEADERS}),\n          fetch(`https://data.cityofnewyork.us/resource/ic3t-wcy2.json?bin__=${bin}&$limit=1`, {headers: NYC_HEADERS}),\n          // OATH hearing decisions (jz4z-kudi)\n          fetch(`https://data.cityofnewyork.us/resource/jz4z-kudi.json?bin=${bin}&$limit=200`, {headers: NYC_HEADERS}).catch(() => ({json:()=>[]})),\n        ]);\n\n        const [dobData, hpdRaw, ecbRaw, dobViolRaw, boilerRaw, hpdBldgRaw, hpdRegRaw, dobBisRaw,\n               oathRaw] = await Promise.all([\n          dobRes.json(), hpdRes.json(), ecbRes.json(),\n          dobViolRes.json ? dobViolRes.json() : Promise.resolve([]),\n          boilerRes.json(), hpdBldgRes.json(), hpdRegRes.json(), dobBisRes.json(),\n          oathRes.json ? oathRes.json() : Promise.resolve([]),\n        ]);\n\n        // Build BBL for fallback searches (boroid + block padded 5 + lot padded 4)\n        const _hb0  = Array.isArray(hpdBldgRaw) && hpdBldgRaw.length > 0 ? hpdBldgRaw[0] : {};\n        const _reg0 = Array.isArray(hpdRegRaw)  && hpdRegRaw.length  > 0 ? hpdRegRaw[0]  : {};\n        const _bblBoroId = _hb0.boroid || _reg0.boroid || '';\n        const _bblBlock  = _hb0.block  || _reg0.block  || '';\n        const _bblLot    = _hb0.lot    || _reg0.lot    || '';\n        const bblNum = (_bblBoroId && _bblBlock && _bblLot)\n          ? `${_bblBoroId}${String(_bblBlock).padStart(5,'0')}${String(_bblLot).padStart(4,'0')}`\n          : '';\n        console.log('BBL for fallback:', bblNum);\n\n        // \u2500\u2500 BBL-keyed sources: Sanitation, DOHMH, NYPD\n        // All three use jz4z-kudi (OATH hearings), queried by block+lot+borough \u2014 mirrors route.ts\n        // Fetch ALL records for this block+lot in one request, then split by issuing_agency client-side\n        const BOROUGH_NAMES = { '1':'MANHATTAN','2':'BRONX','3':'BROOKLYN','4':'QUEENS','5':'STATEN ISLAND' };\n        const oathBorough = BOROUGH_NAMES[_bblBoroId] || '';\n        const oathBlock   = _bblBlock ? String(_bblBlock).padStart(5,'0') : '';\n        const oathLot     = _bblLot   ? String(_bblLot).padStart(4,'0')   : '';\n\n        let allOathRaw = [];\n        if (oathBorough && oathBlock && oathLot) {\n          try {\n            const where = `violation_location_borough='${oathBorough}' AND violation_location_block_no='${oathBlock}' AND violation_location_lot_no='${oathLot}'`;\n            const r = await fetch(`https://data.cityofnewyork.us/resource/jz4z-kudi.json?$where=${encodeURIComponent(where)}&$limit=500`, {headers: NYC_HEADERS});\n            const d = await r.json();\n            allOathRaw = Array.isArray(d) ? d : [];\n          } catch(e) { allOathRaw = []; }\n        }\n        console.log('OATH raw total:', allOathRaw.length, allOathRaw[0] ? JSON.stringify(allOathRaw[0]).slice(0,200) : 'empty');\n\n        // Split by issuing_agency \u2014 mirrors route.ts fetchSanitation/fetchDOHMH/fetchNYPD\n        const sanitationRaw = allOathRaw.filter(v => {\n          const a = (v.issuing_agency || '').toUpperCase();\n          return a.includes('DSNY') || a.includes('SANITATION');\n        });\n        const dohmhRaw = allOathRaw.filter(v => {\n          const a = (v.issuing_agency || '').toUpperCase();\n          return a.includes('DOHMH');\n        });\n        const nypdRaw = allOathRaw.filter(v => {\n          const a = (v.issuing_agency || '').toUpperCase();\n          return a.includes('NYPD') || a.includes('POLICE');\n        });\n\n        // Elevator: try bin_number (text field), fall back to bin (numeric), then BBL\n        let elevRaw = [];\n        try {\n          const e1 = await fetch(`https://data.cityofnewyork.us/resource/e5aq-a4j2.json?$where=bin_number='${bin}'&$limit=100`, {headers: NYC_HEADERS});\n          const d1 = await e1.json();\n          if (Array.isArray(d1) && d1.length > 0) {\n            elevRaw = d1;\n          } else {\n            const e2 = await fetch(`https://data.cityofnewyork.us/resource/e5aq-a4j2.json?bin=${bin}&$limit=100`, {headers: NYC_HEADERS});\n            const d2 = await e2.json();\n            if (Array.isArray(d2) && d2.length > 0) {\n              elevRaw = d2;\n            } else {\n              const e3 = await fetch(`https://data.cityofnewyork.us/resource/e5aq-a4j2.json?$where=bin=${bin}&$limit=100`, {headers: NYC_HEADERS});\n              const d3 = await e3.json();\n              if (Array.isArray(d3) && d3.length > 0) {\n                elevRaw = d3;\n              } else if (bblNum) {\n                console.log('ELEV: BIN miss, trying BBL', bblNum);\n                const e4 = await fetch(`https://data.cityofnewyork.us/resource/e5aq-a4j2.json?$where=bbl='${bblNum}'&$limit=100`, {headers: NYC_HEADERS});\n                const d4 = await e4.json();\n                if (Array.isArray(d4) && d4.length > 0) {\n                  elevRaw = d4;\n                } else {\n                  const e5 = await fetch(`https://data.cityofnewyork.us/resource/e5aq-a4j2.json?bbl=${bblNum}&$limit=100`, {headers: NYC_HEADERS});\n                  const d5 = await e5.json();\n                  elevRaw = Array.isArray(d5) ? d5 : [];\n                }\n              }\n            }\n          }\n        } catch(e) { elevRaw = []; }\n        console.log('ELEV RAW (multi-try):', JSON.stringify(elevRaw).slice(0,400));\n        console.log('DOB BIS (ic3t-wcy2):', JSON.stringify(dobBisRaw[0] || {}));\n\n        const dobBis = Array.isArray(dobBisRaw) && dobBisRaw.length > 0 ? dobBisRaw[0] : null;\n        const hpdFallback = Array.isArray(hpdBldgRaw) && hpdBldgRaw.length > 0 ? hpdBldgRaw[0] : null;\n        const hpdRegFallback = Array.isArray(hpdRegRaw) && hpdRegRaw.length > 0 ? hpdRegRaw[0] : null;\n\n        if (!Array.isArray(dobData) || dobData.length === 0) {\n          if (!hpdFallback && !hpdRegFallback && !dobBis) {\n            showError(`No building found for BIN ${bin}. Please double-check the BIN and try again.`);\n            setLoading(false);\n            return;\n          }\n        }\n\n        const bldg = (Array.isArray(dobData) && dobData.length > 0) ? dobData[0] : {\n          bin,\n          address: hpdFallback?.registrationcontactaddress || hpdRegFallback?.buildingaddress || (dobBis ? `${dobBis.house__} ${dobBis.street_name}` : '\u2014'),\n          boro: hpdFallback?.boroid || hpdRegFallback?.boroid || dobBis?.borough || '\u2014',\n          boro_nm: dobBis?.borough || '',\n          block: hpdFallback?.block || dobBis?.block || '\u2014',\n          lot: hpdFallback?.lot || dobBis?.lot || '\u2014',\n          communityboard: dobBis?.community___board || '\u2014',\n          landuse: '\u2014',\n          unitsres: hpdRegFallback?.storylcount || '\u2014',\n          numfloors: dobBis?.existingno_of_stories || '\u2014',\n          yearbuilt: '\u2014',\n          zipcode: hpdRegFallback?.zipcode || dobBis?.zip_code || '\u2014',\n          house_no: dobBis?.house__ || '',\n          street_name: dobBis?.street_name || '',\n          latitude: dobBis?.gis_latitude || '',\n          longitude: dobBis?.gis_longitude || '',\n        };\n        // If kj4p-ruqc returned nothing by bin, try by buildingid from MDR\n        let hpdBldg = hpdBldgRaw;\n        if ((!Array.isArray(hpdBldg) || hpdBldg.length === 0) && hpdRegRaw[0]?.buildingid) {\n          try {\n            const r = await fetch(`https://data.cityofnewyork.us/resource/kj4p-ruqc.json?buildingid=${hpdRegRaw[0].buildingid}&$limit=1`, {headers: NYC_HEADERS});\n            hpdBldg = await r.json();\n          } catch(e) {}\n        }\n        console.log('HPD Building (kj4p-ruqc) keys:', hpdBldg[0] ? Object.keys(hpdBldg[0]) : 'EMPTY - no results');\n        console.log('HPD Building (kj4p-ruqc) data:', JSON.stringify(hpdBldg[0] || {}));\n        console.log('HPD MDR (tesw-yqqr):', JSON.stringify(hpdRegRaw[0] || {}));\n\n        // \u2500\u2500 HPD violations\n        const hpd = Array.isArray(hpdRaw) ? hpdRaw.map(v => ({\n          id:          v.violationid || v.violation_id || '',\n          desc:        v.novdescription || v.novsummarydescription || v.description || '',\n          apt:         v.apartment || '',\n          date:        v.novissueddate || v.approveddate || v.inspectiondate || '',\n          status:      (v.currentstatus || v.violationstatus || v.status || '').toLowerCase(),\n          cls:         (v.class || v.novtype || v.violationclass || '').toUpperCase().trim().charAt(0),\n        })) : [];\n\n        const openHpd  = hpd.filter(v => !v.status.includes('close') && !v.status.includes('dismiss')).sort((a,b) => new Date(b.date||0) - new Date(a.date||0));\n        const closedHpd = hpd.filter(v => v.status.includes('close') || v.status.includes('dismiss')).sort((a,b) => new Date(b.date||0) - new Date(a.date||0));\n        const classC   = openHpd.filter(v => v.cls === 'C');\n        const classB   = openHpd.filter(v => v.cls === 'B');\n        const classA   = openHpd.filter(v => v.cls === 'A');\n\n        // \u2500\u2500 DOB violations (civil penalties, BIS \u2014 3h2n-5cm9)\n        // Mirrors normalizeDOB() in route.ts exactly:\n        // open  = default; disposition_date alone does NOT close\n        // closed = only if disposition_date contains \"dismiss\"\n        const dobViol = Array.isArray(ecbRaw) ? ecbRaw.map(v => {\n          if (ecbRaw.indexOf(v) === 0) console.log('DOB Viol sample:', JSON.stringify(v));\n          const dispDate = (v.disposition_date || '').toLowerCase();\n          const cat      = (v.violation_category || '').trim();\n          const balance  = v.balance_due != null ? parseFloat(v.balance_due) : null;\n          // closed if: violation_category is \"V*\", OR disposition_date contains \"dismiss\"\n          // negative balance = refund owed = keep open (matches route.ts)\n          let isOpen = true;\n          if (cat.includes('V*')) {\n            isOpen = false;\n          } else if (dispDate.includes('dismiss')) {\n            isOpen = false;\n          } else if (balance != null && balance < 0) {\n            isOpen = true; // refund owed, keep open\n          }\n          return {\n            id:      v.number || v.isndobbisviol || '',\n            desc:    v.description || v.violation_type || '',\n            date:    v.issue_date || v.date_entered || '',\n            isOpen,\n            penalty: balance,\n            apt:     '',\n          };\n        }) : [];\n        const openDob   = dobViol.filter(v => v.isOpen).sort((a,b)  => new Date(b.date||0) - new Date(a.date||0));\n        const closedDob = dobViol.filter(v => !v.isOpen).sort((a,b) => new Date(b.date||0) - new Date(a.date||0));\n\n        // \u2500\u2500 ECB violations (OATH-adjudicated summonses \u2014 6bgk-3dad)\n        // Mirrors normalizeECB() in route.ts exactly:\n        // closed = certStatus !== \"NO COMPLIANCE RECORDED\" AND balance_due === 0\n        // open   = cert not accepted, OR balance_due > 0, OR balance_due < 0 (refund)\n        const ecb = Array.isArray(dobViolRaw) ? dobViolRaw.map(v => {\n          if (dobViolRaw.indexOf(v) === 0) console.log('ECB sample:', JSON.stringify(v));\n          const certStatus = (v.certification_status || '').toUpperCase().trim();\n          const ecbBalance = parseFloat(v.balance_due ?? 'NaN');\n          const isOpen = !(certStatus !== 'NO COMPLIANCE RECORDED' && !isNaN(ecbBalance) && ecbBalance === 0);\n          const ecbNum = v.ecb_violation_number || v.isn_dob_bis_extract || '';\n          return {\n            id:      ecbNum,\n            link:    ecbNum ? `https://a810-bisweb.nyc.gov/bisweb/ECBQueryByNumberServlet?ecbin=${ecbNum}&go7=+GO+&requestid=0` : '',\n            desc:    v.section_law_description1 || v.violation_description || v.violation_type || '',\n            date:    v.issue_date || v.served_date || '',\n            isOpen,\n            penalty: isNaN(ecbBalance) ? null : ecbBalance,\n            apt:     '',\n          };\n        }) : [];\n        const openEcb   = ecb.filter(v => v.isOpen).sort((a,b)  => new Date(b.date||0) - new Date(a.date||0));\n        const closedEcb = ecb.filter(v => !v.isOpen).sort((a,b) => new Date(b.date||0) - new Date(a.date||0));\n\n        // \u2500\u2500 Elevators\n        console.log('ELEV RAW:', JSON.stringify(elevRaw));\n        if (Array.isArray(elevRaw) && elevRaw.length > 0) console.log('ELEV KEYS:', Object.keys(elevRaw[0]), JSON.stringify(elevRaw[0]));\n        const elevators = Array.isArray(elevRaw) ? elevRaw.filter((d, i, arr) => {\n          const id = (d.device_number || d.devicenumber || '').toString().trim();\n          if (!id) return true;\n          return arr.findIndex(x => (x.device_number || x.devicenumber || '').toString().trim() === id) === i;\n        }) : [];\n        const activeElev = elevators.filter(d => {\n          const s = (d.device_status||d.status||'').toUpperCase();\n          return s === 'ACTIVE' || s.includes('ACTIVE');\n        });\n        const inactElev  = elevators.filter(d => {\n          const s = (d.device_status||'').toUpperCase();\n          return s !== 'ACTIVE' && !s.includes('REMOV') && !s.includes('WITHDR') && !s.includes('WORK IN PROGRESS') && !s.includes('WORK_IN_PROGRESS');\n        });\n\n        // \u2500\u2500 Boilers\n        const boilers = Array.isArray(boilerRaw) ? boilerRaw : [];\n        const activeBoilers   = boilers.filter(d => (d.report_status||'').toLowerCase() === 'accepted');\n        const inactiveBoilers = boilers.filter(d => (d.report_status||'').toLowerCase() !== 'accepted');\n\n        // \u2500\u2500 Certificate of Occupancy (pkdm-hqz6 = DOB NOW, post-2021; bs8b-p36w = legacy)\n        // Fields: bin, c_of_o_status, c_of_o_filing_type, c_of_o_issuance_date, application_number\n        let coRaw = [];\n        try {\n          const coR1 = await fetch(`https://data.cityofnewyork.us/resource/pkdm-hqz6.json?bin=${bin}&$limit=50`, {headers: NYC_HEADERS});\n          const coD1 = await coR1.json();\n          if (Array.isArray(coD1) && coD1.length > 0) {\n            coRaw = coD1;\n          } else {\n            const coR2 = await fetch(`https://data.cityofnewyork.us/resource/bs8b-p36w.json?bin__=${bin}&$limit=50`, {headers: NYC_HEADERS});\n            const coD2 = await coR2.json();\n            if (Array.isArray(coD2) && coD2.length > 0) {\n              coRaw = coD2;\n            } else if (bblNum) {\n              console.log('CO: BIN miss, trying BBL', bblNum);\n              const coR3 = await fetch(`https://data.cityofnewyork.us/resource/pkdm-hqz6.json?$where=bbl='${bblNum}'&$limit=50`, {headers: NYC_HEADERS});\n              const coD3 = await coR3.json();\n              if (Array.isArray(coD3) && coD3.length > 0) {\n                coRaw = coD3;\n              } else {\n                const coR4 = await fetch(`https://data.cityofnewyork.us/resource/bs8b-p36w.json?$where=bbl='${bblNum}'&$limit=50`, {headers: NYC_HEADERS});\n                const coD4 = await coR4.json();\n                coRaw = Array.isArray(coD4) ? coD4 : [];\n              }\n            }\n          }\n        } catch(e) { coRaw = []; }\n        console.log('CO RAW:', coRaw.length, coRaw.length > 0 ? JSON.stringify(coRaw[0]).slice(0,300) : 'empty');\n\n        renderResults(bin, bldg, hpdBldg, hpdRegRaw, openHpd, closedHpd, classC, classB, classA, openEcb, closedEcb, openDob, closedDob, activeElev, inactElev, activeBoilers, inactiveBoilers, [], coRaw, oathRaw, sanitationRaw, dohmhRaw, nypdRaw);\n\n      } catch(e) {\n        console.error('FETCH ERROR:', e);\n        // Try to identify which fetch failed\n        const errMsg = e?.message || String(e);\n        showError('Unable to fetch building data. Check your connection and try again. (Error: ' + errMsg + ')');\n      }\n\n      setLoading(false);\n    }\n\n    function fmt(dateStr) {\n      if (!dateStr) return '\u2014';\n      try {\n        // Handle YYYYMMDD with no separators\n        if (/^\\d{8}$/.test(dateStr)) {\n          dateStr = `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;\n        }\n        const d = new Date(dateStr);\n        if (isNaN(d.getTime())) return dateStr.slice(0,10);\n        return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });\n      } catch(e) { return dateStr.slice(0,10); }\n    }\n\n    function violRow(v, bin, sourceLabel, sourceCss) {\n      const cls    = v.cls || '?';\n      const clsCss = cls === 'C' ? 'C' : cls === 'B' ? 'B' : 'A';\n      const badge  = sourceLabel\n        ? `<span class=\"bin-viol-class\" style=\"${sourceCss}\">${sourceLabel}</span>`\n        : `<span class=\"bin-viol-class ${clsCss}\">${cls}</span>`;\n      const desc = (v.desc || 'No description').slice(0, 160) + ((v.desc||'').length > 160 ? '\u2026' : '');\n      const idHtml = v.id\n        ? v.link\n          ? `<div class=\"bin-viol-apt\"><a href=\"${v.link}\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"font-family:monospace;color:var(--gray-400);text-decoration:underline;\">#${v.id}</a></div>`\n          : `<div class=\"bin-viol-apt\" style=\"font-family:monospace;color:var(--gray-400);\">#${v.id}</div>`\n        : '';\n      const penaltyHtml = v.penalty && Number(v.penalty) !== 0\n        ? `<div class=\"bin-viol-apt\" style=\"color:#b45309;font-weight:600;\">Penalty: $${Number(v.penalty).toLocaleString()}</div>`\n        : '';\n      return `<div class=\"bin-viol-row\">\n        ${badge}\n        <div>\n          ${idHtml}\n          <div class=\"bin-viol-desc\">${desc}</div>\n          ${penaltyHtml}\n        </div>\n        <div class=\"bin-viol-meta\">${fmt(v.date)}</div>\n      </div>`;\n    }\n\n    function deviceRow(d, isElev) {\n      const id     = isElev ? (d.device_number || d.devicenumber || '\u2014') : (d.boiler_id || d.boilerid || '\u2014');\n      const status = isElev ? (d.device_status || '') : (d.report_status || '');\n      const isActive = isElev ? status.toUpperCase() === 'ACTIVE' : status.toLowerCase() === 'accepted';\n      const label = isActive ? (isElev ? 'Active' : 'Accepted') : (status || 'Unknown');\n      return `<div class=\"bin-device-row\">\n        <span class=\"bin-device-id\">${id}</span>\n        <span class=\"bin-device-status ${isActive ? 'active' : 'inactive'}\">${label}</span>\n      </div>`;\n    }\n\n    function expandSection({ iconCss, iconSvg, title, subtitle, badgeText, badgeCss, bodyHtml, startOpen, extraAction }) {\n      const id = 'exp-' + Math.random().toString(36).slice(2);\n      return `<div class=\"bin-expand${startOpen ? ' open' : ''}\" id=\"${id}\">\n        <div class=\"bin-expand-header\" onclick=\"document.getElementById('${id}').classList.toggle('open')\">\n          <div class=\"bin-expand-left\">\n            <div class=\"bin-expand-icon ${iconCss}\">${iconSvg}</div>\n            <div>\n              <div class=\"bin-expand-title\">${title}</div>\n              ${subtitle ? `<div class=\"bin-expand-subtitle\">${subtitle}</div>` : ''}\n            </div>\n          </div>\n          <div style=\"display:flex;align-items:center;gap:.75rem;\">\n            ${extraAction || ''}\n            <span class=\"bin-expand-badge ${badgeCss}\">${badgeText}</span>\n            <svg class=\"bin-expand-chevron\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\"><polyline points=\"6 9 12 15 18 9\"/></svg>\n          </div>\n        </div>\n        <div class=\"bin-expand-body\">${bodyHtml}</div>\n      </div>`;\n    }\n\n    function renderResults(bin, bldg, hpdBldgRaw, hpdRegRaw, openHpd, closedHpd, classC, classB, classA, openEcb, closedEcb, openDob, closedDob, activeElev, inactElev, activeBoilers, inactiveBoilers, elevInsp, coRaw, oathRaw, sanitationRaw, dohmhRaw, nypdRaw) {\n      const cutoff = new Date('2025-01-01');\n      function isCurrentYear(dateStr) {\n        if (!dateStr) return false;\n        return new Date(dateStr) >= cutoff;\n      }\n\n      // kj4p-ruqc = HPD buildings subject to jurisdiction (stories, units, yearbuilt, communityboard)\n      const hb  = Array.isArray(hpdBldgRaw) && hpdBldgRaw.length > 0 ? hpdBldgRaw[0] : {};\n      // tesw-yqqr = Multiple Dwelling Registrations (mdr id, rent stab)\n      const reg = Array.isArray(hpdRegRaw)  && hpdRegRaw.length  > 0 ? hpdRegRaw[0]  : {};\n\n      const address = [\n        ((bldg.house_no||bldg.houseno||'') + ' ' + (bldg.street_name||bldg.stname||'')).trim(),\n        bldg.borough || bldg.boro_nm || bldg.boroname || '',\n        'NY'\n      ].filter(Boolean).join(', ') || 'Address unavailable';\n\n      // kj4p-ruqc confirmed fields: legalstories, legalclassa (Class A units), buildingid, communityboard\n      const floors  = hb.legalstories  || hb.stories || bldg.floors || bldg.num_floors || '\u2014';\n      const units   = hb.legalclassa   || hb.legalresidentialunits || bldg.units_res || bldg.unitsres || '\u2014';\n      const yearBuilt = hb.yearbuilt   || hb.year_built || bldg.yr_built || bldg.yearbuilt || '\u2014';\n      const communityBoard = hb.communityboard || reg.communityboard || bldg.community_board || '\u2014';\n\n      // \u2500\u2500 LL152 Gas Piping Inspection subcycle & next deadline\n      // subcycles based on Community District number:\n      // A: 1,3,10        \u2192 Cycle 2: 1/1/2024\u201312/31/2024, Cycle 3: 1/1/2028\u201312/31/2028\n      // B: 2,5,7,13,18   \u2192 Cycle 2: 1/1/2025\u201312/31/2025, Cycle 3: 1/1/2029\u201312/31/2029\n      // C: 4,6,8,9,16    \u2192 Cycle 2: 1/1/2026\u201312/31/2026, Cycle 3: 1/1/2030\u201312/31/2030\n      // D: 11,12,14,15,17\u2192 Cycle 2: 1/1/2027\u201312/31/2027, Cycle 3: 1/1/2031\u201312/31/2031\n      // Filing deadline is Jan 31 of the year AFTER the cycle window ends\n      const ll152subcycleMap = {\n        A: { districts: [1,3,10],       cycles: [{start:2024,end:2024},{start:2028,end:2028},{start:2032,end:2032}] },\n        B: { districts: [2,5,7,13,18],  cycles: [{start:2025,end:2025},{start:2029,end:2029},{start:2033,end:2033}] },\n        C: { districts: [4,6,8,9,16],   cycles: [{start:2026,end:2026},{start:2030,end:2030},{start:2034,end:2034}] },\n        D: { districts: [11,12,14,15,17],cycles: [{start:2027,end:2027},{start:2031,end:2031},{start:2035,end:2035}] },\n      };\n      let ll152Tag = '';\n      const cdNum = parseInt(communityBoard);\n      if (!isNaN(cdNum)) {\n        let subcycle = null, subcycleData = null;\n        for (const [sc, data] of Object.entries(ll152subcycleMap)) {\n          if (data.districts.includes(cdNum)) { subcycle = sc; subcycleData = data; break; }\n        }\n        if (subcycle && subcycleData) {\n          const now = new Date();\n          const nowYear = now.getFullYear();\n          const nowMonth = now.getMonth() + 1; // 1-based\n          // Find next upcoming cycle: deadline is Jan 31 of year after cycle end\n          let nextCycle = null;\n          for (const c of subcycleData.cycles) {\n            const deadlineYear = c.end + 1;\n            const deadlinePassed = nowYear > deadlineYear || (nowYear === deadlineYear && nowMonth > 1);\n            if (!deadlinePassed) { nextCycle = c; break; }\n          }\n          if (nextCycle) {\n            const deadlineYear = nextCycle.end + 1;\n            const isCurrentlyInWindow = nowYear >= nextCycle.start && nowYear <= nextCycle.end;\n            const statusNote = isCurrentlyInWindow ? 'due now' : `due 1/31/${deadlineYear}`;\n            ll152Tag = `<span class=\"ll-pill\" title=\"subcycle ${subcycle}: inspection window ${nextCycle.start}\u2013${nextCycle.end}, filing deadline 1/31/${deadlineYear}\">LL152 subcycle ${subcycle} \u00b7 ${statusNote}</span>`;\n          }\n        }\n      }\n      const hpdBuildingId  = hb.buildingid || reg.buildingid || '\u2014';\n      const dobbldgclass   = hb.dobbuildingclass || '\u2014';\n\n      // BBL from kj4p-ruqc or MDR\n      const boroNames = {1:'Manhattan',2:'Bronx',3:'Brooklyn',4:'Queens',5:'Staten Island'};\n      const boroId    = hb.boroid || reg.boroid || '';\n      const block     = hb.block  || reg.block  || '';\n      const lot       = hb.lot    || reg.lot    || '';\n      const boroName  = boroNames[parseInt(boroId)] || boroId;\n      const bbl = (boroName && block && lot)\n        ? `${boroName}-${String(block).padStart(5,'0')}-${String(lot).padStart(4,'0')}`\n        : '\u2014';\n\n      const rsUnits  = parseInt(hb.liftedstabilizedunits || hb.stabilizedunitscount || reg.liftedstabilizedunits || '0');\n      const rentStab = rsUnits > 0 ? 'Yes' : (Object.keys(hb).length > 0 || Object.keys(reg).length > 0 ? 'No' : '\u2014');\n\n      // \u2500\u2500 GSF estimate & Local Law flags\n      const unitCount = parseInt(units);\n      const gsfLow  = !isNaN(unitCount) ? unitCount * 900  : null;\n      const gsfHigh = !isNaN(unitCount) ? unitCount * 1200 : null;\n      const ll84pill = gsfLow && gsfLow >= 25000 ? `<span class=\"ll-pill\">LL84 &amp; LL97 may apply</span>` : '';\n      const ll87pill = gsfLow && gsfLow >= 50000 ? `<span class=\"ll-pill\">LL87 may apply</span>` : '';\n      const llUnitNote = (ll84pill || ll87pill)\n        ? `${ll84pill}${ll87pill}`\n        : '';\n\n      // \u2500\u2500 Single merged table (no separate address banner)\n\n      function row(label, value, extra) {\n        return `<tr class=\"bin-detail-row\">\n          <td class=\"bin-detail-label\">${label}</td>\n          <td class=\"bin-detail-value\">${value}${extra ? ' ' + extra : ''}</td>\n        </tr>`;\n      }\n\n      const rentStabNote = rentStab === 'Yes'\n        ? `<span class=\"bin-detail-tag amber\">DHCR Annual Rent Reporting &amp; lease rider applies</span>` : '';\n\n      const floorCount = parseInt(floors);\n      // \u2500\u2500 LL11 Facade Inspection subcycle & next deadline\n      // Based on last digit of the block number:\n      // subcycle A (last digit 4,5,6,9): opens 2/21/2025, deadline 2/21/2027\n      // subcycle B (last digit 0,7,8):   opens 2/21/2026, deadline 2/21/2028\n      // subcycle C (last digit 1,2,3):   opens 2/21/2027, deadline 2/21/2029\n      // Pattern repeats every 3 years after each deadline\n      const ll11subcycleMap = {\n        A: { digits: [4,5,6,9], firstDeadline: new Date('2027-02-21'), firstOpen: new Date('2025-02-21') },\n        B: { digits: [0,7,8],   firstDeadline: new Date('2028-02-21'), firstOpen: new Date('2026-02-21') },\n        C: { digits: [1,2,3],   firstDeadline: new Date('2029-02-21'), firstOpen: new Date('2027-02-21') },\n      };\n      let ll11tag = '';\n      const blockNum = parseInt(block);\n      if (!isNaN(floorCount) && floorCount > 6 && !isNaN(blockNum)) {\n        const lastDigit = blockNum % 10;\n        let ll11sc = null, ll11data = null;\n        for (const [sc, data] of Object.entries(ll11subcycleMap)) {\n          if (data.digits.includes(lastDigit)) { ll11sc = sc; ll11data = data; break; }\n        }\n        if (ll11sc && ll11data) {\n          const now = new Date();\n          // Find next upcoming deadline (cycles every 3 years)\n          let deadline = new Date(ll11data.firstDeadline);\n          let openDate = new Date(ll11data.firstOpen);\n          while (deadline < now) {\n            deadline.setFullYear(deadline.getFullYear() + 3);\n            openDate.setFullYear(openDate.getFullYear() + 3);\n          }\n          const fmtDate = d => `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;\n          const isOpen = now >= openDate && now <= deadline;\n          const statusNote = isOpen ? `due ${fmtDate(deadline)} \u2014 window open` : `due ${fmtDate(deadline)}`;\n          ll11tag = `<span class=\"ll-pill\" title=\"LL11 subcycle ${ll11sc}: filing opens ${fmtDate(openDate)}, deadline ${fmtDate(deadline)}\">LL11 subcycle ${ll11sc} \u00b7 ${statusNote}</span>`;\n        }\n      } else if (!isNaN(floorCount) && floorCount > 6) {\n        ll11tag = `<span class=\"ll-pill\">LL11 applies</span>`;\n      }\n\n      cardsEl.innerHTML = `\n        <table class=\"bin-detail-table\">\n          <thead>\n            <tr>\n              <td colspan=\"2\" style=\"padding:1.25rem 1.5rem 0.75rem;border-bottom:1px solid #f3f4f6;\">\n                <div style=\"font-family:var(--serif);font-size:1.3rem;font-weight:500;color:var(--navy);letter-spacing:-0.01em\">${address}</div>\n              </td>\n            </tr>\n          </thead>\n          <tbody>\n\n            ${bbl !== '\u2014' ? row('BBL', bbl, ll11tag) : ''}\n            ${floors !== '\u2014' ? row('Stories', floors) : ''}\n            ${units !== '\u2014' ? row('Units', units, llUnitNote) : ''}\n            ${yearBuilt !== '\u2014' ? row('Year Built', yearBuilt) : ''}\n            ${communityBoard !== '\u2014' ? row('Community District', communityBoard, ll152Tag || '<span class=\"ll-pill\">LL152 &amp; LL11</span>') : ''}\n\n          </tbody>\n        </table>`;\n\n      // Build elevator inspection lookup by device number\n      function getDevNum(r) {\n        return (r.device_number || r.devicenumber || r.device_num || r.devicenum ||\n                r.elev_device_number || r.elevdevicenumber || r.deviceno || r.device_no || '').toString().trim();\n      }\n      const inspByDevice = {};\n      elevInsp.forEach(r => {\n        const devNum = getDevNum(r);\n        if (!devNum) return;\n        if (!inspByDevice[devNum]) inspByDevice[devNum] = [];\n        inspByDevice[devNum].push(r);\n      });\n      if (elevInsp.length > 0) console.log('Elev insp keys:', Object.keys(elevInsp[0]));\n\n      // \u2500\u2500 Expandable sections\n      const hpdIconSvg = `<svg width=\"18\" height=\"18\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z\"/></svg>`;\n      const dobIconSvg = `<svg width=\"18\" height=\"18\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z\"/></svg>`;\n      const elevIconSvg = `<svg width=\"18\" height=\"18\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"1.8\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M8 12l4-4 4 4M8 16l4-4 4 4\"/></svg>`;\n      const boilerIconSvg = `<svg width=\"18\" height=\"18\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg>`;\n\n      // HPD Violations \u2014 badge and icon\n      const hpdBadgeCss  = classC.length > 0 ? 'red' : classB.length > 0 ? 'amber' : openHpd.length === 0 ? 'green' : 'amber';\n      const hpdBadgeTxt  = openHpd.length === 0 ? 'Clean' : `${openHpd.length} open`;\n      const hpdIconCss   = classC.length > 0 ? 'red' : classB.length > 0 ? 'amber' : 'green';\n      const hpdSubtitle  = hpdBuildingId !== '\u2014'\n        ? `<a href=\"https://hpdonline.nyc.gov/hpdonline/building/${hpdBuildingId}/overview\" target=\"_blank\" rel=\"noopener\" class=\"bin-detail-link\" style=\"font-size:.74rem;font-weight:500;\" onclick=\"event.stopPropagation()\">HPD Online \u2197</a>`\n        : '';\n      const hpdBody = openHpd.length > 0\n        ? openHpd.slice(0, 20).map(v => violRow(v, bin, null, null)).join('') + (openHpd.length > 20 ? `<div style=\"font-size:.78rem;color:var(--gray-400);padding:.75rem 0 0\">${openHpd.length - 20} more violations not shown</div>` : '')\n        : `<div class=\"bin-empty\">No open HPD violations on record.</div>`;\n\n      // HPD Violations \u2014 closed\n      const closedHpdBody = closedHpd.length > 0\n        ? closedHpd.slice(0, 10).map(v => violRow(v, bin, null, null)).join('') + (closedHpd.length > 10 ? `<div style=\"font-size:.78rem;color:var(--gray-400);padding:.75rem 0 0\">${closedHpd.length - 10} more not shown</div>` : '')\n        : `<div class=\"bin-empty\">No closed HPD violations.</div>`;\n\n      // ECB Violations (Environmental Control Board \u2014 penalty notices)\n      const ecbBadgeCss = openEcb.length > 0 ? 'red' : 'green';\n      const ecbBadgeTxt = openEcb.length === 0 ? 'Clean' : `${openEcb.length} open`;\n      const ecbBody = openEcb.length > 0\n        ? openEcb.slice(0, 15).map(v => violRow(\n            { ...v, desc: v.desc || 'No description' },\n            bin,\n            'ECB',\n            'background:#fef3c7;color:#b45309;'\n          )).join('')\n        : `<div class=\"bin-empty\">No open ECB violations on record.</div>`;\n\n      // DOB Violations (Buildings \u2014 inspection-based)\n      const dobViolBadgeCss = openDob.length > 0 ? 'red' : 'green';\n      const dobViolBadgeTxt = openDob.length === 0 ? 'Clean' : `${openDob.length} open`;\n      const dobViolBody = openDob.length > 0\n        ? openDob.slice(0, 15).map(v => violRow(\n            {...v, desc: v.desc || 'No description'},\n            bin,\n            'DOB',\n            'background:#eff6ff;color:#1d4ed8;'\n          )).join('')\n        : `<div class=\"bin-empty\">No open DOB violations on record.</div>`;\n\n      // Elevators with CAT/PVT inspection dates\n      const allElev = [...activeElev, ...inactElev];\n      const elevBadgeCss = allElev.length === 0 ? 'gray' : 'blue';\n      const elevBadgeTxt = allElev.length === 0 ? 'None on record' : `${allElev.length} device${allElev.length !== 1 ? 's' : ''}`;\n      const overdueCount = allElev.reduce((count, d) => {\n        const catRaw = d.cat1_latest_report_filed || d.cat1_latest_report_filed_date || '';\n        const pvtRaw = d.periodic_latest_inspection || d.periodic_latest_inspection_date || '';\n        if (catRaw && !isCurrentYear(catRaw)) count++;\n        if (pvtRaw && !isCurrentYear(pvtRaw)) count++;\n        return count;\n      }, 0);\n      const elevSubtitle = overdueCount > 0 ? `<span style=\"color:#c4533a;font-size:0.72rem;font-weight:600;\">\u26a0 ${overdueCount} inspection${overdueCount !== 1 ? 's' : ''} overdue</span>` : '';\n      const elevHeader = allElev.length > 0 ? `\n        <div style=\"display:flex;align-items:center;padding:0.4rem 0.75rem 0.4rem 0;margin-bottom:0.25rem;\">\n          <span style=\"font-size:0.68rem;font-weight:600;color:var(--gray-400);text-transform:uppercase;letter-spacing:0.06em;margin-left:auto\">Latest Inspection Date</span>\n        </div>` : '';\n      const elevBody = allElev.length > 0\n        ? elevHeader + allElev.map(d => {\n            const id      = getDevNum(d) || '\u2014';\n            const status  = d.device_status || '';\n            const isActive = status.toUpperCase() === 'ACTIVE';\n            const label   = isActive ? 'Active' : (status || 'Unknown');\n            const catRaw  = d.cat1_latest_report_filed || d.cat1_latest_report_filed_date || '';\n            const pvtRaw  = d.periodic_latest_inspection || d.periodic_latest_inspection_date || '';\n            const catDate = fmt(catRaw);\n            const pvtDate = fmt(pvtRaw);\n            const catOk   = !catRaw || isCurrentYear(catRaw);\n            const pvtOk   = !pvtRaw || isCurrentYear(pvtRaw);\n            const catOverdue = !catOk;\n            const pvtOverdue = !pvtOk;\n            const dateSpan = (label, date, overdue) => `<span style=\"display:flex;flex-direction:column;align-items:flex-end;gap:1px;\">\n                <span style=\"color:${overdue ? '#c4533a' : 'var(--gray-400)'}\">${label}: ${date}</span>\n                ${overdue ? '<span style=\"font-size:0.62rem;font-weight:600;color:#c4533a;letter-spacing:0.03em;\">overdue</span>' : ''}\n              </span>`;\n            return `<div class=\"bin-device-row\">\n              <span class=\"bin-device-id\">${id}</span>\n              <span class=\"bin-device-status ${isActive ? 'active' : 'inactive'}\">${label}</span>\n              <span style=\"font-size:.74rem;margin-left:auto;display:flex;gap:0.75rem;align-items:flex-start;\">\n                ${dateSpan('CAT1', catDate, catOverdue)}\n                ${dateSpan('PVT', pvtDate, pvtOverdue)}\n              </span>\n            </div>`;\n          }).join('')\n        : `<div class=\"bin-empty\">No elevator devices on record for this BIN.</div>`;\n\n      // Elevator alt-BIN warning\n      const elevAltBinWarning = (allElev.length === 0 && floorCount > 6)\n        ? `<div style=\"margin:0.5rem 0 0;padding:0.55rem 0.75rem;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;font-size:0.75rem;color:#92400e;display:flex;align-items:flex-start;gap:0.5rem;\">\n            <span style=\"font-size:1rem;line-height:1.2;\">\u26a0\ufe0f</span>\n            <span>No elevator records found for this BIN. This building is ${floorCount} stories \u2014 devices may be registered under an alternate or parent BIN. Try searching the related BBL or contact DOB directly.</span>\n           </div>`\n        : '';\n      const elevBodyWithWarning = elevAltBinWarning\n        ? (elevBody.includes('bin-empty') ? `<div class=\"bin-empty\">No elevator devices on record for this BIN.</div>${elevAltBinWarning}` : elevBody + elevAltBinWarning)\n        : elevBody;\n\n      // Boilers\n      const allBoilers = [...activeBoilers, ...inactiveBoilers];\n      const boilerBadgeCss = allBoilers.length === 0 ? 'gray' : 'blue';\n      const boilerBadgeTxt = allBoilers.length === 0 ? 'None on record' : `${allBoilers.length} device${allBoilers.length !== 1 ? 's' : ''}`;\n      const boilerBody = allBoilers.length > 0\n        ? allBoilers.map(d => deviceRow(d, false)).join('')\n        : `<div class=\"bin-empty\">No boiler records for this BIN.</div>`;\n\n      // Certificate of Occupancy\n      const coIconSvg = `<svg width=\"18\" height=\"18\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"1.8\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z\"/></svg>`;\n      const coList = Array.isArray(coRaw) ? coRaw : [];\n\n      // Sort by date desc, take only the latest\n      const coByDate = [...coList].sort((a, b) =>\n        new Date(b.c_of_o_issuance_date || b.co_issue_date || b.issue_date || 0) - new Date(a.c_of_o_issuance_date || a.co_issue_date || a.issue_date || 0)\n      );\n      const latestCo = coByDate.length > 0 ? coByDate[0] : null;\n\n      let coBadgeTxt, coBadgeCss, coBody, isFinalCo = false, tcoExpiry = '';\n      if (!latestCo) {\n        coBadgeTxt = 'None on record'; coBadgeCss = 'gray';\n        coBody = `<div class=\"bin-empty\">No CO found in DOB NOW or legacy records. Older buildings may not have digital CO records \u2014 search <a href=\"https://a810-bisweb.nyc.gov/bisweb/COsByLocationServlet?allbin=${bin}\" target=\"_blank\" rel=\"noopener\" style=\"color:var(--navy);font-weight:500;text-decoration:underline;\">BIS directly \u2197</a> for this BIN.</div>`;\n      } else {\n        const coType     = (latestCo.c_of_o_filing_type || latestCo.certtype || latestCo.co_type || latestCo.certificate_type || latestCo.filing_type || '').trim();\n        const coStatus   = (latestCo.c_of_o_status || latestCo.co_status || '').trim();\n        isFinalCo  = coType.toLowerCase().includes('final');\n        const issuedRaw  = latestCo.c_of_o_issuance_date || latestCo.co_issue_date || latestCo.issue_date || latestCo.date_of_filing || '';\n        const issuedDate = fmt(issuedRaw);\n        const jobNum     = latestCo.application_number || latestCo.job_number || latestCo.job__ || '';\n\n        // Compute TCO expiry: issued date + 3 months\n        tcoExpiry = '';\n        if (!isFinalCo && issuedRaw) {\n          const d = new Date(issuedRaw);\n          if (!isNaN(d)) {\n            d.setMonth(d.getMonth() + 3);\n            tcoExpiry = fmt(d.toISOString());\n          }\n        }\n\n        const isExpired = !isFinalCo && tcoExpiry && new Date() > new Date(issuedRaw ? (() => { const d = new Date(issuedRaw); d.setMonth(d.getMonth()+3); return d; })() : 0);\n\n        if (isFinalCo) {\n          coBadgeTxt = 'Final CO'; coBadgeCss = 'green';\n        } else {\n          coBadgeTxt = isExpired ? 'TCO Expired' : 'Temp CO';\n          coBadgeCss = isExpired ? 'red' : 'amber';\n        }\n\n        const badgeHtml = isFinalCo\n          ? `<span style=\"display:inline-block;padding:1px 8px;border-radius:50px;font-size:0.68rem;font-weight:600;background:#dcfce7;color:#166534;\">Final CO</span>`\n          : isExpired\n          ? `<span style=\"display:inline-block;padding:1px 8px;border-radius:50px;font-size:0.68rem;font-weight:600;background:#fef2f2;color:#c4533a;\">TCO Expired</span>`\n          : `<span style=\"display:inline-block;padding:1px 8px;border-radius:50px;font-size:0.68rem;font-weight:600;background:#fef3c7;color:#92400e;\">Temporary CO</span>`;\n\n        coBody = `<div class=\"bin-device-row\" style=\"align-items:flex-start;flex-direction:column;gap:0.3rem;\">\n          <div style=\"display:flex;align-items:center;gap:0.5rem;width:100%;\">\n            ${badgeHtml}\n            <span style=\"font-size:0.74rem;color:var(--gray-500);margin-left:auto;\">Issued: ${issuedDate || '\u2014'}</span>\n          </div>\n          ${!isFinalCo ? `<div style=\"font-size:0.72rem;color:${isExpired ? '#c4533a' : '#92400e'};font-weight:600;\">${isExpired ? '\u26a0 TCO expired' : '\u26a0 TCO expires'}: ${tcoExpiry || '\u2014'}</div>` : ''}\n          ${coType ? `<div style=\"font-size:0.71rem;color:var(--gray-400);\">Type: ${coType}</div>` : ''}\n          ${jobNum ? `<div style=\"font-size:0.71rem;color:var(--gray-400);\">App #${jobNum}</div>` : ''}\n        </div>`;\n      }\n\n      // \u2500\u2500 OATH / ECB Hearings\n      // violation_type mapping: disposition \"DISMISSED\"/\"PAID IN FULL\" \u2192 closed; else open\n      const oathIconSvg = `<svg width=\"18\" height=\"18\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3\"/></svg>`;\n      const oathList = Array.isArray(oathRaw) ? oathRaw : [];\n      const openOath = oathList.filter(v => {\n        const disp = (v.disposition || v.violation_status || v.hearing_result || v.status || '').toUpperCase();\n        // closed = explicitly dismissed or fully paid; everything else (pending, default, etc.) = open\n        const isOpen = !disp.includes('DISMISS') && disp !== 'PAID IN FULL' && disp !== 'PAID';\n        return isOpen;\n      }).sort((a,b) => new Date(b.issue_date || b.hearing_date || 0) - new Date(a.issue_date || a.hearing_date || 0));\n      const oathBadgeCss = openOath.length > 0 ? 'amber' : 'green';\n      const oathBadgeTxt = oathList.length === 0 ? 'No data' : openOath.length === 0 ? 'Clean' : `${openOath.length} open`;\n      const oathBody = oathList.length === 0\n        ? `<div class=\"bin-empty\">No OATH hearing records for this building.</div>`\n        : openOath.length > 0\n          ? openOath.slice(0, 15).map(v => violRow(\n              { id: v.violation_number || v.id || '', desc: v.violation_description || v.charge_description || v.description || 'Hearing record', date: v.issue_date || v.hearing_date || '', penalty: v.penalty_imposed || null, apt: '' },\n              bin, 'OATH', 'background:#fef3c7;color:#b45309;'\n            )).join('')\n          : `<div class=\"bin-empty\">No open OATH hearings on record.</div>`;\n\n      // \u2500\u2500 Sanitation (DSNY) \u2014 jz4z-kudi filtered by issuing_agency\n      // Mirrors normalizeSanitation: open if balance_due > 0; closed if 0 or null\n      const sanitIconSvg = `<svg width=\"18\" height=\"18\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16\"/></svg>`;\n      const sanitList = Array.isArray(sanitationRaw) ? sanitationRaw : [];\n      const openSanit = sanitList.filter(v => {\n        const bal = v.balance_due != null ? parseFloat(v.balance_due) : null;\n        return bal != null && bal > 0;\n      }).sort((a,b) => new Date(b.violation_date||0) - new Date(a.violation_date||0));\n      const sanitBadgeCss = openSanit.length > 0 ? 'red' : 'green';\n      const sanitBadgeTxt = sanitList.length === 0 ? 'No data' : openSanit.length === 0 ? 'Clean' : `${openSanit.length} open`;\n      const sanitBody = sanitList.length === 0\n        ? `<div class=\"bin-empty\">No Sanitation (DSNY) violations on record for this building.</div>`\n        : openSanit.length > 0\n          ? openSanit.slice(0, 15).map(v => {\n              const bal = parseFloat(v.balance_due ?? 'NaN');\n              return violRow(\n                { id: v.ticket_number || '', desc: v.charge_1_code_description || v.violation_description || 'Sanitation violation', date: v.violation_date || '', penalty: isNaN(bal) ? null : bal, apt: '' },\n                bin, 'DSNY', 'background:#ecfdf5;color:#059669;'\n              );\n            }).join('')\n          : `<div class=\"bin-empty\">No open Sanitation violations on record.</div>`;\n\n      // \u2500\u2500 DOHMH \u2014 jz4z-kudi filtered by issuing_agency DOHMH\n      // Mirrors normalizeDOHMH: open if balance_due > 0; closed if 0 or null\n      const dohmhIconSvg = `<svg width=\"18\" height=\"18\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z\"/></svg>`;\n      const dohmhList = Array.isArray(dohmhRaw) ? dohmhRaw : [];\n      const openDohmh = dohmhList.filter(v => {\n        const bal = v.balance_due != null ? parseFloat(v.balance_due) : null;\n        return bal != null && bal > 0;\n      }).sort((a,b) => new Date(b.violation_date||0) - new Date(a.violation_date||0));\n      const dohmhBadgeCss = openDohmh.length > 0 ? 'red' : dohmhList.length === 0 ? 'gray' : 'green';\n      const dohmhBadgeTxt = dohmhList.length === 0 ? 'No data' : openDohmh.length === 0 ? 'Clean' : `${openDohmh.length} open`;\n      const dohmhBody = dohmhList.length === 0\n        ? `<div class=\"bin-empty\">No DOHMH violation records on record for this building.</div>`\n        : openDohmh.length > 0\n          ? openDohmh.slice(0, 15).map(v => {\n              const bal = parseFloat(v.balance_due ?? 'NaN');\n              return violRow(\n                { id: v.ticket_number || '', desc: v.charge_1_code_description || 'DOHMH violation', date: v.violation_date || '', penalty: isNaN(bal) ? null : bal, apt: '' },\n                bin, 'HLTH', 'background:#fef3c7;color:#b45309;'\n              );\n            }).join('')\n          : `<div class=\"bin-empty\">No open DOHMH violations on record.</div>`;\n\n      // \u2500\u2500 NYPD \u2014 jz4z-kudi filtered by issuing_agency NYPD/POLICE\n      // Mirrors normalizeNYPD: open if balance_due > 0; closed if 0 or null\n      const nypdIconSvg = `<svg width=\"18\" height=\"18\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z\"/></svg>`;\n      const nypdList = Array.isArray(nypdRaw) ? nypdRaw : [];\n      const openNypd = nypdList.filter(v => {\n        const bal = v.balance_due != null ? parseFloat(v.balance_due) : null;\n        return bal != null && bal > 0;\n      }).sort((a,b) => new Date(b.violation_date||0) - new Date(a.violation_date||0));\n      const nypdBadgeCss = openNypd.length > 0 ? 'amber' : nypdList.length === 0 ? 'gray' : 'green';\n      const nypdBadgeTxt = nypdList.length === 0 ? 'No data' : openNypd.length === 0 ? 'Clean' : `${openNypd.length} open`;\n      const nypdBody = nypdList.length === 0\n        ? `<div class=\"bin-empty\">No NYPD violation records on record for this building.</div>`\n        : openNypd.length > 0\n          ? openNypd.slice(0, 15).map(v => {\n              const bal = parseFloat(v.balance_due ?? 'NaN');\n              return violRow(\n                { id: v.ticket_number || '', desc: v.charge_1_code_description || 'NYPD violation', date: v.violation_date || '', penalty: isNaN(bal) ? null : bal, apt: '' },\n                bin, 'NYPD', 'background:#eff6ff;color:#1d4ed8;'\n              );\n            }).join('')\n          : `<div class=\"bin-empty\">No open NYPD violations on record.</div>`;\n\n      // \u2500\u2500 RISK SCORE CALCULATION \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n      // Inputs: open violations across all sources, elevator overdue, TCO status\n      // Score: 0\u2013100 (higher = more risk)\n\n      const totalOpen = openHpd.length + openDob.length + openEcb.length +\n                        openOath.length + openSanit.length + openDohmh.length + openNypd.length;\n\n      // Class C HPD violations are highest severity\n      let riskScore = 0;\n\n      // Violation volume: each open violation adds weight, capped at 50 pts\n      // Class C = 4pts, Class B = 2pts, all others = 1pt\n      let violPts = 0;\n      classC.forEach(() => violPts += 4);\n      classB.forEach(() => violPts += 2);\n      classA.forEach(() => violPts += 0.5);\n      openDob.forEach(() => violPts += 2);\n      openEcb.forEach(() => violPts += 2);\n      openOath.forEach(() => violPts += 1);\n      openSanit.forEach(() => violPts += 1);\n      openDohmh.forEach(() => violPts += 1);\n      openNypd.forEach(() => violPts += 0.5);\n      violPts = Math.min(violPts, 50);\n      riskScore += violPts;\n\n      // Elevator overdue inspections: 5pts each, capped at 20\n      const elevOverduePts = Math.min(overdueCount * 5, 20);\n      riskScore += elevOverduePts;\n\n      // TCO status: expired=25pts, temporary=10pts\n      if (coBadgeCss === 'red') riskScore += 25;       // TCO expired\n      else if (coBadgeCss === 'amber') riskScore += 10; // Temporary CO\n\n      // Baseline: even clean buildings start at 5 to avoid 0\n      riskScore = Math.max(riskScore, 5);\n      riskScore = Math.min(Math.round(riskScore), 100);\n\n      // Percentile: rough mapping based on NYC building distribution\n      // Higher score = higher percentile of risk vs city\n      function scoreToPercentile(s) {\n        if (s <= 5) return 8;\n        if (s <= 10) return 20;\n        if (s <= 20) return 35;\n        if (s <= 30) return 48;\n        if (s <= 40) return 60;\n        if (s <= 50) return 70;\n        if (s <= 60) return 78;\n        if (s <= 70) return 85;\n        if (s <= 80) return 91;\n        if (s <= 90) return 96;\n        return 99;\n      }\n      const percentile = scoreToPercentile(riskScore);\n\n      // Elevator issues summary\n      const elevIssues = [];\n      if (overdueCount > 0) elevIssues.push(`${overdueCount} inspection${overdueCount !== 1 ? 's' : ''} overdue`);\n      if (allElev.length === 0 && floorCount > 6) elevIssues.push('no elevator records found');\n      const elevIssueText = elevIssues.length > 0 ? elevIssues.join(', ') : null;\n\n      // TCO summary\n      let tcoText = null;\n      if (coBadgeCss === 'red') tcoText = `TCO expired`;\n      else if (coBadgeCss === 'amber' && !isFinalCo) {\n        tcoText = tcoExpiry ? `TCO expires ${tcoExpiry}` : 'Temporary CO on file';\n      }\n\n      // Score color\n      const scoreColor = riskScore >= 70 ? '#c4533a' : riskScore >= 40 ? '#b45309' : '#15803d';\n      const scoreBg    = riskScore >= 70 ? '#fef2f2' : riskScore >= 40 ? '#fffbeb' : '#f0fdf4';\n      const scoreBorder= riskScore >= 70 ? '#fca5a5' : riskScore >= 40 ? '#fcd34d' : '#86efac';\n\n      // \u2500\u2500 TEASER SNAPSHOT ITEMS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n      function snapshotItem(icon, label, value, valueCss) {\n        return `<div style=\"display:flex;align-items:center;gap:0.75rem;padding:0.75rem 0;border-bottom:1px solid #f3f4f6;\">\n          <div style=\"width:32px;height:32px;border-radius:8px;background:#f9fafb;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--gray-400);\">${icon}</div>\n          <div style=\"flex:1;font-size:0.85rem;color:var(--gray-700);\">${label}</div>\n          <div style=\"font-size:0.85rem;font-weight:700;${valueCss}\">${value}</div>\n        </div>`;\n      }\n\n      const violIcon = `<svg width=\"15\" height=\"15\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z\"/></svg>`;\n      const elevIcon = `<svg width=\"15\" height=\"15\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M8 12l4-4 4 4M8 16l4-4 4 4\"/></svg>`;\n      const coIcon   = `<svg width=\"15\" height=\"15\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"2\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z\"/></svg>`;\n\n      const violValueCss = totalOpen > 0 ? 'color:#c4533a;' : 'color:#15803d;';\n      const elevValueCss = elevIssueText ? 'color:#b45309;' : 'color:#15803d;';\n      const coValueCss   = coBadgeCss === 'red' ? 'color:#c4533a;' : coBadgeCss === 'amber' ? 'color:#b45309;' : 'color:#15803d;';\n\n      // risk flags\n      const flagLines = [];\n      if (classC.length > 0) flagLines.push('<div style=\'display:flex;align-items:center;gap:6px;font-size:0.72rem;color:#c4533a;\'><span style=\'width:5px;height:5px;border-radius:50%;background:#c4533a;flex-shrink:0;\'></span>' + classC.length + ' Class C violation' + (classC.length > 1 ? 's' : '') + ' open</div>');\n      if (classB.length > 0) flagLines.push('<div style=\'display:flex;align-items:center;gap:6px;font-size:0.72rem;color:#c4533a;\'><span style=\'width:5px;height:5px;border-radius:50%;background:#c4533a;flex-shrink:0;\'></span>' + classB.length + ' Class B violation' + (classB.length > 1 ? 's' : '') + ' open</div>');\n      if (elevIssueText) flagLines.push('<div style=\'display:flex;align-items:center;gap:6px;font-size:0.72rem;color:#b45309;\'><span style=\'width:5px;height:5px;border-radius:50%;background:#b45309;flex-shrink:0;\'></span>' + elevIssueText + '</div>');\n      const riskFlags = flagLines.join('');\n      const bblVal = bldg.bbl || '-';\n      const storiesVal = bldg.stories || '-';\n      const unitsVal = bldg.unit_count || '-';\n      const addressVal = bldg.address || '';\n\n      sectionsEl.innerHTML = `        <div style=\"border:0.5px solid rgba(0,0,0,0.12);border-radius:14px;overflow:hidden;\">\n\n          <div style=\"padding:1.25rem 1.5rem 1rem;border-bottom:0.5px solid rgba(0,0,0,0.08);\">\n            <div style=\"font-size:0.95rem;font-weight:500;color:var(--navy);margin-bottom:0.6rem;\">${addressVal}</div>\n            <div style=\"display:flex;flex-direction:column;gap:3px;\">\n              <div style=\"display:flex;gap:8px;\">\n                <span style=\"font-size:0.72rem;color:#7a8fa6;width:48px;flex-shrink:0;\">BBL</span>\n                <span style=\"font-size:0.8rem;font-weight:500;color:var(--navy);\">${bblVal}</span>\n              </div>\n              <div style=\"display:flex;gap:8px;\">\n                <span style=\"font-size:0.72rem;color:#7a8fa6;width:48px;flex-shrink:0;\">Stories</span>\n                <span style=\"font-size:0.8rem;font-weight:500;color:var(--navy);\">${storiesVal}</span>\n              </div>\n              <div style=\"display:flex;gap:8px;\">\n                <span style=\"font-size:0.72rem;color:#7a8fa6;width:48px;flex-shrink:0;\">Units</span>\n                <span style=\"font-size:0.8rem;font-weight:500;color:var(--navy);\">${unitsVal}</span>\n              </div>\n            </div>\n          </div>\n\n          <div style=\"display:flex;\">\n\n            <div style=\"padding:1.5rem;flex:0 0 210px;border-right:0.5px solid rgba(0,0,0,0.08);background:${scoreBg};\">\n              <div style=\"font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${scoreColor};margin-bottom:0.5rem;\">Building Risk Score</div>\n              <div style=\"font-family:var(--serif);font-size:3.2rem;font-weight:600;color:${scoreColor};line-height:1;letter-spacing:-0.03em;\">${riskScore}</div>\n              <div style=\"font-size:0.8rem;color:${scoreColor};margin-top:0.5rem;\">Higher than ${percentile}% of NYC buildings</div>\n              <div style=\"margin-top:1rem;display:flex;flex-direction:column;gap:5px;\">\n                ${riskFlags}\n              </div>\n            </div>\n\n            <div style=\"padding:1.5rem;flex:1;background:#111e30;color:#f7f4ef;\">\n              <div style=\"font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(247,244,239,0.4);margin-bottom:0.75rem;\">Full report includes</div>\n\n              <div style=\"background:rgba(255,255,255,0.06);border-radius:8px;padding:0.6rem 0.75rem;margin-bottom:6px;\">\n                <div style=\"display:flex;align-items:center;gap:7px;margin-bottom:6px;\">\n                  <span style=\"font-size:10px;opacity:0.45;\">&#x1F512;</span>\n                  <span style=\"font-size:0.75rem;color:rgba(247,244,239,0.65);line-height:1.4;\">Every violation the city has on this building</span>\n                </div>\n                <div style=\"display:flex;gap:4px;\">\n                  <div style=\"height:7px;width:90px;border-radius:3px;background:rgba(247,244,239,0.18);filter:blur(3px);\"></div>\n                  <div style=\"height:7px;width:60px;border-radius:3px;background:rgba(247,244,239,0.18);filter:blur(3px);\"></div>\n                  <div style=\"height:7px;width:75px;border-radius:3px;background:rgba(247,244,239,0.18);filter:blur(3px);\"></div>\n                </div>\n              </div>\n\n              <div style=\"background:rgba(255,255,255,0.06);border-radius:8px;padding:0.6rem 0.75rem;margin-bottom:6px;\">\n                <div style=\"display:flex;align-items:center;gap:7px;margin-bottom:6px;\">\n                  <span style=\"font-size:10px;opacity:0.45;\">&#x1F512;</span>\n                  <span style=\"font-size:0.75rem;color:rgba(247,244,239,0.65);line-height:1.4;\">What to fix, what to fight, and what to ignore</span>\n                </div>\n                <div style=\"display:flex;gap:4px;\">\n                  <div style=\"height:7px;width:110px;border-radius:3px;background:rgba(247,244,239,0.18);filter:blur(3px);\"></div>\n                  <div style=\"height:7px;width:70px;border-radius:3px;background:rgba(247,244,239,0.18);filter:blur(3px);\"></div>\n                  <div style=\"height:7px;width:50px;border-radius:3px;background:rgba(247,244,239,0.18);filter:blur(3px);\"></div>\n                </div>\n              </div>\n\n              <div style=\"background:rgba(255,255,255,0.06);border-radius:8px;padding:0.6rem 0.75rem;margin-bottom:6px;\">\n                <div style=\"display:flex;align-items:center;gap:7px;margin-bottom:6px;\">\n                  <span style=\"font-size:10px;opacity:0.45;\">&#x1F512;</span>\n                  <span style=\"font-size:0.75rem;color:rgba(247,244,239,0.65);line-height:1.4;\">Where this building ranks among NYC peers</span>\n                </div>\n                <div style=\"display:flex;gap:4px;\">\n                  <div style=\"height:7px;width:80px;border-radius:3px;background:rgba(247,244,239,0.18);filter:blur(3px);\"></div>\n                  <div style=\"height:7px;width:55px;border-radius:3px;background:rgba(247,244,239,0.18);filter:blur(3px);\"></div>\n                  <div style=\"height:7px;width:95px;border-radius:3px;background:rgba(247,244,239,0.18);filter:blur(3px);\"></div>\n                </div>\n              </div>\n\n              <a href=\"#\" onclick=\"document.querySelector('.bin-section')?.scrollIntoView({behavior:'smooth'});return false;\" style=\"display:inline-flex;align-items:center;gap:6px;margin-top:0.75rem;background:#f7f4ef;color:#111e30;font-size:0.8rem;font-weight:700;padding:0.55rem 1.25rem;border-radius:99px;text-decoration:none;\" onmouseover=\"this.style.opacity='0.88'\" onmouseout=\"this.style.opacity='1'\">\n                Unlock Full Building Report &#x2192;\n              </a>\n            </div>\n\n          </div>\n        </div>`\n\n      results.style.display = 'block';\n      results.scrollIntoView({ behavior: 'smooth', block: 'start' });\n    }\n\n  })();\n  ", "\n// Nav transparency: transparent over hero, solid once scrolled past\n(function() {\n  const nav  = document.querySelector('nav');\n  const hero = document.querySelector('.hero');\n  function updateNav() {\n    if (window.scrollY > 10) {\n      nav.classList.add('scrolled');\n    } else {\n      nav.classList.remove('scrolled');\n    }\n  }\n  window.addEventListener('scroll', updateNav, { passive: true });\n  updateNav();\n})();\n", "\n    function scaleLpScreen() {\n      document.querySelectorAll('.lp-screen').forEach(function(screen) {\n        var w = screen.offsetWidth;\n        var scale = w / 1165;\n        screen.querySelector('.lp-screen-inner').style.transform =\n          'scale(' + scale + ')';\n      });\n    }\n    scaleLpScreen();\n    window.addEventListener('resize', scaleLpScreen);\n  ", "\n    (function() {\n      var obs = new IntersectionObserver(function(entries) {\n        entries.forEach(function(e) {\n          if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }\n        });\n      }, { threshold: 0.12 });\n      document.querySelectorAll('.fade-in').forEach(function(el) { obs.observe(el); });\n    })();\n  ", "\n    // Track main \"See Your Building\" button\n    const binSubmit = document.getElementById(\"bin-submit\");\n\n    if (binSubmit) {\n      binSubmit.addEventListener(\"click\", function () {\n        const binValue = document.getElementById(\"bin-input\")?.value || \"\";\n\n        console.log(\"bin_submit_click\", binValue);\n\n        if (typeof gtag === \"function\") {\n          gtag(\"event\", \"bin_submit_click\", {\n            event_category: \"bin_lookup\",\n            event_label: binValue || \"empty\",\n            bin_number: binValue || \"empty\",\n            debug_mode: true\n          });\n        }\n      });\n    }\n\n    // Track example BIN buttons\n    const exampleButtons = document.querySelectorAll(\".bin-example-chip\");\n\n    exampleButtons.forEach(btn => {\n      btn.addEventListener(\"click\", function () {\n        const exampleBin = this.dataset.bin || this.textContent.trim();\n\n        console.log(\"bin_example_click\", exampleBin);\n\n        if (typeof gtag === \"function\") {\n          gtag(\"event\", \"bin_example_click\", {\n            event_category: \"bin_lookup\",\n            event_label: exampleBin || \"empty\",\n            bin_number: exampleBin || \"empty\",\n            debug_mode: true\n          });\n        }\n      });\n    });\n  ", "\n(function() {\n  var vid = document.getElementById('hero-video');\n  if (!vid) return;\n  vid.playbackRate = 0.6;\n  vid.loop = true;\n  vid.play().catch(function() {});\n})();\n"];

const MainSite: React.FC = () => {
  useEffect(() => {
    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // Set document title and meta
    document.title = 'Half/Ave — NYC Property Management Software for Landlords & Building Operators';

    // Run inline scripts in order
    inlineScripts.forEach(src => {
      try {
        // eslint-disable-next-line no-new-func
        new Function(src)();
      } catch(e) {
        console.warn('Script error:', e);
      }
    });

    return () => {
      styleEl.remove();
    };
  }, []);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: bodyHTML }}
    />
  );
};

export default MainSite;
