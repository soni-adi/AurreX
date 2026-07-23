import{useEffect,lazy,Suspense}from'react'
import{BrowserRouter,Routes,Route,Navigate}from'react-router-dom'
import{Toaster}from'react-hot-toast'
import{useAuthStore,useThemeStore}from'@/store'
import ProtectedRoute from'@/components/ProtectedRoute'
import LeaderLayout from'@/components/LeaderLayout'
import StaffLayout from'@/components/StaffLayout'
import ManagerLayout from'@/components/ManagerLayout'

const Login=lazy(()=>import('@/pages/Login'))
const Signup=lazy(()=>import('@/pages/Signup'))
const ForgotPassword=lazy(()=>import('@/pages/ForgotPassword'))
const LeaderDashboard=lazy(()=>import('@/pages/leader/Dashboard'))
const LeaderProjects=lazy(()=>import('@/pages/leader/Projects'))
const LeaderProjectDetail=lazy(()=>import('@/pages/leader/ProjectDetail'))
const LeaderConnections=lazy(()=>import('@/pages/leader/Connections'))
const LeaderConnectionDetail=lazy(()=>import('@/pages/leader/ConnectionDetail'))
const LeaderHelp=lazy(()=>import('@/pages/leader/Help'))
const StaffDashboard=lazy(()=>import('@/pages/staff/Dashboard'))
const StaffConnections=lazy(()=>import('@/pages/staff/Connections'))
const StaffConnectionDetail=lazy(()=>import('@/pages/staff/ConnectionDetail'))
const StaffHelp=lazy(()=>import('@/pages/staff/Help'))
const ManagerDashboard=lazy(()=>import('@/pages/manager/Dashboard'))
const ManagerSets=lazy(()=>import('@/pages/manager/Sets'))
const ManagerSetDetail=lazy(()=>import('@/pages/manager/SetDetail'))
const ManagerConnections=lazy(()=>import('@/pages/manager/Connections'))
const ManagerConnectionDetail=lazy(()=>import('@/pages/manager/ConnectionDetail'))

const Loader=()=><div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"/></div>

export default function App(){
  const{init}=useThemeStore();const{clearUser}=useAuthStore()
  useEffect(()=>{
    init()
    const h=()=>clearUser()
    window.addEventListener('auth:logout',h)
    return()=>window.removeEventListener('auth:logout',h)
  },[])
  return(
    <BrowserRouter>
      <Toaster position="top-right"toastOptions={{duration:3000,style:{borderRadius:'12px',fontSize:'13px'}}}/>
      <Suspense fallback={<Loader/>}>
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
      </Suspense>
    </BrowserRouter>
  )
}
