"use client";

export interface GraphNode {
  id: string;
  label: string;
  children?: GraphNode[];
  color?: string;
}

interface NodeGraphProps {
  root: GraphNode;
}

function GraphBranch({ node, depth = 0, isLast = true }: { node: GraphNode; depth?: number; isLast?: boolean }) {
  const hasChildren = Boolean(node.children?.length);

  return (
    <div className={depth === 0 ? "relative" : "relative ml-6 pl-6"}>
      {depth > 0 ? (
        <>
          <div
            aria-hidden="true"
            className={`absolute left-0 top-0 w-px bg-gradient-to-b from-zinc-700 via-zinc-600/70 to-transparent ${isLast ? "h-6" : "bottom-0"}`}
          />
          <div
            aria-hidden="true"
            className="viewer-timeline-line absolute left-0 top-6 h-px w-5 bg-gradient-to-r from-purple-500/80 via-cyan-400/80 to-emerald-400/70"
          />
          <span
            aria-hidden="true"
            className="viewer-status-pulse absolute left-[18px] top-[21px] h-2 w-2 rounded-full bg-cyan-300/80 shadow-[0_0_18px_rgba(103,232,249,0.55)]"
          />
        </>
      ) : null}

      <div
        className="group relative inline-flex min-w-[14rem] items-center rounded-2xl border border-zinc-700/50 bg-zinc-900/70 px-4 py-3 font-mono text-sm text-zinc-100 shadow-[0_20px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-500/60 hover:shadow-[0_24px_42px_rgba(6,182,212,0.14)]"
        style={node.color ? { color: node.color } : undefined}
      >
        <span className="absolute inset-y-3 left-2 w-px rounded-full bg-gradient-to-b from-purple-500/0 via-cyan-400/80 to-emerald-400/0 opacity-70" aria-hidden="true" />
        <span className="pl-2">{node.label}</span>
      </div>

      {hasChildren ? (
        <div className="mt-3 space-y-3">
          {node.children?.map((child, index) => (
            <GraphBranch
              key={child.id}
              node={child}
              depth={depth + 1}
              isLast={index === node.children!.length - 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function NodeGraph({ root }: NodeGraphProps) {
  return (
    <div className="overflow-x-auto p-2">
      <GraphBranch node={root} />
    </div>
  );
}
