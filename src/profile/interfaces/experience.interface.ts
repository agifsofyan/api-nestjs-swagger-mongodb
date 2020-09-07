export enum ExperienceType {
    BUSINESS_MAN = 'Businessman',
    FULL_TIME = 'Full-time',
    PART_TIME = 'Part-time',
    SELF_EMPLOYED = 'Self-employed',
    INVESTOR = 'Investor'
}

export interface IExperience {
    readonly title: string;
    readonly type: ExperienceType;
    readonly company: string;
    location: string;
    current: boolean;
    readonly startWorkAt: Date;
    endWorkAt: Date; 
}