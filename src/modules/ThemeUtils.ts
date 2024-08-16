// src/modules/ThemeUtils.ts
import chroma from 'chroma-js';

// Function to generate a color palette
export const generatePalette = (keyColor: string): Record<number, string> => {
  const scale = chroma.scale(['#fff', keyColor, '#000']).mode('lab').colors(10);

  // Ensure we have a full palette
  const palette = {
    50: scale[0],
    100: scale[1],
    200: scale[2],
    300: scale[3],
    400: scale[4],
    500: scale[5], // Main color for the app
    600: scale[6],
    700: scale[7],
    800: scale[8],
    900: scale[9],
  };

  return palette;
};
