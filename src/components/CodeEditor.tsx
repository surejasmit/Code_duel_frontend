import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function CodeEditor() {
  const [code, setCode] = useState<string>("// Start coding here...");
  const [language, setLanguage] = useState<string>("javascript");

  // 🔹 Run Code
  const handleRunCode = () => {
    console.log("Running code...");
    alert("Run triggered!"); // temporary demo
  };

  // 🔹 Save Code
  const handleSaveCode = () => {
    localStorage.setItem("duel-code", code);
    alert("Code saved!");
  };

  // 🔹 Prevent browser default Ctrl + S
  useEffect(() => {
    const preventSave = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", preventSave);
    return () => window.removeEventListener("keydown", preventSave);
  }, []);

  // 🔹 Monaco Shortcuts
  const handleEditorDidMount = (editor: any, monaco: any) => {
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

      <div className="w-[180px] mb-4">
        <Select value={language} onValueChange={setLanguage}>
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
          language={language}
          value={code}
          theme="vs-dark"
          onChange={(value) => setCode(value || "")}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
}