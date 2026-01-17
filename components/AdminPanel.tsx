
import React from 'react';
import { Candidate } from '../types';
import { ShieldAlert, Trash2, Download, Database } from 'lucide-react';

interface AdminPanelProps {
  votes: any[];
  candidates: Candidate[];
  onReset: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ candidates, onReset }) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
      <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
        <div className="flex items-center gap-6 mb-10">
          <div className="bg-red-100 p-4 rounded-2xl text-red-600">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">Quản Trị Hệ Thống</h3>
            <p className="text-slate-500 font-medium">Lưu ý: Các thao tác bên dưới có tác động trực tiếp đến kết quả chung.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 border-2 border-slate-50 rounded-[32px] bg-slate-50/30">
            <div className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
              <Database size={24} />
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-3">Làm mới dữ liệu</h4>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">Xóa toàn bộ số phiếu đã đếm để bắt đầu lại từ đầu. Thường dùng trước khi bắt đầu phiên kiểm chính thức.</p>
            <button 
              onClick={() => {
                if(confirm("Xác nhận ĐẶT LẠI TOÀN BỘ số phiếu về 0?")) {
                  onReset();
                }
              }}
              className="flex items-center gap-3 bg-red-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100"
            >
              <Trash2 size={20} /> Reset Về 0
            </button>
          </div>

          <div className="p-8 border-2 border-slate-50 rounded-[32px] bg-slate-50/30">
            <div className="bg-green-100 w-12 h-12 rounded-2xl flex items-center justify-center text-green-600 mb-6">
              <Download size={24} />
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-3">Kết xuất biên bản</h4>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">Tạo file báo cáo tổng hợp cuối cùng để in ấn và ký xác nhận giữa các bên liên quan.</p>
            <button 
              className="flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-slate-200"
            >
              <Download size={20} /> Xuất Báo Cáo
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-600 p-10 rounded-[40px] text-white">
        <h4 className="text-xl font-bold mb-4">Mẹo Kiểm Phiếu Nhanh</h4>
        <ul className="space-y-3 opacity-90 text-sm">
          <li className="flex gap-3"><span>•</span> Sử dụng phím (+) và (-) trên màn hình cảm ứng để tăng tốc.</li>
          <li className="flex gap-3"><span>•</span> Hệ thống tự động sao lưu dữ liệu mỗi giây, không lo mất điện.</li>
          <li className="flex gap-3"><span>•</span> Nên có 2 người cùng nhìn màn hình để đối soát chéo.</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminPanel;
