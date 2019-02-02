import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';


@Injectable()
export class ScreenProvider {
  constructor(public http: HttpClient, private http2: Http) {
  }

  addScreen(formData) {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');

    return new Promise((resolve, reject) => {
      this.http.post(environment.apiUrl + '/screens', formData, { headers: headers })
        .subscribe((response) => {
          resolve(response);
        }, (err) => {
          reject(err);
        });
    });
  }

  deleteScreen(screen, userId) {
    return new Promise((resolve, reject) => {
      this.http.request('delete', environment.apiUrl + '/screens/' + screen.id + '?user_id=' + userId, { body: screen })
        .subscribe((response) => {
          resolve(response);
        }, (err) => {
          reject(err);
        });
    });
  }

  getScreens(projectId) {
    return new Promise((resolve, reject) => {
      this.http.get(environment.apiUrl + '/screens?project_id=' + projectId)
        .subscribe((response) => {
          resolve(response);
        }, (err) => {
          reject(err);
        });
    });
  }

  getScreen(id) {
    return new Promise((resolve, reject) => {
      this.http.get(environment.apiUrl + '/screens/' + id)
        .subscribe((response) => {
          resolve(response);
        }, (err) => {
          reject(err);
        });
    });
  }

  updateScreen(screen, userId) {
    return new Promise((resolve, reject) => {
      this.http.put(environment.apiUrl + '/screens/' + screen.id + '?user_id=' + userId, screen)
        .subscribe((response) => {
          resolve(response);
        }, (err) => {
          reject(err);
        });
    });
  }

  getComponent(id) {
    return new Promise((resolve, reject) => {
      this.http.get(environment.apiUrl + '/components/' + id)
        .subscribe((response) => {
          resolve(response);
        }, (err) => {
          reject(err);
        });
    });
  }

  updateComponent(id, component) {
    return new Promise((resolve, reject) => {
      this.http.put(environment.apiUrl + '/components/' + id, component)
        .subscribe((response) => {
          resolve(response);
        }, (err) => {
          reject(err);
        });
    });
  }

  createComponents(userId, data) {
    return new Promise((resolve, reject) => {
      this.http.post(environment.apiUrl + '/components?user_id=' + userId, data)
        .subscribe((response) => {
          resolve(response);
        }, (err) => {
          reject(err);
        });
    });
  }

  getHistory(id) {
    return new Promise((resolve, reject) => {
      this.http.get(environment.apiUrl + '/screens/' + id + '/history')
        .subscribe((response) => {
          resolve(response);
        }, (err) => {
          reject(err);
        });
    });
  }

  exportScreen(data) {
    let headers = this.initAuthHeader('drawtotype-io', 'drawtotype123');
    let options = new RequestOptions({ headers: headers });

    return new Promise((resolve, reject) => {
      this.http2.post('https://api.github.com/gists', data, options)
        .subscribe((response) => {
          resolve(response.json());
        }, (err) => {
          reject(err);
        });
    });
  }


  initAuthHeader(username, password) {
    let headers = new Headers();
    headers.append("Authorization", "Basic " + btoa(username + ":" + password));
    headers.append("Content-Type", "application/json");
    return headers;
  }

  initTokenHeader(token) {
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + token);
    headers.append("Content-Type", "application/json");
    return headers;
  }

  shortenURL(long_url) {
    let headers = this.initTokenHeader('48aee65873f901f291c973ff4f084ecb62252705');
    let options = new RequestOptions({ headers: headers });

    return new Promise((resolve, reject) => {
      this.http2.post('https://api-ssl.bitly.com/v4/shorten', { long_url }, options)
        .subscribe((response) => {
          resolve(response.json());
        }, (err) => {
          reject(err);
        });
    });
  }
}
