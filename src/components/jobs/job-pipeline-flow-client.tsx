"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import {
  JobPipelineNodeDetail,
  jobPipelineNodeTitle,
  type PipelineNodePanelId,
} from "@/components/jobs/job-pipeline-node-detail";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { XIcon } from "lucide-react";
import type { JobPipeline } from "@/lib/validations/job-pipeline.schema";
import { parseJobPipeline } from "@/lib/validations/job-pipeline.schema";
import { cn } from "@/lib/utils";

const X_STEP = 300;

const LG_MEDIA = "(min-width: 1024px)";

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const sel =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll<HTMLElement>(sel)).filter(
    (el) => !el.hasAttribute("disabled"),
  );
}

function useTabCycleTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return;
    const el = containerRef.current;
    if (!el) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = getFocusableElements(el);
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [active, containerRef]);
}

function PipelineStepDetailBody({
  nodeId,
  pipeline,
  panelTitleId,
  closeRef,
  rootRef,
  onClose,
  titleSlot,
}: {
  nodeId: PipelineNodePanelId;
  pipeline: JobPipeline;
  panelTitleId: string;
  closeRef: RefObject<HTMLButtonElement | null>;
  rootRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  /** When set (e.g. Radix dialog title for drawer), replaces the default `h3` + subtitle block. */
  titleSlot?: ReactNode;
}) {
  useTabCycleTrap(rootRef, true);
  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden outline-none"
    >
      <span key={nodeId} className="sr-only" aria-live="polite" aria-atomic>
        {`Showing details for ${jobPipelineNodeTitle(nodeId)}`}
      </span>
      <div className="border-border flex shrink-0 items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0 space-y-1">
          {titleSlot ?? (
            <>
              <h3
                id={panelTitleId}
                className="text-foreground text-base font-semibold leading-tight"
              >
                {jobPipelineNodeTitle(nodeId)}
              </h3>
              <p className="text-muted-foreground text-xs leading-snug">
                Full configuration for this step (includes quiz answer keys).
              </p>
            </>
          )}
        </div>
        <Button
          ref={closeRef}
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0"
          aria-label="Close details"
          onClick={onClose}
        >
          <XIcon className="size-4" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        <JobPipelineNodeDetail pipeline={pipeline} nodeId={nodeId} />
      </div>
    </div>
  );
}

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1))}…`;
}

type PipelineStepNodeData = {
  nodeId: PipelineNodePanelId;
  title: string;
  /** Short preview lines (full detail opens in the side panel). */
  summaryLines: string[];
};

type PipelineExpandContextValue = {
  expandedNodeId: PipelineNodePanelId | null;
  toggleExpanded: (id: PipelineNodePanelId) => void;
};

const PipelineExpandContext = createContext<PipelineExpandContextValue>({
  expandedNodeId: null,
  toggleExpanded: () => {},
});

function PipelineStepNode({ data }: NodeProps<Node<PipelineStepNodeData>>) {
  const { expandedNodeId, toggleExpanded } = useContext(PipelineExpandContext);
  const isExpanded = expandedNodeId === data.nodeId;

  return (
    <div
      className={cn(
        "bg-card text-card-foreground relative w-[min(100vw-3rem,260px)] rounded-lg px-3 py-3 text-left shadow-sm transition-[box-shadow,background-color]",
        "nodrag nopan",
        isExpanded && "bg-primary/[0.06] shadow-md ring-2 ring-primary/35",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!size-2.5 !border-border !bg-muted"
      />
      <div className="flex flex-col gap-2">
        {isExpanded ? (
          <p className="text-primary text-[10px] font-semibold tracking-wide uppercase">
            Details open
          </p>
        ) : null}
        <div className="text-foreground text-sm font-semibold leading-snug">
          {data.title}
        </div>
        <ul className="text-muted-foreground list-disc space-y-1 pl-3.5 text-[11px] leading-snug">
          {data.summaryLines.map((line, i) => (
            <li key={i} className="break-words">
              {line}
            </li>
          ))}
        </ul>
        <div
          className="nodrag nopan relative z-10 mt-0.5"
          onPointerDownCapture={(e) => e.stopPropagation()}
          onMouseDownCapture={(e) => e.stopPropagation()}
        >
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="nodrag nopan pointer-events-auto w-full"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleExpanded(data.nodeId);
            }}
          >
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!size-2.5 !border-border !bg-muted"
      />
    </div>
  );
}

const nodeTypes = { pipelineStep: PipelineStepNode };

/** Refit graph when the details panel opens, closes, or switches step so the canvas width change does not clip nodes. */
function RefitOnDetailsPanelChange({ layoutKey }: { layoutKey: string }) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = requestAnimationFrame(() => {
      fitView({
        padding: 0.2,
        maxZoom: 1.15,
        duration: reduceMotion ? 0 : 180,
      });
    });
    return () => cancelAnimationFrame(id);
  }, [layoutKey, fitView]);
  return null;
}

/** Refit when the canvas container resizes (panel opens, window resize, tab visibility). */
function RefitOnFlowContainerResize({
  containerRef,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const run = () => {
      const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      fitView({
        padding: 0.2,
        maxZoom: 1.15,
        duration: reduceMotion ? 0 : 0,
      });
    };
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(run);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef, fitView]);
  return null;
}

function pipelineToGraph(pipeline: JobPipeline): {
  nodes: Node<PipelineStepNodeData>[];
  edges: Edge[];
} {
  const { node1, node2, node3 } = pipeline;

  const n1Lines = [
    truncate(node1.rubric, 100),
    `${node1.mustHaveSkills.length} must-have · ${node1.niceToHaveSkills.length} nice-to-have skills`,
  ];
  if (node1.passThreshold != null) {
    n1Lines.push(`Pass ≥ ${node1.passThreshold}/100`);
  }

  const mc = node2.questions.filter((q) => q.type === "multiple_choice").length;
  const sa = node2.questions.filter((q) => q.type === "short_answer").length;
  const n2Lines = [
    `${node2.questions.length} questions (${mc} multiple choice, ${sa} short answer)`,
    node2.questions[0]
      ? `First: ${truncate(node2.questions[0].prompt, 88)}`
      : "No prompts",
  ];

  const n3Lines = [truncate(node3.reportInstructions, 110)];
  if (node3.scoringWeightsHint?.trim()) {
    n3Lines.push(`Weights: ${truncate(node3.scoringWeightsHint, 72)}`);
  }

  const nodes: Node<PipelineStepNodeData>[] = [
    {
      id: "n1",
      type: "pipelineStep",
      position: { x: 0, y: 24 },
      data: {
        nodeId: "n1",
        title: "Resume screening",
        summaryLines: n1Lines,
      },
    },
    {
      id: "n2",
      type: "pipelineStep",
      position: { x: X_STEP, y: 24 },
      data: {
        nodeId: "n2",
        title: "Job quiz",
        summaryLines: n2Lines,
      },
    },
    {
      id: "n3",
      type: "pipelineStep",
      position: { x: X_STEP * 2, y: 24 },
      data: {
        nodeId: "n3",
        title: "Hiring summary",
        summaryLines: n3Lines,
      },
    },
  ];

  const edges: Edge[] = [
    {
      id: "e1-2",
      source: "n1",
      target: "n2",
      type: "smoothstep",
    },
    {
      id: "e2-3",
      source: "n2",
      target: "n3",
      type: "smoothstep",
    },
  ];

  return { nodes, edges };
}

export function JobPipelineFlowClient({ pipeline }: { pipeline: unknown }) {
  const parsed = useMemo(() => parseJobPipeline(pipeline), [pipeline]);

  const [openNodeId, setOpenNodeId] = useState<PipelineNodePanelId | null>(
    null,
  );
  const [isLg, setIsLg] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(LG_MEDIA).matches : false,
  );
  const panelCloseRef = useRef<HTMLButtonElement | null>(null);
  const sheetCloseRef = useRef<HTMLButtonElement | null>(null);
  const asideTrapRef = useRef<HTMLDivElement | null>(null);
  const sheetTrapRef = useRef<HTMLDivElement | null>(null);
  const flowContainerRef = useRef<HTMLDivElement | null>(null);
  const panelTitleId = useId();

  useEffect(() => {
    const mq = window.matchMedia(LG_MEDIA);
    const apply = () => setIsLg(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const toggleExpanded = useCallback((id: PipelineNodePanelId) => {
    setOpenNodeId((cur) => (cur === id ? null : id));
  }, []);

  const expandContext = useMemo<PipelineExpandContextValue>(
    () => ({
      expandedNodeId: openNodeId,
      toggleExpanded,
    }),
    [openNodeId, toggleExpanded],
  );

  useLayoutEffect(() => {
    if (!openNodeId) return;
    if (isLg) {
      panelCloseRef.current?.focus({ preventScroll: true });
    } else {
      sheetCloseRef.current?.focus({ preventScroll: true });
    }
  }, [openNodeId, isLg]);

  useEffect(() => {
    if (!openNodeId || !isLg) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpenNodeId(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openNodeId, isLg]);

  const { nodes, edges } = useMemo(() => {
    if (!parsed.success) {
      return { nodes: [] as Node<PipelineStepNodeData>[], edges: [] as Edge[] };
    }
    return pipelineToGraph(parsed.data);
  }, [parsed]);

  if (!parsed.success) {
    return (
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm">
          This job’s pipeline is not in the expected v1 shape. Raw JSON is shown
          below for debugging.
        </p>
        <pre className="bg-muted/40 max-h-[20rem] overflow-auto rounded-lg p-4 text-xs leading-relaxed">
          {JSON.stringify(pipeline, null, 2)}
        </pre>
      </div>
    );
  }

  const pipelineData = parsed.data;

  const flowMinH = "min-h-[min(28rem,70vh)]";
  const flowH = "h-[min(28rem,70vh)] lg:h-[min(32rem,75vh)]";

  return (
    <PipelineExpandContext.Provider value={expandContext}>
      <div className="flex w-full min-w-0 flex-col gap-0 lg:flex-row lg:items-stretch lg:gap-0">
        <div
          ref={flowContainerRef}
          className={cn(
            "bg-muted/20 relative min-h-0 min-w-0 flex-1 basis-0 overflow-hidden rounded-lg",
            "w-full max-w-full",
            flowMinH,
            flowH,
            openNodeId && isLg && "lg:rounded-r-none",
          )}
        >
          <ReactFlow
            className="h-full w-full"
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2, maxZoom: 1.15 }}
            minZoom={0.35}
            maxZoom={1.25}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            /** Left-button drag pans the canvas by default and steals clicks; middle/right only. */
            panOnDrag={[1, 2]}
            panOnScroll
            zoomOnDoubleClick={false}
            defaultEdgeOptions={{
              type: "smoothstep",
              style: { strokeWidth: 2, stroke: "var(--border)" },
            }}
          >
            <Background
              gap={16}
              color="var(--muted-foreground)"
              patternClassName="opacity-[0.15]"
            />
            <Controls
              className="!border-0 !bg-card !shadow-md [&_button]:!border-0 [&_button]:!bg-card"
              showInteractive={false}
            />
            <RefitOnDetailsPanelChange layoutKey={openNodeId ?? "closed"} />
            <RefitOnFlowContainerResize containerRef={flowContainerRef} />
          </ReactFlow>
        </div>

        {openNodeId != null && isLg ? (
          <aside
            role="region"
            aria-labelledby={panelTitleId}
            className={cn(
              "bg-card flex min-h-0 w-full max-w-full shrink-0 flex-col overflow-hidden rounded-lg shadow-sm",
              "lg:h-[min(32rem,75vh)] lg:w-80 lg:max-w-[min(100%,26rem)] xl:w-96",
              "lg:rounded-l-none lg:rounded-r-lg",
            )}
          >
            <PipelineStepDetailBody
              nodeId={openNodeId}
              pipeline={pipelineData}
              panelTitleId={panelTitleId}
              closeRef={panelCloseRef}
              rootRef={asideTrapRef}
              onClose={() => setOpenNodeId(null)}
            />
          </aside>
        ) : null}
      </div>

      {openNodeId != null && !isLg ? (
        <Drawer
          open
          repositionInputs={false}
          onOpenChange={(next) => {
            if (!next) setOpenNodeId(null);
          }}
        >
          <DrawerContent className="flex max-h-[min(92dvh,40rem)] min-h-[40dvh] flex-col gap-0 p-0 sm:max-h-[90dvh]">
            <PipelineStepDetailBody
              nodeId={openNodeId}
              pipeline={pipelineData}
              panelTitleId={panelTitleId}
              closeRef={sheetCloseRef}
              rootRef={sheetTrapRef}
              onClose={() => setOpenNodeId(null)}
              titleSlot={
                <>
                  <DrawerTitle className="text-foreground text-base font-semibold leading-tight">
                    {jobPipelineNodeTitle(openNodeId)}
                  </DrawerTitle>
                  <DrawerDescription className="text-muted-foreground text-xs leading-snug">
                    Full configuration for this step (includes quiz answer
                    keys).
                  </DrawerDescription>
                </>
              }
            />
          </DrawerContent>
        </Drawer>
      ) : null}
    </PipelineExpandContext.Provider>
  );
}
