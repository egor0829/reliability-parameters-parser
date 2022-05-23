import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {Equipment} from 'src/types/equipment';
import EquipmentPage from 'src/components/EquipmentPage/EquipmentPage';
import EquipmentListPage from 'src/components/EquipmentListPage/EquipmentListPage';

const App: React.FC = () => {
    const [activeEquipmentListItem, setActiveEquipmentListItem] = React.useState<Equipment | null>(null);

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={<EquipmentListPage setActiveEquipmentListItem={setActiveEquipmentListItem} />}
                />
                <Route path={`/:equipmentId`} element={<EquipmentPage equipmentItem={activeEquipmentListItem!} />} />
            </Routes>
        </Router>
    );
};

export default App;
