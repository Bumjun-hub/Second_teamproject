import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './GroupBuyWritePage.css';
import Section from '../../components/Section';

const GroupBuyWritePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [role, setRole] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    productUrl: '',
    maxParticipants: 10,
    minParticipants: 1,
    currentParticipants: 0,
    maxQuantity: 5,
    originalPrice: 20000,
    salePrice: 10000,
    deadline: '',
    status: 'OPEN'
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // 기존 이미지 (ID와 URL 포함)
  const [newImagePreviews, setNewImagePreviews] = useState([]); // 새로 추가된 이미지 미리보기
  const [deletedImageIds, setDeletedImageIds] = useState([]); // 삭제할 기존 이미지 ID들

  useEffect(() => {
    if (isEdit) {
      fetch(`/api/groupBuy/detail/${id}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setFormData({
            title: data.title,
            content: data.content,
            description: data.description,
            productUrl: data.productUrl,
            maxParticipants: data.maxParticipants,
            minParticipants: data.minParticipants,
            currentParticipants: data.currentParticipants,
            maxQuantity: data.maxQuantity,
            originalPrice: data.originalPrice,
            salePrice: data.salePrice,
            deadline: data.deadline?.slice(0, 16),
            status: data.status
          });

          // 기존 이미지들을 ID와 URL로 매핑
          if (data.imgUrls && data.imgIds && data.imgUrls.length > 0) {
            const existingImgs = data.imgUrls.map((url, index) => ({
              id: data.imgIds[index],
              url: url,
              isExisting: true
            }));
            setExistingImages(existingImgs);
          }
        })
        .catch(err => {
          console.error('데이터 로드 실패:', err);
          alert('게시글 정보를 불러오는데 실패했습니다.');
        });
    }
  }, [isEdit, id]);





  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // 새로운 파일들을 imageFiles에 추가
    setImageFiles(prev => [...prev, ...files]);

    // 새로운 미리보기 생성
    const newPreviews = files.map(file => ({
      file: file,
      url: URL.createObjectURL(file),
      isExisting: false
    }));

    setNewImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleExistingImageRemove = (imageId, index) => {
    // 기존 이미지 삭제
    setDeletedImageIds(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleNewImageRemove = (index) => {
    // 새로 추가된 이미지 삭제
    const removedPreview = newImagePreviews[index];

    // 메모리 누수 방지를 위해 Object URL 해제
    if (removedPreview && removedPreview.url) {
      URL.revokeObjectURL(removedPreview.url);
    }

    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('status', formData.status);
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('description', formData.description);
    data.append('productUrl', formData.productUrl);
    data.append('maxParticipants', formData.maxParticipants);
    data.append('minParticipants', formData.minParticipants);
    data.append('currentParticipants', formData.currentParticipants);
    data.append('maxQuantity', formData.maxQuantity);
    data.append('originalPrice', formData.originalPrice);
    data.append('salePrice', formData.salePrice);
    data.append('deadline', formData.deadline);

    // 새로운 이미지 파일들 추가
    imageFiles.forEach((file) => {
      data.append('images', file);
    });

    // 수정 모드에서 삭제할 이미지 ID들 추가
    if (isEdit && deletedImageIds.length > 0) {
      deletedImageIds.forEach(id => {
        data.append('deleteImageIds', id);
      });
    }

    const url = isEdit
      ? `/api/groupBuy/admin/edit/${id}`
      : '/api/groupBuy/admin/write';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: data,
      });

      if (response.ok) {
        alert(isEdit ? '공동구매 글이 수정되었습니다!' : '공동구매 글이 등록되었습니다!');

        // 메모리 정리
        newImagePreviews.forEach(preview => {
          if (preview.url) {
            URL.revokeObjectURL(preview.url);
          }
        });

        navigate('/groupbuy');
      } else {
        const errorText = await response.text();
        alert('요청 실패: ' + errorText);
      }
    } catch (err) {
      console.error('요청 실패', err);
      alert('서버 연결 실패');
    }
  };

  const handleCancel = () => {
    // 메모리 정리
    newImagePreviews.forEach(preview => {
      if (preview.url) {
        URL.revokeObjectURL(preview.url);
      }
    });
    navigate('/groupbuy');
  };


  useEffect(() => {
  const fetchRole = async () => {
    try {
      const res = await fetch("/api/roleinfo", {
        credentials: "include",
      });
      const text = await res.text();
      setRole(text);
      if (text !== "ROLE_ADMIN") {
        alert('접근 권한이 없습니다.');
        navigate('/');
      }
    } catch (e) {
      console.error("roleinfo 요청 실패:", e);
      navigate("/");
    }
  };
  fetchRole();
}, [navigate]);

  // 컴포넌트 언마운트 시 메모리 정리
  useEffect(() => {
    return () => {
      newImagePreviews.forEach(preview => {
        if (preview.url) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, []);

  return (
    <Section>
      <div className="gbw-write-wrapper">
        <div className="write-container">
          <form className="gbw-input-form" onSubmit={handleSubmit}>
            <h2>{isEdit ? '공동구매 글 수정' : '공동구매 글 작성'}</h2>

            <label>제목</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <label>제품 상세 링크</label>
            <input
              name="productUrl"
              value={formData.productUrl}
              onChange={handleChange}
            />

            <label>내용</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
            />

            <label>상품 설명</label>
            <input
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />

            <label>정가</label>
            <input
              name="originalPrice"
              type="number"
              value={formData.originalPrice}
              onChange={handleChange}
              required
            />

            <label>할인가</label>
            <input
              name="salePrice"
              type="number"
              value={formData.salePrice}
              onChange={handleChange}
              required
            />

            <label>최대 인원</label>
            <input
              name="maxParticipants"
              type="number"
              value={formData.maxParticipants}
              onChange={handleChange}
              required
            />

            <label>최소 인원</label>
            <input
              name="minParticipants"
              type="number"
              value={formData.minParticipants}
              onChange={handleChange}
              required
            />

            <label>최대 수량</label>
            <input
              name="maxQuantity"
              type="number"
              value={formData.maxQuantity}
              onChange={handleChange}
              required
            />

            <label>마감일</label>
            <input
              name="deadline"
              type="datetime-local"
              value={formData.deadline}
              onChange={handleChange}
              required
            />

            <label>현재 인원</label>
            <input
              name="currentParticipants"
              type="number"
              value={formData.currentParticipants}
              disabled
              readOnly
            />

            {/* 기존 이미지들 표시 */}
            {existingImages.length > 0 && (
              <div className="image-preview-area">
                <h4>기존 이미지</h4>
                {existingImages.map((img, idx) => (
                  <div key={`existing-${img.id}`} className="image-preview-wrapper">
                    <img src={img.url} alt={`기존 이미지 ${idx + 1}`} />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => handleExistingImageRemove(img.id, idx)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 새로 추가된 이미지들 표시 */}
            {newImagePreviews.length > 0 && (
              <div className="image-preview-area">
                <h4>새로 추가된 이미지</h4>
                {newImagePreviews.map((preview, idx) => (
                  <div key={`new-${idx}`} className="image-preview-wrapper">
                    <img src={preview.url} alt={`새 이미지 ${idx + 1}`} />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => handleNewImageRemove(idx)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="form-bottom">
              <div className="button-area">
                <label className="upload-button">
                  이미지 첨부
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>

                <div>
                  <button type="button" className="gbw-cancel-button" onClick={handleCancel}>취소</button>
                  <button type="submit" className="gbw-submit-button">{isEdit ? '수정' : '등록'}</button>
                </div>

              </div>
            </div>
          </form>
        </div>
      </div>
    </Section>
  );
};

export default GroupBuyWritePage;