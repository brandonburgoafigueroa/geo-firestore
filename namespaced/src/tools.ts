import * as geofire from 'geofire-common';
import {GeoQueryOptions, GeoTransaction, Query, QueryDocumentSnapshot, Transaction} from './types';
import { GeoQuerySnapshot } from './geoQuerySnapshot';
import {getDistanceOfDocument} from "./utils";
import firebase from "firebase/compat/app"

function constructGeoQueries(query: Query, options:GeoQueryOptions): Query[] {
  const bounds = geofire.geohashQueryBounds([options.center.latitude, options.center.longitude], options.radius);
  const queries = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const b of bounds) {
    const newQuery = query
        .orderBy('geohash')
        .startAt(b[0])
        .endAt(b[1]);
    queries.push(newQuery);
  }
  return queries;
}

export async function getGeoQueryDocs(query: Query, options:GeoQueryOptions):Promise<GeoQuerySnapshot> {
  const queries = constructGeoQueries(query, options);
  const docs: QueryDocumentSnapshot[] = [];
  await Promise.all(queries.map(async (query) => {
    const documents = await query.get();
    documents.docs.forEach((document) => {
      const distanceInM = getDistanceOfDocument(document, options);
      if (distanceInM <= options.radius) {
        docs.push(document);
      }
    });
  }));

  return new GeoQuerySnapshot(docs, queries, options);
}

export function onGeoQuerySnapshot(query: Query, options:GeoQueryOptions, onNext:(snapshot: GeoQuerySnapshot)=>void) {
  const queries = constructGeoQueries(query, options);
  const docs: Record<string, QueryDocumentSnapshot> = {};
  const subscriptions: (()=>void)[] = [];
  const queriesExecuted:Record<string, boolean> = {};

  const verifyIfCanNotifyChanges = () => {
    if (Object.keys(queriesExecuted).length === queries.length) {
      onNext(new GeoQuerySnapshot(Object.values(docs), queries, options));
    }
  };

  queries.forEach((query, queryIndex) => {
    subscriptions.push(query.onSnapshot(snapshot => {
      snapshot.docs.forEach((document) => {
        const distanceInM = getDistanceOfDocument(document, options);
        if (distanceInM <= options.radius) {
          docs[document.id] = document;
        }
      });
      queriesExecuted[queryIndex] = true;
      verifyIfCanNotifyChanges();
    }))
  });

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}

export async function runGeoQueryTransaction(updateFunction:(transaction:GeoTransaction)=>void): Promise<void> {
  return firebase.firestore().runTransaction(async transaction => {
    const geoTransaction:GeoTransaction = transaction
    geoTransaction.getGeoQueryDocs = async (query: Query)=>{
      const data = await transaction.get(firebase.firestore().collection(""))
      return new GeoQuerySnapshot([], [], {})
    }
    return updateFunction(geoTransaction)
  })
}

firebase.firestore().runTransaction(async transaction => {
  const query = firebase.firestore().collection("asdasd").where("1", "==", "1")
  const data = await transaction.get(query)
})

runGeoQueryTransaction(async transaction => {
  const data = await transaction.getGeoQueryDocs(firebase.firestore().collection(""))

})
