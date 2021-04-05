export interface IProfilePhoneNumber extends Document {
    country_code: string;
    phone_number: string;
    isWhatsapp: boolean;
    isDefault: boolean;
    note: string;
}