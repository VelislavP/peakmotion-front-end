import { Component } from '@angular/core';
import { PhotoService } from '../services/photo.service.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
})
export class Tab3Page {
  capturedPhoto: string | null = null;

  constructor(private photoService: PhotoService) {}

  async captureAndUploadPhoto() {
    try {
      // Capture a photo
      const photo = await this.photoService.takePhoto();
      // Construct an image source to display the captured photo
      this.capturedPhoto = 'data:image/jpeg;base64,' + photo.base64String;
      
      // Upload the photo
      this.photoService.uploadPhoto(photo).subscribe(
        response => {
          console.log('Photo uploaded successfully:', response);
        },
        error => {
          console.error('Error uploading photo:', error);
        }
      );
    } catch (error) {
      console.error('Error in captureAndUploadPhoto:', error);
    }
  }
}
