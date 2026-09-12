import React from 'react';
import { useStore } from '../../context/StoreContext';
import { StorePalette } from '../../types';
import { Palette, Check } from 'lucide-react';

interface AiColorMatchingBarProps {
  activeMood?: string;
  onSelectMood?: (mood: any) => void;
}

export const AiColorMatchingBar: React.FC<AiColorMatchingBarProps> = () => {
  const { palette, setPalette } = useStore();

  const palettesList: {
    id: StorePalette;
    name: string;
    colors: string[];
    isPrevious?: boolean;
  }[] = [
    {
      id: 'dark-allure',
      name: 'Allure Dark',
      colors: ['#121212', '#D8A47F', '#C75C5C'],
    },
    {
      id: 'light-rose',
      name: 'Rosé & Nude (Paleta Anterior)',
      colors: ['#FAF7F5', '#9B4B5A', '#E8E1DA'],
      isPrevious: true,
    },
    {
      id: 'champagne',
      name: 'Champanhe Seda',
      colors: ['#161412', '#E2BA8B', '#FAF6F0'],
    },
    {
      id: 'rouge',
      name: 'Sensual Rouge',
      colors: ['#120A0C', '#E54868', '#FFF0F2'],
    },
  ];

  const isLight = palette === 'light-rose';

  return (
    <div
      className={`border-y py-2.5 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${
        isLight
          ? 'bg-[#F5EFEB] border-[#E8E1DA] text-[#2D2926]'
          : 'bg-[#181818] border-[#2A2A2A] text-[#F8F5F2]'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Simple & Clean Theme Label without AI slop text */}
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
              isLight
                ? 'bg-white text-[#9B4B5A] border-[#E8E1DA]'
                : 'bg-[#1F1F1F] text-[#D8A47F] border-[#2A2A2A]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
          </div>
          <div>
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'
              }`}
            >
              Paleta da Loja:
            </span>
            <span
              className={`text-xs ml-1.5 font-medium ${
                isLight ? 'text-[#666666]' : 'text-[#B0B0B0]'
              }`}
            >
              Escolha a que mais agrada você
            </span>
          </div>
        </div>

        {/* Palettes Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {palettesList.map((p) => {
            const isSelected = palette === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPalette(p.id)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? isLight
                      ? 'bg-white border-[#9B4B5A] text-[#2D2926] font-bold shadow-xs ring-1 ring-[#9B4B5A]/30'
                      : 'bg-[#2A2A2A] border-[#D8A47F] text-[#F8F5F2] font-bold shadow-xs ring-1 ring-[#D8A47F]/40'
                    : isLight
                    ? 'bg-[#FAF7F5] border-[#E8E1DA] text-[#666666] hover:bg-white'
                    : 'bg-[#141414] border-[#2A2A2A] text-[#A89F91] hover:text-[#F8F5F2] hover:border-[#3A3A3A]'
                }`}
              >
                <div className="flex items-center -space-x-1">
                  {p.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-2.5 h-2.5 rounded-full border border-black/40 shrink-0"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <span className="whitespace-nowrap">{p.name}</span>
                {isSelected && (
                  <Check
                    className={`w-3 h-3 ${
                      isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
