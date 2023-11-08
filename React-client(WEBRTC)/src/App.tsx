import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Rtcclient from './Rtcclient'
import Landing from './Landing';

function App() { 
return (
    <>
    <Router>
      <Routes>
        <Route path="/meeting/:roomId" element={<Rtcclient/>} />
        <Route path="*" element={<Landing/>} />
      </Routes>
    </Router>
    </>
  )
}

export default App
