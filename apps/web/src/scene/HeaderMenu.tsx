"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button, type ButtonProps } from "@portfolio/design/button";

export type MenuLink = { label: string; href: string; external?: boolean };

/** A header button that opens a short list of links. Closes on Escape, on a click elsewhere, and after choosing. */
export function HeaderMenu({ label, links, ...button }: { label: ReactNode; links: MenuLink[] } & Omit<ButtonProps, "children">) {
  const [open, setOpen] = useState(false);
  const id = useId(), box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", key); };
  }, [open]);

  return (
    <div className="header-menu" ref={box}>
      <Button {...button} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{label}</Button>
      {open && (
        <ul id={id} className="header-menu-list">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} {...(l.external ? { target: "_blank", rel: "noopener" } : {})}>{l.label}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
