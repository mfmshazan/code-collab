"use client";
import { useState } from "react";
import { challenges, Challenge, Difficulty } from "@/lib/challenges";
import { ChevronRight, BookOpen, Lightbulb, Code2, Star } from "lucide-react";

interface ChallengesPanelProps {
  language: "javascript" | "java" | string;
  onSelectChallenge: (code: string) => void;
}

const difficultyColors: Record<Difficulty, { bg: string; text: string; dot: string }> = {
  Easy:   { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  Medium: { bg: "bg-amber-500/10",   text: "text-amber-400",   dot: "bg-amber-400" },
  Hard:   { bg: "bg-rose-500/10",    text: "text-rose-400",    dot: "bg-rose-400" },
};

export default function ChallengesPanel({
  language,
  onSelectChallenge,
}: ChallengesPanelProps) {
  const [selected, setSelected] = useState<Challenge | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [filter, setFilter] = useState<Difficulty | "All">("All");
  const [loaded, setLoaded] = useState<string | null>(null);

  const lang = (language === "javascript" || language === "java")
    ? language
    : "javascript";

  const filtered =
    filter === "All"
      ? challenges
      : challenges.filter((c) => c.difficulty === filter);

  function handleLoad(challenge: Challenge) {
    const code = challenge.starterCode[lang];
    onSelectChallenge(code);
    setLoaded(challenge.id);
    setTimeout(() => setLoaded(null), 2000);
  }

  return (
    <div className="flex flex-col h-full text-[#cccccc]">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#3e3e42]">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            Practice Challenges
          </span>
        </div>

        {/* Language badge */}
        <div className="flex items-center gap-1.5 mb-2">
          <Code2 className="w-3 h-3 text-gray-500" />
          <span className="text-xs text-gray-500">Language:</span>
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              lang === "java"
                ? "bg-orange-500/20 text-orange-300"
                : "bg-yellow-500/20 text-yellow-300"
            }`}
          >
            {lang === "java" ? "☕ Java" : "⚡ JavaScript"}
          </span>
        </div>

        {/* Difficulty filter */}
        <div className="flex gap-1">
          {(["All", "Easy", "Medium", "Hard"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`text-[10px] px-1.5 py-0.5 rounded transition-all ${
                filter === d
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:text-gray-300 hover:bg-[#3e3e42]"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge list */}
      <div className="flex-1 overflow-y-auto">
        {!selected ? (
          <ul className="py-1">
            {filtered.map((c) => {
              const dc = difficultyColors[c.difficulty];
              return (
                <li key={c.id}>
                  <button
                    onClick={() => { setSelected(c); setShowHint(false); }}
                    className="w-full text-left px-3 py-2.5 hover:bg-[#2a2d2e] transition-colors border-b border-[#252526] group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-200 group-hover:text-white transition-colors font-medium">
                        {c.title}
                      </span>
                      <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${dc.dot}`} />
                      <span className={`text-[10px] ${dc.text}`}>{c.difficulty}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          /* Challenge detail */
          <div className="flex flex-col h-full">
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1 px-3 py-2 text-xs text-gray-500 hover:text-gray-300 border-b border-[#3e3e42] transition-colors"
            >
              ← Back to list
            </button>

            <div className="p-3 flex-1 overflow-y-auto">
              {/* Title + difficulty */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-sm font-bold text-white leading-tight">{selected.title}</h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                    difficultyColors[selected.difficulty].bg
                  } ${difficultyColors[selected.difficulty].text}`}
                >
                  {selected.difficulty}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                {selected.description}
              </p>

              {/* Hint toggle */}
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 mb-2 transition-colors"
              >
                <Lightbulb className="w-3 h-3" />
                {showHint ? "Hide hint" : "Show hint"}
              </button>
              {showHint && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded p-2.5 mb-4">
                  <p className="text-xs text-amber-300 leading-relaxed">
                    💡 {selected.hint}
                  </p>
                </div>
              )}

              {/* Load button */}
              <button
                onClick={() => handleLoad(selected)}
                className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-bold transition-all ${
                  loaded === selected.id
                    ? "bg-emerald-600 text-white"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
              >
                {loaded === selected.id ? (
                  <>✓ Loaded!</>
                ) : (
                  <>
                    <Star className="w-3 h-3" />
                    Load Challenge ({lang === "java" ? "Java" : "JS"})
                  </>
                )}
              </button>

              <p className="text-[10px] text-gray-600 text-center mt-2">
                This will replace the current editor code
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
