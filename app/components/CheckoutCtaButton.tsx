"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Variant = {
  label: string;
  sourceSuffix: string;
  className: string;
};

type CheckoutCtaButtonProps = {
  href: string;
  ctaKey: string;
  variantA: Variant;
  variantB: Variant;
  defaultLabel?: string;
};

function withSource(href: string, source: string) {
  const url = new URL(href, "https://ki-business-hub.vercel.app");
  url.searchParams.set("source", source);
  return `${url.pathname}${url.search}${url.hash}`;
}

export default function CheckoutCtaButton({
  href,
  ctaKey,
  variantA,
  variantB,
  defaultLabel = variantA.label,
}: CheckoutCtaButtonProps) {
  const [variant, setVariant] = useState<"A" | "B" | null>(null);

  useEffect(() => {
    const storageKey = `cta-test-${ctaKey}`;
    const stored = window.localStorage.getItem(storageKey) as "A" | "B" | null;
    const nextVariant = stored === "A" || stored === "B" ? stored : (Math.random() >= 0.5 ? "A" : "B");

    window.localStorage.setItem(storageKey, nextVariant);
    setVariant(nextVariant);
  }, [ctaKey]);

  const current = useMemo(() => {
    if (variant === "B") return variantB;
    if (variant === "A") return variantA;
    return variantA;
  }, [variant, variantA, variantB]);

  const finalHref = useMemo(() => {
    const source = `${ctaKey}-${current.sourceSuffix}`;
    return withSource(href, source);
  }, [href, ctaKey, current.sourceSuffix]);

  return (
    <Link href={finalHref} className={current.className}>
      {variant ? current.label : defaultLabel}
    </Link>
  );
}
