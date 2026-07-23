import{useEffect}from'react'
import{BrowserRouter,Routes,Route,Navigate}from'react-router-dom'
import{Toaster}from'react-hot-toast'
import{useAuthStore,useThemeStore}from'./store'
import ProtectedRoute from'./components/ProtectedRoute'
import LeaderLayout from'./components/LeaderLayout'
import StaffLayout from'./components/StaffLayout'
import ManagerLayout from'./components/ManagerLayout'
import Login from'./pages/Login'
import Signup from'./pages/Signup'
import ForgotPassword from'./pages/ForgotPassword'
import LeaderDashboard from'./pages/leader/Dashboard'
import LeaderProjects from'./pages/leader/Projects'
import LeaderProjectDetail from'./pages/leader/ProjectDetail'
import LeaderConnections from'./pages/leader/Connections'
import LeaderConnectionDetail from'./pages/leader/ConnectionDetail'
import LeaderHelp from'./pages/leader/Help'
import StaffDashboard from'./pages/staff/Dashboard'
import StaffConnections from'./pages/staff/Connections'
import StaffConnectionDetail from'./pages/staff/ConnectionDetail'
import StaffHelp from'./pages/staff/Help'
import ManagerDashboard from'./pages/manager/Dashboard'
import ManagerSets from'./pages/manager/Sets'
import ManagerSetDetail from'./pages/manager/SetDetail'
import ManagerConnections from'./pages/manager/Connections'
import ManagerConnectionDetail from'./pages/manager/ConnectionDetail'
export default function App(){
  const{init}=useThemeStore();const{clearUser}=useAuthStore()
  useEffect(()=>{init();const h=()=>clearUser();window.addEventListener('auth:logout',h);return()=>window.removeEventListener('auth:logout',h)},[])
  return(
    <BrowserRouter>
      <Toaster position="top-right"toastOptions={{duration:3000}}/>
      <Routes>
        <Route path="/login"element={<Login/>}/>
        <Route path="/signup"element={<Signup/>}/>
        <Route path="/forgot-password"element={<ForgotPassword/>}/>
        <Route element={<ProtectedRoute/>}>
          <Route element={<LeaderLayout/>}>
            <Route path="/"element={<Navigate to="/dashboard"replace/>}/>
            <Route path="/dashboard"element={<LeaderDashboard/>}/>
            <Route path="/projects"element={<LeaderProjects/>}/>
            <Route path="/projects/new"element={<LeaderProjectDetail/>}/>
            <Route path="/projects/:id"element={<LeaderProjectDetail/>}/>
            <Route path="/connections"element={<LeaderConnections/>}/>
            <Route path="/connections/new"element={<LeaderConnectionDetail/>}/>
            <Route path="/connections/:id"element={<LeaderConnectionDetail/>}/>
            <Route path="/help"element={<LeaderHelp/>}/>
          </Route>
          <Route element={<StaffLayout/>}>
            <Route path="/staff"element={<StaffDashboard/>}/>
            <Route path="/staff/connections"element={<StaffConnections/>}/>
            <Route path="/staff/connections/new"element={<StaffConnectionDetail/>}/>
            <Route path="/staff/connections/:id"element={<StaffConnectionDetail/>}/>
            <Route path="/staff/help"element={<StaffHelp/>}/>
          </Route>
          <Route element={<ManagerLayout/>}>
            <Route path="/manager"element={<ManagerDashboard/>}/>
            <Route path="/manager/sets"element={<ManagerSets/>}/>
            <Route path="/manager/sets/new"element={<ManagerSetDetail/>}/>
            <Route path="/manager/sets/:id"element={<ManagerSetDetail/>}/>
            <Route path="/manager/connections"element={<ManagerConnections/>}/>
            <Route path="/manager/connections/new"element={<ManagerConnectionDetail/>}/>
            <Route path="/manager/connections/:id"element={<ManagerConnectionDetail/>}/>
          </Route>
        </Route>
        <Route path="*"element={<Navigate to="/dashboard"replace/>}/>
      </Routes>
    </BrowserRouter>
  )
}