import { ExperienceType } from '../../utils/enum';

export interface IProfileExperience {
    readonly title: string;
    readonly type: ExperienceType;
    readonly company: string;
    location: string;
    current: boolean;
    readonly startWorkAt: Date;
    endWorkAt: Date; 
}