"use client";

import { cn } from "@/components/common/CmsShared";
import React, { useEffect, useRef } from "react";

const toolbarActions = [
  { label: "H2", command: "formatBlock", value: "h2" },
  { label: "H3", command: "formatBlock", value: "h3" },
  { label: "B", command: "bold" },
  { label: "I", command: "italic" },
  { label: "U", command: "underline" },
  { label: "Liste", command: "insertUnorderedList" },
  { label: "Numerote", command: "insertOrderedList" },
  { label: "Citation", command: "formatBlock", value: "blockquote" },
];

export default function CmsRichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const syncValue = () => {
    onChange(editorRef.current?.innerHTML || "");
  };

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    syncValue();
  };

  const addLink = () => {
    const link = window.prompt("Entrez l'URL du lien");

    if (!link) {
      return;
    }

    runCommand("createLink", link);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap gap-2 border-b border-gray-100 p-3 dark:border-gray-800">
        {toolbarActions.map((action) => (
          <button
            key={`${action.command}-${action.label}`}
            type="button"
            onClick={() => runCommand(action.command, action.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {action.label}
          </button>
        ))}
        <button
          type="button"
          onClick={addLink}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Lien
        </button>
        <button
          type="button"
          onClick={() => runCommand("unlink")}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Retirer lien
        </button>
        <button
          type="button"
          onClick={() => runCommand("removeFormat")}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Nettoyer
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncValue}
        className={cn(
          "cms-editor-content min-h-[320px] px-5 py-4 text-sm text-gray-900 outline-hidden dark:text-white/90",
          !value && "before:pointer-events-none before:text-gray-400 before:content-['Commencez_la_redaction_ici...']",
        )}
      />
    </div>
  );
}
