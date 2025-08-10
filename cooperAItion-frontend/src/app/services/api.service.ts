import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getModel(players: any, payoffs: any): Observable<any> {
    for (let i = 0; i < payoffs.length; i++) {
        for (let j = 0; j < payoffs[0].length;j++) {
            payoffs[i][j] = Number(payoffs[i][j]);
        }
    }
    return this.http.post(this.apiUrl+"get_model", {"players": players, "payoffs": payoffs});
  }

  getPosts(): Observable<any> {
    this.http.get(this.apiUrl, )
    return this.http.get(this.apiUrl, );
  }

  createPost(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}