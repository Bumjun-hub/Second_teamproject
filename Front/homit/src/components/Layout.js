// src/components/common/Layout.js
import Header from './Header';   // 기존에 만든 Header 재사용
import Footer from './Footer';   // 푸터도 만들었다면 같이           // (선택) 공통 스타일

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
