import
    firebase
    from 'firebase/compat/app';

import {GeoQueryOptions, GeoQueryPoint} from "./types";
import * as geofire from "geofire-common";

export function getDistanceOfDocument(document: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>, options: GeoQueryOptions) {
    const geoQueryPoint: GeoQueryPoint = document.get(options.property);
    const distanceInKm = geofire.distanceBetween([geoQueryPoint.geopoint.latitude, geoQueryPoint.geopoint.longitude], [options.center.latitude, options.center.longitude]);
    const distanceInM = distanceInKm * 1000;
    return distanceInM;
}