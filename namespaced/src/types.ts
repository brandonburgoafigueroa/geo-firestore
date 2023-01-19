import { GeoPoint } from 'firebase/firestore';
import firebase from "firebase/compat/app";
import {GeoQuerySnapshot} from "./geoQuerySnapshot";

export type GeoQueryOptions = {
    center:GeoPoint, radius:number, property:string
}

export type GeoQueryPoint = {
    geohash:string
    geopoint:GeoPoint
}


export type Query = firebase.firestore.Query<firebase.firestore.DocumentData>
export type DocumentData = firebase.firestore.DocumentData
export type QueryDocumentSnapshot =  firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>
export type Transaction =  firebase.firestore.Transaction
export type GeoTransaction = Transaction & {getGeoQueryDocs:(query:Query)=>Promise<GeoQuerySnapshot>}