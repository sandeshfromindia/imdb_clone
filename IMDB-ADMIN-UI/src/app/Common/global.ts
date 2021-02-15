import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class Global {

    private apiendpoint = 'http://localhost:8000/';

    getapiendpoint() {
        return this.apiendpoint;
    }

    getUIObj(path) {

        // tslint:disable-next-line:prefer-const
        let menudata = JSON.parse(localStorage.getItem('menuItems'));

        for (let item = 0; item < menudata.length; item++) {
            if (menudata[item].Path === path) {
                return menudata[item];
            }
        }

        return null;

    }

}
