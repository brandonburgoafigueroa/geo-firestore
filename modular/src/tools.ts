import {
  DocumentData, endAt, Query, query as fbQuery, QueryDocumentSnapshot, startAt, getDocs, orderBy, onSnapshot, Unsubscribe, runTransaction,
} from 'firebase/firestore';

import * as geofire from 'geofire-common';
import { GeoQueryOptions, GeoQueryPoint } from './types';
import { GeoQuerySnapshot } from './geoQuerySnapshot';

function constructGeoQueries(query: Query, options:GeoQueryOptions): Query[] {
  const bounds = geofire.geohashQueryBounds([options.center.latitude, options.center.longitude], options.radius);
  const queries = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const b of bounds) {
    const newQuery = fbQuery(query, orderBy(`${options.property}.geohash`), startAt(b[0]), endAt(b[1]));
    queries.push(newQuery);
  }
  return queries;
}

export async function getGeoQueryDocs(query: Query, options:GeoQueryOptions):Promise<GeoQuerySnapshot> {
  const queries = constructGeoQueries(query, options);
  const docs: QueryDocumentSnapshot<DocumentData>[] = [];
  await Promise.all(queries.map(async (query) => {
    const documents = await getDocs(query);
    documents.docs.forEach((document) => {
      const geoQueryPoint:GeoQueryPoint = document.get(options.property);
      const distanceInKm = geofire.distanceBetween([geoQueryPoint.geopoint.latitude, geoQueryPoint.geopoint.longitude], [options.center.latitude, options.center.longitude]);
      const distanceInM = distanceInKm * 1000;
      if (distanceInM <= options.radius) {
        docs.push(document);
      }
    });
  }));

  return new GeoQuerySnapshot(docs, queries, options);
}

export function onGeoQuerySnapshot(query: Query, options:GeoQueryOptions, onNext:(snapshot: GeoQuerySnapshot)=>void) {
  const queries = constructGeoQueries(query, options);
  const docs: Record<string, QueryDocumentSnapshot<DocumentData>> = {};
  const subscriptions: Unsubscribe[] = [];
  const queriesExecuted:Record<string, boolean> = {};

  const verifyIfCanNotifyChanges = () => {
    if (Object.keys(queriesExecuted).length === queries.length) {
      onNext(new GeoQuerySnapshot(Object.values(docs), queries, options));
    }
  };

  queries.forEach((query, queryIndex) => {
    subscriptions.push(onSnapshot(query, (snapshot) => {
      snapshot.docs.forEach((document) => {
        const geoQueryPoint:GeoQueryPoint = document.get(options.property);
        const distanceInKm = geofire.distanceBetween([geoQueryPoint.geopoint.latitude, geoQueryPoint.geopoint.longitude], [options.center.latitude, options.center.longitude]);
        const distanceInM = distanceInKm * 1000;
        if (distanceInM <= options.radius) {
          docs[document.id] = document;
        }
      });
      queriesExecuted[queryIndex] = true;
      verifyIfCanNotifyChanges();
    }));
  });

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}