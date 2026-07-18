import React from 'react';

const ComplaintRow = ({ complaint, isOfficial, onStatusChange }) => {
  const { id, title, department, wardLocation, date, status, reporter } = complaint;

  const statusStyles = {
    'Pending': 'bg-red-500/10 text-red-400 border-red-500/20',
    'In Progress': 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    'Resolved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };

  return (
    <tr className="hover:bg-slate-700/20 transition-colors duration-150 border-b border-slate-700/40 text-sm">
      <td className="py-4 pl-4 font-mono text-xs text-amber-500 font-bold">
        #{id}
      </td>
      <td className="py-4 px-2 font-medium text-white max-w-xs truncate">
        {title}
      </td>
      
      {!isOfficial ? (
        <td className="py-4 px-2 text-gray-400 hidden md:table-cell">
          {department}
        </td>
      ) : (
        <td className="py-4 px-2 text-gray-400 hidden md:table-cell">
          {reporter || 'Anonymous'}
        </td>
      )}

      {isOfficial && (
        <td className="py-4 px-2 text-gray-300 font-medium">
          📍 {wardLocation || 'General Ward'}
        </td>
      )}

      <td className="py-4 px-2 text-gray-400 text-xs">
        {date}
      </td>

      <td className="py-4 pr-4 text-right">
        {isOfficial ? (
          <select
            value={status}
            onChange={(e) => onStatusChange(id, e.target.value)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-700 border text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all ${
              status === 'Pending' ? 'border-red-500/50 text-red-300' :
              status === 'In Progress' ? 'border-amber-500/50 text-amber-300' : 'border-emerald-500/50 text-emerald-300'
            }`}
          >
            <option value="Pending" className="bg-slate-800 text-red-400 font-semibold">🛑 Pending</option>
            <option value="In Progress" className="bg-slate-800 text-amber-400 font-semibold">⚙️ In Progress</option>
            <option value="Resolved" className="bg-slate-800 text-emerald-400 font-semibold">✅ Resolved</option>
          </select>
        ) : (
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyles[status] || 'bg-slate-700 text-gray-300'}`}>
            {status}
          </span>
        )}
      </td>
    </tr>
  );
};

export default ComplaintRow;