import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { ReactNode } from "react";

type NoticeTone = "error" | "success" | "info";

interface NoticeProps {
  tone?: NoticeTone;
  children: ReactNode;
}

const toneClasses: Record<NoticeTone, string> = {
  error: "border-destructive-border bg-destructive-soft text-destructive",
  success: "border-success-border bg-success-soft text-success",
  info: "border-brand-soft bg-accent text-accent-foreground",
};

const toneIcons: Record<NoticeTone, typeof Info> = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

export default function Notice({ tone = "info", children }: NoticeProps) {
  const Icon = toneIcons[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${toneClasses[tone]}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
