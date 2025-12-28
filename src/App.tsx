import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import {useEffect, useState} from "react";
import { Box } from "@mui/material";
import Header from "./assets/Header.tsx";
import NavBar from "./assets/NavBar.tsx";
import Footer from "./assets/Footer.tsx";
import ReceiptList from "./pages/ReceiptList.tsx";
import BackupPage from "./pages/BackupPage.tsx";
import { sqlite } from "./services/sqlite.ts";
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
                <Header/>
                <span style={{marginLeft: 'auto', marginRight: 'auto', marginTop: '5px'}}>Receipt Journal v0.2.0</span>
                {activePage === 'receipts' && <ReceiptList/>}
                {activePage === 'backup' && <BackupPage/>}
                <NavBar activePage={activePage} setActivePage={setActivePage} />
                <Footer/>
            </Box>
        </LocalizationProvider>
    );
}