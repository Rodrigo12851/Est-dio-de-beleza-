import React, { useState, useEffect } from 'react';
import { Sparkles, Palette, Check, Wand2 } from 'lucide-react';

export type ColorMood = 'noite' | 'rose' | 'champanhe' | 'rouge';

interface AiColorMatchingBarProps {
  activeMood?: ColorMood;
  onSelectMood?: (mood: ColorMood) => void;
  detectedAffinityText?: string;
}

export const AiColorMatchingBar: React.FC<AiColorMatchingBarProps> = ({
  activeMood,
  onSelectMood,
  detectedAffinityText = 'IA detectou afinidade com tons sofisticados & românticos',
}) => {
  const [internalMood, setInternalMood] = useState<ColorMood>(activeMood || 'noite');

  useEffect(() => {
    if (activeMood) {
      setInternalMood(activeMood);
    }
  }, [activeMood]);

  const currentMood = activeMood || internalMood;

  const handleSelect = (mood: ColorMood) => {
    setInternalMood(mood);
    if (typeof onSelectMood === 'function') {
      onSelectMood(mood);
    }
  };

  const moods: {
    id: ColorMood;
    name: string;
    description: string;
    colors: string[];
    tag: string;
  }[] = [
    {
      id: 'noite',
      name: 'Preto Noite & Ouro',
      description: 'Clássico imersivo, elegância pura e rendas profundas',
      colors: ['#121212', '#2A2A2A', '#D8A47F'],
      tag: 'Mais Desejado',
    },
    {
      id: 'rose',
      name: 'Romance Rosê Allure',
      description: 'Acentos rosados, feminilidade e acolhimento sutil',
      colors: ['#C75C5C', '#D8A47F', '#F8F5F2'],
      tag: 'Recomendação IA',
    },
    {
      id: 'champanhe',
      name: 'Champanhe & Off-White',
      description: 'Luminosidade suave, tons acetinados e seda noiva',
      colors: ['#D8A47F', '#F8F5F2', '#2A2A2A'],
      tag: 'Alta Costura',
    },
    {
      id: 'rouge',
      name: 'Sensual Rouge & Noite',
      description: 'Intensidade magnética, rubi e tule com transparência',
      colors: ['#8B1E2F', '#C75C5C', '#121212'],
      tag: 'Intimista',
    },
  ];

  return (
    <div className="bg-[#1A1A1A] border-y border-[#2A2A2A] py-3.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* IA Badge & Explanation */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#C75C5C]/20 border border-[#C75C5C]/40 flex items-center justify-center text-[#D8A47F] shrink-0">
            <Wand2 className="w-4 h-4 text-[#D8A47F]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D8A47F] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D8A47F]" />
                Allure IA • Color Matching
              </span>
              <span className="hidden sm:inline-block px-2 py-0.2 rounded-full text-[9px] font-bold bg-[#C75C5C]/20 text-[#F8F5F2] border border-[#C75C5C]/30">
                Ajuste Dinâmico
              </span>
            </div>
            <p className="text-xs text-[#E0E0E0]">
              {detectedAffinityText}
            </p>
          </div>
        </div>

        {/* Mood Selector Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {moods.map((m) => {
            const isSelected = currentMood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelect(m.id)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#2A2A2A] border-[#D8A47F] text-[#F8F5F2] shadow-sm ring-1 ring-[#D8A47F]/40'
                    : 'bg-[#141414] border-[#2A2A2A] text-[#A89F91] hover:text-[#F8F5F2] hover:border-[#3A3A3A]'
                }`}
                title={m.description}
              >
                <div className="flex items-center -space-x-1">
                  {m.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-2.5 h-2.5 rounded-full border border-black/50 shrink-0"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <span className="whitespace-nowrap">{m.name}</span>
                {isSelected && <Check className="w-3 h-3 text-[#D8A47F]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
