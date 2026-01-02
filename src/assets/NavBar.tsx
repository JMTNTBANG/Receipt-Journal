import {BottomNavigation, BottomNavigationAction} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import BackupIcon from "@mui/icons-material/Backup";

interface NavBarProps {
    activePage: string;
    setActivePage: (page: string) => void;
}

export default function NavBar({ activePage, setActivePage }: NavBarProps) {
    const pageToIndex: { [key: string]: number } = {
        'receipts': 0,
        'backup': 1
    };

    const indexToPage: { [key: number]: string } = {
        0: 'receipts',
        1: 'backup'
    };

    return (
        <BottomNavigation
            showLabels
            value={pageToIndex[activePage]}
            sx={{ backgroundColor: 'lightgray' }}
            onChange={(_event, newValue) => {
                setActivePage(indexToPage[newValue]);
            }}
        >
            <BottomNavigationAction label="Receipts" icon={<ReceiptLongIcon/>}/>
            <BottomNavigationAction label="Backup" icon={<BackupIcon/>}/>
        </BottomNavigation>
    )
}