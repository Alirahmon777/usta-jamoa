import { Link } from "react-router";

import { ROUTES, SECTIONS } from "@/shared/config";
import { Logo } from "@/shared/ui";

import styles from "./site-header.module.css";

const NAV = [
  { href: `#${SECTIONS.PROCESS}`, label: "Jarayon" },
  { href: `#${SECTIONS.FEATURES}`, label: "Imkoniyatlar" },
  { href: `#${SECTIONS.COMMANDS}`, label: "Buyruqlar" }
];

export function SiteHeader() {
  return (
    <header className={styles.wrap}>
      <nav className={styles.bar} aria-label="Asosiy">
        <a href={`#${SECTIONS.TOP}`} aria-label="usta, bosh sahifa">
          <Logo size={26} />
        </a>
        <ul className={styles.links}>
          {NAV.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
          <li>
            <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
          </li>
        </ul>
        <a className={styles.cta} href={`#${SECTIONS.INSTALL}`}>
          O'rnatish
        </a>
      </nav>
    </header>
  );
}
