// 게시글내용 + 이미지 컴포넌트 ( 댓글 쓸때마다 리렌더링 방지 )
import React from 'react';

const PostContent = React.memo(({ content, imgUrls }) => {
  const combined = content + (
    imgUrls?.length > 0
      ? imgUrls.map(url => `<img src="${url}" alt="첨부 이미지" class="content-image" />`).join('')
      : ''
  );

  return (
    <div
      className="content-box"
      dangerouslySetInnerHTML={{ __html: combined }}
    />
  );
});

export default PostContent;
