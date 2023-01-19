import { GeoPoint } from 'firebase/firestore';

export type GeoQueryOptions = {
    center:GeoPoint, radius:number, property:string
}

export type GeoQueryPoint = {
    geohash:string
    geopoint:GeoPoint
}
