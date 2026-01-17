
import React from 'react';
import { Candidate } from '../types';
import { Award, Heart, ScrollText } from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate }) => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all group flex flex-col">
      <div className="relative h-48">
        <img 
          src={candidate.imageUrl} 
          alt={candidate.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{candidate.position}</span>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <h4 className="text-lg font-bold text-slate-800 mb-1">{candidate.name}</h4>
        <p className="text-xs text-blue-600 font-medium mb-4 flex items-center gap-1">
          <Award size={14} /> {candidate.experience}
        </p>
        
        <div className="space-y-4 flex-1">
          <div className="flex gap-3">
            <div className="text-red-400 mt-1"><Heart size={16} /></div>
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Giới thiệu</p>
              <p className="text-sm text-slate-600 line-clamp-2">{candidate.bio}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-amber-400 mt-1"><ScrollText size={16} /></div>
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Chương trình hành động</p>
              <p className="text-sm text-slate-600 line-clamp-3 italic">"{candidate.manifesto}"</p>
            </div>
          </div>
        </div>

        <button className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
          Xem chi tiết hồ sơ
        </button>
      </div>
    </div>
  );
};

export default CandidateCard;
