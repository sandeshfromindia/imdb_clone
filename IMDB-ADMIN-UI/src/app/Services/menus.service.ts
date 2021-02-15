import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MenusService {

    private menudata: any;
    private menuSource = new BehaviorSubject(this.menudata);
    currentMenus = this.menuSource.asObservable();

    constructor() {
    }

    changeMenus(menudata: any) {
        this.menuSource.next(this.BindMenuVariable(menudata));
    }

    BindMenuVariable(menudata: any) {
        // let menu = [];
        // menudata.forEach(element => {
        //   menu.push({ Title: element.Title, Path: element.Path, Icon: element.Icon, CssClass: element.CssClass, })
        // });
        // return menu;
        return menudata;
    }

}
