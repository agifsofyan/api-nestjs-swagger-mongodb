export interface IProfileClass extends Document {
    product_id: string;
    content_id: string;
    invoice_number: string;
    add_date: Date;
    expiry_date: Date;
}