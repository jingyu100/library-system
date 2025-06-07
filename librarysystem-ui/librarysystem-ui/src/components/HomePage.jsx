import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Settings } from 'lucide-react';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto px-6 py-12">
                <div className="max-w-5xl mx-auto">
                    {/* 헤더 섹션 */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500 rounded-2xl mb-6">
                            <BookOpen size={36} className="text-white"/>
                        </div>
                        <h1 className="text-4xl font-light text-slate-800 mb-4">
                            Library<span className="font-semibold text-indigo-600">Hub</span>
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            현대적이고 직관적인 도서관 관리 시스템으로 도서 검색부터 관리까지 모든 기능을 제공합니다
                        </p>
                    </div>

                    {/* 메인 카드 섹션 */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* 사용자 카드 */}
                        <div className="cursor-pointer" onClick={() => navigate('/search')}>
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 h-full">
                                <div className="flex flex-col items-center text-center space-y-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                                        <Search size={28} className="text-white"/>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-medium text-slate-800">도서 검색</h3>
                                        <p className="text-slate-600 leading-relaxed">
                                            방대한 도서 데이터베이스에서 원하는 책을 빠르게 찾아보세요.
                                            제목, 저자, 출판사별로 상세한 검색이 가능합니다.
                                        </p>
                                    </div>
                                    <div className="w-full pt-4">
                                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-2xl font-medium">
                                            검색 시작하기
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 관리자 카드 */}
                        <div className="cursor-pointer" onClick={() => navigate('/admin')}>
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 h-full">
                                <div className="flex flex-col items-center text-center space-y-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                                        <Settings size={28} className="text-white"/>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-medium text-slate-800">관리자 시스템</h3>
                                        <p className="text-slate-600 leading-relaxed">
                                            도서 관리, 사용자 관리, 대출 현황 등 도서관 운영에 필요한
                                            모든 관리 기능을 제공합니다.
                                        </p>
                                    </div>
                                    <div className="w-full pt-4">
                                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-2xl font-medium">
                                            관리자 로그인
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 하단 정보 섹션 */}
                    <div className="mt-16 grid md:grid-cols-3 gap-6">
                        <div className="text-center p-6">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <BookOpen size={24} className="text-indigo-600"/>
                            </div>
                            <h4 className="font-medium text-slate-800 mb-2">실시간 검색</h4>
                            <p className="text-sm text-slate-600">즉시 업데이트되는 도서 정보와 대출 가능 여부를 확인하세요</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Search size={24} className="text-indigo-600"/>
                            </div>
                            <h4 className="font-medium text-slate-800 mb-2">고급 필터</h4>
                            <p className="text-sm text-slate-600">다양한 조건으로 원하는 도서를 정확하게 찾을 수 있습니다</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Settings size={24} className="text-indigo-600"/>
                            </div>
                            <h4 className="font-medium text-slate-800 mb-2">통합 관리</h4>
                            <p className="text-sm text-slate-600">직관적인 인터페이스로 모든 도서관 업무를 효율적으로 처리하세요</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;