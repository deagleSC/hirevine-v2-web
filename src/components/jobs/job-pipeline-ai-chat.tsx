"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import {
  Tool,
  ToolContent,
  ToolHeader,
  type ToolPart,
} from "@/components/ai-elements/tool";
import {
  AssistantReasoningBlock,
  PipelinePatchToolInputSummary,
  PipelinePatchToolResultSummary,
} from "@/components/jobs/job-pipeline-patch-tool-ui";
import { API_BASE_URL, API_ROUTES } from "@/lib/configs/api";
import { cn } from "@/lib/utils";
import type { JobPipeline } from "@/lib/validations/job-pipeline.schema";
import { parseJobPipeline } from "@/lib/validations/job-pipeline.schema";
import { ExternalLinkIcon } from "lucide-react";

/** UI part for server tool `apply_pipeline_patch` (not in default `UIMessage` tool map). */
type ApplyPipelinePatchToolPart = {
  type: "tool-apply_pipeline_patch";
  toolCallId: string;
  state: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

function extractPipelineFromAssistantMessage(
  message: UIMessage,
): JobPipeline | null {
  for (const part of message.parts) {
    if (part.type !== "tool-apply_pipeline_patch") continue;
    if (part.state !== "output-available") continue;
    const out = part.output as { ok?: boolean; pipeline?: unknown };
    if (!out?.ok || out.pipeline === undefined) continue;
    const parsed = parseJobPipeline(out.pipeline);
    if (parsed.success) return parsed.data;
  }
  return null;
}

function renderMessageParts(message: UIMessage) {
  return message.parts.map((part, i) => {
    if (part.type === "text") {
      return <MessageResponse key={`t-${i}`}>{part.text}</MessageResponse>;
    }
    if (part.type === "reasoning") {
      return (
        <AssistantReasoningBlock
          key={`reasoning-${i}`}
          text={part.text}
          className="max-w-full"
        />
      );
    }
    if (part.type === "source-url") {
      return (
        <a
          key={`src-${part.sourceId}-${i}`}
          href={part.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary inline-flex max-w-full items-center gap-1.5 break-all text-xs underline-offset-2 hover:underline"
        >
          <ExternalLinkIcon className="size-3.5 shrink-0" />
          {part.title?.trim() || part.url}
        </a>
      );
    }
    if (part.type === "source-document") {
      return (
        <p
          key={`doc-${part.sourceId}-${i}`}
          className="text-muted-foreground max-w-full text-xs"
        >
          Document: <span className="text-foreground">{part.title}</span>
          {part.filename ? (
            <span className="text-muted-foreground"> ({part.filename})</span>
          ) : null}
        </p>
      );
    }
    if (part.type === "file") {
      return (
        <a
          key={`file-${i}`}
          href={part.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary inline-flex max-w-full items-center gap-1.5 text-xs underline-offset-2 hover:underline"
        >
          <ExternalLinkIcon className="size-3.5 shrink-0" />
          {part.filename?.trim() || part.mediaType || "Attachment"}
        </a>
      );
    }
    if (part.type === "tool-apply_pipeline_patch") {
      const tp = part as ApplyPipelinePatchToolPart;
      const st = tp.state;
      const errText = st === "output-error" ? tp.errorText : undefined;
      const out = st === "output-available" ? tp.output : undefined;
      const patchSucceeded =
        st === "output-available" &&
        out &&
        typeof out === "object" &&
        (out as { ok?: boolean }).ok === true;
      return (
        <Tool
          key={`tool-${tp.toolCallId}-${i}`}
          className="w-full max-w-full"
          defaultOpen={!patchSucceeded}
        >
          <ToolHeader
            title="Update hiring pipeline"
            type="tool-apply_pipeline_patch"
            state={st as ToolPart["state"]}
          />
          <ToolContent className="space-y-4">
            <div>
              <h4 className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                What changed
              </h4>
              <PipelinePatchToolInputSummary input={tp.input} />
            </div>
            <PipelinePatchToolResultSummary output={out} errorText={errText} />
          </ToolContent>
        </Tool>
      );
    }
    if (part.type === "step-start") return null;
    return null;
  });
}

export function JobPipelineAiChat({
  jobId,
  onPipelineUpdated,
}: {
  jobId: string;
  onPipelineUpdated?: (pipeline: JobPipeline) => void;
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${API_BASE_URL}${API_ROUTES.JOBS.PIPELINE_CHAT(jobId)}`,
        credentials: "include",
      }),
    [jobId],
  );

  const onFinish = useCallback(
    ({ message }: { message: UIMessage }) => {
      const next = extractPipelineFromAssistantMessage(message);
      if (next) {
        onPipelineUpdated?.(next);
        toast.success("Pipeline updated from assistant");
      }
    },
    [onPipelineUpdated],
  );

  const { messages, sendMessage, status, error, clearError, stop } = useChat({
    transport,
    onFinish,
  });

  const busy = status === "submitted" || status === "streaming";

  return (
    <div
      className={cn(
        "bg-card text-card-foreground flex min-h-0 w-full min-w-0 max-w-full flex-col overflow-hidden rounded-xl shadow-sm",
        /* Stacked / tablet: definite height so the thread scrolls inside, not the page. */
        "h-[min(26rem,56dvh)] max-h-[min(40rem,78dvh)]",
        "sm:h-[min(28rem,58dvh)] sm:max-h-[min(42rem,80dvh)]",
        "lg:h-[min(32rem,68dvh)] lg:max-h-[min(46rem,84dvh)]",
        /* xl sidebar: grow inside flex wrapper; min-h-0 so parents can shrink below content and messages scroll inside */
        "xl:h-auto xl:min-h-0 xl:flex-1 xl:max-h-full",
      )}
    >
      <Conversation className="relative min-h-0 flex-1 overflow-hidden">
        <ConversationContent className="gap-3 px-2 py-2 pb-2 sm:gap-4 sm:px-3 sm:py-3">
          {messages.length === 0 ? (
            <ConversationEmptyState
              className="min-h-0 px-2 py-6 sm:py-8"
              title="Pipeline assistant"
              description='Describe changes in plain language. The assistant updates resume screening, quiz, or hiring summary via tools (no add/remove of stages). Examples: "Add this question to the quiz node: …", "Adjust weights in hiring summary as follows: …"'
            />
          ) : null}
          {messages
            .filter((m) => m.role !== "system")
            .map((m) => (
              <Message
                key={m.id}
                className="max-w-full sm:max-w-[min(100%,36rem)]"
                from={m.role}
              >
                <MessageContent className="max-w-full">
                  {renderMessageParts(m)}
                </MessageContent>
              </Message>
            ))}
        </ConversationContent>
        <ConversationScrollButton className="bottom-3" />
      </Conversation>
      {error ? (
        <div
          className="border-destructive/40 bg-destructive/10 text-destructive max-h-24 shrink-0 overflow-y-auto border-t px-3 py-2.5 text-xs leading-snug"
          role="alert"
        >
          <span>{error.message}</span>{" "}
          <button
            type="button"
            className="underline"
            onClick={() => clearError()}
          >
            Dismiss
          </button>
        </div>
      ) : null}
      <div className="border-border bg-muted/15 shrink-0 border-t px-2 pt-2 pb-3 sm:px-3 sm:pb-3">
        <PromptInput
          className={cn(
            "border-0 shadow-none",
            /* Force column + full-width textarea (avoid row + intrinsic-width collapse) */
            "[&_[data-slot=input-group]]:flex [&_[data-slot=input-group]]:h-auto [&_[data-slot=input-group]]:min-h-0 [&_[data-slot=input-group]]:w-full [&_[data-slot=input-group]]:flex-col [&_[data-slot=input-group]]:items-stretch [&_[data-slot=input-group]]:rounded-lg",
          )}
          onSubmit={async (msg) => {
            const text = msg.text.trim();
            if (!text) return;
            await sendMessage({ text });
          }}
        >
          <PromptInputBody>
            <PromptInputTextarea
              disabled={busy}
              placeholder="Ask to change rubric, quiz questions, or hiring summary…"
              className="min-h-[5.25rem] max-h-[11rem] w-full min-w-0 self-stretch sm:min-h-[5.5rem] sm:max-h-[12rem]"
            />
            <PromptInputFooter className="justify-end pt-1">
              <PromptInputSubmit status={status} onStop={() => void stop()} />
            </PromptInputFooter>
          </PromptInputBody>
        </PromptInput>
      </div>
    </div>
  );
}
