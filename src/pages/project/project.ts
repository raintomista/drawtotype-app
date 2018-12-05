import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ActionSheetController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File, FileEntry } from '@ionic-native/file';
import { ScreenProvider } from './../../providers/screen/screen';

@Component({
  selector: 'project-page',
  templateUrl: 'project.html',
})
export class ProjectPage {
  selectedFile: string = null;
  screens = [1, 2, 3, 4, 5, 6];

  constructor(
    private camera: Camera,
    private file: File,
    private provider: ScreenProvider,
    private actionSheetCtrl: ActionSheetController,
    private navCtrl: NavController) {
  }

  addNewScreen() {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Add screen to your project',
      buttons: [
        {
          text: 'Take Photo',
          handler: () => {
            this.takePhoto();
          }
        }, {
          text: 'Choose from Library',
          handler: () => {
            // this.choosePhoto();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    });
    actionSheet.present();
  }

  takePhoto() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      saveToPhotoAlbum: true
    }

    // Launch camera app
    this.camera.getPicture(options).then(async (imagePath) => {
      const filename = imagePath.substr(imagePath.lastIndexOf('/') + 1);
      const filepath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
      await this.copyFileToLocal(filepath, filename); // Store image from cache to local storage
      await this.uploadFile()
    }, (e) => {
      throw new Error(e);
    });
  }

  /* Helper Functions for Image Upload */
  async copyFileToLocal(filepath, filename) {
    try {
      await this.file.copyFile(filepath, filename, this.file.dataDirectory, filename);
      this.selectedFile = filename; //Store the filename of the selected file
    } catch(e) {
      throw new Error(e);
    }
  }

  async uploadFile() {
    const filePath = this.file.dataDirectory + this.selectedFile;

    try {
      // Resolve file from local storage
      const entry = await this.file.resolveLocalFilesystemUrl(filePath);
      (<FileEntry>entry).file((file) => {
        const reader = new FileReader();

        // Executes when the reading operation is completed
        reader.onloadend = () => {
          const blob = new Blob([reader.result], {type: file.type});
          this.sendForm(blob, file.name);
        };
        reader.readAsArrayBuffer(file);
      });
    } catch(e) {
      throw new Error(e);
    }
  }

  async sendForm(file, filename) {
    const formData = new FormData();
    formData.append('file', file, file.name);

    try {
      const response = this.provider.addScreen(formData);
      console.log(response)
    } catch(e) {
      throw new Error(e);
    }
  }


  /* Helper Functions for Templates */
  computeMultiplier(aspectRatio) {
    const ratio = aspectRatio.split(':');
    return parseInt(ratio[0]) / parseInt(ratio[1]);
  }
}
