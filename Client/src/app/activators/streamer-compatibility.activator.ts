import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { CompatibilityService } from "../services/compatibility.service";

@Injectable({
  providedIn: 'root'
})
export class StreamerCompatibilityActivator implements CanActivate {
    constructor(private compatibility: CompatibilityService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const skipBrowserCheck = route.queryParams.sbc === '1';
        if (!skipBrowserCheck) {
            const supportedBrowser = this.compatibility.isSupportedBrowser();
            if (!supportedBrowser) {
                this.router.navigate(['browsernotsupported']);
                return false;
            }
        }

        return true;
    }
}