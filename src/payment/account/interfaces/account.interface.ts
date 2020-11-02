import { Document } from 'mongoose';

export interface IPaymentAccount extends Document {
	payment_type: string;
	pa_id: string;
    external_id: string;
	payment_id: string;
	payment_code: string;
	retail_outlet_name: string;
	ewallet_type: string;
	user_id: string;
	expected_amount: number;
	bank_code: string;
	phone_number: string;
	account_name: string;
	account_number: string;
	account_email: string;
	card_cvn: string;
	expiry: Date;
}