import React, { useState } from 'react';
import { getApiKey, setApiKey, clearApiKey } from '../utils/apiKeyStorage';
import './SettingsPage.css';

type Props = {
    onBack: () => void;
};

const SettingsPage: React.FC<Props> = ({ onBack }) => {
    const [keyInput, setKeyInput] = useState(() => getApiKey() ?? '');
    const [saved, setSaved] = useState(false);

    function handleSave() {
        setApiKey(keyInput.trim());
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    function handleClear() {
        clearApiKey();
        setKeyInput('');
    }

    return (
        <div className="settings-page">
            <button className="btn btn-ghost" onClick={onBack}>← Zurück</button>
            <h2>Einstellungen</h2>

            <div className="settings-section">
                <label htmlFor="api-key">Claude API-Key</label>
                <input
                    id="api-key"
                    type="password"
                    value={keyInput}
                    onChange={e => setKeyInput(e.target.value)}
                    placeholder="sk-ant-…"
                    className="settings-input"
                />
                <div className="settings-privacy">
                    🔒 Dein API-Key wird ausschließlich lokal in deinem Browser gespeichert
                    und niemals an Dritte weitergegeben.
                </div>
                <div className="settings-actions">
                    <button onClick={handleClear} className="btn btn-secondary">Löschen</button>
                    <button
                        onClick={handleSave}
                        className="btn btn-primary"
                        disabled={keyInput.trim().length === 0}
                    >
                        {saved ? '✓ Gespeichert' : 'Speichern'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
