import { ExperienceType } from 'src/utils/enum';

export interface IProfileExperience {
    readonly title: string;
    readonly type: ExperienceType;
    readonly company: string;
    address?: string;
    current?: boolean;
    readonly startWorkAt: Date;
    endWorkAt?: Date; 
}