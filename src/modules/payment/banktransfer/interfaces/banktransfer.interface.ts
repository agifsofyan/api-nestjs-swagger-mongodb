import { Document } from 'mongoose';

export interface IBankTransfer extends Document {
    transfer_date: string;
    bank_name: string;
    account_owner_name: string;
    account_number: string;
    destination_bank: string; //enum [BCA | BNI]
    destination_account: string;
    destination_number: string;
    invoice_number: string;
    struct_url: string;
    is_confirmed: boolean;
}
