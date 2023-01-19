import { DocumentData, Query, QueryDocumentSnapshot } from 'firebase/firestore';
import { GeoQueryOptions } from './types';

export class GeoQuerySnapshot {
  options:GeoQueryOptions;

  docs: QueryDocumentSnapshot<DocumentData>[];

  queries: Query<DocumentData>[];

  empty:boolean;

  constructor(docs: QueryDocumentSnapshot<DocumentData>[], queries:Query<DocumentData>[], options:GeoQueryOptions) {
    this.docs = docs;
    this.queries = queries;
    this.options = options;
    this.empty = docs.length === 0;
  }
}
