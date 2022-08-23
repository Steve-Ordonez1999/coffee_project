import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  constructor(
    private router: Router,
    public menuCtrl: MenuController,
    private platform: Platform
  ) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.router.navigate(['/login']).then(r => { });
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.readyLogin();
    }, 4000);
    this.menuCtrl.enable(false);
    this.menuCtrl.swipeGesture(false);
  }

  readyLogin() {
    this.router.navigate(['/login']).then(r => { });
  }

}
