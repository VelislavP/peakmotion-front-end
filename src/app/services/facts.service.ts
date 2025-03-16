import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { POI } from '../models/poi.model';

@Injectable({
  providedIn: 'root'
})
export class FactsService {
  private apiUrl = 'http://18.199.165.169:8081/monti/hello';

  constructor(private httpClient: HttpClient) { }

  getPOIS(): Observable<POI[]> {
    return this.httpClient.get<POI[]>(this.apiUrl);
  }
}
