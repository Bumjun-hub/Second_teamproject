import React, { createContext, useContext, useEffect, useState } from 'react';
import { checkAuthStatus, refreshToken } from './authUtils';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // 인증 상태 확인 함수
    const checkAuth = async () => {
        try {
            const authResult = await checkAuthStatus();
            if (authResult.isAuthenticated) {
                setUser(authResult.user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('인증 상태 확인 오류:', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    // 토큰 자동 갱신 설정
    useEffect(() => {
        // 초기 인증 상태 확인
        checkAuth();

        // 주기적으로 토큰 갱신 (예: 13분마다) - Access Token 만료 전에 미리 갱신
        const tokenRefreshInterval = setInterval(async () => {
            // 현재 상태를 다시 체크해서 로그인된 상태인지 확인
            const currentAuthResult = await checkAuthStatus();
            if (currentAuthResult.isAuthenticated) {
                console.log('토큰 자동 갱신 시도...');
                const refreshResult = await refreshToken();
                if (!refreshResult) {
                    // 토큰 갱신 실패 시 로그아웃 처리
                    console.log('토큰 갱신 실패 - 자동 로그아웃');
                    setUser(null);
                    setIsAuthenticated(false);
                    alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
                    window.location.href = '/login';
                }
            }
        }, 13 * 60 * 1000); // 13분 (15분 만료 전에 미리 갱신)

        // 브라우저 focus 시 토큰 상태 확인
        const handleFocus = async () => {
            await checkAuth();
        };

        window.addEventListener('focus', handleFocus);

        // 인증 상태 변경 이벤트 리스너
        const handleAuthChange = () => {
            checkAuth();
        };

        window.addEventListener('authChange', handleAuthChange);

        return () => {
            clearInterval(tokenRefreshInterval);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('authChange', handleAuthChange);
        };
    }, []); // 빈 의존성 배열로 변경 - 한 번만 실행

    // 로그인 함수
    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // 상태 업데이트 전에 잠시 대기
                await new Promise(resolve => setTimeout(resolve, 100));
                await checkAuth(); // 로그인 후 사용자 정보 다시 가져오기
                return { success: true, message: '로그인 성공' };
            } else {
                return { success: false, message: data.message || '로그인에 실패했습니다.' };
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            return { success: false, message: '서버 연결에 실패했습니다.' };
        }
    };

    // 로그아웃 함수
    const logout = async () => {
        try {
            // 서버에 로그아웃 요청
            await fetch('http://localhost:8080/api/logout', {
                method: 'POST',
                credentials: 'include',
            });
            console.log('서버 로그아웃 완료');
        } catch (error) {
            console.error('로그아웃 API 오류:', error);
        } finally {
            // 클라이언트 상태 정리
            setUser(null);
            setIsAuthenticated(false);
            console.log('클라이언트 로그아웃 완료');
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};