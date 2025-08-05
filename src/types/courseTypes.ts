import { Document, HydratedDocument, PopulatedDoc, Types } from 'mongoose';
import { IUser } from './userTypes.js';
import { ICategory } from './categoryTypes.js';


export interface ILecture extends Document {
    title: string,
    duration: number,
    videoUrl?: string,
    content?: string
}

export interface ISection extends Document {
    title: string,
    lectures: ILecture[]
}

export interface ICourse extends Document{
    title: string;
    description: string;
    instructor: PopulatedDoc<IUser & Document>;
    categories: PopulatedDoc<ICategory & Document>[];
    sections: ISection[];
    price: number;
    coverImage: string;
    isPublished: boolean;
}

export type HydratedCourseDocument = HydratedDocument<ICourse>;