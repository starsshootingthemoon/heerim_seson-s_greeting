import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/noto-sans-kr/400.css';
import '@fontsource/noto-serif-kr/400.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import './styles.css';
import MotionGreeting from './MotionGreeting.jsx';
createRoot(document.getElementById('root')).render(<MotionGreeting video={window.location.pathname.split('/').includes('v3')} />);
