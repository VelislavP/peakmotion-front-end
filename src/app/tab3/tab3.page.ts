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
  uploadSuccess: boolean = false;
  isUploading: boolean = false;

  constructor(private photoService: PhotoService) { }

  async captureAndUploadPhoto() {
    try {
      this.isUploading = true;  // Show loader

      const photo = await this.photoService.takePhoto();
      this.capturedPhoto = 'data:image/jpeg;base64,' + photo.base64String;

      this.photoService.uploadPhoto(photo).subscribe(
        response => {
          console.log('Photo uploaded successfully:', response);
          this.uploadResponse = "Your plant photo has been uploaded and is being analyzed!";
          this.uploadSuccess = true;
        },
        error => {
          console.error('Error uploading photo:', error);
          this.uploadResponse = 'Upload failed! Please try again.';
          this.uploadSuccess = false;
        }
      );
    } catch (error) {
      console.error('Error in captureAndUploadPhoto:', error);
      this.uploadResponse = 'Failed to capture photo!';
      this.uploadSuccess = false;
    } finally {
      this.isUploading = false; // Hide loader
    }
  }
}
