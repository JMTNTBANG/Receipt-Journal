import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from "@capacitor-community/sqlite";

export interface Receipt {
    id?: number;
    vendor?: string;
    sale_total?: number;
    transaction_date?: string;
    category?: string;
    image_uri?: string;
    note?: string;
    currency_code?: string;
    payment_method?: string;
    subtotal?: number;
    tax?: number;
    date_added?: string;
}

class Database {
    private db: SQLiteDBConnection | null = null;
    private sqlite: SQLiteConnection | null = null;
    private readonly DB_NAME = 'receiptjournal';

    async initDB() {
        if (this.sqlite) {
            return;
        }

        try {
            this.sqlite = new SQLiteConnection(CapacitorSQLite)
            const isConsistent = (await this.sqlite.checkConnectionsConsistency()).result
            const isConnected = (await this.sqlite.isConnection(this.DB_NAME, false)).result

            if (isConsistent && isConnected) {
                this.db = await this.sqlite.retrieveConnection(this.DB_NAME, false);
            } else {
                this.db = await this.sqlite.createConnection(this.DB_NAME, false, 'no-encryption', 1, false)
            }

            await this.db.open();
            await this.createSchema();
        } catch (error) {
            console.error("Error Initializing Database: ", error);
        }
    }

    private async createSchema() {
        if (!this.db) return;

        const schema = `
            CREATE TABLE IF NOT EXISTS receipts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vendor TEXT,
                sale_total REAL,
                transaction_date TEXT,
                category TEXT,
                image_uri TEXT,
                note TEXT,
                currency_code TEXT,
                payment_method TEXT,
                subtotal REAL,
                tax REAL,
                date_added TEXT DEFAULT CURRENT_TIMESTAMP 
            )
        `
        await this.db.execute(schema);
    }

    async getReceipts(): Promise<Receipt[]> {
        const db = await this.retrieveDB();
        if (!db) return [];

        const result = await db.query(`SELECT * FROM receipts ORDER BY transaction_date DESC;`);
        return result.values || [];
    }

    async createReceipt(receipt: Receipt): Promise<void> {
        const db = await this.retrieveDB();
        if (!db) {
            console.error("Database Connection Error");
            return;
        }
        try {
            const query = `INSERT INTO receipts (vendor, sale_total, transaction_date, category, image_uri, note,
                        currency_code, payment_method, subtotal, tax) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const values = [
                receipt.vendor, receipt.sale_total, receipt.transaction_date, receipt.category, receipt.image_uri,
                receipt.note, receipt.currency_code, receipt.payment_method, receipt.subtotal, receipt.tax
            ];

            await db.run(query, values);
        } catch (error) {
            console.error("Error Adding Receipt: ", error);
        }
    }

    async editReceipt(receiptId: number, receipt: Receipt): Promise<void> {
        const db = await this.retrieveDB();
        if (!db) {
            console.error("Database Connection Error");
            return;
        }
        try {
            const query = `UPDATE receipts SET vendor = ?, sale_total = ?, transaction_date = ?, category = ?,
                    image_uri = ?, note = ?, currency_code = ?, payment_method = ?, subtotal = ?, tax = ? WHERE id = ?`
            const values = [
                receipt.vendor, receipt.sale_total, receipt.transaction_date, receipt.category, receipt.image_uri,
                receipt.note, receipt.currency_code, receipt.payment_method, receipt.subtotal, receipt.tax, receiptId
            ];

            await db.run(query, values);
        } catch (error) {
            console.error("Error Editing Receipt: ", error);
        }
    }

    async deleteReceipt(receiptId: number): Promise<void> {
        const db = await this.retrieveDB();
        if (!db) {
            console.error("Database Connection Error");
            return;
        }
        try {
            const query = `DELETE FROM receipts WHERE id = ?`;
            const values = [receiptId];
            await db.run(query, values);
        } catch (error) {
            console.error("Error deleting Receipt: ", error);
        }
    }

    async retrieveDB() {
        if (!this.db) {
            await this.initDB();
        }
        return this.db;
    }
}

export const sqlite = new Database()