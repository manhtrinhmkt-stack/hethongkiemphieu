
import React from 'react';

interface HeaderProps {
  activeTab: string;
  voterId: string;
}

const Header: React.FC<HeaderProps> = ({ activeTab, voterId }) => {
  const getTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Bảng Điều Khiển Live';
      case 'tally': return 'Kiểm Phiếu Trực Tiếp';
      case 'admin': return 'Cấu Hình Hệ Thống';
      default: return 'Trang Chủ';
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-6 sticky top-0 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{getTitle()}</h2>
        <p className="text-sm text-slate-400 font-medium italic">Phiên làm việc của: <span className="text-blue-600 font-bold">{voterId}</span></p>
      </div>
      <div className="flex items-center gap-4">
        <div className="bg-green-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-100">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
          <span className="text-xs font-black text-green-700 uppercase tracking-widest">Máy chủ sẵn sàng</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
