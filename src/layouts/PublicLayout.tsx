import { Outlet } from 'react-router-dom'

export const PublicLayout = () => {
  return (
    <main style={{ minHeight: '100vh' }}>
      <Outlet />
    </main>
  )
}
