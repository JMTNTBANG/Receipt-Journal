import type {Receipt} from "../services/sqlite.ts";
import {useState} from "react";
import {Box, Button, Drawer, TextField, Typography} from "@mui/material";
import dayjs from "dayjs";
import {DateTimePicker} from "@mui/x-date-pickers";
import {Capacitor} from "@capacitor/core";
import { CameraAlt } from "@mui/icons-material";
import {Camera, CameraResultType, CameraSource} from "@capacitor/camera";
import { Filesystem, Directory } from '@capacitor/filesystem';
import Footer from "./Footer.tsx";

interface ReceiptDetailDrawerProps {
    open: boolean;
    onClose: () => void;
    onSave: (newReceipt: Omit<Receipt, 'id' | 'date_added'>) => Promise<void>;
    onDelete: () => Promise<void>;
    receipt: Receipt | null;
}

export default function ReceiptDetailDrawer({ open, onClose, onSave, onDelete, receipt }: ReceiptDetailDrawerProps) {
    const [vendor, setVendor] = useState<string>(receipt?.vendor || '');
    const [saleTotal, setSaleTotal] = useState<string>(receipt?.sale_total != null ? String(receipt?.sale_total) : '');
    const [transactionDate, setTransactionDate] = useState<dayjs.Dayjs | null>(receipt ? dayjs(receipt.transaction_date) : dayjs());
    const [category, setCategory] = useState<string>(receipt?.category || '');
    const [imageUri, setImageUri] = useState<string>(receipt?.image_uri || '');
    const [note, setNote] = useState<string>(receipt?.note || '');
    const [currencyCode, setCurrencyCode] = useState<string>(receipt?.currency_code || '');
    const [paymentMethod, setPaymentMethod] = useState<string>(receipt?.payment_method || '');
    const [subtotal, setSubtotal] = useState<string>(receipt?.subtotal != null ? String(receipt?.subtotal) : '');
    const [tax, setTax] = useState<string>(receipt?.tax != null ? String(receipt?.tax) : '');
    const saveReceipt = async () => {
        const newReceipt: Omit<Receipt, 'id' | 'date_added'> = {
            vendor: vendor,
            sale_total: parseFloat(saleTotal) || 0,
            transaction_date: transactionDate ? transactionDate.toISOString() : '',
            category: category,
            image_uri: imageUri,
            note: note,
            currency_code: currencyCode,
            payment_method: paymentMethod,
            subtotal: parseFloat(subtotal) || 0,
            tax: parseFloat(tax)
        }
        await onSave(newReceipt);
        onClose();
    }

    const deleteReceipt = async () => {
        if (confirm("Are you sure you want to delete?")) {
            await onDelete();
            onClose();
        }
    }

    const photoPick = async () => {
        try {
            const photo = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Uri,
                source: CameraSource.Prompt
            })

            if (!photo || !photo.path) {
                return;
            }

            const newFileName = new Date().getTime() + '.jpeg';
            const savedFile =  await Filesystem.copy({
                from: photo.path,
                to: newFileName,
                toDirectory: Directory.Data
            })

            setImageUri(savedFile.uri);
        } catch (error) {
            console.error("Error saving photo:", error);
        }
    }

    const closeDrawer = () => {
        onClose();
    }

    return (
        <Drawer
            anchor={"bottom"}
            open={open}
            onClose={closeDrawer}
            sx={{'& .MuiDrawer-paper': {maxHeight: '90vh'}}}
        >
            <Box sx={{ padding: '20px' }}>
                <Typography variant={'h5'} sx={{ marginBottom: 2 }}>Receipt Details</Typography>
                <TextField
                    label={'Vendor'}
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    fullWidth
                    sx={{ marginBottom: 2 }}
                    variant="outlined"
                    
                />
                <DateTimePicker
                    label={'Transaction Date'}
                    value={transactionDate}
                    onChange={(value) => setTransactionDate(value)}
                    sx={{ marginBottom: 2 }}
                    
                />
                <TextField
                    label={'Category'}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    fullWidth
                    sx={{ marginBottom: 2 }}
                    variant="outlined"
                    
                />
                <TextField
                    label={'Payment Method'}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    fullWidth
                    sx={{ marginBottom: 2 }}
                    variant="outlined"
                    
                />
                <TextField
                    label={'Currency (ex. USD)'}
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                    fullWidth
                    sx={{ marginBottom: 2 }}
                    variant="outlined"
                    
                />
                <TextField
                    label={'Subtotal (before Tax)'}
                    value={subtotal}
                    onChange={(e) => setSubtotal(e.target.value)}
                    fullWidth
                    sx={{ marginBottom: 2 }}
                    variant="outlined"
                    
                />
                <TextField
                    label={'Sales Tax'}
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    fullWidth
                    sx={{ marginBottom: 2 }}
                    variant="outlined"
                    
                />
                <TextField
                    label={'Sale Total (after Tax)'}
                    value={saleTotal}
                    onChange={(e) => setSaleTotal(e.target.value)}
                    fullWidth
                    sx={{ marginBottom: 2 }}
                    variant="outlined"
                    
                />
                <TextField
                    label={'Notes'}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    fullWidth
                    multiline
                    sx={{ marginBottom: 2 }}
                    variant="outlined"
                    
                />
                {imageUri && (
                    <img
                        src={Capacitor.convertFileSrc(imageUri)}
                        alt={"Receipt Image"}
                        style={{ width: '100%', height: 'auto', maxHeight: '200px', objectFit: 'contain', marginTop: '16px', marginBottom: '16px' }}
                    />
                )}
                <Button
                    variant="outlined"
                    onClick={photoPick}
                    startIcon={<CameraAlt/>}
                    fullWidth
                    sx={{ marginBottom: 2}}
                    
                >
                    {imageUri ? "Change Photo" : "Upload Photo"}
                </Button>
                <Box sx={{ display: 'flex', marginTop: 'auto' }}>
                    <Button onClick={saveReceipt} variant="contained" sx={{ marginRight: 2 }} >Save</Button>
                    <Button onClick={closeDrawer} variant='outlined'>Cancel</Button>
                    <Button onClick={deleteReceipt} variant='contained' color='warning' sx={{ marginLeft: 'auto' }}>Delete</Button>
                </Box>
                <Footer/>
            </Box>
        </Drawer>
    )
}