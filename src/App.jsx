import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import About from './pages/About'
import Attendance from './pages/Attendance'
import Community from './pages/Community'
import StudyGroup from './pages/StudyGroup'
import Login from './features/auth/Login'
import SignUp from './features/auth/SignUp'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import VibeShop from './pages/VibeShop'
import Quest from './pages/Quest'
import Inventory from './pages/Inventory'
import BattleArena from './pages/BattleArena'
import Exchange from './pages/Exchange'
import VibeSandbox from './pages/VibeSandbox'
import VibeMarket from './pages/VibeMarket'
import VibeDNA from './pages/VibeDNA'
import SeasonPass from './pages/SeasonPass'
import Ranking from './pages/Ranking'
import Friends from './pages/Friends'
import DirectMessages from './pages/DirectMessages'
import MentorFinding from './pages/MentorFinding'
import MentorApplicationForm from './pages/MentorApplicationForm'
import MentorProfileSetup from './pages/MentorProfileSetup'
import MentorBooking from './pages/MentorBooking'
import AIStudyPartner from './pages/AIStudyPartner'
import Payment from './pages/Payment'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFail from './pages/PaymentFail'
import ClassRoom from './pages/ClassRoom'
import AdminMentorPage from './pages/AdminMentorPage'
import InteractiveDemo from './pages/InteractiveDemo'
import CanIDoItPage from './pages/CanIDoItPage'
import WeeklyChallengePageWrapper from './pages/WeeklyChallengePageWrapper'
import GalleryPage from './pages/GalleryPage'
import LearnPage from './pages/LearnPage'
import CommunityPage from './pages/CommunityPage'
import StarterGuide from './pages/StarterGuide'
import { AuthProvider } from './context/AuthContext'
import { useAnalytics } from './hooks/useAnalytics'

function AppRoutes() {
    useAnalytics() // Log visits

    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/community" element={<Community />} />
                <Route path="/study" element={<StudyGroup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/shop" element={<VibeShop />} />
                <Route path="/quest" element={<Quest />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/battle" element={<BattleArena />} />
                <Route path="/battle/:roomId" element={<BattleArena />} />
                <Route path="/exchange" element={<Exchange />} />
                <Route path="/sandbox" element={<VibeSandbox />} />
                <Route path="/market" element={<VibeMarket />} />
                <Route path="/vibe-dna" element={<VibeDNA />} />
                <Route path="/season-pass" element={<SeasonPass />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/messages" element={<DirectMessages />} />
                <Route path="/mentor" element={<MentorFinding />} />
                <Route path="/mentor-application" element={<MentorApplicationForm />} />
                <Route path="/mentor-profile-setup" element={<MentorProfileSetup />} />
                <Route path="/mentor-booking" element={<MentorBooking />} />
                <Route path="/ai-study" element={<AIStudyPartner />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-fail" element={<PaymentFail />} />
                <Route path="/classroom" element={<ClassRoom />} />
                <Route path="/admin-mentors" element={<AdminMentorPage />} />
                <Route path="/demo" element={<InteractiveDemo />} />
                <Route path="/diagnosis" element={<CanIDoItPage />} />
                <Route path="/challenge" element={<WeeklyChallengePageWrapper />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/moments" element={<CommunityPage />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/starter-guide" element={<StarterGuide />} />
            </Route>
        </Routes>
    )
}

import { ToastProvider } from './context/ToastContext'
import { FocusCamProvider } from './context/FocusCamContext'

function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <FocusCamProvider>
                    <AppRoutes />
                </FocusCamProvider>
            </AuthProvider>
        </ToastProvider>
    )
}

export default App
