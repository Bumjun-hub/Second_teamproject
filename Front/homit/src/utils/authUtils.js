/**
 * 로그아웃 함수
 */
export const logout = async () => {
    try {
        const response = await fetch('http://localhost:8080/api/logout', {
            method: 'POST',
            credentials: 'include', // 쿠키 포함
        });

        if (response.ok) {
            // 로그아웃 성공 시 홈페이지로 리다이렉트
            window.location.href = '/';
            return true;
        } else {
            console.error('로그아웃 실패');
            return false;
        }
    } catch (error) {
        console.error('로그아웃 오류:', error);
        return false;
    }
};

/**
 * 인증이 필요한 API 요청을 위한 fetch 래퍼
 */
export const authenticatedFetch = async (url, options = {}) => {
    const defaultOptions = {
        credentials: 'include', // 쿠키 자동 포함
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, defaultOptions);

        // 401 Unauthorized인 경우 토큰 갱신 시도
        if (response.status === 401) {
            const refreshResult = await refreshToken();
            
            if (refreshResult) {
                // 토큰 갱신 성공 시 원래 요청 재시도
                return await fetch(url, defaultOptions);
            } else {
                // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
                window.location.href = '/login';
                throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
            }
        }

        return response;
    } catch (error) {
        console.error('API 요청 오류:', error);
        throw error;
    }
};

/**
 * 토큰 갱신 함수 (에러 처리 강화)
 */
export const refreshToken = async () => {
    try {
        console.log('🔄 refreshToken 함수 시작');
        
        const response = await fetch('http://localhost:8080/api/refresh', {
            method: 'POST',
            credentials: 'include',
        });

        console.log('🔄 refreshToken 응답:', response.status);

        if (response.ok) {
            console.log('✅ refreshToken 성공');
            return true;
        } else {
            const errorText = await response.text();
            console.log('❌ refreshToken 실패:', response.status, errorText);
            return false;
        }
    } catch (error) {
        console.error('💥 refreshToken 오류:', error);
        return false;
    }
};

/**
 * 사용자 인증 상태 확인 함수
 * 보호된 엔드포인트를 호출해서 인증 상태를 확인
 */
export const checkAuthStatus = async () => {
    try {
        console.log('🔍 checkAuthStatus 시작');
        
        // ✅ 일반 fetch 사용 (authenticatedFetch 사용 안함)
        const response = await fetch('http://localhost:8080/api/mypage', {
            method: 'GET',
            credentials: 'include',
        });

        console.log('🔍 checkAuthStatus 응답:', response.status);

        if (response.ok) {
            const userData = await response.json();
            console.log('✅ checkAuthStatus 성공');
            return { isAuthenticated: true, user: userData };
        } else if (response.status === 401) {
            console.log('🔄 checkAuthStatus - 401 에러, 토큰 갱신 시도');
            
            // 토큰 갱신 시도
            const refreshResult = await refreshToken();
            console.log('🔄 checkAuthStatus - 토큰 갱신 결과:', refreshResult);
            
            if (refreshResult) {
                // 재시도 (여전히 일반 fetch 사용)
                const retryResponse = await fetch('http://localhost:8080/api/mypage', {
                    method: 'GET',
                    credentials: 'include',
                });
                
                console.log('🔄 checkAuthStatus - 재시도 응답:', retryResponse.status);
                
                if (retryResponse.ok) {
                    const userData = await retryResponse.json();
                    console.log('✅ checkAuthStatus 재시도 성공');
                    return { isAuthenticated: true, user: userData };
                }
            }
            console.log('❌ checkAuthStatus - 토큰 갱신 실패');
            return { isAuthenticated: false, user: null };
        }
        
        console.log('❌ checkAuthStatus - 기타 오류');
        return { isAuthenticated: false, user: null };
    } catch (error) {
        console.error('💥 checkAuthStatus 오류:', error);
        return { isAuthenticated: false, user: null };
    }
};

/**
 * 비밀번호 변경 함수
 */
export const changePassword = async (currentPassword, newPassword) => {
    try {
        const response = await authenticatedFetch('http://localhost:8080/api/changedPwd', {
            method: 'PUT',
            body: JSON.stringify({
                currentPassword,
                newPassword
            }),
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, message: data.message };
        } else {
            return { success: false, message: data.message || '비밀번호 변경에 실패했습니다.' };
        }
    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        return { success: false, message: '서버 연결에 실패했습니다.' };
    }
};

/**
 * 계정 삭제 함수
 */
export const deleteAccount = async () => {
    try {
        const response = await authenticatedFetch('http://localhost:8080/api/deletion', {
            method: 'DELETE',
        });

        if (response.ok) {
            // 계정 삭제 성공 시 홈페이지로 리다이렉트
            window.location.href = '/';
            return { success: true, message: '계정이 정상적으로 삭제되었습니다.' };
        } else {
            const errorText = await response.text();
            return { success: false, message: errorText || '계정 삭제에 실패했습니다.' };
        }
    } catch (error) {
        console.error('계정 삭제 오류:', error);
        return { success: false, message: '서버 연결에 실패했습니다.' };
    }
};