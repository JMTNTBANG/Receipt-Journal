import {Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography} from "@mui/material";
import BackupTableIcon from '@mui/icons-material/BackupTable';
import DataObjectIcon from '@mui/icons-material/DataObject';
import {useEffect, useState} from "react";
import {Directory, Filesystem} from "@capacitor/filesystem";
import JSZip from "jszip";
import {sqlite} from "../services/sqlite.ts";

export default function BackupPage() {
    const [backupType, setBackupType] = useState('')
    useEffect(() => {
        const exportFile = async () => {
            try {
                if (backupType === '') return;
                if (!confirm("The Database will be backed up to a .zip file containing a ." + backupType +
                    " file, and all of the images stored in the database.")) return;
                let data = ''
                const receipts = await sqlite.getReceipts()
                const fileName = `ReceiptJournalBackup-${new Date().toISOString().replaceAll(':', '-')}.`
                const zip = new JSZip();
                const photos = await Filesystem.readdir({
                    path: '',
                    directory: Directory.Data
                })
                for (const photo of photos.files) {
                    if (!photo.name.endsWith('.jpeg')) continue;
                    const photoData = await Filesystem.readFile({ path: photo.uri })
                    const receipt = receipts.find((receipt) => receipt.image_uri === photo.uri)
                    if (receipt) receipt.image_uri = photo.name
                    zip.file(photo.name, photoData.data)
                }
                switch (backupType) {
                    case 'csv':
                        data += `ID,Vendor,Transaction Date,Category,Payment Method,Currency,Subtotal,Sales Tax,Sale Total,Notes,Image URI,Date Added\n`
                        for (const receipt of receipts) {
                            const receiptData = [receipt.id, receipt.vendor,
                                receipt.transaction_date, receipt.category, receipt.payment_method,
                                receipt.currency_code, receipt.subtotal, receipt.tax, receipt.sale_total, receipt.note,
                                receipt.image_uri, receipt.date_added]
                            data += receiptData.join(',') + '\n'
                        }
                        break;
                    case 'json':
                        data = JSON.stringify(receipts, null, 2)
                        break;
                }
                zip.file(fileName + backupType, data)

                const generatedZip = await zip.generateAsync({type: 'base64', compression: 'DEFLATE'})
                const file = await Filesystem.writeFile({
                    path: fileName + 'zip',
                    data: generatedZip,
                    directory: Directory.Documents
                })
                alert('File saved to "' + file.uri + '"')
            } catch (error) {
                console.error('Error Saving or Sharing File:', error)
            }
        }
        exportFile()
    }, [backupType]);
    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,}}>
            <Typography variant="h3" sx={{padding: '20px'}}>Backup Page</Typography>
            <List>
                <ListItem disablePadding onClick={() => setBackupType('csv')}>
                    <ListItemButton>
                        <ListItemIcon>
                            <BackupTableIcon/>
                        </ListItemIcon>
                        <ListItemText primary={'Save Receipts as a Spreadsheet (CSV)'}/>
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding onClick={() => setBackupType('json')}>
                    <ListItemButton>
                        <ListItemIcon>
                            <DataObjectIcon/>
                        </ListItemIcon>
                        <ListItemText primary={'Save Receipts as a Code Snippet (JSON)'}/>
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );
}
