import { IsNotEmpty, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SetPrivacyPoliceDto {    
    // Privacy Police
    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        example: [
            { 
                title: "Penyimpanan dan penghapusan informasi",
                option: [
                    { value: "Laruno akan menyimpan informasi akun Pengguna tetap aktif dan dapat melakukan penghapusan sesuai dengan ketentuan hukum yang berlaku" }
                ],
                note: 'note is optional',
	        },
            { 
                title: "Cookies",
                option: [
                    { value: "Coockies adalah file kecil yang secara otomatis akan mengambil tempat didalam perangkat Pengguna yang menjalankan fungsi dalam menyimpan preferensi maupun konfigurasi Pengguna selama mengunjungi suatu situs" },
                    { value: "Coockie tersebut tidak diperuntukan untuk melakukan akses data lain yang Pengguna milikii di perangkat komputer Pengguna, selain dari yang telah pengguna setujui untuk disampaikan" }
                ],
                note: "note is optional",
	        }
        ],
        description: 'Privacy Police',
        format: 'array of object'
    })
    privacy_policy: [{
        title: String,
        option: [{
            value: String
        }],
        note: { type: String, default: null },
    }];
}

export class SetTermConditionDto {
    // Term Condition
    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        example: [
            { 
                title: "Transaksi Pembelian",
                option: [
                    {
                        value: "Pembeli wajib bertransaksi melalui transaksi yang telahditetapkan oleh Laruno"
                    },
                    {
                        value: "Pembeli yang menggunakan metode pembayaran transfer bank, nilai total akan ditambahkan dengan kode unik untuk mempermudah verifikasi. Jika pembayaran tersebut telah diverifikasi, maka kode unik tersebut akan dikembalikan ke Saldo Refund Pembeli"
                    }
                ],
                note: "note is optional",
            }
        ],
        description: 'Term & Condition',
        format: 'array of object'
    })
    term_condition: [{
        question: String,
        option: [{value: String }],
        note: String
    }];
}

export class SetFaqDto {
    // FAQ
    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        example: [
            { 
                question: "Bagaimana cara saya mengakses profile saya ?",
                answer: "Saat ini profile page masih dapat di akses melalui konten lama kamu yang ada di Personal Feed kamu. Namun, apabila membutuhkan akses lebih cepat, silahkan hubungi customer care kami",
                note: "note is optional",
            },
            { 
                question: "Apakah Laruno ada kelas seminar ?",
                answer: "Iya, Laruno selalu ada kelas-kelas seminar, yang tentunya selalu di update",
                note: "note is optional",
            }
        ],
        description: 'Term & Condition',
        format: 'array of object'
    })
    faq: [{
        question: String,
        answer: String,
        note: String
    }]
}
