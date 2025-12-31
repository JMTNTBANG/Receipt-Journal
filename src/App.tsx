import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import {useEffect, useState} from "react";
import {Box} from "@mui/material";
import NavBar from "./assets/NavBar.tsx";
import ReceiptList from "./pages/ReceiptList.tsx";
import BackupPage from "./pages/BackupPage.tsx";
import {sqlite} from "./services/sqlite.ts";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";

export default function App() {
    const [activePage, setActivePage] = useState('receipts');

    useEffect(() => {
        sqlite.initDB();
    }, []);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column'}}>
                <span style={{marginLeft: 'auto', marginRight: 'auto', paddingTop: '5px', paddingBottom: '5px', backgroundColor: 'lightgray', textAlign: 'center', width: '100%'}}>Receipt Journal v0.2.0</span>
                {activePage === 'receipts' && <ReceiptList/>}
                {activePage === 'backup' && <BackupPage/>}
                <NavBar activePage={activePage} setActivePage={setActivePage} />
            </Box>
        </LocalizationProvider>
    );
}