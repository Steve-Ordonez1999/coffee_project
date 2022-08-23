import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { Observable, of, } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { HTTP_OPTIONS_FORM, SharedService } from './shared.services';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public user$: Observable<User>
  public urlRefresh: string
  public apiToken: string

  constructor(
    private _http: HttpClient,
    private afAuth: AngularFireAuth,
    private share: SharedService,
    private afs: AngularFirestore
  ) {
    this.urlRefresh = environment.firebaseConfig.refreshTokenUrl;
    this.apiToken = environment.firebaseConfig.apiKey;
    this.user$ = this.afAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          return this.afs.doc(`users/${user.uid}`).valueChanges();
        }
        return of(null)
      })
    )
  }

  async resetPasword(email): Promise<void> {
    try {
      return this.afAuth.sendPasswordResetEmail(email)
    } catch (ex) {
      console.log('Error: ', ex);
      this.share.showToastColor('', 'No fue posible enviar correo de recuperación de contraseña, intente mas tarde.', 'd', 's')
    }
  }

  async loginGoogle(): Promise<User> {
    try {
      const { user } = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
      await this.sendVerificationEmail();
      //this.updateUserData(user)
      return user;
    } catch (ex) {
      console.log('Error: ', ex);
    }
  }

  async register(loginObj: any): Promise<User> {
    try {
      const { user } = await this.afAuth.createUserWithEmailAndPassword(loginObj.email, loginObj.password);
      await this.sendVerificationEmail();
      this.updateUserLogin(user);
      return user;
    } catch (ex) {
      console.log('Error: ', ex);
      this.share.showToastColor('', 'No fue posible registrar el usuario, intente mas tarde.', 'd', 's')
    }
  }

  async login(loginObj: any): Promise<User> {

    const { user } = await this.afAuth.signInWithEmailAndPassword(loginObj.email, loginObj.password);
    //this.updateUserLogin(user);
    return user;

  }

  async sendVerificationEmail(): Promise<void> {
    try {
      return (await this.afAuth.currentUser).sendEmailVerification();
    }
    catch (ex) {
      console.log('Error: ', ex);
      this.share.showToastColor('', 'No fue posible enviar correo de verificación, intente mas tarde.', 'd', 's')
    }
  }


  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
      sessionStorage.clear();
    }
    catch (ex) {
      console.log('Error: ', ex);
      this.share.showToastColor('', 'Algo salió mal al cerrar sesión.', 'd', 's')
    }
  }

  public updateUserLogin(user: User) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
    const data = {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      photoURL: user.photoURL
    }

    return userRef.set(data, { merge: true })
  }

  public updateUserData(user: Datos) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
    const data = {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      photoURL: user.photoURL,
      telf: user.telf,
      fechaNacimiento: user.fechaNacimiento,
    }

    sessionStorage.setItem('infoUser', JSON.stringify(data));
    return userRef.set(data, { merge: true })
  }

  onIdTokenRevocation(): Observable<any> {
    const $URL = `${this.urlRefresh}${this.apiToken}`;
    /* let renove = new FormData;
     renove.append('grant_type', 'refresh_token');
     renove.append('refresh_token', (JSON.parse(sessionStorage.getItem('user')).stsTokenManager.refreshToken));*/

    let renove = "grant_type=refresh_token&refresh_token=" + JSON.parse(sessionStorage.getItem('user')).stsTokenManager.refreshToken;

    console.log(renove);

    return this._http.post<any>($URL, renove, HTTP_OPTIONS_FORM);
  }
}

export interface User {
  uid;
  email;
  emailVerified;
  displayName;
  photoURL;
}

export interface Datos {
  uid;
  email;
  emailVerified;
  displayName;
  photoURL;
  telf;
  fechaNacimiento;
}
