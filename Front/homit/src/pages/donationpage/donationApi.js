// 기존 authApi의 함수들을 import
import { authenticatedFetch, checkAuthStatus } from '../../utils/authUtils';

// donationApi.js
const BASE_URL = 'http://localhost:8080/api/donation';

// 1. 게시글 작성 - 백엔드 스펙에 맞춤
export const createPost = async (postData) => {
  try {
    const authStatus = await checkAuthStatus();
    
    if (!authStatus.isAuthenticated) {
      throw new Error('로그인이 필요합니다. 먼저 로그인해주세요.');
    }
    
    // FormData 생성 (백엔드 @RequestPart 개별 필드 형식에 맞춤)
    const formData = new FormData();
    
    // 카테고리 매핑 (프론트 → 백엔드)
    const categoryMap = {
      '나눔': 'FREE',
      '팝니다': 'SELL', 
      '삽니다': 'BUY',
      '동네 생활': 'LOCAL_ACTIVITY'
    };
    
    const mappedCategory = categoryMap[postData.category];
    if (!mappedCategory) {
      throw new Error(`지원하지 않는 카테고리입니다: ${postData.category}`);
    }
    
    // 가격 처리: "나눔"이면 "0", 아니면 숫자 문자열
    let priceValue = "0";
    if (postData.price !== '나눔') {
      const cleanPrice = postData.price.toString().replace(/[^0-9]/g, '');
      priceValue = cleanPrice || "0";
    }
    
    // 백엔드 @RequestPart 개별 필드 형식으로 추가
    formData.append('category', mappedCategory);
    formData.append('province', postData.region.province);
    formData.append('city', postData.region.city);
    formData.append('district', postData.region.district);
    formData.append('neighborhood', postData.region.neighborhood || '');
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('price', priceValue);
    
    if (postData.images && postData.images.length > 0) {
      
      postData.images.forEach((file, index) => {
        formData.append('images', file);
      });
    } else {
      console.log('📷 업로드할 이미지가 없습니다.');
    }
    
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`  ${key}: "${value}"`);
      }
    }
    
    // 백엔드 엔드포인트 /write 로 요청
    const response = await fetch(`${BASE_URL}/write`, {
      method: 'POST',
      credentials: 'include', // 쿠키 기반 인증
      body: formData
      // Content-Type 헤더는 설정하지 않음 (브라우저가 자동 설정)
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('로그인이 만료되었습니다. 다시 로그인해주세요.');
      }
      
      const errorText = await response.text();
      throw new Error(`서버 오류: ${response.status} - ${errorText}`);
    }

    const result = await response.text(); // 백엔드가 String 반환
    return { success: true, message: result };
  } catch (error) {

    throw error;
  }
};

// 2. 게시글 수정 - 백엔드 스펙에 맞춤
export const updatePost = async (id, postData) => {
  try {
    const authStatus = await checkAuthStatus();
    if (!authStatus.isAuthenticated) {
      throw new Error('로그인이 필요합니다.');
    }
    
    // FormData 생성 (백엔드 @RequestParam 형식에 맞춤)
    const formData = new FormData();
    
    // 카테고리 매핑
    const categoryMap = {
      '나눔': 'FREE',
      '팝니다': 'SELL', 
      '삽니다': 'BUY',
      '동네 생활': 'LOCAL_ACTIVITY'
    };
    
    const mappedCategory = categoryMap[postData.category] || postData.category;
    
    // 가격 처리
    let priceValue = "0";
    if (postData.price !== '나눔') {
      const cleanPrice = postData.price.toString().replace(/[^0-9]/g, '');
      priceValue = cleanPrice || "0";
    }
    
    // 백엔드 @RequestParam 개별 필드 형식으로 추가
    formData.append('category', mappedCategory);
    formData.append('province', postData.region.province);
    formData.append('city', postData.region.city);
    formData.append('district', postData.region.district);
    formData.append('neighborhood', postData.region.neighborhood || '');
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('price', priceValue);
    
    if (postData.images && postData.images.length > 0) {
      postData.images.forEach((file, index) => {
        formData.append('images', file);
      });
    }
    
    // 삭제할 이미지 URLs 추가 - JSON 문자열로
    if (postData.removedImages && postData.removedImages.length > 0) {
      const removedImagesJson = JSON.stringify(postData.removedImages);
      formData.append('removedImages', removedImagesJson);
    }
    
    // FormData 내용 확인
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`  ${key}: "${value}"`);
      }
    }
    
    const response = await fetch(`${BASE_URL}/edit/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('로그인이 만료되었습니다. 다시 로그인해주세요.');
      }
      
      const errorText = await response.text();
      throw new Error(`수정 실패: ${response.status} - ${errorText}`);
    }
    
    const result = await response.text(); // 백엔드가 String 반환
    return { success: true, message: result };
  } catch (error) {
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
    throw error;
  }
};

// 4. 카테고리별 게시글 목록 조회
export const getPostsByCategory = async (category) => {
  try {
    // '전체' 카테고리 처리
    if (category === '전체') {
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
    throw error;
  }
};

// authApi에서 가져온 함수들 re-export
export { checkAuthStatus };

// 유틸리티 함수들
export const filterPostsByRegion = (posts, region) => {
  if (!region || !region.province) return posts;
  
  return posts.filter(post => {
    const postProvince = post.province || post.region?.province;
    const postCity = post.city || post.region?.city;
    const postDistrict = post.district || post.region?.district;
    
    if (postProvince !== region.province) return false;
    if (region.city && postCity !== region.city) return false;
    if (region.district && postDistrict !== region.district) return false;
    
    return true;
  });
};

export const filterPostsBySearch = (posts, searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) return posts;
  
  const lowerSearchTerm = searchTerm.toLowerCase().trim();
  
  return posts.filter(post => 
    (post.title && post.title.toLowerCase().includes(lowerSearchTerm)) ||
    (post.content && post.content.toLowerCase().includes(lowerSearchTerm)) ||
    (post.username && post.username.toLowerCase().includes(lowerSearchTerm))
  );
};

export const getCategoryDisplayName = (backendCategory) => {
  const displayMap = {
    'FREE': '나눔',
    'SELL': '팝니다',
    'BUY': '삽니다',
    'LOCAL_ACTIVITY': '동네 생활'
  };
  
  return displayMap[backendCategory] || backendCategory;
};

export const getBackendCategory = (displayCategory) => {
  const backendMap = {
    '나눔': 'FREE',
    '팝니다': 'SELL',
    '삽니다': 'BUY',
    '동네 생활': 'LOCAL_ACTIVITY'
  };
  
  return backendMap[displayCategory] || displayCategory;
};

export const formatPrice = (price) => {
  if (!price || price === '0' || price === 0) return '나눔';
  
  const numPrice = parseInt(price);
  if (isNaN(numPrice)) return price;
  
  return numPrice.toLocaleString() + '원';
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes <= 0 ? '방금 전' : `${diffMinutes}분 전`;
      }
      return `${diffHours}시간 전`;
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch (error) {
    console.warn('날짜 포맷팅 오류:', error);
    return dateString;
  }
};