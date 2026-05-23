"use client";

export interface SchemaField {
  name: string;
  type: string;
  optional?: boolean;
  description?: string;
  children?: SchemaField[];
}

interface SchemaTreeProps {
  fields: SchemaField[];
}

const typeStyles: Record<string, string> = {
  string: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  number: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  boolean: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  array: "border-purple-500/20 bg-purple-500/10 text-purple-300",
  object: "border-rose-500/20 bg-rose-500/10 text-rose-300",
  union: "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300",
};

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        typeStyles[type] ?? "border-zinc-700/60 bg-zinc-800/80 text-zinc-300",
      ].join(" ")}
    >
      {type}
    </span>
  );
}

function TreeNode({ field, depth = 0 }: { field: SchemaField; depth?: number }) {
  const hasChildren = Boolean(field.children?.length);

  return (
    <li className="relative pl-6">
      {depth > 0 ? <span className="absolute left-2 top-0 h-full w-px bg-zinc-800/80" aria-hidden="true" /> : null}
      <span className="absolute left-2 top-6 h-px w-3 bg-zinc-800/80" aria-hidden="true" />

      <div
        className={[
          "rounded-2xl border border-zinc-800/60 bg-zinc-950/70 px-4 py-3 backdrop-blur-xl",
          field.optional ? "opacity-80" : "opacity-100",
        ].join(" ")}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-zinc-100">{field.name}</span>
              {field.optional ? <span className="text-sm font-semibold text-zinc-500">?</span> : null}
            </div>
            {field.description ? <p className="mt-1 text-sm leading-6 text-zinc-400">{field.description}</p> : null}
          </div>
          <TypeBadge type={field.type} />
        </div>
      </div>

      {hasChildren ? (
        <ul className="mt-3 space-y-3">
          {field.children?.map((child) => (
            <TreeNode key={`${field.name}.${child.name}`} field={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function SchemaTree({ fields }: SchemaTreeProps) {
  return (
    <div className="rounded-[28px] border border-zinc-800/50 bg-zinc-900/40 p-4 shadow-2xl shadow-black/20 sm:p-5">
      <ul className="space-y-3">
        {fields.map((field) => (
          <TreeNode key={field.name} field={field} />
        ))}
      </ul>
    </div>
  );
}
