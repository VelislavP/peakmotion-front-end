import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { from, Observable, of, switchMap, map, takeUntil, take, tap, catchError } from 'rxjs';
import { Control, icon, Map, marker, Marker, tileLayer } from 'leaflet';
import { Geolocation, PermissionStatus, Position } from '@capacitor/geolocation';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface CoordinatesPosition {
  latitude: number | null;
  longitude: number | null;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
  providers: [HttpClient]
})
export class Tab1Page implements AfterViewInit {
  map!: Map;
  userMarker!: Marker;
  latitude: number | null = null;
  longitude: number | null = null;
  coordsControl!: Control;

  options: PositionOptions = {
    maximumAge: 3000,
    timeout: 10000,
    enableHighAccuracy: true
  };

  constructor(public http: HttpClient, public plt: Platform, public router: Router) { }

  destroyRef = inject(DestroyRef);

  ngAfterViewInit() {
    this.checkPermissions().pipe(
      take(1)
    ).subscribe((status) => {
      if (status === 'granted') {
        this.getCurrentLocation().pipe(
          tap(() => {
            this.initMap();
          })
        ).subscribe();
      } else {
        console.warn('Location permission not granted.');
      }
    });
  }

  checkPermissions(): Observable<string> {
    if (!this.plt.is('capacitor')) {
      return of('granted'); // Web does not need explicit permission request
    }

    return from(Geolocation.checkPermissions()).pipe(
      take(1),
      map((status: PermissionStatus) => status.location),
      switchMap((permission) =>
        permission === 'granted' ? of(permission) : this.requestPermission()
      )
    );
  }

  requestPermission(): Observable<string> {
    return from(Geolocation.requestPermissions()).pipe(
      map((status: PermissionStatus) => status.location)
    );
  }

  initMap() {
    if (!this.latitude || !this.longitude) {
      return;
    }

    this.map = new Map('map').setView([this.latitude, this.longitude], 15, { animate: true });

    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.userMarker = marker([this.latitude, this.longitude], {
      icon: icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      })
    }).addTo(this.map);

    // Add a control box to display lat/lng
    this.coordsControl = new Control({ position: 'bottomleft' });

    this.coordsControl.onAdd = () => {
      let div = document.createElement('div');
      div.className = 'leaflet-bar leaflet-control';
      div.style.backgroundColor = 'var(--background)';
      div.style.padding = '5px';
      div.innerHTML = `<b>Lat:</b> ${this.latitude?.toFixed(5)} <br> <b>Lng:</b> ${this.longitude?.toFixed(5)}`;
      return div;
    };
    this.coordsControl.addTo(this.map);

    this.startTracking();
    this.loadNaturePOIs(); // Load nature POIs when map initializes
  }

  startTracking(): void {
    new Observable<CoordinatesPosition>(observer => {
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
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((position: CoordinatesPosition) => {
        this.updatePosition(position);
      })
    ).subscribe();
  }

  loadNaturePOIs(): void {
    if (!this.latitude || !this.longitude) {
      return;
    }

    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const query = `
      [out:json];
      (
        node["leisure"="park"](around:5000, ${this.latitude}, ${this.longitude});
        node["natural"="wood"](around:5000, ${this.latitude}, ${this.longitude});
        node["tourism"="camp_site"](around:5000, ${this.latitude}, ${this.longitude});
        node["boundary"="national_park"](around:5000, ${this.latitude}, ${this.longitude});
        node["route"="hiking"](around:5000, ${this.latitude}, ${this.longitude});
        node["natural"="water"](around:5000, ${this.latitude}, ${this.longitude});
        node["natural"="peak"](around:5000, ${this.latitude}, ${this.longitude});
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
          .addTo(this.map)
          .bindPopup(
            `<b>${element.tags.name || 'Nature Spot'}</b><br>
            <b>Type:</b> ${tag || 'Unknown'}`
          );
      });
  }

  setCurrentLocation(): void {
    this.getCurrentLocation().subscribe();
  }

  getCurrentLocation(): Observable<CoordinatesPosition> {
    this.updatePosition({
      latitude: this.latitude,
      longitude: this.longitude
    });

    return from(Geolocation.getCurrentPosition(this.options)).pipe(
      take(1),
      map((position: Position) => {
        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      }),
      tap((position: CoordinatesPosition) => {
        this.updatePosition(position);
      })
    );
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

  private updatePosition(position: CoordinatesPosition): void {
    if (position.latitude && position.longitude) {
      this.latitude = position.latitude;
      this.longitude = position.longitude;

      if (this.coordsControl) {
        const div = this.coordsControl.getContainer();

        if (div) {
          div.innerHTML = `<b>Lat:</b> ${this.latitude.toFixed(5)} <br> <b>Lng:</b> ${this.longitude.toFixed(5)}`;
        }
      }

      if (this.userMarker) {
        this.userMarker.setLatLng([this.latitude, this.longitude]);
      }

      if (this.map) {
        this.map.setView([this.latitude, this.longitude], this.map.getZoom(), { animate: true });
      }
    }
  }
}
