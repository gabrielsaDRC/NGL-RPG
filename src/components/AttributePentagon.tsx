import React, { useEffect, useRef } from 'react';
import { AttributeBonus } from '../types/character';

interface AttributePentagonProps {
  attributes: {
    str: number;
    vit: number;
    agi: number;
    int: number;
    sense: number;
  };
  bonus: AttributeBonus;
}

export const AttributePentagon: React.FC<AttributePentagonProps> = ({ attributes, bonus }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const calculateMaxValue = () => {
    let maxTotal = 0;
    Object.entries(attributes).forEach(([attr, value]) => {
      const total = value + bonus[attr as keyof typeof bonus];
      maxTotal = Math.max(maxTotal, total);
    });
    // Round up to nearest multiple of 5 for clean grid lines
    return Math.ceil(maxTotal / 5) * 5;
  };

  const drawPentagon = (ctx: CanvasRenderingContext2D, size: number) => {
    const center = size / 2;
    const radius = (size / 2) * 0.8; // 80% of half size for padding
    
    // Calculate pentagon angles (72° or 2π/5 between each point)
    const angles = {
      str: -Math.PI / 2,                    // Top (270°)
      int: -Math.PI / 2 + (2 * Math.PI) / 5,  // Top Right (342°)
      agi: -Math.PI / 2 + (4 * Math.PI) / 5,  // Bottom Right (54°)
      sense: -Math.PI / 2 + (6 * Math.PI) / 5, // Bottom Left (126°)
      vit: -Math.PI / 2 + (8 * Math.PI) / 5,  // Top Left (198°)
    };

    const maxValue = calculateMaxValue();
    const gridLevels = 5;

    // Draw background grid
    for (let i = gridLevels; i > 0; i--) {
      const factor = i / gridLevels;
      ctx.beginPath();
      Object.values(angles).forEach((angle, index) => {
        const x = center + Math.cos(angle) * radius * factor;
        const y = center + Math.sin(angle) * radius * factor;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.strokeStyle = `rgba(0, 255, 225, ${0.1 + (1 - factor) * 0.1})`;
      ctx.stroke();

      // Draw grid value at each level
      const gridValue = Math.floor((i / gridLevels) * maxValue);
      const labelX = center;
      const labelY = center - radius * factor - 5;
      ctx.fillStyle = 'rgba(0, 255, 225, 0.5)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(gridValue), labelX, labelY);
    }

    // Draw attribute lines
    Object.entries(angles).forEach(([attr, angle]) => {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(
        center + Math.cos(angle) * radius,
        center + Math.sin(angle) * radius
      );
      ctx.strokeStyle = 'rgba(0, 255, 225, 0.2)';
      ctx.stroke();

      // Draw attribute labels
      const labelRadius = radius + 20;
      const x = center + Math.cos(angle) * labelRadius;
      const y = center + Math.sin(angle) * labelRadius;
      ctx.fillStyle = '#00ffe1';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(attr.toUpperCase(), x, y);
    });

    // Draw attribute shape
    ctx.beginPath();
    Object.entries(angles).forEach(([attr, angle], index) => {
      const value = attributes[attr as keyof typeof attributes];
      const bonusValue = bonus[attr as keyof typeof bonus];
      const total = value + bonusValue;
      const factor = total / maxValue; // Scale based on max value
      const x = center + Math.cos(angle) * radius * factor;
      const y = center + Math.sin(angle) * radius * factor;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 255, 225, 0.1)';
    ctx.fill();
    ctx.strokeStyle = '#00ffe1';
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const size = 300; // Adjusted size to match attributes section
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw pentagon
    drawPentagon(ctx, size);
  }, [attributes, bonus]);

  return (
    <div className="w-full max-w-[300px]">
      <canvas
        ref={canvasRef}
        className="w-full h-auto"
      />
    </div>
  );
};