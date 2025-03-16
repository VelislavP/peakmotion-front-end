import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-photo-modal',
  templateUrl: './photo-modal.component.html',
  styleUrls: ['./photo-modal.component.scss'],
  standalone: false,
})
export class PhotoModalComponent  implements OnInit {
 titleLatin!: string;
  titleEn!: string;
  capturedPhoto!: string;
  description!: string;
  onReset!: () => void;

  constructor(private modalController: ModalController) {}

  ngOnInit() { }

  dismissModal() {
    this.modalController.dismiss();
  }
}
