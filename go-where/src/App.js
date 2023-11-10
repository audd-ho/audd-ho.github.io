// import logo from './logo.svg';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';
import Home from './components/pages/Home';
import CreateGroup from './components/pages/CreateGroup';
import GroupPage from './components/pages/GroupPage';
//mport {ErrorPage} from './components/pages/ErrorPage';
import HomeLayout from './components/pages/HomeLayout';
import GroupLayout from './components/pages/GroupLayout';
import {Testy} from './components/pages/test';
import GroupHome from './components/pages/GroupHome';
//import UserInfo from './components/pages/UserInfo';
import JoinGroup from './components/pages/JoinGroup';
import GroupLobby from './components/pages/GroupLobby';
import AddUser from './components/pages/AddUser';
import EditUserInfo from './components/pages/EditUserInfo';
import GroupActivities from './components/pages/GroupActivities';
import ActivityPage from './components/pages/ActivityPage';


//import {ChooseDateTimeBox} from './components/ChooseDateTimeBox';
//<div>< ChooseDateTimeBox /></div>

function App() {
  return (
	
	<Router>
    <Routes>
      <Route path="/" element={< HomeLayout />}>
          <Route index element={ < Home />} />
          <Route path="CreateGroup" element={< CreateGroup />}/>
          <Route path="JoinGroup" element={< JoinGroup />}/>
          <Route path="AddUser" element={< AddUser />} />
          {/*<Route path="GroupPage" element={< GroupPage />}/>*/}
          <Route path="/JoinGroup/*" element={< GroupLobby />}/>
       </Route> 
       <Route path="/GroupPage/" element={< GroupLayout />}> {/* the group home or like selecting page all lie on this page? or? */}
          <Route index element={< GroupPage />} />
          <Route path="Home" element={< GroupHome />}/>
          <Route path="EditUserInfo" element={< EditUserInfo />} />
          { <Route path="Activities" element={< GroupActivities />} /> }
          {/* <Route path="Activities" element={< ActivityPage />} /> */}
          <Route path="*" element={< Testy />} />
          
       </Route>
       <Route path="/GroupPage/*/" element={< GroupLayout />}> {/* the group home or like selecting page all lie on this page? or? */}
          {/*<Route index element={ < Testy />} />*/}
          <Route path="*" element={< GroupPage />}/> {/*GroupPage*/}
       </Route>
    </Routes>
  </Router>
    
    
    // <div className="App"> {
	// 	/* <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header> */}
    // </div>
  );
}

export default App;
