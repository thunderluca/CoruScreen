import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RngService {
  generate(length: number): string {
    let id = '';

    const charSet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    
    for (let i = 0; i < length; i++)
      id += charSet.charAt(Math.floor(Math.random() * charSet.length));
    
    return id;
  };
}
