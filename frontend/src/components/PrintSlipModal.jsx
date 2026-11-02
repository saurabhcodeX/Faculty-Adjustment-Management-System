import React from 'react';
import { useApp } from '../context/AppContext';
import { Printer, X, School } from 'lucide-react';

export default function PrintSlipModal({ onClose }) {
  const {
    adjustments,
    selectedDate,
    selectedDay,
    PERIODS
  } = useApp();

  const todaysAdjustments = adjustments.filter(adj => adj.date === selectedDate || adj.dayOfWeek === selectedDay);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog print-modal">
        {/* Modal Controls (Hidden in Print) */}
        <div className="modal-header no-print flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Printer size={18} className="text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-base">
              Faculty Adjustment Notice Slip
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm flex items-center gap-1.5"
            >
              <Printer size={14} />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="modal-body print-area p-8">
          {/* Institution Header */}
          <div className="print-header text-center border-b pb-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <School size={24} className="text-slate-800" />
              <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">
                Department of Computer Science & Engineering
              </h1>
            </div>
            <div className="text-xs uppercase font-medium tracking-widest text-slate-600">
              Faculty Daily Lecture Adjustment & Substitution Notice
            </div>
            <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-700 px-2">
              <span>Notice Ref: CSE/ADJ/{selectedDate.replace(/-/g, '')}</span>
              <span>Day: {selectedDay}</span>
              <span>Date: {selectedDate}</span>
            </div>
          </div>

          {/* Table */}
          {todaysAdjustments.length === 0 ? (
            <div className="p-8 text-center text-slate-500 border border-dashed rounded text-sm my-6">
              No faculty adjustments scheduled for {selectedDay}, {selectedDate}. All regular classes running normally.
            </div>
          ) : (
            <table className="print-table w-full border-collapse mb-8 text-xs">
              <thead>
                <tr className="border-y-2 border-slate-900 bg-slate-50">
                  <th className="p-2 text-left font-bold">Lecture</th>
                  <th className="p-2 text-left font-bold">Time Slot</th>
                  <th className="p-2 text-left font-bold">Class / Sem</th>
                  <th className="p-2 text-left font-bold">Subject</th>
                  <th className="p-2 text-left font-bold">Absent Faculty</th>
                  <th className="p-2 text-left font-bold">Assigned Substitute (Proxy)</th>
                  <th className="p-2 text-left font-bold">Room</th>
                </tr>
              </thead>
              <tbody>
                {todaysAdjustments.map((adj, idx) => {
                  const periodMeta = PERIODS.find(p => p.id === adj.periodId);
                  return (
                    <tr key={adj.id} className="border-b border-slate-300">
                      <td className="p-2 font-semibold">Lecture {adj.periodId}</td>
                      <td className="p-2 text-slate-600 font-mono text-[11px]">
                        {periodMeta?.time || adj.periodTime}
                      </td>
                      <td className="p-2 font-bold">{adj.classGroup}</td>
                      <td className="p-2">{adj.subject}</td>
                      <td className="p-2 text-rose-800 font-medium">{adj.originalFacultyName}</td>
                      <td className="p-2 font-bold text-slate-900 bg-slate-100/60">
                        {adj.substituteFacultyName}
                      </td>
                      <td className="p-2">{adj.room || 'Classroom'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Instructions note */}
          <div className="text-[11px] text-slate-600 border p-3 rounded mb-8 bg-slate-50/50">
            <strong>Note to Faculty & Class Representatives:</strong>
            <ul className="list-disc pl-4 mt-1 space-y-0.5">
              <li>Assigned substitute teachers are requested to engage the class as per the above schedule.</li>
              <li>Attendance of students must be recorded in the official ERP / register for the proxy session.</li>
              <li>In case of any discrepancy, please contact the HOD office immediately.</li>
            </ul>
          </div>

          {/* Signatures */}
          <div className="print-signatures flex items-end justify-between pt-8 text-xs font-semibold text-slate-800">
            <div className="text-center">
              <div className="w-36 border-t border-slate-400 mb-1"></div>
              <span>Time Table Incharge</span>
            </div>
            <div className="text-center">
              <div className="w-40 border-t border-slate-800 mb-1"></div>
              <span>Head of Department (HOD)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

