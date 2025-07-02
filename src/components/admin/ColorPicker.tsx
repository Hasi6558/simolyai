
import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

// Predefined colors palette
const predefinedColors = [
  '#9b87f5', // Primary Purple
  '#7E69AB', // Secondary Purple
  '#E5DEFF', // Soft Purple
  '#FFDEE2', // Soft Pink
  '#FDE1D3', // Soft Peach
  '#D3E4FD', // Soft Blue
  '#F1F0FB', // Soft Gray
  '#F2FCE2', // Soft Green
  '#FEF7CD', // Soft Yellow
  '#FEC6A1', // Soft Orange
  '#8B5CF6', // Vivid Purple
  '#D946EF', // Magenta Pink
  '#F97316', // Bright Orange
  '#0EA5E9', // Ocean Blue
  '#403E43', // Charcoal Gray
  '#FFFFFF', // Pure White
  '#000000', // Black
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSelectColor = (selectedColor: string) => {
    onChange(selectedColor);
    setIsOpen(false);
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-10 p-0 border"
          style={{ backgroundColor: color }}
          title="Seleziona colore"
        >
          <Palette className="h-4 w-4 text-white drop-shadow-[0_0_1px_rgba(0,0,0,0.5)]" />
          <span className="sr-only">Seleziona colore</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-2">
          <div className="font-medium text-sm mb-2">Colori predefiniti</div>
          <div className="grid grid-cols-8 gap-1">
            {predefinedColors.map((predefinedColor, index) => (
              <button
                key={index}
                className="w-6 h-6 rounded-md border border-gray-200 shadow-sm"
                style={{ backgroundColor: predefinedColor }}
                onClick={() => handleSelectColor(predefinedColor)}
                title={predefinedColor}
              />
            ))}
          </div>
          <div className="pt-2">
            <label htmlFor="custom-color" className="font-medium text-sm">
              Colore personalizzato
            </label>
            <div className="flex mt-1">
              <input
                id="custom-color"
                type="color"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-8"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
