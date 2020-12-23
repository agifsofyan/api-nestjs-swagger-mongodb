import { Document } from 'mongoose'

export interface ITemplateVersion extends Document {
     engine: string,
     tag: string,
     comment: string,
     active: boolean,
     createdAt: Date
}

export interface ITemplate extends Document {
     template: string
     name: string // Unique
     description: string
     type: string
     by: any
     versions: ITemplateVersion[]
}
