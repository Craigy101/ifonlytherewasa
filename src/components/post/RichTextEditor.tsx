"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minimal?: boolean;
  className?: string;
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      data-active={active || undefined}
      className="p-1.5 rounded hover:bg-surface-hover text-content-muted data-[active=true]:text-accent data-[active=true]:bg-surface-hover transition-colors"
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Write something...",
  minimal = false,
  className,
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: minimal ? false : { levels: [2] },
        blockquote: minimal ? false : undefined,
        bulletList: minimal ? false : undefined,
        orderedList: minimal ? false : undefined,
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "text-blue-400 underline",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm max-w-none p-4 min-h-[120px] focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (!mounted || !editor) {
    return (
      <div
        className={cn(
          "bg-surface-raised border border-surface-border rounded-lg overflow-hidden min-h-[180px] animate-pulse",
          className
        )}
      />
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  return (
    <div
      className={cn(
        "bg-surface-raised border border-surface-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-accent/50",
        className
      )}
    >
      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: var(--tw-prose-body, #666666);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
          opacity: 0.5;
        }
      `}</style>
      <div className="flex flex-wrap gap-1 p-2 border-b border-surface-border bg-surface">
        {/* Bold */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2h5a3 3 0 0 1 0 6H4z" />
            <path d="M4 8h6a3 3 0 0 1 0 6H4z" />
          </svg>
        </ToolbarButton>

        {/* Italic */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="10" y1="2" x2="6" y2="14" />
            <line x1="6" y1="2" x2="12" y2="2" />
            <line x1="4" y1="14" x2="10" y2="14" />
          </svg>
        </ToolbarButton>

        {/* Heading 2 */}
        {!minimal && (
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            title="Heading"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2v12" />
              <path d="M13 2v12" />
              <path d="M3 8h10" />
            </svg>
          </ToolbarButton>
        )}

        {/* Bullet List */}
        {!minimal && (
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="3" cy="4" r="1" fill="currentColor" />
              <circle cx="3" cy="8" r="1" fill="currentColor" />
              <circle cx="3" cy="12" r="1" fill="currentColor" />
              <line x1="7" y1="4" x2="14" y2="4" />
              <line x1="7" y1="8" x2="14" y2="8" />
              <line x1="7" y1="12" x2="14" y2="12" />
            </svg>
          </ToolbarButton>
        )}

        {/* Ordered List */}
        {!minimal && (
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Ordered List"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <text x="1" y="5" fontSize="5" fill="currentColor" stroke="none" fontFamily="monospace">1.</text>
              <text x="1" y="9" fontSize="5" fill="currentColor" stroke="none" fontFamily="monospace">2.</text>
              <text x="1" y="13" fontSize="5" fill="currentColor" stroke="none" fontFamily="monospace">3.</text>
              <line x1="7" y1="4" x2="14" y2="4" />
              <line x1="7" y1="8" x2="14" y2="8" />
              <line x1="7" y1="12" x2="14" y2="12" />
            </svg>
          </ToolbarButton>
        )}

        {/* Blockquote */}
        {!minimal && (
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Blockquote"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4v8" />
              <line x1="7" y1="5" x2="14" y2="5" />
              <line x1="7" y1="8" x2="14" y2="8" />
              <line x1="7" y1="11" x2="11" y2="11" />
            </svg>
          </ToolbarButton>
        )}

        {/* Link */}
        <ToolbarButton
          onClick={setLink}
          active={editor.isActive("link")}
          title="Link"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 9.5a3 3 0 0 0 4.24 0l2-2a3 3 0 0 0-4.24-4.24l-1 1" />
            <path d="M9.5 6.5a3 3 0 0 0-4.24 0l-2 2a3 3 0 0 0 4.24 4.24l1-1" />
          </svg>
        </ToolbarButton>

        {/* Code */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline Code"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="5,3 1,8 5,13" />
            <polyline points="11,3 15,8 11,13" />
          </svg>
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
