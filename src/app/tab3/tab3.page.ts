import { Component } from '@angular/core';
import { PhotoService } from '../services/photo.service.service';
import { ModalController } from '@ionic/angular';
import { PhotoModalComponent } from './components/photo-modal/photo-modal.component';

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
  aiProcessing: boolean = false;
  isUploading: boolean = false;
  titleLatin: string = '';
  titleEn: string = '';
  description: string = '';

  constructor(private photoService: PhotoService, private modalController: ModalController) {}

  async captureAndUploadPhoto() {
    try {
      this.isUploading = true;

      const photo = await this.photoService.takePhoto();
      this.capturedPhoto = 'data:image/jpeg;base64,' + photo.base64String;

      this.aiProcessing = true;

      this.photoService.uploadPhoto(photo).subscribe({
        next: async (response) => {
          const parsedResponse = JSON.
          parse(response)
          this.uploadSuccess = true;
          this.aiProcessing = false;
          this.uploadResponse = "Your plant photo has been uploaded and identified!";
          this.titleLatin = parsedResponse.titleLatin || 'Unknown Species';
          this.titleEn = parsedResponse.titleEn || 'No Name Available';
          this.description = parsedResponse.description || 'No description found.';
          await this.presentModal();
        },
        error: (error) => {
          console.log(error)
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

  async presentModal() {
    const modal = await this.modalController.create({
      component: PhotoModalComponent,
      componentProps: {
        titleLatin: this.titleLatin,
        titleEn: this.titleEn,
        capturedPhoto: this.capturedPhoto,
        description: this.description,
        onReset: () => this.resetAndCapturePhoto()
      },
    });
    return await modal.present();
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
