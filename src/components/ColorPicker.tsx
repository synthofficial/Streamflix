// src/components/ColorPicker.tsx
import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
    onChange: (color: string) => void;
}

const ColorPicker : React.FC<ColorPickerProps> = ({ onChange }) => {
  const [color, setColor] = useState<string>(localStorage.getItem('keyColor') || '#0078d4'); // Default key color

  const handleColorChange = (color: string) => {
    setColor(color);
    onChange(color);
  };

  return (
    <div style={{ margin: '20px' }}>
      <HexColorPicker
        color={color}
        onChange={handleColorChange}
        className='z-10'
      />
    </div>
  );
};

export default ColorPicker;
