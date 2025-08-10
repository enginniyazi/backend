import { Document, HydratedDocument, PopulatedDoc, Types } from 'mongoose';
import { IUser } from './userTypes.js';
import { ICategory } from './categoryTypes.js';


export interface ILecture extends Document {
    title: string,
    duration: number,
    videoUrl?: string,
    content?: string,
    isFree: boolean,
    order: number
}

export interface ISection extends Document {
    title: string,
    description: string,
    order: number,
    lectures: ILecture[]
}

export interface ICourse extends Document {
    title: string;
    description: string;
    shortDescription?: string;
    instructor: PopulatedDoc<IUser & Document>;
    categories: PopulatedDoc<ICategory & Document>[];
    sections: ISection[];
    price: number;
    originalPrice?: number;
    coverImage: string;
    isPublished: boolean;

    // Yeni business logic alanları
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    language: string;
    totalDuration: number;
    totalLectures: number;
    enrollmentCount: number;
    rating: number;
    reviewCount: number;
    tags: string[];
    requirements: string[];
    learningOutcomes: string[];
    certificateIncluded: boolean;
    isFeatured: boolean;
    discountPercentage: number;
    discountEndDate?: Date;

    // Virtual fields
    discountedPrice: number;
}

export type HydratedCourseDocument = HydratedDocument<ICourse>;