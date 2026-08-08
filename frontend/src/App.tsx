import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes'
import { AuthBootstrap } from '@/components/auth/auth-bootstrap'

function App() {
  return (
    <AuthBootstrap>
      <RouterProvider router={router} />
    </AuthBootstrap>
  )
}

export default App
