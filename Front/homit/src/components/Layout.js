import Header from './Header';   // 기존에 만든 Header 재사용
import Footer from './Footer';   // 푸터도 만들었다면 같이           // (선택) 공통 스타일
import { Outlet } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      {/* Outlet을 쓰는 이유 : 중첩 라우트 구조가 필요할때 Outlet을 써야 중첩된 element가 나타남 */}
      <main><Outlet/></main>
      <Footer />
    </>
  );
};

export default Layout;
