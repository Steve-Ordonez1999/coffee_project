import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { SharedService } from './shared.services';
import { UserService } from './user.service';
import { map, take } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {


    constructor(
        private authSrv: UserService,
        private router: Router,
        private _sharedService: SharedService,
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.authSrv.user$.pipe(
            take(1),
            map((user) => {
                if (user) {
                    sessionStorage.setItem('infoUser', JSON.stringify(user));
                    return true;
                }
                else
                    this.router.navigate(['/login']);
            })
        );
    }
}