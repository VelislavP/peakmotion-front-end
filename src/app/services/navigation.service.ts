import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Geolocation } from '@capacitor/geolocation';
import { BehaviorSubject, catchError, combineLatest, distinctUntilChanged, elementAt, from, interval, map, Observable, of, startWith, Subject, switchMap, take, tap, withLatestFrom } from 'rxjs';
import { icon, LatLngTuple, Map, marker, Marker } from 'leaflet';
import { CoordinatesPosition } from '../models/coordinates-position.model';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from './notifications/notifications.service';
import { Storage } from '@capacitor/storage';
import { FactsService } from './facts.service';
import { POI } from '../models/poi.model';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  options: PositionOptions = {
    maximumAge: 3000,
    timeout: 10000,
    enableHighAccuracy: true
  };

  destroyRef = inject(DestroyRef);

  private poiMarkers: Marker[] = [];
  private POI_IDS_KEY = "poiIds";
  private intervalId: any;
  visitedObjects$ = new BehaviorSubject<number>(0);

  position$: Subject<CoordinatesPosition> = new Subject<CoordinatesPosition>();

  constructor(private http: HttpClient, private notificationService: NotificationService, private factsService: FactsService) { }

  startContinuousTracking(map: Map) {
    const MIN_METERS = 100;

    this.position$
      .pipe(
        takeUntilDestroyed(this.destroyRef), // Stops tracking when component is destroyed
        distinctUntilChanged((prev, curr) => {
          if (!prev || !curr) return false;
          return this.calculateDistance(prev, curr) < MIN_METERS; // API call only if movement ≥ 100m
        })
      )
      .subscribe((position) => {
        if (position.latitude && position.longitude) {
          this.loadNaturePOIs(map, position.latitude, position.longitude);
        }
      });
  }

  private calculateDistance(pos1: CoordinatesPosition, pos2: CoordinatesPosition): number {
    if (!pos1.latitude || !pos1.longitude || !pos2.latitude || !pos2.longitude) return Infinity;

    const R = 6371000; // Earth radius in meters
    const lat1 = this.degToRad(pos1.latitude);
    const lon1 = this.degToRad(pos1.longitude);
    const lat2 = this.degToRad(pos2.latitude);
    const lon2 = this.degToRad(pos2.longitude);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  }

  private degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  startTracking(manualOverride: boolean): Observable<CoordinatesPosition> {
    return new Observable<CoordinatesPosition>(observer => {
      Geolocation.watchPosition(this.options, (position, err) => {
        if (err) {
          observer.error(err);
        } else if (position) {
          observer.next({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        }
      });
    }).pipe(tap((position: CoordinatesPosition) => {
      if (!manualOverride) {
        this.position$.next(position);
      }
    }))
  }

  manualTracking(position: CoordinatesPosition): void {
    this.position$.next(position);
  }


  loadNaturePOIs(tileMap: Map, latitude: number, longitude: number): void {
    if (!latitude || !longitude || !tileMap) return;

    this.clearMap(tileMap);

    from(Storage.get({ key: this.POI_IDS_KEY })).pipe(
      map(({ value }) => (value ? JSON.parse(value) : [])), // Parse stored POI IDs
      switchMap((storedPOIIds: any[]) =>
        this.fetchPOIsWithFacts({
          latitude: latitude,
          longitude: longitude
        }).pipe(
          tap((newPOIs) => {
            this.addPOIsToMap(tileMap, newPOIs);
          }),
          map((elements) =>
            elements.filter((element: any) => !storedPOIIds.includes(element.id))
          ),
          tap(async (elements) => {
            if (elements.length > 0) {
              this.visitedObjects$.next(this.visitedObjects$.getValue() + elements.length);

              await Storage.set({ key: 'poiCount', value: this.visitedObjects$.getValue().toString() });

              this.notificationService.sendPOINotification(elements.length);
            }
          }),
          tap((newPOIs) => {
            if (newPOIs.length > 0) {
              Storage.set({
                key: this.POI_IDS_KEY,
                value: JSON.stringify([...new Set([...storedPOIIds, ...newPOIs.map((poi) => poi.id)])]),
              }).then(() => console.log('Storage updated with new POI IDs'));
            }
          })
        )
      ),
      catchError((error) => {
        console.error('Error fetching nature POIs:', error);
        return of([]);
      })
    ).subscribe();
  }

  private fetchPOIs(url: string): Observable<any[]> {
    return of([]);

    // this.http.get<{ elements: any[] }>(url).pipe(
    //   map((response) => response.elements || []),
    //   tap((elementAt) => {
    //     console.log(elementAt);
    //   }),
    //   catchError((error) => {
    //     console.error('Error fetching nature POIs:', error);
    //     return [];
    //   })
    // );
  }

  private fetchPOIsWithFacts(position: CoordinatesPosition): Observable<POI[]> {
    return this.factsService.getPOIS(position).pipe(
      map((response) => response || []),
      catchError((error) => {
        console.error('Error fetching nature POIs:', error);
        return [];
      })
    );
  }

  private async addPOIsToMap(map: Map, newPOIs: any[]): Promise<void> {
    newPOIs.forEach(element => {
        const tag = element.type || 'Unknown';
        const iconUrl = this.getIconForType(tag);

        const poiMarker = marker([element.coordinates[1], element.coordinates[0]], {
            icon: icon({
                iconUrl: iconUrl,
                iconSize: [50, 50],
                iconAnchor: [25, 50],
                popupAnchor: [0, -30],
                className: 'leaflet-icon-shadow',
            }),
        })
        .addTo(map)
        .bindPopup(
            `<b>${element.name}</b><br>
            <b>Type:</b> ${element.type}<br>
            ${element.fact ? '<b>Fact:</b> ' + element.fact : ''}`
        );

        this.poiMarkers.push(poiMarker);
    });
}

  private clearMap(map: Map): void {
    this.poiMarkers.forEach(marker => {
      map.removeLayer(marker);
    });

    this.poiMarkers = [];
  }

  private getIconForType(type: string): string {
    const iconMap: { [key: string]: string } = {
      // 'park': 'assets/icon/park.svg',
      // 'wood': 'assets/icon/tree.svg',
      // 'camp_site': 'assets/icon/camping_icon.svg',
      // 'national_park': 'assets/icon/national_park.svg',
      'alpine_hut': 'assets/icon/hiking.svg',
      'well': 'assets/icon/water.svg',
      'peak': 'assets/icon/peak.svg',
    };

    return iconMap[type] || 'assets/icon/tree.svg';
  }

   async getStoredPOIIds(): Promise<number[]> {
    const { value } = await Storage.get({ key: this.POI_IDS_KEY});
    return value ? JSON.parse(value) : [];
  }

  async storeNewPOIIds(newPOIIds: number[]): Promise<void> {
    if (newPOIIds.length === 0) return;

    const storedPOIIds = await this.getStoredPOIIds();
    const updatedPOIIds = [...new Set([...storedPOIIds, ...newPOIIds])];

    await Storage.set({ key: 'poiIds', value: JSON.stringify(updatedPOIIds) });
  }
}
