import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { from, Observable, of, switchMap, map, takeUntil, take, tap } from 'rxjs';
import { Control, GeoJSONOptions, icon, Map, marker, Marker, tileLayer } from 'leaflet';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
interface Position {
  latitude: number;
  longitude: number;
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

  options: PositionOptions = {
    maximumAge: 3000,
    timeout: 10000,
    enableHighAccuracy: true
  }

  coordsControl!: Control;

  constructor(public http: HttpClient, public plt: Platform, public router: Router) { }

  destroyRef = inject(DestroyRef);

  ngAfterViewInit() {
    this.checkPermissions().subscribe((status) => {
      if (status === 'granted') {
        this.getCurrentLocation().pipe(tap(() => {
          this.initMap();
        })).subscribe();
      } else {
        console.warn('Location permission not granted.');
      }
    });
  }

  checkPermissions(): Observable<string> {
    return from(Geolocation.checkPermissions()).pipe(
      tap((status) => {console.log(status)}),
      map((status: PermissionStatus) => status.location),
      switchMap((permission) => {
        if (permission === 'granted') {
          return of(permission);
        } else {
          return this.requestPermission();
        }
      })
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
      div.innerHTML = `<b>Lat:</b> 33.6397 <br> <b>Lng:</b> -84.4304`;
      return div;
    };
    this.coordsControl.addTo(this.map);

    this.startTracking();
  }

  startTracking(): void {
    new Observable<Position>(observer => {
      Geolocation.watchPosition(this.options, (position, err) => {
        if (err) {
          observer.error(err); // Emit error if something goes wrong
        } else if (position) {
          observer.next({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        }
      });
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((position: Position) => {
        this.latitude = position.latitude;
        this.longitude = position.longitude;

        if (position.latitude && position.longitude) {
          const div = this.coordsControl.getContainer();

          if (div) {
            div.innerHTML = `<b>Lat:</b> ${this.latitude.toFixed(5)} <br> <b>Lng:</b> ${this.longitude.toFixed(5)}`;
          }

          this.userMarker.setLatLng([this.latitude, this.longitude]);

          this.map.setView([this.latitude, this.longitude], this.map.getZoom(), { animate: true });
        }
      })
    ).subscribe();
  }

  setCurrentLocation(): void {
    this.getCurrentLocation().subscribe();
  }

  getCurrentLocation(): Observable<any> {
    return from(Geolocation.getCurrentPosition(this.options)).pipe(
      take(1),
      map(position => {
        console.log(position);

        this.latitude = position.coords.latitude,
        this.longitude = position.coords.longitude
      }),
    );
  }
}

