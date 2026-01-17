
import React, { useState } from 'react';
import { Candidate, Position } from '../types';
import { POSITIONS_LIST } from '../constants';
import { CheckCircle2, Circle } from 'lucide-react';

interface VotingFormProps {
  candidates: Candidate[];
  onVote: (selection: { [key in Position]?: string }) => void;
}

const VotingForm: React.FC<VotingFormProps> = ({ candidates, onVote }) => {
  const [selections, setSelections] = useState<{ [key in Position]?: string }>({});

  const handleSelect = (pos: Position, id: string) => {
    setSelections(prev => ({ ...prev, [pos]: id }));
  };

  const isFormComplete = POSITIONS_LIST.every(pos => selections[pos]);

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl mb-8">
        <h4 className="font-bold text-blue-800 mb-1">Hướng dẫn bầu cử</h4>
        <p className="text-sm text-blue-600">Vui lòng chọn 01 ứng cử viên duy nhất cho mỗi vị trí trong danh sách bên dưới. Khi đã hoàn tất, nhấn nút "Gửi Phiếu Bầu" ở cuối trang.</p>
      </div>

      {POSITIONS_LIST.map((pos) => (
        <div key={pos} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
            {pos}
            {selections[pos] && <span className="text-xs text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full"><CheckCircle2 size={12}/> Đã chọn</span>}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.filter(c => c.position === pos).map(c => (
              <button
                key={c.id}
                onClick={() => handleSelect(pos, c.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  selections[pos] === c.id 
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-100' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-500 truncate max-w-[150px]">{c.experience}</p>
                </div>
                <div>
                  {selections[pos] === c.id 
                    ? <CheckCircle2 className="text-blue-500" /> 
                    : <Circle className="text-slate-200" />
                  }
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-8 pb-12">
        <button
          onClick={() => onVote(selections)}
          disabled={!isFormComplete}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-[0.98] ${
            isFormComplete 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isFormComplete ? "Gửi Phiếu Bầu Ngay" : "Vui lòng chọn đủ các vị trí"}
        </button>
        <p className="text-center text-xs text-slate-400 mt-4">Phiếu bầu sau khi gửi sẽ không thể chỉnh sửa.</p>
      </div>
    </div>
  );
};

export default VotingForm;
