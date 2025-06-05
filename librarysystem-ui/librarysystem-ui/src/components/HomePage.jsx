import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Settings } from 'lucide-react';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg">
                        <div className="bg-blue-600 text-white p-6 rounded-t-lg text-center">
                            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                                <BookOpen size={32}/>
                                미니 도서관 관리 시스템
                            </h1>
                        </div>
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                    <div className="text-center">
                                        <Search size={48} className="mx-auto text-blue-600 mb-4"/>
                                        <h2 className="text-xl font-semibold mb-2">사용자 페이지</h2>
                                        <p className="text-gray-600 mb-4">도서 검색 및 조회</p>
                                        <button
                                            onClick={() => navigate('/search')}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            도서 검색하기
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                                    <div className="text-center">
                                        <Settings size={48} className="mx-auto text-green-600 mb-4"/>
                                        <h2 className="text-xl font-semibold mb-2">관리자 페이지</h2>
                                        <p className="text-gray-600 mb-4">도서관 관리</p>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => navigate('/admin')}
                                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                관리자 로그인
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;