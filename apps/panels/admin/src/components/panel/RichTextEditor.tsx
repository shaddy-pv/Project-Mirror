import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Code, Italic, Link2, List, ListOrdered, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content: value,
    editorProps: {
      attributes: {
        class: "tiptap-body min-h-64 px-4 py-3 text-sm",
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  if (!editor) {
    return <div className="min-h-64 rounded-lg border bg-card" />;
  }

  const tools = [
    { icon: Bold, label: "Bold", run: () => editor.chain().focus().toggleBold().run() },
    { icon: Italic, label: "Italic", run: () => editor.chain().focus().toggleItalic().run() },
    { icon: List, label: "Bullet list", run: () => editor.chain().focus().toggleBulletList().run() },
    {
      icon: ListOrdered,
      label: "Numbered list",
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    { icon: Quote, label: "Quote", run: () => editor.chain().focus().toggleBlockquote().run() },
    { icon: Code, label: "Code block", run: () => editor.chain().focus().toggleCodeBlock().run() },
    {
      icon: Link2,
      label: "Add link",
      run: () => {
        const url = window.prompt("Paste the web address to link to");
        if (url) editor.chain().focus().setLink({ href: url }).run();
      },
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-1.5">
        {tools.map((t) => (
          <Button
            key={t.label}
            type="button"
            variant="ghost"
            size="sm"
            aria-label={t.label}
            title={t.label}
            onClick={t.run}
          >
            <t.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
