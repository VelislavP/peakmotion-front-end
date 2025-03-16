import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { POI } from '../models/poi.model';
import { CoordinatesPosition } from '../models/coordinates-position.model';

@Injectable({
  providedIn: 'root'
})
export class FactsService {
  private apiUrl = 'http://18.199.165.169:8081/monti/features';

  constructor(private httpClient: HttpClient) { }

  getPOIS(position: CoordinatesPosition): Observable<POI[]> {
    if (!position.latitude || !position.longitude) {
      return of([]);
    }

    const params = new HttpParams().append("latitude", position.latitude).append("longitude", position.longitude).append("radius", 1000);

    return this.httpClient.get<POI[]>(this.apiUrl, {
      params
    });
  }
}
