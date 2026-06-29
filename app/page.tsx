"use client";

import { useEffect, useRef } from "react";
import {
  IconMapPin, IconCamera, IconBrain, IconGlobe, IconCircuitCapacitorPolarized, IconNavigation, IconBell,
  IconShield, IconArrowRight, IconCircleCheckFilled, IconCircleCheck, IconDownload, IconLock,
} from "@tabler/icons-react";
import { motion, useInView } from "motion/react";
import { useRouter } from "next/navigation";

// ── PWA detection & redirect ───────────────────────────────────────────────
function usePwaRedirect() {
  const router = useRouter();

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;

    if (isStandalone) {
      router.replace("/map");
    }
  }, [router]);
}

// ── Fade-in on scroll helper ───────────────────────────────────────────────
function Fade({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    Icon: IconMapPin,
    label: "Live Map",
    title: "Discover cats across Malaysia",
    desc: "Explore real cat sighting across Kuala Lumpur, Selangor, Penang, Johor and more. Every upload is pinned to the map in real time.",
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10 dark:bg-orange-500/[0.12]",
    span: "md:col-span-2",
  },
  {
    Icon: IconCamera,
    label: "Snap & Upload",
    title: "Spot a cat? Share instantly",
    desc: "Tap the camera, snap the cat. GPS helps place sightings accurately across Malaysia.",
    iconColor: "text-pink-500",
    iconBg: "bg-pink-500/10 dark:bg-pink-500/[0.12]",
    span: "",
  },
  {
    Icon: IconGlobe,
    label: "Local Community",
    title: "Cats are everywhere",
    desc: "Connect with local cat lovers and discover nearby cat sightings in your area",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/[0.12]",
    span: "",
  },
  {
    Icon: IconMapPin,
    label: "Contribute",
    title: "Your pin, forever on the map",
    desc: "Every upload stays on the map and helps fellow cat lovers in your city.",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/[0.12]",
    span: "md:col-span-2",
  },
];

const PWA_BENEFITS = [
  { Icon: IconCircuitCapacitorPolarized, num: "01", title: "Instant launch", desc: "Tap and go — no browser loading banners, no URL bar stealing space." },
  { Icon: IconNavigation, num: "02", title: "Auto GPS tagging", desc: "Location is captured the moment you hit upload, seamlessly." },
  { Icon: IconCamera, num: "03", title: "Camera-first UX", desc: "Direct camera access for the fastest possible cat capture flow." },
  { Icon: IconCircuitCapacitorPolarized, num: "04", title: "Optimised for mobile", desc: "Buttery smooth, designed for thumbs, works on any device." },
];

const TRUST_POINTS = [
  { Icon: IconShield, text: "No invasive tracking — we collect only what the map needs" },
  { Icon: IconMapPin, text: "GPS is accessed only during cat uploads, never in the background" },
  { Icon: IconCamera, text: "Images compressed client-side before anything leaves your device" },
  { Icon: IconLock, text: "Lightweight PWA — under 200 KB initial load, no App Store needed" },
];

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  // Redirect immediately to /map when running as an installed PWA
  usePwaRedirect();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 px-5 overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-primary/[0.08] blur-[140px]" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-8 items-center">

          {/* ── Left: text column ── */}
          <div>
            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold tracking-widest uppercase mb-7"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Malaysia cat map
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-5xl sm:text-6xl lg:text-[72px] font-black leading-[0.9] tracking-tighter mb-7"
            >
              Malaysia{"'"}s community<br />
              <span className="text-primary">cat map</span><br />
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.14 }}
              className="text-lg text-muted-foreground max-w-md mb-3 leading-relaxed"
            >
              Snap a cat photo → your sighting appears on a live map across Malaysia.
            </motion.p>

            {/* Mobile hero photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="relative w-full max-w-sm mx-auto lg:hidden my-8 rounded-3xl overflow-hidden shadow-2xl shadow-black/20 ring-1 ring-border"
            >
              <img
                src="https://images.unsplash.com/photo-1503362516536-635096dd5a80?w=640&h=480&fit=crop&auto=format"
                alt="Brown tabby cat sitting outdoors"
                className="w-full h-64 object-cover"
              />
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <button
                onClick={() => alert("PWA install prompt")}
                className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl font-semibold text-[color:var(--foreground)] bg-primary hover:bg-primary/90 active:scale-95 transition-all shadow-xl shadow-primary/25 text-base"
              >
                <IconDownload className="w-4 h-4" />
                Install App
                <IconArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => alert("Continue to web")}
                className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl font-medium border border-border hover:bg-muted transition-colors text-base"
              >
                Continue on Web
              </button>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.38 }}
              className="flex items-center gap-7 pt-8 border-t border-border"
            >
              {[
                { val: "10+", label: "cats mapped" },
                { val: "14", label: "states covered" },
                { val: "100%", label: "Privacy first" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-display font-black text-2xl leading-none mb-0.5">{s.val}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: photo collage (desktop only) ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block h-[520px]"
          >
            {/* Orange ambient glow */}
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/25 blur-[80px] rounded-full" />

            {/* Main photo */}
            <div className="absolute left-16 top-4 w-64 h-[380px] rounded-3xl overflow-hidden shadow-2xl shadow-black/30 ring-1 ring-border">
              <img
                src="https://images.unsplash.com/photo-1503362516536-635096dd5a80?w=600&h=900&fit=crop&auto=format"
                alt="Brown tabby cat sitting outdoors"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Secondary photo — right */}
            <div className="absolute right-4 top-16 w-36 h-48 rounded-2xl overflow-hidden shadow-xl ring-1 ring-border rotate-[3deg]">
              <img
                src="https://images.unsplash.com/photo-1604675223954-b1aabd668078?w=400&h=560&fit=crop&auto=format"
                alt="Orange and white cat on concrete"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Tertiary photo — bottom left */}
            <div className="absolute left-0 bottom-4 w-32 h-40 rounded-2xl overflow-hidden shadow-xl ring-1 ring-border -rotate-[2deg]">
              <img
                src="https://images.unsplash.com/photo-1609675193421-e34dde71ffef?w=400&h=500&fit=crop&auto=format"
                alt="Orange tabby cat on blue floor"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Upload count badge */}
            <div className="absolute right-0 bottom-16 flex items-center gap-2 px-3 py-2 rounded-2xl bg-card border border-border shadow-lg text-sm font-medium">
              <div>
                <div className="font-semibold leading-none">+3 nearby</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">in last 2 hours</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="px-5 py-20 md:py-28 bg-muted/60">
        <div className="max-w-6xl mx-auto">
          <Fade className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-widest uppercase text-primary mb-3">Features</p>
            <h2 className="font-display text-4xl md:text-5xl font-black tracking-tighter leading-tight">
              Everything cats deserve
            </h2>
          </Fade>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <Fade key={f.title} delay={i * 0.07} className={f.span}>
                <div
                  className={[
                    "group h-full p-6 rounded-2xl bg-card border border-border",
                    "hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300",
                    f.span.includes("col-span-2") ? "flex flex-col sm:flex-row gap-5 items-start" : "",
                  ].join(" ")}
                >
                  <div className={`w-10 h-10 rounded-xl ${f.iconBg} flex items-center justify-center flex-shrink-0 ${f.span.includes("col-span-2") ? "mb-0" : "mb-4"}`}>
                    <f.Icon className={`w-5 h-5 ${f.iconColor}`} />
                  </div>
                  <div>
                    <div className={`text-[10px] font-bold tracking-widest uppercase ${f.iconColor} mb-1`}>{f.label}</div>
                    <h3 className="font-display font-bold text-lg mb-2 leading-snug">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Install ───────────────────────────────────────────────────── */}
      <section className="px-5 py-20 md:py-28">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left: pitch */}
          <Fade>
            <p className="text-[11px] font-bold tracking-widest uppercase text-primary mb-3">Install the PWA</p>
            <h2 className="font-display text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-5">
              Get the full<br />
              <span className="text-primary">cat experience</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-md text-base">
              The web version is great. The installed app is extraordinary. No App Store required
              — just tap "Add to Home Screen" and you{"'"}re done.
            </p>
            <button
              onClick={() => alert("PWA install prompt")}
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl font-semibold text-[color:var(--foreground)] bg-primary hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <IconDownload className="w-4 h-4" />
              Install PO-CAT-MON — Free
            </button>
          </Fade>

          {/* Right: benefit list */}
          <div className="space-y-3">
            {PWA_BENEFITS.map((b, i) => (
              <Fade key={b.num} delay={i * 0.07}>
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/20 transition-colors">
                  <span className="font-display font-black text-2xl text-primary/20 leading-none w-10 flex-shrink-0 mt-0.5">
                    {b.num}
                  </span>
                  <div>
                    <h3 className="font-semibold text-base mb-1">{b.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust & Safety ────────────────────────────────────────────────── */}
      <section className="px-5 py-20 md:py-24 bg-muted/60">
        <div className="max-w-3xl mx-auto">
          <Fade className="text-center mb-12">
            <p className="text-[11px] font-bold tracking-widest uppercase text-primary mb-3">Privacy & Safety</p>
            <h2 className="font-display text-4xl md:text-5xl font-black tracking-tighter">
              Lightweight &amp; honest
            </h2>
          </Fade>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TRUST_POINTS.map((t, i) => (
              <Fade key={i} delay={i * 0.08}>
                <div className="flex items-start gap-3.5 p-5 rounded-2xl bg-card border border-border">
                  <IconCircleCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground leading-relaxed">{t.text}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="relative px-5 py-28 md:py-36 overflow-hidden">
        {/* Radial glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-primary/[0.07] blur-[120px]" />

        <div className="max-w-xl mx-auto text-center relative">
          <Fade>
            {/* Cat photo */}
            <div className="relative w-36 h-36 mx-auto mb-10">
              <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-primary/20 shadow-2xl shadow-primary/20">
                <img
                  src="https://images.unsplash.com/photo-1698170925942-c54411018ada?w=400&h=400&fit=crop&auto=format"
                  alt="Cat looking at camera"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-full bg-primary/20 blur-2xl -z-10 scale-[1.6]" />
            </div>

            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-tight mb-5">
              Ready to map<br />
              <span className="text-primary">every cat?</span>
            </h2>
            <p className="text-muted-foreground mb-10 text-lg max-w-md mx-auto leading-relaxed">
              Join thousands of cat enthusiasts building the world{"'"}s largest cat sighting database. Free, forever.
            </p>

            <button
              onClick={() => alert("PWA install")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-10 py-5 rounded-2xl font-bold text-[color:var(--foreground)] bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all shadow-2xl shadow-primary/30 text-lg mb-8"
            >
              <IconDownload className="w-5 h-5" />
              Install PO-CAT-MON — It{"'"}s Free
            </button>

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span>No App Store needed</span>
            </div>
          </Fade>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="px-5 py-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span className="font-display font-black text-base text-foreground">PO-CAT-MON</span>
          <span>© 2026 · Mapping cats, one photo at a time</span>
        </div>
      </footer>
       <div className="h-8" />
    </div>
  );
}