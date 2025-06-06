// 리렌더링 방지 댓글 영역
import React, { useEffect, useState } from 'react';
import './CommentSection.css';

const CommentSection = ({ postId, currentUser }) => {
    const [commentList, setCommentList] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const [editCommentId, setEditCommentId] = useState(null); // 수정 중인 댓글 ID
    const [editContent, setEditContent] = useState(''); // 수정 중인 내용

    // 댓글 불러오기
    const fetchComments = async () => {
        const res = await fetch(`/api/comment/list/COMMUNITY/${postId}`);
        const data = await res.json();
        setCommentList(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!commentInput.trim()) return;

        const res = await fetch("/api/comment/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                entityType: "COMMUNITY",
                postId,
                content: commentInput
            })
        });

        if (res.ok) {
            setCommentInput('');
            fetchComments(); // 댓글 다시 불러오기
        } else {
            alert("댓글 등록 실패");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        const res = await fetch(`/api/comment/delete/${id}`, {
            method: "DELETE",
            credentials: "include"
        });

        if (res.ok) {
            fetchComments(); // 삭제 후 다시 불러오기
        } else {
            alert("댓글 삭제 실패");
        }
    };

    const startEdit = (comment) => {
        setEditCommentId(comment.id);
        setEditContent(comment.content);
    };

    const cancelEdit = () => {
        setEditCommentId(null);
        setEditContent('');
    };

    const handleUpdate = async () => {
        const res = await fetch(`/api/comment/update`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                commentId: editCommentId,
                content: editContent
            })
        });

        if (res.ok) {
            setEditCommentId(null);
            setEditContent('');
            fetchComments(); // 수정 후 다시 불러오기
        } else {
            alert("댓글 수정 실패");
        }
    };


    return (
        <div className="comment-box">
            <h3>댓글</h3>
            <form onSubmit={handleSubmit}>
                <textarea
                    className="comment-textarea"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder={currentUser ? "댓글을 입력하세요..." : "로그인 후 작성하세요"}
                    readOnly={!currentUser}
                />
                {currentUser && (
                    <button type="submit" className="comment-submit-btn">댓글 등록</button>
                )}
            </form>

            <ul className="comment-list">
                {commentList.map((comment) => (
                    <li key={comment.id} className="comment-item">
                        <div className="comment-profile">
                            <img src={comment.profileImage || "/profileimages/default.png"} alt="프로필" />
                        </div>

                        <div className="comment-content">
                            <div className="comment-meta">
                                <div className='comment-meta-left'>
                                    <strong>{comment.username}</strong> • {new Date(comment.createdAt).toLocaleDateString()}
                                </div>

                                <div className="comment-icon-buttons">
                                    {currentUser === comment.username ? (
                                        <>
                                            <button onClick={() => startEdit(comment)} className="icon-btn">✏️</button>
                                            <button onClick={() => handleDelete(comment.id)} className="icon-btn">❌</button>
                                        </>

                                    ) : (
                                        <></>

                                    )}
                                </div>
                            </div>

                            {editCommentId === comment.id ? (
                                <>
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="comment-edit-textarea"
                                    />
                                    <div className="comment-actions">
                                        <button onClick={handleUpdate} className="comment-save-btn">저장</button>
                                        <button onClick={cancelEdit} className="comment-cancel-btn">취소</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>{comment.content}</div>

                                </>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

        </div>
    );
};

export default CommentSection;
