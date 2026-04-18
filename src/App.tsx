import { useState } from 'react';
import './App.css';
import EventTable from './component/EventTable';
import SettingsPage from './component/SettingsPage';

function App() {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <div className="App">
            <div className="caption">
                <img className={'logo'} src="/assets/images/logo.png" width={56} height={56} alt=""/>
                <h1>Radsport Event Planer</h1>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowSettings(true)} title="Einstellungen">
                    ⚙️
                </button>
            </div>

            {showSettings
                ? <SettingsPage onBack={() => setShowSettings(false)} />
                : <EventTable />
            }
        </div>
    );
}

export default App;
