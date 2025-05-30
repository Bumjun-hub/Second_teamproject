// tokenUtils.js - 토큰 관리 유틸리티

/**
 * 토큰 갱신 함수
 * @returns {Promise<boolean>} 갱신 성공 여부
 */
export const refreshToken = async () => {
  try {
    const refreshResponse = await fetch('/api/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    
    if (refreshResponse.ok) {
      console.log('토큰 갱신 성공');
      return true;
    } else {
      console.log('토큰 갱신 실패 - 재로그인 필요');
      return false;
    }
  } catch (error) {
    console.log('토큰 갱신 중 에러:', error);
    return false;
  }
};

/**
 * API 요청 전 토큰 갱신 시도하는 래퍼 함수
 * @param {Function} apiCall - API 호출 함수
 * @returns {Promise} API 호출 결과
 */
export const withTokenRefresh = async (apiCall) => {
  try {
    // 먼저 API 호출 시도
    const result = await apiCall();
    return result;
  } catch (error) {
    // 401 에러인 경우 토큰 갱신 후 재시도
    if (error.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        return await apiCall(); // 토큰 갱신 후 재시도
      } else {
        // 토큰 갱신 실패시 로그인 페이지로 리다이렉트
        window.location.href = '/login';
        throw new Error('로그인이 필요합니다.');
      }
    }
    throw error;
  }
};

/**
 * 인증이 필요한 fetch 요청
 * @param {string} url - 요청 URL
 * @param {object} options - fetch 옵션
 * @returns {Promise<Response>} fetch 응답
 */
export const authenticatedFetch = async (url, options = {}) => {
  // 먼저 토큰 갱신 시도
  await refreshToken();
  
  // 기본 옵션 설정
  const defaultOptions = {
    credentials: 'include',
    ...options
  };
  
  const response = await fetch(url, defaultOptions);
  
  // 401 에러시 로그인 페이지로 리다이렉트
  if (response.status === 401) {
    alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  
  return response;
};