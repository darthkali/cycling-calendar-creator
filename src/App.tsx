import './App.css';
import EventTable from './component/EventTable';

function App() {
    return (
        <div className="App">
            <div className="caption"><img className={'logo'} src="/assets/images/logo.png" width={100} height={100} alt=""/> <h1> Radsport Event Planer</h1></div>

            <EventTable />
        </div>
    );
}

export default App;