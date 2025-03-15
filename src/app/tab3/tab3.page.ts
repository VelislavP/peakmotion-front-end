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
  titleLatin: string = '';
  titleEn: string = '';
  description: string = '';

  constructor(private photoService: PhotoService) {}

  async captureAndUploadPhoto() {
    try {
      this.isUploading = true;

      const photo = await this.photoService.takePhoto();
      this.capturedPhoto = 'data:image/jpeg;base64,' + photo.base64String;

      this.photoService.uploadPhoto(photo).subscribe({
        next: (response) => {
          this.uploadSuccess = true;
          this.uploadResponse = "Your plant photo has been uploaded and identified!";
          this.titleLatin = response.titleLatin || 'Unknown Species';
          this.titleEn = response.titleEn || 'No Name Available';
          this.description = response.description || 'No description found.';
        },
        error: (error) => {
          this.uploadResponse = 'Upload failed! Please try again.';
          this.uploadSuccess = false;
        }
      });
    } catch (error) {
      this.uploadSuccess = false;
      this.uploadResponse = 'Failed to capture photo!';
    } finally {
      this.isUploading = false;
    }
  }

  resetAndCapturePhoto() {
    this.capturedPhoto = null;
    this.uploadResponse = null;
    this.uploadSuccess = false;
    this.titleLatin = '';
    this.titleEn = '';
    this.description = '';

    this.captureAndUploadPhoto();
  }
}
