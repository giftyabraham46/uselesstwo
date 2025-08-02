import React from 'react';
import Map from './Map';
import Sidebar from './Sidebar';

const App = () => (
  <div style={{ display: 'flex' }}>
    <Sidebar />
    <Map />
  </div>
);

export default App;
