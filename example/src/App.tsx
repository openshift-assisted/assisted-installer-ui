import React from 'react';
import { Demo } from 'facet-lib';
import logo from './logo.svg';
import './App.css';
import 'facet-lib/dist/facet-lib.css'
const App: React.FC = () => {
	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<Demo type="success">HELLO World</Demo>
			</header>
		</div>
	);
};

export default App;
