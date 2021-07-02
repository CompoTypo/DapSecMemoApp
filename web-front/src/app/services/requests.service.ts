import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpParamsOptions } from '@angular/common/http';
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class RequestsService {
  private options: {};

  constructor(private http: HttpClient) {
    this.options = {
      headers: {
        'Content-Type': 'application/json'
      },
      observe: 'response',
      //params?: HttpParams|{[param: string]: string | string[]},
      reportProgress: true,
      //withCredentials?: boolean,
    }
  }

  send(method: string, extension: string, data: {body?: any, token?: string} ) {
    if (data.token) this.options['headers']['Authorization'] = data.token;
    if (data.body) this.options['body'] = data.body;
    console.log(this.options);
    return this.http.request(method, environment.apiurl + extension, this.options);
  }
}
