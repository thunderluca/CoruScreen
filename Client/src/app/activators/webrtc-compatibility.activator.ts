import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { CompatibilityService } from "../services/compatibility.service";

@Injectable({
  providedIn: 'root'
})
export class WebRTCCompatibilityActivator implements CanActivate {
    constructor(private compatibility: CompatibilityService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const isWebRTCAvailable = this.compatibility.isWebRTCAvailable();
        if (!isWebRTCAvailable) {
            this.router.navigate(['notsupported']);
        }

        return isWebRTCAvailable;
    }
}