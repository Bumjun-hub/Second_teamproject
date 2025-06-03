import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './BoardWritePage.css';
import Section from './../../components/Section';

const BoardWritePage = () => {
  const navigate = useNavigate();
  const { id, category: urlCategory } = useParams();
  const isEdit = !!id;

  const [role, setRole] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]); // 전체 미리보기 이미지
  const [originalImageUrls, setOriginalImageUrls] = useState([]); // 기존 이미지만 따로 저장
  const [removedImages, setRemovedImages] = useState([]); // 삭제 대상 이미지

  // 사용자가 입력한 글 제목, 작성자, 카테고리, 내용 , 공지 여부 결정
  const [formData, setFormData] = useState({
    title: '',
    writer: '',
    category: 'FREE',
    content: '',
    isNotice: false,
  });

  useEffect(() => {
    if (isEdit && urlCategory) {
      fetch(`/api/community/detail/${urlCategory}/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            title: data.title,
            writer: data.username,
            category: data.category,
            content: data.content,
            isNotice: data.isNotice
          });

          if (data.imgUrls && data.imgUrls.length > 0) {
            setOriginalImageUrls(data.imgUrls);
            setPreviewUrls(data.imgUrls);
          }
        })
        .catch((err) => {
          console.error("수정용 게시글 불러오기 실패", err);
        });
    }
  }, [isEdit, id, urlCategory]);

  useEffect(() => {
    fetchRole();
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch("/api/mypage", {
          credentials: "include",
        });
        const data = await res.json();

        if (!isEdit) {
          setFormData((prev) => ({
            ...prev,
            writer: data.name, // 🔥 username을 writer에 세팅
          }));
        }
      } catch (e) {
        console.error("사용자 정보 불러오기 실패:", e);
      }
    };

    fetchUserInfo();
  }, [isEdit]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files); // 서버 업로드용

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...urls]);
  };

  const handleImageRemove = (index) => {
    const removedUrl = previewUrls[index];

    if (originalImageUrls.includes(removedUrl)) {
      setRemovedImages((prev) => [...prev, removedUrl]);
    }

    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('category', formData.category);
    data.append('isNotice', formData.isNotice ? "1" : "0");

    imageFiles.forEach((file) => {
      data.append("images", file);
    });

    if (isEdit) {
      data.append("removedImages", JSON.stringify(removedImages));
    }

    const url = isEdit
      ? `/api/community/edit/${id}`
      : '/api/community/write';

    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: data,
      });

      if (response.ok) {
        alert(isEdit ? "게시글이 수정되었습니다!" : "게시글이 등록되었습니다!");
        navigate('/board');
      } else {
        const errorText = await response.text();
        alert("요청 실패: " + errorText);
      }
    } catch (err) {
      console.error("요청 실패", err);
      alert("서버 연결 실패");
    }
  };

  const handleCancel = () => {
    navigate('/board');
  };

  const fetchRole = async () => {
    try {
      const res = await fetch("/api/roleinfo", {
        credentials: "include",
      });
      const text = await res.text();
      setRole(text);
    } catch (e) {
      console.error("roleinfo 요청 실패:", e);
    }
  };



  return (
    <Section>
      <div className="write-wrapper">
        <div className="write-container">
          <form id="writeForm" className="input-form" onSubmit={handleSubmit}>
            <h2>{isEdit ? "게시글 수정" : "게시글 작성"}</h2>

            <label>제목</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="제목을 입력해주세요"
              required
            />

            <label>작성자</label>
            <input
              name="writer"
              value={formData.writer}
              placeholder="작성자 이름"
              disabled
            />

            <label>카테고리</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="FREE">자유게시판</option>
              <option value="TIP">꿀팁</option>
              <option value="GROUP_BUY_REVIEW">공구후기</option>
              <option value="COOKING_REVIEW">요리후기</option>
            </select>

            <label>내용</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="내용을 입력해주세요"
              required
            />

            {previewUrls.length > 0 && (
              <div className="image-preview-area">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="image-preview-wrapper">
                    <img src={url} alt={`첨부 이미지 ${idx + 1}`} />
                    <button type="button" className="remove-image-btn" onClick={() => handleImageRemove(idx)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="form-bottom">
              <div className="button-area">
                <label className="upload-button">
                  첨부 이미지
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>

                <button type="button" className="cancel-button" onClick={handleCancel}>취소</button>
                <button type="submit" className="submit-button">{isEdit ? "수정" : "등록"}</button>
              </div>

              {role === "ROLE_ADMIN" && (
                <label>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={formData.isNotice}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isNotice: e.target.checked }))
                    }
                  />
                  공지글 등록
                </label>
              )}
            </div>
          </form>
        </div>
      </div>
    </Section>
  );
};

export default BoardWritePage;
