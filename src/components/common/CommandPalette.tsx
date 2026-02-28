import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCommandPalette } from "@/hooks/useCommandPalette";

type Command = {
  name: string;
  path?: string;
  action?: () => void;
};

export default function CommandPalette() {
  const { isOpen, setIsOpen } = useCommandPalette();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { name: "Go to Dashboard", path: "/dashboard" },
    { name: "Open Leaderboard", path: "/leaderboard" },
    { name: "Create Challenge", path: "/create-challenge" },
    { name: "View Profile", path: "/profile" },
    { name: "Search Challenges", path: "/challenges" },
    {
      name: "Toggle Theme",
      action: () => {
        document.documentElement.classList.toggle("dark");
      },
    },
  ];

  const filteredCommands = useMemo(() => {
    return commands.filter((cmd) =>
      cmd.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const handleSelect = (command: Command) => {
    if (command.path) {
      navigate(command.path);
    } else if (command.action) {
      command.action();
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : prev
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const command = filteredCommands[selectedIndex];
      if (command) handleSelect(command);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-32 z-50"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        {/* Command List */}
        <ul className="max-h-72 overflow-y-auto">
          {filteredCommands.length === 0 && (
            <li className="p-4 text-gray-500 text-sm">
              No results found.
            </li>
          )}

          {filteredCommands.map((command, index) => (
            <li
              key={command.name}
              onClick={() => handleSelect(command)}
              className={`px-4 py-3 cursor-pointer transition ${
                index === selectedIndex
                  ? "bg-gray-100 dark:bg-gray-800"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              {command.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}