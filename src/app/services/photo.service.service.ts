import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  constructor(private http: HttpClient) {}

  // Opens the camera and returns a captured photo
  async takePhoto(): Promise<Photo> {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64, // returns photo as base64 string
        source: CameraSource.Camera,
      });
      return photo;
    } catch (error) {
      console.error('Error capturing photo:', error);
      throw error;
    }
  }

  // Sends the captured photo to your API endpoint
  uploadPhoto(photo: Photo): Observable<any> {
    // Prepare the payload (adjust the key names as required by your API)
    const payload = {
      image: photo.base64String
    };

    // Replace with your actual API endpoint URL
    const apiUrl = 'https://your-api-endpoint.com/upload';

    return this.http.post(apiUrl, payload);
  }
}
