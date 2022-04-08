import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { CompatibilityService } from "../services/compatibility.service";

@Injectable({
  providedIn: 'root'
})
export class StreamerCompatibilityActivator implements CanActivate {
    constructor(private compatibility: CompatibilityService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const skipBrowserCheck = route.queryParams.sbc === '1';
        if (skipBrowserCheck) {
            return true;
        }

        if (!this.compatibility.isSupportedBrowser()) {
            this.router.navigate(['browsernotsupported']);
            return false;
        }

        return true;
    }
}