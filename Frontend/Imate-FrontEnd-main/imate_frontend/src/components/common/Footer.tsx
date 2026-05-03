import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-[#020617] border-t border-white/5 pt-20 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-black">
                                I
                            </div>
                            <span className="text-xl font-black text-white">IMATE</span>
                        </div>
                        <p className="text-slate-400 mb-8 max-w-sm">
                            Nâng tầm sự nghiệp IT của bạn thông qua luyện tập phỏng vấn với AI và sự dẫn dắt từ các chuyên gia hàng đầu
                            thế giới.
                        </p>
                        <div className="flex gap-4">
                            <a
                                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                                href="#"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                                </svg>
                            </a>
                            <a
                                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                                href="#"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">Khám phá</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li>
                                <a className="hover:text-indigo-500 transition-colors" href="#">
                                    Ngân hàng câu hỏi
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-indigo-500 transition-colors" href="#">
                                    Luyện tập AI
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-indigo-500 transition-colors" href="#">
                                    Mentor Hub
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-indigo-500 transition-colors" href="#">
                                    Bảng xếp hạng
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">Về chúng tôi</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li>
                                <a className="hover:text-indigo-500 transition-colors" href="#">
                                    Giới thiệu
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-indigo-500 transition-colors" href="#">
                                    Tuyển dụng
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-indigo-500 transition-colors" href="#">
                                    Liên hệ
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-indigo-500 transition-colors" href="#">
                                    Blog
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="md:col-span-2 lg:col-span-1">
                        <h4 className="text-white font-bold mb-6">Bản tin công nghệ</h4>
                        <p className="text-sm text-slate-400 mb-4">Nhận thông tin mới nhất về thị trường tuyển dụng IT.</p>
                        <div className="flex gap-2">
                            <input
                                className="bg-[#1e293b] border-white/10 rounded-xl px-4 py-2 text-sm w-full focus:ring-indigo-500 focus:border-indigo-500 text-white"
                                placeholder="Email của bạn"
                                type="email"
                            />
                            <button className="bg-indigo-500 text-white p-2 rounded-xl">
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>© 2024 IMATE. Tất cả quyền được bảo lưu.</p>
                    <div className="flex gap-6">
                        <a className="hover:text-white transition-colors" href="#">
                            Điều khoản dịch vụ
                        </a>
                        <a className="hover:text-white transition-colors" href="#">
                            Chính sách bảo mật
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;