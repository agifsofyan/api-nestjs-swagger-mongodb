export interface IProfileMobileNumber extends Document {
    country_code: string;
    mobile_number: string;
    isWhatsapp: boolean;
    isDefault: boolean;
    note: string;
}