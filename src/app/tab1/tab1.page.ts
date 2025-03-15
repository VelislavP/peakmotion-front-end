import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit, DestroyRef, inject } from '@angular/core';
import { Platform } from '@ionic/angular';
import { from, Observable, of, switchMap, map, takeUntil, take, tap, catchError, BehaviorSubject } from 'rxjs';
import { Control, icon, Map, marker, Marker, tileLayer } from 'leaflet';
import { Geolocation, PermissionStatus, Position } from '@capacitor/geolocation';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationService } from '../services/navigation.service';
import { CoordinatesPosition } from '../models/coordinates-position.model';

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

  manualOverride: boolean = true;
  manualLocation: BehaviorSubject<CoordinatesPosition | null> = new BehaviorSubject<CoordinatesPosition | null>(null);

  constructor(public http: HttpClient, public plt: Platform, private navigationService: NavigationService) { }

  destroyRef = inject(DestroyRef);

  ngAfterViewInit() {
    this.checkPermissions().pipe(
      take(1)
    ).subscribe((status) => {
      if (status === 'granted') {
        this.getCurrentLocation().pipe(
          tap((position: CoordinatesPosition) => {
            this.updatePosition(position);
            this.initMap();
          }),
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

    this.map.on('click', (e: any) => {
      if (this.manualOverride) {
        this.setManualLocation(e.latlng.lat, e.latlng.lng);

      }
    });

    this.startTracking();
    this.navigationService.loadNaturePOIs(this.map, this.latitude, this.longitude);
  }

  setManualLocation(lat: number, lng: number): void {
    this.manualLocation.next({ latitude: lat, longitude: lng });

    if (this.manualOverride) {
      this.updatePosition({ latitude: lat, longitude: lng });

      if (this.map && this.latitude && this.longitude) {
        this.navigationService.loadNaturePOIs(this.map, this.latitude, this.longitude);
      }
    }
  }

  startTracking(): void {
    this.navigationService.startTracking().pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((position: CoordinatesPosition) => {
        this.updatePosition(position);
      })
    ).subscribe();
  }

  setCurrentLocation(): void {
     this.updatePosition({
      latitude: this.latitude,
      longitude: this.longitude
     });

    this.getCurrentLocation().subscribe();
  }

  getCurrentLocation(): Observable<CoordinatesPosition> {
    return from(Geolocation.getCurrentPosition(this.options)).pipe(
      take(1),
      map((position: Position) => {
        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      }),
    );
  }

  private updatePosition(position: CoordinatesPosition): void {
    if (position.latitude && position.longitude) {
      if (this.manualOverride) {
        const manualPos = this.manualLocation.getValue();

        this.latitude = manualPos?.latitude || position.latitude;
        this.longitude = manualPos?.longitude || position.longitude;
      } else {
        this.latitude = position.latitude;
        this.longitude = position.longitude;
      }

      if (!this.latitude || !this.longitude) {
        return;
      }

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
