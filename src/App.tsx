import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { useContent, useUpdates } from './lib/data'

export default function App() {
  const content = useContent()
  const updates = useUpdates()

  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Home content={content} updates={updates} />
      </main>
      <Footer site={content.site} />
    </div>
  )
}
