import { useState } from 'react';
import './App.css';
import { UserGroupList } from './UserGroupList';
import { IUserGroup } from './types';

function App() {
  let [selectedGroup, setSelectedUserGroup] = useState<IUserGroup | null>(null);

  return (
    <div className="App">
      <UserGroupList setSelectedUserGroup={setSelectedUserGroup} selectedGroup={selectedGroup} />
    
    </div>
  );
}

export default App;
