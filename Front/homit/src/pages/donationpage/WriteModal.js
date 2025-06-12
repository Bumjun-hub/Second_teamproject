import React, { useState, useEffect } from 'react';
import { checkAuthStatus } from './donationApi'; // API 파일에서 import

const WriteModal = ({ editingPost, regionData = {}, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '나눔',
    price: '나눔',
    region: { province: '', city: '', district: '', neighborhood: '' }
  });

  const [authStatus, setAuthStatus] = useState({ isAuthenticated: false });
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 로그인 상태 확인
  useEffect(() => {
    console.log('🔍 WriteModal - 로그인 상태 확인 시작');
    
    const checkAuth = async () => {
      try {
        console.log('🔍 WriteModal - checkAuthStatus 호출 중...');
        
        // 항상 await 사용 (checkAuthStatus는 Promise 반환)
        const status = await checkAuthStatus();
        
        console.log('🔍 WriteModal - checkAuthStatus 최종 결과:', status);
        setAuthStatus(status);
        setIsLoading(false);
        
        if (!status.isAuthenticated) {
          console.warn('❌ WriteModal - 로그인되지 않음');
          console.warn('❌ WriteModal - 상세 상태:', JSON.stringify(status, null, 2));
          alert('로그인이 필요한 서비스입니다.');
          onClose(); // 모달 닫기
          return;
        }
        
        console.log('✅ WriteModal - 로그인 확인됨, 사용자:', status.user);
      } catch (error) {
        console.error('❌ WriteModal - 인증 상태 확인 중 오류:', error);
        setIsLoading(false);
        alert('로그인 상태를 확인할 수 없습니다.');
        onClose();
      }
    };

    checkAuth();
  }, [onClose]);

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (editingPost) {
      // 백엔드 데이터 구조에 맞게 변환
      const formattedData = {
        title: editingPost.title || '',
        content: editingPost.content || '',
        category: editingPost.category || '나눔',
        price: editingPost.price || '나눔',
        region: {
          // 중첩된 region 객체가 있으면 사용, 없으면 평면적인 구조에서 가져오기
          province: editingPost.region?.province || editingPost.province || '',
          city: editingPost.region?.city || editingPost.city || '',
          district: editingPost.region?.district || editingPost.district || '',
          neighborhood: editingPost.region?.neighborhood || editingPost.neighborhood || ''
        }
      };
      
      console.log('🔧 수정 모드 - 원본 데이터:', editingPost);
      console.log('🔧 수정 모드 - 변환된 데이터:', formattedData);
      
      setFormData(formattedData);
    }
  }, [editingPost]);

  // 카테고리 변경 시 가격 필드 처리
  const handleCategoryChange = (category) => {
    setFormData({
      ...formData,
      category,
      price: category === '나눔' ? '나눔' : ''
    });
  };

  // 폼 제출
  const handleSubmit = async () => {
    try {
      console.log('📝 WriteModal - handleSubmit 시작');
      
      // 실시간 로그인 상태 재확인
      const currentAuthStatus = await checkAuthStatus();
      
      console.log('📝 WriteModal - 실시간 인증 상태:', currentAuthStatus);
      
      if (!currentAuthStatus.isAuthenticated) {
        console.warn('❌ WriteModal - 로그인 만료됨');
        console.warn('❌ WriteModal - 현재 상태:', JSON.stringify(currentAuthStatus, null, 2));
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        onClose();
        return;
      }

      // 필수 필드 검증
      if (!formData.title || !formData.content || !formData.region.province || !formData.region.city || !formData.region.district) {
        alert('모든 필드를 입력해주세요.');
        return;
      }
      
      // 서버로 보낼 데이터 준비 및 검증
      const submitData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        price: formData.price,
        region: {
          province: formData.region.province,
          city: formData.region.city,
          district: formData.region.district,
          neighborhood: formData.region.neighborhood || ''
        }
      };

      // 데이터 로깅 (디버깅용)
      console.log('📤 WriteModal - 전송할 데이터:', JSON.stringify(submitData, null, 2));
      
      // onSubmit이 함수인지 확인
      if (typeof onSubmit === 'function') {
        console.log('✅ WriteModal - onSubmit 호출');
        onSubmit(submitData);
      } else {
        console.error('❌ WriteModal - onSubmit is not a function');
        return;
      }
      
      // 폼 초기화
      setFormData({
        title: '',
        content: '',
        category: '나눔',
        price: '나눔',
        region: { province: '', city: '', district: '', neighborhood: '' }
      });
    } catch (error) {
      console.error('❌ WriteModal - Submit error:', error);
      alert('글 작성 중 오류가 발생했습니다.');
    }
  };

  // 로딩 중이면 로딩 표시
  if (isLoading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>로딩 중...</h2>
          </div>
        </div>
      </div>
    );
  }

  // 로그인되지 않은 상태라면 빈 화면
  if (!authStatus.isAuthenticated) {
    return null;
  }

  // 안전한 지역 데이터 접근 함수들
  const getProvinces = () => {
    return Object.keys(regionData || {});
  };

  const getCities = (province) => {
    return Object.keys(regionData?.[province] || {});
  };

  const getDistricts = (province, city) => {
    return Object.keys(regionData?.[province]?.[city] || {});
  };

  const getNeighborhoods = (province, city, district) => {
    return regionData?.[province]?.[city]?.[district] || [];
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editingPost ? '글 수정' : '새 글 작성'}</h2>
          {/* 로그인 사용자 정보 표시 (선택사항) */}
          {authStatus.user && (
            <div className="user-info">
              안녕하세요, {authStatus.user.name || authStatus.user.username}님
            </div>
          )}
          {/* 디버깅용 인증 상태 표시 */}
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            로그인 상태: {authStatus.isAuthenticated ? '✅' : '❌'} | 
            사용자: {authStatus.user ? authStatus.user.name || authStatus.user.username : 'None'}
          </div>
        </div>
        
        <div className="form-container">
          <div className="form-group">
            <label>카테고리</label>
            <select
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="form-input"
              required
            >
              <option value="나눔">나눔</option>
              <option value="팝니다">팝니다</option>
              <option value="삽니다">삽니다</option>
              <option value="동네 생활">동네 생활</option>
            </select>
          </div>

          <div className="form-group">
            <label>제목</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>내용</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows="5"
              className="form-textarea"
              required
            />
          </div>

          <div className="form-group">
            <label>가격</label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="form-input"
              disabled={formData.category === '나눔'}
              placeholder={formData.category === '나눔' ? '나눔' : '가격을 입력하세요'}
              required
            />
          </div>

          {/* 지역 선택 - 4단계 구조 */}
          <div className="form-row">
            {/* 1단계: 시/도 */}
            <div className="form-group">
              <label>시/도</label>
              <select
                value={formData.region.province}
                onChange={(e) => setFormData({
                  ...formData,
                  region: { province: e.target.value, city: '', district: '', neighborhood: '' }
                })}
                className="form-input"
                required
              >
                <option value="">선택하세요</option>
                {getProvinces().map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>

            {/* 2단계: 시/구 */}
            {formData.region.province && (
              <div className="form-group">
                <label>시/구</label>
                <select
                  value={formData.region.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    region: { ...formData.region, city: e.target.value, district: '', neighborhood: '' }
                  })}
                  className="form-input"
                  required
                >
                  <option value="">선택하세요</option>
                  {getCities(formData.region.province).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 3단계: 동 */}
            {formData.region.city && (
              <div className="form-group">
                <label>동</label>
                <select
                  value={formData.region.district}
                  onChange={(e) => setFormData({
                    ...formData,
                    region: { ...formData.region, district: e.target.value, neighborhood: '' }
                  })}
                  className="form-input"
                  required
                >
                  <option value="">선택하세요</option>
                  {getDistricts(formData.region.province, formData.region.city).map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 4단계: 상세동 (선택사항) */}
            {formData.region.district && (
              <div className="form-group">
                <label>상세동 (선택사항)</label>
                <select
                  value={formData.region.neighborhood}
                  onChange={(e) => setFormData({
                    ...formData,
                    region: { ...formData.region, neighborhood: e.target.value }
                  })}
                  className="form-input"
                >
                  <option value="">선택하세요</option>
                  {getNeighborhoods(formData.region.province, formData.region.city, formData.region.district).map(neighborhood => (
                    <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-primary"
            >
              {editingPost ? '수정하기' : '작성하기'}
            </button>
            <button
              type="button"
              onClick={() => typeof onClose === 'function' ? onClose() : console.error('onClose is not a function')}
              className="btn btn-secondary"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteModal;