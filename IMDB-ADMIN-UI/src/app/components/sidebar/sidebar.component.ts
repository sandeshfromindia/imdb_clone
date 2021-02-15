import {Component, OnInit} from '@angular/core';
import {MenusService} from 'app/services/menus.service'

declare const $: any;

declare interface RouteInfo {
    Path: string;
    Title: string;
    Icon: string;
    CssClass: string;
}

export const ROUTES: RouteInfo[] = [
    { Path: '/movies', Title: 'Dashboard', Icon: 'dashboard', CssClass: '' },
    { Path: '/user', Title: 'User Master', Icon: 'settings', CssClass: '' },
    // { Path: '/role', Title: 'ROLE Master', Icon: 'settings', CssClass: '' },
];

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

    menuItems: any[];

    constructor(private menus: MenusService) {
    }

    ngOnInit() {
        this.menus.currentMenus.subscribe(MenuData => this.menuItems = MenuData);
        let menudata = JSON.parse(localStorage.getItem('menuItems'));
        this.menus.changeMenus(menudata);
    }

    isMobileMenu() {
        if ($(window).width() > 991) {
            return false;
        }
        return true;
    };

}
