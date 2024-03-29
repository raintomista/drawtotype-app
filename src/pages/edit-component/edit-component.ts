import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpEventType, HttpResponse } from '@angular/common/http';

import { IonicPage, NavController, NavParams, ViewController, LoadingController, Events } from 'ionic-angular';
import { File, FileEntry } from '@ionic-native/file';
import { ImagePicker } from '@ionic-native/image-picker';
import { NativeStorage } from '@ionic-native/native-storage';

import { AlertProvider } from './../../providers/alert/alert';
import { ScreenProvider } from './../../providers/screen/screen';
import { JsonProvider } from '../../providers/json/json';
import { ImageLoader } from 'ionic-image-loader';

@IonicPage()
@Component({
  selector: 'page-edit-component',
  templateUrl: 'edit-component.html',
  providers: [JsonProvider]
})
export class EditComponentPage {
  /* Nav Params */
  componentId: string;
  componentType: string;
  projectId: string;
  screenId: string;
  screenName: string;
  user: any;

  form: FormGroup = null;
  icons: string[] = []
  loading: Boolean = true;
  screens: any [] = [{id: '-', name: 'Select a screen'}];

  imgVisible = true;

  constructor(
    private alertProvider: AlertProvider,
    private events: Events,
    private file: File,
    private fb: FormBuilder,
    private imageLoader: ImageLoader,
    private imagePicker: ImagePicker,
    private jsonProvider: JsonProvider,
    private loadingCtrl: LoadingController,
    private nativeStorage: NativeStorage,
    private navCtrl: NavController,
    private navParams: NavParams,
    private provider: ScreenProvider,
    private viewCtrl: ViewController) {
      this.componentId = this.navParams.get('componentId');
      this.componentType = this.navParams.get('componentType');
      this.projectId = this.navParams.get('projectId');
      this.screenId = this.navParams.get('screenId');
      this.screenName = this.navParams.get('screenName');

      // Instantiate form
      this.form = this.fb.group({
        'order': '',
        'type': '',
        'value': '',
        'target_screen': ''
      });

      this.getComponent(); // Get value of the selected component
      this.getLoggedUser(); // Get logged user
      this.getScreenNames();

      if(this.componentType === 'FAB') {
        this.getIonIcons();
      }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  async getComponent() {
    try {
      const response = await this.provider.getComponent(this.componentId) as any;
      this.form.setValue({
        'order': response.item.order,
        'type': response.item.type,
        'value': response.item.value,
        'target_screen': response.item.target_screen === null ? '-' : response.item.target_screen
      });
      this.loading = false;
    } catch (e) {
      throw new Error(e);
    }
  }

  async getIonIcons() {
    try {
      const response = await this.jsonProvider.getIonIcons() as any;
      let rows = Math.ceil(response.icons.length/6);
      let icons = [];

      for(let i = 0; i < rows; i++) {
        let row = [];
        for(let j = (i*6); j < (i*6)+6; j++) {
          if(typeof response.icons[j] !== 'undefined') {
            row.push(response.icons[j]);
          }
        }
        icons.push(row);
      }

      this.icons = icons;
    } catch (e) {
      throw new Error(e);
    }
  }

  async getLoggedUser() {
    this.user = await this.nativeStorage.getItem('facebook_user');
  }

  async getScreenNames() {
    try {
      const response = await this.provider.getScreenNames(this.projectId) as any;
      this.screens.push(...response.items);
    } catch(e) {
      throw new Error(e);
    }
  }

  replaceImage() {
    let options = {
      maximumImagesCount: 1,
      quality: 100
    }

    this.imagePicker.getPictures(options)
      .then(async (results) => {
        if (results.length > 0) {
          this.resolveImage(results[0]);
        }
      })
      .catch((e) => {
        throw new Error(e);
      });
  }

  selectIcon(icon) {
    this.form.patchValue({
      'value': icon,
    });
  }

  selectScreen(screen) {
    this.form.patchValue({ 'target_screen': screen });
  }

  setLoadingText(text: string) {
    const elem = document.querySelector('div.loading-wrapper div.loading-content');
    if (elem) elem.innerHTML = text;
  }

  async resolveImage(filePath) {
    try {
      const entry = await this.file.resolveLocalFilesystemUrl(filePath);
      (<FileEntry>entry).file((file) => {
        const reader = new FileReader();

        // Executes when the reading operation is completed
        reader.onloadend = () => {
          const blob = new Blob([reader.result], { type: file.type });
          this.uploadImage(blob);
        };
        reader.readAsArrayBuffer(file);
      });
    } catch (e) {
      throw new Error(e);
    }
  }

  async saveChanges() {
    let loading = this.loadingCtrl.create({
      content: 'Saving changes...',
      dismissOnPageChange: true
    });

    loading.present();
    this.dismiss();

    let activityDescription = `Edited ${this.componentType}`;

    switch (this.componentType) {
      case 'HeaderWithMenu':
        activityDescription += ' title and target screen';
        break;
      case 'HeaderWithBack':
        activityDescription += ' title and target screen';
        break;
      case 'Image':
        activityDescription += ' src and target screen';
        break;
      case 'TextInput':
        activityDescription += ' value';
        break;
      case 'PasswordInput':
        activityDescription += ' value';
        break;
      case 'FAB':
        activityDescription += ' icon and target screen';
        break;
      case 'Checkbox':
        activityDescription += ' text';
        break;
      case 'Radio':
        activityDescription += ' text';
        break;
      case 'ListItem':
        activityDescription += ' text';
        break;
      case 'Button':
        activityDescription += ' text and target screen';
        break;
    }

    let formValue = this.form.value;
    if(formValue.target_screen === '-') {
      formValue.target_screen = null;
    }
    try {

      const response = await this.provider.updateComponent(this.componentId, 'edit', {
        activity_description: activityDescription,
        updated_component: this.form.value,
        user_id: this.user.id
      });

      this.events.publish('component_changes');
      this.events.publish('project_changes');

      loading.dismiss()
      this.alertProvider.showAlert('Success', `You have successfully edited ${this.componentType}.`);
    } catch (e) {
      this.alertProvider.showAlert('Error', `Unable to edit ${this.form.get('type').value}. Please try again.`);
      loading.dismiss()
      throw new Error(e);
    }
  }

  async uploadImage(file) {
    let loadingAlert = this.loadingCtrl.create({
      content: `Uploading 0%`
    });

    loadingAlert.present();

    this.provider.uploadImage(file)
      .subscribe((event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.setLoadingText(`Uploading ${Math.round(100 * event.loaded / event.total)}%`);
        } else if (event instanceof HttpResponse) {
          this.imageLoader.clearCache();
          loadingAlert.dismiss();
          this.form.patchValue({ value: event.body.file_url });

          this.imgVisible = false;

          setTimeout(() => {
            this.imgVisible = true;
          }, 200);
        }
      });
  }
}
