"use client";

interface CodeBlockProps {
  code: string;
  language?: "json" | "typescript";
  status?: "valid" | "invalid";
  error?: string;
}

const statusStyles = {
  valid: {
    label: "Valid example",
    icon: "✓",
    card: "border-emerald-500/25",
    accent: "bg-emerald-500 text-emerald-950",
    rule: "bg-emerald-500",
  },
  invalid: {
    label: "Invalid example",
    icon: "✕",
    card: "border-red-500/25",
    accent: "bg-red-500 text-red-950",
    rule: "bg-red-500",
  },
} as const;

export function CodeBlock({ code, language = "json", status, error }: CodeBlockProps) {
  const metadata = status ? statusStyles[status] : null;

  return (
    <div className={[
      "overflow-hidden rounded-[28px] border bg-zinc-950/90 shadow-2xl shadow-black/20",
      metadata ? metadata.card : "border-zinc-800/60",
    ].join(" ")}>
      <div className={metadata ? `h-1 w-full ${metadata.rule}` : "h-px w-full bg-zinc-800/80"} aria-hidden="true" />
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800/70 px-4 py-3">
        <div className="flex items-center gap-3">
          {metadata ? (
            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${metadata.accent}`}>
              {metadata.icon}
            </span>
          ) : null}
          <div>
            <p className="text-sm font-semibold text-zinc-100">{metadata?.label ?? "Code example"}</p>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{language}</p>
          </div>
        </div>
      </div>
      <pre className="overflow-x-auto bg-zinc-900/80 p-4 text-sm leading-6 text-zinc-200">
        <code className="font-mono">{code}</code>
      </pre>
      {error ? <p className="border-t border-zinc-800/70 px-4 py-3 text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
