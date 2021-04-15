import { IsNotEmpty, IsObject, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GeneralSetingDto {

    // @IsNotEmpty()
    // @IsObject()
    @ApiProperty({
        example: { 
            value: "https://laruno-connect.s3.ap-southeast-1.amazonaws.com/ASSETS/icons/laruno_logo.png",
            note: "40x40",
	    },
        description: 'Logo Image',
        format: 'object'
    })
    logo: {
        value: String,
        note: String,
    };
    
    // @IsNotEmpty()
    // @IsObject()
    @ApiProperty({
        example: { 
            value: "https://laruno2020.s3.ap-southeast-1.amazonaws.com/ASSETS/icons/laruno_logo.png",
            note: "16x16",
	    },
        description: 'Favicon icon',
        format: 'object'
    })
    favicon: {
        value: String,
        note: String,
    };
    
    // @IsNotEmpty()
    // @IsObject()
    @ApiProperty({
        example: { 
            value: "Laruno",
            note: "Mencerdaskan Bangsa",
	    },
        description: 'Site Title',
        format: 'object'
    })
    site_title: {
        value: String,
        note: String
    };
    
    // @IsNotEmpty()
    // @IsObject()
    @ApiProperty({
        example: { 
            value: "Ruko Darwin No. 6 Pagedangan",
            note: "Office Address",
	    },
        description: 'Address',
        format: 'object'
    })
    address: {
        value: String,
        note: String
    };
    
    // @IsNotEmpty()
    // @IsObject()
    @ApiProperty({
        example: { 
            value: "087878500139",
            note: "Customer Service",
	    },
        description: 'Whatsapp Number',
        format: 'object'
    })
    whatsapp: {
        value: String,
        note: String
    };
    
    // kebijakan privasi
    // @IsNotEmpty()
    // @IsArray()
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
    
    // Syarat & Ketentuan
    // @IsNotEmpty()
    // @IsArray()
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
    
    // Pertanyaan Umum
    // @IsNotEmpty()
    // @IsArray()
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

    isActive: Boolean;
}
