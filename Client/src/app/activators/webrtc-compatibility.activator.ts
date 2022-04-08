import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { CompatibilityService } from "../services/compatibility.service";

@Injectable({
  providedIn: 'root'
})
export class WebRTCCompatibilityActivator implements CanActivate {
    constructor(private compatibility: CompatibilityService, private router: Router) {}

    canActivate(): boolean {
        const isWebRTCAvailable = this.compatibility.isWebRTCAvailable();
        if (!isWebRTCAvailable) {
            this.router.navigate(['notsupported']);
        }

        return isWebRTCAvailable;
    }
}