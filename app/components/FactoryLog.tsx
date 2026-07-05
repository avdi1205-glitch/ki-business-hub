"use client";

import { useTranslations } from "next-intl";

type FactoryLogProps = {
  logs: string[];
};

export default function FactoryLog({ logs }: FactoryLogProps) {
  const t = useTranslations("contentFactory");

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
      <h3 className="mb-4 font-bold text-white">🧠 {t("liveLog")}</h3>

      <div className="space-y-2 text-sm text-gray-300">
        {logs.length === 0 ? (
          <p className="text-gray-500">{t("noActivity")}</p>
        ) : (
          logs.map((log, index) => (
            <p key={index} className="rounded-lg bg-slate-900 px-3 py-2">
              {log}
            </p>
          ))
        )}
      </div>
    </div>
  );
}