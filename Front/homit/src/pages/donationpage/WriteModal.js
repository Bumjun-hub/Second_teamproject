import React, { useState, useEffect } from 'react';
import { checkAuthStatus } from './donationApi';

const WriteModal = ({ editingPost, regionData = {}, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '나눔',
    price: '나눔',
    region: { province: '', city: '', district: '', neighborhood: '' }
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [authStatus, setAuthStatus] = useState({ isAuthenticated: false });

  // 인증 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const status = await checkAuthStatus();
        setAuthStatus(status);

        
        if (!status.isAuthenticated) {
          alert('로그인이 필요한 서비스입니다.');
          onClose();
        }
      } catch (error) {
        console.error('인증 확인 오류:', error);
        alert('로그인 상태를 확인할 수 없습니다.');
        onClose();
      }
    };
    checkAuth();
  }, [onClose]);

  // 수정 모드 데이터 로드
  useEffect(() => {
    if (editingPost) {
      setFormData({
        title: editingPost.title || '',
        content: editingPost.content || '',
        category: editingPost.category || '나눔',
        price: editingPost.price || '나눔',
        region: {
          province: editingPost.region?.province || editingPost.province || '',
          city: editingPost.region?.city || editingPost.city || '',
          district: editingPost.region?.district || editingPost.district || '',
          neighborhood: editingPost.region?.neighborhood || editingPost.neighborhood || ''
        }
      });

      // 기존 이미지 로드
      const existingImages = editingPost.imgUrls || editingPost.images || [];
      if (existingImages.length > 0) {
        setImagePreview(existingImages.map(img => ({
          url: img,
          isExisting: true
        })));
      }
    }
  }, [editingPost]);

  // 이미지 선택
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + imagePreview.length > 10) {
      alert('이미지는 최대 10장까지 업로드할 수 있습니다.');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name}은 5MB를 초과합니다.`);
        return false;
      }
      return true;
    });

    setSelectedImages(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, {
          url: e.target.result,
          file: file,
          isExisting: false
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 이미지 삭제
  const handleImageRemove = (index) => {
    const imageToRemove = imagePreview[index];
    
    if (imageToRemove.isExisting) {
      setRemovedImages(prev => [...prev, imageToRemove.url]);
    } else {
      const fileIndex = selectedImages.findIndex(file => file === imageToRemove.file);
      if (fileIndex > -1) {
        setSelectedImages(prev => prev.filter((_, i) => i !== fileIndex));
      }
    }
    
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  // 카테고리 변경
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
      const currentAuthStatus = await checkAuthStatus();
      
      if (!currentAuthStatus.isAuthenticated) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        onClose();
        return;
      }

      // 필수 필드 검증 - 지역 선택 4개 모두 포함
      if (!formData.title || !formData.content || 
          !formData.region.province || !formData.region.city || 
          !formData.region.district || !formData.region.neighborhood) {
        alert('모든 필드를 입력해주세요. (시/도, 시/구, 동, 상세동 모두 선택해야 합니다)');
        return;
      }
      
      const submitData = {
        ...formData,
        title: formData.title.trim(),
        content: formData.content.trim(),
        images: selectedImages,
        removedImages: removedImages,
        isEdit: !!editingPost
      };

      onSubmit(submitData);
      
      // 폼 초기화
      setFormData({
        title: '',
        content: '',
        category: '나눔',
        price: '나눔',
        region: { province: '', city: '', district: '', neighborhood: '' }
      });
      setSelectedImages([]);
      setImagePreview([]);
      setRemovedImages([]);
    } catch (error) {
      console.error('Submit error:', error);
      alert('글 작성 중 오류가 발생했습니다.');
    }
  };

  // 지역 데이터 헬퍼 함수들
  const getProvinces = () => Object.keys(regionData || {});
  const getCities = (province) => Object.keys(regionData?.[province] || {});
  const getDistricts = (province, city) => Object.keys(regionData?.[province]?.[city] || {});
  const getNeighborhoods = (province, city, district) => regionData?.[province]?.[city]?.[district] || [];

  if (!authStatus.isAuthenticated) return null;

  return (
    <div className="modal-overlay-d">
      <div className="modal-content-d">
        <div className="modal-header-d">
          <h2>{editingPost ? '글 수정' : '새 글 작성'}</h2>
          {authStatus.user && (
            <div className="user-info-d">
              안녕하세요, {authStatus.user.name || authStatus.user.username}님
            </div>
          )}
        </div>
        
        <div className="form-container-d">
          {/* 카테고리 */}
          <div className="form-group-d">
            <label>카테고리</label>
            <select
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="form-input-d"
              required
            >
              <option value="나눔">나눔</option>
              <option value="팝니다">팝니다</option>
              <option value="삽니다">삽니다</option>
              <option value="동네 생활">동네 생활</option>
            </select>
          </div>

          {/* 제목 */}
          <div className="form-group-d">
            <label>제목</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="form-input-d"
              required
            />
          </div>

          {/* 내용 */}
          <div className="form-group-d">
            <label>내용</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows="5"
              className="form-textarea-d"
              required
            />
          </div>

          {/* 가격 */}
          <div className="form-group-d">
            <label>가격</label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="form-input-d"
              disabled={formData.category === '나눔'}
              placeholder={formData.category === '나눔' ? '나눔' : '가격을 입력하세요'}
              required
            />
          </div>

          {/* 이미지 업로드 */}
          <div className="form-group-d">
            <label>이미지 ({imagePreview.length}/10)</label>
            <div className="image-upload-container">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="image-input"
                id="image-upload"
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload" className="image-upload-button">
                📷 이미지 선택 (최대 10장, 5MB 이하)
              </label>
              
              {imagePreview.length > 0 && (
                <div className="image-preview-container">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="image-preview-item">
                      <img 
                        src={preview.url} 
                        alt={`미리보기 ${index + 1}`}
                        className="preview-image"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageRemove(index)}
                        className="image-remove-button"
                      >
                        ✕
                      </button>
                      {preview.isExisting && (
                        <span className="existing-image-badge">기존</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 지역 선택 */}
          <div className="form-row-d">
            <div className="form-group-d">
              <label>시/도 *</label>
              <select
                value={formData.region.province}
                onChange={(e) => setFormData({
                  ...formData,
                  region: { province: e.target.value, city: '', district: '', neighborhood: '' }
                })}
                className="form-input-d"
                required
              >
                <option value="">선택하세요</option>
                {getProvinces().map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>

            {formData.region.province && (
              <div className="form-group-d">
                <label>시/구 *</label>
                <select
                  value={formData.region.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    region: { ...formData.region, city: e.target.value, district: '', neighborhood: '' }
                  })}
                  className="form-input-d"
                  required
                >
                  <option value="">선택하세요</option>
                  {getCities(formData.region.province).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.region.city && (
              <div className="form-group-d">
                <label>동 *</label>
                <select
                  value={formData.region.district}
                  onChange={(e) => setFormData({
                    ...formData,
                    region: { ...formData.region, district: e.target.value, neighborhood: '' }
                  })}
                  className="form-input-d"
                  required
                >
                  <option value="">선택하세요</option>
                  {getDistricts(formData.region.province, formData.region.city).map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.region.district && (
              <div className="form-group-d">
                <label>상세동 *</label>
                <select
                  value={formData.region.neighborhood}
                  onChange={(e) => setFormData({
                    ...formData,
                    region: { ...formData.region, neighborhood: e.target.value }
                  })}
                  className="form-input-d"
                  required
                >
                  <option value="">선택하세요</option>
                  {getNeighborhoods(formData.region.province, formData.region.city, formData.region.district).map(neighborhood => (
                    <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="form-actions-d">
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-d btn-primary-d"
            >
              {editingPost ? '수정하기' : '작성하기'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-d btn-secondary-d"
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