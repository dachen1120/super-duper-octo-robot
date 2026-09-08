"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function IndustryGrid({ industries }) {
  const [slugs, setSlugs] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/published-industries")
      .then((r) => r.json())
      .then((d) => { if (alive) setSlugs(d.slugs || []); })
      .catch(() => { if (alive) setSlugs([]); });
    return () => { alive = false; };
  }, []);

  return (
    <div className="industry-grid">
      {industries.map((ind) => {
        const available = slugs === null ? true : slugs.includes(ind.id);
        const inner = (
          <>
            <span className="industry-icon" aria-hidden="true">{ind.icon}</span>
            <span className="industry-name">{ind.name}</span>
            <span className="industry-en">{ind.nameEn}</span>
            <span className="industry-desc">{ind.desc}</span>
            {!available && <span className="industry-soon">敬请期待</span>}
          </>
        );
        return available ? (
          <Link key={ind.id} href={`/industry/${ind.id}`} className="industry-card">
            {inner}
          </Link>
        ) : (
          <div key={ind.id} className="industry-card unavailable" aria-disabled="true">
            {inner}
          </div>
        );
      })}
    </div>
  );
}