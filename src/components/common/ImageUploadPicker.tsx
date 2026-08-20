import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Plus, Check } from 'lucide-react';

interface ImageUploadPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiple?: boolean;
  values?: string[];
  onMultipleChange?: (values: string[]) => void;
  placeholder?: string;
  helpText?: string;
}

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  label,
  value,
  onChange,
  multiple = false,
  values = [],
  onMultipleChange,
  placeholder = 'https://...',
  helpText,
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress & resize image to safe Data URL (max width/height 1200px, 0.85 quality)
  const processFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (multiple && onMultipleChange) {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        try {
          const dataUrl = await processFile(files[i]);
          newImages.push(dataUrl);
        } catch (err) {
          console.error('Erro ao ler imagem:', err);
        }
      }
      const updatedList = [...values, ...newImages];
      onMultipleChange(updatedList);
      if (!value && updatedList.length > 0) {
        onChange(updatedList[0]);
      }
    } else {
      try {
        const dataUrl = await processFile(files[0]);
        onChange(dataUrl);
      } catch (err) {
        console.error('Erro ao ler imagem:', err);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    if (multiple && onMultipleChange) {
      const updatedList = [...values, urlInput.trim()];
      onMultipleChange(updatedList);
      if (!value) onChange(urlInput.trim());
      setUrlInput('');
    } else {
      onChange(urlInput.trim());
      setUrlInput('');
    }
  };

  const handleRemoveItem = (index: number) => {
    if (multiple && onMultipleChange) {
      const updatedList = values.filter((_, i) => i !== index);
      onMultipleChange(updatedList);
      if (updatedList.length > 0) {
        onChange(updatedList[0]);
      } else {
        onChange('');
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider">
          {label}
        </label>
        <div className="flex items-center gap-1 bg-[#F5F2ED] p-0.5 rounded-lg border border-[#EAE4DD] text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
              mode === 'upload' ? 'bg-white text-[#2D2926] shadow-xs' : 'text-[#7D756D] hover:text-[#2D2926]'
            }`}
          >
            Galeria do Celular
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
              mode === 'url' ? 'bg-white text-[#2D2926] shadow-xs' : 'text-[#7D756D] hover:text-[#2D2926]'
            }`}
          >
            Link URL
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileChange}
            className="hidden"
            id={`file-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <label
            htmlFor={`file-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#8E5D52]/40 hover:border-[#8E5D52] bg-[#FDFBF9] hover:bg-[#F5F2ED] rounded-2xl cursor-pointer transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-[#8E5D52]/10 text-[#8E5D52] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-[#2D2926]">
              {multiple ? 'Selecionar Fotos da Galeria / Câmera' : 'Selecionar Foto da Galeria / Câmera'}
            </p>
            <p className="text-[11px] text-[#7D756D] mt-0.5">
              Toque para abrir a galeria de imagens do seu smartphone ou computador
            </p>
          </label>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="w-4 h-4 text-[#7D756D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              placeholder={placeholder}
              value={multiple ? urlInput : value}
              onChange={(e) => {
                if (multiple) {
                  setUrlInput(e.target.value);
                } else {
                  onChange(e.target.value);
                }
              }}
              className="w-full pl-9 pr-3 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
            />
          </div>
          {multiple && (
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-3.5 py-2.5 bg-[#8E5D52] text-white rounded-xl text-xs font-bold hover:bg-[#784D43] transition-colors flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          )}
        </div>
      )}

      {/* Previews */}
      {multiple ? (
        values.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-[#7D756D] block">
              Fotos Selecionadas para o Slide ({values.length}):
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {values.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-[#EAE4DD] bg-[#F5F2ED]">
                  <img
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-[#2D2926]/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Capa
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                    title="Remover foto"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        value && (
          <div className="relative inline-block mt-2 rounded-2xl overflow-hidden border border-[#EAE4DD] bg-[#F5F2ED] shadow-xs">
            <img
              src={value}
              alt="Prévia"
              referrerPolicy="no-referrer"
              className="w-28 h-28 object-cover"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
              title="Remover foto"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )
      )}

      {helpText && <p className="text-[11px] text-[#7D756D]">{helpText}</p>}
    </div>
  );
};
