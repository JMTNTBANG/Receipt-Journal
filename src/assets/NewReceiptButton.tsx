import AddIcon from "@mui/icons-material/Add";
import {Fab} from "@mui/material";

interface NewReceiptButtonProps {
    onClick: () => void;
}

export default function NewReceiptButton({ onClick }: NewReceiptButtonProps) {
    return (
    <Fab onClick={onClick} sx={{position: 'absolute', bottom: '90px', right: '30px', width: '75px', height: '75px'}} color="primary" aria-label="add">
        <AddIcon sx={{width: '32px', height: '32px'}}/>
    </Fab>
    )
}