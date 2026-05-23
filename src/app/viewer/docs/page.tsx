"use client";

import { useState } from "react";
import { defaultDocId, DocView, docsTree, getDoc } from "./DocsContent";

const sections = Array.from(new Set(docsTree.map((d) => d.section)));

export default function ViewerDocsPage() {
  const [activeId, setActiveId] = useState(defaultDocId);
  const activeEntry = getDoc(activeId);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">EasyDeck</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Framework Docs
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
        <nav
          aria-label="Documentation table of contents"
          className="max-h-[calc(100vh-8rem)] shrink-0 overflow-y-auto rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-4 backdrop-blur-xl lg:sticky lg:top-6 lg:w-60 xl:w-72"
        >
          {sections.map((section) => {
            const items = docsTree.filter((d) => d.section === section);
            return (
              <div key={section} className="mb-4 last:mb-0">
                <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-zinc-600">
                  {section}
                </p>
                <ul className="flex flex-col gap-0.5">
                  {items.map((entry) => {
                    const isActive = entry.id === activeId;
                    return (
                      <li key={entry.id}>
                        <button
                          type="button"
                          aria-label={`${section} / ${entry.item}`}
                          aria-current={isActive ? "true" : undefined}
                          onClick={() => setActiveId(entry.id)}
                          className={`w-full rounded-xl px-3 py-1.5 text-left text-sm transition-colors duration-150 ${
                            isActive
                              ? "bg-zinc-800/70 font-medium text-zinc-50"
                              : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
                          }`}
                        >
                          {entry.item}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <main className="min-w-0 flex-1 rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl sm:p-8">
          <div key={activeEntry.id} className="transition-all duration-200 ease-out">
            <DocView entry={activeEntry} />
          </div>
        </main>
      </div>
    </div>
  );
}
