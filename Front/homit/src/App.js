import './App.css';
import MainPage from './pages/mainpage/MainPage';
import { Route, Routes } from 'react-router-dom';
import GroupBuyPage from './pages/groupbuypage/GroupBuyPage';
import BoardPage from './pages/boardpage/BoardPage';
import RecipePage from './pages/recipepage/RecipePage';
import RecipeInfoPage from './pages/recipepage/RecipeInfoPage';
import HotItemPage from './pages/hotitempage/HotItemPage';
import LoginPage from './pages/loginpage/LoginPage';
import MemberPage from './pages/memberpage/MemberPage';
import Layout from './components/Layout';
import GroupBuyInfoPage from './pages/groupbuypage/GroupBuyInfoPage';
import GroupBuyWritePage from './pages/groupbuypage/GroupBuyWritePage';
import BoardInfoPage from './pages/boardpage/BoardInfoPage';
import BoardWritePage from './pages/boardpage/BoardWritePage';
import MyPage from './pages/mypage/MyPage';
import EditProfile from './pages/mypage/MyPageEditProfile';
import { AuthProvider } from './utils/AuthProvider';
import PaymentPage from './pages/groupbuypage/PaymentPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* 헤더/푸터 있는 페이지들 */}
        <Route element={<Layout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/groupbuy" element={<GroupBuyPage />} />
          <Route path="/groupbuy/info/:id" element={<GroupBuyInfoPage />} />
          <Route path="/groupbuy/write" element={<GroupBuyWritePage />} />
          <Route path="/groupbuy/admin/edit/:id" element={<GroupBuyWritePage />} />

          <Route path="/board" element={<BoardPage />} />
          <Route path="/board/info/:category/:id" element={<BoardInfoPage />} />
          <Route path="/board/write" element={<BoardWritePage />} />
          <Route path="/board/edit/:category/:id" element={<BoardWritePage />} />

          <Route path="/recipe" element={<RecipePage />} />
          <Route path="/RecipeInfoPage" element={<RecipeInfoPage />} />

          <Route path="/popular" element={<HotItemPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/member" element={<MemberPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/editProfile" element={<EditProfile />} />
        </Route>

        {/* 헤더/푸터 없는(단독) 페이지 */}
        <Route path="/payment/:id" element={<PaymentPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
