import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { from, Observable, of, switchMap, map } from 'rxjs';
import { Map, tileLayer } from 'leaflet';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
  providers: [HttpClient]
})
export class Tab1Page implements AfterViewInit {
  map!: Map;
  latitude: number | null = null;
  longitude: number | null = null;

  constructor(public http: HttpClient, public plt: Platform, public router: Router) {}

  ngAfterViewInit() {
    if (this.plt.is('capacitor')) {
      this.checkPermissions().subscribe((status) => {
        if (status === 'granted') {
          this.initMap();
        } else {
          console.warn('Location permission not granted.');
        }
      });
    } else {
      console.warn('Geolocation is not implemented on the web. Initializing map without location.');
      this.initMap(); // Init map without location on web
    }
  }

  checkPermissions(): Observable<string> {
    return from(Geolocation.checkPermissions()).pipe(
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
    this.map = new Map('map').setView([33.6396965, -84.4304574], 15);

    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.getCurrentLocation();
  }

  startTracking(): Observable<{ latitude: number; longitude: number }> {
    return new Observable(observer => {
      Geolocation.watchPosition({}, (position, err) => {
        if (err) {
          observer.error(err); // Emit error if something goes wrong
        } else if (position) {
          observer.next({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        }
      });
    });
  }

  getCurrentLocation(): Observable<{ latitude: number; longitude: number }> {
    return from(Geolocation.getCurrentPosition()).pipe(
      map(position => ({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }))
    );
  }
}
