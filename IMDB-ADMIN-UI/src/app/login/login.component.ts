import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {RestService} from 'app/services/rest.service';
import {Global} from 'app/common/global';
import {Toastr} from 'app/common/toastr';
import {AuthService} from 'app/common/auth.service';
import {Validators, FormBuilder, FormGroup} from '@angular/forms';
import {ForgotPasswordDialogComponent} from './forgot-password-dialog/forgot-password-dialog.component';
import {MatDialog} from '@angular/material';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    LoginForm: FormGroup;
    hide = true;

    constructor(private formBuilder: FormBuilder, private rest: RestService, private route: ActivatedRoute, private router: Router, private global: Global, private toastr: Toastr, private authService: AuthService, public dialog: MatDialog) {
    }

    ngOnInit() {
        this.LoginForm = this.formBuilder.group({
            UserName: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'), Validators.maxLength(100)]],
            Password: ['']
        });
        this.authService.logout();
        this.LoginForm.markAsUntouched();
    }

    get UserName() {
        return this.LoginForm.get('UserName');
    }

    get Password() {
        return this.LoginForm.get('Password');
    }

    loginUser() {
        const model = {
            email: this.UserName.value,
            password: this.Password.value,
        };
        this.rest.create(this.global.getapiendpoint() + 'employee/signin', model).subscribe((data: any) => {
            console.log(data);
            if (data.token) {
                // this.rest.getById(this.global.getapiendpoint() + 'menu/GetAllMenuById/', data.Data.DefaultRoleId).subscribe((menudata: any) => {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userLoggedIn', JSON.stringify(data.user));
                    localStorage.setItem('menuItems', JSON.stringify([
                        { Path: '/movies', Title: 'Movies', Icon: 'dashboard', CssClass: '' },
                        { Path: '/user', Title: 'User Master', Icon: 'settings', CssClass: '' },
                        // { Path: '/role', Title: 'ROLE Master', Icon: 'settings', CssClass: '' },
                    ]));
                    this.router.navigate(['/movies']);
                // });
            } else {
                this.toastr.showNotification('top', 'right', data.Message, 'danger');
            }
        });
    }

    forgotPassword() {
        const dialogRef = this.dialog.open(ForgotPasswordDialogComponent, {width: '40%'});
    }

}
