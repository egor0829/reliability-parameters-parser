import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App';
import qs from 'qs';

import 'bootstrap/dist/css/bootstrap.min.css';

axios.defaults.baseURL = 'http://localhost:5000/';

// Format nested params correctly
axios.interceptors.request.use((config) => {
    config.paramsSerializer = (params) => {
        // Qs is already included in the Axios package
        return qs.stringify(params, {
            arrayFormat: 'brackets',
            encode: false
        });
    };

    return config;
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
