import {Box, ListItem, ListItemButton, ListItemText, Typography} from "@mui/material";
import {List, type RowComponentProps} from "react-window";
import NewReceiptButton from "../assets/NewReceiptButton.tsx";
import {type Receipt, sqlite} from "../services/sqlite.ts";
import {useCallback, useEffect, useState} from "react";
import ReceiptDetailDrawer from "../assets/ReceiptDetailDrawer.tsx";
import { App } from '@capacitor/app';

export default function ReceiptsList() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [drawerOpen, setDrawerState] = useState<boolean>(false);
    const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

    useEffect(() => {
        const loadReceipts = async () => {
            const fetchedReceipts = await sqlite.getReceipts();
            setReceipts(fetchedReceipts);
        };
        loadReceipts();
    }, [refreshKey]);

    useEffect(() => {
        if (!drawerOpen) return;
        const listener = App.addListener('backButton', () => {
            setDrawerState(false)
        })
        return () => {
            listener.then(listener => listener.remove())
        }
    }, [drawerOpen]);

    const saveReceipt = async (receiptData: Omit<Receipt, 'id' | 'date_added'>) => {
        if (selectedReceipt && selectedReceipt.id) {
            await sqlite.editReceipt(selectedReceipt.id, receiptData)
        } else await sqlite.createReceipt(receiptData);
        setRefreshKey(oldKey => oldKey + 1);
    }

    const deleteReceipt = async () => {
        if (selectedReceipt && selectedReceipt.id) {
            await sqlite.deleteReceipt(selectedReceipt.id)
        } else return;
        setRefreshKey(oldKey => oldKey + 1);
    }

    const renderRow = useCallback((props: RowComponentProps) => {
        const { index, style } = props;
        const receipt = receipts[index];

        if (!receipt) {
            return <ListItem style={style} key={`empty-${index}`} component="div" disablePadding />;
        }

        return (
            <ListItem style={style} key={receipt.id!} component="div" disablePadding onClick={() => {
                setSelectedReceipt(receipt);
                setDrawerState(true)
            }}>
                <ListItemButton>
                    <ListItemText
                        primary={receipt.vendor}
                        secondary={`$${receipt.sale_total?.toFixed(2)} - ${new Date(receipt.transaction_date || 0).toLocaleDateString()}`}
                    />
                </ListItemButton>
            </ListItem>
        );
    }, [receipts]);

    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Typography variant="h3" padding={"20px"}>Receipt List</Typography>
            <Box sx={{flex: 1, overflowY: 'auto'}}>
                {receipts.length > 0 ? (
                    <List
                        rowHeight={50}
                        rowCount={receipts.length}
                        rowProps={{}}
                        overscanCount={5}
                        rowComponent={renderRow}
                    />
                ):(
                    <Typography sx={{padding: "20px", textAlign: "center"}}>
                        No receipts yet. Add one!
                    </Typography>
                )}
            </Box>
            <NewReceiptButton onClick={() => {
                setSelectedReceipt(null)
                setDrawerState(true)
            }}/>
            <ReceiptDetailDrawer
                key={selectedReceipt ? selectedReceipt.id : 'new'}
                open={drawerOpen}
                onClose={() => {
                    setSelectedReceipt(null);
                    setDrawerState(false)
                }}
                onSave={saveReceipt}
                onDelete={deleteReceipt}
                receipt={selectedReceipt}
            />
        </Box>
    );
}
