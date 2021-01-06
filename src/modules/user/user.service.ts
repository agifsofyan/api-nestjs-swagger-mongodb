import {
    Injectable,
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
    HttpStatus
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as normalize from 'normalize-url';
import * as gravatar from 'gravatar';

import { AuthService } from '../auth/auth.service';
import { IUser } from './interfaces/user.interface';
import { UserRegisterDTO } from './dto/user-register.dto';
import { UserLoginDTO } from './dto/user-login.dto';
import { UserChangePasswordDTO } from './dto/user-change-password.dto';
import { ProfileService } from '../profile/profile.service';
import { IRole } from '../role/interfaces/role.interface';
import { MailService } from '../mail/mail.service';
import { getBeetwenDay } from 'src/utils/helper';

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<IUser>,
        @InjectModel('Role') private readonly roleModel: Model<IRole>,
        private readonly authService: AuthService,
        private readonly profileService: ProfileService,
        private readonly mailService: MailService,
    ) {}

    async create(userRegisterDTO: UserRegisterDTO) {
        const getRole = await this.roleModel.findOne({adminType: "USER"})

        let user = new this.userModel(userRegisterDTO);

        // Check if user email is already exist
        const isEmailExist = await this.userModel.findOne({ email: user.email });
        if (isEmailExist) {
            throw new BadRequestException('The email you\'ve entered is already exist.');
        }

        const avatar = normalize(
            gravatar.url(user.email, {
              s: '200',
              r: 'pg',
              d: 'mm'
            }),
            { forceHttps: true }
        );

        user.role = [getRole ? getRole._id : null]
        
        user.avatar = avatar;
        await user.save();

        //user = user.toObject();
        delete user.role
        delete user.password
        delete user.created_at
        delete user.updated_at

        const data = {
            name: user.name,
            from: "Verification " + process.env.MAIL_FROM,
            to: user.email,
            subject: 'Please confirm your LARUNO account',
            type: 'verification'
        }

        const verification = await this.mailService.createVerify(data)

        return {
            user: user,
            accessToken: await this.authService.createAccessToken(user._id, "USER"),
            verification: verification
        }
    }

    async login(userLoginDTO: UserLoginDTO) {
        const { email } = userLoginDTO;

        let user = await this.userModel.findOne({ email });
        if (!user) {
            throw new NotFoundException('The email you\'ve entered does not exist.');
        }

        // Verify password
        const match = await bcrypt.compare(userLoginDTO.password, user.password);
        if (!match) {
            throw new BadRequestException('The password you\'ve entered is incorrect.');
        }

        user = user.toObject()
        delete user.role
        delete user.password
        delete user.created_at
        delete user.updated_at

        return {
            user,
            accessToken: await this.authService.createAccessToken(user._id, "USER")
        }
    }

    async changePassword(userId: IUser, input: any) {
        const { old_password, password } = input

        const user = await this.userModel.findOne({ _id: userId })

        const verify_password = await bcrypt.compare(old_password, user.password)
        if (!verify_password) {
            throw new BadRequestException('Incorrect old password.')
        }

        const salt = await bcrypt.genSalt(12);
        const new_password = await bcrypt.hash(password, salt)

        try {
            await this.userModel.updateOne({ _id: userId }, { password: new_password })
            return 'ok'
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }

    async whoAmI(user) {
        user = await this.userModel.findOne(user);
	
	delete user.role
        delete user.password
        delete user.created_at
        delete user.updated_at
        delete user.__v
            
        var profile = await this.profileService.getProfile(user)

        if(!profile){ 
            return { user:user }
        }

        return profile
    }

    async verify(confirmation: string, remember: boolean) {
        var field = 'is_confirmed'

        if(remember){
            field = 'is_forget_pass'
        }

        const mailArray = confirmation.split('.')

        const unique = mailArray[(mailArray.length - 1)]

        const trueMail = confirmation.replace(`.${unique}`, '')

        const getUser = await this.userModel.findOne({email: trueMail})

        if(!getUser){
            throw new NotFoundException('user or email not found')
        }

        if(getUser && getUser[field]){
            console.log('getUser-field: ', getUser[field])
            console.log('type-field: ', typeof getUser[field])
            const trueDay = getBeetwenDay(getUser[field], new Date())
            if(trueDay > 3){
                return `${process.env.CLIENT}/expired`
            }
        }
        
        await this.userModel.findOneAndUpdate(
            {email: trueMail},
            {[field]: new Date()}
        )

        var redirect = process.env.CLIENT

        if(remember){
            redirect = `${process.env.CLIENT}/passwordrecovery`
        }

        return redirect
    }

    // sending link to email
    async forgetPassword(email: string) {
        var user = await this.userModel.findOne({email: email})

        if(!user){
            throw new NotFoundException('account not found')
        }

        const data = {
            name: user.name,
            from: "Change password " + process.env.MAIL_FROM,
            to: user.email,
            subject: 'Change password if this is you',
            type: 'forget'
        }

        const result = await this.mailService.createVerify(data)
        
        user.is_forget_pass = new Date()
        user.otp = result["otp"]
        
        user.save()

        return result["mail"]
    }

    async checkOTP(email: string, otp: number) {
        var user = await this.userModel.findOne({email: email, otp: otp})

        if(!user){
            throw new NotFoundException('account not found')
        }

        return 'ok'
    }

    async newPassword(input: any) {
        var user = await this.userModel.findOne({email: input.email, otp: input.otp})

        if(!user){
            throw new NotFoundException('account not found')
        }
        
        user.password = input.password

        user.save()

        return 'ok'
    }
}
