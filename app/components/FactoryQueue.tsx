"use client";

import { useTranslations } from "next-intl";

type QueueItem = {
  title: string;
  progress: number;
  status: "Wartend" | "In Arbeit" | "Fertig";
};

type Props = {
  queue: QueueItem[];
};

export default function FactoryQueue({ queue }: Props) {
  const t = useTranslations("home.contentFactory");

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-6">
      <h2 className="mb-6 text-2xl font-bold">
        📋 {t("queueTitle")}
      </h2>

      {queue.length === 0 ? (
        <p className="text-gray-400">
          {t("queueEmpty")}
        </p>
      ) : (
        <div className="space-y-5">
          {queue.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/10 bg-black/30 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold">{item.title}</h3>

                <span
                  className={
                    item.status === "Fertig"
                      ? "text-green-400"
                      : item.status === "In Arbeit"
                      ? "text-yellow-400"
                      : "text-gray-400"
                  }
                >
                  {item.status === "Fertig"
                    ? t("statusDone")
                    : item.status === "In Arbeit"
                      ? t("statusInProgress")
                      : t("statusWaiting")}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                  style={{
                    width: `${item.progress}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-sm text-gray-400">
                {item.progress}% {t("done")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}