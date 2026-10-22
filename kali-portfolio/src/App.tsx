import { useState } from 'react'
import BootSequence from './components/BootSequence'
import Desktop from './components/Desktop'

function App() {
  const [booted, setBooted] = useState(false)

  return (
    <div className="h-full w-full overflow-hidden bg-[#070a0f] text-cyan-50">
      {booted ? (
        <Desktop />
      ) : (
        <BootSequence onComplete={() => setBooted(true)} />
      )}
    </div>
  )
}

export default App
