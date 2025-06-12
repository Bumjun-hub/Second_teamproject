import React, { useState, useEffect } from 'react';
import './DonationPage.css';
import FilterSection from './FilterSection';
import PostList from './PostList';
import WriteModal from './WriteModal';
import { 
  createPost, 
  updatePost, 
  deletePost, 
  getPostsByCategory,
  filterPostsByRegion,
  filterPostsBySearch,
  checkAuthStatus
} from './donationApi';

const DonationPage = () => {
  const [posts, setPosts] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState({
    province: '',
    city: '',
    district: '',
    neighborhood: ''
  });
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // 지역 데이터 (4단계 구조로 확장)
  const regionData = {
    서울특별시: {
      강남구: {
        역삼동: ['역삼1동', '역삼2동'],
        개포동: ['개포1동', '개포2동', '개포4동'],
        청담동: ['청담동'],
        삼성동: ['삼성1동', '삼성2동']
      },
      강북구: {
        미아동: ['미아1동', '미아3동'],
        번동: ['번1동', '번2동', '번3동'],
        수유동: ['수유1동', '수유2동', '수유3동']
      },
      마포구: {
        홍대동: ['홍익동', '상수동'],
        합정동: ['합정동'],
        상암동: ['상암동'],
        연남동: ['연남동', '성산동']
      }
    },
    경기도: {
      수원시: {
        영통구: ['영통1동', '영통2동', '매탄동'],
        장안구: ['정자동', '송죽동', '연무동'],
        팔달구: ['행궁동', '매교동', '우만동'],
        권선구: ['권선동', '곡선동', '서둔동']
      },
      성남시: {
        분당구: ['정자동', '수내동', '야탑동'],
        중원구: ['성남동', '중앙동', '금광동'],
        수정구: ['신흥동', '태평동', '수진동']
      },
      고양시: {
        일산동구: ['장항동', '마두동', '백석동'],
        일산서구: ['주엽동', '대화동', '킨텍스'],
        덕양구: ['행신동', '화정동', '원당동']
      }
    },
    부산광역시: {
      해운대구: {
        해운대동: ['우동', '중동', '좌동'],
        중동: ['중1동', '중2동'],
        좌동: ['좌1동', '좌2동', '좌3동']
      },
      부산진구: {
        부전동: ['부전1동', '부전2동'],
        연지동: ['연지동'],
        초읍동: ['초읍동']
      },
      서면구: {
        서면동: ['서면1동', '서면2동'],
        부전동: ['부전1동', '부전2동']
      }
    }
  };

  const categories = ['전체', '나눔', '팝니다', '삽니다', '동네 생활'];

  // 인증 상태 확인
  const checkAuth = async () => {
    const authResult = await checkAuthStatus();
    setIsAuthenticated(authResult.isAuthenticated);
    setCurrentUser(authResult.user);
    return authResult.isAuthenticated;
  };

  // 초기 인증 확인
  useEffect(() => {
    checkAuth();
  }, []);

  // 게시글 목록 로드
  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allPosts = await getPostsByCategory(selectedCategory);
      setPosts(allPosts);
    } catch (error) {
      console.error('게시글 로드 실패:', error);
      if (error.response?.status === 401) {
        setError('인증이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('accessToken');
      } else {
        setError('게시글을 불러오는데 실패했습니다.');
      }
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // 초기 샘플 데이터 (백엔드 연결 실패 시 폴백)
  const loadSampleData = () => {
    const samplePosts = [
      {
        id: 1,
        title: '아이 장난감 나눔해요',
        content: '안 쓰는 장난감들 나눔합니다. 직거래 선호해요.',
        category: '나눔',
        price: '나눔',
        region: { province: '서울특별시', city: '강남구', district: '역삼동' },
        province: '서울특별시',
        city: '강남구', 
        district: '역삼동',
        neighborhood: '',
        author: '사용자1',
        username: '사용자1',
        createdAt: new Date('2025-06-10').toISOString(),
        viewCount: 25,
        likes: 3,
        imgUrls: []
      },
      {
        id: 2,
        title: '자전거 팝니다',
        content: '성인용 자전거 판매합니다. 상태 양호해요.',
        category: '팝니다',
        price: '50,000원',
        region: { province: '서울특별시', city: '마포구', district: '홍대동' },
        province: '서울특별시',
        city: '마포구',
        district: '홍대동', 
        neighborhood: '',
        author: '사용자2',
        username: '사용자2',
        createdAt: new Date('2025-06-11').toISOString(),
        viewCount: 12,
        likes: 1,
        imgUrls: []
      }
    ];
    setPosts(samplePosts);
  };

  // 초기 로드
  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadPosts();
      } catch (error) {
        console.warn('백엔드 연결 실패, 샘플 데이터 사용:', error);
        loadSampleData();
      }
    };
    
    initializeData();
  }, [selectedCategory]);

  const getCategoryMapping = () => {
  return {
    // 프론트엔드 → 백엔드
    '나눔': 'FREE',
    '팝니다': 'SELL', 
    '삽니다': 'BUY',
    '동네 생활': 'LOCAL_ACTIVITY',
    // 백엔드 → 프론트엔드 (표시용)
    'FREE': '나눔',
    'SELL': '팝니다',
    'BUY': '삽니다', 
    'LOCAL_ACTIVITY': '동네 생활'
  };
};
  // 지역별 필터링된 게시글
  const filteredPosts = posts.filter(post => {
  // 백엔드 데이터와 샘플 데이터 모두 호환되도록 처리
  const postProvince = post.province || post.region?.province;
  const postCity = post.city || post.region?.city;
  const postDistrict = post.district || post.region?.district;
  
  const regionMatch = !selectedRegion.province || 
    (postProvince === selectedRegion.province &&
     (!selectedRegion.city || postCity === selectedRegion.city) &&
     (!selectedRegion.district || postDistrict === selectedRegion.district));

  // 카테고리 매핑을 고려한 필터링
  const categoryMapping = getCategoryMapping();
  let categoryMatch = false;
  
  if (selectedCategory === '전체') {
    categoryMatch = true;
  } else {
    // 백엔드 enum 값을 프론트엔드 값으로 변환해서 비교
    const postCategoryInKorean = categoryMapping[post.category] || post.category;
    categoryMatch = postCategoryInKorean === selectedCategory;
  }

  const searchMatch = !searchTerm || 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase());
  
  return regionMatch && categoryMatch && searchMatch;
});

  // 글 작성/수정 처리
  const handleSubmit = async (formData, imageFiles = [], removedUrls = []) => {
    try {
      // 인증 확인
      if (!isAuthenticated) {
        alert('로그인이 필요합니다.');
        return;
      }

      if (editingPost) {
        await updatePost(editingPost.id, formData, imageFiles, removedUrls);
        setEditingPost(null);
      } else {
        await createPost(formData, imageFiles);
      }
      
      // 성공 시 목록 새로고침
      await loadPosts();
      setShowWriteForm(false);
      
    } catch (error) {
      console.error('게시글 처리 실패:', error);
      if (error.message.includes('인증')) {
        await checkAuth(); // 인증 상태 재확인
      }
      throw error; // WriteModal에서 에러 처리하도록 전달
    }
  };

  // 글 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      // 백엔드 삭제 시도
      try {
        await deletePost(id);
        await loadPosts(); // 백엔드에서 새로고침
      } catch (apiError) {
        if (apiError.response?.status === 401) {
          alert('로그인이 필요합니다.');
          return;
        }
        // 백엔드 실패 시 로컬 삭제
        console.warn('백엔드 삭제 실패, 로컬 삭제:', apiError);
        setPosts(posts.filter(post => post.id !== id));
      }
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert(error.message || '게시글 삭제에 실패했습니다.');
    }
  };

  // 수정 시작
  const handleEdit = (post) => {
    setEditingPost(post);
    setShowWriteForm(true);
  };

  // 새로고침
  const handleRefresh = () => {
    loadPosts();
  };

  return (
    <div className="donation-container">
      <div className="donation-header">
        <h1>동네 나눔터</h1>
        <p>우리 동네에서 나누고 거래해요</p>
      </div>

      {/* 인증 에러 표시 */}
      {error && error.includes('로그인') && (
        <div className="auth-error-banner">
          <span>🔒 {error}</span>
          <button 
            onClick={() => setError(null)} 
            className="error-close-btn"
          >
            ✕
          </button>
        </div>
      )}
      
      <FilterSection 
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        regionData={regionData}
        categories={categories}
        onWriteClick={() => setShowWriteForm(true)}
        loading={loading}
        onRefresh={handleRefresh}
      />

      {/* 로딩 상태 */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>게시글을 불러오는 중...</p>
        </div>
      )}

      <PostList 
        posts={filteredPosts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {showWriteForm && (
        <WriteModal 
          editingPost={editingPost} 
          regionData={regionData} 
          onSubmit={handleSubmit}
          onClose={() => {
            setShowWriteForm(false);
            setEditingPost(null);
          }}
        />
      )}
    </div>
  );
};

export default DonationPage;