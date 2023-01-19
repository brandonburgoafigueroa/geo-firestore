
import {GeoQueryOptions, Query, QueryDocumentSnapshot } from './types';

export class GeoQuerySnapshot {
  options:GeoQueryOptions;

  docs: QueryDocumentSnapshot[];

  queries: Query[];

  empty:boolean;

  constructor(docs: QueryDocumentSnapshot[], queries:Query[], options:GeoQueryOptions) {
    this.docs = docs;
    this.queries = queries;
    this.options = options;
    this.empty = docs.length === 0;
  }
}
