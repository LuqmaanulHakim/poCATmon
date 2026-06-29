"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IconSettings, IconSettingsFilled,
  IconCurrentLocation, IconCurrentLocationFilled,
  IconPaw, IconPawFilled
} from "@tabler/icons-react";

const tabs = [
  {
    href: "/snap-cat",
    label: "Snap",
    icon: (active: boolean) => active ? <IconPawFilled size={24} /> : <IconPaw size={24} />,
  },
  {
    href: "/map",
    label: "Near me",
    icon: (active: boolean) => active ? <IconCurrentLocationFilled size={24} /> : <IconCurrentLocation size={24} />,
  },
  {
    href: "/catch-cat",
    label: "Setting",
    icon: (active: boolean) => active ? <IconSettingsFilled size={24} /> : <IconSettings size={24} />,
  },
];

function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const check = () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true; // iOS Safari

    setIsPWA(check());
  }, []);

  return isPWA;
}

export default function BottomNav() {
  const pathname = usePathname();
  const isPWA = useIsPWA();

  if (!isPWA) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        backgroundColor: "var(--nav-bg-solid)",
        borderColor: "var(--card-border)",
        willChange: "transform",
        WebkitTransform: "translateZ(0)",
      }}
    >
      <div className="max-w-md mx-auto flex">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1 relative"
              style={{
                color: active ? "var(--accent)" : "var(--muted)",
              }}
            >
              {tab.icon(active)}
              <span className="text-[11px] font-semibold">{tab.label}</span>
              {active && (
                <span
                  className="absolute bottom-0 h-[3px] w-10 rounded-full"
                  style={{ background: "var(--accent)" }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}