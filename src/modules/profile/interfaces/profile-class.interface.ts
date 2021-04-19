export interface IProfileClass extends Document {
    product: any;
    invoice_number: string;
    add_date: Date;
    expiry_date: Date;
    progress: number;
}