// 기존 authApi의 함수들을 import
import { authenticatedFetch, checkAuthStatus } from '../../utils/authUtils';

// donationApi.js
const BASE_URL = 'http://localhost:8080/api/donation';

// 최종 수정된 createPost 함수
// 최종 수정된 createPost 함수
export const createPost = async (postData) => {
  try {
    console.log('🚀 createPost 시작');
    
    // 로그인 상태 확인 (올바른 속성명 사용)
    console.log('🔐 로그인 상태 확인 중...');
    const authStatus = await checkAuthStatus(); // await 추가
    console.log('🔐 최종 인증 상태:', authStatus);
    
    if (!authStatus.isAuthenticated) { // isLoggedIn → isAuthenticated
      console.error('❌ 로그인되지 않음');
      console.error('❌ authStatus 상세:', JSON.stringify(authStatus, null, 2));
      throw new Error('로그인이 필요합니다. 먼저 로그인해주세요.');
    }
    
    console.log('✅ 로그인 확인됨, 사용자:', authStatus.user);
    
    // 요청 데이터 로깅
    console.log('📤 원본 데이터:', JSON.stringify(postData, null, 2));
    
    // FormData 생성 (백엔드 @RequestPart 형식에 맞춤)
    const formData = new FormData();
    
    // 카테고리 매핑 (프론트 → 백엔드)
    const categoryMap = {
      '나눔': 'FREE',
      '팝니다': 'SELL', 
      '삽니다': 'BUY',
      '동네 생활': 'LOCAL_ACTIVITY'
    };
    
    // 가격 처리: "나눔"이면 0, 아니면 숫자로 변환
    let priceValue = 0;
    if (postData.price !== '나눔') {
      // 문자열에서 숫자만 추출 (쉼표 등 제거)
      const cleanPrice = postData.price.toString().replace(/[^0-9]/g, '');
      priceValue = parseInt(cleanPrice) || 0;
    }
    
    // 백엔드 enum 값 확인
    const mappedCategory = categoryMap[postData.category];
    if (!mappedCategory) {
      throw new Error(`지원하지 않는 카테고리입니다: ${postData.category}`);
    }
    
    // 각 필드를 개별적으로 FormData에 추가
    formData.append('category', mappedCategory);
    formData.append('province', postData.region.province);
    formData.append('city', postData.region.city); 
    formData.append('district', postData.region.district);
    formData.append('neighborhood', postData.region.neighborhood || '');
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('price', priceValue.toString()); // 문자열로 전송
    
    // FormData 내용 확인 (디버깅용)
    console.log('📤 FormData 내용:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value} (${typeof value})`);
    }
    
    // 백엔드 요구사항 재확인
    console.log('🔍 백엔드 매핑 확인:');
    console.log('  - category (enum):', mappedCategory);
    console.log('  - price (Long):', priceValue, typeof priceValue);
    console.log('  - region fields:', {
      province: postData.region.province,
      city: postData.region.city,
      district: postData.region.district,
      neighborhood: postData.region.neighborhood || ''
    });
    
    // XMLHttpRequest로 multipart/form-data 전송 (쿠키 기반 인증)
    const response = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', `${BASE_URL}/write`, true);
      xhr.withCredentials = true; // 쿠키 기반 인증을 위해 필수!
      
      // JWT가 쿠키에 있으므로 Authorization 헤더 불필요
      // Content-Type도 설정하지 않음 (브라우저가 자동으로 multipart/form-data 설정)
      
      xhr.onload = function() {
        console.log('📥 응답 수신:', xhr.status, xhr.statusText);
        resolve({
          ok: xhr.status >= 200 && xhr.status < 300,
          status: xhr.status,
          statusText: xhr.statusText,
          text: () => Promise.resolve(xhr.responseText),
          json: () => Promise.resolve(JSON.parse(xhr.responseText))
        });
      };
      
      xhr.onerror = function() {
        console.error('❌ 네트워크 오류');
        reject(new Error('네트워크 오류가 발생했습니다.'));
      };
      
      console.log('📤 FormData 전송 시작...');
      xhr.send(formData);
    });

    // 응답 처리
    console.log('📥 응답 상태:', response.status);

    if (!response.ok) {
      // 인증 실패 시 특별 처리
      if (response.status === 401) {
        throw new Error('로그인이 만료되었습니다. 다시 로그인해주세요.');
      }
      
      // 에러 응답 확인
      const errorText = await response.text();
      console.error('❌ 서버 에러 응답:', errorText);
      
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    // 성공 응답 처리
    const textResult = await response.text();
    console.log('✅ 성공 응답:', textResult);
    return { success: true, message: textResult };

  } catch (error) {
    console.error('❌ 게시글 작성 실패:', error);
    
    // 사용자 친화적 에러 메시지
    if (error.message.includes('로그인')) {
      alert(error.message);
    }
    
    throw error;
  }
};

// XMLHttpRequest 버전도 인증 헤더 추가
export const createPostXHR = async (postData) => {
  return new Promise((resolve, reject) => {
    // 로그인 상태 확인
    const authStatus = checkAuthStatus();
    if (!authStatus.isLoggedIn) {
      reject(new Error('로그인이 필요합니다.'));
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE_URL}/write`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    
    // 인증 헤더 추가
    if (authStatus.token) {
      const token = authStatus.token.startsWith('Bearer ') 
        ? authStatus.token 
        : `Bearer ${authStatus.token}`;
      xhr.setRequestHeader('Authorization', token);
    }
    
    // 쿠키 기반 인증도 지원
    xhr.withCredentials = true;
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (e) {
            resolve({ message: xhr.responseText });
          }
        } else if (xhr.status === 401) {
          reject(new Error('로그인이 만료되었습니다. 다시 로그인해주세요.'));
        } else {
          reject(new Error(`HTTP error! status: ${xhr.status}, message: ${xhr.responseText}`));
        }
      }
    };
    
    xhr.onerror = function() {
      reject(new Error('네트워크 오류가 발생했습니다.'));
    };
    
    xhr.send(JSON.stringify(postData));
  });
};

// 2. 게시글 수정
export const updatePost = async (id, postData, imageFiles, removedImages = []) => {
    try {
        // 로그인 상태 확인
        const authStatus = checkAuthStatus();
        if (!authStatus.isLoggedIn) {
            throw new Error('로그인이 필요합니다.');
        }

        const formData = new FormData();
        
        // 카테고리 매핑 (프론트 → 백엔드)
        const categoryMap = {
            '나눔': 'FREE',
            '팝니다': 'SELL',
            '삽니다': 'BUY',
            '동네 생활': 'LOCAL_ACTIVITY'
        };
        
        // 가격 처리: 문자열에서 숫자 추출
        let priceValue = 0;
        if (postData.price !== '나눔') {
            // 쉼표 제거 후 숫자 변환
            const cleanPrice = postData.price.toString().replace(/[^0-9]/g, '');
            priceValue = parseInt(cleanPrice) || 0;
        }
        
        // 텍스트 데이터 추가
        formData.append('category', categoryMap[postData.category] || postData.category);
        formData.append('province', postData.region.province);
        formData.append('city', postData.region.city);
        formData.append('district', postData.region.district);
        formData.append('neighborhood', postData.region.neighborhood || '');
        formData.append('title', postData.title);
        formData.append('content', postData.content);
        formData.append('price', priceValue.toString());
        
        // 새 이미지 파일 추가
        if (imageFiles && imageFiles.length > 0) {
            imageFiles.forEach(file => {
                formData.append('images', file);
            });
        }
        
        // 삭제할 이미지 URL 목록 추가
        if (removedImages.length > 0) {
            formData.append('removedImages', JSON.stringify(removedImages));
        }

        // XMLHttpRequest 사용 (인증 헤더 추가)
        const response = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            xhr.open('PUT', `${BASE_URL}/edit/${id}`, true);
            xhr.withCredentials = true;
            
            // 인증 헤더 추가
            if (authStatus.token) {
                const token = authStatus.token.startsWith('Bearer ') 
                    ? authStatus.token 
                    : `Bearer ${authStatus.token}`;
                xhr.setRequestHeader('Authorization', token);
            }
            
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve({
                        ok: true,
                        status: xhr.status,
                        text: () => Promise.resolve(xhr.responseText)
                    });
                } else {
                    resolve({
                        ok: false,
                        status: xhr.status,
                        text: () => Promise.resolve(xhr.responseText)
                    });
                }
            };
            
            xhr.onerror = function() {
                reject(new Error('Network error'));
            };
            
            xhr.send(formData);
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('로그인이 만료되었습니다. 다시 로그인해주세요.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.text();
        return { success: true, message: result };
    } catch (error) {
        console.error('게시글 수정 실패:', error);
        throw error;
    }
};

// 3. 게시글 삭제
export const deletePost = async (id) => {
    try {
        const response = await authenticatedFetch(`${BASE_URL}/delete/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.text();
        return { success: true, message: result };
    } catch (error) {
        console.error('게시글 삭제 실패:', error);
        throw error;
    }
};

// 4. 카테고리별 게시글 목록 조회
export const getPostsByCategory = async (category) => {
    try {
        // '전체' 카테고리 처리
        if (category === '전체') {
            // 모든 카테고리의 게시글을 가져와서 합치기
            const categories = ['BUY', 'FREE', 'LOCAL_ACTIVITY', 'SELL'];
            const allPosts = [];
            
            for (const cat of categories) {
                try {
                    const response = await authenticatedFetch(`${BASE_URL}/view/${cat}`, {
                        method: 'GET',
                    });
                    
                    if (response.ok) {
                        const posts = await response.json();
                        allPosts.push(...posts);
                    }
                } catch (error) {
                    console.warn(`카테고리 ${cat} 조회 중 오류:`, error);
                }
            }
            
            return allPosts;
        }
        
        // 카테고리 매핑 (프론트 카테고리 → 백엔드 enum)
        const categoryMap = {
            '나눔': 'FREE',
            '팝니다': 'SELL',
            '삽니다': 'BUY',
            '동네 생활': 'LOCAL_ACTIVITY'
        };
        
        const backendCategory = categoryMap[category] || category;
        
        const response = await authenticatedFetch(`${BASE_URL}/view/${backendCategory}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const posts = await response.json();
        return posts;
    } catch (error) {
        console.error(`카테고리 ${category} 조회 실패:`, error);
        throw error;
    }
};

// 5. 게시글 상세 조회
export const getDetailPost = async (category, id) => {
    try {
        const response = await authenticatedFetch(`${BASE_URL}/view/${category}/${id}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const post = await response.json();
        return post;
    } catch (error) {
        console.error('게시글 상세 조회 실패:', error);
        throw error;
    }
};

// authApi에서 가져온 checkAuthStatus를 다시 export
export { checkAuthStatus };

// 지역별 필터링 (필요시 사용)
export const filterPostsByRegion = (posts, region) => {
    return posts.filter(post => {
        const postProvince = post.province || post.region?.province;
        const postCity = post.city || post.region?.city;
        const postDistrict = post.district || post.region?.district;
        
        return !region.province || 
            (postProvince === region.province &&
             (!region.city || postCity === region.city) &&
             (!region.district || postDistrict === region.district));
    });
};

// 검색어 필터링 (필요시 사용)
export const filterPostsBySearch = (posts, searchTerm) => {
    if (!searchTerm) return posts;
    
    return posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
};