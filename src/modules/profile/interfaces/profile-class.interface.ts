export interface IProfileClass extends Document {
    product: string;
    content: string;
    video: string;
    invoice_number: string;
    add_date: Date;
    expiry_date: Date;
}