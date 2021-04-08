import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { CompatibilityService } from "../services/compatibility.service";

@Injectable({
  providedIn: 'root'
})
export class ReverseCompatibilityActivator implements CanActivate {
    constructor(private compatibility: CompatibilityService, private router: Router) {}
    
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const isWebRTCAvailable = this.compatibility.isWebRTCAvailable();

        const supportedBrowser = this.compatibility.isSupportedBrowser();
        
        const canActivate = isWebRTCAvailable && supportedBrowser;

        if (canActivate) {
            this.router.navigate(['/']);
        }

        return !canActivate;
    }
}