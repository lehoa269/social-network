import React from 'react';

import Providers from './src/navigation';
import {LogBox} from 'react-native';

const App = () => {
  return <Providers />;
};
LogBox.ignoreAllLogs(); //Ignore all log notifications

export default App;
