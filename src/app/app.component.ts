import { Component, ViewChild } from '@angular/core';
import { Platform, Nav } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LoginPage } from './../pages/login/login';
import { HomePage } from './../pages/home/home';
import { ProjectPage } from '../pages/project/project';
import { ReviewComponentsPage } from './../pages/review-components/review-components';
import { ScreenTabsPage } from './../pages/screen-tabs/screen-tabs';
import { Socket } from 'ng-socket-io';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;

  constructor(
    public nativeStorage: NativeStorage,
    public platform: Platform,
    public socket: Socket,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen) {
      this.platform.ready().then(() => {
        this.socket.connect();

        nativeStorage.getItem('facebook_user')
          .then((data) => {
            if(typeof(data) === 'undefined') {
              throw new Error('');
            }

            this.rootPage = HomePage;
            this.splashScreen.hide();
            this.statusBar.styleLightContent();
            this.statusBar.backgroundColorByHexString('#2270e5');
          })
          .catch((e) => {
            this.rootPage = LoginPage;
            this.splashScreen.hide();
            this.statusBar.styleLightContent();
            this.statusBar.backgroundColorByHexString('#2270e5');
          });

      });



    this.platform.pause.subscribe(() => {
      this.socket.disconnect()
    });

    this.platform.resume.subscribe(() => {
      this.socket.connect()
    })
  }
}

