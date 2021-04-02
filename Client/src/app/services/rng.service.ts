import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RngService {
  generate(length: number): string {
    var id = '';

    var charSet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    
    for (var i = 0; i < length; i++){
      id += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
    
    return id;
  };
}
