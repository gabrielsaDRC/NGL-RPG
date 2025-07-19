import React, { useEffect, useRef } from 'react';

interface FatigueGaugeProps {
  value: number;
  maxValue?: number;
}

export const FatigueGauge: React.FC<FatigueGaugeProps> = ({ 
  value,
  maxValue = 120
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGauge = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;

    // Draw outer circle with runes
    const runeCount = 8;
    for (let i = 0; i < runeCount; i++) {
      const angle = (i / runeCount) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * (radius * 1.3);
      const y = centerY + Math.sin(angle) * (radius * 1.3);
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2);
      
      // Draw rune symbol
      ctx.beginPath();
      ctx.moveTo(-5, -10);
      ctx.lineTo(5, -10);
      ctx.lineTo(0, 10);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(0, 255, 225, 0.3)';
      ctx.stroke();
      
      ctx.restore();
    }

    // Draw magical circles
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * (0.8 + i * 0.2), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 255, 225, ${0.1 + i * 0.1})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw background circle with magical pattern
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 255, 225, 0.2)';
    ctx.lineWidth = 15;
    ctx.stroke();

    // Draw magical pattern inside the circle
    const patternCount = 12;
    for (let i = 0; i < patternCount; i++) {
      const angle = (i / patternCount) * Math.PI * 2;
      const innerRadius = radius * 0.7;
      
      ctx.beginPath();
      ctx.moveTo(
        centerX + Math.cos(angle) * innerRadius,
        centerY + Math.sin(angle) * innerRadius
      );
      ctx.lineTo(
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius
      );
      ctx.strokeStyle = 'rgba(0, 255, 225, 0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw value arc
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * (value / maxValue));
    
    // Create gradient for value arc
    const gradient = ctx.createLinearGradient(
      centerX - radius,
      centerY,
      centerX + radius,
      centerY
    );

    // Color gradient based on value
    if (value >= 120) {
      gradient.addColorStop(0, '#ff0000');
      gradient.addColorStop(1, '#ff3300');
    } else if (value >= 100) {
      gradient.addColorStop(0, '#ff3300');
      gradient.addColorStop(1, '#ff6600');
    } else if (value >= 75) {
      gradient.addColorStop(0, '#ff6600');
      gradient.addColorStop(1, '#ffcc00');
    } else if (value >= 50) {
      gradient.addColorStop(0, '#ffcc00');
      gradient.addColorStop(1, '#ffff00');
    } else {
      gradient.addColorStop(0, '#00ff88');
      gradient.addColorStop(1, '#00ffe1');
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.strokeStyle = gradient;
    ctx.stroke();

    // Draw magical glow effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(0, 255, 225, 0.3)';
    ctx.lineWidth = 20;
    ctx.filter = 'blur(8px)';
    ctx.stroke();
    ctx.filter = 'none';

    // Draw tick marks with magical symbols
    for (let i = 0; i <= maxValue; i += 20) {
      const tickAngle = startAngle + ((Math.PI * 2) * (i / maxValue));
      const isMajor = i % 40 === 0;
      const innerRadius = radius * (isMajor ? 0.85 : 0.9);
      const outerRadius = radius * 1.15;

      // Draw tick line
      ctx.beginPath();
      ctx.moveTo(
        centerX + Math.cos(tickAngle) * innerRadius,
        centerY + Math.sin(tickAngle) * innerRadius
      );
      ctx.lineTo(
        centerX + Math.cos(tickAngle) * outerRadius,
        centerY + Math.sin(tickAngle) * outerRadius
      );
      ctx.strokeStyle = `rgba(0, 255, 225, ${isMajor ? 0.8 : 0.4})`;
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.stroke();

      // Draw label for major ticks
      if (isMajor) {
        const labelRadius = radius * 1.25;
        const x = centerX + Math.cos(tickAngle) * labelRadius;
        const y = centerY + Math.sin(tickAngle) * labelRadius;
        
        ctx.fillStyle = 'rgba(0, 255, 225, 0.8)';
        ctx.font = '12px "Arial"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i.toString(), x, y);
      }
    }

    // Draw center value with magical effect
    ctx.save();
    ctx.shadowColor = 'rgba(0, 255, 225, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#00ffe1';
    ctx.font = 'bold 32px "Arial"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value.toString(), centerX, centerY - 15);

    ctx.font = '16px "Arial"';
    ctx.fillText('FADIGA', centerX, centerY + 15);
    ctx.restore();

    // Draw status text
    let statusText = '';
    let statusColor = '';
    if (value >= 120) {
      statusText = 'DESMAIADO';
      statusColor = '#ff0000';
    } else if (value >= 100) {
      statusText = 'EXAUSTO';
      statusColor = '#ff3300';
    } else if (value >= 75) {
      statusText = 'MUITO CANSADO';
      statusColor = '#ff6600';
    } else if (value >= 50) {
      statusText = 'CANSADO';
      statusColor = '#ffcc00';
    } else {
      statusText = 'DESCANSADO';
      statusColor = '#00ff88';
    }

    ctx.fillStyle = statusColor;
    ctx.font = '14px "Arial"';
    ctx.textAlign = 'center';
    ctx.fillText(statusText, centerX, centerY + 40);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const size = 300;
    canvas.width = size;
    canvas.height = size;

    // Draw gauge
    drawGauge(ctx, size, size);
  }, [value]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full max-w-[300px] h-auto mx-auto"
    />
  );
};