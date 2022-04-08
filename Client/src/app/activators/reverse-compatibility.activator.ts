import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { CompatibilityService } from "../services/compatibility.service";

@Injectable({
  providedIn: 'root'
})
export class ReverseCompatibilityActivator implements CanActivate {
    constructor(private compatibility: CompatibilityService, private router: Router) {}
    
    canActivate(): boolean {
        const canActivate = this.compatibility.isWebRTCAvailable() && this.compatibility.isSupportedBrowser();
        if (canActivate) {
            this.router.navigate(['/']);
        }

        return !canActivate;
    }
}