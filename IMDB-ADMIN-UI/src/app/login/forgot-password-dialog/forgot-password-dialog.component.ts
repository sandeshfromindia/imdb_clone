import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {RestService} from 'app/services/rest.service';
import {Toastr} from 'app/common/toastr';
import {Global} from 'app/common/global';

@Component({
    selector: 'app-forgot-password-dialog',
    templateUrl: './forgot-password-dialog.component.html',
    styleUrls: ['./forgot-password-dialog.component.scss']
})
export class ForgotPasswordDialogComponent implements OnInit {

    ForgotPasswordForm: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<ForgotPasswordDialogComponent>,
        private rest: RestService, private global: Global, private toastr: Toastr) {
    }

    ngOnInit() {
        this.ForgotPasswordForm = this.formBuilder.group({
            EmailId: ['', [Validators.email, Validators.maxLength(100)]],
            LoginId: ['', [Validators.pattern('[a-zA-Z0-9_]*'), Validators.maxLength(100)]],
        });
        this.ForgotPasswordForm.markAsUntouched();
    }

    get EmailId() {
        return this.ForgotPasswordForm.get('EmailId');
    }

    get LoginId() {
        return this.ForgotPasswordForm.get('LoginId');
    }

    generateNewPassword() {
        if (this.EmailId.value != '' || this.LoginId.value != '') {
            const model = {
                EmailId: this.EmailId.value,
                LoginId: this.LoginId.value,
            };
            this.rest.create(this.global.getapiendpoint() + 'password/CheckUserExist', model).subscribe((data: any) => {
                if (data.Success) {
                    this.toastr.showNotification('top', 'right', data.Message, 'success');
                } else {
                    this.toastr.showNotification('top', 'right', data.Message, 'danger');
                }
            });
        } else {
            this.toastr.showNotification('top', 'right', 'Please enter Email Id / Login Id', 'danger');
        }
    }

    closeDialog() {
        this.dialogRef.close();
    }

}
