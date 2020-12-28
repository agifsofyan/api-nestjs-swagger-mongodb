import { Document } from 'mongoose'

export interface ITemplateVersion extends Document {
     template: string
     engine: string,
     tag: string,
     comment: string,
     active: boolean,
     createdAt: Date
}

export interface ITemplate extends Document {
     name: string // Unique
     description: string
     type: string
     by: any
     versions: ITemplateVersion[]
}
