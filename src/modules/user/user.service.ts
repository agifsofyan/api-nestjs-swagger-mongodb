import {
    Injectable,
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
    forwardRef,
    Inject
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as normalize from 'normalize-url';
import * as gravatar from 'gravatar';
import * as mongoose from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { IUser } from './interfaces/user.interface';
import { UserRegisterDTO } from './dto/user-register.dto';
import { UserLoginDTO } from './dto/user-login.dto';
import { ProfileService } from '../profile/profile.service';
import { IRole } from '../role/interfaces/role.interface';
import { MailService } from '../mail/mail.service';
import { getBeetwenDay } from 'src/utils/helper';
import { GeneralSettingsService } from '../general-settings/general-settings.service';
import { CartService } from '../cart/cart.service';
import { OrderService } from '../order/services/order.service';
import { IProfile } from '../profile/interfaces/profile.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<IUser>,
        @InjectModel('Profile') private readonly profileModel: Model<IProfile>,
        @InjectModel('Role') private readonly roleModel: Model<IRole>,
        private readonly authService: AuthService,
        private readonly profileService: ProfileService,
        private readonly generalService: GeneralSettingsService,
        private readonly cartService: CartService,
        private readonly orderService: OrderService,
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

        if(userRegisterDTO.phone_number){
            let mobile:any = {
                phone_number: userRegisterDTO.phone_number.charAt(0) == '0' ? userRegisterDTO.phone_number.substring(1) : userRegisterDTO.phone_number
            }

            await this.profileModel.findOneAndUpdate(
                { user: user._id },
                { $push: { phone_numbers: mobile } },
                { upsert: true, new: true }
            )
        }
        
        user.avatar = avatar;
        await user.save();

        var users = user.toObject();
        delete users.role
        delete users.password
        delete users.created_at
        delete users.updated_at
        delete users.is_confirmed
        delete users.is_forget_pass
        delete users.otp

        // create first order
        const getHomePage = await this.generalService.getAnything('home_page');
        try {
            if(getHomePage["product"]['_id']){
                const bonus = getHomePage["product"]['_id'].toString()
                const cartInput = { product_id: [bonus] }
                await this.cartService.add(user, cartInput)
                const orderInput = { items: [{ product_id: bonus }] }
                await this.orderService.store(user, orderInput)
            }
        } catch (error) {
            console.log(`cannot set order with product on homepage: ${getHomePage["product"]}`)
        }

        const data = {
            name: user.name,
            from: "Verification " + process.env.MAIL_FROM,
            to: user.email,
            subject: 'Please confirm your LARUNO account',
            type: 'verification'
        }

        const verification = await this.mailService.templateGenerate(data)

        return {
            user: users,
            accessToken: await this.authService.createAccessToken(user._id, "USER"),
            verification: verification
        }
    }

    async login(userLoginDTO: UserLoginDTO) {
        const { email } = userLoginDTO;

        let query = await this.userModel.findOne({ email });
        if (!query) {
            throw new NotFoundException('The email you\'ve entered does not exist.');
        }

        // Verify password
        const match = await bcrypt.compare(userLoginDTO.password, query.password);
        if (!match) {
            throw new BadRequestException('The password you\'ve entered is incorrect.');
        }

        var user = query.toObject()
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

    async whoAmI(user: any) {
        const query = await this.userModel.findOne({_id: user._id});

        var users = query.toObject()
        delete users.role
        delete users.password
        delete users.created_at
        delete users.updated_at
        delete users.__v
        
        var profile:any = await this.profileService.getProfile(user)
        if(!profile){ 
            return { user:users }
        }

        // Dummy Gamification
        profile.gamification = {
            _id: '6034e7a5ed1ee1608cfb1d8x',
            rank: 200,
            icon: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/icons/dummy.png',
            level: 'Dummy Level (Legend Start Member)',
            total_class: profile.class && profile.class.length > 0 ? profile.class.length : 0,
            total_content_watched: 23,
            total_point: 211,
        }

        return profile
    }

    async verify(confirmation: string) {
        var field = 'is_confirmed'
        var redirect = process.env.CLIENT

        const mailArray = confirmation.split('.')

        const unique = mailArray[(mailArray.length - 1)]

        const trueMail = confirmation.replace(`.${unique}`, '')

        const getUser = await this.userModel.findOne({email: trueMail})

        if(!getUser){
            throw new NotFoundException('user or email not found')
        }

        if(getUser && getUser[field]){
            // const trueDay = getBeetwenDay(getUser[field], new Date())
            // if(trueDay > 3){
            //     return `${process.env.CLIENT}/expired`
            // }

            console.log('email confirmation is expired')
            redirect = `${redirect}/expired`
        }
        
        await this.userModel.findOneAndUpdate(
            {email: trueMail},
            {[field]: new Date()}
        )

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

        const result = await this.mailService.templateGenerate(data)
        
        user.is_forget_pass = new Date()
        user.otp = result["otp"]
        
        user.save()

        return result["mail"]
    }

    async checkAccount(email: string, otp: string) {
        if(!email && !otp){
            throw new BadRequestException('The query must have at least 1')
        }

        var field = 'email'
        var value = email

        if(otp){
            field = 'otp'
            value = otp
        }

        const query = await this.userModel.findOne({[field]: value})

        if(!query){
            throw new NotFoundException(`${field} based accounts were not found`)
        }

        var user = query.toObject()
        delete user.role
        delete user.password
        delete user.created_at
        delete user.updated_at
        delete user.is_confirmed
        delete user.is_forget_pass

        if(email){
            delete user.otp
        }

        return user
    }

    async checkOTP(otp: string) {
	const query = await this.userModel.findOne({otp: otp})

        if(!query){
            throw new NotFoundException('account not found')
        }

        const trueDay = getBeetwenDay(query.is_forget_pass, new Date())
        if(trueDay > 3){
            throw new BadRequestException('your otp has expired')
        }

        var user = query.toObject()
        delete user.role
        delete user.password
        delete user.created_at
        delete user.updated_at
        delete user.is_confirmed
        delete user.is_forget_pass
        delete user.otp

        return {
            user: user,
            otp: otp
        }
    }

    async newPassword(otp: string, input: any) {
        var user = await this.userModel.findOne({otp: otp})

        if(!user){
            throw new NotFoundException('account not found')
        }
        
        user.password = input.password
        user.otp = null

        user.save()

        return 'ok'
    }
}
