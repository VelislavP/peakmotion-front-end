import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Geolocation, PermissionStatus, Position } from '@capacitor/geolocation';
import { catchError, from, map, Observable, switchMap, take, tap } from 'rxjs';
import { Control, icon, Map, marker, Marker, tileLayer } from 'leaflet';
import { CoordinatesPosition } from '../models/coordinates-position.model';

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

  constructor() { }

  startTracking(): Observable<CoordinatesPosition> {
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
    })
  }

  loadNaturePOIs(map: Map, latitude: number, longitude: number): void {
    if (!latitude || !longitude) {
      return;
    }

    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const query = `
      [out:json];
      (
        node["leisure"="park"](around:5000, ${latitude}, ${longitude});
        node["natural"="wood"](around:5000, ${latitude}, ${longitude});
        node["tourism"="camp_site"](around:5000, ${latitude}, ${longitude});
        node["boundary"="national_park"](around:5000, ${latitude}, ${longitude});
        node["route"="hiking"](around:5000, ${latitude}, ${longitude});
        node["natural"="water"](around:5000, ${latitude}, ${longitude});
        node["natural"="peak"](around:5000, ${latitude}, ${longitude});
      );
      out body;
    `;
    const url = `${overpassUrl}?data=${encodeURIComponent(query)}`;

    from(fetch(url)).pipe(
      take(1),
      switchMap(response => from(response.json())),
      switchMap(data => from(data.elements)),
      catchError(error => {
        console.error('Error fetching nature POIs:', error);
        return [];
      })
    )
      .subscribe((element: any) => {
        const tag = element.tags.natural || element.tags.leisure || element.tags.tourism;
        const iconUrl = this.getIconForType(tag); // Get the corresponding icon

        marker([element.lat, element.lon], {
          icon: icon({
            iconUrl: iconUrl,
            iconSize: [50, 50],
            iconAnchor: [25, 50],
            popupAnchor: [0, -30],
            className: 'leaflet-icon-shadow'
          })
        })
          .addTo(map)
          .bindPopup(
            `<b>${element.tags.name || 'Nature Spot'}</b><br>
            <b>Type:</b> ${tag || 'Unknown'}`
          );
      });
  }

  getIconForType(type: string): string {
    const iconMap: { [key: string]: string } = {
      'park': 'assets/icon/park.svg',
      'wood': 'assets/icon/tree.svg',
      'camp_site': 'assets/icon/camping_icon.svg',
      'national_park': 'assets/icon/national_park.svg',
      'hiking': 'assets/icon/hiking.svg',
      'water': 'assets/icon/water.svg',
      'peak': 'assets/icon/peak.svg',
    };

    return iconMap[type] || 'assets/icon/tree.svg'; // Default icon if type is unknown
  }
}
