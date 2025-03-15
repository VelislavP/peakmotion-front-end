import { Component } from '@angular/core';
import { PhotoService } from '../services/photo.service.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false
})
export class Tab3Page {
  capturedPhoto: string | null = null;
  uploadResponse: string | null = null;

  constructor(private photoService: PhotoService) {}

  async captureAndUploadPhoto() {
    try {
      const photo = await this.photoService.takePhoto();
      this.capturedPhoto = 'data:image/jpeg;base64,' + photo.base64String;
      
      this.photoService.uploadPhoto(photo).subscribe(
        response => {
          console.log('Photo uploaded successfully:', response);
          // Store the response message in a property
          this.uploadResponse = response;
        },
        error => {
          console.error('Error uploading photo:', error);
          this.uploadResponse = 'Upload failed!';
        }
      );
    } catch (error) {
      console.error('Error in captureAndUploadPhoto:', error);
    }
  }
}

