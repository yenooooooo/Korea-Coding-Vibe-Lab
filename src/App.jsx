import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Login from './features/auth/Login'
import SignUp from './features/auth/SignUp'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { FocusCamProvider } from './context/FocusCamContext'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { useAnalytics } from './hooks/useAnalytics'

// Lazy load: 첫 로딩 시 불필요한 페이지들은 필요할 때 로드
const About = React.lazy(() => import('./pages/About'))
const Attendance = React.lazy(() => import('./pages/Attendance'))
const Community = React.lazy(() => import('./pages/Community'))
const StudyGroup = React.lazy(() => import('./pages/StudyGroup'))
const Profile = React.lazy(() => import('./pages/Profile'))
const Admin = React.lazy(() => import('./pages/Admin'))
const VibeShop = React.lazy(() => import('./pages/VibeShop'))
const Quest = React.lazy(() => import('./pages/Quest'))
const Inventory = React.lazy(() => import('./pages/Inventory'))
const BattleArena = React.lazy(() => import('./pages/BattleArena'))
const Exchange = React.lazy(() => import('./pages/Exchange'))
const VibeSandbox = React.lazy(() => import('./pages/VibeSandbox'))
const VibeMarket = React.lazy(() => import('./pages/VibeMarket'))
const VibeDNA = React.lazy(() => import('./pages/VibeDNA'))
const SeasonPass = React.lazy(() => import('./pages/SeasonPass'))
const Ranking = React.lazy(() => import('./pages/Ranking'))
const Friends = React.lazy(() => import('./pages/Friends'))
const DirectMessages = React.lazy(() => import('./pages/DirectMessages'))
const MentorFinding = React.lazy(() => import('./pages/MentorFinding'))
const MentorApplicationForm = React.lazy(() => import('./pages/MentorApplicationForm'))
const MentorProfileSetup = React.lazy(() => import('./pages/MentorProfileSetup'))
const MentorBooking = React.lazy(() => import('./pages/MentorBooking'))
const AIStudyPartner = React.lazy(() => import('./pages/AIStudyPartner'))
const Payment = React.lazy(() => import('./pages/Payment'))
const PaymentSuccess = React.lazy(() => import('./pages/PaymentSuccess'))
const PaymentFail = React.lazy(() => import('./pages/PaymentFail'))
const SeasonPassSuccess = React.lazy(() => import('./pages/SeasonPassSuccess'))
const ClassRoom = React.lazy(() => import('./pages/ClassRoom'))
const AdminMentorPage = React.lazy(() => import('./pages/AdminMentorPage'))
const InteractiveDemo = React.lazy(() => import('./pages/InteractiveDemo'))
const CanIDoItPage = React.lazy(() => import('./pages/CanIDoItPage'))
const WeeklyChallengePageWrapper = React.lazy(() => import('./pages/WeeklyChallengePageWrapper'))
const GalleryPage = React.lazy(() => import('./pages/GalleryPage'))
const LearnPage = React.lazy(() => import('./pages/LearnPage'))
const CommunityPage = React.lazy(() => import('./pages/CommunityPage'))
const StarterGuide = React.lazy(() => import('./pages/StarterGuide'))
const PromptLibrary = React.lazy(() => import('./pages/PromptLibrary'))
const Settings = React.lazy(() => import('./pages/Settings'))
const NotFound = React.lazy(() => import('./pages/NotFound'))
const ProjectShowcase = React.lazy(() => import('./pages/ProjectShowcase'))
const PointHistory = React.lazy(() => import('./pages/PointHistory'))
const Bookmarks = React.lazy(() => import('./pages/Bookmarks'))
const DailyChallenge = React.lazy(() => import('./pages/DailyChallenge'))
const CodeSnippets = React.lazy(() => import('./pages/CodeSnippets'))
const ThemeCustomizer = React.lazy(() => import('./pages/ThemeCustomizer'))
const StudyTimer = React.lazy(() => import('./pages/StudyTimer'))

const PageLoader = () => (
    <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 'calc(100vh - 120px)', color: '#64748b',
    }}>
        <div style={{ textAlign: 'center' }}>
            <div style={{
                width: '40px', height: '40px', margin: '0 auto 16px',
                border: '3px solid rgba(99,102,241,0.2)',
                borderTop: '3px solid #6366f1',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    </div>
)

function AppRoutes() {
    useAnalytics()

    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route element={<MainLayout />}>
                    {/* 누구나 접근 가능 */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/diagnosis" element={<CanIDoItPage />} />

                    {/* 읽기 허용 */}
                    <Route path="/community" element={<Community />} />
                    <Route path="/ranking" element={<Ranking />} />
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/learn" element={<LearnPage />} />
                    <Route path="/moments" element={<CommunityPage />} />
                    <Route path="/showcase" element={<ProjectShowcase />} />

                    {/* 로그인 필수 */}
                    <Route path="/demo" element={<ProtectedRoute><InteractiveDemo /></ProtectedRoute>} />
                    <Route path="/starter-guide" element={<ProtectedRoute><StarterGuide /></ProtectedRoute>} />
                    <Route path="/prompt-library" element={<ProtectedRoute><PromptLibrary /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
                    <Route path="/shop" element={<ProtectedRoute><VibeShop /></ProtectedRoute>} />
                    <Route path="/quest" element={<ProtectedRoute><Quest /></ProtectedRoute>} />
                    <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                    <Route path="/battle" element={<ProtectedRoute><BattleArena /></ProtectedRoute>} />
                    <Route path="/battle/:roomId" element={<ProtectedRoute><BattleArena /></ProtectedRoute>} />
                    <Route path="/exchange" element={<ProtectedRoute><Exchange /></ProtectedRoute>} />
                    <Route path="/sandbox" element={<ProtectedRoute><VibeSandbox /></ProtectedRoute>} />
                    <Route path="/market" element={<ProtectedRoute><VibeMarket /></ProtectedRoute>} />
                    <Route path="/vibe-dna" element={<ProtectedRoute><VibeDNA /></ProtectedRoute>} />
                    <Route path="/season-pass" element={<ProtectedRoute><SeasonPass /></ProtectedRoute>} />
                    <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
                    <Route path="/messages" element={<ProtectedRoute><DirectMessages /></ProtectedRoute>} />
                    <Route path="/mentor" element={<ProtectedRoute><MentorFinding /></ProtectedRoute>} />
                    <Route path="/mentor-application" element={<ProtectedRoute><MentorApplicationForm /></ProtectedRoute>} />
                    <Route path="/mentor-profile-setup" element={<ProtectedRoute><MentorProfileSetup /></ProtectedRoute>} />
                    <Route path="/mentor-booking" element={<ProtectedRoute><MentorBooking /></ProtectedRoute>} />
                    <Route path="/ai-study" element={<ProtectedRoute><AIStudyPartner /></ProtectedRoute>} />
                    <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
                    <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
                    <Route path="/payment-fail" element={<ProtectedRoute><PaymentFail /></ProtectedRoute>} />
                    <Route path="/season-pass-success" element={<ProtectedRoute><SeasonPassSuccess /></ProtectedRoute>} />
                    <Route path="/classroom" element={<ProtectedRoute><ClassRoom /></ProtectedRoute>} />
                    <Route path="/admin-mentors" element={<ProtectedRoute><AdminMentorPage /></ProtectedRoute>} />
                    <Route path="/study" element={<ProtectedRoute><StudyGroup /></ProtectedRoute>} />
                    <Route path="/challenge" element={<ProtectedRoute><WeeklyChallengePageWrapper /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/point-history" element={<ProtectedRoute><PointHistory /></ProtectedRoute>} />
                    <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
                    <Route path="/daily-challenge" element={<ProtectedRoute><DailyChallenge /></ProtectedRoute>} />
                    <Route path="/code-snippets" element={<ProtectedRoute><CodeSnippets /></ProtectedRoute>} />
                    <Route path="/theme" element={<ProtectedRoute><ThemeCustomizer /></ProtectedRoute>} />
                    <Route path="/study-timer" element={<ProtectedRoute><StudyTimer /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />

                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </Suspense>
    )
}

function App() {
    return (
        <ErrorBoundary>
            <ToastProvider>
                <AuthProvider>
                    <LanguageProvider>
                        <ThemeProvider>
                            <FocusCamProvider>
                                <AppRoutes />
                            </FocusCamProvider>
                        </ThemeProvider>
                    </LanguageProvider>
                </AuthProvider>
            </ToastProvider>
        </ErrorBoundary>
    )
}

export default App
