import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Socket } from 'ng-socket-io';
import { Events, IonicPage, NavController, NavParams, ViewController, LoadingController } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import { HeaderWithMenu } from './../../models/header-with-menu.model';
import { Image } from '../../models/image.model';
import { AlertProvider } from './../../providers/alert/alert';
import { ScreenProvider } from './../../providers/screen/screen';

@IonicPage()
@Component({
  selector: 'page-replace-component',
  templateUrl: 'replace-component.html',
})
export class ReplaceComponentPage {
  /* Nav Params */
  componentId: string;
  componentType: string;
  screenName: string;

  /* Properties */
  alertVisible: boolean = false;
  items: any[] = ['HeaderWithMenu', 'Image'];
  loadingAlert: any = null;
  selected: number = null;
  user: any = null;

  constructor(
    private alertProvider: AlertProvider,
    private events: Events,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private navParams: NavParams,
    private nativeStorage: NativeStorage,
    private provider: ScreenProvider,
    private socket: Socket,
    private viewCtrl: ViewController) {
      this.componentId = this.navParams.get('componentId');
      this.componentType = this.navParams.get('componentType');
      this.screenName = this.navParams.get('screenName');

      // Get logged user
      this.getLoggedUser();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  async getLoggedUser() {
    this.user = await this.nativeStorage.getItem('facebook_user');
  }

  async replace() {
    let updated_component = null;
    let selectedItem = this.items[this.selected];

    // Instantiate replacement component based on the selected item
    switch (selectedItem) {
      case 'HeaderWithMenu':
        updated_component = new HeaderWithMenu();
        break;
      case 'Image':
        updated_component = new Image();
        break;
    }

    // Create loading alert
    let loadingAlert = this.loadingCtrl.create({
      content: 'Saving changes',
    });

    // Display loading
    loadingAlert.present();

    try {
      const response = await this.provider.updateComponent(this.componentId, 'replace', {
        screen_name: this.screenName,
        updated_component: updated_component,
        user_id: this.user.id,
      });
      this.dismiss();
      loadingAlert.dismiss();
      this.alertProvider.showAlert('Success', `You have successfully replaced ${this.componentType} with ${selectedItem}.`);
    } catch (e) {
      this.alertProvider.showAlert('Error', `Unable to replace the selected component. Please try again.`);
      throw new Error(e);
    }
  }

  select(idx) {
    this.selected = idx;
  }

}
