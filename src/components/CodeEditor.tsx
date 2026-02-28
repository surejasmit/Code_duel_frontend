import { useEffect, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useQueryClient } from "@tanstack/react-query";
import { useDuelStore } from "@/store/duelStore";
import { challengeKeys } from "@/hooks/useChallenges";
import { dashboardKeys } from "@/hooks/useDashboardData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

// ============================================================================
// CodeEditor — Now integrated with centralized duel state
// - Editor state (code, language) lives in Zustand duel store
// - On save/run, invalidates React Query caches for related data
// - Event listeners properly cleaned up on unmount
// ============================================================================

export default function CodeEditor() {
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState<string>("vs-dark");

  // ✅ Read/write from global Zustand store instead of local state
  const currentCode = useDuelStore((state) => state.currentCode);
  const currentLanguage = useDuelStore((state) => state.currentLanguage);
  const setCode = useDuelStore((state) => state.setCode);
  const setLanguage = useDuelStore((state) => state.setLanguage);
  const duelId = useDuelStore((state) => state.duelId);
  const addSubmission = useDuelStore((state) => state.addSubmission);

  // 🔹 Run Code — invalidate related caches after submission
  const handleRunCode = () => {
    console.log("Running code...");

    // Add submission to duel store
    addSubmission({
      id: crypto.randomUUID(),
      challengeId: duelId || "",
      userId: "",
      code: currentCode,
      language: currentLanguage,
      status: "pending",
      submittedAt: new Date().toISOString(),
    });

    // ✅ Invalidate dashboard/challenge caches so related views auto-update
    queryClient.invalidateQueries({ queryKey: dashboardKeys.stats });
    if (duelId) {
      queryClient.invalidateQueries({
        queryKey: challengeKeys.detail(duelId),
      });
    }

    alert("Run triggered!");
  };

  // 🔹 Save Code — persists to localStorage + duel store
  const handleSaveCode = () => {
    localStorage.setItem("duel-code", currentCode);
    alert("Code saved!");
  };

  // 🔹 Prevent browser default Ctrl + S (with proper cleanup)
  useEffect(() => {
    const preventSave = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", preventSave);
    // ✅ Cleanup listener on unmount — prevents memory leaks
    return () => window.removeEventListener("keydown", preventSave);
  }, []);

  // 🔹 Auto-save every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem("duel-code", currentCode);
      console.log("Auto-saved code!");
    }, 5000);
    return () => clearInterval(interval);
  }, [currentCode]);

  // 🔹 Monaco Shortcuts
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Ctrl + Enter → Run
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => {
        handleRunCode();
      }
    );

    // Ctrl + S → Save
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => {
        handleSaveCode();
      }
    );

    // Ctrl + Shift + F → Format
    editor.addCommand(
      monaco.KeyMod.CtrlCmd |
      monaco.KeyMod.Shift |
      monaco.KeyCode.KeyF,
      () => {
        editor.getAction("editor.action.formatDocument").run();
      }
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 className="text-2xl font-bold mb-4">Live Code Duel</h2>

      {/* 🔹 Shortcut Info */}
      <div style={{ fontSize: "14px", color: "gray", marginBottom: "8px" }}>
        Shortcuts: Ctrl+Enter (Run) | Ctrl+S (Save) | Ctrl+Shift+F (Format)
      </div>

      {/* 🔹 Controls: Reset + Theme */}
      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={() => setCode("// Start coding here...")}
          style={{ marginRight: "10px" }}
        >
          Reset
        </button>
        <button
          onClick={() => setTheme(theme === "vs-dark" ? "light" : "vs-dark")}
        >
          Toggle Theme
        </button>
      </div>

      {/* 🔹 Language Selector (Shadcn/UI Select) */}
      <div className="w-[180px] mb-4">
        <Select value={currentLanguage} onValueChange={setLanguage}>
          <SelectTrigger>
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div style={{ marginTop: "10px" }}>
        <Editor
          height="500px"
          language={currentLanguage}
          value={currentCode}
          theme={theme}
          onChange={(value) => setCode(value || "")}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
}