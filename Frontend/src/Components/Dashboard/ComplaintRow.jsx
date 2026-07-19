import React from 'react';

export default function ComplaintRow({ ward, total, resolved, pending, escalated, avgDays, responsiveness, onRowClick }) {
  const getStatusColors = (pct) => {
    if (pct >= 70) return { text: 'text-[--color-success]', bg: 'var(--color-success)' };
    if (pct >= 50) return { text: 'text-[--color-warning]', bg: 'var(--color-warning)' };
    return { text: 'text-[--color-danger]', bg: 'var(--color-danger)' };
  };

  const status = getStatusColors(responsiveness);

  return (
    <tr 
      onClick={() => onRowClick && onRowClick(ward)}
      className="border-b border-[--color-border] hover:bg-[--color-card] transition-colors cursor-pointer text-sm font-medium"
    >
      <td className="py-4 pl-4 text-[--color-foreground] font-bold">{ward}</td>
      <td className="py-4 text-[--color-secondary-foreground] font-mono">{total}</td>
      <td className="py-4 text-[--color-success] font-mono">{resolved}</td>
      <td className="py-4 text-[--color-warning] font-mono">{pending}</td>
      <td className="py-4 text-[--color-danger] font-mono">{escalated}</td>
      <td className="py-4 text-[--color-secondary-foreground] font-mono">{avgDays}d</td>
      <td className="py-4 pr-4 w-1/4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[--color-muted]">
            <div 
              className="h-full rounded-full transition-all duration-500" 
              style={{ 
                width: `${responsiveness}%`, 
                backgroundColor: status.bg,
                boxShadow: `0 0 8px ${status.bg}66`
              }} 
            />
          </div>
          <span className={`font-mono text-xs font-semibold min-w-[28px] text-right ${status.text}`}>
            {responsiveness}%
          </span>
        </div>
      </td>
    </tr>
  );
}