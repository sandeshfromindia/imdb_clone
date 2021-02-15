import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {ROUTES} from 'app/components/sidebar/sidebar.component';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {Router, ActivatedRoute} from '@angular/router';
import {FormControl, Validators, FormBuilder, FormGroup} from '@angular/forms';
import {AuthService} from 'app/common/auth.service';
import {RestService} from 'app/services/rest.service';
import {Global} from 'app/common/global';
import {Toastr} from 'app/common/toastr';
import {MenusService} from 'app/services/menus.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
    RoleForm: FormGroup;
    roles: any = [];
    defaultRole;
    location: Location;
    mobile_menu_visible: any = 0;
    sidebar_mini_active: any = 0;

    isLoggedIn: boolean;
    userLoggedIn: any;
    private listTitles: any[];
    private toggleButton: any;
    private sidebarVisible: boolean;

    @ViewChild('form') form;

    // tslint:disable-next-line:max-line-length
    constructor(private menus: MenusService, private formBuilder: FormBuilder, location: Location, private rest: RestService, private global: Global, private element: ElementRef, private route: ActivatedRoute, private router: Router, private authService: AuthService, private toastr: Toastr) {
        this.location = location;
        this.sidebarVisible = false;
    }

    ngOnInit() {
        this.RoleForm = this.formBuilder.group({
            RoleId: ['', [Validators.required]]
        });
        this.menus.currentMenus.subscribe(menudata => this.listTitles = menudata)
        const navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];
        this.router.events.subscribe((event) => {
            this.sidebarClose();
            const $layer: any = document.getElementsByClassName('close-layer')[0];
            if ($layer) {
                $layer.remove();
                this.mobile_menu_visible = 0;
            }
        });
        this.isLoggedIn = (Boolean)(localStorage.getItem('isLoggedIn'));
        if (this.isLoggedIn) {
            this.userLoggedIn = JSON.parse(localStorage.getItem('userLoggedIn'));
            this.getUserRoles(this.userLoggedIn.Id);
        }
    }

    sidebarOpen() {
        const toggleButton = this.toggleButton;
        const body = document.getElementsByTagName('body')[0];
        setTimeout(function () {
            toggleButton.classList.add('toggled');
        }, 500);

        body.classList.add('nav-open');

        this.sidebarVisible = true;
    };

    sidebarClose() {
        const body = document.getElementsByTagName('body')[0];
        this.toggleButton.classList.remove('toggled');
        this.sidebarVisible = false;
        body.classList.remove('nav-open');
    };

    sidebarToggle() {
        // const toggleButton = this.toggleButton;
        // const body = document.getElementsByTagName('body')[0];
        const $toggle = document.getElementsByClassName('navbar-toggler')[0];

        if (this.sidebarVisible === false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
        const body = document.getElementsByTagName('body')[0];

        if (this.mobile_menu_visible == 1) {
            // $('html').removeClass('nav-open');
            body.classList.remove('nav-open');
            const $layer: any = document.getElementsByClassName('close-layer')[0];
            if ($layer) {
                $layer.remove();
            }
            setTimeout(function () {
                $toggle.classList.remove('toggled');
            }, 400);

            this.mobile_menu_visible = 0;
        } else {
            setTimeout(function () {
                $toggle.classList.add('toggled');
            }, 430);

            const $layer = document.createElement('div');
            $layer.setAttribute('class', 'close-layer');


            if (body.querySelectorAll('.main-panel')) {
                document.getElementsByClassName('main-panel')[0].appendChild($layer);
            } else if (body.classList.contains('off-canvas-sidebar')) {
                document.getElementsByClassName('wrapper-full-page')[0].appendChild($layer);
            }

            setTimeout(function () {
                $layer.classList.add('visible');
            }, 100);

            $layer.onclick = function () {
                body.classList.remove('nav-open');
                this.mobile_menu_visible = 0;
                $layer.classList.remove('visible');
                setTimeout(function () {
                    $layer.remove();
                    $toggle.classList.remove('toggled');
                }, 400);
            }.bind(this);

            body.classList.add('nav-open');
            this.mobile_menu_visible = 1;
        }
    };

    sidebarMiniToggle() {
        const body = document.getElementsByTagName('body')[0];

        if (this.sidebar_mini_active == 1) {
            body.classList.remove('sidebar-mini');
            this.sidebar_mini_active = 0;
        } else {
            body.classList.add('sidebar-mini');
            this.sidebar_mini_active = 1;
        }
    };

    getTitle() {
        let titlee = this.location.prepareExternalUrl(this.location.path());
        if (titlee.charAt(0) === '#') {
            titlee = titlee.slice(2);
        }

        for (let item = 0; item < this.listTitles.length; item++) {
            if (this.listTitles[item].Path === titlee) {
                return this.listTitles[item].Title;
            }
        }
        return '';
    }

    getUserName() {
        const UserLoggedIn = JSON.parse(localStorage.getItem('userLoggedIn'));
        return UserLoggedIn.EmpName;
    }

    getUserRoles(UserId = '') {
        this.roles = [];
        this.rest.getAll(this.global.getapiendpoint() + 'user/GetUserRolesById/' + UserId).subscribe((data: any) => {
            const UserRoleMap = data.Data;
            UserRoleMap.forEach(UserRole => {
                this.roles.push(UserRole.Role);
            });
            this.defaultRole = this.userLoggedIn.DefaultRoleId;
            this.RoleForm.get('RoleId').setValue(this.defaultRole);
        });
    }

    setDefaultRole(RoleId) {
        const model = {
            UserId: this.userLoggedIn.Id,
            RoleId: RoleId
        }
        this.rest.create(this.global.getapiendpoint() + 'user/UpdateUserDefaulRole', model).subscribe((data: any) => {
            if (data.Success) {
                this.userLoggedIn.DefaultRoleId = RoleId;
                this.rest.getById(this.global.getapiendpoint() + 'menu/GetAllMenuById/', RoleId).subscribe((menudata: any) => {
                    localStorage.setItem('userLoggedIn', JSON.stringify(this.userLoggedIn));
                    localStorage.setItem('menuItems', JSON.stringify(menudata.Data));
                    this.menus.changeMenus(menudata.Data);
                    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => this.router.navigate(['/dashboard']));
                });
            }
        });
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

}
