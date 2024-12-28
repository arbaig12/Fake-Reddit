import React, { useContext } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Welcome from './welcome.jsx';
import Main from './main.jsx';
import ErrorView from './errorView.jsx'
import { AuthContext } from './authContext.jsx';
import { ErrorContext } from './errorContext.jsx';

// import Home from './Home';

// export default function MainRouter() {
//     // get auth context here
//     let authContext = useContext(AuthContext)
//   return (
//     <Router>
//       <Routes>
//         {/* If logged in, show Home; otherwise, show Welcome */}
//         <Route path="/" element={authContext.authState.isLoggedIn || authContext.authState.isGuest ? <Main /> : <Welcome />} />

//         {/* Define other routes here */}
//         {/* <Route path="/profile" element={authState.isLoggedIn ? <Profile /> : <Navigate to="/" />} /> */}

//         {/* Fallback for unmatched routes */}
//         <Route path="*" element={<Navigate to="/" />} />
//       </Routes>
//     </Router>
//   );
// }


export default function MainRouter() {
  let authContext = useContext(AuthContext)
  let errorContext = useContext(ErrorContext);

  if (errorContext.errorCall) {
    return <ErrorView />;
  }

  return (
    <>
      {(authContext.authState.isLoggedIn || authContext.authState.isGuest) &&  !errorContext.errorCall ? <Main /> : <Welcome />}
    </>
  );
}