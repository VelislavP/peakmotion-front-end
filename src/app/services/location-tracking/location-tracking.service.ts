import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class LocationTrackingService {
  private apiUrl = 'https://your-api.com/endpoint'; // Replace with your API URL
  private intervalId: any;

  constructor(private http: HttpClient) {}

  // startTracking() {
  //   this.intervalId = setInterval(() => {
  //     this.sendApiRequest();
  //   }, 60000); // 60000 ms = 1 minute
  // }

  // stopTracking() {
  //   if (this.intervalId) {
  //     clearInterval(this.intervalId);
  //     this.intervalId = null;
  //   }
  // }

  private sendApiRequest() {
    this.http.get(this.apiUrl).subscribe(
      (response) => {
        console.log('API Response:', response);
        this.handleResponse(response);
      },
      (error) => {
        console.error('API Error:', error);
      }
    );
  }

  private handleResponse(response: any) {
    if (response?.triggerNotification) {
      this.sendInAppNotification('Important Update', response.message);
    }
  }

  private sendInAppNotification(title: string, message: string) {
    alert(`${title}: ${message}`); // Replace with a better notification mechanism
  }
}
