import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private apiUrl = 'http://127.0.0.1:8000/classify';

  constructor(private http: HttpClient) {}

  async takePhoto(): Promise<Photo> {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });
      return photo;
    } catch (error) {
      console.error('Error capturing photo:', error);
      throw error;
    }
  }

  private base64ToBlob(base64: string, contentType = 'image/jpeg', sliceSize = 512): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  }

  uploadPhoto(photo: Photo): Observable<any> {
    const formData = new FormData();
    const blob = this.base64ToBlob(photo.base64String!, 'image/jpeg');
    const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
    formData.append('image', file);

    return this.http.post(this.apiUrl, formData, {
      headers: { 'accept': 'application/json' },
      responseType: 'text'
    });
  }
}
